-- Point requests can now be for Executives too.
--   Working members: for themselves, Core members or Executives.
--   Core members:    for themselves, Working members or Executives.
-- An Executive can't approve a request for themselves; another Executive must review it.
-- Includes everything from 0010, so 0010 can be skipped. Run after 0009.

create or replace function public.can_request_points_for(target uuid)
returns boolean as $$
  select case
    when target = auth.uid() then public.current_app_role() in ('core', 'working')
    else case public.current_app_role()
      when 'working' then exists (select 1 from profiles where id = target and role in ('core', 'executive'))
      when 'core' then exists (select 1 from profiles where id = target and role in ('working', 'executive'))
      else false
    end
  end;
$$ language sql stable security definer set search_path = public;

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
    if r.recipient_id = auth.uid() then
      raise exception 'You can''t approve a request for yourself. Another Executive needs to review it.';
    end if;
    if not exists (select 1 from profiles where id = r.recipient_id and role in ('core', 'working', 'executive')) then
      raise exception 'Points can only go to Core, Working or Executive Committee members.';
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
