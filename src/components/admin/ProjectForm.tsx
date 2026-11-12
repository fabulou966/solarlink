"use client";

import { useActionState } from "react";
import { createProject, updateProject, type ActionState } from "@/lib/admin/actions";

export type ProjectFormValues = {
  id?: string;
  slug: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  system_kw: string;
  pv_kwp: string;
  battery_kwh: string;
  city: string;
  installed_on: string;
  published: boolean;
};

const INITIAL: ActionState = {};

export default function ProjectForm({
  mode,
  values,
}: {
  mode: "create" | "edit";
  values?: ProjectFormValues;
}) {
  const [state, action, pending] = useActionState(
    mode === "create" ? createProject : updateProject,
    INITIAL,
  );

  const v = values;

  return (
    <form action={action}>
      {state.error && <p className="alert err">{state.error}</p>}
      {state.ok && <p className="alert ok">Saved.</p>}

      {v?.id && <input type="hidden" name="id" value={v.id} />}

      <div className="card">
        <h2>Details</h2>
        <p className="hint">
          Arabic is the default language. Units stay in Latin script (kW, kWp, kWh).
        </p>

        <div className="row2">
          <div className="field">
            <label htmlFor="title_en">Title — English</label>
            <input id="title_en" name="title_en" defaultValue={v?.title_en} required maxLength={200} />
          </div>
          <div className="field">
            <label htmlFor="title_ar">Title — Arabic</label>
            <input
              id="title_ar"
              name="title_ar"
              defaultValue={v?.title_ar}
              required
              maxLength={200}
              dir="rtl"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="slug">Slug (URL)</label>
          <input
            id="slug"
            name="slug"
            defaultValue={v?.slug}
            maxLength={80}
            placeholder="hybrid-30kw"
            className="mono"
          />
          <p className="hint" style={{ margin: "4px 0 0" }}>
            Lowercase letters, numbers and dashes. Leave empty to build it from the English title.
          </p>
        </div>

        <div className="row2">
          <div className="field">
            <label htmlFor="description_en">Description — English</label>
            <textarea
              id="description_en"
              name="description_en"
              defaultValue={v?.description_en}
              maxLength={4000}
              rows={5}
            />
          </div>
          <div className="field">
            <label htmlFor="description_ar">Description — Arabic</label>
            <textarea
              id="description_ar"
              name="description_ar"
              defaultValue={v?.description_ar}
              maxLength={4000}
              rows={5}
              dir="rtl"
            />
          </div>
        </div>

        <div className="row3">
          <div className="field">
            <label htmlFor="system_kw">System size (kW)</label>
            <input
              id="system_kw"
              name="system_kw"
              type="number"
              step="0.01"
              min="0"
              defaultValue={v?.system_kw}
              dir="ltr"
            />
          </div>
          <div className="field">
            <label htmlFor="pv_kwp">PV array (kWp)</label>
            <input
              id="pv_kwp"
              name="pv_kwp"
              type="number"
              step="0.01"
              min="0"
              defaultValue={v?.pv_kwp}
              dir="ltr"
            />
          </div>
          <div className="field">
            <label htmlFor="battery_kwh">Battery (kWh)</label>
            <input
              id="battery_kwh"
              name="battery_kwh"
              type="number"
              step="0.01"
              min="0"
              defaultValue={v?.battery_kwh}
              dir="ltr"
            />
          </div>
        </div>

        <div className="row2">
          <div className="field">
            <label htmlFor="city">City</label>
            <input id="city" name="city" defaultValue={v?.city} maxLength={80} />
          </div>
          <div className="field">
            <label htmlFor="installed_on">Installed on</label>
            <input
              id="installed_on"
              name="installed_on"
              type="date"
              defaultValue={v?.installed_on}
              dir="ltr"
            />
          </div>
        </div>

        <div className="field inline">
          <input
            id="published"
            name="published"
            type="checkbox"
            defaultChecked={v?.published ?? false}
          />
          <label htmlFor="published" style={{ margin: 0 }}>
            Published (visible on the public site)
          </label>
        </div>

        <div className="form-actions">
          <button className="btn" type="submit" disabled={pending}>
            {pending ? "Saving…" : mode === "create" ? "Create project" : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
