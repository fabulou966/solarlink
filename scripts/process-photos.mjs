// Process SolarLink project photos: resize to web size, convert to WebP,
// generate thumbnails and the Open Graph (1200x630) image.
// Originals in SRC are never modified.

import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "C:/Users/Fouad/Desktop/SolarLink";
const OUT = "public/projects/hybrid-30kw";
const OG = "public/og";

// Final mapping of photo name -> original file on the owner's Desktop (confirmed).
const files = [
  ["cover", "WhatsApp Image 2026-11-10 at 4.22.56 PM.jpeg"],
  ["inverter", "WhatsApp Image 2026-11-10 at 4.22.42 PM.jpeg"],
  ["battery", "WhatsApp Image 2026-11-10 at 4.22.41 PM.jpeg"],
  ["panels-1", "WhatsApp Image 2026-11-10 at 4.23.49 PM.jpeg"],
  ["inverter-detail", "WhatsApp Image 2026-11-10 at 4.23.47 PM.jpeg"],
  ["installation", "WhatsApp Image 2026-11-10 at 4.22.40 PM.jpeg"],
];

await mkdir(OUT, { recursive: true });
await mkdir(OG, { recursive: true });

for (const [name, file] of files) {
  const input = `${SRC}/${file}`;
  const meta = await sharp(input).metadata();

  // Full image: max 1600px wide (portrait photos also capped at 1600 tall)
  await sharp(input)
    .rotate() // respect EXIF orientation
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(`${OUT}/${name}.webp`);

  // Thumbnail for the gallery grid
  await sharp(input)
    .rotate()
    .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(`${OUT}/${name}-thumb.webp`);

  console.log(`${name}: ${meta.width}x${meta.height} -> ${name}.webp + ${name}-thumb.webp`);
}

// ── Open Graph images (1200x630, branded) ─────────────────────
// Branded composite: deep-navy background, sun mark, cover photo
// (no upscaling), SolarLink wordmark + Latin subtitle that works
// for both Arabic and English shares. Per-language titles/descriptions
// come from the page meta tags, not the image.

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

async function ogImage({ photo, subtitle, out }) {
  const W = 1200, H = 630;
  const parts = [];
  let photoLeft = 0, photoTop = 0;
  if (photo) {
    const buf = await sharp(photo)
      .rotate()
      .resize({ height: H - 100, width: 480, fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer();
    const m = await sharp(buf).metadata();
    photoLeft = W - 60 - m.width;
    photoTop = Math.round((H - m.height) / 2);
    parts.push({ input: buf, left: photoLeft, top: photoTop });
  }
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="#10243a"/>
  <circle cx="${photo ? photoLeft - 120 : W - 220}" cy="90" r="150" fill="#f2a516" opacity="0.95"/>
  <circle cx="${photo ? photoLeft - 120 : W - 220}" cy="90" r="92" fill="#10243a"/>
  <circle cx="${photo ? photoLeft - 120 : W - 220}" cy="90" r="64" fill="#f2a516"/>
  <text x="80" y="330" font-family="Arial, Helvetica, sans-serif" font-size="88" font-weight="800"><tspan fill="#fff8e6">Solar</tspan><tspan fill="#f2a516">Link</tspan></text>
  <text x="80" y="405" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="600" fill="#c5d0dc">${esc(subtitle)}</text>
  <text x="80" y="${H - 55}" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="600" fill="#9fb0c2">solarlink.vercel.app</text>
</svg>`;
  await sharp(Buffer.from(svg))
    .composite(parts)
    .jpeg({ quality: 90 })
    .toFile(out);
  console.log(`OG image -> ${out} (1200x630)`);
}

await ogImage({
  photo: `${SRC}/${files[0][1]}`,
  subtitle: "30 kW Hybrid Solar System",
  out: `${OG}/hybrid-30kw.jpg`,
});
await ogImage({
  photo: null,
  subtitle: "Solar Installation & Technical Support",
  out: `${OG}/site.jpg`,
});
