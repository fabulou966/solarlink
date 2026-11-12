import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dict, isLocale, locales, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import "../../globals.css";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const L = (isLocale(lang) ? lang : "ar") as Locale;
  return {
    title: dict[L].title,
    description: dict[L].description,
    metadataBase: new URL(site.url),
    alternates: {
      canonical: `/${L}`,
      languages: { ar: "/ar", en: "/en" },
    },
    openGraph: {
      title: dict[L].title,
      description: dict[L].description,
      images: [{ url: "/og/site.jpg", width: 1200, height: 630, alt: "SolarLink" }],
      locale: L === "ar" ? "ar_AR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict[L].title,
      description: dict[L].description,
      images: ["/og/site.jpg"],
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const L = lang as Locale;
  return (
    <html lang={L} dir={dict[L].dir} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
