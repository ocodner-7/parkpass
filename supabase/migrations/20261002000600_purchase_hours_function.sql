-- purchase_hours(): buy extra hours and record the price paid
--
-- What it does:
--   1. Adds purchases.price_paid_pence, so purchase history shows what was
--      actually paid rather than today's price. Existing rows stay null.
--   2. Adds purchase_hours(p_location_id, p_hours), called from the Top up page
--      via supabase.rpc. In one transaction it looks up the price per hour from
--      the location's council, adds the hours to hours_balance, and records the
--      purchase with its price.
--
-- Behaviour: bought hours are added to this month's balance only. They don't
-- count towards quota_used_this_month, and they expire with the monthly reset.
--
-- Security: the price comes from the database, never from the browser. Only the
-- bundle sizes offered in the app (5, 10, 20, 50 hours) are accepted, and the
-- location must belong to the caller's household. Only signed-in users can
-- execute it.

alter table public.purchases add column if not exists price_paid_pence integer;

create or replace function public.purchase_hours(p_location_id uuid, p_hours int)
returns public.purchases
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id uuid;
  v_price int;
  v_purchase public.purchases;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if not (p_hours = any (array[5, 10, 20, 50])) then
    raise exception 'Choose one of the available bundles';
  end if;

  select household_id into v_household_id
  from household_members where user_id = auth.uid();
  if v_household_id is null then
    raise exception 'You are not in a household';
  end if;

  select c.price_per_hour into v_price
  from locations l join councils c on c.id = l.council_id
  where l.id = p_location_id and l.household_id = v_household_id;
  if v_price is null then
    raise exception 'Location not found';
  end if;

  update households
  set hours_balance = hours_balance + p_hours
  where id = v_household_id;

  insert into purchases (household_id, hours_purchased, price_paid_pence)
  values (v_household_id, p_hours, p_hours * v_price)
  returning * into v_purchase;

  return v_purchase;
end;
$$;

revoke execute on function public.purchase_hours(uuid, int) from public, anon;
grant execute on function public.purchase_hours(uuid, int) to authenticated;
