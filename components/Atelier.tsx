
import React, { useState, useRef } from 'react';
import { AppState, ForgeMode, NeuralMacro, NeuralNode } from '../types';
import { QUICK_TAGS } from '../constants';
import { IconButton, Tag, Loader, ComparisonSlider, NeuralLog, Slider, InfoBadge } from './UI';
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
  onToggleNode: (id: string) => void;
  onSetMode: (mode: ForgeMode) => void;
  onApplyMacro: (macro: NeuralMacro) => void;
  onPromoteToBase: (url: string) => void;
  onGenerateMannequin: () => void;
  hasApiKey: boolean;
}

export const Atelier: React.FC<AtelierProps> = ({ 
  state, prompt, setPrompt, onUpload, onForge, onExtractBase, onResetParent, onUpdateMutation, onToggleNode, onSetMode, onApplyMacro, onPromoteToBase, onGenerateMannequin, hasApiKey
}) => {
  const [isAlchemizing, setIsAlchemizing] = useState(false);
  const [showModules, setShowModules] = useState(false);
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
      <div className="h-full w-full overflow-y-auto bg-zinc-900 flex flex-col items-center p-8 pb-32 no-scrollbar">
        <div className="max-w-xl w-full text-center space-y-12 py-16 reveal-view">
          <div className="space-y-4">
            <h2 className="text-3xl font-black uppercase tracking-[0.5em] text-white">GENETIC SOURCE</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-loose max-w-sm mx-auto">
              Define el ADN de tu personaje. Un maniquí base sin ropa es necesario para proyectar equipo.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full px-4">
            <SourceCard 
              onClick={() => fileInputRef.current?.click()}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />}
              label="Upload Asset"
              sublabel="Extract DNA from image"
            />
            <SourceCard 
              onClick={onGenerateMannequin}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />}
              label="Forge Base"
              sublabel="Generate neural mannequin"
              highlight
            />
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => onUpload(reader.result as string);
                  reader.readAsDataURL(file);
                }
            }} />
          </div>
          {state.isGenerating && <Loader message="Generating Base..." subMessage="Neural Stabilization in Progress" />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full bg-zinc-900 relative overflow-hidden">
      {/* VISOR (AREA SUPERIOR EN MOBILE, LADO IZQUIERDO EN DESKTOP) */}
      <div className="w-full h-[35vh] md:h-full md:flex-1 relative bg-zinc-950/30 shrink-0 border-b md:border-b-0 border-white/5 overflow-hidden sticky top-0 md:static z-10">
        <div className="absolute inset-0 checker-bg opacity-[0.03]" />
        
        {/* HUD OVERLAY */}
        <div className="absolute top-4 md:top-6 left-4 md:left-6 right-4 md:right-6 z-30 flex items-center justify-between">
          <div className="flex gap-2 md:gap-3">
             <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full flex items-center gap-2 shadow-2xl">
                <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${state.isGenerating ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-white/80">
                  {state.isGenerating ? 'PROCESSING' : 'READY'}
                </span>
             </div>
             <InfoBadge text={state.activeParent ? "Branching" : "Root DNA"} />
          </div>
          <button onClick={() => onPromoteToBase(null as any)} className="bg-white/5 hover:bg-white/10 text-white/40 hover:text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-widest border border-white/5 transition-all">
            RESET ROOT
          </button>
        </div>

        {/* IMAGE RENDERER */}
        <div className="absolute inset-0 flex items-center justify-center p-6 md:p-20 pt-12 md:pt-20">
           {state.activeParent ? (
             <ComparisonSlider before={state.baseImage} after={state.activeParent.url} className="w-full h-full max-w-[95%] md:max-w-[85%] max-h-[95%] md:max-h-[90%]" />
           ) : (
             <div className="relative group flex items-center justify-center h-full w-full">
                <div className="absolute inset-0 bg-indigo-600/20 blur-[120px] opacity-10 pointer-events-none" />
                <img src={state.baseImage} className="max-h-full max-w-full object-contain relative z-10 scale-[1.2] sm:scale-[1.8] drop-shadow-[0_0_80px_rgba(99,102,241,0.25)] transition-transform duration-1000 group-hover:scale-[1.4] md:group-hover:scale-[1.9] pixelated" alt="Base DNA" />
             </div>
           )}
        </div>

        <NeuralLog active={state.isGenerating} />
        {state.isGenerating && <Loader message="Forging Gear..." subMessage="Phase 1: Projecting Material Shaders" />}
      </div>

      {/* TOOLS (SCROLLABLE AREA EN MOBILE, LADO DERECHO EN DESKTOP) */}
      <div className="flex-1 md:w-[420px] bg-zinc-800/50 md:border-l border-white/5 overflow-y-auto no-scrollbar relative flex flex-col z-20 rounded-t-3xl md:rounded-none -mt-6 md:mt-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-none">
        <div className="p-5 md:p-8 space-y-8 md:space-y-10 flex-1">
           {/* MOBILE DRAG HANDLE */}
           <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto md:hidden mb-2" />

           {/* TELEMETRY */}
           <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl">
             <div className="flex justify-between items-center">
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Neural Pipeline</span>
               <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded">{state.activeParent ? 'EVOLUTION' : 'GENESIS'}</span>
             </div>
             <div className="grid grid-cols-2 gap-4 pt-2">
               <TelemetryItem label="Genetic Lock" value="98% STABLE" color="text-emerald-500" />
               <TelemetryItem label="Asset Mode" value="PIXEL HD" />
             </div>
           </section>

           {/* PROMPT BOX */}
           <section className="space-y-4">
             <div className="flex justify-between items-center px-1">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Directive</h4>
               <button onClick={handleAlchemy} disabled={isAlchemizing || !prompt} className={`text-[8px] font-black uppercase tracking-widest transition-all ${isAlchemizing ? 'text-indigo-400 animate-pulse' : 'text-slate-600 hover:text-white'}`}>AI Assist</button>
             </div>
             <textarea 
               value={prompt} 
               onChange={(e) => setPrompt(e.target.value)} 
               placeholder="Specify gear: 'Steel plate armor with glowing runes'..." 
               className="w-full h-32 md:h-36 bg-white/[0.03] border border-white/10 rounded-2xl p-5 md:p-6 text-sm text-white focus:border-indigo-500/40 focus:bg-white/[0.05] outline-none transition-all resize-none placeholder:text-slate-700 shadow-inner"
             />
           </section>

           {/* NEURAL ARCHITECTURE (EXPERT CONTROL) */}
           <section className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Neural Chain</h4>
                <button 
                  onClick={() => setShowModules(!showModules)} 
                  className={`text-[8px] font-black uppercase tracking-widest transition-all ${showModules ? 'text-indigo-400' : 'text-slate-600 hover:text-white'}`}
                >
                  {showModules ? 'Hide Modules' : 'Configure Modules'}
                </button>
              </div>
              
              {showModules && (
                <div className="grid grid-cols-2 gap-2 md:gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  {state.config.neuralChain.map((node: NeuralNode) => (
                    <ModuleToggle 
                      key={node.id} 
                      node={node} 
                      onToggle={() => onToggleNode(node.id)} 
                    />
                  ))}
                </div>
              )}
           </section>

           {/* TEMPLATES */}
           <section className="space-y-4">
             <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600 px-1">Class Templates</p>
             <div className="flex flex-wrap gap-2">
               {QUICK_TAGS[0].tags.map(tag => (
                 <Tag key={tag} label={tag} onClick={() => setPrompt(prompt ? `${prompt}, ${tag}` : tag)} />
               ))}
             </div>
           </section>

           {/* MUTATION */}
           <section className="space-y-8">
             <Slider label="Genetic Mutation" value={state.config.mutationStrength} min={0} max={100} onChange={onUpdateMutation} />
           </section>
        </div>

        {/* STICKY FOOTER */}
        <div className="sticky bottom-0 left-0 right-0 p-4 pb-28 md:pb-8 md:p-8 bg-gradient-to-t from-zinc-900 via-zinc-900/95 to-transparent z-40 border-t border-white/5 backdrop-blur-md mt-auto">
           {state.error && (
             <div className="mb-3 md:mb-4 bg-red-500/10 border border-red-500/20 p-2 md:p-3 rounded-xl text-red-400 text-[8px] font-bold uppercase text-center animate-in slide-in-from-bottom-2">
               {state.error}
             </div>
           )}
           <button 
             onClick={onForge} 
             disabled={state.isGenerating || !prompt} 
             className={`w-full py-4 md:py-5 rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] text-white shadow-3xl transition-all ${state.isGenerating || !prompt ? 'bg-white/10 text-slate-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] shadow-indigo-600/40'}`}
           >
             {state.isGenerating ? 'FORGING...' : 'FORGE ASSET'}
           </button>
        </div>
      </div>
    </div>
  );
};

// Define ModuleToggleProps and use React.FC to fix typing issues with key prop
interface ModuleToggleProps {
  node: NeuralNode;
  onToggle: () => void;
}

const ModuleToggle: React.FC<ModuleToggleProps> = ({ node, onToggle }) => (
  <button 
    onClick={onToggle}
    disabled={node.isLocked}
    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${
      node.isActive 
      ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-100' 
      : 'bg-white/[0.02] border-white/5 text-slate-600 grayscale opacity-60'
    } ${node.isLocked ? 'cursor-not-allowed opacity-100 bg-white/[0.04]' : 'hover:bg-white/[0.05] active:scale-95'}`}
  >
    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${node.isActive ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]' : 'bg-slate-700'}`} />
    <div className="flex flex-col gap-0.5 overflow-hidden">
      <span className="text-[7px] font-black uppercase tracking-tighter truncate leading-none">{node.label}</span>
      <span className="text-[6px] font-bold text-slate-500 uppercase tracking-tighter truncate leading-none">{node.isActive ? 'ACTIVE' : 'LOCKED'}</span>
    </div>
  </button>
);

const SourceCard = ({ onClick, icon, label, sublabel, highlight }: any) => (
  <button 
    onClick={onClick} 
    className={`aspect-square sm:aspect-video rounded-[3rem] flex flex-col items-center justify-center gap-4 transition-all active:scale-95 group shadow-2xl border-2 ${highlight ? 'bg-indigo-600/5 border-indigo-500/20 hover:border-indigo-500 hover:bg-indigo-600/10' : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'}`}
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${highlight ? 'bg-indigo-600/10 group-hover:bg-indigo-600 text-indigo-400' : 'bg-white/5 group-hover:bg-white/10 text-slate-500'} group-hover:text-white`}>
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
    </div>
    <div className="text-center">
      <p className={`text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-indigo-400' : 'text-slate-400'} group-hover:text-white`}>{label}</p>
      <p className="text-[7px] font-bold text-slate-600 uppercase tracking-tighter mt-1">{sublabel}</p>
    </div>
  </button>
);

const TelemetryItem = ({ label, value, color = "text-white" }: any) => (
  <div className="space-y-1">
    <p className="text-[7px] font-bold text-slate-600 uppercase tracking-tighter">{label}</p>
    <p className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{value}</p>
  </div>
);
