## 2026-04-04 - Missing ARIA attributes and focus styles on custom collapsibles
**Learning:** Custom interactive elements, like the manual collapsibles (Insights, History) in the voice desk component, were lacking basic accessibility context (`aria-expanded`, `aria-controls`) and visual feedback for keyboard navigation (`focus-visible`).
**Action:** Always verify that interactive non-standard elements receive proper ARIA linkage (`aria-expanded` / `aria-controls`) and keyboard focus styling (e.g. `focus-visible:ring-1`) during implementation.
