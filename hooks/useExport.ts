import { useState, useRef, useCallback } from 'react';
import Konva from 'konva';
import { Layer, LayerType, ImageLayer, Page, EditorState, ExportConfig, TextLayer, ShapeLayer } from '../types';

const DEFAULT_VIDEO_DURATION_SEC = 8;

interface UseExportProps {
    stageRef: React.RefObject<Konva.Stage>;
    activePage: Page;
    projectName: string;
    playheadTime: number;
    isPlaying: boolean;
    onExportComplete?: (config: ExportConfig) => void;
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
    playheadTime,
    isPlaying,
    onExportComplete,
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

    const getInterpolatedLayerValue = useCallback(
        (layer: ImageLayer, prop: 'opacity' | 'currentTime', playheadMs: number): number => {
            const keyframes = layer.keyframes
                ?.filter((keyframe) => keyframe[prop] !== undefined)
                .sort((a, b) => a.time - b.time);

            if (!keyframes || keyframes.length === 0) {
                if (prop === 'opacity') return layer.opacity ?? 1;
                return layer.currentTime ?? playheadMs / 1000;
            }

            if (playheadMs <= keyframes[0].time) {
                return keyframes[0][prop] as number;
            }

            if (playheadMs >= keyframes[keyframes.length - 1].time) {
                return keyframes[keyframes.length - 1][prop] as number;
            }

            for (let index = 0; index < keyframes.length - 1; index += 1) {
                const start = keyframes[index];
                const end = keyframes[index + 1];
                if (playheadMs >= start.time && playheadMs <= end.time) {
                    const startValue = start[prop] as number;
                    const endValue = end[prop] as number;
                    const duration = end.time - start.time;
                    if (duration <= 0) return endValue;
                    const progress = (playheadMs - start.time) / duration;
                    return startValue + (endValue - startValue) * progress;
                }
            }

            return prop === 'opacity' ? (layer.opacity ?? 1) : (layer.currentTime ?? playheadMs / 1000);
        },
        []
    );

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
        const exportVideos: Array<{
            video: HTMLVideoElement;
            layer: ImageLayer;
            gainNode: GainNode;
        }> = [];

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
                const sourceNode = audioContext.createMediaElementSource(video);
                const gainNode = audioContext.createGain();
                gainNode.gain.value = 0;
                sourceNode.connect(gainNode);
                gainNode.connect(destination);

                exportVideos.push({ video, layer, gainNode });
            });

            await audioContext.resume();

            return {
                stream: destination.stream,
                async play() {
                    await Promise.all(exportVideos.map(async ({ video }) => {
                        try {
                            await video.play();
                            video.pause();
                        } catch (error) {
                            console.warn('Export audio playback priming failed:', error);
                        }
                    }));
                },
                async sync(playheadMs: number) {
                    exportVideos.forEach(({ video, layer, gainNode }) => {
                        const startMs = layer.clipStartMs ?? 0;
                        const endMs = layer.clipEndMs ?? exportDurationMs;
                        const shouldBeActive = playheadMs >= startMs && playheadMs <= endMs;
                        const opacity = Math.max(0, Math.min(1, getInterpolatedLayerValue(layer, 'opacity', playheadMs)));
                        const hasCurrentTimeKeyframes = Boolean(
                            layer.keyframes?.some((keyframe) => typeof keyframe.currentTime === 'number')
                        );
                        const localTime = Math.max(
                            0,
                            hasCurrentTimeKeyframes
                                ? getInterpolatedLayerValue(layer, 'currentTime', playheadMs)
                                : Math.max(0, playheadMs - startMs) / 1000
                        );
                        const targetVolume = shouldBeActive ? (layer.volume ?? 1) * opacity : 0;

                        gainNode.gain.value = targetVolume;

                        if (shouldBeActive && targetVolume > 0.001) {
                            if (video.paused) {
                                if (Math.abs((video.currentTime || 0) - localTime) > 0.2) {
                                    try {
                                        video.currentTime = localTime;
                                    } catch (error) {
                                        console.warn('Failed to sync export audio currentTime:', error);
                                    }
                                }
                                video.play().catch((error) => {
                                    console.warn('Export audio playback failed:', error);
                                });
                            }
                        } else if (!video.paused) {
                            video.pause();
                        }
                    });
                },
                async cleanup() {
                    exportVideos.forEach(({ video }) => {
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
    }, [getInterpolatedLayerValue]);

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

    const waitForCanvasVideosToStart = useCallback(async (stage: Konva.Stage, videoLayers: ImageLayer[]) => {
        if (videoLayers.length === 0) return;

        const getNodeVideo = (layerId: string): HTMLVideoElement | null => {
            const node = stage.findOne(`#${layerId}`) as Konva.Image | undefined;
            const media = node?.image?.();
            return media instanceof HTMLVideoElement ? media : null;
        };

        const deadline = performance.now() + 2500;

        await new Promise<void>((resolve) => {
            const poll = () => {
                const readyVideos = videoLayers
                    .map((layer) => getNodeVideo(layer.id))
                    .filter((video): video is HTMLVideoElement => Boolean(video));

                if (readyVideos.length === 0) {
                    if (performance.now() >= deadline) {
                        resolve();
                        return;
                    }
                    requestAnimationFrame(poll);
                    return;
                }

                const allAdvanced = readyVideos.every((video) => {
                    const activelyPlaying = !video.paused && !video.ended;
                    return activelyPlaying;
                });

                if (allAdvanced || performance.now() >= deadline) {
                    const supportsFrameCallback = readyVideos.every(
                        (video) => typeof (video as any).requestVideoFrameCallback === 'function'
                    );

                    if (!supportsFrameCallback) {
                        resolve();
                        return;
                    }

                    let remaining = readyVideos.length;
                    const done = () => {
                        remaining -= 1;
                        if (remaining <= 0) resolve();
                    };

                    readyVideos.forEach((video) => {
                        (video as any).requestVideoFrameCallback(() => {
                            done();
                        });
                    });
                    return;
                }

                requestAnimationFrame(poll);
            };

            poll();
        });
    }, []);

    const exportSingleMotionAiClip = useCallback(async ({
        clipLayer,
        config,
        fileHandle,
        finalFilename,
        mimeType,
    }: {
        clipLayer: ImageLayer;
        config: ExportConfig;
        fileHandle: any;
        finalFilename: string;
        mimeType: string;
    }) => {
        const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextCtor) {
            throw new Error('AudioContext is not available for Motion AI export.');
        }

        const outputWidth = config.targetWidth;
        const outputHeight = Math.round((config.targetWidth * activePage.height) / activePage.width);
        const scaleX = outputWidth / activePage.width;
        const scaleY = outputHeight / activePage.height;

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = outputWidth;
        exportCanvas.height = outputHeight;
        const ctx = exportCanvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to create export canvas context.');
        }

        const clipVideo = document.createElement('video');
        const isBlobOrData = clipLayer.src.startsWith('blob:') || clipLayer.src.startsWith('data:');
        if (!isBlobOrData) {
            clipVideo.crossOrigin = 'anonymous';
        }
        clipVideo.src = isBlobOrData ? clipLayer.src : `${clipLayer.src}${clipLayer.src.includes('?') ? '&' : '?'}t=${Date.now()}`;
        clipVideo.preload = 'auto';
        clipVideo.playsInline = true;
        clipVideo.loop = false;
        clipVideo.muted = false;
        clipVideo.volume = 1;

        await new Promise<void>((resolve, reject) => {
            const onLoaded = () => resolve();
            clipVideo.addEventListener('loadeddata', onLoaded, { once: true });
            clipVideo.onerror = () => reject(new Error('Failed to load Motion AI clip for export.'));
            clipVideo.load();
        });

        await new Promise<void>((resolve, reject) => {
            const handleSeeked = () => resolve();
            clipVideo.addEventListener('seeked', handleSeeked, { once: true });
            clipVideo.currentTime = 0;
            const timeout = window.setTimeout(() => {
                clipVideo.removeEventListener('seeked', handleSeeked);
                resolve();
            }, 1000);
            clipVideo.addEventListener('seeked', () => window.clearTimeout(timeout), { once: true });
            clipVideo.onerror = () => reject(new Error('Failed to seek Motion AI clip to frame 0.'));
        });

        const clipDurationMs = Math.min(
            config.duration,
            Math.round((clipVideo.duration || clipLayer.duration || DEFAULT_VIDEO_DURATION_SEC) * 1000)
        );

        const audioContext = new AudioContextCtor();
        const destination = audioContext.createMediaStreamDestination();
        const audioSource = audioContext.createMediaElementSource(clipVideo);
        const audioGain = audioContext.createGain();
        audioGain.gain.value = clipLayer.volume ?? 1;
        audioSource.connect(audioGain);
        audioGain.connect(destination);

        const stream = exportCanvas.captureStream(60);
        destination.stream.getAudioTracks().forEach((track) => stream.addTrack(track));

        if (!MediaRecorder.isTypeSupported(mimeType)) {
            throw new Error('MP4 export is not supported in this browser session.');
        }

        const recorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: config.targetWidth > 2000 ? 25000000 : 8000000
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        const drawTextLayer = (layer: TextLayer) => {
            const fontSize = Math.max(1, layer.fontSize * Math.min(scaleX, scaleY));
            const x = layer.x * scaleX;
            const y = layer.y * scaleY;
            const width = layer.width * scaleX;
            const lineHeight = fontSize * (layer.lineHeight || 1.2);

            ctx.save();
            ctx.globalAlpha = layer.opacity ?? 1;
            ctx.fillStyle = layer.fill || '#ffffff';
            ctx.font = `${layer.fontWeight || 'normal'} ${fontSize}px ${layer.fontFamily || 'Helvetica'}`;
            ctx.textBaseline = 'top';

            const words = (layer.text || '').split(/\s+/).filter(Boolean);
            const lines: string[] = [];
            let currentLine = '';
            words.forEach((word) => {
                const candidate = currentLine ? `${currentLine} ${word}` : word;
                const metrics = ctx.measureText(candidate);
                if (metrics.width > width && currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = candidate;
                }
            });
            if (currentLine) lines.push(currentLine);

            lines.forEach((line, index) => {
                const metrics = ctx.measureText(line);
                let drawX = x;
                if (layer.align === 'center') {
                    drawX = x + (width - metrics.width) / 2;
                } else if (layer.align === 'right') {
                    drawX = x + width - metrics.width;
                }
                ctx.fillText(line, drawX, y + index * lineHeight);
            });
            ctx.restore();
        };

        const drawShapeLayer = (layer: ShapeLayer) => {
            if (layer.type !== LayerType.RECT) return;
            ctx.save();
            ctx.globalAlpha = layer.opacity ?? 1;
            ctx.fillStyle = layer.fill || '#000000';
            ctx.fillRect(layer.x * scaleX, layer.y * scaleY, layer.width * scaleX, layer.height * scaleY);
            ctx.restore();
        };

        const renderFrame = () => {
            ctx.clearRect(0, 0, outputWidth, outputHeight);
            ctx.fillStyle = activePage.backgroundColor || '#000000';
            ctx.fillRect(0, 0, outputWidth, outputHeight);

            ctx.save();
            ctx.globalAlpha = clipLayer.opacity ?? 1;
            ctx.drawImage(
                clipVideo,
                clipLayer.x * scaleX,
                clipLayer.y * scaleY,
                clipLayer.width * scaleX,
                clipLayer.height * scaleY
            );
            ctx.restore();

            activePage.layers.forEach((layer) => {
                if (!layer.visible || layer.id === clipLayer.id) return;
                if (layer.type === LayerType.TEXT) {
                    drawTextLayer(layer as TextLayer);
                } else if (layer.type === LayerType.RECT) {
                    drawShapeLayer(layer as ShapeLayer);
                }
            });
        };

        renderFrame();
        await audioContext.resume();

        await new Promise<void>((resolve, reject) => {
            let stopped = false;
            let rafId = 0;
            let frameCallbackHandle: number | null = null;
            const stopRecording = () => {
                if (stopped) return;
                stopped = true;
                if (rafId) cancelAnimationFrame(rafId);
                if (frameCallbackHandle !== null && typeof (clipVideo as any).cancelVideoFrameCallback === 'function') {
                    (clipVideo as any).cancelVideoFrameCallback(frameCallbackHandle);
                }
                clipVideo.pause();
                if (recorder.state === 'recording') {
                    recorder.stop();
                }
            };

            recorder.onerror = (event: any) => {
                stopRecording();
                reject(event?.error || new Error('Motion AI recorder failed.'));
            };

            recorder.onstop = async () => {
                try {
                    const blob = new Blob(chunks, { type: mimeType });

                    if (fileHandle) {
                        const writable = await fileHandle.createWritable();
                        await writable.write(blob);
                        await writable.close();
                    } else {
                        const file = new File([blob], finalFilename, { type: mimeType });
                        const url = URL.createObjectURL(file);
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
                        setTimeout(() => {
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                        }, 60000);
                    }

                    setIsExporting(false);
                    setStatusText('');
                    onExportComplete?.(config);
                    resolve();
                } catch (error) {
                    reject(error);
                } finally {
                    clipVideo.pause();
                    clipVideo.src = '';
                    clipVideo.load();
                    if (audioContext.state !== 'closed') {
                        await audioContext.close();
                    }
                }
            };

            const monitorFrame = () => {
                if (stopped) return;
                renderFrame();
                const elapsedMs = Math.min(clipDurationMs, Math.round((clipVideo.currentTime || 0) * 1000));
                setExportProgress(Math.min(100, (elapsedMs / clipDurationMs) * 100));
                if (elapsedMs >= clipDurationMs || clipVideo.ended) {
                    stopRecording();
                    return;
                }
                rafId = requestAnimationFrame(monitorFrame);
            };

            const monitorVideoFrame = () => {
                if (stopped) return;
                renderFrame();
                const elapsedMs = Math.min(clipDurationMs, Math.round((clipVideo.currentTime || 0) * 1000));
                setExportProgress(Math.min(100, (elapsedMs / clipDurationMs) * 100));
                if (elapsedMs >= clipDurationMs || clipVideo.ended) {
                    stopRecording();
                    return;
                }
                frameCallbackHandle = (clipVideo as any).requestVideoFrameCallback(() => monitorVideoFrame());
            };

            setStatusText('Recording Motion AI...');
            setExportProgress(0);
            clipVideo.currentTime = 0;
            renderFrame();
            recorder.start(250);
            clipVideo.play().then(() => {
                if (typeof (clipVideo as any).requestVideoFrameCallback === 'function') {
                    frameCallbackHandle = (clipVideo as any).requestVideoFrameCallback(() => monitorVideoFrame());
                } else {
                    rafId = requestAnimationFrame(monitorFrame);
                }
            }).catch((error) => {
                stopRecording();
                reject(error);
            });
        });
    }, [activePage, onExportComplete, setExportProgress, setStatusText]);

    const executeExport = async (config: ExportConfig) => {
        if (!stageRef.current) {
            alert("Internal Error: Stage reference is missing. Please reload the page.");
            return;
        }

        const previousSelection = {
            playheadTime,
            isPlaying,
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
                                onExportComplete?.(config);
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
                        onExportComplete?.(config);
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
                        onExportComplete?.(config);

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

            console.log('✅ Videos synchronized');

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

            const singleMotionAiLayer = videoLayers.length === 1
                ? videoLayers[0]
                : null;
            const isDedicatedMotionAiExport = Boolean(
                singleMotionAiLayer &&
                singleMotionAiLayer.name === 'Motion AI Clip' &&
                !singleMotionAiLayer.keyframes?.some((keyframe) => typeof keyframe.currentTime === 'number')
            );

            if (isDedicatedMotionAiExport && singleMotionAiLayer) {
                await exportSingleMotionAiClip({
                    clipLayer: singleMotionAiLayer,
                    config,
                    fileHandle,
                    finalFilename,
                    mimeType,
                });
                setEditorState(prev => ({
                    ...prev,
                    playheadTime: previousSelection.playheadTime,
                    isPlaying: previousSelection.isPlaying,
                    selectedLayerId: previousSelection.selectedLayerId,
                    selectedLayerIds: previousSelection.selectedLayerIds,
                    selectedKeyframe: previousSelection.selectedKeyframe
                }));
                return;
            }

            const canvas = stage.container().querySelector('canvas');
            if (!canvas) throw new Error("Canvas missing");

            // Capture stream
            const stream = canvas.captureStream(60);
            const exportAudio = await prepareExportAudio(videoLayers, config.duration);
            exportAudio?.stream.getAudioTracks().forEach((track) => stream.addTrack(track));

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
                    playheadTime: previousSelection.playheadTime,
                    isPlaying: previousSelection.isPlaying,
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
                        onExportComplete?.(config);
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
                onExportComplete?.(config);
            };

            setStatusText("Recording Scene...");

            // Put the canvas/video layers at frame 0 before recording starts.
            const playLayers = updateVideoState(seekLayers, true, true);
            updateActivePage({ layers: playLayers });
            await exportAudio?.play();
            await exportAudio?.sync?.(0);
            setEditorState(prev => ({
                ...prev,
                playheadTime: 0,
                isPlaying: true,
                selectedKeyframe: null
            }));

            // Give React/Konva two paint frames to settle the first video frame.
            await new Promise<void>((resolve) => {
                requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
            });

            await waitForCanvasVideosToStart(stage, videoLayers);

            let isRecording = true;
            const duration = config.duration;
            let rafId = 0;
            const recordingStart = performance.now();
            const getNodeVideo = (layerId: string): HTMLVideoElement | null => {
                const node = stage.findOne(`#${layerId}`) as Konva.Image | undefined;
                const media = node?.image?.();
                return media instanceof HTMLVideoElement ? media : null;
            };

            const primaryCanvasVideo = videoLayers.length > 0 ? getNodeVideo(videoLayers[0].id) : null;
            const shouldFollowPrimaryVideoClock = Boolean(
                primaryCanvasVideo &&
                videoLayers.length === 1 &&
                !videoLayers[0].keyframes?.some((keyframe) => typeof keyframe.currentTime === 'number')
            );

            // CRITICAL: use timeslice to prevent chunk loss
            recorder.start(250);

            if (shouldFollowPrimaryVideoClock && primaryCanvasVideo) {
                const monitorPrimaryVideo = () => {
                    if (!isRecording) return;

                    const elapsed = Math.min(duration, Math.max(0, (primaryCanvasVideo.currentTime || 0) * 1000));
                    setExportProgress(Math.min(100, (elapsed / duration) * 100));

                    if (elapsed >= duration || primaryCanvasVideo.ended) {
                        isRecording = false;
                        if (recorder.state === 'recording') {
                            recorder.stop();
                        }
                        return;
                    }

                    if (typeof (primaryCanvasVideo as any).requestVideoFrameCallback === 'function') {
                        (primaryCanvasVideo as any).requestVideoFrameCallback(() => monitorPrimaryVideo());
                    } else {
                        rafId = requestAnimationFrame(monitorPrimaryVideo);
                    }
                };

                if (typeof (primaryCanvasVideo as any).requestVideoFrameCallback === 'function') {
                    (primaryCanvasVideo as any).requestVideoFrameCallback(() => monitorPrimaryVideo());
                } else {
                    rafId = requestAnimationFrame(monitorPrimaryVideo);
                }
                return;
            }

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

            if (primaryCanvasVideo && typeof (primaryCanvasVideo as any).requestVideoFrameCallback === 'function') {
                const drawOnVideoFrame = () => {
                    if (!isRecording) return;
                    const layers = stage.children;
                    if (layers) {
                        layers.forEach((layer: any) => layer.draw());
                    } else {
                        stage.draw();
                    }
                    (primaryCanvasVideo as any).requestVideoFrameCallback(() => drawOnVideoFrame());
                };
                (primaryCanvasVideo as any).requestVideoFrameCallback(() => drawOnVideoFrame());
            } else {
                requestAnimationFrame(forceRedraw);
            }

            const advancePlayback = () => {
                if (!isRecording) return;

                const elapsed = Math.min(duration, performance.now() - recordingStart);
                setExportProgress(Math.min(100, (elapsed / duration) * 100));
                exportAudio?.sync?.(Math.min(duration, elapsed));
                setEditorState(prev => ({
                    ...prev,
                    playheadTime: Math.min(duration, elapsed),
                    isPlaying: elapsed < duration
                }));

                if (elapsed >= duration) {
                    isRecording = false;
                    if (recorder.state === 'recording') {
                        recorder.stop();
                    }
                    return;
                }

                rafId = requestAnimationFrame(advancePlayback);
            };

            rafId = requestAnimationFrame(advancePlayback);

        } catch (err: any) {
            console.error('❌ Export failed:', err);
            setEditorState(prev => ({
                ...prev,
                playheadTime: previousSelection.playheadTime,
                isPlaying: previousSelection.isPlaying,
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
