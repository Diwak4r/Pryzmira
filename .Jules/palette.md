## 2026-04-05 - Focus indicators and ARIA expanded on custom buttons
**Learning:** Custom interactive elements in this Next.js app often lack essential `focus-visible` styles and context-appropriate ARIA attributes (like `aria-expanded`).
**Action:** When working on custom interactive elements, explicitly add `focus-visible:ring-1` styling to ensure keyboard users see their focus location, and ensure any collapsable components accurately reflect their state through ARIA attributes.
