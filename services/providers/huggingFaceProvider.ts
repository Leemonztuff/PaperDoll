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

const HF_MODELS = {
  txt2img: "black-forest-labs/FLUX.1-dev",
  img2img: "black-forest-labs/FLUX.1-Kontext-dev",
}

export class HuggingFaceProvider implements IImageProvider {
  readonly id: ProviderId = "huggingface"
  readonly info: ProviderInfo = PROVIDER_INFO.huggingface

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
      const response = await fetch(`${HF_API_URL}/${HF_MODELS.img2img}`, {
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

      if (response.ok || response.status === 406) {
        return { success: true }
      }

      const errorText = await response.text()
      if (errorText.toLowerCase().includes("incorrect") || errorText.toLowerCase().includes("invalid")) {
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
    negativePrompt?: string,
    sourceImage?: string
  ): Promise<string> {
    const model = sourceImage ? HF_MODELS.img2img : HF_MODELS.txt2img
    
    const payload: Record<string, unknown> = {
      inputs: sourceImage || prompt,
      parameters: {
        guidance_scale: 3.5,
        num_inference_steps: 50,
        max_sequence_length: 512,
      },
      options: { wait_for_model: true, use_cache: false },
    }

    if (sourceImage) {
      payload.parameters.prompt = prompt
      if (negativePrompt) {
        payload.parameters.negative_prompt = negativePrompt
      }
    }

    const response = await fetch(`${HF_API_URL}/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HF API Error: ${response.status} - ${errorText}`)
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
    return this.generateImage(
      apiKey,
      prompts.extractDNA,
      "blurry, low quality, distorted, clothing, armor, hair",
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
    const fullPrompt = `${prompt}. Keep the exact same body pose, proportions, and silhouette. 16-bit pixel art RPG style.`
    return this.generateImage(
      apiKey,
      fullPrompt,
      "blurry, low quality, distorted, deformed",
      baseImage
    )
  }

  async extractLayer(
    apiKey: string,
    sourceImage: string,
    layerType: LayerType,
    config: ForgeConfig
  ): Promise<string> {
    const prompts = DEFAULT_PROMPTS.huggingface
    const layerPrompts: Record<LayerType, { positive: string; negative: string }> = {
      body: {
        positive: prompts.extractBody,
        negative: "clothing, armor, weapons, accessories, items, fabric",
      },
      clothing: {
        positive: prompts.extractClothing,
        negative: "body, skin, person, character, face",
      },
      accessories: {
        positive: prompts.extractAccessories,
        negative: "body, skin, clothing, fabric",
      },
      background: {
        positive: prompts.extractBackground,
        negative: "character, person, body, clothing",
      },
    }
    
    const { positive, negative } = layerPrompts[layerType]
    return this.generateImage(apiKey, positive, negative, sourceImage)
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
