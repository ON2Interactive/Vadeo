
import React, { useState, useEffect } from 'react';
import { X, Download, Monitor, Image as ImageIcon, Video as VideoIcon, CheckCircle2, Clock, Crown, Lock } from 'lucide-react';
import { AspectRatio, ExportConfig } from '../../types';

interface Props {
  onClose: () => void;
  onConfirm: (config: ExportConfig) => void;
  aspectRatio: AspectRatio;
  currentWidth: number;
  currentHeight: number;
  hasVideo: boolean;
  suggestedDuration?: number;
  isPro?: boolean;
  onShowPro: () => void;
}

const RESOLUTIONS = [
  { label: 'Original', width: null, premium: false },
  { label: '1K', width: 1024, premium: false },
  { label: 'Full HD', width: 1920, premium: false },
  { label: '2K', width: 2560, premium: true },
  { label: '4K', width: 3840, premium: true },
];

const ExportDialog: React.FC<Props> = ({
  onClose, onConfirm, currentWidth, currentHeight, hasVideo, suggestedDuration = 10, isPro, onShowPro
}) => {
  const [selectedRes, setSelectedRes] = useState(RESOLUTIONS[2]); // Default 1080p
  const [format, setFormat] = useState<'png' | 'video' | 'pdf'>(hasVideo ? 'video' : 'png');
  const [durationSec, setDurationSec] = useState(Math.round(suggestedDuration));

  useEffect(() => {
    setDurationSec(Math.round(suggestedDuration));
  }, [suggestedDuration]);

  const getTargetDims = (targetW: number | null) => {
    if (!targetW) return { w: currentWidth, h: currentHeight };
    const ratio = currentHeight / currentWidth;
    return { w: targetW, h: Math.round(targetW * ratio) };
  };

  const handleExport = () => {
    if (selectedRes.premium && !isPro) {
      onShowPro();
      return;
    }
    const dims = getTargetDims(selectedRes.width);
    onConfirm({
      format,
      targetWidth: dims.w,
      duration: durationSec * 1000,
      label: selectedRes.label
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#121214] border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600/10 rounded-lg flex items-center justify-center text-blue-400">
              <Download size={18} />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Export Design</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          {/* Format Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Output Format</label>
            <div className="grid grid-cols-3 gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <button
                onClick={() => setFormat('png')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${format === 'png' ? 'border-blue-500 bg-blue-600/5 text-white' : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700'
                  }`}
              >
                <ImageIcon size={24} />
                <span className="text-xs font-bold">Image (PNG)</span>
              </button>
              <button
                onClick={() => setFormat('pdf')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${format === 'pdf' ? 'border-blue-500 bg-blue-600/5 text-white' : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700'
                  }`}
              >
                <div className="flex items-center justify-center w-6 h-6 border-2 border-current rounded-sm text-[10px] font-bold">PDF</div>
                <span className="text-xs font-bold">Document (PDF)</span>
              </button>
              <button
                onClick={() => setFormat('video')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${format === 'video' ? 'border-blue-500 bg-blue-600/5 text-white' : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700'
                  }`}
              >
                <VideoIcon size={24} />
                <span className="text-xs font-bold">Video</span>
              </button>
            </div>
          </div>

          {format === 'video' && (
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Recording Duration</label>
                <span className="text-xs font-mono text-blue-400 font-bold">{durationSec}s</span>
              </div>
              <div className="flex items-center gap-3 bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                <Clock size={16} className="text-zinc-500" />
                <input
                  type="range"
                  min="1"
                  max="120"
                  step="1"
                  value={durationSec}
                  onChange={(e) => setDurationSec(parseInt(e.target.value))}
                  className="flex-1 accent-blue-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Resolution Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Quality / Resolution</label>
            <div className="space-y-2">
              {RESOLUTIONS.map((res) => {
                const dims = getTargetDims(res.width);
                const isSelected = selectedRes.label === res.label;
                const isPremiumLocked = res.premium && !isPro;

                return (
                  <button
                    key={res.label}
                    onClick={() => setSelectedRes(res)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${isSelected ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-transparent border-transparent text-zinc-500 hover:bg-zinc-900'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Monitor size={16} className={isSelected ? 'text-blue-400' : 'text-zinc-600'} />
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{res.label}</span>
                          {res.premium && (
                            <div className="px-1.5 py-0.5 rounded-full bg-pro-gradient text-white text-[8px] font-black uppercase tracking-tighter flex items-center gap-1">
                              <Crown size={8} /> Pro
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500">{dims.w} × {dims.h}</div>
                      </div>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 size={16} className="text-blue-500" />
                    ) : isPremiumLocked ? (
                      <Lock size={14} className="text-zinc-700" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 bg-zinc-900/50 border-t border-zinc-800">
          <button
            onClick={handleExport}
            className={`w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl ${selectedRes.premium && !isPro
              ? 'bg-pro-gradient text-white shadow-blue-900/20'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
              }`}
          >
            {selectedRes.premium && !isPro ? <Crown size={18} /> : <Download size={18} />}
            {selectedRes.premium && !isPro ? 'Upgrade to Export in ' + selectedRes.label : 'Confirm & Export'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;
