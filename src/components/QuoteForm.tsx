"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitQuote, type QuoteState } from "@/lib/actions/quote";
import type { Dict, Locale } from "@/lib/i18n";

const INITIAL: QuoteState = { ok: false };

export default function QuoteForm({ t, lang }: { t: Dict; lang: Locale }) {
  const [state, action, pending] = useActionState(submitQuote, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);
  const openedRef = useRef(false);

  // Reset the fields after a successful send.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  // Follow the WhatsApp redirect only when the number is configured.
  useEffect(() => {
    if (state.ok && state.whatsappUrl && !openedRef.current) {
      openedRef.current = true;
      window.open(state.whatsappUrl, "_blank", "noopener");
    }
  }, [state]);

  const message = state.ok
    ? t.thanks
    : state.code === "required"
      ? t.errRequired
      : state.code === "long"
        ? t.errLong
        : state.code === "rate"
          ? t.errRate
          : state.code === "generic"
            ? t.errGeneric
            : "";

  return (
    <form id="f" ref={formRef} action={action}>
      <input type="hidden" name="locale" value={lang} />

      {/* Honeypot: hidden from people, tempting to bots. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="n">{t.fn}</label>
        <input id="n" name="name" required maxLength={100} autoComplete="name" />
      </div>
      <div>
        <label htmlFor="p">{t.fp}</label>
        <input
          id="p"
          name="phone"
          type="tel"
          required
          maxLength={30}
          autoComplete="tel"
          dir="ltr"
        />
      </div>
      <div>
        <label htmlFor="c">{t.fc}</label>
        <input id="c" name="city" maxLength={80} autoComplete="address-level2" />
      </div>
      <div>
        <label htmlFor="m">{t.fm}</label>
        <textarea id="m" name="message" rows={3} maxLength={2000} />
      </div>
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "…" : t.send}
      </button>
      <p id="note" role="status" data-ok={state.ok ? "1" : "0"}>
        {message}
      </p>
    </form>
  );
}
