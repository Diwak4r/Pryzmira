
## 2026-04-07 - Focus and ARIA properties on Custom Elements
**Learning:** Interactive elements built with native `<button>` or `<a>` instead of the design system's components often lack `focus-visible` styling and proper ARIA attributes, creating accessibility gaps.
**Action:** When adding or modifying custom interactive elements, ensure they receive `focus-visible:ring-1` and `focus-visible:ring-ring` along with context-appropriate ARIA labels.
