-- ────────────────────────────────────────────────────────────────
-- SolarLink — Step 3 schema
-- Run this whole file once in: Supabase Dashboard → SQL Editor → New query.
-- Safe to re-run: every statement is idempotent.
-- ────────────────────────────────────────────────────────────────

-- ── Tables ──────────────────────────────────────────────────────

create table if not exists public.projects (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  title_ar       text not null,
  title_en       text not null,
  description_ar text,
  description_en text,
  system_kw      numeric,
  pv_kwp         numeric,
  battery_kwh    numeric,
  city           text,
  installed_on   date,
  cover_image    text,                     -- object path inside the project-photos bucket
  published      boolean not null default false,
  created_at     timestamptz not null default now()
);

create table if not exists public.project_images (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  path        text not null,               -- object path inside the project-photos bucket
  caption_ar  text,
  caption_en  text,
  sort_order  integer not null default 0
);

create table if not exists public.quote_requests (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 100),
  phone      text not null check (char_length(phone) between 5 and 30),
  city       text check (city is null or char_length(city) <= 80),
  message    text check (message is null or char_length(message) <= 2000),
  locale     text not null default 'ar' check (locale in ('ar', 'en')),
  created_at timestamptz not null default now()
);

create index if not exists project_images_project_idx on public.project_images (project_id, sort_order);
create index if not exists quote_requests_created_idx on public.quote_requests (created_at desc);

-- ── Admin allow-list ────────────────────────────────────────────
-- Any auth user whose id is in this table is an admin.
-- No policies on purpose: only the service role / security-definer helper can read it.

create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ── Row Level Security ──────────────────────────────────────────

alter table public.projects       enable row level security;
alter table public.project_images enable row level security;
alter table public.quote_requests enable row level security;

-- projects: public reads published only; admins read everything.
drop policy if exists "projects public read published" on public.projects;
create policy "projects public read published"
  on public.projects for select
  to anon, authenticated
  using (published = true or public.is_admin());

drop policy if exists "projects admin insert" on public.projects;
create policy "projects admin insert"
  on public.projects for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "projects admin update" on public.projects;
create policy "projects admin update"
  on public.projects for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "projects admin delete" on public.projects;
create policy "projects admin delete"
  on public.projects for delete
  to authenticated
  using (public.is_admin());

-- project_images: readable when the parent project is published (or for admins).
drop policy if exists "project_images public read published" on public.project_images;
create policy "project_images public read published"
  on public.project_images for select
  to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.projects p
      where p.id = project_id and p.published = true
    )
  );

drop policy if exists "project_images admin insert" on public.project_images;
create policy "project_images admin insert"
  on public.project_images for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "project_images admin update" on public.project_images;
create policy "project_images admin update"
  on public.project_images for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "project_images admin delete" on public.project_images;
create policy "project_images admin delete"
  on public.project_images for delete
  to authenticated
  using (public.is_admin());

-- quote_requests: anyone may submit; only admins may read / change / remove.
drop policy if exists "quote_requests public insert" on public.quote_requests;
create policy "quote_requests public insert"
  on public.quote_requests for insert
  to anon, authenticated
  with check (true);

drop policy if exists "quote_requests admin read" on public.quote_requests;
create policy "quote_requests admin read"
  on public.quote_requests for select
  to authenticated
  using (public.is_admin());

drop policy if exists "quote_requests admin update" on public.quote_requests;
create policy "quote_requests admin update"
  on public.quote_requests for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "quote_requests admin delete" on public.quote_requests;
create policy "quote_requests admin delete"
  on public.quote_requests for delete
  to authenticated
  using (public.is_admin());

-- ── Storage: public bucket "project-photos" ─────────────────────
-- Public read, max 5 MB per file, images only. The app uploads with the
-- service role after converting to WebP, so these policies are the
-- second line of defence for any direct client upload.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-photos',
  'project-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "project-photos public read" on storage.objects;
create policy "project-photos public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'project-photos');

drop policy if exists "project-photos admin insert" on storage.objects;
create policy "project-photos admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-photos' and public.is_admin());

drop policy if exists "project-photos admin update" on storage.objects;
create policy "project-photos admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-photos' and public.is_admin())
  with check (bucket_id = 'project-photos' and public.is_admin());

drop policy if exists "project-photos admin delete" on storage.objects;
create policy "project-photos admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-photos' and public.is_admin());

-- ── Seed: move the existing hybrid-30kw project into the DB ─────
-- Photo files are uploaded to project-photos/hybrid-30kw/ by
-- `node scripts/seed-supabase.mjs` (run after this SQL).

insert into public.projects (
  slug, title_ar, title_en, description_ar, description_en,
  system_kw, pv_kwp, battery_kwh, cover_image, published
)
values (
  'hybrid-30kw',
  'نظام هجين ثلاثي الطور 30 kW',
  '30 kW three-phase hybrid system',
  'نظام طاقة شمسية هجين ثلاثي الطور بقدرة 30 kW، يضم 66 لوحًا بقدرة 590 Wp (إجمالي 38.94 kWp) وبطاريات Deye بسعة 40 kWh وإنفرتر Deye، مع تثبيت الألواح على قواعد أرضية.',
  'A 30 kW three-phase hybrid solar system with 66 × 590 Wp panels (38.94 kWp total), 40 kWh of Deye batteries and a Deye inverter. The panels are mounted on ground structures.',
  30, 38.94, 40,
  'hybrid-30kw/cover.webp',
  true
)
on conflict (slug) do nothing;

with p as (select id from public.projects where slug = 'hybrid-30kw')
insert into public.project_images (project_id, path, caption_ar, caption_en, sort_order)
select p.id, v.path, v.caption_ar, v.caption_en, v.sort_order
from p
cross join (values
  ('hybrid-30kw/cover.webp',           'ألواح مثبتة على قواعد أرضية',        'Ground-mounted PV array',                0),
  ('hybrid-30kw/inverter.webp',        'إنفرتر Deye مع لوحات الحماية',       'Deye inverter with protection panels',   1),
  ('hybrid-30kw/battery.webp',         'بطاريات Deye مع وحدة التحكم',        'Deye batteries with control unit',       2),
  ('hybrid-30kw/panels-1.webp',        'صفوف الألواح عن قرب',                'Close-up of the panel rows',             3),
  ('hybrid-30kw/inverter-detail.webp', 'شاشة الإنفرتر وأجهزة قياس الجهد',    'Inverter display and voltage meters',    4),
  ('hybrid-30kw/installation.webp',    'البطاريات والإنفرتر معًا',           'Batteries and inverter together',        5)
) as v(path, caption_ar, caption_en, sort_order)
where not exists (
  select 1 from public.project_images i where i.project_id = p.id
);

-- ── Make yourself admin (do this after creating your auth user) ─
-- 1) Dashboard → Authentication → Users → Add user (email + password, confirm email).
-- 2) Replace the email below and run just this statement:
--
-- insert into public.admins (user_id, email)
-- select id, email from auth.users where email = 'you@example.com'
-- on conflict (user_id) do update set email = excluded.email;
