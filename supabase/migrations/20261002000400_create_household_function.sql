-- create_household(): create a household and its owner in one transaction
--
-- What it does:
--   - Adds create_household(household_name), called from onboarding via
--     supabase.rpc. It creates the household, sets its starting hours_balance
--     to its monthly_quota, and adds the caller as OWNER, all in one
--     transaction
--   - Drops the INSERT policies on households, so this function is the only
--     way to create one
--
-- Why: creating the household and the membership as two separate client
-- requests failed under row level security (the new household isn't visible
-- until you're a member of it), and could leave a household with no owner.
--
-- Security: runs with owner privileges (security definer), so it does its own
-- checks. The caller must be signed in and not already in a household, and it
-- uses auth.uid() rather than trusting a user ID from the client. Only signed-in
-- users can execute it.

create or replace function public.create_household(household_name text)
returns public.households
language plpgsql
security definer
set search_path = public
as $$
declare
  new_household public.households;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if exists (select 1 from household_members where user_id = auth.uid()) then
    raise exception 'You already belong to a household';
  end if;

  insert into households (name) values (trim(household_name))
  returning * into new_household;

  -- New households start with their full monthly allowance
  update households set hours_balance = monthly_quota
  where id = new_household.id
  returning * into new_household;

  insert into household_members (household_id, user_id, role)
  values (new_household.id, auth.uid(), 'OWNER');

  return new_household;
end;
$$;

revoke execute on function public.create_household(text) from public, anon;
grant execute on function public.create_household(text) to authenticated;

drop policy if exists "Users can create households" on public.households;
drop policy if exists "Users can insert households" on public.households;
