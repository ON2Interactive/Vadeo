import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { EditorState, Layer, LayerType, GroupLayer } from '../../types';

export const useMasking = (
    editorState: EditorState,
    setEditorState: React.Dispatch<React.SetStateAction<EditorState>>
) => {
    const handleMask = useCallback((selectedIds: string[]) => {
        setEditorState(prev => {
            const activePage = prev.pages.find(p => p.id === prev.activePageId);
            if (!activePage) return prev;

            // 1. Get layers
            const allLayers = [...activePage.layers];
            const targetLayers = allLayers.filter(l => selectedIds.includes(l.id));

            if (targetLayers.length < 2) return prev;

            // 2. Sort by rendering order (last is top)
            const sortedTargets = [...targetLayers].sort((a, b) => {
                return allLayers.findIndex(l => l.id === a.id) - allLayers.findIndex(l => l.id === b.id);
            });

            // The LAST item in sortedTargets is the TOP layer -> Use as Mask
            const maskLayer = sortedTargets[sortedTargets.length - 1];

            // 3. Create Group
            const minX = Math.min(...sortedTargets.map(l => l.x));
            const minY = Math.min(...sortedTargets.map(l => l.y));
            const maxX = Math.max(...sortedTargets.map(l => l.x + l.width));
            const maxY = Math.max(...sortedTargets.map(l => l.y + l.height));

            const groupLayer: GroupLayer = {
                id: uuidv4(),
                name: 'Mask Group',
                type: LayerType.GROUP,
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY,
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
                children: sortedTargets.map(l => {
                    const isMask = l.id === maskLayer.id;
                    let safeFill = (l as any).fill;
                    if (isMask && !safeFill && (l.type === LayerType.RECT || l.type === LayerType.CIRCLE || l.type === LayerType.STAR || l.type === LayerType.POLYGON || l.type === LayerType.TRIANGLE)) {
                        safeFill = '#000000';
                    }

                    return {
                        ...l,
                        x: l.x - minX,
                        y: l.y - minY,
                        isMask: isMask,
                        opacity: isMask ? 1 : l.opacity,
                        fill: isMask ? safeFill : (l as any).fill,
                        blendMode: isMask ? 'destination-in' : l.blendMode
                    };
                })
            };

            const highestIndex = Math.max(...selectedIds.map(id => allLayers.findIndex(l => l.id === id)));

            const finalLayers = allLayers.reduce((acc, layer, idx) => {
                if (selectedIds.includes(layer.id)) {
                    if (idx === highestIndex) acc.push(groupLayer);
                } else {
                    acc.push(layer);
                }
                return acc;
            }, [] as Layer[]);

            const newPages = prev.pages.map(p =>
                p.id === prev.activePageId ? { ...p, layers: finalLayers } : p
            );

            const newHistory = prev.history.slice(0, prev.historyIndex + 1);
            newHistory.push([...newPages]);

            return {
                ...prev,
                pages: newPages,
                history: newHistory,
                historyIndex: newHistory.length - 1,
                selectedLayerId: groupLayer.id,
                selectedLayerIds: []
            };
        });
    }, [setEditorState]);

    const handleUnmask = useCallback((groupId: string) => {
        setEditorState(prev => {
            const activePage = prev.pages.find(p => p.id === prev.activePageId);
            if (!activePage) return prev;

            const groupFromLayers = activePage.layers.find(l => l.id === groupId) as GroupLayer;
            if (!groupFromLayers || groupFromLayers.type !== LayerType.GROUP) return prev;

            const children = groupFromLayers.children || [];

            // Restore absolute positions
            const restoredLayers = children.map(c => ({
                ...c,
                x: groupFromLayers.x + c.x,
                y: groupFromLayers.y + c.y,
                isMask: undefined, // Remove mask flag
                blendMode: c.isMask ? 'source-over' : (c as any).blendMode // Reset blend mode
            }));

            // Replace group with children
            const allLayers = [...activePage.layers];
            const groupIndex = allLayers.findIndex(l => l.id === groupId);

            const newLayers = [
                ...allLayers.slice(0, groupIndex),
                ...restoredLayers,
                ...allLayers.slice(groupIndex + 1)
            ];

            const newPages = prev.pages.map(p =>
                p.id === prev.activePageId ? { ...p, layers: newLayers } : p
            );

            const newHistory = prev.history.slice(0, prev.historyIndex + 1);
            newHistory.push([...newPages]);

            return {
                ...prev,
                pages: newPages,
                history: newHistory,
                historyIndex: newHistory.length - 1,
                selectedLayerId: null,
                selectedLayerIds: restoredLayers.map(l => l.id)
            };
        });
    }, [setEditorState]);

    return {
        handleMask,
        handleUnmask
    };
};
