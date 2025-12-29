
import React from 'react';
import { GeneratedOutfit } from '../types';
import { IconButton } from './UI';

interface VaultProps {
  outfits: GeneratedOutfit[];
  activeId?: string;
  onSelect: (o: GeneratedOutfit) => void;
  onDelete: (id: string) => void;
}

const formatDate = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Recién forjado';
  if (minutes < 60) return `Hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;
  return new Date(timestamp).toLocaleDateString();
};

export const Vault: React.FC<VaultProps> = ({ outfits, activeId, onSelect, onDelete }) => {
  return (
    <div className="h-full overflow-y-auto p-6 md:p-12 no-scrollbar bg-[#020202]">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-10 max-w-[1600px] mx-auto">
        {outfits.map((outfit) => (
          <div
            key={outfit.id}
            onClick={() => onSelect(outfit)}
            className={`group relative flex flex-col rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer overflow-hidden ${
              activeId === outfit.id
                ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_50px_rgba(99,102,241,0.2)] scale-[1.02]'
                : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05] hover:translate-y-[-4px]'
            }`}
          >
            {/* Fondo de Profundidad */}
            <div className="absolute inset-0 opacity-[0.02] checker-bg pointer-events-none" />
            
            {/* Contenedor de Imagen */}
            <div className="relative aspect-square flex items-center justify-center p-6 sm:p-10">
              <img
                src={outfit.url}
                className="w-full h-full object-contain relative z-10 transition-transform duration-700 group-hover:scale-125 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
                style={{ imageRendering: 'pixelated' }}
                alt="Sprite Asset"
              />
              
              {/* Badge de Evolución */}
              <div className="absolute top-4 left-4 flex flex-col items-start gap-1 z-20">
                <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[7px] font-black text-indigo-400 border border-indigo-500/30 uppercase tracking-[0.2em]">
                  Gen {outfit.evolutionStep}
                </span>
                <span className="px-2 py-0.5 bg-black/40 text-[6px] font-bold text-slate-500 uppercase tracking-widest rounded">
                  {outfit.mode}
                </span>
              </div>

              {/* Acciones Rápidas (Overlay) */}
              <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 flex flex-col gap-2">
                <IconButton
                  variant="danger"
                  onClick={() => onDelete(outfit.id)}
                  className="w-8 h-8 rounded-lg bg-red-500/10 border-red-500/20"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </IconButton>
              </div>
            </div>

            {/* Info Panel Inferior */}
            <div className="p-5 mt-auto border-t border-white/5 bg-black/20 backdrop-blur-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col overflow-hidden">
                  <p className="text-[9px] font-black text-white uppercase tracking-widest truncate group-hover:text-indigo-400 transition-colors">
                    {outfit.prompt || "Raw Evolution"}
                  </p>
                  <p className="text-[7px] font-bold text-slate-600 uppercase mt-1">
                    {formatDate(outfit.timestamp)}
                  </p>
                </div>
              </div>
              
              {/* Visualizador de Modelo (Mini-tag) */}
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/[0.03]">
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                <span className="text-[6px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  Neural Processor v2.5
                </span>
              </div>
            </div>

            {/* Borde Animado de Selección */}
            {activeId === outfit.id && (
              <div className="absolute inset-0 border-2 border-indigo-500/50 rounded-[2.5rem] pointer-events-none animate-pulse" />
            )}
          </div>
        ))}

        {/* Estado Vacío */}
        {outfits.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-40 animate-in fade-in zoom-in-95 duration-700">
            <div className="relative mb-8">
              <div className="w-32 h-32 border-2 border-dashed border-white/5 rounded-full animate-spin-slow" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-12 h-12 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-white mb-2">Archivo Inactivo</h3>
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest text-center max-w-xs leading-relaxed">
              No se han detectado secuencias de ADN guardadas. Inicia una nueva forja en el Atelier.
            </p>
          </div>
        )}
      </div>
      
      {/* Footer del Archivo */}
      {outfits.length > 0 && (
        <div className="mt-20 flex flex-col items-center gap-4 opacity-30 pb-12">
          <div className="h-px w-24 bg-white/10" />
          <span className="text-[8px] font-black uppercase tracking-[0.6em]">Fin del Registro de Datos</span>
        </div>
      )}
    </div>
  );
};
