
import React, { useState, useEffect } from 'react';
import { useSpriteForge } from './hooks/useSpriteForge';
import { Atelier } from './components/Atelier';
import { Vault } from './components/Vault';
import { EvolutionTree } from './components/EvolutionTree';
import { IconButton } from './components/UI';
import { ImageModal } from './components/ImageModal';
import { GeneratedOutfit, ForgeMode, NeuralMacro } from './types';
import { ANATOMICAL_MACROS } from './constants';

const App: React.FC = () => {
  const { state, dispatch, uploadBaseDNA, executeBaseExtraction, executeSynthesis, deleteAsset } = useSpriteForge();
  
  const [prompt, setPrompt] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'forge' | 'vault' | 'tree'>('forge');
  const [selectedOutfit, setSelectedOutfit] = useState<GeneratedOutfit | null>(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectAsset = (outfit: GeneratedOutfit) => setSelectedOutfit(outfit);

  const handleApplyAsParent = (outfit: GeneratedOutfit) => {
    dispatch({ type: 'SET_ACTIVE_PARENT', payload: outfit });
    setPrompt(outfit.prompt || '');
    setActiveTab('forge');
  };

  const handlePromoteToBase = (url: string) => {
    if (confirm("¿Establecer este diseño como la nueva base? Esto reiniciará la cadena evolutiva desde este punto.")) {
      dispatch({ type: 'SET_BASE_IMAGE', payload: url });
    }
  };

  const handleApplyMacro = (macro: NeuralMacro) => {
    const resetChain = state.config.neuralChain.map(node => ({ ...node, isActive: true }));
    const newChain = resetChain.map(node => ({
      ...node,
      isActive: !macro.nodesToDisable.includes(node.id)
    }));

    dispatch({ 
      type: 'UPDATE_CONFIG', 
      payload: { 
        neuralChain: newChain,
        mutationStrength: macro.mutationStrength,
        activeMacroId: macro.id
      } 
    });

    if (macro.promptSuffix && !prompt.includes(macro.promptSuffix)) {
       setPrompt(prev => prev ? `${prev}, ${macro.promptSuffix}` : macro.promptSuffix);
    }
  };

  const SidebarItem = ({ tab, icon, label, hint }: { tab: typeof activeTab; icon: React.ReactNode; label: string; hint: string }) => (
    <button 
      onClick={() => setActiveTab(tab)} 
      className={`w-full flex items-center gap-4 px-6 py-4 transition-all border-r-2 ${
        activeTab === tab 
        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' 
        : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'
      }`}
    >
      <div className={`${activeTab === tab ? 'scale-110' : ''} transition-transform`}>{icon}</div>
      <div className="flex flex-col items-start">
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
        <span className="text-[6px] font-bold uppercase opacity-40 tracking-widest">{hint}</span>
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 flex bg-[#020202] text-[#f8fafc] font-sans overflow-hidden">
      
      {/* DESKTOP SIDEBAR */}
      {isDesktop && (
        <aside className="w-72 bg-[#050505] border-r border-white/5 flex flex-col shrink-0 z-50 shadow-2xl shadow-black">
          <div className="h-20 px-8 flex items-center border-b border-white/5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/30 mr-3">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-[10px] font-black uppercase tracking-[0.3em]">
              SpriteForge <span className="text-indigo-500">RPG</span>
            </h1>
          </div>

          <nav className="flex-1 py-10 flex flex-col gap-2">
            <SidebarItem tab="forge" label="Atelier Neural" hint="Diseño y Creación" icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            } />
            <SidebarItem tab="vault" label="Archivo Genético" hint="Bóveda de Especímenes" icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            } />
            <SidebarItem tab="tree" label="Árbol de Evolución" hint="Ramas de Diseño" icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            } />
          </nav>

          <div className="p-8 border-t border-white/5 space-y-4">
             <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[7px] font-black uppercase text-indigo-400 mb-2">Estado del Sistema</p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[6px] font-bold text-slate-500 uppercase tracking-widest">Neural Link v2.5 Stable</p>
                </div>
             </div>
            <button 
              onClick={() => setIsConfigOpen(true)}
              className="w-full flex items-center justify-between px-6 py-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-white hover:border-indigo-500/50 transition-all"
            >
              <span>Pipeline IA</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            </button>
          </div>
        </aside>
      )}

      {/* Area de Contenido */}
      <div className="flex-1 relative flex flex-col min-w-0">
        <main className="flex-1 relative overflow-hidden">
          {activeTab === 'forge' && (
            <Atelier 
              state={state} prompt={prompt} setPrompt={setPrompt}
              onUpload={uploadBaseDNA}
              onForge={() => executeSynthesis(prompt)}
              onExtractBase={executeBaseExtraction}
              onResetParent={() => dispatch({ type: 'SET_ACTIVE_PARENT', payload: null })}
              onUpdateMutation={(v) => dispatch({ type: 'UPDATE_CONFIG', payload: { mutationStrength: v, activeMacroId: undefined } })}
              onSetMode={(m) => dispatch({ type: 'SET_FORGE_MODE', payload: m })}
              onApplyMacro={handleApplyMacro}
              onPromoteToBase={handlePromoteToBase}
            />
          )}
          
          {activeTab === 'vault' && (
            <div className="h-full bg-[#050505] animate-in fade-in duration-300 flex flex-col">
              <header className="h-16 md:h-24 px-8 md:px-12 flex items-center justify-between border-b border-white/5 safe-top shrink-0 bg-black/40 backdrop-blur-3xl z-40">
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                    <span className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.4em] text-white">Archivo Genético</span>
                  </div>
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-2 hidden md:block">Registro centralizado de especímenes y evoluciones neurales</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end mr-4 hidden sm:flex">
                    <span className="text-[10px] font-black text-white">{state.outfits.length}</span>
                    <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Entradas</span>
                  </div>
                  <IconButton onClick={() => window.print()} className="bg-white/5" title="Exportar Log">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </IconButton>
                </div>
              </header>
              <div className="flex-1 overflow-hidden">
                <Vault outfits={state.outfits} activeId={state.activeParent?.id} onSelect={handleSelectAsset} onDelete={deleteAsset} />
              </div>
            </div>
          )}

          {activeTab === 'tree' && (
            <div className="h-full bg-[#030303] animate-in fade-in zoom-in-95 duration-500">
              <EvolutionTree outfits={state.outfits} baseImage={state.baseImage} activeId={state.activeParent?.id} onSelect={handleSelectAsset} />
            </div>
          )}
        </main>

        {/* MOBILE TAB BAR */}
        {!isDesktop && (
          <nav className="h-20 bg-black/80 backdrop-blur-3xl border-t border-white/10 flex items-center justify-around px-6 safe-bottom shrink-0 z-[1000]">
            <button onClick={() => setActiveTab('forge')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'forge' ? 'text-indigo-500 scale-110' : 'text-slate-600'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span className="text-[7px] font-black uppercase tracking-widest">Crear</span>
            </button>
            <button onClick={() => setActiveTab('vault')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'vault' ? 'text-indigo-500 scale-110' : 'text-slate-600'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              <span className="text-[7px] font-black uppercase tracking-widest">Archivo</span>
            </button>
            <button onClick={() => setActiveTab('tree')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'tree' ? 'text-indigo-500 scale-110' : 'text-slate-600'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <span className="text-[7px] font-black uppercase tracking-widest">Árbol</span>
            </button>
            <button onClick={() => setIsConfigOpen(true)} className="flex flex-col items-center gap-1 text-slate-600 active:text-white transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              <span className="text-[7px] font-black uppercase tracking-widest">IA</span>
            </button>
          </nav>
        )}
      </div>

      {/* Modales */}
      {selectedOutfit && (
        <ImageModal outfit={selectedOutfit} onClose={() => setSelectedOutfit(null)} onDelete={deleteAsset} onSelectAsParent={handleApplyAsParent} />
      )}

      {isConfigOpen && (
        <div className="fixed inset-0 z-[2100] animate-in fade-in duration-300 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-xl" onClick={() => setIsConfigOpen(false)} />
          <div className="relative w-full md:max-w-2xl bg-[#0a0a0a] rounded-t-[3rem] md:rounded-[3rem] p-8 md:p-12 border-t md:border border-white/10 animate-in slide-in-from-bottom duration-500 max-h-[85vh] overflow-y-auto no-scrollbar safe-bottom">
            <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-8 md:hidden" />
            <div className="flex flex-col mb-10">
              <h3 className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.4em] text-indigo-400 border-l-4 border-indigo-600 px-4">Configuración del Cerebro IA</h3>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest px-5 mt-2">Módulos activos en el pipeline de síntesis</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {state.config.neuralChain.map(node => (
                <button 
                  key={node.id} disabled={node.isLocked} onClick={() => dispatch({ type: 'TOGGLE_NODE', payload: node.id })}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${node.isActive ? 'bg-indigo-600/10 border-indigo-500/40 text-white' : 'bg-white/5 border-transparent text-slate-600 opacity-40'}`}
                >
                  <div className="text-left">
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{node.label}</p>
                    <p className="text-[7px] md:text-[8px] font-bold opacity-40 uppercase mt-0.5">{node.description}</p>
                  </div>
                  {node.isActive && <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]" />}
                </button>
              ))}
            </div>
            <div className="h-10 md:hidden" />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
