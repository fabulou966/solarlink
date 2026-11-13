"use server";

import "server-only";
import sharp from "sharp";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PROJECTS_TAG } from "@/lib/data/projects";
import { str, numOrNull, slugify, refreshPublicPages } from "./actions-utils";

const BUCKET = "project-photos";
const DOCS_BUCKET = "project-docs";
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_BOQ_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 8;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export type ActionState = { error?: string; ok?: boolean };

// ── Auth ────────────────────────────────────────────────────────

export async function signIn(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email", 200);
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Invalid email or password." };

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return { error: "This account is not an admin." };
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ── Projects ────────────────────────────────────────────────────

function projectFields(fd: FormData) {
  return {
    slug: str(fd, "slug", 80),
    title_ar: str(fd, "title_ar", 200),
    title_en: str(fd, "title_en", 200),
    description_ar: str(fd, "description_ar", 4000) || null,
    description_en: str(fd, "description_en", 4000) || null,
    system_kw: numOrNull(fd, "system_kw"),
    pv_kwp: numOrNull(fd, "pv_kwp"),
    battery_kwh: numOrNull(fd, "battery_kwh"),
    city: str(fd, "city", 80) || null,
    installed_on: /^\d{4}-\d{2}-\d{2}$/.test(str(fd, "installed_on", 10))
      ? str(fd, "installed_on", 10)
      : null,
    published: fd.get("published") === "on" || fd.get("published") === "true",
  };
}

export async function createProject(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const fields = projectFields(fd);

  if (!fields.title_ar || !fields.title_en) {
    return { error: "Arabic and English titles are required." };
  }
  const slug = slugify(fields.slug || fields.title_en);
  if (!slug) return { error: "Could not build a slug — add an English title." };

  const { data, error } = await supabase
    .from("projects")
    .insert({ ...fields, slug })
    .select("id")
    .single();

  if (error) {
    return {
      error: error.code === "23505" ? "That slug is already used." : error.message,
    };
  }

  refreshPublicPages();
  redirect(`/admin/projects/${data.id}`);
}

export async function updateProject(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id", 40);
  if (!id) return { error: "Missing project id." };

  const fields = projectFields(fd);
  if (!fields.title_ar || !fields.title_en) {
    return { error: "Arabic and English titles are required." };
  }
  const slug = slugify(fields.slug || fields.title_en);
  if (!slug) return { error: "Could not build a slug." };

  const { error } = await supabase
    .from("projects")
    .update({ ...fields, slug })
    .eq("id", id);

  if (error) {
    return {
      error: error.code === "23505" ? "That slug is already used." : error.message,
    };
  }

  refreshPublicPages();
  redirect(`/admin/projects/${id}?saved=1`);
}

export async function togglePublished(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id", 40);
  const next = fd.get("published") === "true";
  if (!id) return;

  const { error } = await supabase.from("projects").update({ published: next }).eq("id", id);
  if (error) throw new Error(error.message);

  refreshPublicPages();
  revalidatePath("/admin");
}

export async function deleteProject(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id", 40);
  const confirmSlug = str(fd, "confirm", 80);
  if (!id) return;

  const { data: project } = await supabase
    .from("projects")
    .select("slug, project_images(path)")
    .eq("id", id)
    .maybeSingle();

  if (!project) return;
  if (confirmSlug !== project.slug) {
    redirect("/admin?msg=confirm");
  }

  const paths = (project.project_images ?? []).map((i: { path: string }) => i.path);
  if (paths.length) {
    await supabaseAdmin().storage.from(BUCKET).remove(paths);
  }

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);

  refreshPublicPages();
  revalidatePath("/admin");
}

// ── BOQ (bill of quantities) ──────────────────────────────────

export async function uploadBoq(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const projectId = str(fd, "project_id", 40);
  if (!projectId) return { error: "Missing project id." };

  const file = fd.get("boq");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a PDF file." };
  if (file.size > MAX_BOQ_BYTES) return { error: "The PDF is larger than 10 MB." };
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return { error: "The BOQ must be a PDF." };
  }

  const { data: project } = await supabase
    .from("projects")
    .select("boq_path")
    .eq("id", projectId)
    .maybeSingle();
  if (!project) return { error: "Project not found." };

  const path = `boq/${projectId}/${crypto.randomUUID().slice(0, 8)}.pdf`;
  const { error: uploadError } = await supabaseAdmin()
    .storage.from(DOCS_BUCKET)
    .upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: "application/pdf",
      cacheControl: "31536000",
    });
  if (uploadError) return { error: `Upload failed: ${uploadError.message}` };

  const { error } = await supabase.from("projects").update({ boq_path: path }).eq("id", projectId);
  if (error) {
    await supabaseAdmin().storage.from(DOCS_BUCKET).remove([path]);
    return { error: error.message };
  }

  const previous = (project as { boq_path: string | null }).boq_path;
  if (previous) await supabaseAdmin().storage.from(DOCS_BUCKET).remove([previous]);

  refreshPublicPages();
  revalidatePath(`/admin/projects/${projectId}`);
  return { ok: true };
}

export async function removeBoq(fd: FormData) {
  const { supabase } = await requireAdmin();
  const projectId = str(fd, "project_id", 40);
  if (!projectId) return;

  const { data: project } = await supabase
    .from("projects")
    .select("boq_path")
    .eq("id", projectId)
    .maybeSingle();
  const path = (project as { boq_path: string | null } | null)?.boq_path;
  if (!path) return;

  await supabaseAdmin().storage.from(DOCS_BUCKET).remove([path]);
  const { error } = await supabase.from("projects").update({ boq_path: null }).eq("id", projectId);
  if (error) throw new Error(error.message);

  refreshPublicPages();
  revalidatePath(`/admin/projects/${projectId}`);
}

// ── Photos ────────────────────────────────────────────────────

async function nextSortOrder(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  projectId: string,
): Promise<number> {
  const { data } = await supabase
    .from("project_images")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1);
  return (data?.[0]?.sort_order ?? -1) + 1;
}

export async function addPhotos(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const projectId = str(fd, "project_id", 40);
  if (!projectId) return { error: "Missing project id." };

  const files = fd.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return { error: "Choose at least one photo." };
  if (files.length > MAX_FILES) return { error: `Add at most ${MAX_FILES} photos at a time.` };

  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      return { error: `"${file.name}" is larger than 5 MB.` };
    }
    if (!ALLOWED.includes(file.type)) {
      return { error: `"${file.name}" is not a supported image.` };
    }
  }

  let sort = await nextSortOrder(supabase, projectId);
  const storage = supabaseAdmin().storage.from(BUCKET);
  let firstPath: string | null = null;

  for (const file of files) {
    const input = Buffer.from(await file.arrayBuffer());
    let meta;
    try {
      meta = await sharp(input).metadata();
    } catch {
      return { error: `"${file.name}" is not a valid image.` };
    }
    if (!meta.width || !meta.height) {
      return { error: `"${file.name}" is not a valid image.` };
    }

    const full = await sharp(input)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const thumb = await sharp(full)
      .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();

    const base = `${projectId}/${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
    const fullPath = `${base}.webp`;
    const thumbPath = `${base}-thumb.webp`;

    const up1 = await storage.upload(fullPath, full, {
      contentType: "image/webp",
      cacheControl: "31536000",
    });
    if (up1.error) return { error: `Upload failed: ${up1.error.message}` };
    const up2 = await storage.upload(thumbPath, thumb, {
      contentType: "image/webp",
      cacheControl: "31536000",
    });
    if (up2.error) return { error: `Upload failed: ${up2.error.message}` };

    const { error } = await supabase.from("project_images").insert({
      project_id: projectId,
      path: fullPath,
      caption_ar: "",
      caption_en: "",
      sort_order: sort++,
    });
    if (error) return { error: error.message };
    if (!firstPath) firstPath = fullPath;
  }

  const { count } = await supabase
    .from("project_images")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);
  if (count === files.length && firstPath) {
    await supabase.from("projects").update({ cover_image: firstPath }).eq("id", projectId);
  }

  refreshPublicPages();
  revalidatePath(`/admin/projects/${projectId}`);
  return { ok: true };
}

export async function deletePhoto(fd: FormData) {
  const { supabase } = await requireAdmin();
  const imageId = str(fd, "image_id", 40);
  if (!imageId) return;

  const { data: img } = await supabase
    .from("project_images")
    .select("id, project_id, path")
    .eq("id", imageId)
    .maybeSingle();
  if (!img) return;

  const { data: project } = await supabase
    .from("projects")
    .select("cover_image")
    .eq("id", img.project_id)
    .maybeSingle();

  await supabase.from("project_images").delete().eq("id", imageId);
  await supabaseAdmin().storage.from(BUCKET).remove([img.path]);

  if (project?.cover_image === img.path) {
    const { data: next } = await supabase
      .from("project_images")
      .select("path")
      .eq("project_id", img.project_id)
      .order("sort_order")
      .limit(1);
    await supabase
      .from("projects")
      .update({ cover_image: next?.[0]?.path ?? null })
      .eq("id", img.project_id);
  }

  refreshPublicPages();
  revalidatePath(`/admin/projects/${img.project_id}`);
}

export async function setCover(fd: FormData) {
  const { supabase } = await requireAdmin();
  const projectId = str(fd, "project_id", 40);
  const path = str(fd, "path", 300);
  if (!projectId || !path) return;

  const { data: own } = await supabase
    .from("project_images")
    .select("id")
    .eq("project_id", projectId)
    .eq("path", path)
    .maybeSingle();
  if (!own) return;

  const { error } = await supabase
    .from("projects")
    .update({ cover_image: path })
    .eq("id", projectId);
  if (error) throw new Error(error.message);

  refreshPublicPages();
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function saveCaptions(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const projectId = str(fd, "project_id", 40);
  const raw = str(fd, "captions", 20000);

  let rows: { id: string; caption_ar: string; caption_en: string }[];
  try {
    rows = JSON.parse(raw);
  } catch {
    return { error: "Could not read the captions." };
  }
  if (!Array.isArray(rows)) return { error: "Could not read the captions." };

  const ids = rows.map((r) => r.id).filter(Boolean);
  const { data: owned } = await supabase
    .from("project_images")
    .select("id")
    .eq("project_id", projectId)
    .in("id", ids);
  const allowed = new Set((owned ?? []).map((o: { id: string }) => o.id));

  for (const row of rows) {
    if (!allowed.has(row.id)) continue;
    const { error } = await supabase
      .from("project_images")
      .update({
        caption_ar: String(row.caption_ar ?? "").slice(0, 300),
        caption_en: String(row.caption_en ?? "").slice(0, 300),
      })
      .eq("id", row.id);
    if (error) return { error: error.message };
  }

  refreshPublicPages();
  revalidatePath(`/admin/projects/${projectId}`);
  return { ok: true };
}

export async function reorderPhotos(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const projectId = str(fd, "project_id", 40);
  let ids: string[];
  try {
    ids = JSON.parse(str(fd, "order", 20000));
  } catch {
    return { error: "Could not read the photo order." };
  }
  if (!projectId || !Array.isArray(ids)) return { error: "Could not read the photo order." };

  const { data: owned } = await supabase
    .from("project_images")
    .select("id")
    .eq("project_id", projectId);
  const allowed = new Set((owned ?? []).map((o: { id: string }) => o.id));

  let sort = 0;
  for (const id of ids) {
    if (!allowed.has(id)) continue;
    const { error } = await supabase
      .from("project_images")
      .update({ sort_order: sort++ })
      .eq("id", id);
    if (error) return { error: error.message };
  }

  refreshPublicPages();
  revalidatePath(`/admin/projects/${projectId}`);
  return { ok: true };
}