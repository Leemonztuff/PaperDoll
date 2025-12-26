
import React, { useRef, useState } from 'react';
import { QUICK_TAGS } from '../constants';

interface MainEditorProps {
  baseImage: string | null;
  parentImage: string | null;
  onUploadBase: (url: string) => void;
  isGenerating: boolean;
  onResetParent: () => void;
  mutationStrength: number;
  magentaActive: boolean;
  isSheetMode: boolean;
  prompt: string;
  setPrompt: (v: string) => void;
  onGenerate: () => void;
}

const MainEditor: React.FC<MainEditorProps> = ({ 
  baseImage, 
  parentImage, 
  onUploadBase, 
  isGenerating, 
  onResetParent, 
  mutationStrength, 
  magentaActive,
  prompt,
  setPrompt,
  onGenerate
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showBase, setShowBase] = useState(false);
  const [activeTab, setActiveTab] = useState(QUICK_TAGS[0].category);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onload = () => onUploadBase(r.result as string);
      r.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      
      {/* 1. STAGE (TOP 65%) */}
      <div className={`relative flex-1 flex items-center justify-center overflow-hidden transition-colors duration-700 ${magentaActive ? 'bg-[#FF00FF]' : 'bg-[#080808]'}`}>
        {!baseImage ? (
          <div 
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center p-12 text-center group"
          >
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 shadow-2xl border border-white/5 animate-pulse-slow">
              <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Cargar Maniquí</h3>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-2 max-w-[180px]">Sube un personaje base para comenzar la forja.</p>
          </div>
        ) : (
          <div className="relative w-full h-full p-4 flex items-center justify-center">
            {!magentaActive && <div className="absolute inset-0 opacity-[0.05] pointer-events-none checker-bg" />}
            
            <img 
              src={baseImage} 
              className={`max-h-full max-w-full object-contain transition-all duration-500 ${parentImage && !showBase ? 'opacity-10 blur-xl grayscale' : 'opacity-100'}`} 
            />
            
            {parentImage && !showBase && (
              <img 
                src={parentImage} 
                className="absolute max-h-[85%] max-w-[85%] object-contain drop-shadow-[0_0_50px_rgba(79,70,229,0.3)] animate-in zoom-in-95" 
              />
            )}

            {/* Stage Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-xl p-1 rounded-2xl border border-white/10 shadow-2xl">
              <button 
                onPointerDown={() => setShowBase(true)}
                onPointerUp={() => setShowBase(false)}
                onPointerLeave={() => setShowBase(false)}
                className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-white"
              >
                👁 Peek Base
              </button>
              {parentImage && (
                <>
                  <div className="w-px h-3 bg-white/10" />
                  <button 
                    onClick={onResetParent}
                    className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-red-400"
                  >
                    ✕ Reset
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in">
            <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <span className="text-[9px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Sintetizando...</span>
          </div>
        )}
      </div>

      {/* 2. THUMB DOCK (BOTTOM 35%) */}
      <div className={`h-[380px] bg-slate-900/60 backdrop-blur-3xl border-t border-white/5 p-6 flex flex-col gap-6 transition-all duration-500 ${!baseImage ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        
        <div className="relative">
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe el equipamiento..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[13px] text-white min-h-[100px] outline-none resize-none"
          />
        </div>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="flex gap-4 overflow-x-auto no-scrollbar border-b border-white/5 pb-2">
            {QUICK_TAGS.map(cat => (
              <button 
                key={cat.category}
                onClick={() => setActiveTab(cat.category)}
                className={`whitespace-nowrap text-[9px] font-black uppercase tracking-widest pb-2 ${activeTab === cat.category ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-600'}`}
              >
                {cat.category.split(':')[1] || cat.category}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-wrap gap-2 content-start">
            {QUICK_TAGS.find(c => c.category === activeTab)?.tags.map(tag => (
              <button 
                key={tag}
                onClick={() => {
                  const newPrompt = prompt.trim() ? `${prompt.trim()}, ${tag}` : tag;
                  if (!prompt.includes(tag)) setPrompt(newPrompt);
                }}
                className="px-3 py-1.5 bg-white/5 rounded-lg text-[9px] font-bold text-slate-400 border border-white/5 active:bg-indigo-600 active:text-white"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={onGenerate}
          disabled={isGenerating || !baseImage}
          className="w-full py-5 bg-indigo-600 rounded-2xl font-black text-[11px] tracking-[0.4em] uppercase shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all"
        >
          {isGenerating ? 'Procesando...' : 'Equipar Asset'}
        </button>
      </div>

      <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleUpload} />
    </div>
  );
};

export default MainEditor;
