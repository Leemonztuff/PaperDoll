
import React, { useState } from 'react';
import { GeneratedOutfit } from '../types';
import { IconButton } from './UI';

interface ImageModalProps {
  outfit: GeneratedOutfit;
  onClose: () => void;
  onDelete: (id: string) => void;
  onSelectAsParent: (o: GeneratedOutfit) => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ outfit, onClose, onDelete, onSelectAsParent }) => {
  const [zoom, setZoom] = useState(1);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = outfit.url;
    link.download = `spriteforge-asset-${outfit.id.slice(0, 5)}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl" onClick={onClose} />
      
      {/* HUD de Acción Superior */}
      <div className="relative z-10 h-20 px-6 sm:px-10 flex items-center justify-between border-b border-white/5 bg-black/40">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Neural Asset Review</span>
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            Gen: Step {outfit.evolutionStep} • ID: {outfit.id.slice(0, 8)}
          </span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <IconButton onClick={handleDownload} variant="primary" className="bg-white/5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </IconButton>
          <IconButton onClick={() => { onSelectAsParent(outfit); onClose(); }} variant="secondary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </IconButton>
          <IconButton onClick={() => { if(confirm('Erase from neural archive?')) { onDelete(outfit.id); onClose(); } }} variant="danger">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </IconButton>
          <IconButton onClick={onClose} className="bg-white/10 ml-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </IconButton>
        </div>
      </div>

      {/* Visor de Alta Resolución */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden touch-none">
        <div className="absolute inset-0 opacity-[0.05] checker-bg pointer-events-none" />
        
        <div className="relative flex items-center justify-center w-full h-full p-10 overflow-auto no-scrollbar">
          <img 
            src={outfit.url} 
            style={{ 
              transform: `scale(${zoom})`, 
              imageRendering: 'pixelated',
              transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)'
            }}
            className="max-h-[90%] max-w-[90%] object-contain drop-shadow-[0_0_80px_rgba(79,70,229,0.3)] select-none pointer-events-none" 
            alt="Asset Inspection" 
          />
        </div>

        {/* Zoom Overlay Control */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-2xl px-6 py-4 rounded-[2rem] border border-white/10 flex items-center gap-6 shadow-2xl">
          <button onClick={() => setZoom(Math.max(1, zoom - 1))} className="text-white/40 hover:text-white p-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
          </button>
          <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{zoom}X</span>
            <span className="text-[7px] font-bold text-slate-500 uppercase">Neural Mag</span>
          </div>
          <button onClick={() => setZoom(Math.min(8, zoom + 1))} className="text-white/40 hover:text-white p-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
      </div>

      {/* Info Contextual Footer */}
      <div className="bg-[#050505] p-8 sm:p-12 text-center border-t border-white/5">
        <p className="text-[11px] font-medium text-slate-500 italic leading-relaxed max-w-xl mx-auto uppercase tracking-wider bg-black/40 p-4 rounded-2xl border border-white/5">
          "{outfit.prompt || "No directive stored."}"
        </p>
      </div>
    </div>
  );
};
