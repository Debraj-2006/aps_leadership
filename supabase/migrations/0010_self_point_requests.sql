-- Core and Working members can also request points for themselves (an Executive still
-- approves every request). Requests for others stay Working -> Core and Core -> Working.
-- Run after 0009.

create or replace function public.can_request_points_for(target uuid)
returns boolean as $$
  select case
    when target = auth.uid() then public.current_app_role() in ('core', 'working')
    else case public.current_app_role()
      when 'working' then exists (select 1 from profiles where id = target and role = 'core')
      when 'core' then exists (select 1 from profiles where id = target and role = 'working')
      else false
    end
  end;
$$ language sql stable security definer set search_path = public;
