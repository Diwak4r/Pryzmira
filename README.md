# Pryzmira

A curated learning platform for AI, tech courses, tools, and resources. Built with Next.js 16 and React 19.

**Live:** [pryzmira.vercel.app](https://pryzmira.vercel.app)

## Features

- **130+ curated courses** across 14 categories (AI, Web Dev, System Design, DSA, Cybersecurity, Cloud, etc.)
- **50+ AI tools directory** — real, verified tools with live web search powered by Tavily
- **Interactive Canvas** — full whiteboard with pen, shapes, text, eraser, zoom/pan, undo/redo
- **The Vault** — password-protected curated resources, motivation quotes, and dev tips
- **Learning Roadmap** — structured path from CS foundations to cloud & cybersecurity
- **Newsletter system** — subscriber management with welcome emails via Resend
- **Dark/light theme** with smooth transitions
- **A/B testing** via PostHog
- **Security** — server-side password validation, rate limiting, admin authentication, security headers
- Fully responsive, mobile-first design

## Tech Stack

Next.js 16 | React 19 | Tailwind CSS | Framer Motion | shadcn/ui | Resend | PostHog | Sentry | Tavily | Vercel Blob

## Setup

```bash
cd next-web
npm install
npm run dev
```

Create a `.env.local` file:

```env
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev
CRON_SECRET=your_random_secret
VAULT_PASSWORD=your_vault_code
TAVILY_API_KEY=your_tavily_key
NEXT_PUBLIC_SITE_URL=https://pryzmira.vercel.app
BLOB_READ_WRITE_TOKEN=your_private_blob_store_token
```

For production newsletter persistence, connect a private Vercel Blob store to the project so `BLOB_READ_WRITE_TOKEN` is available. Local development falls back to `next-web/data/subscribers.json`.

Open [localhost:3000](http://localhost:3000).

## Project Structure

```
Pryzmira/
  next-web/              # Main Next.js app
    src/
      app/               # App Router pages & API routes
        api/
          subscribe/     # Newsletter subscription endpoint
          tools/search/  # Tavily-powered live AI tool search
          vault/verify/  # Server-side vault password verification
          cron/          # Newsletter send cron endpoint
        admin/           # Admin dashboard (auth-gated)
      components/        # Reusable UI components (shadcn/ui based)
      views/             # Page-level view components
      data/              # Course catalog, tools, resources (JSON + TS)
      lib/               # Utility functions
      utils/             # Analytics, rate limiting
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/subscribe` | POST | Subscribe to newsletter |
| `/api/subscribe` | GET | Get subscriber count (auth required) |
| `/api/tools/search` | GET | Live AI tool search via Tavily |
| `/api/vault/verify` | POST | Verify vault access password |
| `/api/cron/send-newsletter` | POST | Send newsletter to subscribers |

## License

MIT
