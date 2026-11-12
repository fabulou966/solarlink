import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dict, isLocale, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const L = (isLocale(lang) ? lang : "ar") as Locale;
  return {
    title: `${dict[L].privacyTitle} | SolarLink`,
    description: dict[L].privacyBody[0],
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const L = lang as Locale;
  const t = dict[L];
  return (
    <>
      <Header t={t} lang={L} />
      <main className="w">
        <h1>{t.privacyTitle}</h1>
        {t.privacyBody.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </main>
      <Footer lang={L} />
    </>
  );
}
