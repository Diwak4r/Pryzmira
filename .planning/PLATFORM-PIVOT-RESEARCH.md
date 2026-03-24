# Pryzmira Platform Pivot - Research

**Researched:** 2026-03-24
**Scope:** first shippable slice for a total product repositioning
**Confidence:** HIGH for codebase and production-state findings, MEDIUM for product-shape recommendations

## Summary

Pryzmira should not try to become a full AI SaaS, a community, and a content marketplace in one jump. The current repo is much closer to a believable "AI operator" product than it is to a full platform rewrite. The most realistic first slice is to ship a single loop that is already partially present in code: AI onboarding -> personalized plan generation -> personal desk -> autonomous weekly brief -> premium intent capture.

As checked on **March 24, 2026**, the deployed site at `https://pryzmira.diwakaryadav.com.np/` still presents Pryzmira as an atlas/catalog product, and `GET /api/strategy/plan` on production returns `404`. The repo, however, already contains the strategy domain and storage primitives needed for the new direction:

- `next-web/src/lib/strategy.ts`
- `next-web/src/lib/strategyStore.ts`
- `next-web/src/app/api/strategy/plan/route.ts`
- `next-web/src/views/Home.tsx`
- `next-web/src/views/Desk.tsx`

That means the first implementation slice is not "invent the platform." It is "finish and ship the operator loop that this repo already started."

**Primary recommendation:** ship an `AI Operator Beta` that turns the homepage into onboarding, turns the desk into the main product surface, converts the cron/newsletter system into personalized weekly briefs, and records premium intent as structured leads.

## Current State

### What Already Exists In Repo

| Area | Current State | Notes |
|------|---------------|-------|
| Intake and plan generation | `POST /api/strategy/plan` exists | Already validates profile input, upserts profile, builds a plan, persists a brief |
| Lightweight persistence | `strategyStore.ts` exists | Supports Postgres in production and local JSON in development |
| Personalized workspace | `Desk.tsx` exists | Loads latest brief by `profileId` from query string or local storage |
| Catalog inventory | `content.ts`, `catalog.ts`, course/tool/resource data exist | Strong base for deterministic recommendations |
| Email infrastructure | Resend + cron route already exist | Currently generic newsletter, not personalized brief delivery |
| Premium signal | `premiumInterest` boolean already exists on profile input | Not enough for lead tracking or follow-up |

### What Is Missing

| Gap | Why It Matters |
|-----|----------------|
| Production does not expose the strategy route yet | The new product loop is not actually live |
| Weekly email is generic newsletter content | No retention loop tied to a personal plan |
| No durable premium-lead model | "Interested" is not enough to drive revenue follow-up |
| No resume-link identity for email re-entry | Weekly briefs cannot reliably reopen a user workspace on a different device/browser |
| Supporting routes still compete with the main loop | The product still feels like a directory instead of an operator |

## Most Realistic First Slice

### Product Shape

Ship Pryzmira as a focused "AI Operator Beta" with exactly four promises:

1. Tell Pryzmira your goal.
2. Get a plan built from the existing curated catalog.
3. Reopen the plan in your desk anytime.
4. Receive one personalized weekly brief if you opt in.

This is the right slice because it fits the current repo, creates an acquisition loop, creates a retention loop, and introduces a real monetization surface without forcing auth, billing, or a model-heavy architecture yet.

### Why This Slice Is Realistic

| Requirement | Already in repo | Net new work |
|-------------|-----------------|--------------|
| AI onboarding | Mostly yes | tighten fields and positioning |
| Personalized plan generation | Yes | improve response shape and resume-link support |
| Personal workspace | Mostly yes | make it clearly primary and less catalog-like |
| Weekly autonomous brief | Partial | convert generic cron/newsletter into personalized brief sender |
| Monetization hooks | Partial | add premium lead capture and offer surfaces |

## Architecture Recommendation

### Core Loop

```text
Homepage onboarding
-> POST /api/strategy/plan
-> upsert profile
-> generate deterministic weekly plan from existing catalog data
-> persist brief
-> return profile + brief + resume token
-> redirect to /desk
-> cron regenerates and emails next weekly brief
-> email links back into /desk with signed access
-> desk captures premium interest
```

### Identity Model

Do not add full auth in the first slice.

Use:

- local `profileId` storage for same-browser continuity
- signed resume links in email for cross-browser/device re-entry

This is the minimum identity system that still supports autonomous weekly briefs. Without signed resume links, the weekly brief is operationally weak because a user cannot reliably reopen their desk from email unless they are on the same browser where local storage already exists.

### Recommendation Engine

Keep plan generation deterministic in the first slice. The repo already has the raw material:

- `courses.json`
- `mockData.ts` tools and resources
- `strategy.ts` matching/scoring logic

Do not introduce LLM-backed generation yet. That would increase cost, error handling, latency, prompt complexity, and evaluation burden before the product loop is even proven.

### Operational Model

Use the existing Next.js route handlers and Vercel cron pattern.

- Generate and persist one brief per opted-in profile per weekly run.
- Send via Resend.
- Mark send state so reruns are idempotent for the current week.
- Link every brief back to the desk with a signed resume URL.

## Data Model Changes

The current `strategy_profiles` and `strategy_briefs` tables are close, but not enough.

### 1. Extend `strategy_profiles`

Add only fields that directly support onboarding quality, weekly automation, and monetization.

| Field | Type | Why |
|-------|------|-----|
| `primary_role` | `TEXT NULL` | Distinguish student, developer, founder, operator, marketer |
| `primary_constraint` | `TEXT NULL` | Gives better plan framing than goal alone |
| `timezone` | `TEXT NULL` | Useful if brief timing later becomes user-sensitive |
| `brief_frequency` | `TEXT NOT NULL DEFAULT 'weekly'` | Makes delivery policy explicit |
| `last_brief_sent_at` | `TIMESTAMPTZ NULL` | Prevents duplicate weekly sends |
| `premium_stage` | `TEXT NOT NULL DEFAULT 'none'` | `none`, `interested`, `lead`, `contacted`, `converted` |
| `source` | `TEXT NULL` | Acquisition channel |
| `utm_source` | `TEXT NULL` | Attribution |
| `utm_medium` | `TEXT NULL` | Attribution |
| `utm_campaign` | `TEXT NULL` | Attribution |

Keep `premiumInterest` for compatibility, but treat `premium_stage` as the durable monetization field.

### 2. Extend `strategy_briefs`

Each brief should also be an operational record, not just a content snapshot.

| Field | Type | Why |
|-------|------|-----|
| `week_key` | `TEXT NOT NULL` | Enforces one canonical weekly brief per profile per cycle |
| `delivery_channel` | `TEXT NOT NULL DEFAULT 'web'` | Distinguish desk-generated vs email-generated briefs |
| `send_status` | `TEXT NOT NULL DEFAULT 'draft'` | `draft`, `sent`, `failed` |
| `sent_at` | `TIMESTAMPTZ NULL` | Delivery observability |
| `email_provider_id` | `TEXT NULL` | Resend message ID for debugging |

Recommended constraint:

- unique index on `(profile_id, week_key, delivery_channel)`

### 3. Add `premium_leads`

The existing boolean flag is not a revenue system. Create a minimal lead table.

| Field | Type | Why |
|-------|------|-----|
| `id` | `TEXT PRIMARY KEY` | Stable lead record |
| `profile_id` | `TEXT NOT NULL` | Join back to strategy profile |
| `email` | `TEXT NOT NULL` | Follow-up target |
| `surface` | `TEXT NOT NULL` | `home`, `desk`, `email`, `roadmap` |
| `offer` | `TEXT NOT NULL` | `pro_waitlist`, `coaching`, `sprint_review`, `team_plan` |
| `status` | `TEXT NOT NULL DEFAULT 'new'` | `new`, `contacted`, `qualified`, `won`, `lost` |
| `notes` | `TEXT NULL` | Optional founder/internal note |
| `created_at` | `TIMESTAMPTZ NOT NULL` | Audit |
| `updated_at` | `TIMESTAMPTZ NOT NULL` | Audit |

This is enough to start revenue follow-up without committing to Stripe, subscriptions, or a full billing stack yet.

## API Surface

### Keep And Upgrade

#### `POST /api/strategy/plan`

Keep this as the main onboarding and refresh endpoint. Extend it to:

- accept optional attribution metadata (`source`, `utm_*`)
- accept optional enrichment fields (`primaryRole`, `primaryConstraint`)
- return:
  - `profile`
  - `brief`
  - `resumeUrl`
  - `premiumState`

#### `GET /api/strategy/plan`

Keep this as the desk loader, but add support for a signed token:

- `?profileId=...` for same-browser use
- `?token=...` for email re-entry

### Add

#### `POST /api/strategy/premium-interest`

Purpose:

- capture an explicit monetization event from the desk, homepage, or email
- upsert/update `premium_stage`
- create a `premium_leads` record
- optionally email the founder/admin via Resend

Request shape:

```json
{
  "profileId": "profile_x",
  "surface": "desk",
  "offer": "pro_waitlist",
  "notes": "Interested in launch-focused weekly reviews"
}
```

#### `POST /api/cron/send-weekly-briefs`

Do not keep the generic newsletter path as the main retention mechanism. Replace or repurpose the current cron route so it:

1. authenticates with `CRON_SECRET`
2. loads opted-in profiles
3. skips profiles already sent for the current week
4. builds a fresh plan and brief
5. persists the brief with `week_key`
6. sends personalized email
7. marks delivery status

The current `/api/cron/send-newsletter` route can either:

- be repurposed in place to preserve Vercel config, or
- call into a shared service used by a renamed route

### De-emphasize

#### `/api/subscribe`

Keep it only as a low-friction marketing subscription path. It should no longer be the primary growth loop. The main acquisition path is onboarding through `POST /api/strategy/plan`.

## UI Surfaces

### 1. Homepage

The homepage should do one job: convert a vague AI ambition into a first brief.

Required surface blocks:

- sharp positioning headline
- concise "what you get in 60 seconds"
- onboarding form
- preview of the resulting weekly brief
- single premium teaser, not a pricing wall

The current `next-web/src/views/Home.tsx` is the right base.

### 2. Desk

The desk must become the product, not a saved-items sidecar.

Required sections:

- this week: one main brief
- next actions
- recommended courses, tools, resources
- progress context: goal, hours, monetization path
- premium CTA block tied to actual value

The current `next-web/src/views/Desk.tsx` is close, but the personalized brief must dominate the page more clearly than saved items and recent views.

### 3. Weekly Brief Email

This is the autonomous loop. The email should contain:

- brief headline
- 2-3 concrete actions
- 1 course recommendation
- 1 tool recommendation
- one CTA back to the desk via signed resume link
- one premium CTA

Do not send the current generic "This Week in AI & Tech" template to strategy users.

### 4. Supporting Routes

Keep:

- `/categories`
- `/ai-tools`
- `/resources`
- `/roadmap`

But reposition them as supporting inventory and proof surfaces. They should link back to the desk and plan flow instead of behaving like the main product.

## File-Level Implementation Map

| File | Action |
|------|--------|
| `next-web/src/lib/strategy.ts` | extend intake fields and keep deterministic plan generation |
| `next-web/src/lib/strategyStore.ts` | add schema fields, delivery state, premium lead persistence |
| `next-web/src/app/api/strategy/plan/route.ts` | support resume tokens, attribution, richer response shape |
| `next-web/src/app/api/cron/send-newsletter/route.ts` | convert from generic newsletter to personalized weekly brief sender |
| `next-web/src/app/api/subscribe/route.ts` | narrow to generic newsletter fallback only |
| `next-web/src/views/Home.tsx` | optimize for onboarding conversion and output preview |
| `next-web/src/views/Desk.tsx` | elevate the weekly brief and premium CTA above saved-item utilities |
| `next-web/src/lib/strategySession.ts` | keep local continuity; pair with signed resume-link flow |
| `next-web/src/lib/siteNavigation.ts` | keep desk and onboarding as primary navigation hierarchy |

## Delivery Order

1. **Ship the repo strategy stack to production**
   The live site is still behind the repo as of March 24, 2026.
2. **Upgrade persistence for the weekly loop**
   Add `week_key`, delivery fields, `last_brief_sent_at`, and `premium_leads`.
3. **Implement signed resume links**
   This makes email-driven re-entry usable.
4. **Convert cron/newsletter into personalized weekly brief delivery**
   This creates the first autonomous retention system.
5. **Add premium lead capture**
   This creates the first revenue system without full billing.
6. **Reposition supporting routes**
   Keep them useful, but clearly subordinate to onboarding and the desk.

## Common Pitfalls

### Pitfall 1: Solving identity with full auth too early

That would expand scope into auth UX, protected routes, password resets, session handling, and account management. The first slice does not need it.

### Pitfall 2: Introducing LLM plan generation before the deterministic loop is proven

That would increase cost and reduce reliability before Pryzmira has validated that users even want the weekly operator loop.

### Pitfall 3: Treating `premiumInterest` as monetization

A boolean is not a lead system. Without structured lead capture, no one can act on revenue intent.

### Pitfall 4: Sending weekly emails without idempotency

Cron reruns or retries will create duplicate user emails unless `week_key` and `last_brief_sent_at` are enforced.

### Pitfall 5: Letting atlas/tools/resources keep visual priority over the desk

If discovery surfaces still dominate, users will continue to experience Pryzmira as a directory instead of a system that helps them move.

## Recommendation In One Sentence

The first credible platform pivot is not a total rebuild; it is shipping Pryzmira as an onboarding-to-desk operator loop, powered by the strategy code already in the repo, with weekly personalized briefs and a real premium lead model.

## Sources

### Primary

- Current deployed site: https://pryzmira.diwakaryadav.com.np/
- Repo files:
  - `next-web/src/lib/strategy.ts`
  - `next-web/src/lib/strategyStore.ts`
  - `next-web/src/app/api/strategy/plan/route.ts`
  - `next-web/src/app/api/cron/send-newsletter/route.ts`
  - `next-web/src/views/Home.tsx`
  - `next-web/src/views/Desk.tsx`

### Secondary

- Vercel Cron Jobs docs: https://vercel.com/docs/cron-jobs
- Resend send email docs: https://resend.com/docs/api-reference/emails/send-email
- Resend batch send docs: https://resend.com/docs/api-reference/emails/send-batch-emails
