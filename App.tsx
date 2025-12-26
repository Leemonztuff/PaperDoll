
import React, { useState, useEffect, useReducer } from 'react';
import { GeneratedOutfit, AppState } from './types';
import { GeminiService } from './services/geminiService';
import { StorageService } from './services/storageService';
import { ImageProcessor } from './services/imageProcessor';
import MainEditor from './components/MainEditor';
import ResultGallery from './components/ResultGallery';
import Sidebar from './components/Sidebar';

// Define the AIStudio interface to match environmental definitions and satisfy TypeScript property type requirements.
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    // Use the named interface and identical modifiers (readonly) to align with existing global declarations in the environment.
    readonly aistudio: AIStudio;
  }
}

type Action = 
  | { type: 'ADD_OUTFIT'; payload: GeneratedOutfit }
  | { type: 'REMOVE_OUTFIT'; payload: string }
  | { type: 'SET_PARENT'; payload: GeneratedOutfit | null }
  | { type: 'SET_BASE'; payload: string | null }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_CONFIG'; payload: Partial<AppState> }
  | { type: 'SET_OUTFITS'; payload: GeneratedOutfit[] };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_OUTFIT': return { ...state, outfits: [action.payload, ...state.outfits] };
    case 'REMOVE_OUTFIT': return { ...state, outfits: state.outfits.filter(o => o.id !== action.payload) };
    case 'SET_PARENT': return { ...state, activeEvolutionParent: action.payload };
    case 'SET_BASE': return { ...state, baseImage: action.payload };
    case 'SET_GENERATING': return { ...state, isGenerating: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload };
    case 'UPDATE_CONFIG': return { ...state, ...action.payload };
    case 'SET_OUTFITS': return { ...state, outfits: action.payload };
    default: return state;
  }
}

const App: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, {
    baseImage: null,
    activeEvolutionParent: null,
    outfits: [],
    isGenerating: false,
    selectedModel: 'gemini-2.5-flash-image',
    selectedSize: '1K',
    selectedAspectRatio: '9:16',
    outline: { enabled: false, color: '#4f46e5', thickness: 'medium', glow: false },
    error: null,
    isCharacterSheetMode: false,
    mutationStrength: 50,
    renderingProtocols: {
      backgroundStyle: 'magenta',
      pixelPerfect: true,
      strongOutline: true,
      hd2dStyle: true
    }
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'vault'>('editor');
  const [prompt, setPrompt] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [needsApiKey, setNeedsApiKey] = useState(false);

  useEffect(() => {
    StorageService.getAllOutfits().then(data => dispatch({ type: 'SET_OUTFITS', payload: data }));
    
    // Check if API key is needed for Pro models
    const checkKey = async () => {
      if (state.selectedModel.includes('pro')) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setNeedsApiKey(!hasKey);
      } else {
        setNeedsApiKey(false);
      }
    };
    checkKey();
  }, [state.selectedModel]);

  const handleOpenKeySelector = async () => {
    await window.aistudio.openSelectKey();
    setNeedsApiKey(false);
  };

  const handleSelectParent = (outfit: GeneratedOutfit) => {
    dispatch({ type: 'SET_PARENT', payload: outfit });
    setPrompt(outfit.prompt);
    setActiveTab('editor');
  };

  const handleForge = async () => {
    if (!state.baseImage) {
      dispatch({ type: 'SET_ERROR', payload: "BLOQUEO: Carga un maniquí base primero." });
      return;
    }

    if (needsApiKey) {
      await handleOpenKeySelector();
      // Proceed assuming success as per instructions
    }
    
    dispatch({ type: 'SET_GENERATING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const url = await GeminiService.generateEvolution(
        state.baseImage,
        state.activeEvolutionParent?.url || null,
        prompt || "Detailed fantasy character outfit",
        state.mutationStrength,
        {
          model: state.selectedModel,
          aspectRatio: state.selectedAspectRatio,
          outline: state.outline,
          isCharacterSheet: state.isCharacterSheetMode,
          size: state.selectedSize,
          protocols: state.renderingProtocols
        }
      );

      const newAsset: GeneratedOutfit = {
        id: crypto.randomUUID(),
        url: url,
        originalUrl: url,
        parentId: state.activeEvolutionParent?.id,
        prompt: prompt,
        timestamp: Date.now(),
        model: state.selectedModel,
        aspectRatio: state.selectedAspectRatio,
        evolutionStep: (state.activeEvolutionParent?.evolutionStep || 0) + 1
      };

      await StorageService.saveOutfit(newAsset);
      dispatch({ type: 'ADD_OUTFIT', payload: newAsset });
      dispatch({ type: 'SET_PARENT', payload: newAsset });
    } catch (e: any) {
      const errorMsg = e.message || "Error desconocido";
      if (errorMsg.includes("Requested entity was not found")) {
        setNeedsApiKey(true);
        dispatch({ type: 'SET_ERROR', payload: "SESIÓN EXPIRADA: Selecciona tu API Key de nuevo." });
      } else {
        dispatch({ type: 'SET_ERROR', payload: "Error Neural: " + errorMsg });
      }
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false });
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#050505] text-[#e2e8f0] font-sans overflow-hidden">
      
      {/* NAVEGACIÓN SUPERIOR */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl z-50">
        <h1 className="text-[12px] font-black uppercase tracking-[0.3em]">
          Atelier <span className="text-indigo-500">Mobile</span>
        </h1>
        <div className="flex items-center gap-3">
          {needsApiKey && (
            <button 
              onClick={handleOpenKeySelector}
              className="px-3 py-1 bg-amber-500/10 border border-amber-500/50 rounded-full text-[8px] font-black text-amber-500 uppercase tracking-widest animate-pulse"
            >
              Key Required
            </button>
          )}
          <button 
            onClick={() => setIsConfigOpen(true)}
            className="p-2 bg-white/5 rounded-full"
          >
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'editor' ? (
          <MainEditor 
            baseImage={state.baseImage}
            parentImage={state.activeEvolutionParent?.url || null}
            onUploadBase={(url) => dispatch({ type: 'SET_BASE', payload: url })}
            isGenerating={state.isGenerating}
            onResetParent={() => dispatch({ type: 'SET_PARENT', payload: null })}
            mutationStrength={state.mutationStrength}
            backgroundStyle={state.renderingProtocols.backgroundStyle}
            isSheetMode={state.isCharacterSheetMode}
            prompt={prompt}
            setPrompt={setPrompt}
            onGenerate={handleForge}
          />
        ) : (
          <div className="h-full overflow-y-auto p-6 pb-24 no-scrollbar">
            <ResultGallery 
              outfits={state.outfits}
              activeParentId={state.activeEvolutionParent?.id || null}
              onSelectParent={handleSelectParent}
              onRemoveOutfit={(id) => {
                StorageService.deleteOutfit(id);
                dispatch({ type: 'REMOVE_OUTFIT', payload: id });
              }}
              onProcessPNG={async (o) => {
                const url = await ImageProcessor.processAlpha(o.url, 45, 4);
                const link = document.createElement('a');
                link.href = url;
                link.download = `outfit-${o.id}.png`;
                link.click();
              }}
              isGenerating={state.isGenerating}
            />
          </div>
        )}

        {state.error && (
          <div className="absolute top-4 left-6 right-6 bg-red-500/90 backdrop-blur-md p-3 rounded-xl flex items-center justify-between z-50">
            <span className="text-[9px] font-black uppercase tracking-widest">{state.error}</span>
            <button onClick={() => dispatch({ type: 'SET_ERROR', payload: null })}>✕</button>
          </div>
        )}
      </main>

      {/* BARRA DE NAVEGACIÓN INFERIOR */}
      <nav className="h-20 bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around safe-bottom z-50">
        <button 
          onClick={() => setActiveTab('editor')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'editor' ? 'text-indigo-400 scale-110' : 'text-slate-600'}`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span className="text-[8px] font-black uppercase tracking-widest">Atelier</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('vault')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'vault' ? 'text-indigo-400 scale-110' : 'text-slate-600'}`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-[8px] font-black uppercase tracking-widest">Vault</span>
        </button>
      </nav>

      <Sidebar 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
        state={state} 
        dispatch={dispatch} 
        prompt={prompt} 
        setPrompt={setPrompt} 
        onGenerate={handleForge} 
      />
    </div>
  );
};

export default App;
