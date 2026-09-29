/**
 * Serve Supabase Storage images through the on-the-fly image transformation
 * endpoint instead of the raw object.
 *
 * The catalog holds ~180 images uploaded before client-side compression existed;
 * many are 4-30MB PNGs (~1GB total). Requesting them raw is what makes the grid
 * crawl or stall on slow connections. Rewriting the public object URL to the
 * /render/image/ endpoint makes Supabase resize + re-encode (WebP when the
 * browser sends an Accept header for it), taking a 3.4MB PNG down to ~25KB —
 * with no need to re-upload anything.
 *
 * Image transformations are a paid Supabase feature. On the Free plan the
 * render endpoint doesn't exist (the catalog was re-encoded to ~100KB WebP
 * during the migration off Lovable Cloud instead), so the rewrite only happens
 * when VITE_SUPABASE_IMAGE_TRANSFORMS=true.
 */

const OBJECT_PATH = "/storage/v1/object/public/";
const RENDER_PATH = "/storage/v1/render/image/public/";

export type ImageVariant = "thumb" | "card" | "full";

const VARIANTS: Record<ImageVariant, { width: number; quality: number }> = {
  // Grid cards render at roughly 200-320 CSS px; 400 covers 2x displays.
  thumb: { width: 400, quality: 60 },
  // Category covers / larger cards.
  card: { width: 800, quality: 70 },
  // Detail or hero usage.
  full: { width: 1200, quality: 80 },
};

/**
 * Returns a transformed URL for Supabase-hosted images, and the input unchanged
 * for anything else (external URLs, base64 leftovers, empty values).
 */
export function optimizedImageUrl(
  url: string | undefined | null,
  variant: ImageVariant = "thumb"
): string {
  if (!url) return "";
  if (import.meta.env.VITE_SUPABASE_IMAGE_TRANSFORMS !== "true") return url;
  if (!url.includes(OBJECT_PATH)) return url;

  const { width, quality } = VARIANTS[variant];
  const transformed = url.replace(OBJECT_PATH, RENDER_PATH);
  const separator = transformed.includes("?") ? "&" : "?";

  return `${transformed}${separator}width=${width}&quality=${quality}&resize=contain`;
}
