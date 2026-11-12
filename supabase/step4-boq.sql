-- ────────────────────────────────────────────────────────────────
-- SolarLink — BOQ (bill of quantities) support
-- Run this whole file once in: Supabase Dashboard → SQL Editor → New query.
-- Safe to re-run: every statement is idempotent.
-- ────────────────────────────────────────────────────────────────

-- The column holds an object path inside the "project-docs" bucket,
-- e.g. "boq/<project-id>/ab12cd34.pdf". NULL means no BOQ attached.

alter table public.projects
  add column if not exists boq_path text;

-- ── Storage: public bucket "project-docs" ───────────────────────
-- Public read (the download button on the site links straight to the file),
-- PDF only, max 10 MB. Uploads happen server-side with the service role.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-docs',
  'project-docs',
  true,
  10485760,
  array['application/pdf']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "project-docs public read" on storage.objects;
create policy "project-docs public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'project-docs');

drop policy if exists "project-docs admin insert" on storage.objects;
create policy "project-docs admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-docs' and public.is_admin());

drop policy if exists "project-docs admin update" on storage.objects;
create policy "project-docs admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-docs' and public.is_admin())
  with check (bucket_id = 'project-docs' and public.is_admin());

drop policy if exists "project-docs admin delete" on storage.objects;
create policy "project-docs admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-docs' and public.is_admin());
