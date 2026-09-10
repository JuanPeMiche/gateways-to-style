/**
 * One-off migration: re-compress oversized product images already in storage.
 *
 * The catalog was seeded before client-side compression existed, so many objects
 * are 4-30MB PNGs. Those are slow to serve AND too big for Supabase's image
 * transformation endpoint ("source image resolution/file is too large to
 * process"), so they can't even be optimized on the fly.
 *
 * This downloads each oversized image, resizes + re-encodes it to WebP, uploads
 * it as a new object, and repoints the product row at the new URL.
 *
 * Usage:
 *   npm i -D sharp
 *   SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/recompress-images.mjs --dry-run
 *   SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/recompress-images.mjs
 *
 * The service role key is required (it writes to storage and the products
 * table). Never commit it — pass it via the environment.
 */
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { randomUUID } from "node:crypto";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://vqippalsvliwibvpjlne.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "product-images";
const MAX_BYTES = 600 * 1024;
const TARGET_WIDTH = 1200;
const DRY_RUN = process.argv.includes("--dry-run");

if (!SERVICE_KEY) {
  console.error("Falta SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const kb = (b) => Math.round(b / 1024);

const { data: products, error } = await supabase
  .from("products")
  .select("id, name, images");

if (error) {
  console.error("No se pudieron leer los productos:", error.message);
  process.exit(1);
}

let scanned = 0;
let rewritten = 0;
let savedBytes = 0;

for (const product of products ?? []) {
  const images = product.images ?? [];
  const nextImages = [...images];
  let changed = false;

  for (let i = 0; i < images.length; i++) {
    const url = images[i];
    if (!url?.includes(`/object/public/${BUCKET}/`)) continue;

    const path = url.split(`/object/public/${BUCKET}/`)[1]?.split("?")[0];
    if (!path) continue;

    scanned++;

    const { data: blob, error: dlErr } = await supabase.storage
      .from(BUCKET)
      .download(path);
    if (dlErr) {
      console.warn(`  ! no se pudo bajar ${path}: ${dlErr.message}`);
      continue;
    }

    const original = Buffer.from(await blob.arrayBuffer());
    if (original.byteLength <= MAX_BYTES) continue;

    // limitInputPixels: some legacy uploads exceed sharp's default 268MP guard,
    // and those are exactly the ones Supabase also refuses to transform.
    const optimized = await sharp(original, { limitInputPixels: false })
      .rotate()
      .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();

    if (optimized.byteLength >= original.byteLength) continue;

    console.log(
      `${product.name}: ${kb(original.byteLength)}KB -> ${kb(optimized.byteLength)}KB`
    );
    savedBytes += original.byteLength - optimized.byteLength;

    if (DRY_RUN) {
      changed = true;
      continue;
    }

    const newPath = `${randomUUID()}.webp`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(newPath, optimized, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: false,
      });
    if (upErr) {
      console.warn(`  ! no se pudo subir: ${upErr.message}`);
      continue;
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(newPath);
    nextImages[i] = pub.publicUrl;
    changed = true;

    // Only remove the original once the row points at the replacement.
    await supabase.storage.from(BUCKET).remove([path]);
  }

  if (changed && !DRY_RUN) {
    const { error: updErr } = await supabase
      .from("products")
      .update({ images: nextImages })
      .eq("id", product.id);
    if (updErr) {
      console.warn(`  ! no se pudo actualizar ${product.name}: ${updErr.message}`);
      continue;
    }
    rewritten++;
  }
}

console.log(
  `\n${DRY_RUN ? "[dry-run] " : ""}imágenes revisadas: ${scanned} | productos actualizados: ${rewritten} | ahorro: ${kb(savedBytes)}KB`
);
