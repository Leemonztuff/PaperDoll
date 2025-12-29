
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
  const [manualKey, setManualKey] = useState(localStorage.getItem('SF_API_KEY') || '');
  const [showKey, setShowKey] = useState(false);

  // Verificación de la llave al montar la app
  useEffect(() => {
    const checkKey = async () => {
      // Si hay una llave manual en localStorage, ya estamos listos
      if (localStorage.getItem('SF_API_KEY')) {
        setHasApiKey(true);
        return;
      }

      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      } else {
        // En Vercel, si no hay manual ni aistudio, mostramos el portal de entrada
        setHasApiKey(false);
      }
    };
    checkKey();
    const interval = setInterval(checkKey, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveManualKey = (val: string) => {
    setManualKey(val);
    if (val.trim()) {
      localStorage.setItem('SF_API_KEY', val.trim());
      setHasApiKey(true);
    } else {
      localStorage.removeItem('SF_API_KEY');
      setHasApiKey(false);
    }
  };

  const handleConnectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
      } catch (e) {
        console.error("Error al vincular cuenta:", e);
      }
    } else {
      // Si falla el objeto global, forzamos apertura de modal manual
      setIsSetupOpen(true);
    }
  };

  const handleModelChange = (model: ModelType) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: { model } });
  };

  // Pantalla de Bienvenida con opción Manual
  if (hasApiKey === false && !isSetupOpen) {
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
              El motor neural requiere una API Key de Gemini para funcionar. Puedes vincular tu cuenta o pegarla manualmente.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleConnectKey}
              className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all transform active:scale-95 shadow-xl"
            >
              Vincular Google AI Studio
            </button>
            <button 
              onClick={() => setIsSetupOpen(true)}
              className="w-full py-4 bg-white/5 text-slate-400 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
            >
              Configuración Manual
            </button>
          </div>

          <div className="pt-4">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              className="text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:text-indigo-400 transition-colors"
            >
              Consigue tu llave gratuita aquí
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
          className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${isSetupOpen ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-indigo-400'}`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
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

      {/* MODAL DE CONFIGURACIÓN IA (MANUAL KEY SUPPORT) */}
      {isSetupOpen && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsSetupOpen(false)} />
          <div className="relative max-w-lg w-full bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-10 shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black uppercase tracking-[0.2em] text-white">Configuración del Laboratorio</h3>
              <button onClick={() => setIsSetupOpen(false)} className="text-slate-500 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-8">
              <section>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">API Key de Gemini</p>
                <div className="relative">
                  <input 
                    type={showKey ? "text" : "password"}
                    value={manualKey}
                    onChange={(e) => handleSaveManualKey(e.target.value)}
                    placeholder="Pega tu llave aquí..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-mono text-indigo-400 outline-none focus:border-indigo-500 transition-all pr-12"
                  />
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
                  >
                    {showKey ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
                <p className="text-[9px] text-slate-600 mt-2 uppercase tracking-widest leading-loose">
                  Esta llave se guarda localmente en tu navegador. Úsala si el selector automático falla o si necesitas rotar cuentas.
                </p>
              </section>

              <section>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Motor Generativo</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleModelChange('gemini-2.5-flash-image')} 
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${state.config.model.includes('flash') ? 'bg-indigo-600/10 border-indigo-500 text-white' : 'bg-white/5 border-transparent opacity-40 hover:opacity-100'}`}
                  >
                    <p className="text-[11px] font-black uppercase">Flash 2.5</p>
                    <p className="text-[8px] font-bold text-slate-400">Rápido / Gratis</p>
                  </button>
                  <button 
                    onClick={() => handleModelChange('gemini-3-pro-image-preview')} 
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${state.config.model.includes('pro') ? 'bg-indigo-600/10 border-indigo-500 text-white' : 'bg-white/5 border-transparent opacity-40 hover:opacity-100'}`}
                  >
                    <p className="text-[11px] font-black uppercase">Pro 3.0</p>
                    <p className="text-[8px] font-bold text-slate-400">Calidad Pro</p>
                  </button>
                </div>
              </section>

              <div className="pt-6 border-t border-white/5">
                <button 
                  onClick={handleConnectKey} 
                  className="w-full py-4 bg-white/5 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Intentar Vinculación Automática (Google AI)
                </button>
              </div>
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
