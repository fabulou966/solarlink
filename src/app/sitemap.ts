import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { getPublishedProjects } from "@/lib/data/projects";
import { site } from "@/lib/site";

// Every public page exists once per locale. Projects also carry hreflang
// alternates so the Arabic and English versions are understood as one page.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getPublishedProjects();

  const home: MetadataRoute.Sitemap = locales.map((lang) => ({
    url: `${site.url}/${lang}`,
    changeFrequency: "weekly",
    priority: 1,
  }));

  const projectPages: MetadataRoute.Sitemap = projects.flatMap((p) =>
    locales.map((lang) => ({
      url: `${site.url}/${lang}/projects/${p.slug}`,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${site.url}/${l}/projects/${p.slug}`]),
        ),
      },
    })),
  );

  return [...home, ...projectPages];
}
