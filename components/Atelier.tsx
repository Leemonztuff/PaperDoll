
import React, { useState, useRef } from 'react';
import { AppState, ForgeMode, NeuralMacro } from '../types';
import { QUICK_TAGS } from '../constants';
import { IconButton, Tag, Loader, ComparisonSlider, NeuralLog, Slider } from './UI';
import { GeminiService } from '../services/geminiService';

interface AtelierProps {
  state: AppState;
  prompt: string;
  setPrompt: (v: string) => void;
  onUpload: (url: string) => void;
  onForge: () => void;
  onExtractBase: (url: string) => void;
  onResetParent: () => void;
  onUpdateMutation: (v: number) => void;
  onSetMode: (mode: ForgeMode) => void;
  onApplyMacro: (macro: NeuralMacro) => void;
  onPromoteToBase: (url: string) => void;
  hasApiKey: boolean;
}

export const Atelier: React.FC<AtelierProps> = ({ 
  state, prompt, setPrompt, onUpload, onForge, onExtractBase, onResetParent, onUpdateMutation, onSetMode, onApplyMacro, onPromoteToBase, hasApiKey
}) => {
  const [isAlchemizing, setIsAlchemizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAlchemy = async () => {
    if (!prompt) return;
    setIsAlchemizing(true);
    try {
      const enhanced = await GeminiService.enhancePrompt(prompt);
      setPrompt(enhanced);
    } finally {
      setIsAlchemizing(false);
    }
  };

  if (!state.baseImage) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-[#050505]">
        <div className="max-w-xs w-full text-center space-y-10">
          <div className="space-y-3">
            <h2 className="text-xl font-black uppercase tracking-[0.3em] text-white">Sprite Source</h2>
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest leading-loose">Sube el personaje base o maniquí sobre el que quieres diseñar.</p>
          </div>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-square border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02] flex flex-col items-center justify-center group hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all active:scale-95"
          >
            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 group-hover:text-white">Cargar Personaje</span>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => onUpload(reader.result as string);
                reader.readAsDataURL(file);
              }
            }} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#020202] overflow-hidden">
      
      {/* CANVAS CENTRAL */}
      <div className="flex-1 relative bg-[#080808] overflow-hidden">
        <div className="absolute inset-0 checker-bg opacity-[0.02]" />
        
        {/* HUD */}
        <div className="absolute top-8 left-8 z-30 flex items-center gap-4">
          <div className="bg-black/60 backdrop-blur-xl border border-white/5 px-6 py-2.5 rounded-full flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full ${state.isGenerating ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`} />
             <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/60">
               {state.isGenerating ? 'Forjando...' : 'Sistema Listo'}
             </span>
          </div>
          {state.activeParent && (
             <button onClick={onResetParent} className="bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-full text-[8px] font-black uppercase tracking-[0.3em] border border-white/5">
               Reiniciar Vista
             </button>
          )}
        </div>

        <div className="absolute inset-0 flex items-center justify-center p-12">
           {state.activeParent ? (
             <ComparisonSlider before={state.baseImage} after={state.activeParent.url} className="max-w-[70%] max-h-[70%]" />
           ) : (
             <div className="relative group">
                <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] opacity-20" />
                <img 
                  src={state.baseImage} 
                  className="max-h-[60vh] object-contain relative z-10 scale-[2] shadow-2xl" 
                  style={{ imageRendering: 'pixelated' }}
                  alt="Base" 
                />
             </div>
           )}
        </div>

        <NeuralLog active={state.isGenerating} />
        {state.isGenerating && <Loader message="Sintetizando Assets..." />}
      </div>

      {/* PANEL DE CONTROL */}
      <aside className="md:w-[420px] bg-[#050505] border-l border-white/5 p-8 flex flex-col gap-10 shrink-0 overflow-y-auto no-scrollbar">
        
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Atuendo / Equipo</h4>
            <button 
              onClick={handleAlchemy} 
              disabled={isAlchemizing || !prompt}
              className={`text-[8px] font-black uppercase tracking-widest transition-all ${isAlchemizing ? 'text-indigo-400 animate-pulse' : 'text-slate-600 hover:text-white'}`}
            >
              Mago de Prompts
            </button>
          </div>
          <textarea 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe la armadura, ropa o accesorios..."
            className="w-full h-32 bg-white/[0.03] border border-white/10 rounded-3xl p-6 text-sm text-white focus:border-indigo-500/40 focus:bg-white/[0.05] outline-none transition-all resize-none font-medium placeholder:text-slate-700"
          />
        </section>

        <section className="space-y-4">
          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600">Paleta de Estilo</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_TAGS[0].tags.map(tag => (
              <Tag key={tag} label={tag} onClick={() => setPrompt(prompt ? `${prompt}, ${tag}` : tag)} />
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <Slider 
            label="Intensidad Creativa" 
            value={state.config.mutationStrength} 
            min={0} max={100} 
            onChange={onUpdateMutation} 
          />
        </section>

        <div className="mt-auto space-y-4">
          {state.error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-[8px] font-bold uppercase text-center">
              {state.error}
            </div>
          )}

          <button 
            onClick={onForge}
            disabled={state.isGenerating || !prompt}
            className={`w-full py-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.4em] text-white shadow-2xl transition-all ${state.isGenerating || !prompt ? 'bg-white/5 text-slate-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 hover:-translate-y-1'}`}
          >
            {state.isGenerating ? 'Generando...' : 'Forjar Atuendo'}
          </button>
          
          <p className="text-[7px] font-bold text-slate-700 uppercase tracking-widest text-center">Output: Game-Ready Asset (Pixel Art)</p>
        </div>
      </aside>
    </div>
  );
};
