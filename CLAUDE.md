# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Next.js 16 Breaking Changes

**Read `node_modules/next/dist/docs/` before writing any Next.js code.** This is Next.js 16.2.7 — not 15 or 14. Key differences:

- **Auth middleware file is `proxy.ts`, not `middleware.ts`** — the export must be named `proxy`, not `middleware`
- `dynamic = 'force-dynamic'` is incompatible with `cacheComponents: true` — that config option is intentionally removed from `next.config.ts`
- Turbopack is the default bundler; no extra config needed
- Server Component auth uses `supabase.auth.getUser()`, never `getSession()` (security requirement from Supabase SSR)

## Commands

```bash
npm run dev      # Start dev server (Turbopack, http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
npx tsc --noEmit # Type check only
```

No test suite is configured.

## Architecture

### Request Flow for AI Analysis

```
Browser → POST /api/analyze (with x-user-id header injected by proxy.ts)
  → fetches /api/price + /api/candles×6 in parallel
  → calculateAll() computes 6 indicators per timeframe
  → buildSystemPrompt() injects all market data into AI context
  → streams OpenRouter response (SSE) back to browser
  → parseSignalFromResponse() extracts structured signal
  → inserts into Supabase signals + chat_messages tables
```

### Auth Pattern

`proxy.ts` is the single auth gate. It:
1. Validates the Supabase session on every request
2. Injects `x-user-id` header into protected API route requests
3. Redirects unauthenticated users to `/login`

All API routes read `request.headers.get('x-user-id')` — they do **not** re-validate the session themselves. The proxy is the trust boundary.

`/api/price` is **excluded from auth** (public data, see the matcher pattern in `proxy.ts`).

### Two Supabase Client Patterns

- **`lib/supabase/client.ts`** — browser client, used in `'use client'` components for auth actions (login, logout, OAuth)
- **`lib/supabase/server.ts`** — server client with cookie handling, used in Server Components and `(dashboard)/layout.tsx`
- **API routes** — use `createClient()` directly from `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS), typed as `any` to avoid generic inference issues with the custom Database type

### Page Architecture

Dashboard pages follow a Server/Client split:
- `page.tsx` (Server Component) — fetches user session, passes `userId` as prop, exports `dynamic = 'force-dynamic'`
- `DashboardClient.tsx` / `SignalsClient.tsx` (Client Component) — all interactive state lives here

The `(dashboard)/layout.tsx` handles the auth redirect for the entire dashboard group and renders the `<Header>`.

### Indicator Pipeline

`lib/indicators/index.ts` exports `calculateAll(candlesMap, priceData)` → returns `MarketAnalysis`. Individual calculators in `lib/indicators/` each take a `Candle[]` array. The confidence score (0–100) is computed by `calculateConfidence()` inside `index.ts` by counting how many indicators align with the M15 dominant bias.

Signal parsing uses regex in `lib/signal/parser.ts` to extract the structured block that the AI is instructed to append to every response.

### Caching Strategy

- **OHLC candles**: Supabase `market_cache` table, 60s TTL, keyed as `candles_M1` etc. Shared across all users.
- **Spot price**: In-memory module-level variable in `app/api/price/route.ts`, 5s TTL. Resets on server restart.

## Environment Variables

Required in `.env.local` — see `.env.local` for the full template. The three non-public keys that must never have `NEXT_PUBLIC_` prefix: `SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`, `API_NINJAS_KEY`.

## Database

Run the 4 SQL files in `supabase/migrations/` in order against your Supabase project. RLS is enabled on `profiles`, `signals`, `chat_messages`. The `market_cache` table has no RLS — accessible only via service role key from API routes.

## UI Conventions

- Color palette is defined in `app/globals.css` under `@theme inline` (Tailwind v4 — no `tailwind.config.ts`)
- Gold: `#F5C842`, Buy green: `#22d3a0`, Sell red: `#f05470`, Background: `#080c14`
- All UI text is in Bahasa Indonesia
- TradingView widget is loaded client-side only via `dynamic(..., { ssr: false })` to avoid SSR iframe issues
