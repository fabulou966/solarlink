import Link from "next/link";
import ShareButton from "./ShareButton";
import type { Dict, Locale } from "@/lib/i18n";
import type { Project } from "@/lib/projects";

export default function ProjectCard({
  p,
  t,
  lang,
}: {
  p: Project;
  t: Dict;
  lang: Locale;
}) {
  const title = p.title[lang];
  const summary = p.summary[lang];
  const href = `/${lang}/projects/${p.slug}`;
  return (
    <div className="proj">
      <Link className="ph" href={href}>
        {p.coverThumb || p.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.coverThumb ?? p.images[0].thumb} alt={title} loading="lazy" />
        ) : (
          <span>{t.ph}</span>
        )}
      </Link>
      <div className="pb">
        <h3>
          <Link href={href}>{title}</Link>
        </h3>
        <p>{summary}</p>
        <div className="flex gap-2">
          <Link className="ghost" href={href}>
            {t.details}
          </Link>
          <ShareButton
            label={t.share}
            title={`${title} | SolarLink`}
            text={summary}
          />
        </div>
      </div>
    </div>
  );
}
