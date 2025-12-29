
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ForgeConfig } from "../types";

export class GeminiService {
  private static getClient(): GoogleGenAI {
    // Prioridad 1: Llave manual pegada por el usuario en el navegador
    // Prioridad 2: Llave inyectada por el entorno (process.env)
    const manualKey = localStorage.getItem('SF_API_KEY');
    const apiKey = manualKey || process.env.API_KEY;

    if (!apiKey) {
      throw new Error("No hay llave API activa. Por favor, pega tu llave en Configuración.");
    }
    
    return new GoogleGenAI({ apiKey });
  }

  static async enhancePrompt(userPrompt: string): Promise<string> {
    const ai = this.getClient();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a RPG Lead Artist. Convert this description into a professional game asset prompt for pixel art. Focus on outfits, materials and gear. Output ONLY the refined prompt. Input: "${userPrompt}"`,
      });
      return response.text?.trim() || userPrompt;
    } catch (error) {
      console.error("Prompt enhancement error:", error);
      return userPrompt;
    }
  }

  static async extractBaseDNA(sourceImage: string, config: ForgeConfig): Promise<string> {
    const ai = this.getClient();
    const systemInstruction = `
      GAME-READY ASSET ENGINE: DNA EXTRACTOR.
      1. Extract the base mannequin anatomy from the image.
      2. REMOVE all clothing, hair and equipment.
      3. Render a clean "nude" or neutral skin-tight base.
      4. STYLE: High-quality RPG Pixel Art.
      5. BACKGROUND: Pure Magenta (#FF00FF) for transparency.
      6. OUTPUT: One clean sprite centered.
    `;

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: config.model,
        contents: {
          parts: [
            { inlineData: { data: this.stripBase64(sourceImage), mimeType: 'image/jpeg' } },
            { text: "GENERATE BASE DNA MANNEQUIN." }
          ]
        },
        config: { systemInstruction, imageConfig: { aspectRatio: config.aspectRatio } },
      });

      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart?.inlineData) return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      throw new Error("Error extrayendo base.");
    } catch (error: any) {
      throw error;
    }
  }

  static async synthesizeEvolution(baseImage: string, parentUrl: string | null, prompt: string, config: ForgeConfig): Promise<string> {
    const ai = this.getClient();
    
    const systemInstruction = `
      GAME-READY ASSET ENGINE: OUTFIT FORGE.
      OBJECTIVE: Create a new outfit on the BASE DNA provided.
      
      RULES:
      1. MAINTAIN EXACT ANATOMY: Don't change proportions or pose of the base character (REF A).
      2. OUTFIT ONLY: Generate only the clothing/armor/gear requested.
      3. STYLE: Professional RPG Pixel Art.
      4. GAME READY: Centered sprite, clean pixels.
      5. BACKGROUND: Pure Magenta (#FF00FF).
    `;

    const contents: any = {
      parts: [
        { inlineData: { data: this.stripBase64(baseImage), mimeType: 'image/jpeg' } },
        { text: "REF A: BASE DNA MANNEQUIN" }
      ]
    };

    if (parentUrl) {
      contents.parts.push({ inlineData: { data: this.stripBase64(parentUrl), mimeType: 'image/jpeg' } });
      contents.parts.push({ text: "REF B: PREVIOUS VERSION" });
    }

    contents.parts.push({ text: `DIRECTIVE: Apply this outfit to the base: "${prompt}"` });

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: config.model,
        contents,
        config: { 
          systemInstruction,
          imageConfig: { 
            aspectRatio: config.aspectRatio,
            ...(config.model.includes('pro') && { imageSize: config.size })
          }
        },
      });

      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart?.inlineData) return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      throw new Error("La síntesis falló.");
    } catch (error: any) {
      throw error;
    }
  }

  private static stripBase64(url: string): string {
    return url.split(',')[1] || url;
  }
}
