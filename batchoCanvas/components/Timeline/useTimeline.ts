import { useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { EditorState, LayerType, TextLayer, Page, Layer } from '../../types';
import { TimelineEngine } from './TimelineEngine';

export const useTimeline = (editorState: EditorState, setEditorState: React.Dispatch<React.SetStateAction<EditorState>>) => {
    // --- Timeline Playback Logic ---
    useEffect(() => {
        let animationFrame: number;
        let lastTime = performance.now();

        const loop = (now: number) => {
            if (editorState.isPlaying) {
                const delta = now - lastTime;
                setEditorState(prev => ({
                    ...prev,
                    playheadTime: Math.min(5000, prev.playheadTime + delta)
                }));
            }
            lastTime = now;
            animationFrame = requestAnimationFrame(loop);
        };

        animationFrame = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrame);
    }, [editorState.isPlaying, setEditorState]);

    const handleTogglePlay = useCallback(() => {
        setEditorState(prev => {
            const newTime = prev.playheadTime >= 5000 ? 0 : prev.playheadTime;
            return { ...prev, isPlaying: !prev.isPlaying, playheadTime: newTime };
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
