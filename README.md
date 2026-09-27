<div align="center">

# Pryzmira

**Every AI build, the moment it drops.**

[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-Cron_%2B_Hosting-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![Author](https://img.shields.io/badge/Author-Diwakar_Yadav-000000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Diwak4r)

</div>

---

### Overview

Within hours of a new AI model shipping, the internet fills with proof of what it can actually do — demo videos, the
exact prompt someone used, a repo someone shipped overnight. It's scattered across X, Reddit, and YouTube, and
unfindable within a couple of days.

**Pryzmira** is a no-login, mobile-first, always-updating feed of that content — organized by model release, filterable
by platform/tag, and built to surface the prompt, the creator, and how fresh a build is (FOMO on purpose).

### How content gets in — with zero API budget

| Source | Method | Cost |
| :--- | :--- | :--- |
| Reddit | Official free-tier JSON listing, polled every 30 min | Free |
| Hacker News | Algolia HN Search API | Free |
| YouTube | Data API v3 search (free daily quota) | Free, optional key |
| X / Twitter | No free polling API exists — covered by the public **Submit** flow, which resolves a pasted link via the same free, unauthenticated tweet-resolution trick "paste a tweet" sites use | Free |

Every source — automated or user-submitted — lands in a moderation queue (`submissions` table) before it becomes a
public `artifact`. Nothing goes live unreviewed.

### Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend & Routing** | Next.js 16 (App Router), React 19, Tailwind CSS |
| **Feed UX** | CSS scroll-snap + IntersectionObserver-driven video autoplay (TikTok/Reels-style, mobile-first) |
| **Database** | Supabase (Postgres) — see `next-web/supabase/prismira_schema.sql` |
| **Ingestion** | Vercel Cron hitting `/api/cron/{reddit,hn,youtube}` |
| **Analytics** | Cookie-consent-gated, loads only after accept — no accounts, no ad tracking |

Runs with **zero configuration** using in-memory seed data (`src/lib/seed-data.ts`) if Supabase env vars aren't set —
useful for local dev.

### Development Setup

```bash
cd next-web
npm install
npm run dev
```

Apply the schema once you have a Supabase project:

```bash
# in the Supabase SQL editor, or via the CLI
psql < next-web/supabase/prismira_schema.sql
```

#### Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional — enables the YouTube ingestion cron
YOUTUBE_API_KEY=

# Optional — protects the /api/cron/* routes; Vercel Cron sends this as a Bearer token automatically
CRON_SECRET=

# Optional — self-hosted Umami/Plausible-style analytics, only loads after cookie consent
NEXT_PUBLIC_ANALYTICS_SRC=
NEXT_PUBLIC_ANALYTICS_WEBSITE_ID=
```

> Vercel's Hobby plan rejects any cron schedule that runs more than once a day, so `vercel.json` runs each ingestion
> source once daily (staggered by an hour). Upgrade to Pro to tighten these to every 30 minutes for faster freshness.

---

<div align="center">
  <sub>A side project by <a href="https://github.com/Diwak4r">Diwakar</a></sub>
</div>
