import type { Dict } from "@/lib/i18n";

export default function HowWeWork({ t }: { t: Dict }) {
  return (
    <section id="how">
      <div className="w">
        <h2>{t.howTitle}</h2>
        <ol>
          {t.howSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}
