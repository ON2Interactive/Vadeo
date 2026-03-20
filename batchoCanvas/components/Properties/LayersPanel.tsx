
import React, { useState } from 'react';
import {
  Type, Square, Circle, Minus, Image as ImageIcon, Video as VideoIcon,
  Eye, EyeOff, Lock, Unlock, Layers, GripVertical, Copy, Trash2
} from 'lucide-react';
import { Layer, LayerType, ImageLayer } from '../../types';

interface Props {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelect: (id: string, isMulti?: boolean) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onDuplicateLayer: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onReorder: (newLayers: Layer[]) => void;
  onMask?: (selectedIds: string[]) => void;
  onUnmask?: (groupId: string) => void;
  selectedLayerIds?: string[]; // Support multi-selection
}

const LayersPanel: React.FC<Props> = ({
  layers,
  selectedLayerId,
  selectedLayerIds = [],
  onSelect,
  onUpdateLayer,
  onDuplicateLayer,
  onDeleteLayer,
  onReorder,
  onMask,
  onUnmask
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Design tools usually show the top layer at the top of the list.
  // In Konva/Canvas, the last item in the array is on top.
  const displayLayers = [...layers].reverse();

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const saveName = () => {
    if (editingId && editName.trim()) {
      onUpdateLayer(editingId, { name: editName.trim() });
    }
    setEditingId(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newDisplayLayers = [...displayLayers];
    const item = newDisplayLayers.splice(draggedIndex, 1)[0];
    newDisplayLayers.splice(index, 0, item);

    setDraggedIndex(index);
    // Sync back to original array (reverse again)
    onReorder([...newDisplayLayers].reverse());
  };

  const getLayerIcon = (layer: Layer) => {
    if (layer.type === LayerType.IMAGE) {
      return (layer as ImageLayer).mediaType === 'video' ? VideoIcon : ImageIcon;
    }
    switch (layer.type) {
      case LayerType.TEXT: return Type;
      case LayerType.RECT: return Square;
      case LayerType.CIRCLE: return Circle;
      case LayerType.LINE: return Minus;
      default: return Layers;
    }
  };

  return (
    <div className="p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-zinc-500 tracking-wider">Layers</h3>
        <div className="flex gap-2">
          {/* Mask Action */}
          {onMask && (selectedLayerIds.length === 2 || (selectedLayerIds.length === 0 && selectedLayerId)) && (
            <button
              onClick={() => onMask(selectedLayerIds.length > 0 ? selectedLayerIds : (selectedLayerId ? [selectedLayerId] : []))}
              className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700"
              disabled={selectedLayerIds.length !== 2}
              title="Select 2 layers to mask (Top masks Bottom)"
            >
              Mask
            </button>
          )}
          {/* Unmask Action */}
          {onUnmask && selectedLayerId && layers.find(l => l.id === selectedLayerId && l.type === LayerType.GROUP && (l as any).children?.some((c: any) => c.isMask)) && (
            <button
              onClick={() => onUnmask(selectedLayerId)}
              className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700"
            >
              Unmask
            </button>
          )}
          <span className="text-[10px] text-zinc-600 font-mono">{layers.length} items</span>
        </div>
      </div>
      <div className="flex flex-col gap-1 max-h-60 overflow-y-auto no-scrollbar">
        {displayLayers.length === 0 ? (
          <div className="py-4 text-center text-zinc-600 text-[10px] italic border border-dashed border-zinc-800 rounded">
            No layers yet
          </div>
        ) : (
          displayLayers.map((layer, idx) => {
            const Icon = getLayerIcon(layer);
            const isSelected = selectedLayerId === layer.id;
            const isHidden = layer.visible === false;
            const isLocked = layer.locked === true;

            return (
              <div
                key={layer.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={() => setDraggedIndex(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(layer.id, e.shiftKey || e.metaKey || e.ctrlKey);
                }}
                className={`group flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer transition-all border ${isSelected || selectedLayerIds.includes(layer.id)
                  ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                  : 'bg-zinc-800/50 border-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  } ${draggedIndex === idx ? 'opacity-50 scale-95' : 'opacity-100'}`}
              >
                <div className="text-zinc-600 group-hover:text-zinc-400">
                  <GripVertical size={12} />
                </div>
                <Icon size={14} className={isSelected ? 'text-blue-400' : 'text-zinc-500'} />
                {editingId === layer.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={saveName}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveName();
                      if (e.key === 'Escape') setEditingId(null);
                      e.stopPropagation();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-zinc-900 text-white text-xs px-1 py-0.5 rounded border border-blue-500 focus:outline-none min-w-0"
                  />
                ) : (
                  <span
                    className="flex-1 truncate font-medium hover:text-white"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      startEditing(layer.id, layer.name);
                    }}
                  >
                    {layer.name}
                  </span>
                )}

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateLayer(layer.id);
                    }}
                    className="p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-blue-400"
                    title="Duplicate Layer"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateLayer(layer.id, { visible: !layer.visible });
                    }}
                    className={`p-1 rounded hover:bg-zinc-700 ${isHidden ? 'text-red-400 opacity-100' : 'text-zinc-500'}`}
                  >
                    {isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateLayer(layer.id, { locked: !layer.locked });
                    }}
                    className={`p-1 rounded hover:bg-zinc-700 ${isLocked ? 'text-orange-400 opacity-100' : 'text-zinc-500'}`}
                  >
                    {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this layer?')) {
                        onDeleteLayer(layer.id);
                      }
                    }}
                    className="p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-red-400"
                    title="Delete Layer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LayersPanel;
