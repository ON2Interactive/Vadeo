import { useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { EditorState, LayerType, TextLayer, Page, Layer } from '../../types';
import { TimelineEngine } from './TimelineEngine';

const DEFAULT_TIMELINE_DURATION_MS = 5000;

const getTimelineDurationMs = (pages: Page[], activePageId: string) => {
    const activePage = pages.find((page) => page.id === activePageId);
    if (!activePage) return DEFAULT_TIMELINE_DURATION_MS;

    const maxVideoDurationMs = activePage.layers.reduce((maxDuration, layer) => {
        if (layer.type !== LayerType.IMAGE || layer.mediaType !== 'video') {
            return maxDuration;
        }

        return Math.max(maxDuration, Math.round((layer.duration || 0) * 1000));
    }, 0);

    const maxKeyframeTimeMs = activePage.layers.reduce((maxTime, layer) => {
        const layerMax = layer.keyframes?.reduce((layerTime, keyframe) => Math.max(layerTime, keyframe.time), 0) || 0;
        return Math.max(maxTime, layerMax);
    }, 0);

    return Math.max(DEFAULT_TIMELINE_DURATION_MS, maxVideoDurationMs, maxKeyframeTimeMs);
};

export const useTimeline = (editorState: EditorState, setEditorState: React.Dispatch<React.SetStateAction<EditorState>>) => {
    // --- Timeline Playback Logic ---
    useEffect(() => {
        let animationFrame: number;
        let lastTime = performance.now();
        const timelineDurationMs = getTimelineDurationMs(editorState.pages, editorState.activePageId);

        const loop = (now: number) => {
            if (editorState.isPlaying) {
                const delta = now - lastTime;
                setEditorState(prev => {
                    const nextPlayheadTime = Math.min(timelineDurationMs, prev.playheadTime + delta);
                    return {
                        ...prev,
                        playheadTime: nextPlayheadTime,
                        isPlaying: nextPlayheadTime >= timelineDurationMs ? false : prev.isPlaying
                    };
                });
            }
            lastTime = now;
            animationFrame = requestAnimationFrame(loop);
        };

        animationFrame = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrame);
    }, [editorState.isPlaying, editorState.pages, editorState.activePageId, setEditorState]);

    const handleTogglePlay = useCallback(() => {
        setEditorState(prev => {
            const timelineDurationMs = getTimelineDurationMs(prev.pages, prev.activePageId);
            const shouldRestart = prev.playheadTime >= timelineDurationMs;
            const nextIsPlaying = !prev.isPlaying;
            const newTime = shouldRestart ? 0 : prev.playheadTime;
            const updatedPages = prev.pages.map((page) => {
                if (page.id !== prev.activePageId) {
                    return page;
                }

                return {
                    ...page,
                    layers: page.layers.map((layer) => {
                        if (layer.type !== LayerType.IMAGE || layer.mediaType !== 'video') {
                            return layer;
                        }

                        return {
                            ...layer,
                            playing: nextIsPlaying,
                            currentTime: shouldRestart ? 0 : layer.currentTime
                        };
                    })
                };
            });

            return {
                ...prev,
                pages: updatedPages,
                isPlaying: nextIsPlaying,
                playheadTime: newTime
            };
        });
    }, [setEditorState]);

    const handleAddKeyframe = useCallback((layerId: string) => {
        setEditorState(prev => {
            const activePage = prev.pages.find(p => p.id === prev.activePageId);
            if (!activePage) return prev;

            const layer = activePage.layers.find(l => l.id === layerId);
            if (!layer) return prev;

            // Create keyframe from the CURRENT interpolated state (what the user sees)
            const currentView = TimelineEngine.getInterpolatedLayer(layer, prev.playheadTime);

            const newKeyframe: any = {
                time: prev.playheadTime,
                x: currentView.x,
                y: currentView.y,
                rotation: currentView.rotation,
                opacity: currentView.opacity,
                width: currentView.width,
                height: currentView.height
            };

            if (layer.type === LayerType.TEXT) {
                newKeyframe.fontSize = (currentView as TextLayer).fontSize;
            }

            const updatedLayers = activePage.layers.map(l => {
                if (l.id === layerId) {
                    const existingKeyframes = l.keyframes || [];
                    const filtered = existingKeyframes.filter(kf => kf.time !== newKeyframe.time);
                    return { ...l, keyframes: [...filtered, newKeyframe].sort((a, b) => a.time - b.time) };
                }
                return l;
            });

            const newPages = prev.pages.map(p =>
                p.id === prev.activePageId ? { ...p, layers: updatedLayers } : p
            );

            const newHistory = prev.history.slice(0, prev.historyIndex + 1);
            newHistory.push([...newPages]);

            return {
                ...prev,
                pages: newPages,
                history: newHistory,
                historyIndex: newHistory.length - 1,
                selectedKeyframe: { layerId: layerId, time: newKeyframe.time },
                selectedLayerId: layerId,
                selectedLayerIds: [layerId]
            };
        });
    }, [setEditorState]);

    const handleKeyframeSelect = useCallback((layerId: string, time: number) => {
        setEditorState(prev => ({
            ...prev,
            selectedKeyframe: { layerId, time },
            playheadTime: time, // Sync playhead to keyframe
            selectedLayerId: layerId, // Also select the layer if not already
            selectedLayerIds: [layerId]
        }));
    }, [setEditorState]);

    const handleKeyframeMove = useCallback((layerId: string, oldTime: number, newTime: number) => {
        setEditorState(prev => {
            const activePage = prev.pages.find(p => p.id === prev.activePageId);
            if (!activePage) return prev;

            const updatedLayers = activePage.layers.map(l => {
                if (l.id === layerId && l.keyframes) {
                    return {
                        ...l,
                        keyframes: l.keyframes.map(kf =>
                            kf.time === oldTime ? { ...kf, time: newTime } : kf
                        ).sort((a, b) => a.time - b.time)
                    };
                }
                return l;
            });

            const newPages = prev.pages.map(p =>
                p.id === prev.activePageId ? { ...p, layers: updatedLayers } : p
            );

            const newHistory = prev.history.slice(0, prev.historyIndex + 1);
            newHistory.push([...newPages]);

            return {
                ...prev,
                pages: newPages,
                history: newHistory,
                historyIndex: newHistory.length - 1
            };
        });
    }, [setEditorState]);

    const handleDeleteKeyframe = useCallback(() => {
        setEditorState(prev => {
            if (!prev.selectedKeyframe) return prev;
            const { layerId, time } = prev.selectedKeyframe;

            const activePage = prev.pages.find(p => p.id === prev.activePageId);
            if (!activePage) return prev;

            const updatedLayers = activePage.layers.map(l => {
                if (l.id === layerId && l.keyframes) {
                    return { ...l, keyframes: l.keyframes.filter(kf => kf.time !== time) };
                }
                return l;
            });

            const newPages = prev.pages.map(p =>
                p.id === prev.activePageId ? { ...p, layers: updatedLayers } : p
            );

            const newHistory = prev.history.slice(0, prev.historyIndex + 1);
            newHistory.push([...newPages]);

            return {
                ...prev,
                pages: newPages,
                history: newHistory,
                historyIndex: newHistory.length - 1,
                selectedKeyframe: null
            };
        });
    }, [setEditorState]);

    return {
        handleTogglePlay,
        handleAddKeyframe,
        handleKeyframeSelect,
        handleKeyframeMove,
        handleDeleteKeyframe
    };
};
