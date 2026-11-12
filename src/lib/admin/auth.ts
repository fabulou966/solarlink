import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

export type AdminSession = {
  supabase: Awaited<ReturnType<typeof supabaseServer>>;
  user: User;
};

/**
 * Data Access Layer for the admin. Every admin page and every admin Server
 * Action calls this: it verifies the session with Supabase Auth AND that the
 * user is on the admins allow-list (public.is_admin()).
 */
export async function requireAdmin(): Promise<AdminSession> {
  // Unconfigured (dev) → the login page explains what is missing.
  if (!supabaseConfigured()) redirect("/admin/login");

  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) redirect("/admin/login?denied=1");

  return { supabase, user };
}

export async function currentAdmin(): Promise<User | null> {
  if (!supabaseConfigured()) return null;
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: isAdmin } = await supabase.rpc("is_admin");
  return isAdmin ? user : null;
}
