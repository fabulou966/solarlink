"use client";

import { useState } from "react";
import type { Dict } from "@/lib/i18n";

// Share row: WhatsApp, Facebook, X, copy link.
export default function ShareLinks({
  t,
  title,
  text,
  fallbackUrl,
}: {
  t: Dict;
  title: string;
  text: string;
  fallbackUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  const url = () =>
    typeof window !== "undefined" ? window.location.href : fallbackUrl;

  const wa = () =>
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${title}\n${url()}`)}`,
      "_blank",
    );
  const fb = () =>
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url())}`,
      "_blank",
    );
  const x = () =>
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url())}`,
      "_blank",
    );
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="share">
      <button onClick={wa}>{t.shareWa}</button>
      <button onClick={fb}>{t.shareFb}</button>
      <button onClick={x}>{t.shareX}</button>
      <button onClick={copy}>{copied ? t.copied : t.copyLink}</button>
    </div>
  );
}
