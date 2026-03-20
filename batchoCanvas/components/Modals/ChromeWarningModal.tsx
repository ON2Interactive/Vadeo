import React from 'react';
import { X, AlertTriangle, Monitor, ArrowRight, ShieldAlert } from 'lucide-react';

interface Props {
    onClose: () => void;
    onConfirm: () => void;
}

const ChromeWarningModal: React.FC<Props> = ({ onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#121214] border border-amber-500/30 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
                            <AlertTriangle size={18} />
                        </div>
                        <h2 className="text-lg font-bold text-white tracking-tight">Export Optimization</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                        <p className="text-sm text-amber-200/80 leading-relaxed font-medium">
                            We detected you are using Google Chrome.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                                <Monitor size={16} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white mb-1">Browser Limitation</h3>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Chrome's video recording engine has known issues with complex canvas animations.
                                    Exports may result in <span className="text-white font-bold">0-byte files</span> or stuttering.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="shrink-0 w-8 h-8 rounded-full bg-blue-900/20 flex items-center justify-center text-blue-400">
                                <ShieldAlert size={16} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white mb-1">Recommendation</h3>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    For the best results, please use <span className="text-white font-bold">Safari</span> or <span className="text-white font-bold">Firefox</span>.
                                    They support the proper video codecs natively.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-zinc-900/50 border-t border-white/5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 h-12 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold transition-all active:scale-[0.98]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 h-12 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-amber-900/20"
                    >
                        Try Anyway
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChromeWarningModal;
