# ParkPass

A centralised visitor parking permit platform for London boroughs — built as a portfolio project to demonstrate full stack development with modern tooling.

## The Problem

RingGo's visitor permit experience is unnecessarily complex. What was once a simple physical scratch-off ticket system has been digitised into a fragmented, confusing flow that bounces users between apps and council websites. The terminology is unclear, household sharing is practically impossible, and the UX hasn't kept pace with modern expectations.

ParkPass rethinks this from the ground up — a single, clean interface for managing visitor parking across any London borough.

---

## Tech Stack

| Technology | Reason |
|---|---|
| **Next.js 15 (App Router)** | Full stack React framework with server components, route handlers, and middleware |
| **TypeScript** | Type safety across the full stack |
| **GraphQL + Apollo Server** | Wanted to learn GraphQL properly; schema-first approach makes the data contract explicit |
| **graphql-request + TanStack Query** | Lighter alternative to Apollo Client; TanStack Query handles caching and server state, graphql-request handles transport |
| **Supabase** | Hosted Postgres, built-in auth, and a clean API — replaced a failed Prisma v7 attempt mid-build |
| **Zustand** | Minimal global state for UI concerns (active location, household) with `persist` middleware for cross-session retention |
| **Tailwind CSS v4** | Utility-first styling with a custom design system via `@theme` |
| **Motion** | Page transitions and modal animations |

---

## Features

- **Authentication** — email/password register and login via Supabase Auth, with protected routes enforced by Next.js middleware
- **Onboarding** — household setup on first login
- **Multi-location support** — register multiple addresses, each tied to a London borough council with its own rules
- **Postcode auto-detection** — integrates with `api.postcodes.io` to detect the correct borough from a postcode and validate it's a supported London council
- **Visitor pass issuing** — issue passes against saved or manually entered vehicles, with council-specific duration options and pricing
- **Pass expiry** — a Supabase SQL function (`expire_passes`) runs on every query to automatically mark stale passes as expired
- **Hours balance** — purchase hours in bundles, deducted on pass issue, with a monthly quota enforced per council
- **Household management** — invite members by email, assign roles (Owner/Member), remove members with guards against self-invite and duplicate invites
- **Saved vehicles** — add and remove vehicles with UK number plate styling
- **Omni search** — client-side search across passes, vehicles, and locations via TanStack Query cache
- **Responsive design** — mobile (bottom tab bar + location drawer), tablet, and desktop (persistent sidebar) layouts
- **Dark mode** — custom dark palette throughout

---

## Architecture Decisions

**GraphQL over REST**  
Using GraphQL meant defining a clear schema upfront which forced good thinking about data relationships early. It also means the frontend only fetches what it needs — no overfetching. The schema lives server-side in Apollo Server route handlers, consumed client-side via `graphql-request`.

**graphql-request + TanStack Query over Apollo Client**  
Apollo Client ships its own cache which conflicts with TanStack Query's cache. Using `graphql-request` as a thin transport layer and letting TanStack Query own caching gives a cleaner separation — and TanStack Query's devtools and invalidation APIs are excellent.

**Supabase over self-managed Postgres**  
Originally planned to use Prisma with SQLite locally, but Prisma v7 (released during the build) had breaking changes that cost significant time. Supabase was the right pivot — hosted Postgres, built-in auth with cookie-based sessions, and a clean JavaScript client. The tradeoff is vendor lock-in, but for an MVP this was the pragmatic call.

**Pass expiry via DB function**  
Rather than running a scheduled background job (which would require a paid Supabase plan), pass expiry is handled by a PostgreSQL function called on every passes query. This ensures consistency without infrastructure overhead.

**Client-side search**  
Search reads from the TanStack Query cache rather than making additional API calls. This works well for small datasets. A production implementation would use a server-side GraphQL `search` query with full-text search across Postgres tables.

**Zustand persist**  
Active location and household are persisted to `localStorage` via Zustand's `persist` middleware, so context survives page refreshes without an additional Supabase round-trip on every load.

---

## Known Limitations & Future Improvements

- **RLS disabled** — Supabase Row Level Security is currently disabled on all tables for development simplicity. Before a real production deployment, proper RLS policies would need to be configured per table
- **No email invites** — household member invites work by email lookup (the invitee must already have an account). A proper invite flow would use a token-based email system (e.g. Resend)
- **No payment integration** — hour purchases are mocked; a real implementation would integrate Stripe
- **Address lookup** — users type their address manually. A production version would use a postcode-to-address API (e.g. GetAddress.io) to auto-populate fields
- **Council data is seeded** — all 32 London borough councils are seeded with representative (not real) data. Real integration would require council APIs
- **Search is cache-dependent** — the omni search only finds data that's already been fetched and cached. A server-side GraphQL search query would be more reliable

---

## Running Locally

**Prerequisites:** Node.js 18+, a Supabase project

1. Clone the repo and install dependencies:
```bash
git clone https://github.com/ocodner-7/parkpass
cd parkpass
npm install
```

2. Create `.env.local` with your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_api_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Set up Supabase tables — run the following SQL in your Supabase SQL editor:

```sql
-- Profiles trigger (runs on new user signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Pass expiry function
CREATE OR REPLACE FUNCTION public.expire_passes()
RETURNS void AS $$
BEGIN
  UPDATE public.passes
  SET status = 'EXPIRED'
  WHERE status = 'ACTIVE'
  AND end_time < NOW();
END;
$$ LANGUAGE plpgsql;
```

4. 4. Seed the councils table with the 32 London boroughs by running the insert script in the Supabase SQL editor (see `scripts/seed-councils.sql` in the repo)

5. Run the dev server:
```bash
npm run dev
```

---

## Author

Built by Odaine — frontend engineer based in East London.