
export type ImageSize = '1K' | '2K' | '4K';
export type ModelType = 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview';
export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export interface RenderingProtocols {
  magentaBackground: boolean;
  pixelPerfect: boolean;
  strongOutline: boolean;
  hd2dStyle: boolean;
}

export interface OutlineConfig {
  enabled: boolean;
  color: string;
  thickness: 'thin' | 'medium' | 'bold';
  glow: boolean;
}

export interface GeneratedOutfit {
  id: string;
  url: string;
  originalUrl: string;
  parentId?: string;
  prompt: string;
  timestamp: number;
  model: ModelType;
  aspectRatio: AspectRatio;
  outline?: OutlineConfig;
  evolutionStep: number;
}

export interface AppState {
  baseImage: string | null;
  activeEvolutionParent: GeneratedOutfit | null;
  outfits: GeneratedOutfit[];
  isGenerating: boolean;
  selectedModel: ModelType;
  selectedSize: ImageSize;
  selectedAspectRatio: AspectRatio;
  outline: OutlineConfig;
  error: string | null;
  isCharacterSheetMode: boolean;
  mutationStrength: number;
  renderingProtocols: RenderingProtocols;
}
