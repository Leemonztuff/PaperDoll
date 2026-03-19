import React, { useState, useCallback, useEffect } from "react";
import { useSpriteForge } from "./hooks/useSpriteForge";
import { Atelier } from "./components/Atelier";
import { EvolutionTree } from "./components/EvolutionTree";
import { ImageModal } from "./components/ImageModal";
import { GeneratedOutfit, ModelType } from "./types";
import {
  Panel,
  Button,
  MicroLabel,
  SectionTitle,
  IconButton,
  ToolSection,
  NavButton,
  MobileNavButton,
  ModelSelect,
} from "./components/UI";

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
  const {
    state,
    dispatch,
    uploadBaseDNA,
    generateMannequin,
    executeBaseExtraction,
    executeSynthesis,
    deleteAsset,
  } = useSpriteForge();

  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<"forge" | "tree">("forge");
  const [selectedOutfit, setSelectedOutfit] = useState<GeneratedOutfit | null>(
    null,
  );

  const [hasApiKey, setHasApiKey] = useState<boolean>(true); // Assume key is handled externally via process.env.API_KEY
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  // Check for API key selection when using Pro models
  useEffect(() => {
    const verifyApiKey = async () => {
      if (state.config.model.includes("pro")) {
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
    dispatch({ type: "UPDATE_CONFIG", payload: { model } });
  };

  const handleSelectAsParent = (o: GeneratedOutfit) => {
    dispatch({ type: "SET_ACTIVE_PARENT", payload: o });
    setPrompt(o.prompt || "");
    setActiveTab("forge");
    setSelectedOutfit(null);
  };

  const handleForge = useCallback(async () => {
    try {
      await executeSynthesis(prompt);
    } catch (error: any) {
      if (
        error.message === "RESELECT_KEY" ||
        error.message === "API_KEY_MISSING"
      ) {
        setIsSetupOpen(true);
      }
    }
  }, [executeSynthesis, prompt]);

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-graphite-950 text-[#f8fafc] overflow-hidden relative">
      {/* NAVEGACIÓN DESKTOP (SIDEBAR) */}
      <aside className="hidden md:flex w-16 lg:w-20 flex-col items-center py-6 bg-graphite-950 border-r border-white/5 z-50 shrink-0">
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg mb-8">
          <svg
            className="w-5 h-5 lg:w-6 lg:h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <nav className="flex-1 flex flex-col gap-4">
          <NavButton
            active={activeTab === "forge"}
            onClick={() => setActiveTab("forge")}
            icon={
              <svg
                className="w-5 h-5 lg:w-6 lg:h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
            title="Laboratorio"
          />
          <NavButton
            active={activeTab === "tree"}
            onClick={() => setActiveTab("tree")}
            icon={
              <svg
                className="w-5 h-5 lg:w-6 lg:h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"
                />
              </svg>
            }
            title="Archivo"
          />
        </nav>
        <button
          onClick={() => setIsSetupOpen(true)}
          className={`w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-xl transition-all ${isSetupOpen ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-white hover:bg-white/5"}`}
        >
          <svg
            className="w-5 h-5 lg:w-6 lg:h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
          </svg>
        </button>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <main className="flex-1 relative overflow-hidden h-full w-full">
        {activeTab === "forge" && (
          <Atelier
            state={state}
            prompt={prompt}
            setPrompt={setPrompt}
            onUpload={uploadBaseDNA}
            onForge={handleForge}
            onExtractBase={executeBaseExtraction}
            onGenerateMannequin={generateMannequin}
            onResetParent={() =>
              dispatch({ type: "SET_ACTIVE_PARENT", payload: null })
            }
            onUpdateMutation={(v) =>
              dispatch({
                type: "UPDATE_CONFIG",
                payload: { mutationStrength: v },
              })
            }
            onToggleNode={(id) =>
              dispatch({ type: "TOGGLE_NODE", payload: id })
            }
            onSetMode={(m) => dispatch({ type: "SET_FORGE_MODE", payload: m })}
            onApplyMacro={(macro) =>
              dispatch({
                type: "UPDATE_CONFIG",
                payload: { activeMacroId: macro.id },
              })
            }
            onPromoteToBase={(url) =>
              dispatch({ type: "SET_BASE_IMAGE", payload: url })
            }
            hasApiKey={hasApiKey}
          />
        )}
        {activeTab === "tree" && (
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
        <nav className="flex h-16 bg-graphite-800/90 backdrop-blur-2xl border border-white/10 rounded-full items-center justify-around px-2 shadow-2xl">
          <MobileNavButton
            active={activeTab === "forge"}
            onClick={() => setActiveTab("forge")}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
            label="Forja"
          />
          <button
            onClick={() => setActiveTab("forge")}
            className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center -mt-6 shadow-2xl shadow-indigo-600/30 border-4 border-graphite-900 active:scale-95 transition-transform"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </button>
          <MobileNavButton
            active={activeTab === "tree"}
            onClick={() => setActiveTab("tree")}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"
                />
              </svg>
            }
            label="Archivo"
          />
          <MobileNavButton
            active={isSetupOpen}
            onClick={() => setIsSetupOpen(true)}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
              </svg>
            }
            label="Config"
          />
        </nav>
      </div>

      {/* SETUP DIALOG */}
      {isSetupOpen && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-graphite-950/80 backdrop-blur-sm"
            onClick={() => setIsSetupOpen(false)}
          />
          <Panel className="relative max-w-lg w-full bg-graphite-900 border border-white/10 rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <SectionTitle className="text-slate-200">
                Engine Calibration
              </SectionTitle>
              <IconButton variant="ghost" onClick={() => setIsSetupOpen(false)}>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </IconButton>
            </div>
            <div className="space-y-8">
              <ToolSection title="API Authentication">
                <div className="space-y-4">
                  <p className="text-xs text-slate-400">
                    To use high-quality Pro models, you must select an API key
                    from a billing-enabled project.
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleOpenKeySelection}
                    className="w-full"
                  >
                    Select API Key
                  </Button>
                  <a
                    href="https://ai.google.dev/gemini-api/docs/billing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-[10px] text-indigo-400 hover:text-indigo-300 underline uppercase tracking-widest font-bold"
                  >
                    Billing Documentation
                  </a>
                </div>
              </ToolSection>
              <ToolSection title="Neural Model">
                <div className="grid grid-cols-2 gap-3">
                  <ModelSelect
                    active={state.config.model.includes("flash")}
                    label="Flash 2.5"
                    onClick={() => handleModelChange("gemini-2.5-flash-image")}
                  />
                  <ModelSelect
                    active={state.config.model.includes("pro")}
                    label="Pro 3.0"
                    onClick={() =>
                      handleModelChange("gemini-3-pro-image-preview")
                    }
                  />
                </div>
              </ToolSection>
              <Button
                variant="glass"
                onClick={() => setIsSetupOpen(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {selectedOutfit && (
        <ImageModal
          outfit={selectedOutfit}
          onClose={() => setSelectedOutfit(null)}
          onDelete={deleteAsset}
          onSelectAsParent={handleSelectAsParent}
        />
      )}
    </div>
  );
};

export default App;
