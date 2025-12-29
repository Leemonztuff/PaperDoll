
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ForgeConfig } from "../types";

/**
 * Motor de Síntesis SpriteForge RPG v2.1
 */
export class GeminiService {
  /**
   * Obtiene una instancia fresca de la API usando el entorno actual.
   */
  private static getClient(): GoogleGenAI {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("No API Key detected. Please select a key in the settings.");
    }
    return new GoogleGenAI({ apiKey });
  }

  /**
   * Extracción de Maniquí Base (ADN Puro).
   */
  static async extractBaseDNA(sourceImage: string, config: ForgeConfig): Promise<string> {
    const ai = this.getClient();

    const systemInstruction = `
      ACT AS SPRITEFORGE BASE DNA EXTRACTOR.
      OBJECTIVE: Extract character mannequin (pure anatomy).
      
      MANDATORY RULES:
      1. Analyze identity, skin and hair.
      2. REMOVE all armor, weapons, and accessories.
      3. Draw character in a simple neutral base RPG underwear.
      4. Maintain pixel art scale and anatomical proportions exactly.
      5. BACKGROUND: Solid #FF00FF (Magenta).
      6. OUTPUT: One single pixel-art sprite.
    `;

    const contents = {
      parts: [
        { inlineData: { data: this.stripBase64(sourceImage), mimeType: 'image/jpeg' } },
        { text: "GENERATE CANONICAL MANNEQUIN. PURIFY ALL GEAR." }
      ]
    };

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: config.model,
        contents,
        config: { systemInstruction, imageConfig: { aspectRatio: config.aspectRatio } },
      });

      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart?.inlineData) return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      throw new Error("Base extraction failed - No image in response.");
    } catch (error: any) {
      this.handleApiError(error);
      throw error;
    }
  }

  /**
   * Síntesis Modular Evolutiva.
   */
  static async synthesizeEvolution(baseImage: string, parentUrl: string | null, prompt: string, config: ForgeConfig): Promise<string> {
    const ai = this.getClient();
    
    const coreModules = config.neuralChain.filter(n => n.isActive && n.id.match(/^m[1-8]$/)).map(n => n.instruction).join('\n');
    const pixelGuard = config.neuralChain.filter(n => n.isActive && n.id.match(/^m(9|1[0-4])$/)).map(n => n.instruction).join('\n');
    const dnaLock = config.neuralChain.filter(n => n.isActive && n.id.match(/^m1[5-8]$/)).map(n => n.instruction).join('\n');
    const bodyLock = config.neuralChain.filter(n => n.isActive && n.id.match(/^m(19|2[0-2])$/)).map(n => n.instruction).join('\n');
    const harmonizer = config.neuralChain.filter(n => n.isActive && n.id.match(/^m2[4-9]$/)).map(n => n.instruction).join('\n');

    const systemInstruction = `
      YOU ARE THE SPRITEFORGE MODULAR ENGINE v2.0 (Mode: ${config.mode}).
      
      [PIPELINE]
      ${coreModules}
      ${pixelGuard}
      ${dnaLock}
      ${bodyLock}
      ${harmonizer}

      USER DIRECTIVE:
      Outfit: ${prompt}
      Maintain consistency with REF A (Base DNA) and REF B (Current Parent).
    `;

    const contents: any = {
      parts: [
        { inlineData: { data: this.stripBase64(baseImage), mimeType: 'image/jpeg' } },
        { text: "REF A: CANONICAL BASE DNA" }
      ]
    };

    if (parentUrl) {
      contents.parts.push({ inlineData: { data: this.stripBase64(parentUrl), mimeType: 'image/jpeg' } });
      contents.parts.push({ text: "REF B: CURRENT EVOLUTION STATE" });
    }

    contents.parts.push({ text: `FORGE COMMAND: Synthesize "${prompt}" evolution.` });

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: config.model,
        contents,
        config: { 
          systemInstruction,
          imageConfig: { 
            aspectRatio: config.aspectRatio,
            ...(config.model === 'gemini-3-pro-image-preview' && { imageSize: config.size })
          }
        },
      });

      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart?.inlineData) return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      throw new Error("Synthesis failed - No image output.");
    } catch (error: any) {
      this.handleApiError(error);
      throw error;
    }
  }

  private static handleApiError(error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("401") || error.message?.includes("404") || error.message?.includes("API_KEY")) {
       if (window.aistudio) window.aistudio.openSelectKey();
    }
  }

  private static stripBase64(url: string): string {
    return url.split(',')[1] || url;
  }
}
