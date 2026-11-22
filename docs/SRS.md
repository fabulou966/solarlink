# Software Requirements Specification (SRS) — SolarLink

## 1. Purpose
SolarLink is a bilingual (Arabic/English) marketing and lead-generation website for a solar
installation business, with a Supabase-backed admin for managing projects, photos, BOQ PDFs
and quote requests.

## 2. Stakeholders
- **Manager / Product Owner:** creates projects, uploads photos/BOQs, reviews quote requests
- **Technician:** (future) updates task status, uploads site photos
- **Customer / Visitor:** browses projects, requests a quote
- **Admin:** manages user accounts and permissions

## 3. Functional requirements
- FR1: Display the home page in Arabic (default) and English with language switch.
- FR2: List published projects with cover, summary, specs, photos and optional BOQ download.
- FR3: Show a project detail page with gallery lightbox.
- FR4: Accept quote requests (name, phone, city, message) and store them.
- FR5: Admin login via Supabase Auth with an admin allow-list.
- FR6: Admin CRUD for projects, photos (upload/resize/reorder/captions/cover), BOQ PDFs.
- FR7: Admin view of quote requests with WhatsApp reply links.
- FR8: SEO: per-locale titles, meta descriptions, Open Graph tags, sitemap, robots.txt.
- FR9: Privacy page explaining quote-form data use.

## 4. Non-functional requirements
- NFR1: Performance — static generation for published pages, cached data with tag-based revalidation.
- NFR2: Security — RLS on all tables, service role only on server, no secrets in repo.
- NFR3: Accessibility — semantic HTML, alt text, keyboard navigation in gallery.
- NFR4: Maintainability — TypeScript, ESLint, unit tests, CI pipeline.
- NFR5: i18n — full Arabic (RTL) and English (LTR) support.

## 5. Constraints
- Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4, Supabase, sharp.
- Hosted on Netlify (production) / Vercel-compatible.
