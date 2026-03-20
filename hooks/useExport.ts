import { useState, useRef, useCallback } from 'react';
import Konva from 'konva';
import { Layer, LayerType, ImageLayer, Page, EditorState, ExportConfig } from '../types';

const DEFAULT_VIDEO_DURATION_SEC = 8;

interface UseExportProps {
    stageRef: React.RefObject<Konva.Stage>;
    activePage: Page;
    projectName: string;
    selectedLayerId: string | null;
    selectedLayerIds: string[];
    selectedKeyframe: { layerId: string, time: number } | null;
    setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
    updateActivePage: (updates: Partial<Page>) => void;
    setStatusText: (text: string) => void;
    setExportProgress: (progress: number) => void;
}

export const useExport = ({
    stageRef,
    activePage,
    projectName,
    selectedLayerId,
    selectedLayerIds,
    selectedKeyframe,
    setEditorState,
    updateActivePage,
    setStatusText,
    setExportProgress
}: UseExportProps) => {
    const [isExporting, setIsExporting] = useState(false);
    const [downloadReadyUrl, setDownloadReadyUrl] = useState<string | null>(null);
    const [downloadReadyFilename, setDownloadReadyFilename] = useState<string | null>(null);

    const prepareExportAudio = useCallback(async (videoLayers: ImageLayer[], exportDurationMs: number) => {
        if (videoLayers.length === 0) {
            return null;
        }

        const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextCtor) {
            console.warn('AudioContext is not available; exporting without audio.');
            return null;
        }

        const audioContext = new AudioContextCtor();
        const destination = audioContext.createMediaStreamDestination();
        const exportVideos: HTMLVideoElement[] = [];

        const loadVideo = (layer: ImageLayer) => new Promise<HTMLVideoElement>((resolve, reject) => {
            const video = document.createElement('video');
            const sourceSrc = layer.src;
            const isBlobOrData = sourceSrc.startsWith('blob:') || sourceSrc.startsWith('data:');

            if (!isBlobOrData) {
                video.crossOrigin = 'anonymous';
            }

            video.src = isBlobOrData
                ? sourceSrc
                : `${sourceSrc}${sourceSrc.includes('?') ? '&' : '?'}t=${Date.now()}`;
            video.preload = 'auto';
            video.playsInline = true;
            video.loop = layer.loop ?? true;
            video.muted = false;

            const handleLoaded = () => {
                video.currentTime = layer.currentTime ?? 0;
                resolve(video);
            };

            video.addEventListener('loadeddata', handleLoaded, { once: true });
            video.onerror = () => reject(new Error(`Failed to load video audio for export: ${layer.name}`));
            video.load();
        });

        try {
            const loadedVideos = await Promise.all(videoLayers.map(loadVideo));

            loadedVideos.forEach((video, index) => {
                const layer = videoLayers[index];
                const layerVolume = layer.volume ?? 1;
                const fadeInSec = (layer.audioFadeInMs ?? 0) / 1000;
                const fadeOutSec = (layer.audioFadeOutMs ?? 0) / 1000;
                const exportDurationSec = exportDurationMs / 1000;
                const sourceNode = audioContext.createMediaElementSource(video);
                const gainNode = audioContext.createGain();
                gainNode.gain.value = 0;
                sourceNode.connect(gainNode);
                gainNode.connect(destination);

                const gain = gainNode.gain;
                const now = audioContext.currentTime;
                const fadeInEnd = now + (fadeInSec || 0.01);
                const fadeOutStart = now + Math.max(fadeInSec || 0, exportDurationSec - fadeOutSec);
                const exportEnd = now + exportDurationSec;

                gain.cancelScheduledValues(now);
                if (fadeInSec > 0) {
                    gain.setValueAtTime(0, now);
                    gain.linearRampToValueAtTime(layerVolume, fadeInEnd);
                } else {
                    gain.setValueAtTime(layerVolume, now);
                }

                gain.setValueAtTime(layerVolume, Math.max(fadeInEnd, now));

                if (fadeOutSec > 0) {
                    gain.setValueAtTime(layerVolume, Math.max(fadeInEnd, fadeOutStart));
                    gain.linearRampToValueAtTime(0, exportEnd);
                }

                exportVideos.push(video);
            });

            await audioContext.resume();

            return {
                stream: destination.stream,
                async play() {
                    await Promise.all(exportVideos.map((video) => video.play().catch((error) => {
                        console.warn('Export audio playback failed:', error);
                    })));
                },
                async cleanup() {
                    exportVideos.forEach((video) => {
                        video.pause();
                        video.src = '';
                        video.load();
                    });

                    if (audioContext.state !== 'closed') {
                        await audioContext.close();
                    }
                }
            };
        } catch (error) {
            console.error('Failed to prepare export audio:', error);
            if (audioContext.state !== 'closed') {
                await audioContext.close();
            }
            return null;
        }
    }, []);

    // Helper to get file handle (Chrome/Edge/Opera positive)
    const getSaveFileHandle = async (suggestedName: string, types: { description: string, accept: Record<string, string[]> }[]) => {
        if ('showSaveFilePicker' in window) {
            try {
                // @ts-ignore - File System Access API
                return await window.showSaveFilePicker({
                    suggestedName,
                    types,
                });
            } catch (e) {
                if ((e as Error).name !== 'AbortError') {
                    console.error('SaveFilePicker error:', e);
                }
                return null; // User cancelled or error
            }
        }
        return null; // Not supported
    };

    // Recursive helpers for video detection
    const checkForVideo = (layers: Layer[]): boolean => {
        return layers.some(l => {
            if (l.type === LayerType.IMAGE && (l as ImageLayer).mediaType === 'video') return true;
            if (l.type === LayerType.GROUP && (l as any).children) return checkForVideo((l as any).children);
            return false;
        });
    };

    const getVideoLayers = (layers: Layer[]): ImageLayer[] => {
        let videos: ImageLayer[] = [];
        layers.forEach(l => {
            if (l.type === LayerType.IMAGE && (l as ImageLayer).mediaType === 'video') {
                videos.push(l as ImageLayer);
            } else if (l.type === LayerType.GROUP && (l as any).children) {
                videos = [...videos, ...getVideoLayers((l as any).children)];
            }
        });
        return videos;
    };

    const updateVideoState = (layers: Layer[], playing: boolean, resetTime: boolean = false): Layer[] => {
        return layers.map(l => {
            if (l.type === LayerType.IMAGE && (l as ImageLayer).mediaType === 'video') {
                return {
                    ...l,
                    playing: playing,
                    currentTime: resetTime ? 0 : (l as ImageLayer).currentTime
                };
            } else if (l.type === LayerType.GROUP && (l as any).children) {
                return {
                    ...l,
                    children: updateVideoState((l as any).children, playing, resetTime)
                };
            }
            return l;
        });
    };

    const executeExport = async (config: ExportConfig) => {
        if (!stageRef.current) {
            alert("Internal Error: Stage reference is missing. Please reload the page.");
            return;
        }

        const previousSelection = {
            selectedLayerId,
            selectedLayerIds,
            selectedKeyframe
        };

        try {
            setIsExporting(true);
            setExportProgress(0);
            setStatusText("Initializing Export...");

            setEditorState(prev => ({
                ...prev,
                selectedLayerId: null,
                selectedLayerIds: [],
                selectedKeyframe: null
            }));

            // Allow React to re-render
            await new Promise(resolve => setTimeout(resolve, 100));

            const stage = stageRef.current;
            // --- Determine Filename & Extension Early ---
            // FIX: Use the actual project name, allowing spaces and mixed case.
            // Only replace truly unsafe filesystem characters like slashes, colons, etc.
            // We NO LONGER force lowercase-kebab-case, as the user requested "Untitled Design.mp4" format.
            const baseFilename = (projectName || 'Untitled Design').replace(/[/\\?%*:|"<>]/g, '_');

            let fileHandle: any = null; // Store handle for later use

            // --- PNG Export ---
            if (config.format === 'png') {
                const finalFilename = `${baseFilename}.png`;
                // Try to get handle immediately (user gesture context)
                fileHandle = await getSaveFileHandle(finalFilename, [{
                    description: 'PNG Image',
                    accept: { 'image/png': ['.png'] }
                }]);

                const pixelRatio = config.targetWidth / activePage.width;

                // Convert to Blob (More robust than DataURL)
                stage.toBlob({
                    pixelRatio,
                    mimeType: 'image/png',
                    async callback(blob) {
                        if (!blob) {
                            alert("Error: Failed to generate image blob.");
                            setIsExporting(false);
                            return;
                        }

                        if (fileHandle) {
                            // WRITE TO HANDLE (File System Access API)
                            // This is the primary success path for Chrome.
                            // It bypasses the 'download' attribute restrictions by writing directly to a user-chosen file.
                            try {
                                const writable = await fileHandle.createWritable();
                                await writable.write(blob);
                                await writable.close();
                                console.log('✅ PNG saved via File System Access API');
                                setIsExporting(false);
                                return;
                            } catch (err) {
                                console.error('Failed to write to file handle:', err);
                                // Fallback to anchor tag if writing fails
                            }
                        }

                        // ... Fallback ... (existing code below)
                        const finalFilename = `${baseFilename}.png`;
                        // Create a File object to help Chrome with valid filename metadata
                        const file = new File([blob], finalFilename, { type: 'image/png' });
                        const url = URL.createObjectURL(file);

                        const link = document.createElement('a');
                        link.style.display = 'none';
                        link.download = finalFilename;
                        link.href = url;
                        // Explicitly adhere to DOM requirements
                        document.body.appendChild(link);

                        // Dispatch click event for better browser compatibility
                        link.dispatchEvent(new MouseEvent('click', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        }));

                        // Long timeout to ensure successful handover to download manager
                        setTimeout(() => {
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                        }, 60000);

                        setIsExporting(false);
                        console.log('✅ PNG export complete');
                    }
                });
                return;
            }

            // --- PDF Export ---
            if (config.format === 'pdf') {
                const { jsPDF } = await import('jspdf');
                const pixelRatio = 2;

                // Use toBlob for PDF image source to avoid DataURL limits
                stage.toBlob({
                    pixelRatio,
                    mimeType: 'image/png',
                    callback: (blob) => {
                        if (!blob) {
                            alert("Error: Failed to generate PDF image source.");
                            setIsExporting(false);
                            return;
                        }

                        const imgUrl = URL.createObjectURL(blob);
                        const pdf = new jsPDF({
                            orientation: activePage.width > activePage.height ? 'landscape' : 'portrait',
                            unit: 'px',
                            format: [activePage.width, activePage.height]
                        });

                        pdf.addImage(imgUrl, 'PNG', 0, 0, activePage.width, activePage.height);
                        const pdfBlob = pdf.output('blob');
                        const finalFilename = `${baseFilename}.pdf`;
                        const pdfFile = new File([pdfBlob], finalFilename, { type: 'application/pdf' });
                        const finalPdfUrl = URL.createObjectURL(pdfFile);

                        setDownloadReadyUrl(finalPdfUrl);
                        setDownloadReadyFilename(`${baseFilename}.pdf`);
                        setStatusText("Your PDF is Ready!");
                        setIsExporting(false);

                        // Auto-download for PDF as well to be consistent
                        const link = document.createElement('a');
                        link.style.display = 'none';
                        link.download = `${baseFilename}.pdf`;
                        link.href = finalPdfUrl;
                        document.body.appendChild(link);

                        link.dispatchEvent(new MouseEvent('click', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        }));

                        setTimeout(() => {
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(imgUrl);
                            // window.URL.revokeObjectURL(finalPdfUrl); // Keep valid for the "Download" button if needed
                        }, 60000);
                        // window.URL.revokeObjectURL(finalPdfUrl); // Keep valid for the "Download" button if needed
                    }
                });
                return;
            }

            // --- Video Export ---
            console.log('📹 Starting video export...');
            setStatusText("Synchronizing Frames...");

            // Reset videos
            const seekLayers = updateVideoState(activePage.layers, false, true);
            updateActivePage({ layers: seekLayers });

            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('✅ Videos synchronized');

            const canvas = stage.container().querySelector('canvas');
            if (!canvas) throw new Error("Canvas missing");

            // Capture stream
            const stream = canvas.captureStream(30);
            const exportAudio = await prepareExportAudio(videoLayers, config.duration);
            exportAudio?.stream.getAudioTracks().forEach((track) => stream.addTrack(track));

            // Vadeo exports should stay MP4-first for compatibility with the user's workflow.
            if (!MediaRecorder.isTypeSupported('video/mp4')) {
                throw new Error('MP4 export is not supported in this browser session.');
            }

            const mimeType = 'video/mp4';
            const ext = 'mp4';
            const finalFilename = `${baseFilename}.${ext}`;

            // Get handle BEFORE starting recording (user gesture required)
            // FIX: We must request the file handle immediately to ensure we are in a "user gesture" context.
            // This pops up the "Save As" dialog in Chrome, avoiding the random filename issue completely.
            fileHandle = await getSaveFileHandle(finalFilename, [{
                description: 'Video File',
                accept: { [mimeType.split(';')[0]]: [`.${ext}`] }
            }]);

            console.log('📹 Using MIME type:', mimeType);

            const recorder = new MediaRecorder(stream, {
                mimeType,
                videoBitsPerSecond: config.targetWidth > 2000 ? 25000000 : 8000000
            });

            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = async () => {
                console.log('🛑 Recorder stopped, chunks:', chunks.length);
                await exportAudio?.cleanup();
                setEditorState(prev => ({
                    ...prev,
                    selectedLayerId: previousSelection.selectedLayerId,
                    selectedLayerIds: previousSelection.selectedLayerIds,
                    selectedKeyframe: previousSelection.selectedKeyframe
                }));
                if (chunks.length === 0) {
                    alert("Video generation failed: No data recorded. Please try again.");
                    setIsExporting(false);
                    return;
                }

                // Concatenate chunks
                const blob = new Blob(chunks, { type: mimeType });

                if (fileHandle) {
                    try {
                        const writable = await fileHandle.createWritable();
                        await writable.write(blob);
                        await writable.close();
                        console.log('✅ Video saved via File System Access API');
                        setIsExporting(false);
                        setStatusText("");
                        return;
                    } catch (err) {
                        console.error('Failed to write video to file handle:', err);
                        // Fallback
                    }
                }

                // Force extension logic
                // const ext = mimeType.includes('mp4') ? 'mp4' : 'webm'; // Already calculated above
                // const finalFilename = `${baseFilename}.${ext}`; // Already calculated above

                // Create robust File object
                const file = new File([blob], finalFilename, { type: mimeType });
                const url = URL.createObjectURL(file);

                console.log('📝 Generating video file (fallback):', finalFilename);

                // Auto-download
                const link = document.createElement('a');
                link.style.display = 'none';
                link.download = finalFilename;
                link.href = url;
                document.body.appendChild(link);

                link.dispatchEvent(new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                }));

                // Allow extensive time before revoking
                setTimeout(() => {
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                }, 60000);

                setIsExporting(false);
                setStatusText("");
            };

            setStatusText("Recording Scene...");
            // CRITICAL: use timeslice to prevent chunk loss
            recorder.start(100);

            // Play videos
            const playLayers = updateVideoState(activePage.layers, true, false);
            updateActivePage({ layers: playLayers });
            await exportAudio?.play();

            // Redraw Loop for Chrome
            let isRecording = true;
            const duration = config.duration;
            let elapsed = 0;

            const forceRedraw = () => {
                if (!isRecording) return;
                const layers = stage.children;
                if (layers) {
                    layers.forEach((layer: any) => layer.draw());
                } else {
                    stage.draw();
                }
                requestAnimationFrame(forceRedraw);
            };

            requestAnimationFrame(forceRedraw);

            const timer = setInterval(() => {
                elapsed += 100;
                setExportProgress(Math.min(100, (elapsed / duration) * 100));
                if (elapsed >= duration) {
                    clearInterval(timer);
                    isRecording = false;
                    if (recorder.state === 'recording') {
                        recorder.stop();
                    }
                }
            }, 100);

        } catch (err: any) {
            console.error('❌ Export failed:', err);
            setEditorState(prev => ({
                ...prev,
                selectedLayerId: previousSelection.selectedLayerId,
                selectedLayerIds: previousSelection.selectedLayerIds,
                selectedKeyframe: previousSelection.selectedKeyframe
            }));
            setIsExporting(false);
            alert(`Export failed: ${err.message || err.toString()}`);
        }
    };

    const hasVideo = checkForVideo(activePage.layers);
    const videoLayers = getVideoLayers(activePage.layers);
    const maxVideoDuration = videoLayers.length > 0 ? Math.max(...videoLayers.map(l => l.duration || DEFAULT_VIDEO_DURATION_SEC)) : DEFAULT_VIDEO_DURATION_SEC;

    return {
        isExporting,
        executeExport,
        hasVideo,
        maxVideoDuration,
        downloadReadyUrl,
        downloadReadyFilename,
        setDownloadReadyUrl // exported to allow clearing
    };
};
