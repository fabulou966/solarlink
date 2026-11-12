import type { Dict } from "@/lib/i18n";

export default function About({ t }: { t: Dict }) {
  return (
    <section id="about">
      <div className="w">
        <h2>{t.aboutTitle}</h2>
        <p>{t.aboutText}</p>
      </div>
    </section>
  );
}
