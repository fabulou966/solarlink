import { requireAdmin } from "@/lib/admin/auth";
import { site } from "@/lib/site";

export const instant = false;

type Quote = {
  id: string;
  name: string;
  phone: string;
  city: string | null;
  message: string | null;
  locale: string;
  created_at: string;
};

function waLink(phone: string, name: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  const text = `مرحبا ${name}، بخصوص طلبك على موقع SolarLink.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export default async function QuotesPage() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("quote_requests")
    .select("id, name, phone, city, message, locale, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  const rows = (data ?? []) as Quote[];

  return (
    <>
      <div className="page-head">
        <h1>Quote requests</h1>
        <span className="spacer" />
        <span className="muted">{rows.length} shown</span>
      </div>

      {error && <p className="alert err">{error.message}</p>}

      {rows.length === 0 && !error && (
        <div className="card">
          <h2>No requests yet</h2>
          <p className="hint">
            Messages sent from the quote form on the site appear here.
            {!site.whatsapp && " The WhatsApp number is still not set, so no redirect is offered."}
          </p>
        </div>
      )}

      <div className="list">
        {rows.map((q) => (
          <div className="item" key={q.id} style={{ gridTemplateColumns: "1fr" }}>
            <div>
              <h3>
                {q.name}
                <span className="badge draft" style={{ marginInlineStart: 8 }}>
                  {q.locale.toUpperCase()}
                </span>
              </h3>
              <p>
                <span className="mono" dir="ltr">
                  {q.phone}
                </span>
                {q.city ? ` · ${q.city}` : ""} ·{" "}
                {new Date(q.created_at).toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              {q.message && <p style={{ marginTop: 6, color: "var(--ink)" }}>{q.message}</p>}
              <div className="acts" style={{ justifyContent: "flex-start", marginTop: 10 }}>
                <a
                  className="btn sun sm"
                  href={waLink(q.phone, q.name)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Reply on WhatsApp
                </a>
                <a className="btn ghost sm" href={`tel:${q.phone.replace(/[^\d+]/g, "")}`}>
                  Call
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
