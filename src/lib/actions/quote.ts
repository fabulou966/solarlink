"use server";

import { headers } from "next/headers";
import { supabasePublic } from "@/lib/supabase/public";
import { site, whatsappReady } from "@/lib/site";

export type QuoteState = {
  ok: boolean;
  code?: "required" | "long" | "rate" | "generic";
  /** Ready-to-open wa.me link; only present when WHATSAPP is configured. */
  whatsappUrl?: string;
};

// ── Basic in-memory rate limit ──────────────────────────────────
// Per-instance only (resets on deploy/restart). Good enough to stop casual
// spam; the database also caps field lengths, and the form has a honeypot.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (!times.some((t) => now - t < WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return (forwarded?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
}

const LIMITS = { name: 100, phone: 30, city: 80, message: 2000 } as const;

export async function submitQuote(
  _prev: QuoteState,
  formData: FormData,
): Promise<QuoteState> {
  // Honeypot: real visitors never see this field. Bots that fill it get a
  // fake success and nothing is stored.
  if (String(formData.get("company") ?? "").trim().length > 0) {
    return { ok: true };
  }

  const locale = formData.get("locale") === "en" ? "en" : "ar";
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !phone) return { ok: false, code: "required" };
  if (
    name.length > LIMITS.name ||
    phone.length > LIMITS.phone ||
    city.length > LIMITS.city ||
    message.length > LIMITS.message
  ) {
    return { ok: false, code: "long" };
  }

  if (isRateLimited(await clientIp())) {
    return { ok: false, code: "rate" };
  }

  try {
    const { error } = await supabasePublic().from("quote_requests").insert({
      name,
      phone,
      city: city || null,
      message: message || null,
      locale,
    });
    if (error) {
      console.error("[quote] insert failed:", error.message);
      return { ok: false, code: "generic" };
    }
  } catch (err) {
    console.error("[quote] unexpected error:", err instanceof Error ? err.message : err);
    return { ok: false, code: "generic" };
  }

  // WhatsApp is optional: only hand back a link when the number is set.
  let whatsappUrl: string | undefined;
  if (whatsappReady()) {
    const text =
      `مرحبا، أريد عرض سعر لنظام طاقة شمسية.\n` +
      `الاسم: ${name}\nالهاتف: ${phone}\n${city ? `المدينة: ${city}\n` : ""}${
        message ? `${message}\n` : ""
      }`;
    whatsappUrl = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
  }

  return { ok: true, whatsappUrl };
}
