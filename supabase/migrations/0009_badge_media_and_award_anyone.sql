-- 1. Certificates and photos on badges: Executives upload, every signed-in member can view.
-- 2. A per-person permission to give points to anyone (including Executives), granted to
--    SOHAM KARAK. Other Executives keep giving points to Core and Working members only.
-- 3. Members can no longer change their own role, active status or that permission.
-- Run after 0008_points_visible_to_all.sql.

-- ========== BADGE MEDIA ==========
alter table badge_awards add column if not exists media_path text;
alter table badge_awards add column if not exists media_type text;

insert into storage.buckets (id, name, public)
values ('recognition', 'recognition', false)
on conflict (id) do nothing;

drop policy if exists "recognition_bucket_read" on storage.objects;
create policy "recognition_bucket_read" on storage.objects for select
  using (bucket_id = 'recognition' and auth.uid() is not null);

drop policy if exists "recognition_bucket_insert" on storage.objects;
create policy "recognition_bucket_insert" on storage.objects for insert
  with check (bucket_id = 'recognition' and public.can_award_recognition());

drop policy if exists "recognition_bucket_delete" on storage.objects;
create policy "recognition_bucket_delete" on storage.objects for delete
  using (bucket_id = 'recognition' and public.can_award_recognition());

-- ========== GIVE POINTS TO ANYONE ==========
alter table profiles add column if not exists can_award_anyone boolean not null default false;

update profiles set can_award_anyone = true where id = '832fd333-cd82-4553-99fd-95b76d519974'; -- SOHAM KARAK

create or replace function public.current_can_award_anyone()
returns boolean as $$
  select coalesce((select can_award_anyone from profiles where id = auth.uid()), false);
$$ language sql stable security definer set search_path = public;

drop policy if exists "point_awards_insert_awarder" on point_awards;
create policy "point_awards_insert_awarder" on point_awards for insert with check (
  public.can_award_recognition()
  and awarded_by = auth.uid()
  and (
    public.is_recognition_recipient(recipient_id)
    or (public.current_can_award_anyone() and recipient_id <> auth.uid())
  )
);

-- ========== PROTECT SENSITIVE PROFILE FIELDS ==========
-- Anyone may edit their own name, phone, etc., but only admins may change role or active
-- status, and the give-to-anyone permission can only be changed from the Supabase dashboard.
create or replace function public.profiles_guard_sensitive()
returns trigger as $$
begin
  if auth.uid() is null then
    return new; -- service role / SQL editor
  end if;
  if new.can_award_anyone is distinct from old.can_award_anyone then
    raise exception 'This permission can only be changed by a database administrator.';
  end if;
  if (new.role is distinct from old.role or new.is_active is distinct from old.is_active)
     and not public.is_admin_role() then
    raise exception 'Only an Executive or admin can change roles or account status.';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists profiles_guard_sensitive on profiles;
create trigger profiles_guard_sensitive
  before update on profiles
  for each row execute procedure public.profiles_guard_sensitive();
