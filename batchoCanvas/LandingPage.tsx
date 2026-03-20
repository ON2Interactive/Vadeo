
import React from 'react';
import { ArrowDown, Instagram, Twitter, Youtube, Github } from 'lucide-react';

interface LandingPageProps {
  onStartEditing: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartEditing }) => {
  return (
    <div className="w-full bg-black text-white selection:bg-zinc-200 selection:text-black font-['Inter']">
      {/* Navigation - Minimalist & Responsive */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 py-6 sm:py-10 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="flex items-center">
          <div className="text-xl sm:text-2xl font-bold tracking-[-0.07em] leading-none">
            batchoCanvas
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={onStartEditing}
            className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-black rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-95"
          >
            Try Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[800px] lg:min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black z-10" />
          <div className="absolute inset-0 bg-black/20 z-5" />

          <img
            src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=100&w=2800"
            alt="Cinematic Abstract"
            className="w-full h-full object-cover scale-110 animate-subtle-drift"
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(180,0,0,0.12),transparent_60%)] z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(30,30,255,0.05),transparent_50%)] z-10" />
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 opacity-40 animate-pulse">
          <div className="text-[9px] font-black uppercase tracking-[0.4em]">Discover</div>
          <ArrowDown size={14} className="animate-bounce" />
          <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* Section 01 - Blank/Minimalist */}
      <section className="relative min-h-screen py-20 bg-black flex items-center justify-center border-t border-white/5 overflow-hidden">
        <div className="absolute top-10 sm:top-20 left-6 sm:left-10 opacity-40">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.8em] text-zinc-500">Sequence 01</span>
        </div>
        <h2 className="text-[30vmax] sm:text-[30vw] font-black text-zinc-800/15 select-none tracking-tighter leading-none translate-y-10">01</h2>
        <div className="absolute bottom-10 sm:bottom-20 right-6 sm:right-10 w-24 sm:w-32 h-[1px] bg-zinc-800" />
      </section>

      {/* Section 02 - Blank/Minimalist */}
      <section className="relative min-h-screen py-20 bg-zinc-950 flex items-center justify-center border-t border-white/5 overflow-hidden">
        <div className="absolute top-10 sm:top-20 right-6 sm:right-10 opacity-40">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.8em] text-zinc-500">Sequence 02</span>
        </div>
        <h2 className="text-[30vmax] sm:text-[30vw] font-black text-zinc-800/15 select-none tracking-tighter leading-none -translate-y-10">02</h2>
        <div className="absolute bottom-10 sm:bottom-20 left-6 sm:left-10 w-24 sm:w-32 h-[1px] bg-zinc-800" />
      </section>

      {/* Section 03 - Blank/Minimalist + CTA */}
      <section className="relative min-h-screen py-20 bg-black flex flex-col items-center justify-center border-t border-white/5 overflow-hidden">
        <div className="absolute top-10 sm:top-20 left-6 sm:left-10 opacity-40">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.8em] text-zinc-500">Sequence 03</span>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-7xl px-6">
          <h2 className="text-[30vmax] sm:text-[30vw] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-zinc-800/10 select-none tracking-tighter leading-none">03</h2>

          <div className="text-center space-y-8 relative z-20 w-full flex flex-col items-center">
            <button
              onClick={onStartEditing}
              className="px-10 sm:px-16 py-5 sm:py-6 bg-white text-black rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] transition-all hover:scale-110 active:scale-95 shadow-[0_20px_60px_rgba(255,255,255,0.1)] group"
            >
              Start Creating
              <div className="absolute inset-0 bg-white blur-3xl opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-black border-t border-white/5 py-20 sm:py-32 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto flex flex-col items-end gap-12 sm:gap-20">
          {/* Logo - Matching the provided image wordmark */}
          <div className="text-3xl sm:text-5xl font-bold tracking-[-0.07em] leading-none text-right">
            batchoCanvas
          </div>

          {/* Right-aligned content stack */}
          <div className="flex flex-col items-end gap-8 sm:gap-12 w-full max-w-sm">
            <div className="flex flex-col items-end gap-4 text-right">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">Product</span>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Video Editor Pro</a></li>
                <li><a href="#" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">AI Motion Engine</a></li>
                <li><a href="#" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Enterprise API</a></li>
              </ul>
            </div>

            <div className="flex flex-col items-end gap-4 text-right">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">Connect</span>
              <div className="flex items-center gap-6 text-zinc-500">
                <a href="#" className="hover:text-white transition-colors"><Instagram size={18} /></a>
                <a href="#" className="hover:text-white transition-colors"><Twitter size={18} /></a>
                <a href="#" className="hover:text-white transition-colors"><Youtube size={18} /></a>
                <a href="#" className="hover:text-white transition-colors"><Github size={18} /></a>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 text-right pt-8 border-t border-white/5 w-full">
              <p className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.4em]">
                © 2025 Bytedance Ltd.
              </p>
              <p className="text-[9px] text-zinc-800 font-bold uppercase tracking-[0.2em]">
                Crafted for cinematic excellence
              </p>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes subtle-drift {
          from { transform: scale(1.1) translate(0, 0); }
          to { transform: scale(1.2) translate(-1%, -1%); }
        }
        .animate-subtle-drift {
          animation: subtle-drift 30s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
