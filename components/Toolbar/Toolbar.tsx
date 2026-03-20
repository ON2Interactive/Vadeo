
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
  Component,
  Wand2,
  Sparkles,
  Settings
} from 'lucide-react';
import { LayerType } from '../../types';

interface Props {
  onAddElement: (type: LayerType | 'IMAGE_UPLOAD' | 'VIDEO_UPLOAD') => void;
  onToolSelect: (tool: string) => void;
  onRemix: () => void;
  onGenerateAd: () => void;
  activeTool: string;
  imageUploadInputId: string;
  videoUploadInputId: string;
}

const Toolbar: React.FC<Props> = ({
  onAddElement,
  onToolSelect,
  onRemix,
  onGenerateAd,
  activeTool,
  imageUploadInputId,
  videoUploadInputId
}) => {
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

  const baseControlClass =
    'flex items-center justify-center w-10 h-10 transition-colors group relative text-zinc-500 hover:text-white';

  const tooltipClass =
    'absolute left-14 bg-zinc-900 text-white px-2 py-1 rounded text-[10px] font-medium opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity border border-zinc-800 shadow-xl';

  return (
    <div className="w-14 bg-[#121214] border-r border-zinc-800 flex flex-col items-center py-5 gap-5 z-30">
      {/* Primary Tools */}
      <div className="flex flex-col gap-2 pb-5 border-b border-zinc-800/50 w-full items-center">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolSelect(tool.id)}
            className={`${baseControlClass} ${activeTool === tool.id
              ? 'text-white'
              : ''
              }`}
          >
            {activeTool === tool.id && <span className="absolute left-0 top-1/2 h-5 w-px -translate-y-1/2 bg-white" />}
            <tool.icon size={18} strokeWidth={1.9} />
            <span className={tooltipClass}>
              {tool.label}
            </span>
          </button>
        ))}
      </div>

      {/* Element Adding Tools */}
      <div className="flex flex-col gap-2 pt-1 w-full items-center">
        <button
          onClick={() => onAddElement(LayerType.TEXT)}
          className={baseControlClass}
        >
          <Type size={18} strokeWidth={1.9} />
          <span className={tooltipClass}>
            Text
          </span>
        </button>

        {/* Shape Group Menu */}
        <div className="relative" ref={shapeMenuRef}>
          <button
            onClick={() => setIsShapeMenuOpen(!isShapeMenuOpen)}
            className={`${baseControlClass} ${isShapeMenuOpen ? 'text-white' : ''
              }`}
          >
            {isShapeMenuOpen && <span className="absolute left-0 top-1/2 h-5 w-px -translate-y-1/2 bg-white" />}
            <ShapesIcon size={18} strokeWidth={1.9} />
            <ChevronRight size={10} className={`absolute -right-0.5 top-1/2 -translate-y-1/2 transition-transform text-zinc-700 ${isShapeMenuOpen ? 'rotate-90 text-zinc-400' : ''}`} />
            <span className={tooltipClass}>
              Shapes
            </span>
          </button>

          {isShapeMenuOpen && (
            <div className="absolute left-full top-0 ml-3 bg-[#16171a] border border-zinc-800 rounded-xl shadow-2xl p-2 flex flex-col gap-1 z-[100] min-w-[148px] animate-in slide-in-from-left-2 duration-200">
              {shapeElements.map((shape) => (
                <button
                  key={shape.id}
                  onClick={() => handleShapeSelect(shape.id)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors text-xs font-medium"
                >
                  <shape.icon size={15} strokeWidth={1.9} />
                  {shape.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <label
          htmlFor={imageUploadInputId}
          className={`${baseControlClass} cursor-pointer`}
        >
          <ImageIcon size={18} strokeWidth={1.9} />
          <span className={tooltipClass}>
            Image
          </span>
        </label>

        <label
          htmlFor={videoUploadInputId}
          className={`${baseControlClass} cursor-pointer`}
        >
          <VideoIcon size={18} strokeWidth={1.9} />
          <span className={tooltipClass}>
            Video
          </span>
        </label>

        <button
          onClick={onGenerateAd}
          className="flex items-center justify-center w-10 h-10 transition-colors group relative text-white hover:text-white"
        >
          <Sparkles size={18} strokeWidth={1.9} fill="currentColor" />
          <span className={tooltipClass}>
            Generate ad
          </span>
        </button>

        <button
          onClick={onRemix}
          className={baseControlClass}
        >
          <Wand2 size={18} strokeWidth={1.9} />
          <span className={tooltipClass}>
            Remix design
          </span>
        </button>
      </div>

      <div className="mt-auto w-full flex justify-center pt-3 border-t border-zinc-800/50">
        <button
          type="button"
          className={baseControlClass}
        >
          <Settings size={18} strokeWidth={1.9} />
          <span className={tooltipClass}>
            Settings
          </span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
