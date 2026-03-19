import { GoogleGenAI, GenerateContentResponse } from "@google/genai"
import { ForgeConfig } from "../types"
import { ApiKeyService, QuotaService } from "./apiKeyService"

export interface LayerData {
  body: string
  clothing: string
  accessories: string
  background: string
}

export type LayerType = "body" | "clothing" | "accessories" | "background"

export class GeminiService {
  private static getClient(): GoogleGenAI {
    const apiKey = ApiKeyService.getKey();

    if (!apiKey) {
      throw new Error("API_KEY_MISSING");
    }
    return new GoogleGenAI({ apiKey });
  }

  private static checkQuota(): void {
    if (QuotaService.isQuotaExceeded()) {
      throw new Error("QUOTA_EXCEEDED");
    }
  }

  private static trackUsage(): void {
    QuotaService.incrementUsage();
  }

  static async generateBaseMannequin(config: ForgeConfig): Promise<string> {
    this.checkQuota();
    const ai = this.getClient();
    const prompt = "Create a professional RPG base character mannequin. Front view, T-pose or neutral standing, NO HAIR, NO CLOTHES, NO EQUIPMENT. Simple neutral gray or skin-tone anatomical base. High-quality 16-bit Pixel Art. Background: Magenta #FF00FF for transparency.";
    
    try {
      const response = await ai.models.generateContent({
        model: config.model,
        contents: { parts: [{ text: prompt }] },
        config: { 
          imageConfig: { aspectRatio: config.aspectRatio },
          systemInstruction: "You are a master RPG pixel artist. Generate clean, game-ready base mannequins for character design. No clothing allowed."
        },
      });

      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        this.trackUsage();
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      }
      throw new Error("No se pudo generar el maniquí.");
    } catch (error: any) {
      this.handleApiError(error);
      throw error;
    }
  }

  static async extractBaseDNA(sourceImage: string, config: ForgeConfig): Promise<string> {
    this.checkQuota();
    const ai = this.getClient();
    const systemInstruction = `
      GAME-READY ASSET ENGINE: DNA EXTRACTOR.
      1. Extract the base mannequin anatomy from the image.
      2. REMOVE all clothing, armor, hair, and items.
      3. Render ONLY a clean "nude" or neutral skin-tight base humanoid.
      4. STYLE: Professional RPG Pixel Art.
      5. BACKGROUND: Pure Magenta (#FF00FF).
    `;

    const mimeType = sourceImage.match(/data:([^;]+);/)?.[1] || 'image/jpeg';

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: config.model,
        contents: {
          parts: [
            { inlineData: { data: this.stripBase64(sourceImage), mimeType } },
            { text: "STRIP ALL CLOTHES AND HAIR. RETURN CLEAN MANNEQUIN BASE." }
          ]
        },
        config: { systemInstruction, imageConfig: { aspectRatio: config.aspectRatio } },
      });

      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        this.trackUsage();
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      }
      throw new Error("Error extrayendo base.");
    } catch (error: any) {
      this.handleApiError(error);
      throw error;
    }
  }

  static async synthesizeEvolution(baseImage: string, parentUrl: string | null, prompt: string, config: ForgeConfig): Promise<string> {
    this.checkQuota();
    const ai = this.getClient();
    const systemInstruction = `
      GAME-READY ASSET ENGINE: OUTFIT FORGE.
      Apply new gear to the BASE DNA mannequin.
      1. MAINTAIN EXACT ANATOMY.
      2. ADD OUTFIT: Only requested clothes.
      3. PIXEL ART.
      4. BACKGROUND: #FF00FF.
    `;

    const baseMimeType = baseImage.match(/data:([^;]+);/)?.[1] || 'image/jpeg';
    const contents: any = {
      parts: [
        { inlineData: { data: this.stripBase64(baseImage), mimeType: baseMimeType } },
        { text: "REF A: BASE DNA" }
      ]
    };

    if (parentUrl) {
      const parentMimeType = parentUrl.match(/data:([^;]+);/)?.[1] || 'image/jpeg';
      contents.parts.push({ inlineData: { data: this.stripBase64(parentUrl), mimeType: parentMimeType } });
      contents.parts.push({ text: "REF B: CURRENT" });
    }

    contents.parts.push({ text: `FORGE: ${prompt}` });

    try {
      const response = await ai.models.generateContent({
        model: config.model,
        contents,
        config: { systemInstruction, imageConfig: { aspectRatio: config.aspectRatio } },
      });

      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        this.trackUsage();
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      }
      throw new Error("La síntesis falló.");
    } catch (error: any) {
      this.handleApiError(error);
      throw error;
    }
  }

  static async enhancePrompt(prompt: string): Promise<string> {
    this.checkQuota()
    const ai = this.getClient()
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Enhance for pixel art RPG: ${prompt}`,
      })
      this.trackUsage()
      return response.text?.trim() || prompt
    } catch (error: any) {
      this.handleApiError(error)
      throw error
    }
  }

  static async extractLayer(
    sourceImage: string,
    layerType: LayerType,
    config: ForgeConfig
  ): Promise<string> {
    this.checkQuota()
    const ai = this.getClient()

    const layerPrompts: Record<LayerType, { system: string; user: string }> = {
      body: {
        system: `PIXEL ART LAYER EXTRACTOR: BODY LAYER
Extract ONLY the character body/skin layer.
- Remove ALL clothing, armor, weapons, accessories
- Keep ONLY skin/body pixels
- Background: Pure Magenta #FF00FF for transparent areas
- Maintain exact pixel positions and proportions`,
        user: "Extract the BODY layer only. Remove all clothing and items.",
      },
      clothing: {
        system: `PIXEL ART LAYER EXTRACTOR: CLOTHING LAYER
Extract ONLY the clothing and armor layer.
- Remove the character body/skin (make transparent with #FF00FF)
- Keep ONLY clothing, armor, fabric textures
- Background: Pure Magenta #FF00FF for transparent areas
- Maintain exact pixel positions and proportions`,
        user: "Extract the CLOTHING layer only. Remove the body, keep only clothes.",
      },
      accessories: {
        system: `PIXEL ART LAYER EXTRACTOR: ACCESSORIES LAYER
Extract ONLY accessories: weapons, shields, helmets, jewelry, held items.
- Remove character body and clothing
- Keep ONLY accessories, equipment, held items
- Background: Pure Magenta #FF00FF for transparent areas
- Maintain exact pixel positions and proportions`,
        user: "Extract the ACCESSORIES layer only. Keep weapons, helmets, jewelry.",
      },
      background: {
        system: `PIXEL ART LAYER EXTRACTOR: BACKGROUND LAYER
Extract ONLY the background elements.
- Remove character, clothing, and all accessories
- Keep ONLY background pixels
- If no background exists, return magenta image`,
        user: "Extract the BACKGROUND layer only. Remove character and items.",
      },
    }

    const { system, user } = layerPrompts[layerType]
    const mimeType = sourceImage.match(/data:([^;]+);/)?.[1] || "image/jpeg"

    try {
      const response = await ai.models.generateContent({
        model: config.model,
        contents: {
          parts: [
            { inlineData: { data: this.stripBase64(sourceImage), mimeType } },
            { text: user },
          ],
        },
        config: {
          systemInstruction: system,
          imageConfig: { aspectRatio: config.aspectRatio },
        },
      })

      const imagePart = response.candidates?.[0]?.content?.parts.find(
        (p) => p.inlineData
      )
      if (imagePart?.inlineData) {
        this.trackUsage()
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
      }
      throw new Error(`Error extracting ${layerType} layer`)
    } catch (error: any) {
      this.handleApiError(error)
      throw error
    }
  }

  static async extractAllLayers(
    sourceImage: string,
    config: ForgeConfig
  ): Promise<LayerData> {
    const [body, clothing, accessories, background] = await Promise.all([
      this.extractLayer(sourceImage, "body", config),
      this.extractLayer(sourceImage, "clothing", config),
      this.extractLayer(sourceImage, "accessories", config),
      this.extractLayer(sourceImage, "background", config),
    ])

    return { body, clothing, accessories, background }
  }

  static getQuotaInfo() {
    return QuotaService.getQuota();
  }

  static getRemainingRequests(): number {
    return QuotaService.getRemainingRequests();
  }

  static isQuotaExceeded(): boolean {
    return QuotaService.isQuotaExceeded();
  }

  private static handleApiError(error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes("403") || error.message?.includes("401") || error.message?.includes("Requested entity was not found")) {
      throw new Error("RESELECT_KEY");
    }
    if (error.message?.includes("429") || error.message?.includes("quota")) {
      throw new Error("QUOTA_EXCEEDED");
    }
    throw error;
  }

  private static stripBase64(url: string): string {
    return url.split(',')[1] || url;
  }
}
