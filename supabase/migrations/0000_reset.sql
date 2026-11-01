-- One-time cleanup: removes everything from a partially-failed run of 0001_init_schema.sql.
-- Safe to run on a fresh project with no real data yet. Run this BEFORE re-running 0001 and 0002.

drop trigger if exists on_auth_user_created on auth.users;

drop table if exists notifications cascade;
drop table if exists activity_logs cascade;
drop table if exists handover_documents cascade;
drop table if exists handover_tasks cascade;
drop table if exists handover_records cascade;
drop table if exists documents cascade;
drop table if exists events cascade;
drop table if exists committee_members cascade;
drop table if exists tenures cascade;
drop table if exists designations cascade;
drop table if exists profiles cascade;

drop function if exists handle_new_user cascade;
drop function if exists current_app_role cascade;
drop function if exists is_admin_role cascade;

drop type if exists user_role cascade;
drop type if exists tenure_status cascade;
drop type if exists event_type cascade;
drop type if exists event_status cascade;
drop type if exists document_category cascade;
drop type if exists document_visibility cascade;
drop type if exists handover_status cascade;
drop type if exists task_priority cascade;
drop type if exists task_status cascade;
drop type if exists notification_type cascade;
