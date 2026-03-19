import { ForgeConfig } from "../../types"
import {
  IImageProvider,
  ProviderId,
  ProviderInfo,
  LayerData,
  LayerType,
  PROVIDER_INFO,
  DEFAULT_PROMPTS,
  REFERENCE_SYSTEM_PROMPT,
} from "./baseProvider"

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

const MANNEQUIN_SYSTEM_INSTRUCTION = `You are a master RPG pixel artist. Generate clean, game-ready base mannequins for character design. No clothing allowed.

CRITICAL STYLE REFERENCE:
- View: 3/4 quarter profile (not facing viewer)
- Style: 16-bit Pixel Art, Ragnarok Online inspired
- Palette: 128 fixed colors
- Output: Magenta #FF00FF background`

const SYNTHESIS_SYSTEM_INSTRUCTION = `ABSOLUTE REFERENCE RULES:
- KEEP same body pose, proportions, silhouette
- KEEP same pixel art style, shading, outlines
- KEEP same color palette (128 colors, do not modify)
- ONLY change clothing, accessories, appearance
- Output: Magenta #FF00FF background`

export class OpenRouterProvider implements IImageProvider {
  readonly id: ProviderId = "openrouter"
  readonly info: ProviderInfo = PROVIDER_INFO.openrouter

  private model = "google/gemini-2.5-flash-image-preview"

  async testConnection(apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://github.com",
          "X-Title": "SpriteForge",
        },
        body: JSON.stringify({
          model: this.model,
          modalities: ["text", "image"],
          messages: [{ role: "user", content: "test" }],
          max_tokens: 10,
        }),
      })

      if (response.ok) {
        return { success: true }
      }

      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.error?.message || `API error: ${response.status}`,
      }
    } catch (error: any) {
      return { success: false, error: error.message || "Connection failed" }
    }
  }

  private async generateContent(
    apiKey: string,
    prompt: string,
    systemInstruction?: string
  ): Promise<string> {
    const messages: any[] = []

    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction })
    }

    messages.push({ role: "user", content: [{ type: "text", text: prompt }] })

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com",
        "X-Title": "SpriteForge",
      },
      body: JSON.stringify({
        model: this.model,
        modalities: ["text", "image"],
        messages,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `API error: ${response.status}`)
    }

    const data = await response.json()

    const content = data.choices?.[0]?.message?.content

    if (typeof content === "string") {
      const imageMatch = content.match(
        /data:image\/([a-zA-Z0-9+]+);base64,([^\s"')]+)/
      )
      if (imageMatch) {
        return `data:image/${imageMatch[1]};base64,${imageMatch[2]}`
      }
    }

    if (Array.isArray(content)) {
      for (const part of content) {
        if (part.type === "image_url") {
          const url = part.image_url?.url || part.url
          if (url.startsWith("data:")) {
            return url
          }
          if (url.startsWith("http")) {
            const imgResponse = await fetch(url)
            const blob = await imgResponse.blob()
            const buffer = await blob.arrayBuffer()
            return this.arrayBufferToBase64(buffer, blob.type)
          }
        }
      }
    }

    throw new Error("No image generated in response")
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

  async generateBaseMannequin(
    apiKey: string,
    config: ForgeConfig
  ): Promise<string> {
    const prompts = DEFAULT_PROMPTS.openrouter
    return this.generateContent(
      apiKey,
      prompts.baseMannequin,
      MANNEQUIN_SYSTEM_INSTRUCTION
    )
  }

  async extractBaseDNA(
    apiKey: string,
    sourceImage: string,
    config: ForgeConfig
  ): Promise<string> {
    const prompts = DEFAULT_PROMPTS.openrouter
    const imageData = this.prepareImageForOpenRouter(sourceImage)

    const content = [
      { type: "text", text: prompts.extractDNA },
      { type: "image_url", image_url: { url: imageData } },
    ]

    return this.generateContentWithImages(
      apiKey,
      content,
      prompts.extractDNA,
      REFERENCE_SYSTEM_PROMPT + "\n\nExtract only the body/mannequin. Remove all clothing."
    )
  }

  async synthesizeEvolution(
    apiKey: string,
    baseImage: string,
    parentUrl: string | null,
    prompt: string,
    config: ForgeConfig
  ): Promise<string> {
    const baseImageData = this.prepareImageForOpenRouter(baseImage)

    const content: any[] = [
      { type: "text", text: "REF A: BASE DNA - KEEP EXACTLY the same pose, proportions, silhouette, and style." },
      { type: "image_url", image_url: { url: baseImageData } },
    ]

    if (parentUrl) {
      const parentImageData = this.prepareImageForOpenRouter(parentUrl)
      content.push({ type: "text", text: "REF B: CURRENT OUTFIT" })
      content.push({ type: "image_url", image_url: { url: parentImageData } })
    }

    content.push({ type: "text", text: `FORGE: ${prompt}` })

    return this.generateContentWithImages(apiKey, content, prompt, SYNTHESIS_SYSTEM_INSTRUCTION)
  }

  private prepareImageForOpenRouter(dataUrl: string): string {
    if (dataUrl.startsWith("data:")) {
      return dataUrl
    }
    return `data:image/png;base64,${dataUrl}`
  }

  private async generateContentWithImages(
    apiKey: string,
    content: any[],
    fallbackPrompt: string,
    systemInstruction?: string
  ): Promise<string> {
    const messages: any[] = []

    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction })
    }

    messages.push({ role: "user", content })

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com",
        "X-Title": "SpriteForge",
      },
      body: JSON.stringify({
        model: this.model,
        modalities: ["text", "image"],
        messages,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `API error: ${response.status}`)
    }

    const data = await response.json()
    const responseContent = data.choices?.[0]?.message?.content

    if (Array.isArray(responseContent)) {
      for (const part of responseContent) {
        if (part.type === "image_url") {
          const url = part.image_url?.url || part.url
          if (url.startsWith("data:")) {
            return url
          }
        }
      }
    }

    if (typeof responseContent === "string") {
      const imageMatch = responseContent.match(
        /data:image\/([a-zA-Z0-9+]+);base64,([^\s"')]+)/
      )
      if (imageMatch) {
        return `data:image/${imageMatch[1]};base64,${imageMatch[2]}`
      }
    }

    throw new Error("No image in response")
  }

  async extractLayer(
    apiKey: string,
    sourceImage: string,
    layerType: LayerType,
    config: ForgeConfig
  ): Promise<string> {
    const prompts = DEFAULT_PROMPTS.openrouter
    const imageData = this.prepareImageForOpenRouter(sourceImage)

    const layerPrompts: Record<LayerType, string> = {
      body: prompts.extractBody,
      clothing: prompts.extractClothing,
      accessories: prompts.extractAccessories,
      background: prompts.extractBackground,
    }

    const content = [
      { type: "text", text: layerPrompts[layerType] },
      { type: "image_url", image_url: { url: imageData } },
    ]

    return this.generateContentWithImages(apiKey, content, layerPrompts[layerType])
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

export const openRouterProvider = new OpenRouterProvider()
