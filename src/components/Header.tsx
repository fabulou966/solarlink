import Link from "next/link";
import type { Dict, Locale } from "@/lib/i18n";

export default function Header({ t, lang }: { t: Dict; lang: Locale }) {
  const other: Locale = lang === "ar" ? "en" : "ar";
  return (
    <header>
      <div className="w">
        <Link href={`/${lang}`} className="logo">
          Solar<b>Link</b>
        </Link>
        <nav>
          <a className="h" href="#services">
            {t.nav1}
          </a>
          <a className="h" href="#projects">
            {t.nav2}
          </a>
          <a className="h" href="#contact">
            {t.nav3}
          </a>
          <Link href={`/${other}`} id="lang" aria-label="Language">
            {lang === "ar" ? "English" : "العربية"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
