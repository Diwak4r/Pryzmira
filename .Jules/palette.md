## 2024-04-03 - [Missing Focus States and ARIA attributes on Interactive Elements]
**Learning:** Custom interactive elements (like custom toggle buttons and chip-style buttons) frequently lack `focus-visible` styles and necessary ARIA attributes (like `aria-expanded`) in this codebase, hindering keyboard navigation and screen reader support.
**Action:** Always verify that interactive non-standard elements receive proper focus styling (e.g., `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring`) and context-appropriate ARIA attributes when creating or modifying them.
