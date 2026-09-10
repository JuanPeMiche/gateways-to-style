/**
 * Generates the favicon set and the Open Graph image from the Gate01 logo.
 *
 * The full logo is a wide lockup (gear + "GATE01" + nixie tubes) inside a mostly
 * black 1544x1544 canvas. Scaled down to a 32px favicon it turns into an
 * unreadable dark smudge, which is why the tab still looked like a generic
 * placeholder. So the favicon uses just the nixie "01" — the most distinctive
 * and legible part at small sizes — while the OG image keeps the full lockup.
 *
 *   node scripts/generate-favicons.mjs
 */
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const SRC = "src/assets/logo-gate01.png";
const BG = { r: 10, g: 10, b: 10, alpha: 1 }; // #0a0a0a — the site background

// Nixie "01" tubes.
const MARK = { left: 1040, top: 500, width: 400, height: 560 };
// Full lockup with the surrounding black trimmed off.
const LOCKUP = { left: 103, top: 392, width: 1338, height: 756 };

const mark = await sharp(SRC).extract(MARK).png().toBuffer();

async function icon(size, pad = 0.06) {
  const inner = Math.round(size * (1 - pad * 2));
  const resized = await sharp(mark).resize(inner, inner, { fit: "inside" }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: resized, gravity: "center" }])
    .png()
    .toBuffer();
}

for (const s of [32, 192, 512]) {
  writeFileSync(`public/favicon-${s}.png`, await icon(s));
}
writeFileSync("public/apple-touch-icon.png", await icon(180, 0.12));

// Multi-size .ico (sharp has no ICO encoder, so build the container by hand).
const sizes = [16, 32, 48];
const pngs = [];
for (const s of sizes) pngs.push(await icon(s, 0.04));

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);

const entries = [];
let offset = 6 + 16 * sizes.length;
sizes.forEach((s, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0);
  e.writeUInt8(s, 1);
  e.writeUInt8(0, 2);
  e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(pngs[i].length, 8);
  e.writeUInt32LE(offset, 12);
  offset += pngs[i].length;
  entries.push(e);
});
writeFileSync("public/favicon.ico", Buffer.concat([header, ...entries, ...pngs]));

// Social preview: the whole lockup reads fine at 1200x630.
const lockup = await sharp(SRC).extract(LOCKUP).resize(960, 470, { fit: "inside" }).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: BG } })
  .composite([{ input: lockup, gravity: "center" }])
  .jpeg({ quality: 90 })
  .toFile("public/og-image.jpg");

console.log("favicons + og-image generados");
