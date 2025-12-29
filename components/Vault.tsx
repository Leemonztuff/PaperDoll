
import React from 'react';
import { GeneratedOutfit } from '../types';
import { IconButton } from './UI';

interface VaultProps {
  outfits: GeneratedOutfit[];
  activeId?: string;
  onSelect: (o: GeneratedOutfit) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}

export const Vault: React.FC<VaultProps> = ({ outfits, activeId, onSelect, onDelete, compact = false }) => {
  return (
    <div className={`h-full overflow-y-auto p-4 md:p-12 no-scrollbar ${compact ? 'flex flex-col gap-4' : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8'}`}>
      {outfits.map(outfit => (
        <div 
          key={outfit.id} 
          onClick={() => onSelect(outfit)}
          className={`group relative rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden flex-shrink-0 ${
            compact ? 'w-full aspect-square p-3' : 'aspect-[3/4] p-4 md:p-8'
          } ${
            activeId === outfit.id 
            ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.2)]' 
            : 'border-white/5 bg-black/40 hover:border-white/20 hover:bg-white/5'
          }`}
        >
          <div className="absolute inset-0 opacity-[0.03] checker-bg pointer-events-none" />
          <img 
            src={outfit.url} 
            className="w-full h-full object-contain relative z-10 transition-transform group-hover:scale-110 duration-500" 
            style={{ imageRendering: 'pixelated' }}
            alt="Asset" 
          />
          
          <div className="absolute top-2 left-2 md:top-4 md:left-4 px-2 py-0.5 bg-black/80 rounded-full text-[7px] md:text-[8px] font-black text-indigo-400 border border-white/5 z-20 uppercase tracking-widest">
            {outfit.evolutionStep}
          </div>

          {!compact && (
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20 hidden md:block">
              <p className="text-[8px] font-bold text-slate-400 uppercase truncate bg-black/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
                {outfit.prompt || "Raw Synthesis"}
              </p>
            </div>
          )}

          <div className="absolute top-2 right-2 md:top-4 md:right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
            <IconButton 
              variant="danger" 
              onClick={() => onDelete(outfit.id)}
              className="w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl"
            >
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </IconButton>
          </div>
        </div>
      ))}

      {outfits.length === 0 && (
        <div className="col-span-full flex-1 flex flex-col items-center justify-center py-32 opacity-20 text-center px-6">
          <svg className="w-16 h-16 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-[11px] font-black uppercase tracking-[0.5em]">Neural Archive Offline</span>
          <p className="text-[9px] font-bold uppercase mt-2">No genetic data found</p>
        </div>
      )}
    </div>
  );
};
