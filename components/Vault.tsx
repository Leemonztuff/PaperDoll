
import React, { useState } from 'react';
import { GeneratedOutfit } from '../types';
import { IconButton } from './UI';

interface VaultProps {
  outfits: GeneratedOutfit[];
  activeId?: string;
  onSelect: (o: GeneratedOutfit) => void;
  onDelete: (id: string) => void;
}

export const Vault: React.FC<VaultProps> = ({ outfits, activeId, onSelect, onDelete }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleExportSpriteSheet = async () => {
    if (selectedIds.length === 0) return;
    
    const selectedOutfits = outfits.filter(o => selectedIds.includes(o.id));
    const canvas = document.createElement('canvas');
    const size = 256; // Supongamos tamaño estándar de salida
    canvas.width = size * selectedOutfits.length;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    for (let i = 0; i < selectedOutfits.length; i++) {
      const img = new Image();
      img.src = selectedOutfits[i].url;
      await new Promise(resolve => img.onload = resolve);
      ctx.drawImage(img, i * size, 0, size, size);
    }

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `spritesheet-rpg-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-12 no-scrollbar bg-[#020202]">
      {selectedIds.length > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[500] bg-indigo-600 px-8 py-4 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10">
          <span className="text-[10px] font-black uppercase text-white tracking-widest">{selectedIds.length} Assets Seleccionados</span>
          <button onClick={handleExportSpriteSheet} className="px-6 py-2 bg-white text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-slate-100">Exportar SpriteSheet</button>
          <button onClick={() => setSelectedIds([])} className="text-white/60 hover:text-white text-[9px] font-black uppercase">Cancelar</button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-[1600px] mx-auto">
        {outfits.map((outfit) => (
          <div
            key={outfit.id}
            onClick={() => onSelect(outfit)}
            className={`group relative flex flex-col rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer overflow-hidden ${
              selectedIds.includes(outfit.id) ? 'border-emerald-500' : activeId === outfit.id ? 'border-indigo-500 scale-[1.02]' : 'border-white/5'
            }`}
          >
            <div className="relative aspect-square flex items-center justify-center p-6">
              <button onClick={(e) => toggleSelect(e, outfit.id)} className={`absolute top-4 left-4 w-6 h-6 rounded-lg border-2 z-40 transition-all ${selectedIds.includes(outfit.id) ? 'bg-emerald-500 border-emerald-400' : 'bg-black/40 border-white/20'}`}>
                {selectedIds.includes(outfit.id) && <svg className="w-4 h-4 text-white mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </button>

              <img src={outfit.url} className="w-full h-full object-contain relative z-10 group-hover:scale-125" style={{ imageRendering: 'pixelated' }} alt="Sprite" />
            </div>

            <div className="p-4 mt-auto bg-black/40 backdrop-blur-sm border-t border-white/5">
              <p className="text-[8px] font-black text-white uppercase truncate">{outfit.prompt || "Raw DNA"}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[6px] font-bold text-slate-500 uppercase tracking-widest">Step {outfit.evolutionStep}</span>
                <button onClick={(e) => { e.stopPropagation(); onDelete(outfit.id); }} className="text-red-500/50 hover:text-red-500 text-[8px] font-bold uppercase">Borrar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
