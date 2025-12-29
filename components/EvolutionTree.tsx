
import React, { useMemo } from 'react';
import { GeneratedOutfit } from '../types';

interface TreeNodeProps {
  outfit: GeneratedOutfit;
  onSelect: (o: GeneratedOutfit) => void;
  isActive: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({ outfit, onSelect, isActive }) => (
  <div 
    onClick={() => onSelect(outfit)}
    className={`relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] border-2 transition-all duration-500 cursor-pointer group ${
      isActive 
      ? 'border-indigo-500 bg-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.4)] z-20 scale-110' 
      : 'border-white/5 bg-black/60 hover:border-white/20 hover:scale-105 z-10'
    }`}
  >
    <div className="absolute inset-0 opacity-[0.03] checker-bg rounded-[2rem] pointer-events-none" />
    <img 
      src={outfit.url} 
      className="w-full h-full object-contain p-4 relative z-10 transition-transform group-hover:scale-110" 
      style={{ imageRendering: 'pixelated' }}
      alt="Asset"
    />
    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap z-20 flex flex-col items-center">
      <span className="text-[7px] font-black uppercase tracking-widest text-indigo-300 bg-black/90 px-3 py-1 rounded-full border border-white/5">
        STEP {outfit.evolutionStep}
      </span>
    </div>
  </div>
);

interface EvolutionTreeProps {
  outfits: GeneratedOutfit[];
  baseImage: string | null;
  activeId?: string;
  onSelect: (o: GeneratedOutfit) => void;
}

export const EvolutionTree: React.FC<EvolutionTreeProps> = ({ outfits, baseImage, activeId, onSelect }) => {
  // Construcción de ramas reales
  const levels = useMemo(() => {
    const map = new Map<number, GeneratedOutfit[]>();
    outfits.forEach(o => {
      const step = o.evolutionStep || 1;
      const current = map.get(step) || [];
      current.push(o);
      map.set(step, current);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [outfits]);

  if (!baseImage) return null;

  return (
    <div className="h-full w-full bg-[#030303] overflow-auto relative no-scrollbar flex flex-col items-center py-24 px-10 gap-32">
      {/* ORIGEN GENÉTICO */}
      <div className="relative z-20">
        <div className="w-36 h-36 rounded-[4rem] border-2 border-indigo-600/30 bg-indigo-600/5 p-8 relative group transition-all">
          <div className="absolute inset-0 bg-indigo-600/10 blur-[80px] rounded-full opacity-40 group-hover:opacity-60 transition-opacity" />
          <img src={baseImage} className="w-full h-full object-contain relative z-10 opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" style={{ imageRendering: 'pixelated' }} alt="Source" />
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-[10px] font-black text-indigo-400/60 uppercase tracking-[0.6em] whitespace-nowrap">Genetic Source</div>
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-0.5 h-16 bg-gradient-to-b from-indigo-500/40 to-indigo-500/10" />
        </div>
      </div>

      {/* NIVELES EVOLUTIVOS CONECTADOS */}
      {levels.map(([step, nodes], idx) => (
        <div key={step} className="flex flex-col items-center gap-32 w-full animate-in slide-in-from-bottom-8 duration-500">
          <div className="flex gap-16 justify-center flex-wrap max-w-5xl relative z-20">
            {nodes.map(node => (
              <div key={node.id} className="relative">
                {/* Conector con el nivel superior */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-0.5 h-16 bg-indigo-500/10" />
                <TreeNode outfit={node} onSelect={onSelect} isActive={activeId === node.id} />
              </div>
            ))}
          </div>
          {/* Conector al siguiente nivel */}
          {idx < levels.length - 1 && (
            <div className="w-0.5 h-16 bg-gradient-to-b from-indigo-500/10 to-indigo-500/5" />
          )}
        </div>
      ))}

      {outfits.length === 0 && (
        <div className="flex flex-col items-center opacity-20 mt-10">
          <div className="w-0.5 h-48 bg-gradient-to-b from-indigo-500 to-transparent" />
          <p className="text-[10px] font-black uppercase tracking-[0.8em] mt-12 text-slate-500 text-center px-20">Awaiting Genetic Diversification Archive</p>
        </div>
      )}

      {/* Grid técnica de fondo */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] checker-bg z-0" />
      <div className="h-64 shrink-0" />
    </div>
  );
};
