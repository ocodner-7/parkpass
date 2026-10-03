# ParkPass

**Live:** https://parkpass-london.vercel.app/

A visitor parking permit app for London, built as a portfolio project. Households share a monthly allowance of visitor hours, issue passes to saved vehicles in a couple of taps, and top up when they run low.

## The problem

RingGo's visitor permit experience is unnecessarily complex. What was once a simple scratch-off ticket has been digitised into a fragmented flow that bounces people between apps and council websites. The terminology is unclear, sharing with your household is practically impossible, and the UX hasn't kept pace with modern expectations.

ParkPass rethinks it as a single, clear interface for managing visitor parking across London.

## Design

The interface is built around UK road signage. The hours card, the number people check most, is styled as a parking sign in sign blue. Every vehicle appears as a real UK number plate, with the blue identifier band. Each section has its own colour (permits blue, vehicles plate yellow, household teal) that carries through the navigation, page headers and icons, so colour helps people find their way rather than decorating.

All colours are design tokens defined in Tailwind's `@theme`, with every text colour contrast-checked against WCAG AA.

## Accessibility

Accessibility was treated as a requirement, not a final pass:

- **Contrast:** every token meets WCAG AA (4.5:1) on the surfaces it's used on
- **Colour is never the only signal:** low balances, ending-soon passes and password rules all pair colour with text or an icon
- **Keyboard:** everything is reachable, with visible focus rings, a skip link, and a ⌘K / Ctrl+K shortcut for search
- **Search** is a full ARIA combobox, with arrow-key navigation and the active option announced
- **Dialogs** use Base UI for focus trapping, focus return, hiding the page behind from screen readers, and Escape to close
- **Touch targets** are at least 40–44px, and the mobile layout respects safe areas
- **Reduced motion** is respected for page transitions and modals

**Testing:** automated axe scans against WCAG 2.1 AA on every page and the main dialog (`tests/a11y.spec.ts`), plus manual keyboard-only and NVDA screen reader testing.

## Tech stack

| Technology | Reason |
| --- | --- |
| Next.js 15 (App Router) | Full stack React framework with route handlers and middleware |
| TypeScript | Type safety across the full stack |
| GraphQL + Apollo Server | A schema-first approach makes the data contract explicit |
| graphql-request + TanStack Query | A lighter alternative to Apollo Client: TanStack Query owns caching, graphql-request handles transport |
| Supabase (Postgres + Auth) | Hosted Postgres, built-in auth, and database functions for business rules |
| Zustand | Minimal global state (active location, household), persisted across sessions |
| Tailwind CSS v4 | Utility-first styling with a token-based design system via `@theme` |
| Base UI | Accessible dialog primitives |
| Motion | Page transitions and modal animations, with reduced-motion support |
| Playwright + axe | Automated accessibility testing |

## Features

- **Authentication:** email and password sign-up with email confirmation, via Supabase Auth
- **Onboarding:** household setup on first sign-in, starting with the full monthly allowance
- **Multiple locations:** register several addresses, each tied to a London borough
- **Postcode detection:** uses postcodes.io to find the borough and confirm it's supported
- **Issuing passes:** for saved or newly entered vehicles, with council-specific durations and prices, live countdowns, and durations you can't afford disabled
- **Monthly allowance:** each household gets 50 hours a month, reset on the 1st with no rollover, and can buy extra hours for the current month
- **Household management:** add existing users by email (up to 6 members), with Owner and Member roles
- **Saved vehicles**, shown as UK number plates
- **Search** across passes, vehicles and locations
- **Responsive layouts:** a bottom tab bar and location sheet on mobile, and a persistent sidebar on desktop
- **Installable PWA** with a web app manifest and icons

## Architecture decisions

### Business rules live in the database

Issuing a pass originally read the balance in the browser and wrote it back, so two people issuing at once could spend the same hours twice (a read-modify-write race). Issuing, top-ups and household creation now run as Postgres functions that check and update in a single transaction. The balance check and deduction happen in one `UPDATE ... WHERE hours_balance >= p_hours`, which locks the row, so concurrent requests can't both succeed. Prices are read from the council inside the function rather than trusted from the client.

The tradeoff is that logic is split between TypeScript and SQL. In return, the rules hold however the database is called.

### Authorisation in the API

The GraphQL route verifies the Supabase access token on every request and looks up the user's household. Every resolver then checks the requested household belongs to the caller before returning anything. The server uses the service role key, which bypasses row level security, so these checks are what keep households' data apart.

### GraphQL over REST

Defining the schema upfront forced good thinking about data relationships early, and the frontend only fetches what it needs.

### graphql-request + TanStack Query over Apollo Client

Apollo Client ships its own cache, which would compete with TanStack Query's. Using graphql-request as a thin transport and letting TanStack Query own caching keeps a clean separation.

### Supabase over self-managed Postgres

The original plan was Prisma with SQLite, but Prisma v7's breaking changes (released mid-build) cost significant time. Supabase gave hosted Postgres, auth and database functions in one place. The tradeoff is vendor lock-in.

### Pass expiry

Passes are marked expired by a Postgres function called when passes are queried, and the UI also treats any pass past its end time as expired. The monthly allowance reset runs as a scheduled `pg_cron` job.

## Known limitations and next steps

- **Allowances belong to the household, but councils set them per address.** The next change is moving the balance onto each location, so every address follows its own council's rules.
- **Members are added instantly.** A proper flow would send an invite the person has to accept.
- **Row level security:** the API enforces authorisation in every resolver. Completing RLS policies on every table would add a second layer, so the database enforces the same rules.
- **Payments are mocked.** A real version would integrate Stripe.
- **Addresses are typed manually.** A postcode-to-address lookup would autofill them.
- **Council data is representative,** not real council rules.
- **Search only covers data already loaded.** A server-side search query would be more complete.

## Running locally

Prerequisites: Node.js 18+ and a Supabase project.

```bash
git clone https://github.com/ocodner-7/parkpass
cd parkpass
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Set up the database in the Supabase SQL editor, in this order:

1. Create the base tables and the profiles trigger (below)
2. Seed the 32 London boroughs with `scripts/seed-councils.sql`
3. Enable the `pg_cron` extension (Database → Extensions)
4. Run the files in `supabase/migrations/` in filename order. Each one starts with a comment explaining exactly what it changes and why:
   - `..._locations_council_foreign_key.sql`: makes `locations.council_id` a UUID with a foreign key to `councils`
   - `..._household_membership_rules.sql`: one household per user, and at most 6 members
   - `..._monthly_allowance_reset.sql`: the 50-hour default and the monthly reset job
   - `..._create_household_function.sql`: creates a household and its owner in one transaction
   - `..._issue_pass_function.sql`: issues a pass and spends the hours in one transaction
   - `..._purchase_hours_function.sql`: buys hours at the council's price and records what was paid

```sql
-- Profiles trigger (runs on new user sign-up)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Pass expiry
create or replace function public.expire_passes()
returns void as $$
begin
  update public.passes
  set status = 'EXPIRED'
  where status = 'ACTIVE' and end_time < now();
end;
$$ language plpgsql;
```

In Supabase → Authentication → URL Configuration, add `http://localhost:3000/**` to the redirect URLs so email confirmation and password reset links work locally.

Then:

```bash
npm run dev
```

### Accessibility tests

With the dev server running, and a test account's details in `.env.test` as `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`:

```bash
npx playwright test tests/a11y.spec.ts --project=chromium
```

## Author

Built by Odaine, a frontend engineer based in East London.
