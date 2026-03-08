# Pryzmira

A curated learning platform for AI, tech courses, tools, and resources. Built with Next.js 16 and React 19.

**Live:** [pryzmira.vercel.app](https://pryzmira.vercel.app)

## Features

- 100+ curated courses across 14 categories (AI, Web Dev, System Design, DSA, etc.)
- 100+ AI tools directory with descriptions and links
- Interactive Canvas — whiteboard for brainstorming and system design practice
- The Vault — curated resources, motivation, and dev tips
- Newsletter system with Resend email integration
- Dark/light theme with smooth transitions
- A/B testing via PostHog
- Fully responsive

## Tech Stack

Next.js 16 | React 19 | Tailwind CSS | Framer Motion | shadcn/ui | Resend | PostHog | Sentry

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
NEXT_PUBLIC_VAULT_PASSWORD=your_vault_code
NEXT_PUBLIC_SITE_URL=https://pryzmira.vercel.app
```

Open [localhost:3000](http://localhost:3000).

## Project Structure

```
Pryzmira/
  next-web/          # Main Next.js app
    src/
      app/           # App Router pages & API routes
      components/    # Reusable UI components
      views/         # Page-level view components
      data/          # Course catalog, tools, resources (JSON)
      hooks/         # Custom React hooks
      utils/         # Analytics, rate limiting
      context/       # Theme context
  server/            # Express backend (legacy, unused)
```

## License

MIT
