-- Every signed-in member can see everyone's points and badges (previously Working
-- Committee members could only see their own). Run after 0007.

drop policy if exists "point_awards_select" on point_awards;
create policy "point_awards_select" on point_awards for select using (auth.uid() is not null);

drop policy if exists "badge_awards_select" on badge_awards;
create policy "badge_awards_select" on badge_awards for select using (auth.uid() is not null);
