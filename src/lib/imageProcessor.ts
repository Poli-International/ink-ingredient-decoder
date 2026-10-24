/**
 * Client-side image processor for custom profile photos.
 * Processes images offline directly in the browser using HTML5 Canvas.
 * No external network requests or services are used.
 */

export interface ProcessedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export async function processProfilePhoto(
  file: File,
  targetSize = 256
): Promise<ProcessedImageResult> {
  // Validate MIME type
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error('Please select a valid image file (JPEG, PNG, or WebP).');
  }

  // Max 15MB upload limit before processing
  if (file.size > 15 * 1024 * 1024) {
    throw new Error('Image file is too large. Please select an image under 15MB.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read the image file locally.'));
    };

    reader.onload = (event) => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error('Failed to decode the image file.'));
      };

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Canvas context could not be initialized.');
          }

          // Center crop algorithm for square profile avatar
          const originalWidth = img.naturalWidth || img.width;
          const originalHeight = img.naturalHeight || img.height;
          const minDim = Math.min(originalWidth, originalHeight);

          const sourceX = (originalWidth - minDim) / 2;
          const sourceY = (originalHeight - minDim) / 2;

          // Draw cropped and scaled image onto canvas
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            minDim,
            minDim,
            0,
            0,
            targetSize,
            targetSize
          );

          // Output as compact WebP (or PNG fallback)
          let dataUrl = '';
          try {
            dataUrl = canvas.toDataURL('image/webp', 0.88);
          } catch {
            dataUrl = canvas.toDataURL('image/png');
          }

          // Compute byte length
          const head = 'data:image/webp;base64,';
          const base64Str = dataUrl.startsWith(head) ? dataUrl.slice(head.length) : dataUrl;
          const sizeBytes = Math.round((base64Str.length * 3) / 4);

          resolve({
            dataUrl,
            width: targetSize,
            height: targetSize,
            sizeBytes,
          });
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Image processing failed'));
        }
      };

      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      } else {
        reject(new Error('Invalid file reader result'));
      }
    };

    reader.readAsDataURL(file);
  });
}
