
import React, { useState, useEffect } from 'react';
import { useSpriteForge } from './hooks/useSpriteForge';
import { Atelier } from './components/Atelier';
import { Vault } from './components/Vault';
import { EvolutionTree } from './components/EvolutionTree';
import { ImageModal } from './components/ImageModal';
import { GeneratedOutfit, ModelType } from './types';

const App: React.FC = () => {
  const { state, dispatch, uploadBaseDNA, executeBaseExtraction, executeSynthesis, deleteAsset } = useSpriteForge();
  
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'forge' | 'vault' | 'tree'>('forge');
  const [selectedOutfit, setSelectedOutfit] = useState<GeneratedOutfit | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  // Verificación de la llave al montar la app
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      } else {
        // Si no estamos en un entorno compatible, asumimos que se maneja por env directo
        setHasApiKey(true);
      }
    };
    checkKey();
    // Re-chequeo periódico por si el usuario cambia de cuenta
    const interval = setInterval(checkKey, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleConnectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Después de abrir el diálogo, procedemos asumiendo éxito para mitigar race condition
        setHasApiKey(true);
      } catch (e) {
        console.error("Error al vincular cuenta:", e);
      }
    }
  };

  const handleModelChange = (model: ModelType) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: { model } });
  };

  // Pantalla de Bienvenida si no hay llave vinculada
  if (hasApiKey === false) {
    return (
      <div className="fixed inset-0 bg-[#050505] flex items-center justify-center p-6 z-[5000]">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(79,70,229,0.4)]">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white">SpriteForge Studio</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Víncula tu cuenta de Google AI Studio para activar el motor neural de generación de atuendos. Es gratuito y seguro.
            </p>
          </div>
          <button 
            onClick={handleConnectKey}
            className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all transform active:scale-95 shadow-xl"
          >
            Vincular Google Cloud
          </button>
          <div className="pt-4">
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              className="text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:text-indigo-400 transition-colors"
            >
              Documentación sobre API Keys y Facturación
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex bg-[#020202] text-[#f8fafc] font-sans overflow-hidden">
      
      {/* SIDEBAR TÉCNICO */}
      <aside className="w-20 md:w-24 bg-[#050505] border-r border-white/5 flex flex-col items-center py-10 z-50">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-12">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        <nav className="flex-1 flex flex-col gap-6">
          <NavButton active={activeTab === 'forge'} onClick={() => setActiveTab('forge')} icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          } />
          <NavButton active={activeTab === 'vault'} onClick={() => setActiveTab('vault')} icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
          } />
          <NavButton active={activeTab === 'tree'} onClick={() => setActiveTab('tree')} icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          } />
        </nav>

        <button 
          onClick={() => setIsSetupOpen(true)}
          className="w-12 h-12 flex items-center justify-center text-slate-600 hover:text-indigo-400 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 relative overflow-hidden">
          {activeTab === 'forge' && (
            <Atelier 
              state={state} prompt={prompt} setPrompt={setPrompt}
              onUpload={uploadBaseDNA}
              onForge={() => executeSynthesis(prompt)}
              onExtractBase={executeBaseExtraction}
              onResetParent={() => dispatch({ type: 'SET_ACTIVE_PARENT', payload: null })}
              onUpdateMutation={(v) => dispatch({ type: 'UPDATE_CONFIG', payload: { mutationStrength: v } })}
              onSetMode={(m) => dispatch({ type: 'SET_FORGE_MODE', payload: m })}
              onApplyMacro={(macro) => dispatch({ type: 'UPDATE_CONFIG', payload: { activeMacroId: macro.id } })}
              onPromoteToBase={(url) => dispatch({ type: 'SET_BASE_IMAGE', payload: url })}
              hasApiKey={hasApiKey || false}
            />
          )}
          {activeTab === 'vault' && (
            <Vault outfits={state.outfits} activeId={state.activeParent?.id} onSelect={setSelectedOutfit} onDelete={deleteAsset} />
          )}
          {activeTab === 'tree' && (
            <EvolutionTree outfits={state.outfits} baseImage={state.baseImage} activeId={state.activeParent?.id} onSelect={setSelectedOutfit} />
          )}
        </main>
      </div>

      {/* MODAL DE CONFIGURACIÓN IA */}
      {isSetupOpen && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsSetupOpen(false)} />
          <div className="relative max-w-lg w-full bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-10 shadow-2xl overflow-hidden">
            <h3 className="text-lg font-black uppercase tracking-[0.2em] text-white mb-8">Preferencias del Motor</h3>
            
            <div className="space-y-6">
              <section>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Modelo Generativo</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleModelChange('gemini-2.5-flash-image')} 
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${state.config.model.includes('flash') ? 'bg-indigo-600/10 border-indigo-500 text-white' : 'bg-white/5 border-transparent opacity-40 hover:opacity-100'}`}
                  >
                    <p className="text-[11px] font-black uppercase">Flash 2.5</p>
                    <p className="text-[8px] font-bold text-slate-400">Balanceado</p>
                  </button>
                  <button 
                    onClick={() => handleModelChange('gemini-3-pro-image-preview')} 
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${state.config.model.includes('pro') ? 'bg-indigo-600/10 border-indigo-500 text-white' : 'bg-white/5 border-transparent opacity-40 hover:opacity-100'}`}
                  >
                    <p className="text-[11px] font-black uppercase">Pro 3.0</p>
                    <p className="text-[8px] font-bold text-slate-400">Alta Calidad</p>
                  </button>
                </div>
              </section>

              <section className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-black text-slate-400 uppercase">Conexión Google Cloud</p>
                   <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${hasApiKey ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                     {hasApiKey ? 'Activa' : 'Inactiva'}
                   </div>
                </div>
                <button 
                  onClick={handleConnectKey} 
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all"
                >
                  Cambiar API Key de Sesión
                </button>
              </section>
            </div>
          </div>
        </div>
      )}

      {selectedOutfit && (
        <ImageModal 
          outfit={selectedOutfit} 
          onClose={() => setSelectedOutfit(null)} 
          onDelete={deleteAsset} 
          onSelectAsParent={(o) => { 
            dispatch({ type: 'SET_ACTIVE_PARENT', payload: o }); 
            setPrompt(o.prompt || ''); 
            setActiveTab('forge');
            setSelectedOutfit(null);
          }} 
        />
      )}
    </div>
  );
};

const NavButton = ({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) => (
  <button 
    onClick={onClick} 
    className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${active ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)]' : 'text-slate-600 hover:text-white hover:bg-white/5'}`}
  >
    {icon}
  </button>
);

export default App;
