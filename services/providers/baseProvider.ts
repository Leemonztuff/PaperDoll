import { ForgeConfig } from "../../types"

export type ProviderId = "google" | "huggingface" | "openrouter"

export type LayerData = {
  body: string
  clothing: string
  accessories: string
  background: string
}

export type LayerType = keyof LayerData

export const REFERENCE_SYSTEM_PROMPT = `ABSOLUTE REFERENCE RULES - NEVER DEVIATE FROM THESE:

FIXED STYLE REFERENCE:
- Character style: Ragnarok Online inspired sprite
- View angle: 3/4 quarter profile (not facing viewer)
- Art style: 16-bit Pixel Art, same shading, outlines, and detail level
- Fixed color palette: 128 colors (do not add, remove, or change any colors)

FIXED ANATOMY (NEVER CHANGE):
- Same pose as reference sprite
- Same body proportions and silhouette
- Same head shape and size
- Same torso, limbs, and extremities structure
- Same hair style and position

MANDATORY RULES:
1. KEEP exact same body pose, proportions, and silhouette
2. KEEP same pixel art style, shading, and detail level  
3. KEEP same color palette (no modifications)
4. ONLY change: clothing, accessories, and appearance details

OUTPUT: Magenta #FF00FF background for transparency.`

export type ProviderPrompts = {
  baseMannequin: string
  extractDNA: string
  synthesize: string
  extractBody: string
  extractClothing: string
  extractAccessories: string
  extractBackground: string
}

export type ProviderInfo = {
  id: ProviderId
  name: string
  description: string
  model: string
  freeTier: string
  website: string
}

export type ProviderConfig = {
  prompts: ProviderPrompts
  aspectRatio?: string
}

export type IImageProvider = {
  readonly id: ProviderId
  readonly info: ProviderInfo

  testConnection(apiKey: string): Promise<{ success: boolean; error?: string }>

  generateBaseMannequin(apiKey: string, config: ForgeConfig): Promise<string>

  extractBaseDNA(apiKey: string, sourceImage: string, config: ForgeConfig): Promise<string>

  synthesizeEvolution(
    apiKey: string,
    baseImage: string,
    parentUrl: string | null,
    prompt: string,
    config: ForgeConfig
  ): Promise<string>

  extractLayer(
    apiKey: string,
    sourceImage: string,
    layerType: LayerType,
    config: ForgeConfig
  ): Promise<string>

  extractAllLayers(
    apiKey: string,
    sourceImage: string,
    config: ForgeConfig
  ): Promise<LayerData>
}

export const DEFAULT_PROMPTS: Record<ProviderId, ProviderPrompts> = {
  google: {
    baseMannequin:
      "Create a professional RPG base character mannequin. Front view, T-pose or neutral standing, NO HAIR, NO CLOTHES, NO EQUIPMENT. Simple neutral gray or skin-tone anatomical base. High-quality 16-bit Pixel Art. Background: Magenta #FF00FF for transparency.",
    extractDNA:
      "GAME-READY ASSET ENGINE: DNA EXTRACTOR.\n1. Extract the base mannequin anatomy from the image.\n2. REMOVE all clothing, armor, hair, and items.\n3. Render ONLY a clean nude or neutral skin-tight base humanoid.\n4. STYLE: Professional RPG Pixel Art.\n5. BACKGROUND: Pure Magenta #FF00FF.",
    synthesize:
      "GAME-READY ASSET ENGINE: OUTFIT FORGE.\nApply new gear to the BASE DNA mannequin.\n1. MAINTAIN EXACT ANATOMY.\n2. ADD OUTFIT: Only requested clothes.\n3. PIXEL ART.\n4. BACKGROUND: #FF00FF.",
    extractBody:
      "PIXEL ART LAYER EXTRACTOR: BODY LAYER. Extract ONLY the character body/skin layer. Remove ALL clothing, armor, weapons, accessories. Keep ONLY skin/body pixels. Background: Pure Magenta #FF00FF.",
    extractClothing:
      "PIXEL ART LAYER EXTRACTOR: CLOTHING LAYER. Extract ONLY the clothing and armor layer. Remove the character body/skin (make transparent with #FF00FF). Keep ONLY clothing, armor, fabric textures. Background: Pure Magenta #FF00FF.",
    extractAccessories:
      "PIXEL ART LAYER EXTRACTOR: ACCESSORIES LAYER. Extract ONLY accessories: weapons, shields, helmets, jewelry, held items. Remove character body and clothing. Keep ONLY accessories, equipment, held items. Background: Pure Magenta #FF00FF.",
    extractBackground:
      "PIXEL ART LAYER EXTRACTOR: BACKGROUND LAYER. Extract ONLY the background elements. Remove character, clothing, and all accessories. Keep ONLY background pixels. If no background exists, return magenta image.",
  },
  huggingface: {
    baseMannequin:
      "pixel art RPG character base mannequin, front view, T-pose, no clothes, no hair, no equipment, neutral gray body, transparent background #FF00FF, 16-bit style, game asset",
    extractDNA:
      "pixel art: extract body only, remove all clothes, armor, hair and items, keep only clean humanoid base mannequin, transparent background, game asset style",
    synthesize:
      "pixel art RPG character: {PROMPT}, maintain body proportions, transparent background #FF00FF, 16-bit game asset style",
    extractBody:
      "pixel art layer: body/skin only, remove clothes and items, transparent background",
    extractClothing:
      "pixel art layer: clothing/armor only, remove body, transparent background",
    extractAccessories:
      "pixel art layer: weapons, helmets, accessories only, transparent background",
    extractBackground:
      "pixel art layer: background environment only, remove character",
  },
  openrouter: {
    baseMannequin:
      "Create a professional RPG base character mannequin. Front view, T-pose or neutral standing, NO HAIR, NO CLOTHES, NO EQUIPMENT. Simple neutral gray or skin-tone anatomical base. High-quality 16-bit Pixel Art. Background: Magenta #FF00FF for transparency.",
    extractDNA:
      "GAME-READY ASSET ENGINE: DNA EXTRACTOR.\n1. Extract the base mannequin anatomy from the image.\n2. REMOVE all clothing, armor, hair, and items.\n3. Render ONLY a clean nude or neutral skin-tight base humanoid.\n4. STYLE: Professional RPG Pixel Art.\n5. BACKGROUND: Pure Magenta #FF00FF.",
    synthesize:
      "GAME-READY ASSET ENGINE: OUTFIT FORGE.\nApply new gear to the BASE DNA mannequin.\n1. MAINTAIN EXACT ANATOMY.\n2. ADD OUTFIT: Only requested clothes.\n3. PIXEL ART.\n4. BACKGROUND: #FF00FF.",
    extractBody:
      "PIXEL ART LAYER EXTRACTOR: BODY LAYER. Extract ONLY the character body/skin layer. Remove ALL clothing, armor, weapons, accessories. Keep ONLY skin/body pixels. Background: Pure Magenta #FF00FF.",
    extractClothing:
      "PIXEL ART LAYER EXTRACTOR: CLOTHING LAYER. Extract ONLY the clothing and armor layer. Remove the character body/skin (make transparent with #FF00FF). Keep ONLY clothing, armor, fabric textures. Background: Pure Magenta #FF00FF.",
    extractAccessories:
      "PIXEL ART LAYER EXTRACTOR: ACCESSORIES LAYER. Extract ONLY accessories: weapons, shields, helmets, jewelry, held items. Remove character body and clothing. Keep ONLY accessories, equipment, held items. Background: Pure Magenta #FF00FF.",
    extractBackground:
      "PIXEL ART LAYER EXTRACTOR: BACKGROUND LAYER. Extract ONLY the background elements. Remove character, clothing, and all accessories. Keep ONLY background pixels. If no background exists, return magenta image.",
  },
}

export const PROVIDER_INFO: Record<ProviderId, ProviderInfo> = {
  google: {
    id: "google",
    name: "Google Gemini",
    description: "Original Nano Banana models by Google",
    model: "gemini-2.5-flash-image",
    freeTier: "500 requests/day",
    website: "https://aistudio.google.com",
  },
  huggingface: {
    id: "huggingface",
    name: "Hugging Face",
    description: "FLUX Kontext for img2img, FLUX Dev for txt2img",
    model: "black-forest-labs/FLUX.1-Kontext-dev",
    freeTier: "~100 requests/hour",
    website: "https://huggingface.co",
  },
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    description: "Gemini via OpenRouter gateway",
    model: "google/gemini-2.5-flash-image-preview",
    freeTier: "Variable by model",
    website: "https://openrouter.ai",
  },
}
