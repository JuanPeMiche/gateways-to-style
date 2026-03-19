/**
 * Image URL optimization utilities for Supabase Storage.
 * Uses Supabase Image Transformation API to serve resized images
 * reducing bandwidth and improving load times.
 */

const STORAGE_BASE = import.meta.env.VITE_SUPABASE_URL + "/storage/v1";
const RENDER_BASE = STORAGE_BASE + "/render/image/public";
const OBJECT_BASE = STORAGE_BASE + "/object/public";

/**
 * Check if a URL is from our Supabase storage bucket
 */
function isSupabaseStorageUrl(url: string): boolean {
  return url.includes("/storage/v1/object/public/product-images/");
}

/**
 * Extract the file path from a Supabase storage URL
 */
function extractPath(url: string): string | null {
  const match = url.match(/\/object\/public\/(.+)$/);
  return match ? match[1] : null;
}

/**
 * Generate a resized image URL using Supabase Image Transformation.
 * Falls back to original URL if not a Supabase storage URL.
 * 
 * @param url - Original image URL
 * @param width - Desired width in pixels
 * @param quality - JPEG/WebP quality (1-100), default 75
 */
export function getOptimizedUrl(url: string, width: number, quality: number = 75): string {
  if (!isSupabaseStorageUrl(url)) return url;
  const path = extractPath(url);
  if (!path) return url;
  return `${RENDER_BASE}/${path}?width=${width}&quality=${quality}&resize=contain`;
}

/**
 * Predefined size presets for common use cases
 */
export const ImageSize = {
  /** Admin table thumbnail - 48x48 display, 96px for retina */
  THUMB: (url: string) => getOptimizedUrl(url, 96, 60),
  
  /** Admin covers grid - ~300px cards */
  ADMIN_COVER: (url: string) => getOptimizedUrl(url, 400, 70),
  
  /** Product card in catalog grid - varies by breakpoint */
  CARD_SM: (url: string) => getOptimizedUrl(url, 300, 70),
  CARD_MD: (url: string) => getOptimizedUrl(url, 400, 75),
  CARD_LG: (url: string) => getOptimizedUrl(url, 500, 75),
  
  /** Category cover on homepage - larger */
  COVER: (url: string) => getOptimizedUrl(url, 600, 75),
  
  /** Full size - for modals or detail views */
  FULL: (url: string) => getOptimizedUrl(url, 800, 80),
} as const;

/**
 * Generate srcSet for responsive images
 */
export function getSrcSet(url: string, widths: number[] = [300, 400, 600]): string {
  if (!isSupabaseStorageUrl(url)) return "";
  return widths
    .map((w) => `${getOptimizedUrl(url, w)} ${w}w`)
    .join(", ");
}
