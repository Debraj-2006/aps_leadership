-- Points and badges: Executive Committee (and Super Admin / Faculty Advisor) award
-- points and event badges to Core and Working Committee members.

create or replace function public.can_award_recognition()
returns boolean as $$
  select public.current_app_role() in ('super_admin', 'faculty_advisor', 'executive');
$$ language sql stable security definer set search_path = public;

create or replace function public.is_recognition_recipient(target uuid)
returns boolean as $$
  select exists (select 1 from profiles where id = target and role in ('core', 'working'));
$$ language sql stable security definer set search_path = public;

-- ========== POINT AWARDS ==========
create table if not exists point_awards (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references profiles (id) on delete cascade,
  awarded_by uuid references profiles (id) on delete set null,
  event_id uuid references events (id) on delete set null,
  points int not null check (points <> 0 and points between -100 and 100),
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_point_awards_recipient on point_awards (recipient_id);
create index if not exists idx_point_awards_created on point_awards (created_at desc);

-- ========== BADGE AWARDS ==========
create table if not exists badge_awards (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references profiles (id) on delete cascade,
  awarded_by uuid references profiles (id) on delete set null,
  event_id uuid not null references events (id) on delete cascade,
  badge text not null,
  note text,
  created_at timestamptz not null default now(),
  unique (recipient_id, event_id, badge)
);

create index if not exists idx_badge_awards_recipient on badge_awards (recipient_id);

-- ========== ROW LEVEL SECURITY ==========
alter table point_awards enable row level security;
alter table badge_awards enable row level security;

drop policy if exists "point_awards_select_all" on point_awards;
create policy "point_awards_select_all" on point_awards for select using (auth.uid() is not null);

drop policy if exists "point_awards_insert_awarder" on point_awards;
create policy "point_awards_insert_awarder" on point_awards for insert with check (
  public.can_award_recognition()
  and awarded_by = auth.uid()
  and public.is_recognition_recipient(recipient_id)
);

drop policy if exists "point_awards_delete_awarder" on point_awards;
create policy "point_awards_delete_awarder" on point_awards for delete using (
  public.can_award_recognition()
);

drop policy if exists "badge_awards_select_all" on badge_awards;
create policy "badge_awards_select_all" on badge_awards for select using (auth.uid() is not null);

drop policy if exists "badge_awards_insert_awarder" on badge_awards;
create policy "badge_awards_insert_awarder" on badge_awards for insert with check (
  public.can_award_recognition()
  and awarded_by = auth.uid()
  and public.is_recognition_recipient(recipient_id)
);

drop policy if exists "badge_awards_delete_awarder" on badge_awards;
create policy "badge_awards_delete_awarder" on badge_awards for delete using (
  public.can_award_recognition()
);
