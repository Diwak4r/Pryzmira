# Pryzmira

Pryzmira is now a voice-writing product.

The old catalog, waitlist, newsletter, and operator-facing product shape is gone. The current app is centered on a narrow writing flow:

- `/` is the voice intake surface
- `/desk` is the writing workspace
- active backend work lives under `next-web/src/app/api/voice/*`
- auth callback handling lives under `next-web/src/app/auth/callback`

## Product Shape

Pryzmira should be understood as a focused pipeline:

1. user lands on the voice intake screen
2. user authenticates or resumes a session
3. voice input is captured and processed through the voice API surface
4. the user works inside `/desk` as the primary workspace
5. history and generated writing state are restored and persisted

The codebase still contains some residue from the previous product direction, but that residue is no longer part of the product model.

## Active App

Active app path:

- `D:\projects\trying stuffs\Pryzmira\next-web`

Important routes and entrypoints:

- `next-web/src/app/page.tsx`
- `next-web/src/app/desk/page.tsx`
- `next-web/src/app/api/voice/*`
- `next-web/src/app/auth/callback/route.ts`

Wrapper components retained only for compatibility:

- `next-web/src/components/VoiceHome.tsx`
- `next-web/src/components/VoiceDesk.tsx`

These should stay thin. The real implementations are `Home.tsx` and `Desk.tsx`.

## Repository Reality

What has already been cut:

- old page routes such as tools, categories, roadmap, resources, admin/newsletter
- old API routes for waitlist, newsletter, pulse, stack-score, strategy, tools, and legacy auth
- old newsletter, catalog, pulse, stack-score, and waitlist UI/libs
- `next-auth` session wiring in the current app shell
- legacy server-side newsletter files

What still needs cleanup:

- empty legacy directories under `next-web/src/app` and `next-web/src/app/api`
- `server/database.sqlite`
- stale planning and architecture docs that previously described the wrong product

## Production Risks Still Open

These are real product risks, not cleanup trivia:

- `next-web/src/app/api/voice/auth/magic-link/route.ts` still needs abuse protection and rate limiting
- `next-web/.env.local` contains local secrets and should not be treated as stable operational config
- `next-web/src/lib/voiceStorage.ts` can fall back to local JSON when `SUPABASE_SERVICE_ROLE_KEY` is missing
- a full security audit has not been run yet
- build, lint, and type validation still need to be executed on a working shell

## Final-Version Checklist

Pryzmira is not "final" until these are done:

1. remove leftover legacy artifacts and empty directories
2. add rate limiting and abuse controls to magic-link auth
3. require production-safe persistence instead of silent local JSON fallback
4. rotate or re-issue local secrets and move to clean environment management
5. run `lint`, typecheck, and build successfully
6. do a full security pass over the voice auth and storage paths
7. verify the main product flow end to end: `/` -> auth -> voice processing -> `/desk` -> restore history

## Working Rules For This Repo

- treat Pryzmira as a single-product repo for the voice-writing app
- do not reintroduce catalog/waitlist/newsletter abstractions
- keep the navigation model minimal: `/` and `/desk`
- prefer surgical changes in the active `voice` and auth codepaths
- any new infrastructure or docs must describe the voice-writing product, not the old plan
