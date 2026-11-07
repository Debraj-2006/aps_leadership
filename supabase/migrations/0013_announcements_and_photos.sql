-- 1. Announcements: Executives post notices that every member sees. Pinned ones also show on
--    the dashboard (and on the Tasks page for Working Committee members).
-- 2. Profile photos: a public "avatars" bucket. Uploads go through the app's server, which
--    only ever writes to the signed-in member's own folder.
-- Run after 0012_voting.sql.

-- ========== ANNOUNCEMENTS ==========
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  body text not null check (char_length(body) between 1 and 2000),
  is_pinned boolean not null default true,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_announcements_created on announcements (created_at desc);

alter table announcements enable row level security;

drop policy if exists "announcements_select_all" on announcements;
create policy "announcements_select_all" on announcements for select
  using (auth.uid() is not null);

drop policy if exists "announcements_insert_admin" on announcements;
create policy "announcements_insert_admin" on announcements for insert
  with check (public.is_admin_role() and created_by = auth.uid());

drop policy if exists "announcements_update_admin" on announcements;
create policy "announcements_update_admin" on announcements for update
  using (public.is_admin_role())
  with check (public.is_admin_role());

drop policy if exists "announcements_delete_admin" on announcements;
create policy "announcements_delete_admin" on announcements for delete
  using (public.is_admin_role());

-- ========== PROFILE PHOTOS ==========
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;
