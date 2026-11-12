"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { removeBoq, uploadBoq, type ActionState } from "@/lib/admin/actions";

const INITIAL: ActionState = {};

export default function BoqManager({
  projectId,
  boqPath,
  boqUrl,
}: {
  projectId: string;
  boqPath: string | null;
  boqUrl: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, action, pending] = useActionState(uploadBoq, INITIAL);

  // Clear the file input and reload the page data after a successful upload.
  useEffect(() => {
    if (state.ok) {
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="card">
      <h2>BOQ (PDF)</h2>
      <p className="hint">
        Attach the bill of quantities for this project. Visitors get a download button on the project
        page. One PDF, max 10 MB — uploading again replaces the current file.
      </p>

      {boqUrl ? (
        <p style={{ marginTop: 0 }}>
          <a className="btn ghost sm" href={boqUrl} target="_blank" rel="noreferrer">
            Open current PDF ↗
          </a>{" "}
          <span className="muted mono">{boqPath}</span>
        </p>
      ) : (
        <p className="muted">No BOQ attached yet.</p>
      )}

      <form action={action}>
        <input type="hidden" name="project_id" value={projectId} />
        <div className="field">
          <label htmlFor="boq">{boqUrl ? "Replace PDF" : "Attach PDF"}</label>
          <input id="boq" ref={fileRef} name="boq" type="file" accept="application/pdf" required />
        </div>
        {state.error && <p className="alert err">{state.error}</p>}
        <div className="form-actions">
          <button className="btn sun sm" type="submit" disabled={pending}>
            {pending ? "Uploading…" : boqUrl ? "Replace BOQ" : "Upload BOQ"}
          </button>
        </div>
      </form>

      {boqPath && (
        <form
          action={removeBoq}
          style={{ marginTop: 12 }}
          onSubmit={(e) => {
            if (!confirm("Remove the BOQ PDF from this project?")) e.preventDefault();
          }}
        >
          <input type="hidden" name="project_id" value={projectId} />
          <button className="btn danger sm" type="submit">
            Remove BOQ
          </button>
        </form>
      )}
    </div>
  );
}
