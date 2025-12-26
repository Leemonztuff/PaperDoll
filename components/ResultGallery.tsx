
import React from 'react';
import { GeneratedOutfit } from '../types';

interface ResultGalleryProps {
  outfits: GeneratedOutfit[];
  activeParentId: string | null;
  onSelectParent: (o: GeneratedOutfit) => void;
  onRemoveOutfit: (id: string) => void;
  onProcessPNG: (o: GeneratedOutfit) => void;
  isGenerating: boolean;
}

const ResultGallery: React.FC<ResultGalleryProps> = ({ 
  outfits, 
  activeParentId, 
  onSelectParent, 
  onRemoveOutfit,
  onProcessPNG,
  isGenerating 
}) => {
  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col gap-2">
        <h3 className="text-[14px] font-black uppercase tracking-[0.3em]">Neural Vault</h3>
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Variaciones guardadas localmente</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {isGenerating && (
          <div className="aspect-[3/4] bg-indigo-500/5 border-2 border-dashed border-indigo-500/20 rounded-2xl flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 border-2 border-indigo-500/40 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        )}
        
        {outfits.map((o) => (
          <div 
            key={o.id}
            onClick={() => onSelectParent(o)}
            className={`relative aspect-[3/4] rounded-2xl border transition-all overflow-hidden ${
              activeParentId === o.id ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-white/5 bg-slate-900/40'
            }`}
          >
            <img src={o.url} className="absolute inset-0 w-full h-full object-contain p-4" />
            
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded-full text-[7px] font-black uppercase tracking-widest border border-white/10">
              v{o.evolutionStep}.0
            </div>

            <div className="absolute bottom-2 right-2 flex gap-1">
              <button 
                onClick={(e) => { e.stopPropagation(); onProcessPNG(o); }}
                className="w-8 h-8 bg-black/80 rounded-lg flex items-center justify-center border border-white/10"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 9l-4-4-4 4m4-4v12" />
                </svg>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onRemoveOutfit(o.id); }}
                className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-500/20"
              >
                <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {outfits.length === 0 && !isGenerating && (
        <div className="py-20 text-center opacity-30">
          <p className="text-[10px] font-black uppercase tracking-widest">Sin assets guardados</p>
        </div>
      )}
    </div>
  );
};

export default ResultGallery;
