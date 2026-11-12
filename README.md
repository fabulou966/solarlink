# SolarLink

Bilingual (Arabic / English) site for a solar installation business, with a
Supabase-backed admin for projects, photos, BOQ PDFs and quote requests.

- **Public site:** `/[lang]` and `/[lang]/projects/[slug]` (`ar` is the default locale)
- **Admin:** `/admin` (Supabase Auth + allow-list, never indexed)
- **Content:** Supabase Postgres + two public storage buckets (`project-photos`, `project-docs`)

## Stack

- Next.js 16 (App Router, Cache Components, Turbopack) + React 19
- Tailwind CSS 4 (via `@tailwindcss/turbopack`) + self-hosted Cairo font
- Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- `sharp` for server-side image resizing to WebP

> This Next.js version has breaking changes. Before writing code, read the
> relevant guide in `node_modules/next/dist/docs/` (see `AGENTS.md`).

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the three values from
   Supabase → Project Settings → API:

   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=   # server only, never commit
   ```

   `.env.local` ships with placeholders so the site can run offline in
   development (it falls back to the seed project in `src/lib/projects.ts`).
   Replace them with real values to use Supabase.

3. Create the database schema in the Supabase SQL editor, in order:

   - `supabase/step3.sql` — tables, RLS, `is_admin()`, storage buckets, seed row
   - `supabase/step4-boq.sql` — `boq_path` column and `project-docs` bucket

4. Create an admin user in Supabase → Authentication → Users, then add it to
   the allow-list (replace the email):

   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'you@example.com'
   on conflict (user_id) do update set email = excluded.email;
   ```

5. Upload the existing project photos and verify the seed data:

   ```bash
   npm run seed
   ```

6. Start the dev server:

   ```bash
   npm run dev
   ```

   - Site: http://localhost:3000 (redirects to `/ar`)
   - Admin: http://localhost:3000/admin

## Scripts

| Script              | What it does                                                        |
| ------------------- | ------------------------------------------------------------------- |
| `npm run dev`       | Start the dev server (Turbopack)                                    |
| `npm run build`     | Production build                                                    |
| `npm run start`     | Serve the production build                                          |
| `npm run lint`      | ESLint                                                              |
| `npm run typecheck` | TypeScript (`tsc --noEmit`)                                         |
| `npm run seed`      | Upload `public/projects/hybrid-30kw` photos to Supabase and verify  |
| `npm run photos`    | Reprocess source photos → WebP + thumbnails + OG images             |

`photos` expects the originals in `C:/Users/Fouad/Desktop/SolarLink` (edit the
paths at the top of `scripts/process-photos.mjs` if they move).

## Content notes

- The quote form stores submissions in `quote_requests` and shows them in
  `/admin/quotes`.
- WhatsApp redirect is optional: set `site.whatsapp` in `src/lib/site.ts`
  (digits only, with country code). While empty, the form still saves the
  request but offers no WhatsApp link.
- Set `site.url` in `src/lib/site.ts` to the real deployment URL — it is used
  for canonical URLs, Open Graph and the sitemap.
- Project pages are statically generated from published rows and refreshed on
  admin edits via `updateTag("projects")` + `revalidatePath`.
- Uploads are resized to WebP on the server (max 1600px, 5 MB each, 8 files at
  a time). BOQ PDFs are max 10 MB.

## Deployment

Deploy on Vercel and set the same three environment variables in the project
settings. Production builds require real credentials — the local placeholder
fallback is for development and build-time only.
