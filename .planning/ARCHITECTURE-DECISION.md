# Architecture Decision Record

## Context
Pryzmira's frontend has been iterated visually, but the resulting experience still reads as a prototype because the layout language, navigation behavior, page hierarchy, and motion rules are not sufficiently systematized. The project already has a working Next.js application, existing routes, and production deployment infrastructure, so the redesign must improve experience quality without destabilizing the product surface.

## Decision Drivers
- The first impression must feel intentional, editorial, and product-grade rather than template-driven.
- Navigation and page hierarchy must be understandable within seconds for students and builders browsing across courses, tools, resources, and roadmap flows.
- The redesign must be maintainable as a system, not as route-specific one-off styling.
- The app must stay performant on Vercel and remain easy for a new contributor to extend.

## Considered Options

### Option A: Continue page-by-page visual tweaks
**Pros:** Fastest to ship isolated changes.
**Cons:** Keeps the prototype feel, increases inconsistency, and compounds design debt.
**Effort:** Low
**Risk:** High

### Option B: Introduce a shared frontend system with route metadata and page scaffolds
**Pros:** Produces consistent hierarchy, reusable motion rules, stronger navigation, and lower long-term design debt.
**Cons:** Requires touching multiple shared files and refitting major routes.
**Effort:** Medium
**Risk:** Medium

### Option C: Rebuild the frontend from scratch with a new route structure
**Pros:** Maximum freedom.
**Cons:** Unnecessary churn, high regression risk, and slower time to deployment.
**Effort:** High
**Risk:** High

## Decision
Adopt Option B. Pryzmira will use a shared visual/navigation system driven by route metadata, reusable page hero scaffolds, consistent section framing, and calmer motion rules. Shared shell components will carry route context and interaction polish, while high-traffic pages will be refit onto the same structure.

## Consequences
- Shared layout decisions become easier to apply consistently across the site.
- Individual pages will lose some ad hoc freedom in favor of stronger system coherence.
- A small amount of upfront refactor work is introduced to remove prototype-like fragmentation.

## Component Diagram
```
RootLayout
  -> Providers
    -> ClientLayout
      -> Navbar
      -> Route Context / Progress / Footer
      -> Page View
        -> PageHero
        -> Route-specific content sections
        -> Shared cards / actions / newsletter
```

## Data Flow
```
Request
  -> Next.js route
    -> ClientLayout resolves route metadata
      -> Page view renders shared hero + content sections
        -> User actions call API routes / local storage helpers
          -> Response or persisted state updates UI
```

## File Structure
```
next-web/src/app/
  layout.tsx                # App metadata, fonts, global shell mount
  globals.css               # Design tokens, motion rules, shared utilities

next-web/src/components/
  ClientLayout.tsx          # Route-aware shell, footer, contextual framing
  Navbar.tsx                # Main navigation, current-route focus, mobile menu
  PageHero.tsx              # Shared hero scaffold for top-level pages
  Newsletter.tsx            # Shared conversion block

next-web/src/lib/
  siteNavigation.ts         # Route metadata and navigation descriptors
  recentlyViewed.ts         # Local persistence helpers

next-web/src/views/
  Categories.tsx            # Catalog page built on shared hero scaffold
  AITools.tsx               # Tools directory built on shared hero scaffold
  Resources.tsx             # Archive page built on shared hero scaffold
  Roadmap.tsx               # Learning route page built on shared hero scaffold
  CourseDetail.tsx          # Detail page using the same visual language
```

## Validation
- Scale: The approach is presentation-layer only and remains suitable for the current Vercel/Next.js deployment model.
- Single point of failure: Shared shell components are centralized, but route views remain independently renderable.
- Testability: Lint, build, and browser checks cover the shared layer and route regressions.
- Developer clarity: Route metadata plus page scaffolds reduce onboarding time because structure is explicit.
- 10x traffic: The redesign does not introduce heavier data dependencies; performance risk is mainly bundle size and motion, which will be verified during build and browser checks.
