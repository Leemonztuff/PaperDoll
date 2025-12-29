
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { AppState, ForgeMode, NeuralMacro } from '../types';
import { QUICK_TAGS, ANATOMICAL_MACROS } from '../constants';
import { IconButton, Tag, Loader, ComparisonSlider, NeuralLog, Slider, InfoBadge } from './UI';

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
}

const MacroIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'ENHANCE':
      return (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 8l-4-4-4 4" />
        </svg>
      );
    case 'REDUCE':
      return (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 16l4 4 4-4" />
        </svg>
      );
    case 'LOCK':
      return (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    default:
      return null;
  }
};

export const Atelier: React.FC<AtelierProps> = ({ 
  state, prompt, setPrompt, onUpload, onForge, onExtractBase, onResetParent, onUpdateMutation, onSetMode, onApplyMacro, onPromoteToBase
}) => {
  const [activeCategory, setActiveCategory] = useState(QUICK_TAGS[0].category);
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [mobilePhase, setMobilePhase] = useState<'config' | 'directive'>('directive');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const backgroundTheme = useMemo(() => {
    const bg = state.config.protocols.backgroundStyle;
    if (bg === 'magenta') return 'bg-[#FF00FF]';
    if (bg === 'white') return 'bg-white';
    return 'bg-[#0a0a0a]';
  }, [state.config.protocols.backgroundStyle]);

  const handleDownload = () => {
    const url = state.activeParent?.url || state.baseImage;
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `spriteforge-${Date.now()}.png`;
    link.click();
  };

  const currentStatusText = useMemo(() => {
    if (!state.baseImage) return "Esperando carga de personaje";
    if (!prompt) return "Escribe un atuendo para comenzar";
    if (state.isGenerating) return "Sintetizando píxeles...";
    return "Listo para forjar";
  }, [state.baseImage, prompt, state.isGenerating]);

  if (!state.baseImage) {
    return (
      <div className="absolute inset-0 bg-[#050505] overflow-y-auto overflow-x-hidden safe-top safe-bottom">
        <div className="min-h-full flex flex-col items-center p-8 pb-32 md:justify-center">
          <div className="mb-12 text-center max-w-xs shrink-0">
            <h2 className="text-[14px] font-black uppercase tracking-[0.5em] text-white mb-3">Protocolo de Inicio</h2>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
              Sigue estos pasos para crear tu primer atuendo RPG con IA.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-12 shrink-0">
            {[
              { step: 1, title: "Carga Base", desc: "Sube un sprite o maniquí base" },
              { step: 2, title: "Define Estilo", desc: "Elige una clase o describe un equipo" },
              { step: 3, title: "Forja ADN", desc: "La IA generará el sprite pixel-perfect" }
            ].map(s => (
              <div key={s.step} className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col items-center text-center shadow-lg shadow-black/50">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-[12px] font-black text-white mb-4 shadow-lg shadow-indigo-600/30">
                  {s.step}
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-white mb-2">{s.title}</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="group relative w-full max-w-sm h-64 border-2 border-dashed border-indigo-500/20 rounded-[3rem] bg-indigo-500/5 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-500/10 transition-all active:scale-[0.98] shrink-0"
          >
            <div className="w-20 h-20 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-2xl shadow-indigo-600/40 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <span className="text-[13px] font-black uppercase tracking-[0.4em] text-white">Subir Personaje Base</span>
            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-2">Formatos: PNG, JPG (Max 5MB)</span>
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

  const PhaseNavigation = () => (
    <div className="flex bg-white/5 p-1 rounded-2xl mb-4 shrink-0">
      <button 
        onClick={() => setMobilePhase('directive')}
        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${mobilePhase === 'directive' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500'}`}
      >
        Descripción (Paso 1)
      </button>
      <button 
        onClick={() => setMobilePhase('config')}
        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${mobilePhase === 'config' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500'}`}
      >
        Ajustes IA (Paso 2)
      </button>
    </div>
  );

  const ConfigurationModule = () => (
    <div className="flex flex-col gap-8 py-4 animate-in fade-in slide-in-from-left-4 duration-300">
      <Slider 
        label="Nivel de Creatividad" 
        description="A mayor porcentaje, la IA tomará más libertades artísticas"
        value={state.config.mutationStrength} min={0} max={100} onChange={onUpdateMutation} 
      />
      
      <div className="space-y-4">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 px-1">Calidad de Síntesis</span>
        <div className="grid grid-cols-2 gap-3">
          {(['Draft', 'Master'] as ForgeMode[]).map(mode => (
            <button 
              key={mode} onClick={() => onSetMode(mode)}
              className={`py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${state.config.mode === mode ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-white/5 border-transparent text-slate-600'}`}
            >
              <div className="flex flex-col">
                <span>{mode}</span>
                <span className="text-[6px] opacity-60 mt-1">{mode === 'Draft' ? 'Rápido / Test' : 'Alta Precisión'}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const DirectiveModule = () => (
    <div className="flex flex-col gap-4 flex-1 min-h-0 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="relative group flex-1 min-h-[120px]">
        <textarea 
          value={prompt} onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ejemplo: Armadura de caballero pesado, detalles dorados, capa roja, estética pixel-art 16 bits..."
          className="w-full h-full bg-black/40 border border-white/5 rounded-2xl p-5 text-[15px] text-white focus:border-indigo-500/40 transition-all outline-none resize-none font-medium placeholder:text-slate-700 no-scrollbar"
        />
        {prompt && (
          <button 
            onClick={() => setPrompt('')}
            className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-slate-500 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>
      
      <div className="flex flex-col gap-3 shrink-0">
        <div className="flex justify-between items-center">
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Sugerencias rápidas</span>
          <span className="text-[7px] font-bold uppercase text-indigo-400">Toca para añadir</span>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar border-b border-white/5 pb-1">
          {QUICK_TAGS.map(cat => (
            <button 
              key={cat.category} onClick={() => setActiveCategory(cat.category)}
              className={`whitespace-nowrap text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] pb-2 transition-all ${activeCategory === cat.category ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-600'}`}
            >
              {cat.category}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 overflow-y-auto max-h-24 md:max-h-none no-scrollbar">
          {QUICK_TAGS.find(c => c.category === activeCategory)?.tags.map(tag => (
            <Tag key={tag} label={tag} onClick={() => setPrompt(prompt ? `${prompt}, ${tag}` : tag)} />
          ))}
        </div>
      </div>
    </div>
  );

  const ExecutionModule = () => (
    <button 
      onClick={onForge} disabled={state.isGenerating || !prompt}
      className={`w-full py-5 rounded-2xl font-black text-[13px] uppercase tracking-[0.4em] text-white shadow-2xl active:scale-[0.97] transition-all shrink-0 border border-indigo-400/20 ${!prompt ? 'bg-slate-900 cursor-not-allowed opacity-50' : 'bg-indigo-600 hover:bg-indigo-500 animate-pulse-slow'}`}
    >
      {state.isGenerating ? (
        <div className="flex items-center justify-center gap-3">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      ) : (prompt ? 'Forjar Ahora' : 'Falta Descripción')}
    </button>
  );

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-black">
      {/* 1. VIEWPORT */}
      <div className={`flex-1 relative overflow-hidden transition-colors duration-500 ${backgroundTheme}`}>
        <div className="absolute inset-0 opacity-[0.05] checker-bg pointer-events-none" />
        
        <div className="absolute top-12 left-6 right-6 flex justify-between items-start z-30 safe-top">
          <div className="flex flex-col gap-2">
            <div className={`px-4 py-2 rounded-full border bg-black/60 backdrop-blur-md flex items-center gap-3 ${state.isGenerating ? 'border-indigo-500/50' : 'border-white/10'}`}>
              <div className={`w-2 h-2 rounded-full ${state.isGenerating ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`} />
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">{currentStatusText}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {state.activeParent && (
                <InfoBadge text={`Evolución ${state.activeParent.evolutionStep}`} />
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            {state.activeParent && (
              <IconButton 
                variant="success" 
                title="Convertir en nueva base"
                onClick={() => onPromoteToBase(state.activeParent!.url)} 
                className="bg-black/40 backdrop-blur-md rounded-2xl w-12 h-12 border-emerald-500/30"
              >
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 11l7-7 7 7M5 19l7-7 7 7" /></svg>
              </IconButton>
            )}
            <IconButton variant="primary" title="Reiniciar base" onClick={onResetParent} className="bg-black/40 backdrop-blur-md rounded-2xl w-12 h-12">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </IconButton>
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center p-4">
          {state.activeParent ? (
            <ComparisonSlider before={state.baseImage} after={state.activeParent.url} className="w-full h-full" />
          ) : (
            <div className="relative group">
               <img 
                src={state.baseImage} 
                style={{ imageRendering: 'pixelated', transform: isDesktop ? 'scale(2.5)' : 'scale(1.8)' }}
                className="max-h-[70%] max-w-[80%] object-contain relative z-10 transition-transform duration-1000" 
                alt="Sujeto de prueba" 
              />
              <div className="absolute inset-0 bg-indigo-500/5 blur-[40px] rounded-full group-hover:bg-indigo-500/10 transition-colors" />
            </div>
          )}
        </div>

        <div className="absolute left-6 md:left-8 bottom-[140px] md:bottom-1/2 md:translate-y-1/2 flex flex-col gap-6 z-40">
          <div className="hidden md:block mb-2 px-2">
            <span className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-600 vertical-text">Morphology</span>
          </div>
          {ANATOMICAL_MACROS.map(macro => (
            <div key={macro.id} className="flex flex-col items-center gap-2 group">
              <button 
                title={macro.description}
                onClick={() => onApplyMacro(macro)}
                className={`w-14 md:w-16 h-14 md:h-16 rounded-2xl flex items-center justify-center backdrop-blur-2xl border transition-all active:scale-90 shadow-2xl ${state.config.activeMacroId === macro.id ? `bg-indigo-600 border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.6)]` : 'bg-black/60 border-white/10 hover:border-white/30'}`}
              >
                <MacroIcon type={macro.icon} />
              </button>
              <span className={`text-[6px] font-black uppercase tracking-widest text-center max-w-[50px] transition-opacity ${state.config.activeMacroId === macro.id ? 'text-indigo-400' : 'text-slate-500 opacity-60'}`}>
                {macro.name}
              </span>
            </div>
          ))}
        </div>

        <NeuralLog active={state.isGenerating} />
        {state.isGenerating && <Loader message="Procesando ADN Digital..." />}
      </div>

      {isDesktop ? (
        <aside className="w-[450px] bg-[#080808] border-l border-white/5 p-10 flex flex-col gap-8 shrink-0 relative z-[100] shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
           <div className="flex flex-col gap-2 mb-2">
             <div className="flex items-center gap-4">
               <div className="w-10 h-1 bg-indigo-600 rounded-full" />
               <span className="text-[12px] font-black uppercase tracking-[0.4em] text-white">Laboratorio Neural</span>
             </div>
             <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest px-14">Diseño y Evolución de Equipamiento</p>
           </div>
           
           <div className="flex-1 flex flex-col gap-8 overflow-y-auto no-scrollbar pr-2">
            <ConfigurationModule />
            <div className="h-px bg-white/5" />
            <DirectiveModule />
           </div>
           <ExecutionModule />
        </aside>
      ) : (
        <div className={`bg-[#080808] border-t border-white/10 flex flex-col transition-all duration-700 cubic-bezier(0.2, 0, 0, 1) z-[100] safe-bottom ${isControlsExpanded ? 'h-[85vh]' : 'h-[120px]'}`}>
          
          <div 
            onClick={() => setIsControlsExpanded(!isControlsExpanded)}
            className="h-10 flex flex-col items-center justify-center cursor-pointer group shrink-0"
          >
            <div className={`w-12 h-1.5 rounded-full transition-all duration-300 ${isControlsExpanded ? 'bg-indigo-500 mb-2' : 'bg-white/10 group-active:bg-indigo-400'}`} />
            {!isControlsExpanded && (
               <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-600 animate-pulse">Toca para abrir controles</span>
            )}
          </div>

          <div className={`flex-1 flex flex-col px-6 pb-6 overflow-hidden transition-opacity duration-300 ${isControlsExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <PhaseNavigation />
            
            <div className="flex-1 overflow-y-auto no-scrollbar mb-6">
              {mobilePhase === 'directive' ? <DirectiveModule /> : <ConfigurationModule />}
            </div>

            <ExecutionModule />
          </div>
        </div>
      )}
    </div>
  );
};
