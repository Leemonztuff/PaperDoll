
export class ImageProcessor {
  /**
   * Procesa la imagen para extraer el canal Alpha con algoritmos de suavizado.
   */
  static async processAlpha(
    sourceUrl: string, 
    threshold: number = 40, 
    feather: number = 5
  ): Promise<string> {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = sourceUrl;
    
    await new Promise((resolve, reject) => { 
      img.onload = resolve;
      img.onerror = reject;
    });
    
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas context failed");
    
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // 1. ALGORITMO DE MUESTREO ADAPTATIVO
    // Analizamos los bordes para detectar el color de fondo exacto
    let rSum = 0, gSum = 0, bSum = 0, count = 0;
    const inset = 2; // Evitar píxeles de compresión en el borde absoluto
    
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
    
    // 2. PROCESAMIENTO CON SUAVIZADO DE BORDES (FEATHERING)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];
      
      // Distancia de color ponderada (Sensibilidad humana)
      const dist = Math.sqrt(
        Math.pow(r - bgR, 2) * 0.299 + 
        Math.pow(g - bgG, 2) * 0.587 + 
        Math.pow(b - bgB, 2) * 0.114
      );

      if (dist < threshold) {
        data[i + 3] = 0; // Transparente total
      } else if (dist < threshold + feather) {
        // Alpha blending para bordes suaves
        const alpha = ((dist - threshold) / feather);
        data[i + 3] = Math.round(alpha * 255);
        
        // Corrección de color en el borde para evitar "halos"
        // Mezclamos un poco con un gris neutro o mantenemos el color pero bajamos brillo
        data[i] = Math.min(255, data[i] * 1.05);
        data[i+1] = Math.min(255, data[i+1] * 1.05);
        data[i+2] = Math.min(255, data[i+2] * 1.05);
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  }
}
