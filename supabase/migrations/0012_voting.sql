-- Voting: SOHAM KARAK can create polls; every signed-in member can vote once per poll.
-- Votes are anonymous. Results show after you vote, once the poll closes, or always for
-- the poll manager. Run after 0011.

-- ========== PERMISSION ==========
alter table profiles add column if not exists can_manage_voting boolean not null default false;
update profiles set can_manage_voting = true where id = '832fd333-cd82-4553-99fd-95b76d519974'; -- SOHAM KARAK

create or replace function public.current_can_manage_voting()
returns boolean as $$
  select coalesce((select can_manage_voting from profiles where id = auth.uid()), false);
$$ language sql stable security definer set search_path = public;

-- Members can't grant themselves this permission either (extends the 0009 guard).
create or replace function public.profiles_guard_sensitive()
returns trigger as $$
begin
  if auth.uid() is null then
    return new; -- service role / SQL editor
  end if;
  if new.can_award_anyone is distinct from old.can_award_anyone
     or new.can_manage_voting is distinct from old.can_manage_voting then
    raise exception 'This permission can only be changed by a database administrator.';
  end if;
  if (new.role is distinct from old.role or new.is_active is distinct from old.is_active)
     and not public.is_admin_role() then
    raise exception 'Only an Executive or admin can change roles or account status.';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- ========== TABLES ==========
create table if not exists polls (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 200),
  description text,
  created_by uuid references profiles (id) on delete set null,
  closes_at timestamptz,
  is_closed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references polls (id) on delete cascade,
  label text not null check (char_length(label) between 1 and 120),
  position int not null default 0
);

create table if not exists poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references polls (id) on delete cascade,
  option_id uuid not null references poll_options (id) on delete cascade,
  voter_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (poll_id, voter_id)
);

create index if not exists idx_poll_options_poll on poll_options (poll_id, position);
create index if not exists idx_poll_votes_poll on poll_votes (poll_id);

alter table polls enable row level security;
alter table poll_options enable row level security;
alter table poll_votes enable row level security;

create or replace function public.poll_is_open(target_poll uuid)
returns boolean as $$
  select exists (
    select 1 from polls
    where id = target_poll and not is_closed and (closes_at is null or closes_at > now())
  );
$$ language sql stable security definer set search_path = public;

-- polls and options: everyone reads, only the voting manager writes
drop policy if exists "polls_select" on polls;
create policy "polls_select" on polls for select using (auth.uid() is not null);
drop policy if exists "polls_write" on polls;
create policy "polls_write" on polls for all
  using (public.current_can_manage_voting())
  with check (public.current_can_manage_voting() and created_by = auth.uid());

drop policy if exists "poll_options_select" on poll_options;
create policy "poll_options_select" on poll_options for select using (auth.uid() is not null);
drop policy if exists "poll_options_write" on poll_options;
create policy "poll_options_write" on poll_options for all
  using (public.current_can_manage_voting())
  with check (public.current_can_manage_voting());

-- votes: one per member per open poll; members only see their own vote rows
drop policy if exists "poll_votes_select_own" on poll_votes;
create policy "poll_votes_select_own" on poll_votes for select using (voter_id = auth.uid());
drop policy if exists "poll_votes_insert" on poll_votes;
create policy "poll_votes_insert" on poll_votes for insert with check (
  voter_id = auth.uid()
  and public.poll_is_open(poll_id)
  and exists (select 1 from poll_options o where o.id = option_id and o.poll_id = poll_votes.poll_id)
);

-- Vote counts without revealing who voted for what.
create or replace function public.poll_results(target_poll uuid)
returns table (option_id uuid, votes bigint) as $$
  select o.id, count(v.id)
  from poll_options o
  left join poll_votes v on v.option_id = o.id
  where o.poll_id = target_poll
    and (
      public.current_can_manage_voting()
      or exists (select 1 from poll_votes mv where mv.poll_id = target_poll and mv.voter_id = auth.uid())
      or not public.poll_is_open(target_poll)
    )
  group by o.id;
$$ language sql stable security definer set search_path = public;

grant execute on function public.poll_results(uuid) to authenticated;

-- ========== NOTIFY SOHAM ==========
insert into notifications (recipient_id, title, message, type, link)
values (
  '832fd333-cd82-4553-99fd-95b76d519974',
  'Voting is now available',
  'You can now create polls on the Voting page. Every member can vote once per poll, votes are anonymous, and you can close or delete a poll at any time.',
  'info',
  '/voting'
);
