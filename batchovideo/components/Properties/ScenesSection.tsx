
import React from 'react';
import { Plus, Copy, Trash2 } from 'lucide-react';
import { Page } from '../../types';

interface Props {
  pages: Page[];
  activePageId: string;
  onPageSelect: (id: string) => void;
  onAddPage: () => void;
  onDuplicatePage: (id: string) => void;
  onDeletePage: (id: string) => void;
  onRenamePage: (id: string, name: string) => void;
}

const ScenesSection: React.FC<Props> = ({ 
  pages, 
  activePageId, 
  onPageSelect, 
  onAddPage, 
  onDuplicatePage, 
  onDeletePage,
  onRenamePage
}) => {
  return (
    <div className="p-4 border-b border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-zinc-500 tracking-wider">Scenes</h3>
        <button 
          onClick={onAddPage}
          className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-all active:scale-90"
        >
          <Plus size={18} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto no-scrollbar pb-2">
        {pages.map((page, index) => (
          <div 
            key={page.id}
            onClick={() => onPageSelect(page.id)}
            className={`relative group cursor-pointer rounded-xl border-2 transition-all flex flex-col overflow-hidden ${
              activePageId === page.id 
                ? 'border-blue-500 bg-zinc-800 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
            }`}
          >
            {/* Thumbnail Area */}
            <div className="h-28 flex items-center justify-center text-[10px] text-zinc-500 relative overflow-hidden bg-[#0a0a0b]">
               {page.thumbnail ? (
                 <img 
                   src={page.thumbnail} 
                   alt={page.name} 
                   className="w-full h-full object-contain p-2"
                 />
               ) : (
                 <div className="flex flex-col items-center gap-1 opacity-20">
                   <div className="w-10 h-10 rounded-lg border-2 border-zinc-700 border-dashed" />
                 </div>
               )}
               
               {activePageId === page.id && (
                 <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
               )}

               {/* Index badge */}
               <div className="absolute top-2 left-2 w-5 h-5 bg-black/60 backdrop-blur-md rounded flex items-center justify-center text-[9px] font-bold text-zinc-400 border border-white/10">
                 {index + 1}
               </div>
            </div>
            
            {/* Scene Name Editor */}
            <div className="bg-[#1a1a1c] p-1.5 border-t border-zinc-800">
              <input
                type="text"
                value={page.name}
                onChange={(e) => onRenamePage(page.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-transparent border-0 text-[10px] font-semibold text-zinc-300 focus:text-white focus:outline-none focus:ring-0 px-1 py-0.5 rounded hover:bg-white/5 transition-colors text-center"
              />
            </div>

            {/* Actions */}
            <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
              <button 
                onClick={(e) => { e.stopPropagation(); onDuplicatePage(page.id); }}
                className="p-1.5 bg-zinc-900/90 backdrop-blur-md hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white shadow-2xl transition-all border border-white/5 active:scale-90"
                title="Duplicate Scene"
              >
                <Copy size={12} />
              </button>
              {pages.length > 1 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeletePage(page.id); }}
                  className="p-1.5 bg-red-950/90 backdrop-blur-md hover:bg-red-800 rounded-md text-zinc-300 hover:text-white shadow-2xl transition-all border border-red-500/20 active:scale-90"
                  title="Delete Scene"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScenesSection;
