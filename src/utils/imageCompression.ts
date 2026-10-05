/**
 * Client-Side Dynamic Image Compression Utility
 * Guarantees every image is compressed strictly to <= 100 KB
 */

export interface CompressImageOptions {
  maxSizeKB?: number;          // Target max size in KB (default: 95 KB to stay safely <= 100 KB)
  maxWidthOrHeight?: number;   // Maximum width or height in px (default: 900)
  initialQuality?: number;     // Initial JPEG compression quality (0 to 1, default: 0.82)
  minQuality?: number;         // Minimum fallback quality (default: 0.35)
  mimeType?: string;           // Output format (default: 'image/jpeg')
}

export interface CompressedImageResult {
  file: File;
  dataUrl: string;
  sizeBytes: number;
  sizeKB: number;
  originalSizeKB: number;
}

/**
 * Loads an image from a File, Blob, or base64 data URL string into an HTMLImageElement
 */
function loadImage(src: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image for compression: ' + err));

    if (typeof src === 'string') {
      img.src = src;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(src);
    }
  });
}

/**
 * Compresses an image to be strictly <= maxSizeKB (default 95 KB)
 */
export async function compressImage(
  input: File | Blob | string,
  fileName = 'compressed-photo.jpg',
  options: CompressImageOptions = {}
): Promise<CompressedImageResult> {
  const {
    maxSizeKB = 95, // strict 100 KB upper guard
    maxWidthOrHeight = 900,
    initialQuality = 0.82,
    minQuality = 0.35,
    mimeType = 'image/jpeg'
  } = options;

  const targetMaxBytes = maxSizeKB * 1024;
  let originalSizeBytes = typeof input === 'string' 
    ? Math.round(input.length * (3 / 4)) // approximate base64 bytes
    : input.size;
  const originalSizeKB = Math.round(originalSizeBytes / 1024);

  const img = await loadImage(input);

  // Calculate proportional initial scale
  let { width, height } = img;
  if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
    if (width > height) {
      height = Math.round((height * maxWidthOrHeight) / width);
      width = maxWidthOrHeight;
    } else {
      width = Math.round((width * maxWidthOrHeight) / height);
      height = maxWidthOrHeight;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available for image compression');
  }

  // White background for transparent PNG conversions to JPEG
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  let currentQuality = initialQuality;
  let dataUrl = canvas.toDataURL(mimeType, currentQuality);
  let binaryLength = Math.round(dataUrl.length * (3 / 4));

  // Iterative step-down loop until binaryLength <= targetMaxBytes
  let attempts = 0;
  while (binaryLength > targetMaxBytes && attempts < 10) {
    attempts++;

    // Decrease quality first
    if (currentQuality > minQuality) {
      currentQuality = Math.max(minQuality, currentQuality - 0.12);
    } else {
      // If quality is already at min, downscale dimensions
      width = Math.round(width * 0.82);
      height = Math.round(height * 0.82);
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
    }

    dataUrl = canvas.toDataURL(mimeType, currentQuality);
    binaryLength = Math.round(dataUrl.length * (3 / 4));
  }

  // Convert final dataUrl to File
  const byteString = atob(dataUrl.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  const finalBlob = new Blob([ab], { type: mimeType });
  const finalFile = new File([finalBlob], fileName.replace(/\.[^/.]+$/, '.jpg'), { type: mimeType });

  return {
    file: finalFile,
    dataUrl,
    sizeBytes: finalFile.size,
    sizeKB: Math.round(finalFile.size / 1024),
    originalSizeKB
  };
}
