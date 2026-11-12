// ────────────────────────────────────────────────────────────────
// Upload the existing hybrid-30kw photos into the Supabase bucket
// "project-photos" and verify the database rows.
//
//   1. Copy .env.example to .env.local and fill in the 3 keys.
//   2. Run supabase/step3.sql in the Supabase SQL editor.
//   3. node scripts/seed-supabase.mjs
//
// Uses only the service role key, from the server. Never prints it.
// ────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const ENV_FILE = join(ROOT, ".env.local");

function loadEnv() {
  if (!existsSync(ENV_FILE)) {
    console.error("Missing .env.local — copy .env.example and fill in the keys.");
    process.exit(1);
  }
  for (const line of readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!(m[1] in process.env)) process.env[m[1]] = v;
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env.local.");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

const FILES = [
  "cover.webp",
  "cover-thumb.webp",
  "inverter.webp",
  "inverter-thumb.webp",
  "battery.webp",
  "battery-thumb.webp",
  "panels-1.webp",
  "panels-1-thumb.webp",
  "inverter-detail.webp",
  "inverter-detail-thumb.webp",
  "installation.webp",
  "installation-thumb.webp",
];

const localDir = join(ROOT, "public", "projects", "hybrid-30kw");
const prefix = "hybrid-30kw";

for (const name of FILES) {
  const file = join(localDir, name);
  if (!existsSync(file)) {
    console.error(`missing local file: ${file}`);
    process.exit(1);
  }
  const { error } = await db.storage
    .from("project-photos")
    .upload(`${prefix}/${name}`, readFileSync(file), {
      contentType: "image/webp",
      upsert: true,
      cacheControl: "31536000",
    });
  if (error) {
    console.error(`upload failed (${name}):`, error.message);
    process.exit(1);
  }
  console.log(`uploaded ${prefix}/${name}`);
}

// Verify rows.
const { data: project, error: pErr } = await db
  .from("projects")
  .select("id, slug, published, cover_image")
  .eq("slug", "hybrid-30kw")
  .maybeSingle();

if (pErr || !project) {
  console.error("project row not found — did you run supabase/step3.sql?", pErr?.message ?? "");
  process.exit(1);
}

const { data: images, error: iErr } = await db
  .from("project_images")
  .select("path, sort_order")
  .eq("project_id", project.id)
  .order("sort_order");

if (iErr) {
  console.error("could not read project_images:", iErr.message);
  process.exit(1);
}

// Check the public URLs actually resolve.
const missing = [];
for (const img of images ?? []) {
  const publicUrl = `${url}/storage/v1/object/public/project-photos/${img.path}`;
  const res = await fetch(publicUrl, { method: "HEAD" });
  if (!res.ok) missing.push(`${img.path} (${res.status})`);
}

console.log(`project: ${project.slug} (published=${project.published})`);
console.log(`cover:   ${project.cover_image}`);
console.log(`images:  ${(images ?? []).length}`);
if (missing.length) {
  console.error("public URL check failed for:", missing.join(", "));
  process.exit(1);
}
console.log("all public photo URLs resolve ✓");
