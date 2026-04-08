## 2024-03-24 - Interactive Elements Accessibility Pattern
**Learning:** Custom interactive elements like collapsible sections (accordions) in this app often miss `aria-expanded` attributes and lack proper focus indicators.
**Action:** When implementing or fixing interactive components, explicitly include dynamic `aria-expanded` and explicit keyboard focus styles (`focus-visible:ring-1`) for better screen reader and keyboard accessibility.
