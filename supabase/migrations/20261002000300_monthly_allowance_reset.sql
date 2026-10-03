-- Monthly visitor-hour allowance and its reset
--
-- What it does:
--   1. Makes households.monthly_quota default to 50 hours, and fills it in for
--      any existing household that has none
--   2. Schedules a pg_cron job that, at 00:00 UTC on the 1st of each month,
--      resets every household's hours_balance to its monthly_quota and
--      quota_used_this_month to 0
--
-- Behaviour: unused hours, including hours bought as top-ups, don't roll over.
--
-- Before running: enable the pg_cron extension in Supabase
-- (Database > Extensions > pg_cron).

alter table public.households alter column monthly_quota set default 50;

update public.households set monthly_quota = 50 where monthly_quota is null;

select cron.schedule(
  'reset-monthly-hours',
  '0 0 1 * *',
  $$update public.households
    set hours_balance = monthly_quota, quota_used_this_month = 0$$
);
