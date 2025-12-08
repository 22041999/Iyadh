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
- `index.ts`: HTTP interface for `preview` or `execute` modes. Loads latest active rule set, normalizes JSON → `RuleSet`, evaluates, optionally persists ledger rows + event log.
- `engine.test.ts`: Deno tests validating purchase + referral scenarios (TDD entry point). Run via `deno test supabase/functions/rule-engine/engine.test.ts`.

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
- **Pages** highlight hero content, referral messaging, admin dashboards, rules studio, and analytics placeholders wired to translations.
- **Translations**: `src/i18n/config.ts` + `dictionaries.ts` provide typed dictionaries for Arabic (RTL), French, English.

## Development

```bash
# Frontend
cd apps/web
npm install
npm run lint            # ESLint + TypeScript
npm run dev             # Start Next.js (requires NODE_ENV vars for Supabase when integrating APIs)

# Rule Engine Tests
deno test supabase/functions/rule-engine/engine.test.ts
```

> ⚠️ `next@15.0.3` currently carries a published CVE warning upstream. Upgrade to the patched release when it becomes available while keeping the App Router API stable.

## Next Steps

1. **Connect Supabase client** inside Next.js server actions (checkout, loyalty preview).
2. **Edge Function hardening**: caching active rules, adding schema validation (e.g., Zod) and dry-run endpoints for the admin UI.
3. **Analytics**: Build Tremor/Recharts components that read from `metrics_daily` and `event_log` views.
4. **CI/CD**: add GitHub workflow running `npm run lint`, Deno tests, and Supabase migrations.
