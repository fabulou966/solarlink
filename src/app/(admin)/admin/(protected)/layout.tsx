import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { signOut } from "@/lib/admin/actions";

export const instant = false;

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <>
      <header className="adm-h">
        <Link href="/admin" className="brand">
          SolarLink <span>admin</span>
        </Link>
        <nav>
          <Link href="/admin">Projects</Link>
          <Link href="/admin/quotes">Quote requests</Link>
          <a href="/ar" target="_blank" rel="noreferrer">
            View site ↗
          </a>
        </nav>
        <span className="spacer" />
        <span className="who">{user.email}</span>
        <form action={signOut}>
          <button className="btn ghost sm" type="submit" style={{ color: "#e8eef5", borderColor: "#ffffff33" }}>
            Sign out
          </button>
        </form>
      </header>
      <main className="adm-m">{children}</main>
    </>
  );
}
