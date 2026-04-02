# Pryzmira

Personal Writing Voice AI.

Paste one real writing sample, describe what you need written, and get output that sounds like you — not like AI.

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS
- Groq AI (voice analysis + generation)
- Supabase (auth + storage)

## Development

```bash
cd next-web
npm install
npm run dev
```

Requires `.env.local` with `GROQ_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

## Author

[@Diwak4r](https://github.com/Diwak4r)
