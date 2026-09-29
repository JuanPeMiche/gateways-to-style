/**
 * One-off migration: copy the catalog from Lovable Cloud to our own Supabase project.
 *
 * Reads products + category_covers from the old project (logged in as the admin,
 * so hidden products come too), copies every referenced image into the new
 * product-images bucket, rewrites the image URLs to the new domain and upserts
 * the rows keeping their ids and timestamps.
 *
 * Images above 600KB are re-encoded to WebP (1200px) on the way: the Free plan
 * has no image transformation endpoint, so the raw object is what visitors get.
 * Pass --keep-originals to copy them byte for byte instead.
 *
 * A JSON backup of the old rows is written to migration-backup/ (gitignored).
 * Re-running is safe: uploads and row writes are upserts.
 *
 * Usage (reads .env; the new schema and admin user must already exist):
 *   OLD_ADMIN_EMAIL=... OLD_ADMIN_PASSWORD=... node scripts/migrate-from-lovable.mjs --dry-run
 *   OLD_ADMIN_EMAIL=... OLD_ADMIN_PASSWORD=... node scripts/migrate-from-lovable.mjs
 */
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

try {
  process.loadEnvFile(".env");
} catch {
  // Env may come entirely from the shell.
}

const {
  OLD_SUPABASE_URL,
  OLD_SUPABASE_PUBLISHABLE_KEY,
  OLD_ADMIN_EMAIL,
  OLD_ADMIN_PASSWORD,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

const BUCKET = "product-images";
const MAX_BYTES = 600 * 1024;
const TARGET_WIDTH = 1200;
const DRY_RUN = process.argv.includes("--dry-run");
const KEEP_ORIGINALS = process.argv.includes("--keep-originals");

const missing = Object.entries({
  OLD_SUPABASE_URL,
  OLD_SUPABASE_PUBLISHABLE_KEY,
  OLD_ADMIN_EMAIL,
  OLD_ADMIN_PASSWORD,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
})
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (missing.length) {
  console.error(`Faltan variables de entorno: ${missing.join(", ")}`);
  process.exit(1);
}
if (new URL(OLD_SUPABASE_URL).host === new URL(SUPABASE_URL).host) {
  console.error("OLD_SUPABASE_URL y SUPABASE_URL apuntan al mismo proyecto.");
  process.exit(1);
}

const oldDb = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false },
});
const newDb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const kb = (b) => Math.round(b / 1024);
const OLD_PREFIX = `${OLD_SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/`;

// ---------- 1. Read everything from the old project ----------

const { error: authErr } = await oldDb.auth.signInWithPassword({
  email: OLD_ADMIN_EMAIL,
  password: OLD_ADMIN_PASSWORD,
});
if (authErr) {
  console.error("No se pudo iniciar sesión en el proyecto viejo:", authErr.message);
  process.exit(1);
}

async function readAll(table) {
  const rows = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await oldDb
      .from(table)
      .select("*")
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < PAGE) return rows;
  }
}

const products = await readAll("products");
const covers = await readAll("category_covers");
const hidden = products.filter((p) => !p.visible).length;
console.log(
  `Proyecto viejo: ${products.length} productos (${hidden} ocultos), ${covers.length} portadas`
);

mkdirSync("migration-backup", { recursive: true });
const backupFile = `migration-backup/lovable-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
writeFileSync(backupFile, JSON.stringify({ products, category_covers: covers }, null, 2));
console.log(`Backup de filas: ${backupFile}\n`);

// ---------- 2. Copy images ----------

const urls = new Set([
  ...products.flatMap((p) => p.images ?? []),
  ...covers.map((c) => c.image_url),
]);
const foreign = [...urls].filter((u) => u && !u.startsWith(OLD_PREFIX));
if (foreign.length) {
  console.warn(`${foreign.length} URL(s) no son del bucket viejo y se dejan tal cual:`);
  for (const u of foreign) console.warn(`  - ${u.slice(0, 100)}`);
  console.warn("");
}

const urlMap = new Map(); // old URL -> new URL
const failed = [];
let bytesBefore = 0;
let bytesAfter = 0;

async function copyImage(oldUrl) {
  const oldPath = decodeURIComponent(oldUrl.slice(OLD_PREFIX.length).split("?")[0]);
  const res = await fetch(oldUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  let body = Buffer.from(await res.arrayBuffer());
  let contentType = res.headers.get("content-type") || "application/octet-stream";
  let newPath = oldPath;
  bytesBefore += body.byteLength;

  if (!KEEP_ORIGINALS && body.byteLength > MAX_BYTES) {
    // limitInputPixels: some legacy uploads exceed sharp's default 268MP guard.
    const webp = await sharp(body, { limitInputPixels: false })
      .rotate()
      .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();
    if (webp.byteLength < body.byteLength) {
      body = webp;
      contentType = "image/webp";
      newPath = oldPath.replace(/\.[^./]+$/, "") + ".webp";
    }
  }
  bytesAfter += body.byteLength;

  if (!DRY_RUN) {
    const { error } = await newDb.storage.from(BUCKET).upload(newPath, body, {
      contentType,
      cacheControl: "31536000",
      upsert: true,
    });
    if (error) throw new Error(`upload: ${error.message}`);
  }

  const { data } = newDb.storage.from(BUCKET).getPublicUrl(newPath);
  urlMap.set(oldUrl, data.publicUrl);
}

const queue = [...urls].filter((u) => u?.startsWith(OLD_PREFIX));
const total = queue.length;
let done = 0;
async function worker() {
  while (queue.length) {
    const url = queue.shift();
    try {
      await copyImage(url);
    } catch (e) {
      failed.push(url);
      console.warn(`  ! ${url.slice(OLD_PREFIX.length)}: ${e.message}`);
    }
    done++;
    if (done % 20 === 0) console.log(`  imágenes: ${done}/${total}`);
  }
}
await Promise.all(Array.from({ length: 4 }, worker));

console.log(
  `\nImágenes: ${urlMap.size} copiadas, ${failed.length} fallidas | ` +
    `${kb(bytesBefore)}KB -> ${kb(bytesAfter)}KB (límite Free: 1GB)`
);

if (failed.length) {
  console.error("\nHay imágenes que no se pudieron copiar; no se escriben filas. Reintentá.");
  process.exit(1);
}

// ---------- 3. Write rows with rewritten URLs ----------

const rewrite = (u) => urlMap.get(u) ?? u;
const newProducts = products.map((p) => ({ ...p, images: (p.images ?? []).map(rewrite) }));
const newCovers = covers.map((c) => ({ ...c, image_url: rewrite(c.image_url) }));

if (DRY_RUN) {
  console.log(`\n[dry-run] se escribirían ${newProducts.length} productos y ${newCovers.length} portadas.`);
  process.exit(0);
}

for (const [table, rows] of [
  ["products", newProducts],
  ["category_covers", newCovers],
]) {
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await newDb.from(table).upsert(rows.slice(i, i + 500), { onConflict: "id" });
    if (error) {
      console.error(`No se pudo escribir ${table}: ${error.message}`);
      process.exit(1);
    }
  }
  const { count } = await newDb.from(table).select("*", { count: "exact", head: true });
  console.log(`${table}: ${rows.length} filas escritas, ${count} en el proyecto nuevo`);
}

console.log("\nMigración completa.");
