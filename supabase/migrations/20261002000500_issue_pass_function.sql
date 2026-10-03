-- issue_pass(): issue a visitor pass and spend the hours in one transaction
--
-- What it does:
--   Adds issue_pass(p_location_id, p_registration, p_start, p_hours), called
--   from the Issue pass dialog via supabase.rpc. In one transaction it:
--     1. checks the location belongs to the caller's household
--     2. deducts p_hours from hours_balance and adds them to
--        quota_used_this_month, only if the balance covers it
--     3. creates the pass, ending p_hours after p_start
--
-- Why: the balance used to be read in the browser and written back, so two
-- passes issued at the same moment could both spend the same hours. The
-- check and deduction now happen in a single UPDATE, which locks the row, so a
-- second request sees the updated balance and fails if there isn't enough.
--
-- Security: runs with owner privileges (security definer) and checks the caller
-- is signed in, in a household, and issuing for one of their own locations.
-- Only signed-in users can execute it.

create or replace function public.issue_pass(
  p_location_id uuid,
  p_registration text,
  p_start timestamptz,
  p_hours int
)
returns public.passes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id uuid;
  v_pass public.passes;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if p_hours <= 0 then
    raise exception 'Choose a duration';
  end if;

  select household_id into v_household_id
  from household_members where user_id = auth.uid();
  if v_household_id is null then
    raise exception 'You are not in a household';
  end if;

  if not exists (
    select 1 from locations
    where id = p_location_id and household_id = v_household_id
  ) then
    raise exception 'Location not found';
  end if;

  update households
  set hours_balance = hours_balance - p_hours,
      quota_used_this_month = quota_used_this_month + p_hours
  where id = v_household_id and hours_balance >= p_hours;

  if not found then
    raise exception 'Not enough hours left this month. Top up to issue this pass.';
  end if;

  insert into passes (registration, start_time, end_time, status, location_id, household_id, issued_by)
  values (
    upper(trim(p_registration)), p_start,
    p_start + make_interval(hours => p_hours),
    'ACTIVE', p_location_id, v_household_id, auth.uid()
  )
  returning * into v_pass;

  return v_pass;
end;
$$;

revoke execute on function public.issue_pass(uuid, text, timestamptz, int) from public, anon;
grant execute on function public.issue_pass(uuid, text, timestamptz, int) to authenticated;
