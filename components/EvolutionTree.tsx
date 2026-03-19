
import React, { useMemo, useState } from 'react';
import { GeneratedOutfit } from '../types';

interface TreeNodeProps {
  outfit: GeneratedOutfit;
  onSelect: (o: GeneratedOutfit) => void;
  isActive: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({ outfit, onSelect, isActive }) => (
  <div 
    onClick={() => onSelect(outfit)}
    className={`group relative shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer ${
      isActive 
      ? 'border-indigo-500 bg-indigo-500/20 shadow-[0_0_60px_rgba(99,102,241,0.5)] z-20 scale-110' 
      : 'border-white/5 bg-zinc-900 hover:border-indigo-500/30 hover:scale-105 z-10'
    }`}
  >
    {/* Micro-HUD Interno */}
    <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-30">
      <span className="text-[6px] font-black bg-indigo-600 px-2 py-0.5 rounded-full text-white uppercase tracking-tighter">
        {outfit.model.includes('pro') ? 'PRO' : 'FLSH'}
      </span>
    </div>

    <div className="absolute inset-0 opacity-[0.03] checker-bg rounded-[2.5rem] pointer-events-none" />
    
    <img 
      src={outfit.url} 
      className="w-full h-full object-contain p-6 relative z-10 transition-all duration-700 group-hover:scale-125 group-hover:drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
      style={{ imageRendering: 'pixelated' }}
      alt="Neural Gen"
    />

    {/* Footer de Datos */}
    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap z-20 flex flex-col items-center gap-1">
      <div className="flex items-center gap-1 bg-zinc-800 border border-white/10 px-3 py-1 rounded-full shadow-2xl transition-all group-hover:border-indigo-500/50">
        <span className="text-[7px] font-black uppercase tracking-widest text-white/40 group-hover:text-indigo-400">GEN</span>
        <span className="text-[8px] font-black text-indigo-400">{outfit.evolutionStep}</span>
      </div>
      <span className="text-[6px] font-bold text-slate-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
        ID: {outfit.id.slice(0, 5)}
      </span>
    </div>
    
    {/* Efecto de Escaneo al Hover */}
    <div className="absolute inset-x-0 top-0 h-0.5 bg-indigo-500/50 opacity-0 group-hover:opacity-100 group-hover:animate-bounce z-40" />
  </div>
);

interface EvolutionTreeProps {
  outfits: GeneratedOutfit[];
  baseImage: string | null;
  activeId?: string;
  onSelect: (o: GeneratedOutfit) => void;
}

export const EvolutionTree: React.FC<EvolutionTreeProps> = ({ outfits, baseImage, activeId, onSelect }) => {
  const [filterStep, setFilterStep] = useState<number | 'all'>('all');

  const levels = useMemo(() => {
    const map = new Map<number, GeneratedOutfit[]>();
    outfits.forEach(o => {
      const step = o.evolutionStep || 1;
      if (filterStep !== 'all' && step !== filterStep) return;
      const current = map.get(step) || [];
      current.push(o);
      map.set(step, current);
    });
    return Array.from(map.entries()).sort((a: [number, any], b: [number, any]) => a[0] - b[0]);
  }, [outfits, filterStep]);

  const stepsAvailable = useMemo(() => 
    Array.from(new Set(outfits.map(o => o.evolutionStep))).sort((a: number, b: number) => a - b),
  [outfits]);

  if (!baseImage) {
    return (
      <div className="h-full w-full bg-zinc-950 flex flex-col items-center justify-center p-12 text-center space-y-6 overflow-y-auto">
        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-slate-700 animate-pulse">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-[0.5em] text-white/20">Archive Offline</h3>
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest max-w-xs leading-relaxed">Inyecta un ADN Base para iniciar el archivo evolutivo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-zinc-950 flex flex-col overflow-hidden">
      
      {/* HEADER DE LABORATORIO */}
      <header className="shrink-0 z-50 px-4 sm:px-10 py-4 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 border-b border-white/5 bg-zinc-950/40 backdrop-blur-xl">
        <div className="flex flex-col gap-1 items-center sm:items-start text-center sm:text-left">
          <h2 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] sm:tracking-[0.6em] text-white">Genetic Evolution Archive</h2>
          <div className="flex items-center gap-3">
             <span className="flex items-center gap-1.5 text-[8px] font-bold text-indigo-400 uppercase tracking-widest">
               <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
               Live Database
             </span>
             <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Total Assets: {outfits.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 bg-white/5 p-1 rounded-2xl border border-white/5 overflow-x-auto max-w-[90vw] sm:max-w-full no-scrollbar">
          <button 
            onClick={() => setFilterStep('all')}
            className={`shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all ${filterStep === 'all' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
          >
            All
          </button>
          {stepsAvailable.slice(-4).map(step => (
            <button 
              key={step}
              onClick={() => setFilterStep(step)}
              className={`shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all ${filterStep === step ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              Step {step}
            </button>
          ))}
        </div>
      </header>

      {/* ÁREA DE VISUALIZACIÓN */}
      <div className="flex-1 overflow-auto relative no-scrollbar">
        <div className="min-h-full min-w-full flex flex-col items-center py-16 sm:py-32 px-4 sm:px-10 gap-20 sm:gap-40 relative pb-40 sm:pb-48">
          
          {/* ADN ORIGEN (ROOT) */}
          <div className="relative z-30">
            <div className="w-24 h-24 sm:w-40 sm:h-40 rounded-[3rem] sm:rounded-[4.5rem] border-2 border-indigo-600/30 bg-zinc-900 p-5 sm:p-10 relative group transition-all duration-700 hover:border-indigo-500">
              <div className="absolute inset-0 bg-indigo-600/10 blur-[100px] rounded-full opacity-40 group-hover:opacity-100 transition-opacity" />
              <img 
                src={baseImage} 
                className="w-full h-full object-contain relative z-10 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" 
                style={{ imageRendering: 'pixelated' }} 
                alt="Source DNA" 
              />
              <div className="absolute -top-10 sm:-top-14 left-1/2 -translate-x-1/2 text-[8px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-[0.8em] whitespace-nowrap opacity-60">Neural Root</div>
              
              {/* Conector Vertical Principal */}
              <div className="absolute -bottom-16 sm:-bottom-24 left-1/2 -translate-x-1/2 w-[2px] h-16 sm:h-24 bg-gradient-to-b from-indigo-500/50 via-indigo-500/10 to-transparent" />
            </div>
          </div>

          {/* NIVELES DE EVOLUCIÓN */}
          {levels.map(([step, nodes], idx) => (
            <div key={step} className="flex flex-col items-center gap-20 sm:gap-40 w-full animate-in zoom-in-95 duration-700">
              <div className="flex gap-6 sm:gap-20 justify-center flex-wrap max-w-7xl relative z-20 px-2 sm:px-10">
                {nodes.map(node => (
                  <div key={node.id} className="relative">
                    {/* Conector Genético dinámico */}
                    <div className="absolute -top-12 sm:-top-20 left-1/2 -translate-x-1/2 w-[1px] h-12 sm:h-20 bg-white/5 group-hover:bg-indigo-500/20" />
                    <TreeNode outfit={node} onSelect={onSelect} isActive={activeId === node.id} />
                  </div>
                ))}
              </div>
              
              {/* Conector al siguiente nivel */}
              {idx < levels.length - 1 && (
                <div className="w-px h-16 sm:h-24 bg-gradient-to-b from-indigo-500/10 to-indigo-500/5" />
              )}
            </div>
          ))}

          {/* Footer del Archivo */}
          <div className="h-40 sm:h-64 flex flex-col items-center justify-center opacity-10">
            <div className="w-px h-20 sm:h-32 bg-gradient-to-b from-white to-transparent" />
            <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-[1em] mt-6 sm:mt-10">End of Genomic Record</span>
          </div>
        </div>

        {/* Fondo Técnico */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] checker-bg z-0" />
        <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950 z-10" />
      </div>
    </div>
  );
};
