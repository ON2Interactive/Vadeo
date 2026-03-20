
import React, { useState } from 'react';
import { 
  Type, Square, Circle, Minus, Image as ImageIcon, Video as VideoIcon, 
  Eye, EyeOff, Lock, Unlock, Layers, GripVertical, Copy
} from 'lucide-react';
import { Layer, LayerType, ImageLayer } from '../../types';

interface Props {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelect: (id: string) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onDuplicateLayer: (id: string) => void;
  onReorder: (newLayers: Layer[]) => void;
}

const LayersPanel: React.FC<Props> = ({ 
  layers, 
  selectedLayerId, 
  onSelect, 
  onUpdateLayer, 
  onDuplicateLayer,
  onReorder 
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Design tools usually show the top layer at the top of the list.
  // In Konva/Canvas, the last item in the array is on top.
  const displayLayers = [...layers].reverse();

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
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
        <span className="text-[10px] text-zinc-600 font-mono">{layers.length} items</span>
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
                onClick={() => onSelect(layer.id)}
                className={`group flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer transition-all border ${
                  isSelected 
                    ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                    : 'bg-zinc-800/50 border-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                } ${draggedIndex === idx ? 'opacity-50 scale-95' : 'opacity-100'}`}
              >
                <div className="text-zinc-600 group-hover:text-zinc-400">
                  <GripVertical size={12} />
                </div>
                <Icon size={14} className={isSelected ? 'text-blue-400' : 'text-zinc-500'} />
                <span className="flex-1 truncate font-medium">
                  {layer.name}
                </span>
                
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
