
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ModelType, ImageSize, AspectRatio, OutlineConfig, RenderingProtocols, BackgroundStyle } from "../types";

export class GeminiService {
  // Always instantiate right before calling to get the latest process.env.API_KEY
  private static getAIInstance() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  private static async optimizeImage(base64: string, maxDim: number = 1024): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          const ratio = width > height ? maxDim / width : maxDim / height;
          width *= ratio;
          height *= ratio;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
        }
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = base64;
    });
  }

  private static getBackgroundDescription(style: BackgroundStyle): string {
    switch(style) {
      case 'magenta': return 'Pure #FF00FF (Chroma Key Magenta). Absolute solid color, no variations.';
      case 'white': return 'Pure solid white (#FFFFFF). No shadows or gradients.';
      case 'gray': return 'Solid neutral gray (#808080). Flat professional look.';
      case 'gradient': return 'Subtle studio gradient from light gray to medium gray. Minimal professional look.';
      default: return 'Solid flat color.';
    }
  }

  static async generateEvolution(
    baseCharacter: string,
    parentSprite: string | null,
    prompt: string,
    mutationStrength: number,
    config: {
      model: ModelType,
      aspectRatio: AspectRatio,
      outline: OutlineConfig,
      isCharacterSheet: boolean,
      size: ImageSize,
      protocols: RenderingProtocols
    }
  ): Promise<string> {
    const ai = this.getAIInstance();
    const optBase = await this.optimizeImage(baseCharacter);
    const optParent = parentSprite ? await this.optimizeImage(parentSprite) : null;

    const anatomyLock = `
CRITICAL ANATOMY LOCK v3.0:
- Use the provided BASE IMAGE as a RIGID TEMPLATE. 
- DO NOT CHANGE: Face features, eye shape, body silhouette, breast size (must be large/voluptuous as per JRPG style), height, or pose.
- THE CHARACTER MUST OVERLAY PERFECTLY on top of the original anatomy.
- TASK: You are strictly "dressing" a paper doll. Add layers of clothing ON TOP of the base skin.`;

    const renderingLogic = `
TECHNICAL RENDERING PIPELINE:
- BACKGROUND: ${this.getBackgroundDescription(config.protocols.backgroundStyle)}
- STYLE: ${config.protocols.hd2dStyle ? 'Modern HD-2D Sprite (Death Metal/Queen\'s Blade aesthetic).' : 'Professional Concept Art.'}
- LIGHTING: Consistent top-down studio lighting. No environmental shadows.
- OUTLINE: ${config.protocols.strongOutline ? 'Sharp 2px black contour for game-engine compatibility.' : 'Soft artistic edges.'}`;

    const evolutionLogic = optParent 
      ? `DNA INJECTION: Blend the previous design's details into this new generation with a ${mutationStrength}% mutation factor. Maintain core accessories but refine them according to the prompt.` 
      : 'INITIAL LAYER SYNTHESIS: Apply the first layer of equipment to the base mannequin.';

    const systemInstruction = `You are a specialized Game Asset Generator.
${anatomyLock}
${renderingLogic}
${evolutionLogic}

REQUIRED OUTPUT: A clean, isolated character asset ready for sprite-sheet extraction. 
NO artistic backgrounds. NO floating particles. NO ground plane.`;

    const userPrompt = `[DESIGN DIRECTIVE]: ${prompt}
[STYLE NOTES]: High-detail fantasy armor, tactical cutouts, metallic reflections, JRPG influence.
[FORMAT]: Isolated sprite on requested background.`;

    try {
      const parts: any[] = [
        { inlineData: { data: optBase.split(',')[1], mimeType: 'image/jpeg' } },
        { text: "REFERENCE A: RIGID ANATOMY MANNEQUIN" }
      ];

      if (optParent) {
        parts.push({ inlineData: { data: optParent.split(',')[1], mimeType: 'image/jpeg' } });
        parts.push({ text: "REFERENCE B: PREVIOUS OUTFIT LAYER" });
      }

      parts.push({ text: userPrompt });

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: config.model,
        contents: { parts },
        config: {
          systemInstruction,
          imageConfig: {
            aspectRatio: config.aspectRatio,
            ...(config.model === 'gemini-3-pro-image-preview' && { imageSize: config.size })
          }
        }
      });

      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      }
      throw new Error("Neural synthesis failed to produce image data.");
    } catch (e: any) {
      console.error("[Neural Engine Error]", e);
      throw e;
    }
  }
}
