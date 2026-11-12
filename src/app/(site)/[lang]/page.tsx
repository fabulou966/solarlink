import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import ProjectCard from "@/components/ProjectCard";
import QuoteForm from "@/components/QuoteForm";
import Footer from "@/components/Footer";
import { dict, isLocale, type Locale } from "@/lib/i18n";
import { getPublishedProjects } from "@/lib/data/projects";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const L = lang as Locale;
  const t = dict[L];
  const projects = await getPublishedProjects();

  return (
    <>
      <Header t={t} lang={L} />
      <Hero t={t} />

      <Services t={t} />

      <section
        id="projects"
        style={{ background: "color-mix(in srgb, var(--line) 35%, transparent)" }}
      >
        <div className="w">
          <h2>{t.p_t}</h2>
          <p className="sub">{t.p_s}</p>
          <div className="grid">
            {projects.map((p) => (
              <ProjectCard key={p.slug} p={p} t={t} lang={L} />
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="band">
        <div className="w">
          <h2>{t.c_t}</h2>
          <p className="sub">{t.c_s}</p>
          <QuoteForm t={t} lang={L} />
        </div>
      </section>

      <Footer />
    </>
  );
}
