-- Peer point requests: Working members can request points for Core members, and Core
-- members can request points for Working members. An Executive (or Super Admin /
-- Faculty Advisor) approves or declines; approval creates the point award.
-- Run after 0005_profile_position.sql.

create or replace function public.can_request_points_for(target uuid)
returns boolean as $$
  select target <> auth.uid() and case public.current_app_role()
    when 'working' then exists (select 1 from profiles where id = target and role = 'core')
    when 'core' then exists (select 1 from profiles where id = target and role = 'working')
    else false
  end;
$$ language sql stable security definer set search_path = public;

create table if not exists point_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid references profiles (id) on delete cascade,
  recipient_id uuid not null references profiles (id) on delete cascade,
  event_id uuid references events (id) on delete set null,
  points int not null check (points between 1 and 100),
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  reviewed_by uuid references profiles (id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  point_award_id uuid references point_awards (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_point_requests_status on point_requests (status, created_at desc);
create index if not exists idx_point_requests_requested_by on point_requests (requested_by);

alter table point_requests enable row level security;

drop policy if exists "point_requests_select" on point_requests;
create policy "point_requests_select" on point_requests for select using (
  requested_by = auth.uid() or public.can_award_recognition()
);

drop policy if exists "point_requests_insert" on point_requests;
create policy "point_requests_insert" on point_requests for insert with check (
  requested_by = auth.uid() and status = 'pending' and public.can_request_points_for(recipient_id)
);

-- Requesters may withdraw their own request while it is still pending.
drop policy if exists "point_requests_delete_own_pending" on point_requests;
create policy "point_requests_delete_own_pending" on point_requests for delete using (
  requested_by = auth.uid() and status = 'pending'
);

-- Reviewing goes through review_point_request() so the award and the status change
-- happen together; no direct update policy is granted.
create or replace function public.review_point_request(request_id uuid, approve boolean, note text default null)
returns uuid as $$
declare
  r point_requests;
  requester_name text;
  award_id uuid;
begin
  if not public.can_award_recognition() then
    raise exception 'Only Executive Committee members can review point requests.';
  end if;

  select * into r from point_requests where id = request_id for update;
  if not found then
    raise exception 'This request no longer exists.';
  end if;
  if r.status <> 'pending' then
    raise exception 'This request has already been reviewed.';
  end if;

  if approve then
    if not public.is_recognition_recipient(r.recipient_id) then
      raise exception 'Points can only go to Core or Working Committee members.';
    end if;
    select full_name into requester_name from profiles where id = r.requested_by;
    insert into point_awards (recipient_id, awarded_by, event_id, points, reason)
    values (
      r.recipient_id,
      auth.uid(),
      r.event_id,
      r.points,
      r.reason || coalesce(' (requested by ' || nullif(requester_name, '') || ')', '')
    )
    returning id into award_id;
  end if;

  update point_requests
  set status = case when approve then 'approved' else 'declined' end,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      review_note = nullif(trim(note), ''),
      point_award_id = award_id
  where id = request_id;

  return award_id;
end;
$$ language plpgsql security definer set search_path = public;

revoke all on function public.review_point_request(uuid, boolean, text) from public;
grant execute on function public.review_point_request(uuid, boolean, text) to authenticated;
