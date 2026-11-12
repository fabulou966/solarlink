import "server-only";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { cacheLife, cacheTag } from "next/cache";
import { supabasePublic } from "@/lib/supabase/public";
import { publicPhotoUrl, thumbUrl } from "@/lib/images";
import { fallbackProjects, type Project, type Spec } from "@/lib/projects";

export const PROJECTS_TAG = "projects";

type ImageRow = {
  path: string;
  caption_ar: string | null;
  caption_en: string | null;
  sort_order: number;
};

type ProjectRow = {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  description_ar: string | null;
  description_en: string | null;
  system_kw: number | string | null;
  pv_kwp: number | string | null;
  battery_kwh: number | string | null;
  city: string | null;
  installed_on: string | null;
  cover_image: string | null;
  published: boolean;
  created_at: string;
  project_images: ImageRow[] | null;
};

const SELECT = "*, project_images(path, caption_ar, caption_en, sort_order)";

function num(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
}

function summaryOf(systemKw: number | null, pvKwp: number | null, batteryKwh: number | null) {
  const ar: string[] = [];
  const en: string[] = [];
  if (pvKwp !== null) {
    ar.push(`ألواح ${fmt(pvKwp)} kWp`);
    en.push(`${fmt(pvKwp)} kWp PV`);
  }
  if (batteryKwh !== null) {
    ar.push(`بطاريات ${fmt(batteryKwh)} kWh`);
    en.push(`${fmt(batteryKwh)} kWh battery`);
  }
  if (systemKw !== null) {
    ar.push(`نظام ${fmt(systemKw)} kW`);
    en.push(`${fmt(systemKw)} kW system`);
  }
  return { ar: ar.join(" · "), en: en.join(" · ") };
}

export function specsOf(row: ProjectRow): Spec[] | undefined {
  const specs: Spec[] = [];
  const systemKw = num(row.system_kw);
  const pvKwp = num(row.pv_kwp);
  const batteryKwh = num(row.battery_kwh);

  if (systemKw !== null) {
    specs.push({
      label: { ar: "حجم النظام", en: "System size" },
      value: { ar: `${fmt(systemKw)} kW`, en: `${fmt(systemKw)} kW` },
    });
  }
  if (pvKwp !== null) {
    specs.push({
      label: { ar: "الألواح الكهروضوئية", en: "PV array" },
      value: { ar: `${fmt(pvKwp)} kWp`, en: `${fmt(pvKwp)} kWp` },
    });
  }
  if (batteryKwh !== null) {
    specs.push({
      label: { ar: "البطاريات", en: "Battery bank" },
      value: { ar: `${fmt(batteryKwh)} kWh`, en: `${fmt(batteryKwh)} kWh` },
    });
  }
  if (row.city) {
    specs.push({
      label: { ar: "المدينة", en: "City" },
      value: { ar: row.city, en: row.city },
    });
  }
  if (row.installed_on) {
    specs.push({
      label: { ar: "تاريخ التركيب", en: "Installed" },
      value: { ar: row.installed_on, en: row.installed_on },
    });
  }
  return specs.length ? specs : undefined;
}

export function rowToProject(row: ProjectRow): Project {
  const images = [...(row.project_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({
      src: publicPhotoUrl(img.path),
      thumb: thumbUrl(img.path),
      caption: { ar: img.caption_ar ?? "", en: img.caption_en ?? "" },
    }));

  const coverSrc = row.cover_image ? publicPhotoUrl(row.cover_image) : images[0]?.src;
  const coverThumb = row.cover_image ? thumbUrl(row.cover_image) : images[0]?.thumb;
  const ogPath = join(process.cwd(), "public", "og", `${row.slug}.jpg`);

  const systemKw = num(row.system_kw);

  return {
    slug: row.slug,
    title: { ar: row.title_ar, en: row.title_en },
    summary: summaryOf(systemKw, num(row.pv_kwp), num(row.battery_kwh)),
    sizeKw: systemKw,
    description:
      row.description_ar || row.description_en
        ? { ar: row.description_ar ?? "", en: row.description_en ?? "" }
        : undefined,
    specs: specsOf(row),
    images,
    cover: coverSrc,
    coverThumb,
    ogImage: existsSync(ogPath) ? `/og/${row.slug}.jpg` : "/og/site.jpg",
    boqUrl: null,
  };
}

function configured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function localFallback(): Project[] {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Supabase env vars are missing in production. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  console.warn("[solarlink] Supabase env missing — serving local fallback projects (dev only).");
  return fallbackProjects;
}

export async function getPublishedProjects(): Promise<Project[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(PROJECTS_TAG);

  if (!configured()) return localFallback();

  const { data, error } = await supabasePublic()
    .from("projects")
    .select(SELECT)
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Could not load projects: ${error.message}`);
  return (data as ProjectRow[]).map(rowToProject);
}

export async function getPublishedProject(slug: string): Promise<Project | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(PROJECTS_TAG);

  if (!configured()) {
    return localFallback().find((p) => p.slug === slug) ?? null;
  }

  const { data, error } = await supabasePublic()
    .from("projects")
    .select(SELECT)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) throw new Error(`Could not load project "${slug}": ${error.message}`);
  return data ? rowToProject(data as ProjectRow) : null;
}

export async function getPublishedSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(PROJECTS_TAG);

  if (!configured()) return localFallback().map((p) => p.slug);

  const { data, error } = await supabasePublic()
    .from("projects")
    .select("slug")
    .eq("published", true);

  if (error) throw new Error(`Could not load project slugs: ${error.message}`);
  return (data ?? []).map((r) => (r as { slug: string }).slug);
}
