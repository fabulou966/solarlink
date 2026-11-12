import type { Metadata } from "next";
import "../../admin.css";

// Separate root layout for /admin (Next.js multiple root layouts).
// The public site lives in app/(site)/[lang]. Nothing here is indexed.

export const metadata: Metadata = {
  title: "SolarLink admin",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
