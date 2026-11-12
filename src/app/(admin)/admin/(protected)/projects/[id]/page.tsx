import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectForm, { type ProjectFormValues } from "@/components/admin/ProjectForm";
import PhotoManager, { type Photo } from "@/components/admin/PhotoManager";
import { requireAdmin } from "@/lib/admin/auth";
import { publicPhotoUrl, thumbUrl } from "@/lib/images";

export const instant = false;

type ImageRow = {
  id: string;
  path: string;
  caption_ar: string | null;
  caption_en: string | null;
  sort_order: number;
};

type Row = {
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
  project_images: ImageRow[] | null;
};

function s(v: number | string | null): string {
  return v === null || v === undefined ? "" : String(v);
}

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const { saved } = await searchParams;

  const { data } = await supabase
    .from("projects")
    .select(
      "id, slug, title_ar, title_en, description_ar, description_en, system_kw, pv_kwp, battery_kwh, city, installed_on, cover_image, published, project_images(id, path, caption_ar, caption_en, sort_order)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const p = data as Row;

  const values: ProjectFormValues = {
    id: p.id,
    slug: p.slug,
    title_ar: p.title_ar,
    title_en: p.title_en,
    description_ar: p.description_ar ?? "",
    description_en: p.description_en ?? "",
    system_kw: s(p.system_kw),
    pv_kwp: s(p.pv_kwp),
    battery_kwh: s(p.battery_kwh),
    city: p.city ?? "",
    installed_on: p.installed_on ?? "",
    published: p.published,
  };

  const photos: Photo[] = [...(p.project_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({
      id: img.id,
      path: img.path,
      url: publicPhotoUrl(img.path),
      thumb: thumbUrl(img.path),
      captionAr: img.caption_ar ?? "",
      captionEn: img.caption_en ?? "",
    }));

  return (
    <>
      <div className="page-head">
        <h1>Edit project</h1>
        <span className={`badge ${p.published ? "live" : "draft"}`}>
          {p.published ? "Published" : "Draft"}
        </span>
        <span className="spacer" />
        <Link className="btn ghost sm" href="/admin">
          ← All projects
        </Link>
        {p.published && (
          <a
            className="btn ghost sm"
            href={`/ar/projects/${p.slug}`}
            target="_blank"
            rel="noreferrer"
          >
            View on site ↗
          </a>
        )}
      </div>

      {saved && <p className="alert ok">Changes saved.</p>}

      <ProjectForm mode="edit" values={values} />

      <PhotoManager projectId={p.id} images={photos} coverPath={p.cover_image} />
    </>
  );
}
