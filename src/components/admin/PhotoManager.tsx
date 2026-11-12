"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addPhotos,
  deletePhoto,
  reorderPhotos,
  saveCaptions,
  setCover,
  type ActionState,
} from "@/lib/admin/actions";

export type Photo = {
  id: string;
  path: string;
  url: string;
  thumb: string;
  captionAr: string;
  captionEn: string;
};

const INITIAL: ActionState = {};

export default function PhotoManager({
  projectId,
  images,
  coverPath,
}: {
  projectId: string;
  images: Photo[];
  coverPath: string | null;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Photo[]>(images);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [orderNote, setOrderNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const [addState, addAction, addPending] = useActionState(addPhotos, INITIAL);
  const [capState, capAction, capPending] = useActionState(saveCaptions, INITIAL);

  // Re-sync when the server sends fresh data (after a refresh). Adjusting the
  // state during render is the supported way to reset on a prop change here;
  // doing it in an effect would trigger a cascading render.
  const [syncedImages, setSyncedImages] = useState(images);
  if (images !== syncedImages) {
    setSyncedImages(images);
    setRows(images);
  }

  useEffect(() => {
    if (addState.ok) {
      fileRef.current && (fileRef.current.value = "");
      router.refresh();
    }
  }, [addState, router]);

  useEffect(() => {
    if (capState.ok) router.refresh();
  }, [capState, router]);

  function persistOrder(next: Photo[]) {
    setRows(next);
    setOrderNote("Saving order…");
    const fd = new FormData();
    fd.set("project_id", projectId);
    fd.set("order", JSON.stringify(next.map((r) => r.id)));
    startTransition(async () => {
      const res = await reorderPhotos(INITIAL, fd);
      setOrderNote(res.error ? res.error : "Order saved.");
      router.refresh();
    });
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    persistOrder(next);
  }

  function onDrop(index: number) {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      return;
    }
    const next = [...rows];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setDragIndex(null);
    persistOrder(next);
  }

  const captionsJson = JSON.stringify(
    rows.map((r) => ({ id: r.id, caption_ar: r.captionAr, caption_en: r.captionEn })),
  );

  return (
    <div className="card">
      <h2>Photos</h2>
      <p className="hint">
        Drag rows to reorder (or use the arrows). Pick one cover, and add a caption per photo in both
        languages. Uploads are resized to WebP automatically.
      </p>

      {/* Add photos */}
      <form action={addAction} style={{ marginBottom: 16 }}>
        <input type="hidden" name="project_id" value={projectId} />
        <div className="field">
          <label htmlFor="photos">Add photos (max 8 at a time, 5 MB each)</label>
          <input
            id="photos"
            ref={fileRef}
            name="photos"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
          />
        </div>
        {addState.error && <p className="alert err">{addState.error}</p>}
        <button className="btn sun sm" type="submit" disabled={addPending}>
          {addPending ? "Uploading…" : "Upload photos"}
        </button>
      </form>

      {rows.length === 0 && <p className="muted">No photos yet.</p>}

      {rows.length > 0 && (
        <>
          <div className="pgrid">
            {rows.map((r, i) => (
              <div
                key={r.id}
                className={`pitem${coverPath === r.path ? " cover" : ""}${
                  dragIndex === i ? " dragging" : ""
                }`}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(i)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="pimg" src={r.thumb} alt="" />

                <div>
                  <div className="caprow">
                    <div>
                      <label htmlFor={`ca-${r.id}`}>Caption — Arabic</label>
                      <input
                        id={`ca-${r.id}`}
                        dir="rtl"
                        value={r.captionAr}
                        maxLength={300}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((p) =>
                              p.id === r.id ? { ...p, captionAr: e.target.value } : p,
                            ),
                          )
                        }
                      />
                    </div>
                    <div>
                      <label htmlFor={`ce-${r.id}`}>Caption — English</label>
                      <input
                        id={`ce-${r.id}`}
                        value={r.captionEn}
                        maxLength={300}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((p) =>
                              p.id === r.id ? { ...p, captionEn: e.target.value } : p,
                            ),
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="meta">
                    <span className="handle" title="Drag to reorder">
                      ⠿
                    </span>
                    <button
                      type="button"
                      className="btn ghost sm"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                    >
                      ↑ Up
                    </button>
                    <button
                      type="button"
                      className="btn ghost sm"
                      onClick={() => move(i, 1)}
                      disabled={i === rows.length - 1}
                    >
                      ↓ Down
                    </button>

                    {coverPath === r.path ? (
                      <span className="badge live">Cover</span>
                    ) : (
                      <form action={setCover}>
                        <input type="hidden" name="project_id" value={projectId} />
                        <input type="hidden" name="path" value={r.path} />
                        <button className="btn ghost sm" type="submit">
                          Set as cover
                        </button>
                      </form>
                    )}

                    <span className="spacer" style={{ flex: 1 }} />

                    <form
                      action={deletePhoto}
                      onSubmit={(e) => {
                        if (!confirm("Delete this photo?")) e.preventDefault();
                      }}
                    >
                      <input type="hidden" name="image_id" value={r.id} />
                      <button className="btn danger sm" type="submit">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form action={capAction} style={{ marginTop: 14 }}>
            <input type="hidden" name="project_id" value={projectId} />
            <input type="hidden" name="captions" value={captionsJson} />
            {capState.error && <p className="alert err">{capState.error}</p>}
            <div className="form-actions">
              <button className="btn sm" type="submit" disabled={capPending}>
                {capPending ? "Saving…" : "Save captions"}
              </button>
              {orderNote && <span className="muted">{isPending ? "Saving order…" : orderNote}</span>}
            </div>
          </form>
        </>
      )}
    </div>
  );
}
