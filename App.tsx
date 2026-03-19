
import React, { useState, useCallback, useEffect } from 'react';
import { useSpriteForge } from './hooks/useSpriteForge';
import { Atelier } from './components/Atelier';
import { EvolutionTree } from './components/EvolutionTree';
import { ImageModal } from './components/ImageModal';
import { GeneratedOutfit, ModelType } from './types';

// Declare window.aistudio for TypeScript support
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const App: React.FC = () => {
  const { state, dispatch, uploadBaseDNA, generateMannequin, executeBaseExtraction, executeSynthesis, deleteAsset } = useSpriteForge();
  
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'forge' | 'tree'>('forge');
  const [selectedOutfit, setSelectedOutfit] = useState<GeneratedOutfit | null>(null);
  
  const [hasApiKey, setHasApiKey] = useState<boolean>(true); // Assume key is handled externally via process.env.API_KEY
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  // Check for API key selection when using Pro models
  useEffect(() => {
    const verifyApiKey = async () => {
      if (state.config.model.includes('pro')) {
        const isSelected = await window.aistudio.hasSelectedApiKey();
        if (!isSelected) {
          setIsSetupOpen(true);
        }
      }
    };
    verifyApiKey();
  }, [state.config.model]);

  const handleOpenKeySelection = async () => {
    await window.aistudio.openSelectKey();
    // Guideline: Assume successful selection after triggering openSelectKey and proceed
    setIsSetupOpen(false);
  };

  const handleModelChange = (model: ModelType) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: { model } });
  };

  const handleSelectAsParent = (o: GeneratedOutfit) => {
    dispatch({ type: 'SET_ACTIVE_PARENT', payload: o }); 
    setPrompt(o.prompt || ''); 
    setActiveTab('forge');
    setSelectedOutfit(null);
  };

  const handleForge = useCallback(async () => {
    try {
      await executeSynthesis(prompt);
    } catch (error: any) {
      if (error.message === 'RESELECT_KEY' || error.message === 'API_KEY_MISSING') {
        setIsSetupOpen(true);
      }
    }
  }, [executeSynthesis, prompt]);

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-zinc-900 text-[#f8fafc] overflow-hidden relative">
      
      {/* NAVEGACIÓN DESKTOP (SIDEBAR) */}
      <aside className="hidden md:flex w-24 flex-col items-center py-10 bg-zinc-950/50 border-r border-white/5 z-50 shrink-0">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl mb-12 animate-float">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <nav className="flex-1 flex flex-col gap-6">
          <NavButton active={activeTab === 'forge'} onClick={() => setActiveTab('forge')} icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          } title="Laboratorio" />
          <NavButton active={activeTab === 'tree'} onClick={() => setActiveTab('tree')} icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" /></svg>
          } title="Archivo" />
        </nav>
        <button onClick={() => setIsSetupOpen(true)} className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${isSetupOpen ? 'bg-indigo-600' : 'text-slate-600 hover:text-white'}`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
        </button>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <main className="flex-1 relative overflow-hidden h-full w-full">
        {activeTab === 'forge' && (
          <Atelier 
            state={state} prompt={prompt} setPrompt={setPrompt}
            onUpload={uploadBaseDNA}
            onForge={handleForge}
            onExtractBase={executeBaseExtraction}
            onGenerateMannequin={generateMannequin}
            onResetParent={() => dispatch({ type: 'SET_ACTIVE_PARENT', payload: null })}
            onUpdateMutation={(v) => dispatch({ type: 'UPDATE_CONFIG', payload: { mutationStrength: v } })}
            onToggleNode={(id) => dispatch({ type: 'TOGGLE_NODE', payload: id })}
            onSetMode={(m) => dispatch({ type: 'SET_FORGE_MODE', payload: m })}
            onApplyMacro={(macro) => dispatch({ type: 'UPDATE_CONFIG', payload: { activeMacroId: macro.id } })}
            onPromoteToBase={(url) => dispatch({ type: 'SET_BASE_IMAGE', payload: url })}
            hasApiKey={hasApiKey}
          />
        )}
        {activeTab === 'tree' && (
          <EvolutionTree 
            outfits={state.outfits} 
            baseImage={state.baseImage} 
            activeId={state.activeParent?.id} 
            onSelect={setSelectedOutfit} 
          />
        )}
      </main>

      {/* NAVEGACIÓN MÓVIL (FLOATING PILL) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm">
        <nav className="flex h-16 bg-zinc-800/90 backdrop-blur-2xl border border-white/10 rounded-full items-center justify-around px-2 shadow-2xl">
          <MobileNavButton active={activeTab === 'forge'} onClick={() => setActiveTab('forge')} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>} label="Forja" />
          <button 
            onClick={() => setActiveTab('forge')}
            className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center -mt-6 shadow-2xl shadow-indigo-600/30 border-4 border-zinc-900 active:scale-95 transition-transform"
          >
             <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </button>
          <MobileNavButton active={activeTab === 'tree'} onClick={() => setActiveTab('tree')} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" /></svg>} label="Archivo" />
          <MobileNavButton active={isSetupOpen} onClick={() => setIsSetupOpen(true)} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>} label="Config" />
        </nav>
      </div>

      {/* SETUP DIALOG */}
      {isSetupOpen && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xl" onClick={() => setIsSetupOpen(false)} />
          <div className="relative max-w-lg w-full bg-zinc-800 border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-3xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white">Engine Calibration</h3>
              <button onClick={() => setIsSetupOpen(false)} className="text-slate-500 hover:text-white p-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-8">
              <section>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">API Authentication</p>
                <div className="space-y-4">
                  <p className="text-xs text-slate-400">To use high-quality Pro models, you must select an API key from a billing-enabled project.</p>
                  <button onClick={handleOpenKeySelection} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95">
                    Select API Key
                  </button>
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="block text-center text-[10px] text-indigo-400 hover:text-indigo-300 underline uppercase tracking-widest font-bold">
                    Billing Documentation
                  </a>
                </div>
              </section>
              <section>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Neural Model</p>
                <div className="grid grid-cols-2 gap-3">
                  <ModelSelect active={state.config.model.includes('flash')} label="Flash 2.5" onClick={() => handleModelChange('gemini-2.5-flash-image')} />
                  <ModelSelect active={state.config.model.includes('pro')} label="Pro 3.0" onClick={() => handleModelChange('gemini-3-pro-image-preview')} />
                </div>
              </section>
              <button onClick={() => setIsSetupOpen(false)} className="w-full py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest border border-white/10 active:scale-95 transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {selectedOutfit && (
        <ImageModal outfit={selectedOutfit} onClose={() => setSelectedOutfit(null)} onDelete={deleteAsset} onSelectAsParent={handleSelectAsParent} />
      )}
    </div>
  );
};

const NavButton = ({ active, onClick, icon, title }: any) => (
  <button onClick={onClick} title={title} className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-600 hover:text-white hover:bg-white/5'}`}>
    {icon}
  </button>
);

const MobileNavButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all px-3 py-1 rounded-xl ${active ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'}`}>
    {icon}
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const ModelSelect = ({ active, label, onClick }: any) => (
  <button onClick={onClick} className={`p-4 rounded-2xl border-2 text-center transition-all ${active ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-lg shadow-indigo-500/10' : 'bg-white/5 border-transparent opacity-40 hover:opacity-100'}`}>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
