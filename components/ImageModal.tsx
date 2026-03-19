import React, { useState, useRef, useEffect } from "react"
import { GeneratedOutfit } from "../types"
import type { LayerData, ProviderId } from "../services/imageService"
import {
  IconButton,
  Button,
  MicroLabel,
  SectionTitle,
  Panel,
  Tabs,
  Slider,
  ToolSection,
  LayerSeparator,
  LayerPreview,
} from "./UI"

interface ImageModalProps {
  outfit: GeneratedOutfit
  onClose: () => void
  onDelete: (id: string) => void
  onSelectAsParent: (o: GeneratedOutfit) => void
  providerId?: ProviderId
  apiKey?: string
}

type BgMode = "checker" | "studio" | "void" | "bright"
type ExportFormat = "png" | "jpeg" | "webp"

export const ImageModal: React.FC<ImageModalProps> = ({
  outfit,
  onClose,
  onDelete,
  onSelectAsParent,
  providerId,
  apiKey,
}) => {
  const [zoom, setZoom] = useState(1)
  const [showMetadata, setShowMetadata] = useState(false)
  const [bgMode, setBgMode] = useState<BgMode>("checker")

  // Layer Separation State
  const [isLayerSeparatorOpen, setIsLayerSeparatorOpen] = useState(false)
  const [extractedLayers, setExtractedLayers] = useState<LayerData | null>(null)

  // Alpha Tool State
  const [isAlphaMode, setIsAlphaMode] = useState(false);
  const [alphaThreshold, setAlphaThreshold] = useState(30);
  const [alphaFeather, setAlphaFeather] = useState(2);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Export State
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [exportBgColor, setExportBgColor] = useState("#ffffff");
  const [isExporting, setIsExporting] = useState(false);

  // Metadata State
  const [assetName, setAssetName] = useState(`Asset-${outfit.id.slice(0, 5)}`);
  const [assetDesc, setAssetDesc] = useState(outfit.prompt || "");

  const displayImage = processedImage || outfit.url;

  useEffect(() => {
    if (isAlphaMode) {
      handleExtractAlpha();
    } else {
      setProcessedImage(null);
    }
  }, [isAlphaMode, alphaThreshold, alphaFeather]);

  const handleExtractAlpha = async () => {
    setIsProcessing(true)
    try {
      const { ImageProcessor } = await import("../services/ImageProcessor")
      const result = await ImageProcessor.extractAlpha(
        outfit.url,
        alphaThreshold,
        alphaFeather
      )
      setProcessedImage(result)
    } catch (err) {
      console.error("Alpha extraction failed", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = async () => {
    setIsExporting(true)
    try {
      const { ImageProcessor } = await import("../services/ImageProcessor")
      const finalImage = await ImageProcessor.exportImage(
        displayImage,
        exportFormat,
        exportBgColor
      )
      const link = document.createElement("a")
      link.href = finalImage
      link.download = `${assetName}.${exportFormat === "jpeg" ? "jpg" : exportFormat}`
      link.click()
    } catch (err) {
      console.error("Export failed", err)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadLayer = (layerKey: keyof LayerData) => {
    if (!extractedLayers) return
    const link = document.createElement("a")
    link.href = extractedLayers[layerKey]
    link.download = `${assetName}-${layerKey}.png`
    link.click()
  }

  const handleDownloadAllLayers = () => {
    if (!extractedLayers) return
    const layerKeys = ["body", "clothing", "accessories", "background"] as const
    layerKeys.forEach((key) => {
      setTimeout(() => {
        handleDownloadLayer(key)
      }, 100)
    })
  }

  const getBgClass = () => {
    switch (bgMode) {
      case "checker":
        return "checker-bg";
      case "studio":
        return "bg-gradient-to-b from-graphite-800 to-graphite-950";
      case "void":
        return "bg-black";
      case "bright":
        return "bg-white";
      default:
        return "checker-bg";
    }
  };

  return (
    <div className="fixed inset-0 z-[6000] flex flex-col animate-in fade-in duration-500 overflow-hidden">
      <div
        className="absolute inset-0 bg-graphite-950/95 backdrop-blur-3xl"
        onClick={onClose}
      />

      {/* CONSOLA SUPERIOR */}
      <div className="relative z-10 h-auto min-h-[6rem] px-4 sm:px-12 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 bg-graphite-900/50 backdrop-blur-md">
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <SectionTitle className="text-white">
                Asset Inspector
              </SectionTitle>
              <div className="flex items-center gap-2 sm:gap-3 mt-1">
                <MicroLabel color="text-indigo-400">
                  Phase {outfit.evolutionStep}
                </MicroLabel>
                <MicroLabel className="hidden sm:inline">
                  Hash: {outfit.id}
                </MicroLabel>
              </div>
            </div>
          </div>
          <IconButton
            onClick={onClose}
            className="bg-white/10 sm:hidden shrink-0"
          >
            <svg
              className="w-4 h-4"
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

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <IconButton
            onClick={() => setShowMetadata(!showMetadata)}
            variant="primary"
            title="Toggle Inspector"
            className={`shrink-0 ${showMetadata ? "bg-indigo-600 text-white" : ""}`}
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </IconButton>
          <div className="w-px h-6 sm:h-8 bg-white/5 mx-1 sm:mx-2 shrink-0" />
          <Button
            onClick={() => {
              onSelectAsParent(outfit);
              onClose();
            }}
            className="px-4 sm:px-6 py-2.5 sm:py-3 shrink-0 whitespace-nowrap flex-1 sm:flex-none"
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4"
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
            Re-Forge
          </Button>
          <IconButton
            onClick={() => {
              if (confirm("Erase this genomic data?")) {
                onDelete(outfit.id);
                onClose();
              }
            }}
            variant="danger"
            title="Purge Asset"
            className="shrink-0"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </IconButton>
          <IconButton
            onClick={onClose}
            className="bg-white/10 ml-2 sm:ml-4 hidden sm:flex shrink-0"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
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
      </div>

      <div className="relative flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* VISOR PRINCIPAL */}
        <div
          className={`flex-1 relative flex items-center justify-center p-6 sm:p-12 overflow-hidden touch-none transition-colors duration-500 ${getBgClass()}`}
        >
          <div className="relative w-full h-full flex items-center justify-center overflow-auto no-scrollbar scroll-smooth">
            <div className="relative group p-10 sm:p-20">
              {bgMode === "studio" && (
                <div className="absolute inset-0 bg-indigo-600/10 blur-[100px] sm:blur-[150px] opacity-20 pointer-events-none" />
              )}
              <img
                src={displayImage}
                style={{
                  transform: `scale(${zoom})`,
                  imageRendering: "pixelated",
                  transition: "transform 0.3s cubic-bezier(0.2, 0, 0, 1)",
                }}
                className={`max-h-[70vh] sm:max-h-[85vh] object-contain select-none ${isProcessing ? "opacity-50 blur-sm" : "opacity-100 blur-0"} transition-all duration-300 ${bgMode === "studio" ? "drop-shadow-[0_0_60px_rgba(79,70,229,0.4)]" : ""}`}
                alt="Genomic Detail"
              />
            </div>
          </div>

          {/* CONTROLES DE ZOOM TÉCNICOS */}
          <div className="absolute bottom-6 sm:bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 sm:gap-8 bg-graphite-900/60 backdrop-blur-2xl px-6 sm:px-10 py-3 sm:py-5 rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-3xl">
            <IconButton
              variant="ghost"
              onClick={() => setZoom(Math.max(1, zoom - 1))}
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M20 12H4"
                />
              </svg>
            </IconButton>
            <div className="flex flex-col items-center min-w-[60px] sm:min-w-[100px]">
              <span className="text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.3em] text-indigo-500">
                {zoom.toFixed(1)}X
              </span>
              <MicroLabel>Zoom</MicroLabel>
            </div>
            <IconButton
              variant="ghost"
              onClick={() => setZoom(Math.min(10, zoom + 1))}
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </IconButton>
          </div>
        </div>

        {/* PANEL LATERAL DE DATOS */}
        {showMetadata && (
          <aside className="w-full md:w-[420px] bg-graphite-950 border-t md:border-t-0 md:border-l border-white/5 p-6 sm:p-8 flex flex-col gap-8 animate-in slide-in-from-bottom md:slide-in-from-right duration-500 max-h-[50vh] md:max-h-none overflow-y-auto no-scrollbar">
            {/* Metadata Editor */}
            <ToolSection title="Asset Metadata">
              <div className="space-y-3">
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                  placeholder="Asset Name"
                />
                <textarea
                  value={assetDesc}
                  onChange={(e) => setAssetDesc(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none h-24 resize-none"
                  placeholder="Asset Description..."
                />
              </div>
            </ToolSection>

            {/* Background Preview */}
            <ToolSection title="Environment">
              <Tabs
                options={[
                  { id: "checker", label: "Grid" },
                  { id: "studio", label: "Studio" },
                  { id: "void", label: "Void" },
                  { id: "bright", label: "Light" },
                ]}
                activeId={bgMode}
                onChange={(id) => setBgMode(id as BgMode)}
              />
            </ToolSection>

            {/* Magic Alpha Tool */}
            <ToolSection
              title="Magic Alpha"
              action={
                <button
                  onClick={() => setIsAlphaMode(!isAlphaMode)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${isAlphaMode ? "bg-indigo-500" : "bg-white/10"}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isAlphaMode ? "left-5" : "left-1"}`}
                  />
                </button>
              }
            >
              {isAlphaMode && (
                <div className="space-y-6 bg-white/[0.02] border border-white/5 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
                  <Slider
                    label="Tolerance"
                    value={alphaThreshold}
                    min={0}
                    max={100}
                    onChange={setAlphaThreshold}
                  />
                  <Slider
                    label="Feathering"
                    value={alphaFeather}
                    min={0}
                    max={10}
                    unit="px"
                    onChange={setAlphaFeather}
                  />
                </div>
              )}
            </ToolSection>

            {/* Export Options */}
            <ToolSection
              title="Export Settings"
              className="mt-auto pt-8 border-t border-white/5"
            >
              <div className="flex gap-2">
                {(["png", "jpeg", "webp"] as ExportFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setExportFormat(fmt)}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${exportFormat === fmt ? "bg-indigo-600/20 border-indigo-500 text-indigo-300" : "bg-white/5 border-transparent text-slate-500 hover:text-white"}`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

              {exportFormat === "jpeg" && (
                <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                  <MicroLabel>Matte Color</MicroLabel>
                  <input
                    type="color"
                    value={exportBgColor}
                    onChange={(e) => setExportBgColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                  />
                </div>
              )}

              <Button
                variant="primary"
                onClick={handleDownload}
                disabled={isExporting}
                className="w-full py-4 mt-4"
              >
                {isExporting ? "EXPORTING..." : "EXPORT ASSET"}
              </Button>

              <Button
                variant="secondary"
                onClick={() => setIsLayerSeparatorOpen(true)}
                className="w-full py-3 mt-3"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                LAYER SEPARATOR
              </Button>
            </ToolSection>
          </aside>
        )}
      </div>

      {providerId && apiKey && (
        <LayerSeparator
          isOpen={isLayerSeparatorOpen}
          onClose={() => setIsLayerSeparatorOpen(false)}
          sourceImage={outfit.url}
          providerId={providerId}
          apiKey={apiKey}
          onLayersExtracted={setExtractedLayers}
        />
      )}

      {extractedLayers && (
        <LayerPreview
          layers={extractedLayers}
          onClose={() => setExtractedLayers(null)}
          onDownload={handleDownloadLayer}
          onDownloadAll={handleDownloadAllLayers}
        />
      )}
    </div>
  )
}
