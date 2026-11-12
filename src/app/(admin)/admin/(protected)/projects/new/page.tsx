import Link from "next/link";
import ProjectForm from "@/components/admin/ProjectForm";
import { requireAdmin } from "@/lib/admin/auth";

export const instant = false;

export default async function NewProjectPage() {
  await requireAdmin();

  return (
    <>
      <div className="page-head">
        <h1>New project</h1>
        <span className="spacer" />
        <Link className="btn ghost sm" href="/admin">
          ← All projects
        </Link>
      </div>
      <p className="hint" style={{ marginTop: -8 }}>
        Create the project first, then upload photos on its edit page.
      </p>
      <ProjectForm mode="create" />
    </>
  );
}
