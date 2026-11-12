import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";

/**
 * Anonymous client for public, cacheable reads (RLS restricts it to published
 * content). No cookies, so it is safe inside `use cache`.
 */
export function supabasePublic() {
  const { url, anonKey } = supabaseEnv();
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
