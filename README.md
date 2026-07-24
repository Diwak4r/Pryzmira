# Pryzmira

AI that sounds like you.

// Overview
AI output is historically identifiable. It speaks in patterns, not rhythms. 
Pryzmira captures your syntactic fingerprint. 
Supply one authentic sample. State your objective. Receive text that passes as human. 
Your human.

// Infrastructure
— Framework: Next.js 16 (App Router) / React 19
— Styling: Tailwind CSS
— Intelligence: Groq AI (voice analysis + generation)
— Fallback: OpenRouter
— Persistence: Supabase (auth + storage)

// Development Protocol
> cd next-web
> npm install
> npm run dev

// Environment Variables
Required in .env.local:
GROQ_API_KEY
OPENROUTER_API_KEY (optional)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

// Deployment
Execute from repository root (Vercel target: next-web)
> vercel deploy --prod --yes

// Author
Diwakar.
