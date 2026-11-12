"use client";

import { useCallback, useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { ProjectImage } from "@/lib/projects";

export default function Gallery({
  images,
  lang,
  t,
  rtl = false,
}: {
  images: ProjectImage[];
  lang: Locale;
  t: { close: string; prevImg: string; nextImg: string };
  rtl?: boolean;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const cur = open === null ? null : images[open];

  const close = useCallback(() => setOpen(null), []);
  const go = useCallback(
    (step: number) =>
      setOpen((i) => (i === null ? null : (i + step + images.length) % images.length)),
    [images.length],
  );

  // Keyboard navigation + scroll lock while the lightbox is open.
  // In RTL, "next" is to the left, so the arrow keys mirror.
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") go(rtl ? 1 : -1);
      if (e.key === "ArrowRight") go(rtl ? -1 : 1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open === null, close, go, rtl]);

  return (
    <>
      <div className="ggrid">
        {images.map((img, i) => (
          <button
            key={img.src}
            className="gitem"
            onClick={() => setOpen(i)}
            aria-label={img.caption[lang]}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.thumb} alt={img.caption[lang]} loading="lazy" />
            <span className="gcap">{img.caption[lang]}</span>
          </button>
        ))}
      </div>

      {cur && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={close}>
          <button className="lb-close" onClick={close} aria-label={t.close}>
            ✕
          </button>
          <button className="lb-nav lb-prev" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label={t.prevImg}>
            {rtl ? "›" : "‹"}
          </button>
          <figure onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cur.src} alt={cur.caption[lang]} />
            <figcaption>
              {cur.caption[lang]}
              <span className="lb-count">
                {(open ?? 0) + 1} / {images.length}
              </span>
            </figcaption>
          </figure>
          <button className="lb-nav lb-next" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label={t.nextImg}>
            {rtl ? "‹" : "›"}
          </button>
        </div>
      )}
    </>
  );
}
