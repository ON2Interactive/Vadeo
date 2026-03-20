
import React, { useState, useRef, useEffect } from 'react';
import {
  MousePointer2,
  Hand,
  Type,
  Square,
  Circle,
  Minus,
  Image as ImageIcon,
  Video as VideoIcon,
  ChevronRight,
  Shapes as ShapesIcon,
  Triangle as TriangleIcon,
  Hexagon,
  Star as StarIcon,
  ArrowRight,
  Diamond,
  Heart,
  Component
} from 'lucide-react';
import { LayerType } from '../../types';

interface Props {
  onAddElement: (type: LayerType | 'IMAGE_UPLOAD' | 'VIDEO_UPLOAD') => void;
  onToolSelect: (tool: string) => void;
  activeTool: string;
}

const Toolbar: React.FC<Props> = ({ onAddElement, onToolSelect, activeTool }) => {
  const [isShapeMenuOpen, setIsShapeMenuOpen] = useState(false);
  const shapeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shapeMenuRef.current && !shapeMenuRef.current.contains(event.target as Node)) {
        setIsShapeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Select (V)' },
    { id: 'hand', icon: Hand, label: 'Hand (H)' },
  ];

  const shapeElements = [
    { id: LayerType.RECT, icon: Square, label: 'Rectangle' },
    { id: LayerType.CIRCLE, icon: Circle, label: 'Circle' },
    { id: LayerType.TRIANGLE, icon: TriangleIcon, label: 'Triangle' },
    { id: LayerType.POLYGON, icon: Hexagon, label: 'Polygon' },
    { id: LayerType.STAR, icon: StarIcon, label: 'Star' },
    { id: LayerType.ARROW, icon: ArrowRight, label: 'Arrow' },
    { id: LayerType.DIAMOND, icon: Diamond, label: 'Diamond' },
    { id: LayerType.HEART, icon: Heart, label: 'Heart' },
    { id: LayerType.TRAPEZOID, icon: Component, label: 'Trapezoid' },
    { id: LayerType.LINE, icon: Minus, label: 'Line' },
  ];

  const handleShapeSelect = (type: LayerType) => {
    onAddElement(type);
    setIsShapeMenuOpen(false);
  };

  return (
    <div className="w-16 bg-[#121214] border-r border-zinc-800 flex flex-col items-center py-6 gap-6 z-30 shadow-2xl">
      {/* Primary Tools */}
      <div className="flex flex-col gap-3 pb-6 border-b border-zinc-800/50 w-full items-center">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolSelect(tool.id)}
            className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all group relative ${activeTool === tool.id
              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
              : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'
              }`}
          >
            <tool.icon size={22} strokeWidth={2} />
            <span className="absolute left-16 bg-zinc-800 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity border border-zinc-700 shadow-xl">
              {tool.label}
            </span>
          </button>
        ))}
      </div>

      {/* Element Adding Tools */}
      <div className="flex flex-col gap-3 pt-2 w-full items-center">
        <button
          onClick={() => onAddElement(LayerType.TEXT)}
          className="flex items-center justify-center w-12 h-12 rounded-xl transition-all group relative text-zinc-500 hover:bg-zinc-800 hover:text-white"
        >
          <Type size={22} strokeWidth={2} />
          <span className="absolute left-16 bg-zinc-800 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity border border-zinc-700 shadow-xl">
            Text
          </span>
        </button>

        {/* Shape Group Menu */}
        <div className="relative" ref={shapeMenuRef}>
          <button
            onClick={() => setIsShapeMenuOpen(!isShapeMenuOpen)}
            className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all group relative ${isShapeMenuOpen ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'
              }`}
          >
            <ShapesIcon size={22} strokeWidth={2} />
            <ChevronRight size={10} className={`absolute bottom-1 right-1 transition-transform ${isShapeMenuOpen ? 'rotate-90' : ''}`} />
            <span className="absolute left-16 bg-zinc-800 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity border border-zinc-700 shadow-xl">
              Shapes
            </span>
          </button>

          {isShapeMenuOpen && (
            <div className="absolute left-full top-0 ml-2 bg-[#1e1e20] border border-zinc-700 rounded-xl shadow-2xl p-2 flex flex-col gap-1 z-[100] min-w-[140px] animate-in slide-in-from-left-2 duration-200">
              {shapeElements.map((shape) => (
                <button
                  key={shape.id}
                  onClick={() => handleShapeSelect(shape.id)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors text-xs font-medium"
                >
                  <shape.icon size={16} />
                  {shape.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => onAddElement('IMAGE_UPLOAD')}
          className="flex items-center justify-center w-12 h-12 rounded-xl transition-all group relative text-zinc-500 hover:bg-zinc-800 hover:text-white"
        >
          <ImageIcon size={22} strokeWidth={2} />
          <span className="absolute left-16 bg-zinc-800 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity border border-zinc-700 shadow-xl">
            Image
          </span>
        </button>

        <button
          onClick={() => onAddElement('VIDEO_UPLOAD')}
          className="flex items-center justify-center w-12 h-12 rounded-xl transition-all group relative text-zinc-500 hover:bg-zinc-800 hover:text-white"
        >
          <VideoIcon size={22} strokeWidth={2} />
          <span className="absolute left-16 bg-zinc-800 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity border border-zinc-700 shadow-xl">
            Video
          </span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
