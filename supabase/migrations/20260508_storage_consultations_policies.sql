insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'consultations',
  'consultations',
  false,
  10485760,
  array['application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table storage.objects enable row level security;

drop policy if exists "consultations_admin_insert" on storage.objects;
create policy "consultations_admin_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'consultations'
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_admin = true
  )
);

drop policy if exists "consultations_admin_update" on storage.objects;
create policy "consultations_admin_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'consultations'
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_admin = true
  )
)
with check (
  bucket_id = 'consultations'
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_admin = true
  )
);

drop policy if exists "consultations_admin_delete" on storage.objects;
create policy "consultations_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'consultations'
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.is_admin = true
  )
);

drop policy if exists "consultations_no_direct_select" on storage.objects;
create policy "consultations_no_direct_select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'consultations'
  and false
);
