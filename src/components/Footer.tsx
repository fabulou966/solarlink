import type { Locale } from "@/lib/i18n";

export default function Footer({ lang }: { lang: Locale }) {
  const ar = lang === "ar";
  return (
    <footer>
      <div className="w">
        <p>
          {ar
            ? "SolarLink — تركيب أنظمة الطاقة الشمسية ودعم فني. الخصوصية | © 2026 SolarLink"
            : "SolarLink — solar installation and technical support. Privacy | © 2026 SolarLink"}
        </p>
        <nav>
          <a href="#services">{ar ? "الخدمات" : "Services"}</a>
          <a href="#projects">{ar ? "أعمالنا" : "Our work"}</a>
          <a href="#contact">{ar ? "تواصل معنا" : "Contact"}</a>
          <a href={`/${lang}/privacy`}>{ar ? "الخصوصية" : "Privacy"}</a>
        </nav>
      </div>
    </footer>
  );
}
