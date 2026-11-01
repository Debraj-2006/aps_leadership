-- Member tasks + Working Committee privacy.
-- Run after 0003_points_badges.sql.
--
-- Who can assign tasks:
--   Executive Committee (and Super Admin / Faculty Advisor) -> Core or Working members
--   Core Committee                                         -> Working members only
--   Working Committee                                      -> nobody

create or replace function public.can_assign_task_to(target uuid)
returns boolean as $$
  select case public.current_app_role()
    when 'super_admin' then exists (select 1 from profiles where id = target and role in ('core', 'working'))
    when 'faculty_advisor' then exists (select 1 from profiles where id = target and role in ('core', 'working'))
    when 'executive' then exists (select 1 from profiles where id = target and role in ('core', 'working'))
    when 'core' then exists (select 1 from profiles where id = target and role = 'working')
    else false
  end;
$$ language sql stable security definer set search_path = public;

-- ========== MEMBER TASKS ==========
create table if not exists member_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  assigned_to uuid not null references profiles (id) on delete cascade,
  assigned_by uuid references profiles (id) on delete set null,
  event_id uuid references events (id) on delete set null,
  due_date date,
  priority task_priority not null default 'medium',
  status task_status not null default 'pending',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_member_tasks_assigned_to on member_tasks (assigned_to);
create index if not exists idx_member_tasks_assigned_by on member_tasks (assigned_by);

alter table member_tasks enable row level security;

drop policy if exists "member_tasks_select" on member_tasks;
create policy "member_tasks_select" on member_tasks for select using (
  assigned_to = auth.uid() or assigned_by = auth.uid() or public.is_admin_role()
);

drop policy if exists "member_tasks_insert" on member_tasks;
create policy "member_tasks_insert" on member_tasks for insert with check (
  assigned_by = auth.uid() and public.can_assign_task_to(assigned_to)
);

drop policy if exists "member_tasks_update" on member_tasks;
create policy "member_tasks_update" on member_tasks for update using (
  assigned_to = auth.uid() or assigned_by = auth.uid() or public.is_admin_role()
);

drop policy if exists "member_tasks_delete" on member_tasks;
create policy "member_tasks_delete" on member_tasks for delete using (
  assigned_by = auth.uid() or public.is_admin_role()
);

-- The person doing a task may only change its status, not its title, assignee, etc.
create or replace function public.member_tasks_guard_assignee()
returns trigger as $$
begin
  if auth.uid() = old.assigned_to
     and auth.uid() is distinct from old.assigned_by
     and not public.is_admin_role() then
    if new.title is distinct from old.title
       or new.description is distinct from old.description
       or new.assigned_to is distinct from old.assigned_to
       or new.assigned_by is distinct from old.assigned_by
       or new.event_id is distinct from old.event_id
       or new.due_date is distinct from old.due_date
       or new.priority is distinct from old.priority then
      raise exception 'You can only change the status of a task assigned to you.';
    end if;
  end if;
  if new.assigned_to is distinct from old.assigned_to and not public.can_assign_task_to(new.assigned_to) then
    raise exception 'You cannot assign this task to that member.';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists member_tasks_guard on member_tasks;
create trigger member_tasks_guard
  before update on member_tasks
  for each row execute procedure public.member_tasks_guard_assignee();

-- ========== WORKING COMMITTEE PRIVACY ==========
-- Working Committee members see only their own points and badges.
drop policy if exists "point_awards_select_all" on point_awards;
drop policy if exists "point_awards_select" on point_awards;
create policy "point_awards_select" on point_awards for select using (
  auth.uid() is not null
  and (public.current_app_role() <> 'working' or recipient_id = auth.uid())
);

drop policy if exists "badge_awards_select_all" on badge_awards;
drop policy if exists "badge_awards_select" on badge_awards;
create policy "badge_awards_select" on badge_awards for select using (
  auth.uid() is not null
  and (public.current_app_role() <> 'working' or recipient_id = auth.uid())
);
