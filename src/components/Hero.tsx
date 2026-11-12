import type { Dict } from "@/lib/i18n";

export default function Hero({ t }: { t: Dict }) {
  return (
    <div className="hero">
      <div className="sun" aria-hidden="true" />
      <div className="w">
        <h1>{t.h1}</h1>
        <p>{t.hp}</p>
        <a className="btn" href="#contact">
          {t.cta}
        </a>
        <a className="btn alt" href="#projects">
          {t.cta2}
        </a>
      </div>
    </div>
  );
}
