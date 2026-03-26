# Pryzmira

Pryzmira is an AI operating desk for builders and students who want one clear weekly focus instead of tab chaos.
It turns a goal into a workspace brief, gives users a return path back into that workspace, and keeps the supporting tools, signals, and resources within reach.

**Live:** [https://pryzmira.diwakaryadav.com.np](https://pryzmira.diwakaryadav.com.np)

## Table of Contents

- [What Pryzmira is now](#what-pryzmira-is-now)
- [Key features](#key-features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [How the product works](#how-the-product-works)
- [Routes and API surface](#routes-and-api-surface)
- [Development workflow](#development-workflow)
- [Deployment notes](#deployment-notes)
- [Troubleshooting](#troubleshooting)

## What Pryzmira is now

Pryzmira is no longer just a catalog-style learning site.

The current product direction is an **AI workspace beta** built around a simple loop:

1. A user lands on `/`
2. They describe a goal and generate a strategy workspace
3. Pryzmira sends them into `/desk`
4. The workspace can be reopened later through a saved session or resume link
5. Supporting surfaces like tools, categories, roadmap, pulse, and stack score stay attached to that core workspace loop

The current codebase still includes curated content surfaces from the older version of Pryzmira, but the active product direction is the workspace-first experience.

## Key features

- **AI workspace intake** on the homepage that creates a tailored strategy brief
- **Desk route** (`/desk`) that loads the current workspace via profile or resume token
- **Resume link flow** so a workspace can be reopened later
- **Auth entry points** via NextAuth with Google and GitHub providers when configured
- **Pulse feed** for AI news/signal updates
- **Stack score** and leaderboard surfaces for builder momentum/status
- **Pro waitlist** with referral flow and position tracking
- **Newsletter admin surface** for managing newsletter-related flows
- **Supporting discovery pages** for AI tools, categories, resources, roadmap, and canvas
- **Dark-first branded shell** with persistent client layout, theme support, and shared navigation

## Tech stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI:** React 19
- **Styling:** Tailwind CSS + custom design tokens + Radix UI primitives
- **Animation:** Framer Motion
- **Auth:** NextAuth v5 beta
- **Database access:** PostgreSQL via `pg`
- **Email:** Resend
- **Analytics:** PostHog, Vercel Analytics, Vercel Speed Insights
- **Deployment target:** Vercel-style Next.js deployment

## Project structure

```text
Pryzmira/
├── next-web/
│   ├── public/                 # Static assets, icons, manifest
│   ├── src/
│   │   ├── app/                # Next.js App Router pages and API routes
│   │   │   ├── admin/
│   │   │   ├── ai-tools/
│   │   │   ├── api/
│   │   │   │   ├── auth/
│   │   │   │   ├── platform/
│   │   │   │   ├── pulse/
│   │   │   │   ├── stack-score/
│   │   │   │   ├── strategy/
│   │   │   │   ├── subscribe/
│   │   │   │   ├── tools/
│   │   │   │   ├── vault/
│   │   │   │   └── waitlist/
│   │   │   ├── desk/
│   │   │   └── ...
│   │   ├── components/         # Shared UI and route-specific client components
│   │   ├── context/            # Theme context
│   │   ├── data/               # Local JSON data used by legacy/supporting surfaces
│   │   ├── lib/                # Product logic, stores, scoring, fetchers, session helpers
│   │   └── views/              # Page-level view components
│   ├── package.json
│   └── package-lock.json
├── server/                     # Legacy server-related directory
├── .planning/                  # Product planning notes and execution docs
├── SCALING_PLAN.md             # Product direction and roadmap notes
└── WAITLIST_IMPLEMENTATION.md  # Waitlist implementation notes
```

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/Diwak4r/Pryzmira.git
cd Pryzmira
```

### 2. Install dependencies

```bash
cd next-web
npm install
```

### 3. Create `.env.local`

Create `next-web/.env.local` and configure the values you actually need.

A minimal local setup can work with only some of these set, because parts of the app fall back to local or preview behavior.

```env
# Core site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Database / storage
POSTGRES_URL=postgresql://user:password@host:5432/dbname
POSTGRES_URL_NON_POOLING=postgresql://user:password@host:5432/dbname
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Email / newsletter
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=onboarding@resend.dev
CRON_SECRET=your_random_secret

# Auth providers (optional, but required for real OAuth sign-in)
AUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_ID=...
GITHUB_SECRET=...

# Existing supporting features
VAULT_PASSWORD=your_vault_code
TAVILY_API_KEY=your_tavily_key
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Validate before pushing

```bash
npm run lint
npx tsc --noEmit
npm run build
npm audit --audit-level=high
```

## Environment variables

### Required or strongly recommended

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Base URL used for generated links such as waitlist referrals and workspace resume URLs |
| `AUTH_SECRET` | Secret for NextAuth session signing |
| `POSTGRES_URL` | Main PostgreSQL connection string used by storage-backed features |
| `POSTGRES_URL_NON_POOLING` | Non-pooled Postgres URL used by some storage flows |

### Optional depending on enabled features

| Variable | Purpose |
|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Enables Google OAuth in NextAuth |
| `GITHUB_ID` / `GITHUB_SECRET` | Enables GitHub OAuth in NextAuth |
| `RESEND_API_KEY` | Enables transactional or newsletter email sending |
| `RESEND_FROM_EMAIL` | Sender address for Resend |
| `CRON_SECRET` | Secret for protected cron-style routes |
| `TAVILY_API_KEY` | Enables live AI/tool or signal fetching flows |
| `VAULT_PASSWORD` | Password used by the vault verification route |
| `BLOB_READ_WRITE_TOKEN` | Enables blob-backed newsletter persistence where applicable |
| `DATABASE_URL` | Optional alternate DB env used by some store helpers |

## How the product works

### Core workspace loop

The current main product loop is built around two pages:

- `/` → intake and positioning
- `/desk` → active workspace

The homepage collects:

- full name
- email
- goal
- experience level
- weekly time budget
- monetization direction
- brief preference
- premium interest

That request is posted to `POST /api/strategy/plan`.

The backend then:

1. sanitizes and validates the profile input
2. creates or updates a strategy profile
3. generates a strategy plan and brief
4. stores the brief
5. optionally captures premium interest
6. returns a `resumeUrl`

The client stores the resume token and pushes the user into `/desk`.

### Session and resume behavior

Pryzmira uses a small client-side strategy session helper to keep track of:

- `profileId`
- `resumeToken`

That state is used by shared navigation and desk re-entry links so users can reopen the correct workspace instead of starting from zero every time.

### Supporting surfaces

The supporting surfaces still matter, but they now support the workspace instead of acting like the main product:

- `/ai-tools` → AI tool discovery layer
- `/categories` and `/course/[id]` → learning/discovery content
- `/resources` → curated resources
- `/roadmap` → learning roadmap
- `/canvas` → studio/canvas surface
- pulse and stack score surfaces on home/desk-related UI

## Routes and API surface

### Main routes

| Route | Purpose |
|---|---|
| `/` | Homepage + workspace intake |
| `/desk` | Workspace view loaded by token or profile id |
| `/ai-tools` | Tools surface |
| `/categories` | Category/atlas surface |
| `/resources` | Resource library |
| `/roadmap` | Learning roadmap |
| `/canvas` | Studio/canvas surface |
| `/admin/newsletter` | Newsletter admin surface |

### Key API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/strategy/plan` | `POST` | Create/update strategy profile and workspace brief |
| `/api/strategy/plan` | `GET` | Load workspace by `token`, `profileId`, or `email` |
| `/api/platform/stats` | `GET` | Growth stats used in the homepage/status surfaces |
| `/api/auth/[...nextauth]` | `GET/POST` | NextAuth handler |
| `/api/pulse` | `GET` | Return pulse items and stats |
| `/api/pulse/fetch` | `POST` | Trigger pulse fetching/cleanup flow |
| `/api/stack-score` | `GET` | Return stack score payload |
| `/api/stack-score/leaderboard` | `GET` | Return leaderboard payload |
| `/api/subscribe` | `POST/GET` | Newsletter subscribe and count flows |
| `/api/tools/search` | `GET` | Tool search |
| `/api/tools/click` | `POST` | Tool click tracking |
| `/api/vault/verify` | `POST` | Vault password verification |
| `/api/waitlist/join` | `POST` | Join waitlist |
| `/api/waitlist/position` | `GET` | Read waitlist position |
| `/api/cron/send-newsletter` | `POST` | Newsletter send flow |

## Development workflow

### Useful commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start local development server |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Run type checks |
| `npm run build` | Test production build |
| `npm audit --audit-level=high` | Check dependency vulnerabilities |

### What to check after changes

If you change homepage, desk flow, or navigation, validate all of these before shipping:

1. homepage loads without hydration/runtime issues
2. workspace CTA reaches `/desk`
3. strategy generation still redirects correctly
4. `/desk` works with and without a stored resume token
5. production build completes successfully

## Deployment notes

Pryzmira is structured like a Vercel-deployed Next.js application.

### Production expectations

- App Router pages and route handlers should run in a Next.js-compatible deployment target
- environment variables must be configured in the deployment platform
- any OAuth provider callbacks must use the real production site URL
- Postgres-backed features require valid production database credentials
- Resend-backed email flows require a valid API key and sender

### Recommended deployment flow

1. push code to GitHub
2. connect the repo to Vercel or another Next.js-compatible host
3. add production environment variables
4. deploy
5. test the homepage intake, `/desk`, auth flow, and waitlist flow on the live domain

## Troubleshooting

### Homepage builds but desk flow feels broken

Check:

- `NEXT_PUBLIC_SITE_URL`
- strategy resume token generation
- `/api/strategy/plan`
- client-side storage in `strategySession`
- navbar workspace CTA behavior

### OAuth sign-in modal shows but provider fails

Check:

- `AUTH_SECRET`
- Google/GitHub client id and secret values
- provider callback URLs in the OAuth dashboard
- production domain matches the configured callback domain

### Build fails in production

Run locally first:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Then inspect:

- newly added client/server boundaries
- route handler imports
- environment variable usage in server code
- components using `window`, `localStorage`, or `navigator`

### Waitlist or newsletter data does not persist

Check:

- Postgres configuration
- blob token configuration where used
- fallback JSON paths for local-only behavior

---

Pryzmira is currently in a transition phase: the older content/discovery product still exists, but the product direction is now the **AI operating desk**. If you update the app, optimize for the workspace loop first and let the supporting surfaces reinforce that main experience.
