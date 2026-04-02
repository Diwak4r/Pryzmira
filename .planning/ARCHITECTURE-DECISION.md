# Architecture Decision

## Decision

Pryzmira is a focused voice-writing application, not a general AI-tools/catalog platform.

The architecture is intentionally narrowed to:

- a minimal frontend route surface: `/` and `/desk`
- a voice-centric API surface under `next-web/src/app/api/voice/*`
- a dedicated auth callback path under `next-web/src/app/auth/callback`
- thin compatibility wrappers only where needed

## Why

The previous product shape introduced dead surface area, dead abstractions, and maintenance cost that no longer matched what the app actually does.

The codebase now reflects the real product:

- users enter through voice intake
- users continue work in a desk/workspace model
- the product value is in turning voice flow into writing flow

## Consequences

### Accepted

- older route families and feature clusters are removed instead of preserved
- navigation remains intentionally small
- documentation and planning must be rewritten around the voice product
- future code should land in the active voice/auth paths unless there is a strong reason otherwise

### Rejected

- keeping legacy pages "just in case"
- maintaining newsletter/waitlist/support abstractions inside the main app
- treating the repo like a platform before the core product is hardened

## Operational Constraints

The narrowed architecture is correct, but the system is not fully hardened yet.

Open concerns:

- magic-link auth still needs rate limiting
- persistence still has a local JSON fallback path
- environment handling still depends on local secret hygiene
- validation and full security review are still pending

## Guardrails

Any future work should follow these rules:

1. default to the current voice-writing product model
2. avoid adding routes that re-expand the app without a direct product reason
3. keep wrapper components thin and disposable
4. keep auth redirects and callback targets explicitly trusted
5. treat production persistence as mandatory infrastructure, not optional fallback behavior
