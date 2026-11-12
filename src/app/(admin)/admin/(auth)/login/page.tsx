import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { currentAdmin } from "@/lib/admin/auth";
import { supabaseConfigured } from "@/lib/supabase/env";

export const instant = false;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const { denied } = await searchParams;

  // Dev convenience: show setup instructions instead of crashing when the
  // Supabase keys are missing. Production builds fail earlier on purpose.
  if (!supabaseConfigured()) {
    return (
      <div className="login-wrap">
        <div className="login-card">
          <h1>
            SolarLink <span style={{ color: "var(--sun)" }}>admin</span>
          </h1>
          <p className="hint">Supabase is not configured yet.</p>
          <div className="alert err">
            Add the three variables to <code>.env.local</code> in the project root, then restart
            the dev server:
          </div>
          <ul className="mono" style={{ margin: "0 0 16px", paddingInlineStart: 20 }}>
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            <li>SUPABASE_SERVICE_ROLE_KEY</li>
          </ul>
          <p className="hint">
            The service-role key is server-only. Never commit it or paste it into chat.
          </p>
          <p className="hint" style={{ marginBottom: 0 }}>
            <Link href="/ar">← Back to the site</Link>
          </p>
        </div>
      </div>
    );
  }

  const admin = await currentAdmin();
  if (admin) redirect("/admin");

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1>
          SolarLink <span style={{ color: "var(--sun)" }}>admin</span>
        </h1>
        <p className="hint">Sign in with your admin account.</p>
        {denied && <p className="alert err">That account is not an admin.</p>}
        <LoginForm />
        <p className="hint" style={{ marginTop: 16, marginBottom: 0 }}>
          <Link href="/ar">← Back to the site</Link>
        </p>
      </div>
    </div>
  );
}
