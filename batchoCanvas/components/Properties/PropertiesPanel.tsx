
import React, { useState, useRef, useEffect } from 'react';
import { Page, Layer, LayerType, TextLayer, ShapeLayer, ImageLayer, AspectRatio } from '../../types';
import ScenesSection from './ScenesSection';
import LayersPanel from './LayersPanel';
import { ASPECT_RATIOS } from '../../constants';
import { VIDEO_EFFECTS } from '../../constants/videoEffects';
import {
  Play, Pause, RotateCcw, Volume2, VolumeX, Layout, Palette,
  AlignLeft, AlignCenter, AlignRight, Type as TypeIcon,
  Plus, Minus, ChevronDown, Check, MousePointer2, Sparkles, Wand2,
  Video as VideoIcon, MoveRight, Clock, Zap
} from 'lucide-react';

interface Props {
  pages: Page[];
  activePageId: string;
  selectedLayer: Layer | null;
  onUpdateLayer: (id: string, attrs: Partial<Layer>) => void;
  onDuplicateLayer: (id: string) => void;
  onUpdatePage: (attrs: Partial<Page>) => void;
  onSelectLayer: (id: string | null, isMulti?: boolean) => void;
  onReorderLayers: (newLayers: Layer[]) => void;
  onGenerateVideo: (layerId: string) => void;
  onDeleteLayer: (id: string) => void;
  onPageAction: {
    select: (id: string) => void;
    add: () => void;
    duplicate: (id: string) => void;
    delete: (id: string) => void;
    rename: (id: string, name: string) => void;
  };
  onMask?: (selectedIds: string[]) => void;
  onRemix: () => void;
  onUnmask?: (groupId: string) => void;
  selectedLayerIds?: string[];
  onAddKeyframe?: (layerId: string) => void;
}

const fonts = [
  { name: 'Baskerville', family: '"Libre Baskerville", serif' },
  { name: 'BEBAS NEUE', family: '"Bebas Neue", sans-serif' },
  { name: 'Bodoni Moda', family: '"Bodoni Moda", serif' },
  { name: 'Didot', family: '"GFS Didot", serif' },
  { name: 'Futura', family: 'Futura, "Trebuchet MS", sans-serif' },
  { name: 'Glamour', family: '"Playfair Display", serif' },
  { name: 'Helvetica', family: 'Helvetica, Arial, sans-serif' },
  { name: 'Inter', family: '"Inter", sans-serif' },
  { name: 'Manrope', family: '"Manrope", sans-serif' },
  { name: 'Merriweather', family: '"Merriweather", serif' },
  { name: 'Roboto Slab', family: '"Roboto Slab", serif' },
];

const SteppedInput = ({ label, value, onChange, step = 1, suffix = "", icon: Icon, onAddKeyframe }: any) => {
  const [localValue, setLocalValue] = useState(value);
  const isInputFocused = useRef(false);
  const lastEmitTime = useRef(0);

  // Sync with prop when not focused AND not in cooldown
  useEffect(() => {
    const isRecent = Date.now() - lastEmitTime.current < 150;
    if (!isInputFocused.current && !isRecent) {
      setLocalValue(value);
    }
  }, [value]);

  const handleCommit = (val: number) => {
    const fixedVal = parseFloat(val.toFixed(2));
    setLocalValue(fixedVal);
    lastEmitTime.current = Date.now();
    onChange(fixedVal);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    setLocalValue(val);
  };

  const handleBlur = () => {
    isInputFocused.current = false;
    handleCommit(localValue);
  };

  const handleFocus = () => {
    isInputFocused.current = true;
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-[11px] text-zinc-400 font-medium flex items-center gap-1.5">
            {Icon && <Icon size={12} className="text-zinc-500" />}
            {label}
          </label>
        )}
        {onAddKeyframe && (
          <button
            onClick={onAddKeyframe}
            className="p-1 hover:text-blue-500 text-zinc-600 transition-colors"
            title="Add keyframe here"
          >
            <Zap size={10} fill="currentColor" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleCommit(parseFloat((localValue - step).toFixed(2)))}
          className="w-8 h-8 flex items-center justify-center bg-zinc-800/80 border border-zinc-700/50 rounded hover:bg-zinc-700 text-zinc-400 transition-colors active:scale-90"
        >
          <Minus size={14} />
        </button>
        <div className="flex-1 relative">
          <input
            type="number"
            value={localValue}
            step={step}
            onFocus={handleFocus}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 h-8 text-center text-xs text-white focus:outline-none focus:border-blue-500 appearance-none font-mono"
          />
          {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 pointer-events-none">{suffix}</span>}
        </div>
        <button
          onClick={() => handleCommit(parseFloat((localValue + step).toFixed(2)))}
          className="w-8 h-8 flex items-center justify-center bg-zinc-800/80 border border-zinc-700/50 rounded hover:bg-zinc-700 text-zinc-400 transition-colors active:scale-90"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};

const InputField = ({ label, value, onChange, type = "number", step = "1", min, max, onAddKeyframe }: any) => {
  const [localValue, setLocalValue] = useState(value);
  const isInputFocused = useRef(false);
  const lastEmitTime = useRef(0);

  useEffect(() => {
    const isRecent = Date.now() - lastEmitTime.current < 150;
    if (!isInputFocused.current && !isRecent) {
      setLocalValue(value);
    }
  }, [value]);

  const handleCommit = (val: any) => {
    setLocalValue(val);
    lastEmitTime.current = Date.now();
    onChange(val);
  };

  const handleBlur = () => {
    isInputFocused.current = false;
    handleCommit(localValue);
  };

  const handleFocus = () => {
    isInputFocused.current = true;
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-zinc-500 font-semibold tracking-wide uppercase">{label}</label>
        {onAddKeyframe && (
          <button
            onClick={onAddKeyframe}
            className="p-1 hover:text-blue-500 text-zinc-600 transition-colors"
            title="Add keyframe here"
          >
            <Zap size={10} fill="currentColor" />
          </button>
        )}
      </div>
      <input
        type={type}
        value={localValue}
        step={step}
        min={min}
        max={max}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
        onChange={(e) => {
          const val = type === "number" || type === "range" ? parseFloat(e.target.value) : e.target.value;
          setLocalValue(val);
          // For colors or range, we might want to update live
          if (type === "color" || type === "range") {
            onChange(val);
          }
        }}
        className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
      />
    </div>
  );
};

const FontSizeInput = ({ value, onChange }: { value: number, onChange: (v: number) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const isInputFocused = useRef(false);
  const lastEmitTime = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const originalValueRef = useRef<number>(value);

  // Sync with prop when not focused AND not in cooldown
  useEffect(() => {
    const isRecent = Date.now() - lastEmitTime.current < 150;
    if (!isInputFocused.current && !isRecent) {
      setLocalValue(value);
    }
  }, [value]);

  // Update original ref when opening
  const handleOpen = () => {
    isInputFocused.current = true;
    if (!isOpen) {
      originalValueRef.current = value;
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleBlur = () => {
    isInputFocused.current = false;
    // Don't close dropdown here, as dropdown items need to be clickable
    // Dropdown handles its own closing via click-outside
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) {
          // Revert to original if clicking outside (cancelling preview)
          onChange(originalValueRef.current);
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onChange]);

  const presets = [6, 8, 9, 10, 11, 12, 14, 18, 24, 30, 36, 48, 60, 72, 96, 128, 144, 288];

  const handleSelect = (size: number) => {
    onChange(size);
    originalValueRef.current = size; // Commit this size
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-1 relative" ref={dropdownRef}>
      <label className="text-[10px] text-zinc-500 font-semibold">Size</label>
      <div className="relative">
        <input
          type="number"
          value={localValue}
          onChange={(e) => {
            const val = parseFloat(e.target.value) || 0;
            setLocalValue(val);
            lastEmitTime.current = Date.now();
            onChange(val);
            originalValueRef.current = val;
          }}
          onFocus={handleOpen}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono pr-6"
        />
        <button
          onClick={handleOpen}
          className="absolute right-0 top-0 bottom-0 px-2 text-zinc-500 hover:text-white"
        >
          <ChevronDown size={12} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e1e20] border border-zinc-700 rounded-lg shadow-xl z-[100] max-h-60 overflow-y-auto no-scrollbar ring-1 ring-black/50">
          {presets.map(size => (
            <button
              key={size}
              onClick={() => handleSelect(size)}
              onMouseEnter={() => onChange(size)} // Live Preview
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-600 hover:text-white ${value === size ? 'bg-blue-600/20 text-blue-400' : 'text-zinc-300'}`}
            >
              {size} pt
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const PropertiesPanel: React.FC<Props> = ({
  pages, activePageId, selectedLayer, onUpdateLayer, onDuplicateLayer, onDeleteLayer,
  onUpdatePage, onSelectLayer, onReorderLayers, onPageAction, onGenerateVideo,
  onMask, onUnmask, selectedLayerIds, onRemix, onAddKeyframe
}) => {
  const activePage = pages.find(p => p.id === activePageId);
  const [isFontOpen, setIsFontOpen] = useState(false);
  const fontDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target as Node)) setIsFontOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLayerChange = (attrs: Partial<Layer>) => {
    if (selectedLayer) onUpdateLayer(selectedLayer.id, attrs);
  };

  const handleCanvasSizeChange = (ratio: AspectRatio) => {
    const dims = ASPECT_RATIOS[ratio];
    onUpdatePage({ aspectRatio: ratio, width: dims.w, height: dims.h });
  };



  const activeFont = fonts.find(f => f.family === (selectedLayer as TextLayer)?.fontFamily) || fonts[7];

  return (
    <div className="w-80 bg-[#121214] border-l border-zinc-800 flex flex-col overflow-y-auto no-scrollbar shadow-2xl">
      <ScenesSection pages={pages} activePageId={activePageId} onPageSelect={onPageAction.select} onAddPage={onPageAction.add} onDuplicatePage={onPageAction.duplicate} onDeletePage={onPageAction.delete} onRenamePage={onPageAction.rename} />

      <div className="p-4 space-y-6">
        {selectedLayer ? (
          <>
            <section>
              <h3 className="text-[11px] font-bold text-zinc-500 tracking-wider mb-4 uppercase">
                {selectedLayer.type === LayerType.IMAGE && (selectedLayer as ImageLayer).mediaType === 'video' ? 'Video Layout' : 'Layer Layout'}
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <InputField label="X" value={Math.round(selectedLayer.x)} onChange={(v: number) => handleLayerChange({ x: v })} onAddKeyframe={() => onAddKeyframe?.(selectedLayer.id)} />
                  <InputField label="Y" value={Math.round(selectedLayer.y)} onChange={(v: number) => handleLayerChange({ y: v })} onAddKeyframe={() => onAddKeyframe?.(selectedLayer.id)} />
                  <InputField label="Width" value={Math.round(selectedLayer.width)} onChange={(v: number) => handleLayerChange({ width: v })} onAddKeyframe={() => onAddKeyframe?.(selectedLayer.id)} />
                  <InputField label="Height" value={Math.round(selectedLayer.height)} onChange={(v: number) => handleLayerChange({ height: v })} onAddKeyframe={() => onAddKeyframe?.(selectedLayer.id)} />
                </div>
                <div className="mt-6 space-y-6">
                  <SteppedInput label="Opacity" value={Math.round(selectedLayer.opacity * 100)} onChange={(v: number) => handleLayerChange({ opacity: Math.max(0, Math.min(100, v)) / 100 })} suffix="%" onAddKeyframe={() => onAddKeyframe?.(selectedLayer.id)} />
                  <SteppedInput label="Rotation" value={Math.round(selectedLayer.rotation)} onChange={(v: number) => handleLayerChange({ rotation: v })} suffix="°" icon={RotateCcw} onAddKeyframe={() => onAddKeyframe?.(selectedLayer.id)} />

                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] text-zinc-500 font-semibold">Blend Mode</label>
                    <select
                      value={selectedLayer.blendMode || 'source-over'}
                      onChange={(e) => handleLayerChange({ blendMode: e.target.value })}
                      className="bg-zinc-800 border border-zinc-700 rounded px-2 h-8 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="source-over">Normal</option>
                      <option value="multiply">Multiply</option>
                      <option value="screen">Screen</option>
                      <option value="overlay">Overlay</option>
                      <option value="darken">Darken</option>
                      <option value="lighten">Lighten</option>
                      <option value="color-dodge">Color Dodge</option>
                      <option value="color-burn">Color Burn</option>
                      <option value="hard-light">Hard Light</option>
                      <option value="soft-light">Soft Light</option>
                      <option value="difference">Difference</option>
                      <option value="exclusion">Exclusion</option>
                      <option value="hue">Hue</option>
                      <option value="saturation">Saturation</option>
                      <option value="color">Color</option>
                      <option value="luminosity">Luminosity</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>




            {selectedLayer.type === LayerType.TEXT && (
              <section className="pt-6 border-t border-zinc-800/50">
                <h3 className="text-[11px] font-bold text-zinc-500 tracking-wider mb-4 uppercase">Typography</h3>
                <div className="space-y-5">
                  <div className="relative" ref={fontDropdownRef}>
                    <label className="text-[10px] text-zinc-500 font-semibold block mb-1.5">Font Family</label>
                    <button onClick={() => setIsFontOpen(!isFontOpen)} className="w-full flex items-center justify-between bg-zinc-800 border border-zinc-700 rounded px-3 h-10 text-xs text-white hover:bg-zinc-700 transition-all shadow-inner">
                      <span style={{ fontFamily: activeFont.family }} className="truncate pr-2">{activeFont.name}</span>
                      <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-200 ${isFontOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isFontOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#1e1e20] border border-zinc-700 rounded-lg shadow-2xl z-[100] overflow-hidden max-h-80 overflow-y-auto no-scrollbar ring-1 ring-black/50">
                        {fonts.map((f) => (
                          <button key={f.name} onClick={() => { handleLayerChange({ fontFamily: f.family }); setIsFontOpen(false); }} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-800 transition-colors group">
                            <span style={{ fontFamily: f.family }} className="text-sm text-zinc-200 group-hover:text-white">{f.name}</span>
                            {activeFont.name === f.name && <Check size={14} className="text-blue-500" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-zinc-500 font-semibold">Weight</label>
                      <select value={(selectedLayer as TextLayer).fontWeight} onChange={(e) => handleLayerChange({ fontWeight: e.target.value })} className="bg-zinc-800 border border-zinc-700 rounded px-2 h-8 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer">
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                        <option value="900">Black</option>
                        <option value="100">Thin</option>
                      </select>
                    </div>
                    <FontSizeInput value={(selectedLayer as TextLayer).fontSize} onChange={(v: number) => handleLayerChange({ fontSize: v })} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-500 font-semibold">Alignment</label>
                    <div className="flex bg-zinc-800 rounded p-1 border border-zinc-700 h-9">
                      {[{ id: 'left', icon: AlignLeft }, { id: 'center', icon: AlignCenter }, { id: 'right', icon: AlignRight }].map((align) => (
                        <button key={align.id} onClick={() => handleLayerChange({ align: align.id as any })} className={`flex-1 flex justify-center items-center rounded transition-all ${(selectedLayer as TextLayer).align === align.id ? 'bg-zinc-700 text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}><align.icon size={16} /></button>
                      ))}
                    </div>
                  </div>
                  <SteppedInput label="Letter Spacing" value={(selectedLayer as TextLayer).letterSpacing} onChange={(v: number) => handleLayerChange({ letterSpacing: v })} />
                  <SteppedInput label="Line Height" value={(selectedLayer as TextLayer).lineHeight} onChange={(v: number) => handleLayerChange({ lineHeight: v })} step={0.01} />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-500 font-semibold">Text Color</label>
                    <div className="flex gap-2">
                      <input type="color" value={(selectedLayer as TextLayer).fill} onChange={(e) => handleLayerChange({ fill: e.target.value })} className="w-10 h-8 bg-transparent border-0 rounded cursor-pointer p-0" />
                      <input type="text" value={(selectedLayer as TextLayer).fill} onChange={(e) => handleLayerChange({ fill: e.target.value })} className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 h-8 text-[10px] text-white font-mono uppercase" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-zinc-500 font-semibold">Content</label>
                    <textarea value={(selectedLayer as TextLayer).text} onChange={(e) => handleLayerChange({ text: e.target.value })} className="bg-zinc-800 border border-zinc-700 rounded px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500 min-h-[80px] leading-relaxed resize-none" />
                  </div>
                </div>
              </section>
            )}

            {(selectedLayer.type === LayerType.RECT || selectedLayer.type === LayerType.CIRCLE || selectedLayer.type === LayerType.POLYGON || selectedLayer.type === LayerType.TRIANGLE || selectedLayer.type === LayerType.STAR || selectedLayer.type === LayerType.ARROW || selectedLayer.type === LayerType.DIAMOND || selectedLayer.type === LayerType.HEART || selectedLayer.type === LayerType.TRAPEZOID) && (
              <section className="pt-6 border-t border-zinc-800/50">
                <h3 className="text-[11px] font-bold text-zinc-500 tracking-wider mb-4 uppercase">Appearance</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Fill" type="color" value={(selectedLayer as ShapeLayer).fill} onChange={(v: string) => handleLayerChange({ fill: v })} />
                    <InputField label="Stroke" type="color" value={(selectedLayer as ShapeLayer).stroke} onChange={(v: string) => handleLayerChange({ stroke: v })} />
                  </div>
                  <SteppedInput label="Stroke Width" value={(selectedLayer as ShapeLayer).strokeWidth} onChange={(v: number) => handleLayerChange({ strokeWidth: v })} min={0} />
                  {(selectedLayer.type === LayerType.POLYGON || selectedLayer.type === LayerType.STAR) && <SteppedInput label="Sides / Points" value={(selectedLayer as ShapeLayer).sides || 5} onChange={(v: number) => handleLayerChange({ sides: Math.max(3, v) })} min={3} />}
                  {selectedLayer.type === LayerType.STAR && <SteppedInput label="Inner Radius" value={(selectedLayer as ShapeLayer).innerRadius || 20} onChange={(v: number) => handleLayerChange({ innerRadius: Math.max(1, v) })} min={1} />}
                  {selectedLayer.type === LayerType.RECT && <SteppedInput label="Corner Radius" value={(selectedLayer as ShapeLayer).cornerRadius} onChange={(v: number) => handleLayerChange({ cornerRadius: v })} min={0} />}
                </div>
              </section>
            )}

            {/* AI MAGIC SECTION */}
            {selectedLayer.type === LayerType.IMAGE && (selectedLayer as ImageLayer).mediaType === 'image' && (
              <section className="pt-6 border-t border-zinc-800/50">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={14} className="text-blue-400" />
                  <h3 className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase">AI Studio</h3>
                </div>

                <div className="space-y-3">
                  {/* Nano Banana (Image Edit) - DISABLED FOR NOW */}
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 opacity-50 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-zinc-300">Nano Banana Editor</span>
                      <span className="text-[9px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">10 Credits</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-tight mb-3">
                      Remix this image using Google Nano Banana logic.
                    </p>
                    <button
                      disabled
                      // onClick={() => onGenerateVideo(selectedLayer.id)}  <-- DISABLED 
                      className="w-full py-2 bg-zinc-800 text-zinc-500 border border-zinc-700/50 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <Wand2 size={14} />
                      Coming Soon
                    </button>
                    {/* <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded">Maintenance</span>
                    </div> */}
                  </div>

                  {/* FAL Kling (Video Gen) */}
                  <div className="bg-pro-gradient/5 border border-blue-500/20 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-zinc-300">Kling Motion</span>
                      <span className="text-[9px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">Pro</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-tight mb-3">
                      Turn this static image into a video using Kling.
                    </p>
                    <button
                      disabled // Pending key
                      className="w-full py-2 bg-zinc-800 text-zinc-500 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <VideoIcon size={14} />
                      Animate (Coming Soon)
                    </button>
                  </div>
                </div>
              </section>
            )}

            {selectedLayer.type === LayerType.IMAGE && (selectedLayer as ImageLayer).mediaType === 'video' && (
              <section className="pt-6 border-t border-zinc-800/50">
                <h3 className="text-[11px] font-bold text-zinc-500 tracking-wider mb-4 uppercase">Video Engine</h3>
                <div className="space-y-5">
                  {/* Video Effects Dropdown */}

                  <div className="flex items-center justify-between gap-3">
                    <button onClick={() => handleLayerChange({ playing: !(selectedLayer as ImageLayer).playing })} className={`flex items-center justify-center gap-2 px-4 h-11 rounded-lg text-xs font-bold transition-all flex-1 shadow-lg active:scale-95 ${(selectedLayer as ImageLayer).playing ? 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                      {(selectedLayer as ImageLayer).playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                      {(selectedLayer as ImageLayer).playing ? "Pause" : "Preview"}
                    </button>
                    <button onClick={() => handleLayerChange({ loop: !(selectedLayer as ImageLayer).loop })} className={`w-11 h-11 flex items-center justify-center rounded-lg border transition-all ${(selectedLayer as ImageLayer).loop ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300'}`} title="Loop Scene"><RotateCcw size={18} /></button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-zinc-500 font-semibold">Audio Mix</label>
                      <span className="text-[10px] text-zinc-400 font-mono tracking-tighter">{Math.round(((selectedLayer as ImageLayer).volume ?? 1) * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {(selectedLayer as ImageLayer).volume === 0 ? <VolumeX size={16} className="text-zinc-500" /> : <Volume2 size={16} className="text-zinc-500" />}
                      <input type="range" min="0" max="1" step="0.01" value={(selectedLayer as ImageLayer).volume ?? 1} onChange={(e) => handleLayerChange({ volume: parseFloat(e.target.value) })} className="flex-1 accent-blue-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer hover:bg-zinc-700 transition-colors" />
                    </div>
                  </div>
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* AI CAPABILITIES */}
            <section className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-white/5 rounded-xl p-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center gap-2 mb-3 relative z-10">
                <Sparkles size={14} className="text-pink-400 animate-pulse" />
                <h3 className="text-xs font-bold text-white tracking-wider">Creative Partner</h3>
              </div>

              <button
                onClick={onRemix}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white rounded-lg text-xs font-bold shadow-lg hover:shadow-purple-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 relative z-10 group/btn"
              >
                <Wand2 size={14} className="group-hover/btn:rotate-12 transition-transform" />
                Remix Design
              </button>
              <p className="text-[9px] text-zinc-400 mt-2 text-center relative z-10">
                Instantly shuffle layouts, colors, and fonts (Swiss & Bauhaus styles).
              </p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Layout size={14} className="text-blue-500" />
                <h3 className="text-xs font-bold text-zinc-200 tracking-wider">Canvas Specification</h3>
              </div>
              <div className="space-y-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-500 font-semibold">Aspect Ratio Preset</label>
                  <select value={activePage?.aspectRatio} onChange={(e) => handleCanvasSizeChange(e.target.value as AspectRatio)} className="bg-zinc-800 border border-zinc-700 rounded px-3 h-10 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer hover:bg-zinc-750 transition-colors">
                    <optgroup label="Digital & Social" className="bg-zinc-900 text-zinc-400">
                      {['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '1.85:1 Flat', '2.39:1 CinemaScope', '21:9 UltraWide', '1.43:1 IMAX'].map(ratio => (
                        <option key={ratio} value={ratio} className="bg-zinc-800 text-white">{ratio}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Print Portrait" className="bg-zinc-900 text-zinc-400">
                      {['A3 Portrait', 'A4 Portrait', 'A5 Portrait', 'Letter Portrait', 'Legal Portrait', 'Ledger Portrait', 'Half Letter Portrait', 'Trade Paperback Portrait', 'Magazine Portrait'].map(ratio => (
                        <option key={ratio} value={ratio} className="bg-zinc-800 text-white">{ratio}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Print Landscape" className="bg-zinc-900 text-zinc-400">
                      {['A3 Landscape', 'A4 Landscape', 'A5 Landscape', 'Letter Landscape', 'Legal Landscape', 'Ledger Landscape', 'Half Letter Landscape', 'Trade Paperback Landscape', 'Magazine Landscape'].map(ratio => (
                        <option key={ratio} value={ratio} className="bg-zinc-800 text-white">{ratio}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <InputField label="Width (px)" value={activePage?.width} onChange={(v: number) => onUpdatePage({ width: v })} />
                  <InputField label="Height (px)" value={activePage?.height} onChange={(v: number) => onUpdatePage({ height: v })} />
                </div>
              </div>
            </section>
            <section className="pt-6 border-t border-zinc-800/50">
              <div className="flex items-center gap-2 mb-4">
                <Palette size={14} className="text-purple-500" />
                <h3 className="text-xs font-bold text-zinc-200 tracking-wider">Canvas Environment</h3>
              </div>
              <div className="space-y-4">
                <InputField label="Background Mix" type="color" value={activePage?.backgroundColor || '#ffffff'} onChange={(v: string) => onUpdatePage({ backgroundColor: v })} />
              </div>
            </section>
            <div className="pt-24 flex flex-col items-center justify-center text-zinc-600 text-center px-8">
              <div className="mb-5 opacity-10"><MousePointer2 size={48} strokeWidth={1} /></div>
              <p className="text-[10px] font-black tracking-[0.1em] leading-relaxed">Select an object or layer to reveal context-aware properties</p>
            </div>
          </div>
        )}
      </div>
      <div className="mt-auto border-t border-zinc-800/50">
        <LayersPanel
          layers={activePage?.layers || []}
          selectedLayerId={selectedLayer?.id || null}
          onSelect={onSelectLayer}
          onUpdateLayer={onUpdateLayer}
          onDuplicateLayer={onDuplicateLayer}
          onDeleteLayer={onDeleteLayer}
          onReorder={onReorderLayers}
          onMask={onMask}
          onUnmask={onUnmask}
          selectedLayerIds={selectedLayerIds}
        />
      </div>
      <div className="p-5 border-t border-zinc-800/80 bg-[#0d0d0f] shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
        <h3 className="text-[9px] font-black text-zinc-600 tracking-wider mb-3">Live Scene State</h3>
        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <span className="truncate pr-4 font-medium">{activePage?.name || 'Processing...'}</span>
          <span className="bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-700/50">{activePage?.width} × {activePage?.height}</span>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
