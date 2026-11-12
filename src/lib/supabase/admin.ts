import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseEnv, supabaseServiceKey } from "./env";

/**
 * Service-role client. Bypasses RLS, so it may ONLY be used on the server
 * (uploads, seed scripts, privileged maintenance). Never import this from a
 * client component or expose its key.
 */
export function supabaseAdmin() {
  const { url } = supabaseEnv();
  return createClient(url, supabaseServiceKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
