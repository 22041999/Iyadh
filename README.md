# BioCommerce Platform Blueprint

Multilingual commerce experience for Tunisian bio-products powered by a dynamic loyalty and referral engine. This repository contains:

- **Supabase** schema and edge function rule engine (runtime configurable rewards).
- **Next.js 15** App Router frontend with locale-aware routing (Arabic/French/English) and admin surfaces.

## Stack Overview

| Layer | Details |
| --- | --- |
| Frontend | Next.js 15 (App Router, Server Components), TypeScript, Tailwind CSS 4, Middleware locale redirects |
| Backend | Supabase Postgres, Auth, Storage, Edge Functions (Deno) |
| Loyalty Engine | Config-driven evaluator reading `business_rules` table + expr-eval expressions |
| Methodology | Mobile-first, TDD (Deno tests for engine, ESLint for UI) |

## Directory Map

```
/supabase
  └── migrations/0001_initial_schema.sql   # Tables, enums, RLS, triggers, helper funcs
  └── functions/rule-engine                # Edge Function + tests
/apps/web                                  # Next.js app (localized App Router)
```

## Database Design Highlights

- **Users & RBAC**: `profiles` extends `auth.users`, `user_role` enum (`customer`→`admin`). Trigger `promote_to_affiliate` upgrades role after first paid order.
- **Catalog**: `products` keeps translation JSON fields and media metadata.
- **Commerce**: `orders`, `order_items`, `payments` handle mixed tender + Supabase Row Level Security.
- **Referrals & Loyalty**: `referral_codes`, `referrals`, `points_ledger` (double-entry). Helper `current_points_balance(uuid)` powers inserts.
- **Dynamic Business Logic**: `business_rules` holds active JSON config, `rule_versions` snapshots, `event_log` + `metrics_daily` for analytics.
- **Security**: Comprehensive RLS policies aligning customer/affiliate/moderator/admin scopes.

## Rule Engine (Supabase Edge Function)

Location: `supabase/functions/rule-engine`

- `engine.ts`: Pure evaluator with expr-eval parser, condition filtering, target resolution (customer/referrer/referee/manual) and discount/PT calculations.
- `schema.ts`: Zod-powered parser that validates admin-authored JSON, merges camel/snake fields, and rejects rules that lack expressions/conditions.
- `index.ts`: HTTP interface for `preview` or `execute` modes. Loads the cached active rule set (refresh TTL via `RULE_ENGINE_CACHE_TTL_MS`), evaluates, optionally persists ledger rows + event log.
- `engine.test.ts` & `schema.test.ts`: Deno tests validating purchase/referral scenarios plus schema parsing guarantees.

### Request Contract

```json
{
  "mode": "preview" | "execute",
  "event": {
    "type": "purchase.completed" | "referral.completed",
    "payload": { "user_id": "...", "subtotal_tnd": 120 }
  }
}
```

Responses contain ledger instructions + discount adjustments. When `mode = execute`, the function writes to `points_ledger` with rule snapshots for auditing.

## Next.js Application Structure

- **Locale-aware routing** via `app/[locale]/...`, middleware redirects bare paths to preferred locale cookie (default `fr`). `next.config.ts` declares locales + disables auto-detection.
- **Layouts**:
  - `app/layout.tsx`: root font/theme wrapper.
  - `app/[locale]/layout.tsx`: sets `dir` + background per locale.
  - `app/[locale]/(site)` + `app/[locale]/admin` layouts supply navigation bars for customer and admin experiences.
- **Pages** highlight hero content, referral messaging, the live reward preview simulator (calls the Supabase Edge Function via server actions), and admin dashboards with sparkline analytics + referral leaderboards fed by typed sample data (`src/data/analytics.ts`).
- **Translations**: `src/i18n/config.ts` + `dictionaries.ts` provide typed dictionaries for Arabic (RTL), French, English.

## Development

```bash
# Frontend
cd apps/web
npm install
npm run lint            # ESLint + TypeScript checks
npm run test            # Vitest + Testing Library (component coverage)
npm run dev             # Start Next.js (requires Supabase env vars for server actions)

# Rule engine (Deno)
cd /workspace
deno test supabase/functions/rule-engine
```

### Required Environment Variables (local dev)

- `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server actions & Edge Function invocation)
- `RULE_ENGINE_CACHE_TTL_MS` (optional, defaults to 60s on Edge Function)

> ⚠️ `next@15.0.3` currently carries a published CVE warning upstream. Upgrade to the patched release when it becomes available while keeping the App Router API stable.

## Next Steps

1. **Hook production Supabase data** into the analytics dashboard (replace sample data with `metrics_daily` views).
2. **Expand TDD**: add integration tests for server actions + Supabase mocks, and extend Vitest coverage to reward preview flows.
3. **Operationalize CI/CD**: run `npm run lint`, `npm run test`, and `deno test supabase/functions/rule-engine` in GitHub Actions before deploying migrations/Edge Functions.
