# Platform Execution Plan

## Objective

Finish Pryzmira as the current voice-writing product and remove the remaining gap between "cleaned up" and "production ready".

## Execution Order

### 1. Cleanup Residue

Remove what no longer belongs:

- empty legacy route directories
- empty legacy API directories
- `server/database.sqlite`
- any remaining dead product residue discovered during validation

Outcome:

- the repo reflects the real product surface and nothing else

### 2. Rewrite The Project Narrative

Bring docs in line with the codebase:

- rewrite `README.md`
- rewrite `SCALING_PLAN.md`
- rewrite `.planning/ARCHITECTURE-DECISION.md`
- rewrite `.planning/PLATFORM-EXECUTION-PLAN.md`
- rewrite `.planning/PLATFORM-PIVOT-RESEARCH.md`

Outcome:

- anyone opening the repo understands the voice-writing product immediately

### 3. Validate The Codebase

Run the project checks from the active app:

- lint
- typecheck
- build

Outcome:

- no unresolved compile or bundle regressions from the cleanup pass

### 4. Harden Auth

Focus on:

- `next-web/src/app/api/voice/auth/magic-link/route.ts`
- `next-web/src/app/auth/callback/route.ts`
- `next-web/src/lib/voiceAuth.ts`

Required work:

- add abuse/rate limiting on magic-link issuance
- preserve strict callback-target validation
- ensure no unsafe redirect or trust-boundary regressions

Outcome:

- auth is usable under real traffic and less vulnerable to trivial abuse

### 5. Harden Persistence

Focus on:

- `next-web/src/lib/voiceStorage.ts`

Required work:

- stop treating local JSON fallback as acceptable production behavior
- make missing critical storage config explicit
- standardize production persistence on real infrastructure

Outcome:

- user writing state is not dependent on accidental local runtime behavior

### 6. Secrets Hygiene

Required work:

- rotate/remove local secrets in `next-web/.env.local`
- move to clean environment provisioning for real deployments

Outcome:

- local development convenience is separated from deploy-safe configuration

### 7. Security Review

Run a real security pass over:

- magic-link auth issuance
- callback validation
- session restoration
- persistence paths

Outcome:

- the narrowed app is not carrying obvious auth or storage vulnerabilities into production

## Definition Of Done

Pryzmira is in its first credible final state when:

- the repo has no meaningful legacy residue
- the docs match the actual product
- the app validates cleanly
- auth is abuse-resistant
- persistence is production-safe
- the `/` -> `/desk` user path works end to end without hidden fallback behavior
