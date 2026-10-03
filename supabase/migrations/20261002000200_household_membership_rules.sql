-- Household membership rules, enforced by the database
--
-- What it does:
--   1. Adds a unique constraint on household_members.user_id, so each user
--      belongs to at most one household
--   2. Adds a trigger that rejects new members once a household has 6
--
-- Why: the app looks up "my household" expecting exactly one row per user, and
-- the 6-member cap was previously only checked in the browser.
--
-- Before running: no user can currently belong to more than one household, or
-- the constraint will fail and nothing is changed.

alter table public.household_members
  add constraint household_members_user_id_key unique (user_id);

create or replace function public.enforce_household_member_limit()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from household_members
      where household_id = new.household_id) >= 6 then
    raise exception 'Your household is full. It can have up to 6 members.';
  end if;
  return new;
end;
$$;

create trigger household_member_limit
before insert on public.household_members
for each row execute function public.enforce_household_member_limit();
