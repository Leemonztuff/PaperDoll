import { GoogleGenAI, GenerateContentResponse } from "@google/genai"
import { ForgeConfig } from "../../types"
import {
  IImageProvider,
  ProviderId,
  ProviderInfo,
  LayerData,
  LayerType,
  ProviderPrompts,
  PROVIDER_INFO,
  DEFAULT_PROMPTS,
  REFERENCE_SYSTEM_PROMPT,
} from "./baseProvider"

const MANNEQUIN_SYSTEM_INSTRUCTION = `You are a master RPG pixel artist. Generate clean, game-ready base mannequins for character design. No clothing allowed.

CRITICAL STYLE REFERENCE:
- View: 3/4 quarter profile (not facing viewer)
- Style: 16-bit Pixel Art, Ragnarok Online inspired
- Palette: 128 fixed colors
- Output: Magenta #FF00FF background`

const SYNTHESIS_SYSTEM_INSTRUCTION = `You are a professional game asset creator. Apply clothing to mannequin bases.

ABSOLUTE REFERENCE RULES:
- KEEP same body pose, proportions, silhouette
- KEEP same pixel art style, shading, outlines
- KEEP same color palette (128 colors, do not modify)
- ONLY change clothing, accessories, appearance
- Output: Magenta #FF00FF background

USER PROMPT: Change clothing and accessories only.`

export class GoogleProvider implements IImageProvider {
  readonly id: ProviderId = "google"
  readonly info: ProviderInfo = PROVIDER_INFO.google

  private getClient(apiKey: string): GoogleGenAI {
    return new GoogleGenAI({ apiKey })
  }

  private stripBase64(url: string): string {
    return url.split(",")[1] || url
  }

  async testConnection(apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const ai = this.getClient(apiKey)
      const response = await ai.models.generateContent({
        model: this.info.model,
        contents: { parts: [{ text: "test" }] },
        config: { maxOutputTokens: 1 },
      })

      if (response.text !== undefined) {
        return { success: true }
      }
      return { success: false, error: "Invalid response from API" }
    } catch (error: any) {
      return { success: false, error: error.message || "Connection failed" }
    }
  }

  async generateBaseMannequin(
    apiKey: string,
    config: ForgeConfig
  ): Promise<string> {
    const ai = this.getClient(apiKey)
    const prompts = DEFAULT_PROMPTS.google

    const response = await ai.models.generateContent({
      model: config.model || this.info.model,
      contents: { parts: [{ text: prompts.baseMannequin }] },
      config: {
        imageConfig: { aspectRatio: config.aspectRatio },
        systemInstruction: MANNEQUIN_SYSTEM_INSTRUCTION,
      },
    })

    const imagePart = response.candidates?.[0]?.content?.parts.find(
      (p) => p.inlineData
    )
    if (imagePart?.inlineData) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
    }
    throw new Error("No se pudo generar el maniquí.")
  }

  async extractBaseDNA(
    apiKey: string,
    sourceImage: string,
    config: ForgeConfig
  ): Promise<string> {
    const ai = this.getClient(apiKey)
    const prompts = DEFAULT_PROMPTS.google
    const mimeType = sourceImage.match(/data:([^;]+);/)?.[1] || "image/jpeg"

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: config.model || this.info.model,
      contents: {
        parts: [
          {
            inlineData: { data: this.stripBase64(sourceImage), mimeType },
          },
          { text: prompts.extractDNA },
        ],
      },
      config: {
        systemInstruction: REFERENCE_SYSTEM_PROMPT + "\n\nExtract only the body/mannequin. Remove all clothing.",
        imageConfig: { aspectRatio: config.aspectRatio },
      },
    })

    const imagePart = response.candidates?.[0]?.content?.parts.find(
      (p) => p.inlineData
    )
    if (imagePart?.inlineData) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
    }
    throw new Error("Error extrayendo base.")
  }

  async synthesizeEvolution(
    apiKey: string,
    baseImage: string,
    parentUrl: string | null,
    prompt: string,
    config: ForgeConfig
  ): Promise<string> {
    const ai = this.getClient(apiKey)
    const baseMimeType = baseImage.match(/data:([^;]+);/)?.[1] || "image/jpeg"

    const contents: any = {
      parts: [
        {
          inlineData: { data: this.stripBase64(baseImage), mimeType: baseMimeType },
        },
        { text: "REF A: BASE DNA - This is the reference character. KEEP EXACTLY the same pose, proportions, silhouette, and style." },
      ],
    }

    if (parentUrl) {
      const parentMimeType = parentUrl.match(/data:([^;]+);/)?.[1] || "image/jpeg"
      contents.parts.push({
        inlineData: { data: this.stripBase64(parentUrl), mimeType: parentMimeType },
      })
      contents.parts.push({ text: "REF B: CURRENT OUTFIT" })
    }

    contents.parts.push({ text: `FORGE: ${prompt}` })

    const response = await ai.models.generateContent({
      model: config.model || this.info.model,
      contents,
      config: {
        systemInstruction: SYNTHESIS_SYSTEM_INSTRUCTION,
        imageConfig: { aspectRatio: config.aspectRatio },
      },
    })

    const imagePart = response.candidates?.[0]?.content?.parts.find(
      (p) => p.inlineData
    )
    if (imagePart?.inlineData) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
    }
    throw new Error("La síntesis falló.")
  }

  async extractLayer(
    apiKey: string,
    sourceImage: string,
    layerType: LayerType,
    config: ForgeConfig
  ): Promise<string> {
    const ai = this.getClient(apiKey)
    const prompts = DEFAULT_PROMPTS.google
    const mimeType = sourceImage.match(/data:([^;]+);/)?.[1] || "image/jpeg"

    const layerPrompts: Record<LayerType, string> = {
      body: prompts.extractBody,
      clothing: prompts.extractClothing,
      accessories: prompts.extractAccessories,
      background: prompts.extractBackground,
    }

    const response = await ai.models.generateContent({
      model: config.model || this.info.model,
      contents: {
        parts: [
          {
            inlineData: { data: this.stripBase64(sourceImage), mimeType },
          },
          { text: layerPrompts[layerType] },
        ],
      },
      config: {
        systemInstruction: REFERENCE_SYSTEM_PROMPT,
        imageConfig: { aspectRatio: config.aspectRatio },
      },
    })

    const imagePart = response.candidates?.[0]?.content?.parts.find(
      (p) => p.inlineData
    )
    if (imagePart?.inlineData) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
    }
    throw new Error(`Error extracting ${layerType} layer`)
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

export const googleProvider = new GoogleProvider()
