// ─── Project model ──────────────────────────────────────────────
// Types shared by the public site and the admin. Content lives in
// Supabase (see supabase/step3.sql); `fallbackProjects` below is only used
// for local development when the Supabase env vars are missing.

import type { Locale } from "./i18n";

export type Localized = Record<Locale, string>;

export type ProjectImage = {
  src: string; // full-size (max 1600px, WebP)
  thumb: string; // gallery grid thumbnail (800px, WebP)
  caption: Localized;
};

export type Spec = { label: Localized; value: Localized };

export type Project = {
  slug: string;
  title: Localized;
  summary: Localized;
  sizeKw?: number | null;
  description?: Localized; // long text for the project page
  specs?: Spec[];
  images: ProjectImage[];
  cover?: string; // chosen cover, full size
  coverThumb?: string; // chosen cover, grid size
  ogImage?: string; // 1200x630 Open Graph image
  boqUrl?: string | null; // PDF for "Download BOQ" (step 4)
};

// Dev-only seed, mirrors supabase/step3.sql. Never used in production.
export const fallbackProjects: Project[] = [
  {
    slug: "hybrid-30kw",
    title: {
      ar: "نظام هجين ثلاثي الطور 30 kW",
      en: "30 kW three-phase hybrid system",
    },
    summary: {
      ar: "ألواح 38.94 kWp · بطاريات 40 kWh · نظام 30 kW",
      en: "38.94 kWp PV · 40 kWh battery · 30 kW system",
    },
    sizeKw: 30,
    description: {
      ar: "نظام طاقة شمسية هجين ثلاثي الطور بقدرة 30 kW، يضم 66 لوحًا بقدرة 590 Wp (إجمالي 38.94 kWp) وبطاريات Deye بسعة 40 kWh وإنفرتر Deye، مع تثبيت الألواح على قواعد أرضية.",
      en: "A 30 kW three-phase hybrid solar system with 66 × 590 Wp panels (38.94 kWp total), 40 kWh of Deye batteries and a Deye inverter. The panels are mounted on ground structures.",
    },
    specs: [
      { label: { ar: "حجم النظام", en: "System size" }, value: { ar: "30 kW", en: "30 kW" } },
      { label: { ar: "الألواح الكهروضوئية", en: "PV array" }, value: { ar: "38.94 kWp", en: "38.94 kWp" } },
      { label: { ar: "البطاريات", en: "Battery bank" }, value: { ar: "40 kWh", en: "40 kWh" } },
    ],
    images: [
      {
        src: "/projects/hybrid-30kw/cover.webp",
        thumb: "/projects/hybrid-30kw/cover-thumb.webp",
        caption: { ar: "ألواح مثبتة على قواعد أرضية", en: "Ground-mounted PV array" },
      },
      {
        src: "/projects/hybrid-30kw/inverter.webp",
        thumb: "/projects/hybrid-30kw/inverter-thumb.webp",
        caption: { ar: "إنفرتر Deye مع لوحات الحماية", en: "Deye inverter with protection panels" },
      },
      {
        src: "/projects/hybrid-30kw/battery.webp",
        thumb: "/projects/hybrid-30kw/battery-thumb.webp",
        caption: { ar: "بطاريات Deye مع وحدة التحكم", en: "Deye batteries with control unit" },
      },
      {
        src: "/projects/hybrid-30kw/panels-1.webp",
        thumb: "/projects/hybrid-30kw/panels-1-thumb.webp",
        caption: { ar: "صفوف الألواح عن قرب", en: "Close-up of the panel rows" },
      },
      {
        src: "/projects/hybrid-30kw/inverter-detail.webp",
        thumb: "/projects/hybrid-30kw/inverter-detail-thumb.webp",
        caption: { ar: "شاشة الإنفرتر وأجهزة قياس الجهد", en: "Inverter display and voltage meters" },
      },
      {
        src: "/projects/hybrid-30kw/installation.webp",
        thumb: "/projects/hybrid-30kw/installation-thumb.webp",
        caption: { ar: "البطاريات والإنفرتر معًا", en: "Batteries and inverter together" },
      },
    ],
    cover: "/projects/hybrid-30kw/cover.webp",
    coverThumb: "/projects/hybrid-30kw/cover-thumb.webp",
    ogImage: "/og/hybrid-30kw.jpg",
    boqUrl: null,
  },
];
