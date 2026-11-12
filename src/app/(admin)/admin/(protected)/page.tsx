import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteProject, togglePublished } from "@/lib/admin/actions";
import { thumbUrl } from "@/lib/images";

export const instant = false;

type Row = {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  published: boolean;
  created_at: string;
  cover_image: string | null;
  project_images: { count: number }[] | null;
};

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { msg } = await searchParams;

  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, slug, title_ar, title_en, published, created_at, cover_image, project_images(count)",
    )
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Row[];

  return (
    <>
      <div className="page-head">
        <h1>Projects</h1>
        <span className="spacer" />
        <Link className="btn sun" href="/admin/projects/new">
          + New project
        </Link>
      </div>

      {msg === "confirm" && (
        <p className="alert err">
          Delete cancelled: the typed text did not match the project slug.
        </p>
      )}

      {error && <p className="alert err">{error.message}</p>}

      {rows.length === 0 && !error && (
        <div className="card">
          <h2>No projects yet</h2>
          <p className="hint">Create the first project to show it on the site.</p>
          <Link className="btn" href="/admin/projects/new">
            + New project
          </Link>
        </div>
      )}

      <div className="list">
        {rows.map((p) => {
          const cover = p.cover_image ? thumbUrl(p.cover_image) : "";
          const photos = p.project_images?.[0]?.count ?? 0;
          return (
            <div className="item" key={p.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {cover ? (
                <img className="thumb" src={cover} alt="" />
              ) : (
                <div className="thumb" />
              )}

              <div>
                <h3>
                  {p.title_en}{" "}
                  <span className={`badge ${p.published ? "live" : "draft"}`}>
                    {p.published ? "Published" : "Draft"}
                  </span>
                </h3>
                <p>
                  <span className="mono">/{p.slug}</span> · {p.title_ar}
                </p>
                <p>
                  {photos} photo{photos === 1 ? "" : "s"} · created{" "}
                  {new Date(p.created_at).toLocaleDateString("en-GB")}
                </p>
              </div>

              <div className="acts">
                <Link className="btn ghost sm" href={`/admin/projects/${p.id}`}>
                  Edit
                </Link>
                <form action={togglePublished}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="published" value={p.published ? "false" : "true"} />
                  <button className="btn ghost sm" type="submit">
                    {p.published ? "Unpublish" : "Publish"}
                  </button>
                </form>
                {p.published && (
                  <a
                    className="btn ghost sm"
                    href={`/ar/projects/${p.slug}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                  </a>
                )}
              </div>

              <details className="del">
                <summary>Delete…</summary>
                <form action={deleteProject}>
                  <input type="hidden" name="id" value={p.id} />
                  <p className="hint">
                    This removes the project and its photos. Type{" "}
                    <code>{p.slug}</code> to confirm.
                  </p>
                  <div className="inline">
                    <input type="text" name="confirm" placeholder={p.slug} required />
                    <button className="btn danger sm" type="submit">
                      Delete permanently
                    </button>
                  </div>
                </form>
              </details>
            </div>
          );
        })}
      </div>
    </>
  );
}
