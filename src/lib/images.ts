// ─── Photo URLs ─────────────────────────────────────────────────
// `path` in the database is an object path inside the public bucket
// "project-photos" (e.g. "hybrid-30kw/cover.webp"). A leading "/" is treated
// as a site-relative URL so older static files keep working.

const BUCKET = "project-photos";

export function publicPhotoUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  if (!base) return path;
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`;
}

/** Grid-size variant of a stored photo ("cover.webp" → "cover-thumb.webp"). */
export function thumbUrl(path: string | null | undefined): string {
  const url = publicPhotoUrl(path);
  if (!url) return "";
  return url.replace(/(\.[a-z0-9]+)$/i, "-thumb$1");
}
