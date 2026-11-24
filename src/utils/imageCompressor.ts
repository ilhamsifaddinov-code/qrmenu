/**
 * Compress and resize images client-side before upload using HTML5 Canvas.
 * Ensures fast upload, prevents Vercel 4.5MB payload limit errors, and keeps images sharp.
 */
export function compressImage(file: File, maxWidth = 1000, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Fayl rasm formati emas'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Faylni o\'qishda xatolik'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Rasmni yuklashda xatolik'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Resize proportionally if larger than maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target?.result as string);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
