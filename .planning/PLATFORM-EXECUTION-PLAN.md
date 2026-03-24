# Pryzmira Platform Execution Plan

**Prepared:** 2026-03-24  
**Scope:** autonomous single-agent rollout inside the current repo  
**Primary goal:** turn Pryzmira from a catalog-first site into an AI-driven learning operator with a real acquisition loop, a weekly retention loop, and a credible monetization path

## Executive Recommendation

Do not treat this as a total rebuild. The repo already contains the right core primitives:

- `next-web/src/lib/strategy.ts`
- `next-web/src/lib/strategyStore.ts`
- `next-web/src/app/api/strategy/plan/route.ts`
- `next-web/src/views/Home.tsx`
- `next-web/src/views/Desk.tsx`

The correct rollout is:

1. harden and ship the operator loop already present in the repo
2. make re-entry and weekly automation reliable
3. add a real premium-lead system
4. demote catalog routes into supporting proof and inventory surfaces

## Product End State

Pryzmira should behave like this:

1. A user lands on the homepage and understands the promise in one screen.
2. The user completes a goal-based intake.
3. Pryzmira generates a credible weekly brief using curated courses, tools, and resources.
4. The user lands in a persistent desk that becomes the main working surface.
5. Pryzmira sends one personalized weekly brief to opted-in users.
6. Premium intent is captured as a lead system, not a boolean.

## What Is Already Done In Repo

### Present

- goal-based strategy types and matching logic
- profile + brief persistence with local fallback and Postgres support
- `POST` and `GET` strategy API route
- home page positioned around onboarding
- desk page positioned around the personalized workspace

### Still Missing Or Incomplete

- production parity with the repo strategy loop
- signed resume links for cross-device re-entry
- idempotent weekly brief delivery
- durable premium lead capture
- supporting routes still visually and structurally compete with the main loop
- monetization surfaces are implied, not operational

## Phase Plan

### Phase 1: Core Operator Loop Hardening

**Outcome:** the repo strategy flow is production-safe and becomes the primary product path.

**Why first:** nothing else matters until homepage -> strategy -> desk works flawlessly on live.

**Files likely touched**

- `next-web/src/views/Home.tsx`
- `next-web/src/views/Desk.tsx`
- `next-web/src/app/api/strategy/plan/route.ts`
- `next-web/src/lib/strategy.ts`
- `next-web/src/lib/strategyStore.ts`
- `next-web/src/lib/strategySession.ts`
- `next-web/src/components/Navbar.tsx`
- `next-web/src/components/ClientLayout.tsx`

**Work**

- make the homepage a single conversion surface for strategy creation
- make the desk the clear primary workspace after onboarding
- tighten strategy API input validation, error states, and response shape
- confirm storage behavior in both local fallback and production database mode
- remove catalog-first framing from the shell where it conflicts with the operator loop

**Done when**

- a new user can create a strategy
- the desk loads the brief without manual recovery
- refresh and return on the same browser continue to work
- production exposes the strategy route and desk flow

**Priority:** do this in the next implementation turn

---

### Phase 2: Lightweight Identity And Re-entry

**Outcome:** users can reopen their workspace from email or another browser without full auth.

**Why now:** weekly automation is weak until re-entry works across devices.

**Files likely touched**

- `next-web/src/lib/strategyStore.ts`
- `next-web/src/lib/strategySession.ts`
- `next-web/src/app/api/strategy/plan/route.ts`
- `next-web/src/views/Desk.tsx`
- `next-web/src/lib/db.ts` or a shared token utility if introduced

**Work**

- add signed resume tokens for workspace retrieval
- support `token`-based desk loading in addition to `profileId`
- store and validate token metadata safely
- preserve current lightweight same-browser local profile flow

**Done when**

- a resume URL can reopen the workspace without requiring existing local storage
- invalid or expired tokens fail safely
- same-browser flow still works

**Depends on:** Phase 1

---

### Phase 3: Autonomous Weekly Brief Engine

**Outcome:** Pryzmira generates and sends one personalized weekly brief per opted-in user.

**Why now:** this creates the first real retention loop and gives the platform an autonomous behavior users can feel.

**Files likely touched**

- `next-web/src/app/api/cron/send-newsletter/route.ts`
- `next-web/src/lib/strategy.ts`
- `next-web/src/lib/strategyStore.ts`
- `next-web/src/app/api/subscribe/route.ts`
- email template logic inside the cron path or a shared mail module

**Work**

- convert generic newsletter sending into personalized brief delivery
- extend brief persistence with `week_key`, `send_status`, and send timestamps
- skip already-sent users for the current weekly window
- embed signed resume links in the email
- keep the generic newsletter path only as a fallback marketing path

**Done when**

- the cron route can generate, persist, and send weekly briefs without duplicate sends
- opted-in users receive a brief tied to their strategy
- email links reopen the desk correctly

**Depends on:** Phase 1 and Phase 2

---

### Phase 4: Monetization System, Not Just Intent Flags

**Outcome:** premium interest becomes a lead pipeline that can actually drive revenue follow-up.

**Why now:** monetization should attach to delivered value, not appear before the product loop works.

**Files likely touched**

- `next-web/src/lib/strategy.ts`
- `next-web/src/lib/strategyStore.ts`
- `next-web/src/views/Home.tsx`
- `next-web/src/views/Desk.tsx`
- `next-web/src/app/api/strategy/premium-interest/route.ts` (new)

**Work**

- add durable premium lead storage instead of relying on `premiumInterest` alone
- capture lead source and offer surface
- add one clear premium CTA on home and one in desk
- structure premium states such as `interested`, `lead`, `contacted`, `converted`

**Done when**

- premium interest creates a durable lead record
- home and desk both feed the lead path
- follow-up data is queryable from storage

**Depends on:** Phase 1  
**Can overlap with:** late Phase 3 if email already exists

---

### Phase 5: Supporting Routes Become Inventory And Proof

**Outcome:** categories, tools, resources, roadmap, and canvas reinforce the operator loop instead of competing with it.

**Why now:** the current information architecture still makes Pryzmira feel like a directory.

**Files likely touched**

- `next-web/src/lib/siteNavigation.ts`
- `next-web/src/views/Categories.tsx`
- `next-web/src/views/AITools.tsx`
- `next-web/src/views/Resources.tsx`
- `next-web/src/views/Roadmap.tsx`
- `next-web/src/views/CourseDetail.tsx`
- shared shell and card components

**Work**

- shorten copy and reduce route-level over-explanation
- drive users back to the desk and strategy loop from supporting routes
- keep SEO and browse value intact, but make these clearly secondary surfaces
- clean up typography, spacing, and navigation density across the whole platform

**Done when**

- the desk and onboarding are the obvious primary product surfaces
- supporting pages feel easier to scan and use
- navigation no longer confuses the product role of each route

**Depends on:** Phase 1

---

### Phase 6: Growth Instrumentation And Iteration

**Outcome:** the product starts producing signal about what converts and what retains.

**Why last:** instrument after the core loop is stable enough to measure.

**Files likely touched**

- `next-web/src/views/Home.tsx`
- `next-web/src/views/Desk.tsx`
- any PostHog or analytics utilities already present
- strategy and premium APIs for event hooks

**Work**

- instrument onboarding start, onboarding completion, desk return, brief open, premium intent
- attach source and UTM attribution to strategy profiles
- make the homepage and premium messaging measurable

**Done when**

- key funnel events are recorded
- strategy profiles preserve acquisition metadata
- premium surfaces can be evaluated with real usage data

**Depends on:** Phases 1, 3, and 4

## Dependency Graph

```text
Phase 1 -> Phase 2 -> Phase 3
Phase 1 -> Phase 4
Phase 1 -> Phase 5
Phase 3 + Phase 4 -> Phase 6
```

## Current Turn Vs Deferred

### Do In The Current Turn

The next implementation turn should execute **Phase 1** only.

That means:

1. finish the strategy onboarding -> desk flow as the primary product
2. confirm repo/live parity for strategy routes
3. harden the shared shell around the new product model
4. verify locally, then deploy and smoke-test production

**Reason:** this is the smallest slice that creates real user value and turns Pryzmira into a coherent product.

### Defer Until After Phase 1 Ships

- signed resume-link identity
- personalized weekly email automation
- premium lead pipeline
- supporting route repositioning
- analytics and UTM instrumentation
- any Stripe, subscriptions, or full auth work
- any LLM-backed strategy generation

## Risks And Mitigations

### Risk 1: Product loop is present in repo but not actually live

**Mitigation:** treat production parity as part of Phase 1, not a cleanup item.

### Risk 2: Strategy persistence breaks in production

**Mitigation:** keep local JSON fallback for development, enforce Postgres configuration in production paths, and test create/load flows before deploy.

### Risk 3: Weekly email becomes noisy or duplicates

**Mitigation:** add `week_key`, send status, and idempotent delivery checks before turning on personalized cron.

### Risk 4: Premium CTA appears before trust is established

**Mitigation:** monetize only after the free strategy + desk loop is clearly working.

### Risk 5: Supporting routes continue to dominate the product

**Mitigation:** reposition them only after Phase 1 ships, with explicit links back into the desk and onboarding flow.

## Success Metrics

### Product Success

- users can generate and reopen a strategy without friction
- the desk becomes the main return surface
- weekly automation is possible without full auth
- premium interest becomes traceable and actionable

### Technical Success

- lint passes
- build passes
- strategy creation and retrieval work on production
- cron logic becomes idempotent before personalized email sending

## Recommended Immediate Next Step

Execute **Phase 1** first. Do not split attention across automation, monetization, and supporting-route cleanup until the operator loop is live and stable.
