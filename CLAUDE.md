# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server on port 3010
pnpm build        # TypeScript compile + Vite bundle
pnpm lint         # ESLint validation
pnpm preview      # Preview production build
```

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-readonly-service-key
```

## Architecture Overview

This is a **read-only admin dashboard** for a gold bullion trading platform. It connects to a Supabase (PostgreSQL) instance shared with the main `bullion-app` backend — no writes, no auth, pure analytics.

### Stack

- **React 18 + TypeScript** via **Vite** (port 3010)
- **React Query** (`@tanstack/react-query`) for all data fetching and caching
- **Supabase JS client** for database reads
- **Recharts** for charts, **Tailwind CSS** for styling
- **Decimal.js** for precise currency/commodity arithmetic
- **date-fns** + **date-fns-tz** for IST (Asia/Kolkata) timezone handling

### Data Flow

```
Page component
  → useQuery(queryKey, fetchFn)
  → src/lib/queries/*.ts  (async Supabase queries)
  → Supabase client (src/lib/supabase.ts)
```

All query functions live in `src/lib/queries/` and return typed interfaces defined in `src/types/index.ts`. Components never call Supabase directly.

Default React Query config: `staleTime: Infinity`, `retry: 1`. Manual refresh is wired through the `usePageRefresh` hook which invalidates query cache and tracks last-updated time.

### Unit System

A global `UnitContext` (in `src/contexts/`) drives display unit switching: **USD / INR / Grams**. Persisted to sessionStorage. All formatting goes through `src/lib/formatters.ts` — use `formatValue()` for any XAUT/currency display, never format inline.

Key constants in `src/lib/constants.ts`:
- `GRAMS_PER_OUNCE = 31.1035`
- `XAUT_DECIMALS = 6`
- `PRICE_STALE_THRESHOLD_MS = 5 minutes`
- Migration date: **March 1, 2026** (determines Arbitrum vs Ethereum for tx explorer links)

### Pages (React Router v6, flat routing)

| Route | Page | Purpose |
|---|---|---|
| `/` | Overview | Key metrics, charts |
| `/users` | Users | User list & KYC status |
| `/transactions` | Transactions | Buy/sell analytics |
| `/portfolio` | Portfolio | Holdings data |
| `/gifts` | Gifts | Gift/referral tracking |
| `/health` | Health | Price oracle status, DB stats |

Each page wraps content in `<PageShell>` → `<TopBar>` + main content. The `<TopBar>` hosts the refresh button.

### Database Tables (read-only)

Schema lives in `bullion-app/supabase/schema.sql`. Key tables:
- `users` — accounts with KYC status
- `holdings` — XAUT balance per user
- `transactions` — buy/sell with multi-stage statuses
- `price_history` — gold price (USD) + USD/INR exchange rate feed
- `gifts` — gift/referral system with escrow
- `user_gamification` / `user_badge` — streaks, levels, badges

### Key Conventions

- Use `Decimal.js` for any arithmetic on XAUT amounts or currency values — never native JS floats.
- Date comparisons must account for IST timezone via `date-fns-tz`.
- `isConfigured` flag in `lib/supabase.ts` guards against missing env vars — check it before adding new query paths.
- Tailwind only for styling — no CSS modules or inline styles.
- Chart colors come from Tailwind config (`chart-blue`, `chart-emerald`, etc.) — use those tokens.
