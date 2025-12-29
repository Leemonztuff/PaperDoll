
export type ImageSize = '1K' | '2K' | '4K';
export type ModelType = 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview';
export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
export type BackgroundStyle = 'magenta' | 'white' | 'gray' | 'gradient';
export type ForgeMode = 'Draft' | 'Master';

export interface NeuralNode {
  id: string;
  label: string;
  description: string;
  instruction: string;
  isActive: boolean;
  isLocked?: boolean;
}

export interface NeuralMacro {
  id: string;
  name: string;
  icon: string;
  description: string;
  nodesToDisable: string[];
  mutationStrength: number;
  promptSuffix: string;
  color: string;
}

export interface RenderingProtocols {
  backgroundStyle: BackgroundStyle;
  pixelPerfect: boolean;
  strongOutline: boolean;
  hd2dStyle: boolean;
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
  evolutionStep: number;
  mode: ForgeMode;
}

export interface ForgeConfig {
  model: ModelType;
  size: ImageSize;
  aspectRatio: AspectRatio;
  mutationStrength: number;
  mode: ForgeMode;
  protocols: RenderingProtocols;
  neuralChain: NeuralNode[];
  activeMacroId?: string;
}

export interface AppState {
  baseImage: string | null;
  activeParent: GeneratedOutfit | null;
  outfits: GeneratedOutfit[];
  isGenerating: boolean;
  config: ForgeConfig;
  error: string | null;
}
