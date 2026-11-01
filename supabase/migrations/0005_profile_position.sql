-- Committee position (e.g. Chairperson, Secretary) chosen at signup by
-- Executive and Core Committee members. Working Committee members leave it empty.
alter table profiles add column if not exists position text;
