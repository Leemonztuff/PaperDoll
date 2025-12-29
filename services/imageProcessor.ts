
export class ImageProcessor {
  /**
   * Procesa la imagen para extraer el canal Alpha con algoritmos de suavizado.
   */
  static async processAlpha(
    sourceUrl: string, 
    threshold: number = 40, 
    feather: number = 5
  ): Promise<string> {
    const img = await this.loadImage(sourceUrl);
    
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas context failed");
    
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let rSum = 0, gSum = 0, bSum = 0, count = 0;
    const inset = 2;
    
    for (let x = inset; x < canvas.width - inset; x += 10) {
      const top = (inset * canvas.width + x) * 4;
      const bottom = ((canvas.height - inset - 1) * canvas.width + x) * 4;
      rSum += data[top] + data[bottom];
      gSum += data[top + 1] + data[bottom + 1];
      bSum += data[top + 2] + data[bottom + 2];
      count += 2;
    }

    const bgR = rSum / count;
    const bgG = gSum / count;
    const bgB = bSum / count;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];
      const dist = Math.sqrt(
        Math.pow(r - bgR, 2) * 0.299 + 
        Math.pow(g - bgG, 2) * 0.587 + 
        Math.pow(b - bgB, 2) * 0.114
      );

      if (dist < threshold) {
        data[i + 3] = 0;
      } else if (dist < threshold + feather) {
        const alpha = ((dist - threshold) / feather);
        data[i + 3] = Math.round(alpha * 255);
        data[i] = Math.min(255, data[i] * 1.05);
        data[i+1] = Math.min(255, data[i+1] * 1.05);
        data[i+2] = Math.min(255, data[i+2] * 1.05);
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  }

  /**
   * PIXELGUARD™ CORE: Valida si la silueta generada se mantiene dentro de los límites de la base.
   * @returns driftScore (0-100, donde 0 es perfecto y > 5 es drift crítico)
   */
  static async checkSilhouetteDrift(baseUrl: string, genUrl: string): Promise<number> {
    const baseImg = await this.loadImage(baseUrl);
    const genImg = await this.loadImage(genUrl);

    const canvas = document.createElement('canvas');
    canvas.width = 128; // Normalize size for faster comparison
    canvas.height = 128;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    // Extract Base Mask
    ctx.clearRect(0, 0, 128, 128);
    ctx.drawImage(baseImg, 0, 0, 128, 128);
    const baseData = ctx.getImageData(0, 0, 128, 128).data;
    const baseMask = new Uint8Array(128 * 128);
    for (let i = 0; i < baseData.length; i += 4) {
      // Si el pixel no es el fondo predominante (asumimos chroma o blanco/negro base)
      // Para simplificar, detectamos si es lo suficientemente diferente al color de la esquina sup-izq
      const r = baseData[i], g = baseData[i+1], b = baseData[i+2];
      const isBg = (r > 240 && g < 20 && b > 240) || (r > 240 && g > 240 && b > 240); // Magenta o Blanco
      baseMask[i/4] = isBg ? 0 : 1;
    }

    // Extract Gen Mask
    ctx.clearRect(0, 0, 128, 128);
    ctx.drawImage(genImg, 0, 0, 128, 128);
    const genData = ctx.getImageData(0, 0, 128, 128).data;
    
    let driftPixels = 0;
    let totalSubjectPixels = 0;

    for (let i = 0; i < genData.length; i += 4) {
      const r = genData[i], g = genData[i+1], b = genData[i+2];
      const isBg = (r > 240 && g < 20 && b > 240) || (r > 240 && g > 240 && b > 240);
      const isSubject = !isBg;
      
      if (isSubject) {
        totalSubjectPixels++;
        // Si el pixel generado es sujeto pero la base es fondo -> DRIFT!
        if (baseMask[i/4] === 0) {
          driftPixels++;
        }
      }
    }

    return (driftPixels / totalSubjectPixels) * 100;
  }

  private static loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  }
}
