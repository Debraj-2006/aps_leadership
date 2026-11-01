-- Storage bucket for chapter documents (reports, minutes, certificates, financials).
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

drop policy if exists "documents_bucket_read" on storage.objects;
create policy "documents_bucket_read" on storage.objects for select
  using (bucket_id = 'documents' and auth.uid() is not null);

drop policy if exists "documents_bucket_insert" on storage.objects;
create policy "documents_bucket_insert" on storage.objects for insert
  with check (bucket_id = 'documents' and auth.uid() is not null);

drop policy if exists "documents_bucket_update" on storage.objects;
create policy "documents_bucket_update" on storage.objects for update
  using (bucket_id = 'documents' and (owner = auth.uid() or public.is_admin_role()));

drop policy if exists "documents_bucket_delete" on storage.objects;
create policy "documents_bucket_delete" on storage.objects for delete
  using (bucket_id = 'documents' and (owner = auth.uid() or public.is_admin_role()));
