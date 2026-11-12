import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import ShareLinks from "@/components/ShareLinks";
import { dict, isLocale, locales, type Locale } from "@/lib/i18n";
import { getPublishedProject, getPublishedSlugs } from "@/lib/data/projects";
import { site } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return locales.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

// Fully static page; navigation may block briefly instead of streaming a
// Suspense shell (site is small, so instant-shell validation is opt-out).
export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const L = (isLocale(lang) ? lang : "ar") as Locale;
  const p = await getPublishedProject(slug);
  if (!p) return {};
  const title = `${p.title[L]} | SolarLink`;
  const description = p.description?.[L] ?? p.summary[L];
  const og = p.ogImage ?? "/og/site.jpg";
  const url = `${site.url}/${L}/projects/${p.slug}`;
  return {
    title,
    description,
    alternates: {
      canonical: `/${L}/projects/${p.slug}`,
      languages: {
        ar: `/ar/projects/${p.slug}`,
        en: `/en/projects/${p.slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "SolarLink",
      images: [{ url: og, width: 1200, height: 630, alt: p.title[L] }],
      locale: L === "ar" ? "ar_AR" : "en_US",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [og],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const L = lang as Locale;
  const t = dict[L];
  const p = await getPublishedProject(slug);
  if (!p) notFound();

  const cover = p.cover ?? p.images[0]?.src;
  const coverAlt = p.cover
    ? (p.images.find((i) => i.src === p.cover)?.caption[L] ?? p.title[L])
    : (p.images[0]?.caption[L] ?? p.title[L]);

  return (
    <>
      <Header t={t} lang={L} />

      <div className="band">
        <div className="w pheadin">
          <div>
            <Link href={`/${L}`} className="back">
              {L === "ar" ? "→" : "←"} {t.backHome}
            </Link>
            <h1>{p.title[L]}</h1>
            <p>{p.summary[L]}</p>
          </div>
          {cover && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img className="pcover" src={cover} alt={coverAlt} />
          )}
        </div>
      </div>

      <main>
        <div className="w">
          {p.description && <p className="desc">{p.description[L]}</p>}

          {p.specs && (
            <div className="specswrap">
              <table className="specs">
                <tbody>
                  {p.specs.map((s, i) => (
                    <tr key={i}>
                      <th scope="row">{s.label[L]}</th>
                      <td dir="auto">{s.value[L]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="boqrow">
            {p.boqUrl ? (
              <a className="btn" href={p.boqUrl} target="_blank" rel="noreferrer">
                {t.downloadBoq}
              </a>
            ) : (
              <p className="boqmissing">{t.boqMissing}</p>
            )}
          </div>

          {p.images.length > 0 && (
            <section>
              <h2>{t.photos}</h2>
              <Gallery images={p.images} lang={L} t={t} rtl={L === "ar"} />
            </section>
          )}

          <ShareLinks
            t={t}
            title={`${p.title[L]} | SolarLink`}
            text={p.summary[L]}
            fallbackUrl={`${site.url}/${L}/projects/${p.slug}`}
          />
        </div>
      </main>

      <Footer lang={L} />
    </>
  );
}
