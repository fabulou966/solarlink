import "server-only";

export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see .env.example).",
    );
  }
  return { url, anonKey };
}

/**
 * True only when both public vars are present and are not the local-dev
 * placeholders shipped with `.env.local` (see `.env.example`). Treating the
 * placeholders as "not configured" lets the site fall back to the local seed
 * data instead of trying — and failing — to reach a project that does not exist.
 */
export function supabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !anonKey) return false;
  return !/placeholder/i.test(url) && !/placeholder/i.test(anonKey);
}

export function supabaseServiceKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "Supabase service role key is not configured: set SUPABASE_SERVICE_ROLE_KEY in .env.local (server only).",
    );
  }
  return key;
}
