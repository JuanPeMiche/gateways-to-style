/**
 * Client-side image compression utility.
 * Resizes to max 800px width, compresses to ~200KB, converts to WebP when possible.
 */

const MAX_WIDTH = 800;
const MAX_SIZE_BYTES = 200 * 1024; // 200KB
const INITIAL_QUALITY = 0.85;
const MIN_QUALITY = 0.4;

function supportsWebP(): boolean {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL("image/webp").startsWith("data:image/webp");
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
      type,
      quality
    );
  });
}

export interface CompressResult {
  file: File;
  originalSize: number;
  compressedSize: number;
}

export async function compressImage(file: File): Promise<CompressResult> {
  const originalSize = file.size;

  // Skip if already small enough and right format
  if (originalSize <= MAX_SIZE_BYTES) {
    return { file, originalSize, compressedSize: originalSize };
  }

  const img = await loadImage(file);
  const useWebP = supportsWebP();
  const outputType = useWebP ? "image/webp" : "image/jpeg";
  const ext = useWebP ? "webp" : "jpg";

  // Calculate new dimensions
  let { width, height } = img;
  if (width > MAX_WIDTH) {
    height = Math.round((height * MAX_WIDTH) / width);
    width = MAX_WIDTH;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);

  URL.revokeObjectURL(img.src);

  // Iteratively reduce quality until under target size
  let quality = INITIAL_QUALITY;
  let blob = await canvasToBlob(canvas, outputType, quality);

  while (blob.size > MAX_SIZE_BYTES && quality > MIN_QUALITY) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, outputType, quality);
  }

  const compressed = new File([blob], `image.${ext}`, { type: outputType });
  return { file: compressed, originalSize, compressedSize: compressed.size };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  return `${Math.round(bytes / 1024)}KB`;
}
