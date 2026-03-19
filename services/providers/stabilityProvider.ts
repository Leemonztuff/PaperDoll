import { ForgeConfig } from "../../types"
import {
  IImageProvider,
  ProviderId,
  ProviderInfo,
  LayerData,
  LayerType,
  PROVIDER_INFO,
  DEFAULT_PROMPTS,
} from "./baseProvider"

const STABILITY_API_URL = "https://api.stability.ai/v1"

const STABILITY_ENGINE = "stable-diffusion-xl-1024-v1-0"

export class StabilityProvider implements IImageProvider {
  readonly id: ProviderId = "stability"
  readonly info: ProviderInfo = PROVIDER_INFO.stability

  private stripBase64(url: string): string {
    return url.split(",")[1] || url
  }

  private arrayBufferToBase64(buffer: ArrayBuffer, mimeType: string): string {
    const base64 = btoa(
      new Uint8Array(buffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    )
    return `data:${mimeType};base64,${base64}`
  }

  async testConnection(apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${STABILITY_API_URL}/account/balance`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })

      if (response.ok) {
        return { success: true }
      }

      if (response.status === 401) {
        return { success: false, error: "Invalid API key" }
      }

      return { success: false, error: `API error: ${response.status}` }
    } catch (error: any) {
      return { success: false, error: error.message || "Connection failed" }
    }
  }

  private async generateImage(
    apiKey: string,
    prompt: string,
    sourceImage?: string
  ): Promise<string> {
    const formData = new FormData()

    formData.append("prompt", prompt)
    formData.append("negative_prompt", "blurry, low quality, distorted, deformed, bad anatomy")

    if (sourceImage) {
      const imageBuffer = Uint8Array.from(atob(this.stripBase64(sourceImage)), c => c.charCodeAt(0))
      const imageBlob = new Blob([imageBuffer], { type: "image/png" })
      formData.append("image", imageBlob, "image.png")
    }

    const response = await fetch(`${STABILITY_API_URL}/generation/${STABILITY_ENGINE}/image-to-image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Stability AI Error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    if (!result.artifacts || result.artifacts.length === 0) {
      throw new Error("No image generated")
    }

    const base64 = result.artifacts[0].base64
    return `data:image/png;base64,${base64}`
  }

  async generateBaseMannequin(
    apiKey: string,
    config: ForgeConfig
  ): Promise<string> {
    const prompts = DEFAULT_PROMPTS.stability || DEFAULT_PROMPTS.google
    return this.generateImage(apiKey, prompts.baseMannequin)
  }

  async extractBaseDNA(
    apiKey: string,
    sourceImage: string,
    config: ForgeConfig
  ): Promise<string> {
    const prompts = DEFAULT_PROMPTS.stability || DEFAULT_PROMPTS.google
    return this.generateImage(
      apiKey,
      prompts.extractDNA,
      sourceImage
    )
  }

  async synthesizeEvolution(
    apiKey: string,
    baseImage: string,
    parentUrl: string | null,
    prompt: string,
    config: ForgeConfig
  ): Promise<string> {
    const fullPrompt = `${prompt}. Maintain exact body pose and proportions. 16-bit pixel art RPG style. Magenta background #FF00FF for transparency.`
    return this.generateImage(apiKey, fullPrompt, baseImage)
  }

  async extractLayer(
    apiKey: string,
    sourceImage: string,
    layerType: LayerType,
    config: ForgeConfig
  ): Promise<string> {
    const layerPrompts: Record<LayerType, string> = {
      body: "Extract only the character body/skin layer. Remove ALL clothing, armor, weapons, accessories. Keep ONLY skin/body pixels. Transparent background #FF00FF.",
      clothing: "Extract only the clothing and armor layer. Remove the character body/skin. Keep ONLY clothing, armor, fabric textures. Transparent background #FF00FF.",
      accessories: "Extract only accessories: weapons, shields, helmets, jewelry, held items. Remove character body and clothing. Transparent background #FF00FF.",
      background: "Extract ONLY the background elements. Remove character, clothing, and all accessories. Keep ONLY background pixels.",
    }

    return this.generateImage(apiKey, layerPrompts[layerType], sourceImage)
  }

  async extractAllLayers(
    apiKey: string,
    sourceImage: string,
    config: ForgeConfig
  ): Promise<LayerData> {
    const [body, clothing, accessories, background] = await Promise.all([
      this.extractLayer(apiKey, sourceImage, "body", config),
      this.extractLayer(apiKey, sourceImage, "clothing", config),
      this.extractLayer(apiKey, sourceImage, "accessories", config),
      this.extractLayer(apiKey, sourceImage, "background", config),
    ])

    return { body, clothing, accessories, background }
  }
}

export const stabilityProvider = new StabilityProvider()
