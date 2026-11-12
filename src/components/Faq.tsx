import type { Dict } from "@/lib/i18n";

export default function Faq({ t }: { t: Dict }) {
  return (
    <section id="faq">
      <div className="w">
        <h2>{t.faqTitle}</h2>
        {t.faq.map((item, i) => (
          <details key={i}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
