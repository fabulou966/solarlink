import type { Dict } from "@/lib/i18n";

export default function Services({ t }: { t: Dict }) {
  return (
    <section id="services">
      <div className="w">
        <h2>{t.s_t}</h2>
        <p className="sub">{t.s_s}</p>
        <div className="grid">
          <div className="svc">
            <h3>{t.s1t}</h3>
            <p>{t.s1d}</p>
          </div>
          <div className="svc">
            <h3>{t.s2t}</h3>
            <p>{t.s2d}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
