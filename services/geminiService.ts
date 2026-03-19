
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ForgeConfig } from "../types";

export class GeminiService {
  /**
   * Obtiene el cliente de IA utilizando exclusivamente la variable de entorno API_KEY.
   */
  private static getClient(): GoogleGenAI {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      throw new Error("API_KEY_MISSING");
    }
    return new GoogleGenAI({ apiKey });
  }

  static async generateBaseMannequin(config: ForgeConfig): Promise<string> {
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
      if (imagePart?.inlineData) return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      throw new Error("No se pudo generar el maniquí.");
    } catch (error: any) {
      this.handleApiError(error);
      throw error;
    }
  }

  static async extractBaseDNA(sourceImage: string, config: ForgeConfig): Promise<string> {
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
      if (imagePart?.inlineData) return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      throw new Error("Error extrayendo base.");
    } catch (error: any) {
      this.handleApiError(error);
      throw error;
    }
  }

  static async synthesizeEvolution(baseImage: string, parentUrl: string | null, prompt: string, config: ForgeConfig): Promise<string> {
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
      if (imagePart?.inlineData) return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      throw new Error("La síntesis falló.");
    } catch (error: any) {
      this.handleApiError(error);
      throw error;
    }
  }

  static async enhancePrompt(prompt: string): Promise<string> {
    const ai = this.getClient();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Enhance for pixel art RPG: ${prompt}`,
      });
      // Extract text using property access as per guidelines
      return response.text?.trim() || prompt;
    } catch (error: any) {
      this.handleApiError(error);
      throw error;
    }
  }

  private static handleApiError(error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes("403") || error.message?.includes("401") || error.message?.includes("Requested entity was not found")) {
      throw new Error("RESELECT_KEY");
    }
    throw error;
  }

  private static stripBase64(url: string): string {
    return url.split(',')[1] || url;
  }
}
