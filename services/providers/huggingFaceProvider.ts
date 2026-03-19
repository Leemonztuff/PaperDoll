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

const HF_API_URL = "https://api-inference.huggingface.co/models"

export class HuggingFaceProvider implements IImageProvider {
  readonly id: ProviderId = "huggingface"
  readonly info: ProviderInfo = PROVIDER_INFO.huggingface

  private model = "black-forest-labs/FLUX.1-dev"

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
      const response = await fetch(`${HF_API_URL}/stabilityai/stable-diffusion-xl-base-1.0`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: "test",
          options: { wait_for_model: true },
        }),
      })

      if (response.ok) {
        return { success: true }
      }

      const errorText = await response.text()
      if (errorText.includes("incorrect api key")) {
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
    negativePrompt?: string
  ): Promise<string> {
    const response = await fetch(`${HF_API_URL}/${this.model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt: negativePrompt || "blurry, low quality, distorted",
          guidance_scale: 7.5,
          num_inference_steps: 30,
          width: 1024,
          height: 1024,
        },
        options: { wait_for_model: true, use_cache: false },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HF API Error: ${errorText}`)
    }

    const blob = await response.blob()
    const buffer = await blob.arrayBuffer()
    return this.arrayBufferToBase64(buffer, blob.type || "image/png")
  }

  async generateBaseMannequin(
    apiKey: string,
    config: ForgeConfig
  ): Promise<string> {
    const prompts = DEFAULT_PROMPTS.huggingface
    return this.generateImage(apiKey, prompts.baseMannequin)
  }

  async extractBaseDNA(
    apiKey: string,
    sourceImage: string,
    config: ForgeConfig
  ): Promise<string> {
    const prompts = DEFAULT_PROMPTS.huggingface
    return this.generateImage(apiKey, prompts.extractDNA)
  }

  async synthesizeEvolution(
    apiKey: string,
    baseImage: string,
    parentUrl: string | null,
    prompt: string,
    config: ForgeConfig
  ): Promise<string> {
    const fullPrompt = `${prompt}, pixel art RPG character, maintain proportions, 16-bit game style`
    return this.generateImage(apiKey, fullPrompt)
  }

  async extractLayer(
    apiKey: string,
    sourceImage: string,
    layerType: LayerType,
    config: ForgeConfig
  ): Promise<string> {
    const prompts = DEFAULT_PROMPTS.huggingface
    const layerPrompts: Record<LayerType, string> = {
      body: prompts.extractBody,
      clothing: prompts.extractClothing,
      accessories: prompts.extractAccessories,
      background: prompts.extractBackground,
    }
    return this.generateImage(apiKey, layerPrompts[layerType])
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

export const huggingFaceProvider = new HuggingFaceProvider()
