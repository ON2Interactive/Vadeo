
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
  onSelectLayer: (id: string | null) => void;
  onReorderLayers: (newLayers: Layer[]) => void;
  onGenerateVideo: (layerId: string) => void;
  onPageAction: {
    select: (id: string) => void;
    add: () => void;
    duplicate: (id: string) => void;
    delete: (id: string) => void;
    rename: (id: string, name: string) => void;
  };
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

const PropertiesPanel: React.FC<Props> = ({
  pages, activePageId, selectedLayer, onUpdateLayer, onDuplicateLayer,
  onUpdatePage, onSelectLayer, onReorderLayers, onPageAction, onGenerateVideo
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

  const SteppedInput = ({ label, value, onChange, step = 1, suffix = "", icon: Icon }: any) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] text-zinc-400 font-medium flex items-center gap-1.5">
          {Icon && <Icon size={12} className="text-zinc-500" />}
          {label}
        </label>
      )}
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(parseFloat((value - step).toFixed(2)))} className="w-8 h-8 flex items-center justify-center bg-zinc-800/80 border border-zinc-700/50 rounded hover:bg-zinc-700 text-zinc-400 transition-colors active:scale-90"><Minus size={14} /></button>
        <div className="flex-1 relative">
          <input type="number" value={value} step={step} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 h-8 text-center text-xs text-white focus:outline-none focus:border-blue-500 appearance-none font-mono" />
          {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 pointer-events-none">{suffix}</span>}
        </div>
        <button onClick={() => onChange(parseFloat((value + step).toFixed(2)))} className="w-8 h-8 flex items-center justify-center bg-zinc-800/80 border border-zinc-700/50 rounded hover:bg-zinc-700 text-zinc-400 transition-colors active:scale-90"><Plus size={14} /></button>
      </div>
    </div>
  );

  const InputField = ({ label, value, onChange, type = "number", step = "1", min, max }: any) => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-zinc-500 font-semibold tracking-wide">{label}</label>
      <input
        type={type} value={value} step={step} min={min} max={max}
        onChange={(e) => { const val = type === "number" || type === "range" ? parseFloat(e.target.value) : e.target.value; onChange(val); }}
        className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
      />
    </div>
  );

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
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-zinc-500 font-semibold tracking-wide">Identifier</label>
                  <input
                    type="text"
                    value={selectedLayer.name}
                    onChange={(e) => handleLayerChange({ name: e.target.value })}
                    className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <InputField label="X" value={Math.round(selectedLayer.x)} onChange={(v: number) => handleLayerChange({ x: v })} />
                  <InputField label="Y" value={Math.round(selectedLayer.y)} onChange={(v: number) => handleLayerChange({ y: v })} />
                  <InputField label="Width" value={Math.round(selectedLayer.width)} onChange={(v: number) => handleLayerChange({ width: v })} />
                  <InputField label="Height" value={Math.round(selectedLayer.height)} onChange={(v: number) => handleLayerChange({ height: v })} />
                </div>
                <div className="mt-6 space-y-6">
                  <SteppedInput label="Opacity" value={Math.round(selectedLayer.opacity * 100)} onChange={(v: number) => handleLayerChange({ opacity: Math.max(0, Math.min(100, v)) / 100 })} suffix="%" />
                  <SteppedInput label="Rotation" value={Math.round(selectedLayer.rotation)} onChange={(v: number) => handleLayerChange({ rotation: v })} suffix="°" icon={RotateCcw} />
                </div>
              </div>
            </section>

            {/* TRANSITIONS (PRO STUB) */}
            <section className="pt-6 border-t border-zinc-800/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-amber-500" />
                  <h3 className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase">Motion & FX</h3>
                </div>
                <span className="text-[9px] text-amber-500/50 font-black tracking-widest uppercase">Experimental</span>
              </div>
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-500 font-semibold">Entry Transition</label>
                  <select disabled className="bg-zinc-800 border border-zinc-700 rounded px-3 h-9 text-xs text-zinc-400 cursor-not-allowed opacity-50">
                    <option>None</option>
                    <option>Fade In</option>
                    <option>Slide Left</option>
                    <option>Scale Bounce</option>
                  </select>
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
                    <InputField label="Size" value={(selectedLayer as TextLayer).fontSize} onChange={(v: number) => handleLayerChange({ fontSize: v })} />
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

            {(selectedLayer.type === LayerType.RECT || selectedLayer.type === LayerType.CIRCLE || selectedLayer.type === LayerType.POLYGON || selectedLayer.type === LayerType.TRIANGLE || selectedLayer.type === LayerType.STAR) && (
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
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Layout size={14} className="text-blue-500" />
                <h3 className="text-xs font-bold text-zinc-200 tracking-wider">Canvas Specification</h3>
              </div>
              <div className="space-y-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-500 font-semibold">Aspect Ratio Preset</label>
                  <select value={activePage?.aspectRatio} onChange={(e) => handleCanvasSizeChange(e.target.value as AspectRatio)} className="bg-zinc-800 border border-zinc-700 rounded px-3 h-10 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer hover:bg-zinc-750 transition-colors">
                    {Object.keys(ASPECT_RATIOS).map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
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
        <LayersPanel layers={activePage?.layers || []} selectedLayerId={selectedLayer?.id || null} onSelect={onSelectLayer} onUpdateLayer={onUpdateLayer} onDuplicateLayer={onDuplicateLayer} onReorder={onReorderLayers} />
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
