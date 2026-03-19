import { ForgeConfig } from "../types"
import type { ProviderId, LayerData, LayerType, IImageProvider, ProviderInfo } from "./providers/baseProvider"
import { PROVIDER_INFO } from "./providers/baseProvider"
import { googleProvider, huggingFaceProvider, openRouterProvider, stabilityProvider } from "./providers"

export type { LayerData, LayerType, ProviderId, ProviderInfo }
export { PROVIDER_INFO }

export class ImageService {
  private static getProvider(providerId: ProviderId): IImageProvider {
    switch (providerId) {
      case "google":
        return googleProvider
      case "huggingface":
        return huggingFaceProvider
      case "openrouter":
        return openRouterProvider
      case "stability":
        return stabilityProvider
      default:
        throw new Error(`Unknown provider: ${providerId}`)
    }
  }

  static async testConnection(
    providerId: ProviderId,
    apiKey: string
  ): Promise<{ success: boolean; error?: string }> {
    const provider = this.getProvider(providerId)
    return provider.testConnection(apiKey)
  }

  static async generateBaseMannequin(
    providerId: ProviderId,
    apiKey: string,
    config: ForgeConfig
  ): Promise<string> {
    const provider = this.getProvider(providerId)
    return provider.generateBaseMannequin(apiKey, config)
  }

  static async extractBaseDNA(
    providerId: ProviderId,
    apiKey: string,
    sourceImage: string,
    config: ForgeConfig
  ): Promise<string> {
    const provider = this.getProvider(providerId)
    return provider.extractBaseDNA(apiKey, sourceImage, config)
  }

  static async synthesizeEvolution(
    providerId: ProviderId,
    apiKey: string,
    baseImage: string,
    parentUrl: string | null,
    prompt: string,
    config: ForgeConfig
  ): Promise<string> {
    const provider = this.getProvider(providerId)
    return provider.synthesizeEvolution(apiKey, baseImage, parentUrl, prompt, config)
  }

  static async extractLayer(
    providerId: ProviderId,
    apiKey: string,
    sourceImage: string,
    layerType: LayerType,
    config: ForgeConfig
  ): Promise<string> {
    const provider = this.getProvider(providerId)
    return provider.extractLayer(apiKey, sourceImage, layerType, config)
  }

  static async extractAllLayers(
    providerId: ProviderId,
    apiKey: string,
    sourceImage: string,
    config: ForgeConfig
  ): Promise<LayerData> {
    const provider = this.getProvider(providerId)
    return provider.extractAllLayers(apiKey, sourceImage, config)
  }

  static getProviderInfo(providerId: ProviderId) {
    return PROVIDER_INFO[providerId]
  }

  static getAllProviders(): ProviderId[] {
    return ["google", "huggingface", "openrouter", "stability"]
  }
}
