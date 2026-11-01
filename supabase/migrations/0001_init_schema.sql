-- IEEE AP-S IEM Leadership & Tenure Transition Hub
-- Initial schema, relationships, and row-level security policies.

create extension if not exists "pgcrypto";

-- ========== ENUMS ==========
-- Role hierarchy: super_admin & faculty_advisor are institutional/admin-assigned.
-- executive (top committee tier) > core (mid tier) > working (base tier, everyone starts here).
create type user_role as enum (
  'super_admin',
  'faculty_advisor',
  'executive',
  'core',
  'working'
);

create type tenure_status as enum ('upcoming', 'active', 'completed');

create type event_type as enum (
  'technical_talk', 'workshop', 'webinar', 'competition', 'seminar', 'social', 'other'
);

create type event_status as enum ('planned', 'completed', 'cancelled');

create type document_category as enum (
  'event_report', 'meeting_minutes', 'certificate', 'financial_report', 'handover', 'other'
);

create type document_visibility as enum ('all', 'committee_only', 'admin_only');

create type handover_status as enum ('pending', 'in_progress', 'completed', 'approved');

create type task_priority as enum ('low', 'medium', 'high');

create type task_status as enum ('pending', 'in_progress', 'completed');

create type notification_type as enum ('deadline', 'approval', 'info', 'handover');

-- ========== PROFILES ==========
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  ieee_membership_no text unique,
  roll_number text,
  phone text,
  role user_role not null default 'working',
  avatar_url text,
  bio text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ========== DESIGNATIONS (lookup) ==========
create table designations (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  rank int not null default 100
);

-- ========== TENURES (academic-year committees) ==========
create table tenures (
  id uuid primary key default gen_random_uuid(),
  academic_year text not null unique,
  start_date date not null,
  end_date date not null,
  status tenure_status not null default 'upcoming',
  theme text,
  achievements text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========== COMMITTEE MEMBERS ==========
create table committee_members (
  id uuid primary key default gen_random_uuid(),
  tenure_id uuid not null references tenures (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  designation_id uuid not null references designations (id),
  custom_title text,
  is_outgoing boolean not null default false,
  joined_at date not null default current_date,
  left_at date,
  created_at timestamptz not null default now(),
  unique (tenure_id, profile_id, designation_id)
);

-- ========== EVENTS ==========
create table events (
  id uuid primary key default gen_random_uuid(),
  tenure_id uuid references tenures (id) on delete set null,
  title text not null,
  type event_type not null default 'other',
  description text,
  event_date date not null,
  venue text,
  speaker text,
  status event_status not null default 'planned',
  attendees_count int default 0,
  banner_url text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========== DOCUMENTS ==========
create table documents (
  id uuid primary key default gen_random_uuid(),
  tenure_id uuid references tenures (id) on delete set null,
  event_id uuid references events (id) on delete set null,
  title text not null,
  category document_category not null default 'other',
  file_path text not null,
  file_size bigint default 0,
  mime_type text,
  visibility document_visibility not null default 'all',
  uploaded_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

-- ========== HANDOVER RECORDS ==========
create table handover_records (
  id uuid primary key default gen_random_uuid(),
  from_tenure_id uuid references tenures (id) on delete set null,
  to_tenure_id uuid references tenures (id) on delete set null,
  outgoing_profile_id uuid references profiles (id),
  incoming_profile_id uuid references profiles (id),
  designation_id uuid references designations (id),
  status handover_status not null default 'pending',
  notes text,
  approved_by uuid references profiles (id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table handover_tasks (
  id uuid primary key default gen_random_uuid(),
  handover_record_id uuid not null references handover_records (id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  priority task_priority not null default 'medium',
  status task_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table handover_documents (
  id uuid primary key default gen_random_uuid(),
  handover_record_id uuid not null references handover_records (id) on delete cascade,
  document_id uuid not null references documents (id) on delete cascade,
  unique (handover_record_id, document_id)
);

-- ========== ACTIVITY LOGS ==========
create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles (id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

-- ========== NOTIFICATIONS ==========
create table notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references profiles (id) on delete cascade,
  title text not null,
  message text,
  type notification_type not null default 'info',
  is_read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

-- ========== INDEXES ==========
create index idx_committee_members_tenure on committee_members (tenure_id);
create index idx_committee_members_profile on committee_members (profile_id);
create index idx_events_tenure on events (tenure_id);
create index idx_documents_tenure on documents (tenure_id);
create index idx_handover_from_tenure on handover_records (from_tenure_id);
create index idx_handover_to_tenure on handover_records (to_tenure_id);
create index idx_notifications_recipient on notifications (recipient_id, is_read);
create index idx_activity_logs_created on activity_logs (created_at desc);

-- ========== HELPER: current user's role ==========
create or replace function public.current_app_role()
returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer set search_path = public;

create or replace function public.is_admin_role()
returns boolean as $$
  select public.current_app_role() in ('super_admin', 'faculty_advisor', 'executive');
$$ language sql stable security definer set search_path = public;

-- ========== ROW LEVEL SECURITY ==========
alter table profiles enable row level security;
alter table designations enable row level security;
alter table tenures enable row level security;
alter table committee_members enable row level security;
alter table events enable row level security;
alter table documents enable row level security;
alter table handover_records enable row level security;
alter table handover_tasks enable row level security;
alter table handover_documents enable row level security;
alter table activity_logs enable row level security;
alter table notifications enable row level security;

-- profiles
create policy "profiles_select_all" on profiles for select using (auth.uid() is not null);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_update_admin" on profiles for update using (public.is_admin_role());
create policy "profiles_insert_admin" on profiles for insert with check (public.is_admin_role() or auth.uid() = id);

-- designations
create policy "designations_select_all" on designations for select using (auth.uid() is not null);
create policy "designations_write_admin" on designations for all using (public.is_admin_role()) with check (public.is_admin_role());

-- tenures
create policy "tenures_select_all" on tenures for select using (auth.uid() is not null);
create policy "tenures_write_admin" on tenures for all using (public.is_admin_role()) with check (public.is_admin_role());

-- committee_members
create policy "committee_members_select_all" on committee_members for select using (auth.uid() is not null);
create policy "committee_members_write_admin" on committee_members for all using (public.is_admin_role()) with check (public.is_admin_role());

-- events
create policy "events_select_all" on events for select using (auth.uid() is not null);
create policy "events_write_members" on events for all
  using (public.current_app_role() in ('super_admin','faculty_advisor','executive','core'))
  with check (public.current_app_role() in ('super_admin','faculty_advisor','executive','core'));

-- documents
create policy "documents_select_visible" on documents for select using (
  auth.uid() is not null and (
    visibility = 'all'
    or (visibility = 'committee_only' and public.current_app_role() <> 'working')
    or (visibility = 'admin_only' and public.is_admin_role())
    or uploaded_by = auth.uid()
  )
);
create policy "documents_insert_members" on documents for insert with check (auth.uid() is not null);
create policy "documents_modify_owner_or_admin" on documents for update using (uploaded_by = auth.uid() or public.is_admin_role());
create policy "documents_delete_owner_or_admin" on documents for delete using (uploaded_by = auth.uid() or public.is_admin_role());

-- handover records
create policy "handover_select_involved" on handover_records for select using (
  auth.uid() is not null and (
    outgoing_profile_id = auth.uid() or incoming_profile_id = auth.uid() or public.is_admin_role()
  )
);
create policy "handover_write_involved_or_admin" on handover_records for all using (
  outgoing_profile_id = auth.uid() or public.is_admin_role()
) with check (
  outgoing_profile_id = auth.uid() or public.is_admin_role()
);

-- handover tasks
create policy "handover_tasks_select" on handover_tasks for select using (
  exists (select 1 from handover_records hr where hr.id = handover_record_id
    and (hr.outgoing_profile_id = auth.uid() or hr.incoming_profile_id = auth.uid() or public.is_admin_role()))
);
create policy "handover_tasks_write" on handover_tasks for all using (
  exists (select 1 from handover_records hr where hr.id = handover_record_id
    and (hr.outgoing_profile_id = auth.uid() or hr.incoming_profile_id = auth.uid() or public.is_admin_role()))
);

-- handover documents
create policy "handover_documents_select" on handover_documents for select using (
  exists (select 1 from handover_records hr where hr.id = handover_record_id
    and (hr.outgoing_profile_id = auth.uid() or hr.incoming_profile_id = auth.uid() or public.is_admin_role()))
);
create policy "handover_documents_write" on handover_documents for all using (
  exists (select 1 from handover_records hr where hr.id = handover_record_id
    and (hr.outgoing_profile_id = auth.uid() or public.is_admin_role()))
);

-- activity logs
create policy "activity_logs_select_admin" on activity_logs for select using (public.is_admin_role());
create policy "activity_logs_insert_any" on activity_logs for insert with check (auth.uid() is not null);

-- notifications
create policy "notifications_select_own" on notifications for select using (recipient_id = auth.uid());
create policy "notifications_update_own" on notifications for update using (recipient_id = auth.uid());
create policy "notifications_insert_any" on notifications for insert with check (auth.uid() is not null);
