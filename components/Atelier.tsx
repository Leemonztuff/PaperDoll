import React, { useState, useRef } from "react"
import { AppState, ForgeMode, NeuralMacro, NeuralNode } from "../types"
import { QUICK_TAGS } from "../constants"
import {
  IconButton,
  Tag,
  Loader,
  ComparisonSlider,
  NeuralLog,
  Slider,
  InfoBadge,
  Panel,
  Button,
  MicroLabel,
  SectionTitle,
  TextArea,
  ToolSection,
  Card,
  TelemetryItem,
  ModuleToggle,
} from "./UI"

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
  isQuotaExceeded: boolean;
}

export const Atelier: React.FC<AtelierProps> = ({
  state,
  prompt,
  setPrompt,
  onUpload,
  onForge,
  onExtractBase,
  onResetParent,
  onUpdateMutation,
  onToggleNode,
  onSetMode,
  onApplyMacro,
  onPromoteToBase,
  onGenerateMannequin,
  hasApiKey,
  isQuotaExceeded,
}) => {
  const [showModules, setShowModules] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!state.baseImage) {
    return (
      <div className="h-full w-full overflow-y-auto bg-graphite-950 flex flex-col items-center p-8 pb-32 no-scrollbar">
        <div className="max-w-xl w-full text-center space-y-12 py-16 reveal-view">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold uppercase tracking-[0.3em] text-white">
              GENETIC SOURCE
            </h2>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-loose max-w-sm mx-auto">
              Define el ADN de tu personaje. Un maniquí base sin ropa es
              necesario para proyectar equipo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full px-4">
            <Card
              onClick={() => fileInputRef.current?.click()}
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              }
              title="Upload Asset"
              description="Extract DNA from image"
            />
            <Card
              onClick={onGenerateMannequin}
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              }
              title="Forge Base"
              description="Generate neural mannequin"
              highlight
            />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => onUpload(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
          {state.isGenerating && (
            <Loader
              message="Generating Base..."
              subMessage="Neural Stabilization in Progress"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-graphite-950 relative overflow-hidden">
      {/* VISOR (AREA SUPERIOR EN MOBILE, LADO IZQUIERDO EN DESKTOP) */}
      <div className="w-full h-[40vh] md:h-full md:flex-1 relative bg-graphite-900 shrink-0 border-b md:border-b-0 md:border-r border-white/5 overflow-hidden sticky top-0 md:static z-10 flex flex-col">
        <div className="absolute inset-0 checker-bg opacity-[0.02]" />

        {/* HUD OVERLAY */}
        <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            <div className="bg-graphite-950/80 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
              <div
                className={`w-1.5 h-1.5 rounded-full ${state.isGenerating ? "bg-indigo-500 animate-pulse" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"}`}
              />
              <span className="text-[8px] font-bold uppercase tracking-widest text-slate-300">
                {state.isGenerating ? "PROCESSING" : "READY"}
              </span>
            </div>
            <InfoBadge text={state.activeParent ? "Branching" : "Root DNA"} />
          </div>
          <Button
            variant="secondary"
            onClick={() =>
              state.activeParent
                ? onResetParent()
                : onPromoteToBase(null as any)
            }
            className="pointer-events-auto px-3 py-1.5 rounded-lg text-[8px]"
          >
            {state.activeParent ? "CLEAR BRANCH" : "CLEAR ROOT"}
          </Button>
        </div>

        {/* IMAGE RENDERER */}
        <div className="flex-1 relative flex items-center justify-center p-6 md:p-12">
          {state.activeParent ? (
            <ComparisonSlider
              before={state.baseImage}
              after={state.activeParent.url}
              className="w-full h-full max-w-[95%] md:max-w-[85%] max-h-[95%] md:max-h-[90%]"
            />
          ) : (
            <div className="relative group flex items-center justify-center h-full w-full">
              <div className="absolute inset-0 bg-indigo-600/10 blur-[100px] opacity-20 pointer-events-none" />
              <img
                src={state.baseImage}
                className="max-h-full max-w-full object-contain relative z-10 scale-[1.1] sm:scale-[1.5] drop-shadow-[0_0_40px_rgba(99,102,241,0.15)] transition-transform duration-700 group-hover:scale-[1.2] md:group-hover:scale-[1.6] pixelated"
                alt="Base DNA"
              />
            </div>
          )}
        </div>

        <NeuralLog active={state.isGenerating} />
        {state.isGenerating && (
          <Loader
            message="Forging Gear..."
            subMessage="Phase 1: Projecting Material Shaders"
          />
        )}
      </div>

      {/* TOOLS (SCROLLABLE AREA EN MOBILE, LADO DERECHO EN DESKTOP) */}
      <div className="flex-1 md:w-[400px] lg:w-[440px] bg-graphite-950 flex flex-col shrink-0 z-20 shadow-[-20px_0_40px_rgba(0,0,0,0.3)] md:shadow-none">
        {/* HEADER */}
        <header className="h-16 border-b border-white/5 flex items-center px-6 shrink-0 bg-graphite-950/80 backdrop-blur-md">
          <SectionTitle color="text-slate-300">Inspector</SectionTitle>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          {/* TELEMETRY */}
          <ToolSection
            title="Neural Pipeline"
            action={
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded">
                {state.activeParent ? "EVOLUTION" : "GENESIS"}
              </span>
            }
          >
            <div className="grid grid-cols-2 gap-3">
              <TelemetryItem
                label="Genetic Lock"
                value="98% STABLE"
                color="text-emerald-400"
              />
              <TelemetryItem label="Asset Mode" value="PIXEL HD" />
            </div>
          </ToolSection>

          {/* PROMPT BOX */}
          <ToolSection title="Directive">
            <TextArea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Specify gear: 'Steel plate armor with glowing runes'..."
              className="h-32"
            />
          </ToolSection>

          {/* NEURAL ARCHITECTURE */}
          <ToolSection
            title="Neural Chain"
            action={
              <button
                onClick={() => setShowModules(!showModules)}
                className={`text-[9px] font-bold uppercase tracking-widest transition-all ${showModules ? "text-indigo-400" : "text-slate-500 hover:text-white"}`}
              >
                {showModules ? "Hide Modules" : "Configure Modules"}
              </button>
            }
          >
            {showModules && (
              <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                {state.config.neuralChain.map((node: NeuralNode) => (
                  <ModuleToggle
                    key={node.id}
                    node={node}
                    onToggle={() => onToggleNode(node.id)}
                  />
                ))}
              </div>
            )}
          </ToolSection>

          {/* TEMPLATES */}
          <ToolSection title="Class Templates">
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS[0].tags.map((tag) => (
                <Tag
                  key={tag}
                  label={tag}
                  onClick={() => setPrompt(prompt ? `${prompt}, ${tag}` : tag)}
                />
              ))}
            </div>
          </ToolSection>

          {/* MUTATION */}
          <ToolSection title="Genetic Mutation" className="pb-4">
            <Slider
              label="Mutation Strength"
              value={state.config.mutationStrength}
              min={0}
              max={100}
              onChange={onUpdateMutation}
            />
          </ToolSection>
        </div>

        {/* STICKY FOOTER */}
        <div className="p-6 border-t border-white/5 bg-graphite-950 shrink-0">
          {state.error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-[10px] font-bold uppercase text-center animate-in slide-in-from-bottom-2">
              {state.error}
            </div>
          )}
          <Button
            variant="primary"
            onClick={onForge}
            disabled={state.isGenerating || !prompt || isQuotaExceeded || !hasApiKey}
            className="w-full"
          >
            {isQuotaExceeded ? "QUOTA EXCEEDED" : !hasApiKey ? "CONFIGURE API KEY" : state.isGenerating ? "FORGING..." : "FORGE ASSET"}
          </Button>
        </div>
      </div>
    </div>
  );
};
