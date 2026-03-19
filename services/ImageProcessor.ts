export class ImageProcessor {
  /**
   * Extracts alpha channel (removes background) based on a threshold and feathering.
   * Assumes the background is relatively uniform (e.g., solid color or simple gradient).
   */
  static async extractAlpha(
    imageUrl: string,
    threshold: number = 30,
    feather: number = 2
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context not available'));

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Sample the top-left pixel as the background color
        const bgR = data[0];
        const bgG = data[1];
        const bgB = data[2];

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Calculate color distance
          const distance = Math.sqrt(
            Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
          );

          if (distance < threshold) {
            // Background: make transparent
            data[i + 3] = 0;
          } else if (distance < threshold + feather * 10) {
            // Feathering transition
            const alpha = ((distance - threshold) / (feather * 10)) * 255;
            data[i + 3] = Math.min(255, Math.max(0, alpha));
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.src = imageUrl;
    });
  }

  /**
   * Exports an image to a specific format and background color.
   */
  static async exportImage(
    imageUrl: string,
    format: 'png' | 'jpeg' | 'webp' = 'png',
    bgColor: string = '#ffffff'
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context not available'));

        if (format === 'jpeg') {
          // Fill background for formats that don't support transparency
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL(`image/${format}`, 0.92));
      };
      img.onerror = () => reject(new Error('Failed to load image for export'));
      img.src = imageUrl;
    });
  }
}
