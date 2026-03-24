# Architecture Decision Record

## Context
Pryzmira started as a catalog-first site for courses, AI tools, resources, and a roadmap. The current product goal is different: it must help users turn a vague AI or tech ambition into a concrete weekly plan, keep them returning through autonomous guidance, and open a credible path to monetization.

The current repository already contains valuable raw material:
- curated course, tool, and resource datasets
- newsletter delivery and persistence
- a personal desk pattern
- strategy models and storage primitives

The missing piece is the product loop that connects those assets into a user-facing operating system.

## Assumed Requirements
1. What problem does this solve for the end user?
   Pryzmira should solve: "I know I want growth in AI or tech, but I do not know what to learn next, what tools to use, or how to turn that into weekly progress."
2. Who are the users? (scale: 10, 1000, 1M?)
   Initial target is early-stage scale: tens to low thousands of users, with an architecture that can tolerate much larger read traffic because most catalog surfaces remain static and only strategy storage is personalized.
3. What are the hard constraints? (budget, timeline, existing tech)
   Keep the existing Next.js stack, reuse current datasets, avoid major new dependencies, and ship inside the current repo with storage that works in local development and on Vercel.
4. What's the #1 thing that MUST work perfectly?
   A user must be able to submit an intake, receive a credible personalized strategy, and reopen that strategy later from the desk.

## Decision Drivers
- The product needs a stronger acquisition and retention loop than browsing.
- The platform must provide immediate value before asking for money.
- The implementation has to be realistic inside the current codebase and deployment model.
- Personalized strategy data must be persisted without introducing a full auth system first.
- Supporting routes should still benefit from SEO and direct browsing, but they can no longer be the primary product.

## Considered Options

### Option A: Keep Pryzmira catalog-first and improve the UI
**Pros:**
- Lowest implementation effort
- Minimal risk to existing routes
- Keeps SEO pages intact

**Cons:**
- Does not solve the product positioning problem
- Weak retention loop
- Weak monetization story
- Still feels like a content directory instead of a user system

**Effort:** Low  
**Risk:** Medium

### Option B: Turn Pryzmira into an AI learning operator on top of the existing catalog
**Pros:**
- Reuses current data and route inventory
- Creates a real acquisition hook: strategy generation
- Creates a retention loop: saved brief + weekly refresh
- Supports freemium monetization without hard paywalling discovery
- Can be shipped incrementally

**Cons:**
- Requires new data model for profiles and briefs
- Requires stronger IA and copy changes across the product
- Plan quality depends on good recommendation heuristics

**Effort:** Medium  
**Risk:** Medium

### Option C: Replace the product with a full community/SaaS platform
**Pros:**
- Highest theoretical upside
- Strongest long-term monetization range

**Cons:**
- Too large for the current repo and current turn
- Requires auth, billing, moderation, and operational systems not present now
- High risk of shipping a shallow shell without real value

**Effort:** High  
**Risk:** High

## Decision
Choose Option B.

Pryzmira will become an AI learning operator with this core loop:

1. Acquisition through a promise-driven homepage
2. Goal-based intake
3. Personalized strategy brief generated from curated catalog data
4. Desk as the user's working surface and history
5. Autonomous weekly briefs for opted-in users
6. Supporting catalog, tools, resources, and roadmap routes as inventory and proof surfaces

This approach creates actual user value quickly, fits the current stack, and establishes a credible freemium-to-premium path.

## Consequences
- What becomes easier:
  - Explaining the product clearly
  - Capturing emails with immediate value
  - Turning static content into personalized output
  - Introducing premium tiers without paywalling the core catalog
- What becomes harder:
  - Strategy quality now matters much more than surface polish
  - Profile and brief persistence must be reliable
  - The desk must work as a product surface, not just a saved-items tray
- Technical debt introduced:
  - Strategy generation is heuristic-based before deeper model-backed personalization
  - Identity is lightweight and profile-based rather than full auth

## Component Diagram
```text
Home / Marketing
    |
    v
Strategy Intake Form
    |
    v
POST /api/strategy/plan
    |
    +--> sanitize profile input
    +--> upsert strategy profile
    +--> build strategy plan from curated datasets
    +--> persist latest brief
    |
    v
Desk / Workspace
    |
    +--> GET /api/strategy/plan?profileId=...
    +--> show brief, sessions, recommendations, saved desk state
    |
    v
Supporting Surfaces
Atlas / Tools / Resources / Roadmap / Canvas
    |
    v
Discovery + Proof + SEO

Cron / Weekly Briefs
    |
    +--> list opted-in strategy profiles
    +--> regenerate weekly brief
    +--> send via email
```

## Data Flow
```text
User submits intake
-> /api/strategy/plan
-> sanitizeStrategyProfileInput
-> upsertStrategyProfile
-> buildStrategyPlan
-> saveStrategyBrief
-> response with profile + latest brief
-> profile id stored locally
-> /desk loads latest strategy and saved content
```

## File Structure
```text
next-web/src/
  app/
    page.tsx                        # acquisition + intake entry
    desk/page.tsx                   # workspace / strategy surface
    api/strategy/plan/route.ts      # create and fetch strategy briefs
    api/cron/send-newsletter/route.ts
                                   # generic + personalized weekly email loop
  components/
    Navbar.tsx                      # shell navigation
    ClientLayout.tsx                # site shell
    Newsletter.tsx                  # secondary conversion surface
  lib/
    strategy.ts                     # strategy inputs, scoring, plan generation
    strategyStore.ts                # persistence for profiles and briefs
    strategySession.ts              # lightweight client-side profile session
    db.ts                           # newsletter subscriber persistence
  views/
    Home.tsx                        # promise, intake, free/pro positioning
    Desk.tsx                        # personalized workspace
    Categories.tsx                  # supporting course inventory
    AITools.tsx                     # supporting tools inventory
    Resources.tsx                   # supporting archive
    Roadmap.tsx                     # supporting sequence surface
```

## Validation Checklist
- Handles current scale: yes; mostly static reads with lightweight write traffic.
- Single point of failure: profile storage is the main one, mitigated by local dev fallback and Postgres in production.
- Testable at every layer: yes; strategy generation, persistence, API response shape, and UI hydration can each be validated.
- Understandable in 30 minutes: yes; one core loop, one storage module, one primary API.
- 10x traffic risk:
  - catalog routes remain fine
  - strategy writes need real production storage
  - weekly brief sending needs batching and deduping

## Implementation Plan
Task 1: Wire strategy API and profile persistence — No dependencies  
Task 2: Rebuild homepage around strategy intake and monetization framing — Depends on 1  
Task 3: Upgrade desk into the strategy workspace — Depends on 1  
Task 4: Connect weekly brief automation to stored strategy profiles — Depends on 1  
Task 5: Reposition shell and supporting routes around the new product model — Depends on 2 and 3  
Task 6: Verify browser flows, lint/build, then deploy — Depends on 1-5
