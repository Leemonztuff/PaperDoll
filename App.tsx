import React, { useState, useCallback, useEffect } from "react"
import { useSpriteForge } from "./hooks/useSpriteForge"
import { useApiKey } from "./hooks/useApiKey"
import { Atelier } from "./components/Atelier"
import { EvolutionTree } from "./components/EvolutionTree"
import { ImageModal } from "./components/ImageModal"
import { GeneratedOutfit, ModelType } from "./types"
import {
  NavButton,
  MobileNavButton,
  SettingsPanel,
} from "./components/UI"

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>
      openSelectKey: () => Promise<void>
    }
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
  } = useSpriteForge()

  const {
    status,
    quota,
    manualKey,
    showKey,
    isTesting,
    testResult,
    setManualKey,
    saveKey,
    clearKey,
    toggleShowKey,
    testConnection,
    refreshStatus,
    remainingRequests,
    isQuotaExceeded,
    quotaPercentage,
  } = useApiKey()

  const [prompt, setPrompt] = useState("")
  const [activeTab, setActiveTab] = useState<"forge" | "tree">("forge")
  const [selectedOutfit, setSelectedOutfit] = useState<GeneratedOutfit | null>(null)
  const [isSetupOpen, setIsSetupOpen] = useState(!status.hasKey)

  useEffect(() => {
    if (!status.hasKey) {
      setIsSetupOpen(true)
    }
  }, [status.hasKey])

  const handleModelChange = (model: ModelType) => {
    dispatch({ type: "UPDATE_CONFIG", payload: { model } })
  }

  const handleSelectAsParent = (o: GeneratedOutfit) => {
    dispatch({ type: "SET_ACTIVE_PARENT", payload: o })
    setPrompt(o.prompt || "")
    setActiveTab("forge")
    setSelectedOutfit(null)
  }

  const handleForge = useCallback(async () => {
    if (isQuotaExceeded) {
      setIsSetupOpen(true)
      return
    }

    try {
      await executeSynthesis(prompt)
    } catch (error: any) {
      if (
        error.message === "RESELECT_KEY" ||
        error.message === "API_KEY_MISSING" ||
        error.message === "QUOTA_EXCEEDED"
      ) {
        setIsSetupOpen(true)
      }
    }
  }, [executeSynthesis, prompt, isQuotaExceeded])

  const getQuotaWarning = () => {
    if (isQuotaExceeded) {
      return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[500] bg-red-500/90 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl animate-in slide-in-from-top-2 duration-300">
          QUOTA EXCEEDED - Please upgrade or wait for reset
        </div>
      )
    }
    if (quotaPercentage > 80) {
      return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[500] bg-amber-500/90 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl animate-in slide-in-from-top-2 duration-300">
          WARNING: {remainingRequests} requests remaining today
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-graphite-950 text-[#f8fafc] overflow-hidden relative">
      {getQuotaWarning()}

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
        <div className="flex flex-col items-center gap-3">
          {!status.hasKey && (
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" title="No API Key" />
          )}
          {status.hasKey && status.tier === "free" && (
            <div className="w-3 h-3 rounded-full bg-emerald-500" title="Free Tier" />
          )}
          {status.hasKey && status.tier === "pro" && (
            <div className="w-3 h-3 rounded-full bg-indigo-500" title="Pro Tier" />
          )}
          <button
            onClick={() => setIsSetupOpen(true)}
            className={`w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-xl transition-all ${
              isSetupOpen
                ? "bg-indigo-600 text-white"
                : "text-slate-500 hover:text-white hover:bg-white/5"
            }`}
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
        </div>
      </aside>

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
            hasApiKey={status.hasKey}
            isQuotaExceeded={isQuotaExceeded}
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

      <SettingsPanel
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        status={status}
        quota={quota}
        remainingRequests={remainingRequests}
        isQuotaExceeded={isQuotaExceeded}
        quotaPercentage={quotaPercentage}
        manualKey={manualKey}
        showKey={showKey}
        isTesting={isTesting}
        testResult={testResult}
        onManualKeyChange={setManualKey}
        onSaveKey={saveKey}
        onClearKey={clearKey}
        onToggleShowKey={toggleShowKey}
        onTestConnection={testConnection}
      />

      {selectedOutfit && (
        <ImageModal
          outfit={selectedOutfit}
          onClose={() => setSelectedOutfit(null)}
          onDelete={deleteAsset}
          onSelectAsParent={handleSelectAsParent}
        />
      )}
    </div>
  )
}

export default App
