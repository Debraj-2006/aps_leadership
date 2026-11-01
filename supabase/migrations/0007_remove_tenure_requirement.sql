-- The app no longer uses tenures: the committee is one roster. Committee members
-- don't need a tenure any more. Existing tenure data is left untouched.
-- Run after 0006_point_requests.sql.

alter table committee_members alter column tenure_id drop not null;

-- Without a tenure, stop the same person being added twice for the same position.
create unique index if not exists committee_members_profile_designation_uniq
  on committee_members (profile_id, designation_id)
  where tenure_id is null;
