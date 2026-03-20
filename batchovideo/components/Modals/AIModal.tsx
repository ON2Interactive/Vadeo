
import React, { useState } from 'react';
import { X, Sparkles, Wand2, Info, Eye } from 'lucide-react';

interface Props {
  onClose: () => void;
  onGenerate: (prompt: string, useSimulation: boolean) => void;
  title?: string;
  description?: string;
  suggestions?: string[];
}

const AIModal: React.FC<Props> = ({
  onClose,
  onGenerate,
  title = "AI Motion Designer",
  description = "Describe the motion",
  suggestions = [
    "Make the clouds drift slowly across the sky.",
    "A subtle cinematic zoom into the subject.",
    "Gentle water ripples and reflections.",
    "Soft light flickering and wind blowing through leaves."
  ]
}) => {
  const [prompt, setPrompt] = useState('');

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#0f0f11] border border-white/10 w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-pro-gradient rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{description}</label>
            <textarea
              autoFocus
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Change the background to a cyberpunk city..."
              className="w-full h-32 bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-blue-500 resize-none transition-colors"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Suggestions</label>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(s)}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-lg text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-blue-600/5 border border-blue-500/20 rounded-xl flex gap-3 items-start">
            <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-200/60 leading-relaxed">
              Real AI generation requires an API key for billing and safety. For quick testing, you can use **Neural Simulation Mode**.
            </p>
          </div>
        </div>

        <div className="p-6 bg-zinc-900/50 border-t border-white/5 flex gap-3">
          <button
            onClick={() => onGenerate(prompt, true)}
            className="flex-1 h-12 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] border border-zinc-700"
          >
            <Eye size={18} />
            Demo Mode
          </button>
          <button
            onClick={() => onGenerate(prompt, false)}
            className="flex-[2] h-12 bg-pro-gradient hover:opacity-90 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg"
          >
            <Wand2 size={18} />
            Generate (Real AI)
          </button>
        </div>
      </div>
    </div>
  );
};


export default AIModal;
