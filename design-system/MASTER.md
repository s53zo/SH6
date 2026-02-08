# SH6 Design System Master

Updated: 2026-02-08
Scope: Global design rules for SH6 pages and reports.

## 1) Product personality
- Focus: dense, reliable, technical analysis interface for contest logs.
- Tone: professional, precise, low-noise.
- Priority: data clarity over decoration.

## 2) Color tokens (light mode first)
Use variables in `style.css` under `:root`.

- `--sh6-bg-app`: `#f4f6f8`
- `--sh6-bg-surface`: `#ffffff`
- `--sh6-bg-muted`: `#f8fafc`
- `--sh6-bg-emphasis`: `#eef3ff`
- `--sh6-bg-selected`: `#dfe9ff`

- `--sh6-text-primary`: `#111827`
- `--sh6-text-secondary`: `#374151`
- `--sh6-text-muted`: `#6b7280`

- `--sh6-border-subtle`: `#d1d5db`
- `--sh6-border-strong`: `#94a3b8`

- `--sh6-link`: `#1d4ed8`
- `--sh6-link-hover`: `#b91c1c`

- `--sh6-accent`: `#1e40af`
- `--sh6-accent-soft`: `#dbeafe`
- `--sh6-success`: `#15803d`
- `--sh6-warning`: `#a16207`
- `--sh6-danger`: `#b91c1c`

- `--sh6-focus-ring`: `#2563eb`

## 3) Typography
- Base family: `Verdana, Arial, Tahoma, sans-serif` (keep current SH6 identity).
- Base size: `12px` equivalent legacy density.
- Data-dense table cell target: `11px-12px`.
- Heading rhythm:
  - Section heading: `18px` bold
  - Card heading: `14px-16px` bold
  - Table heading: `12px` bold

## 4) Spacing scale
- `--sh6-space-1`: `4px`
- `--sh6-space-2`: `8px`
- `--sh6-space-3`: `12px`
- `--sh6-space-4`: `16px`
- `--sh6-space-5`: `20px`
- `--sh6-space-6`: `24px`

Usage rules:
- Internal control gap: 8-12px.
- Card padding: 12-16px.
- Panel separation: 12-16px.

## 5) Shape, borders, depth
- Radius:
  - Small controls: `6px`
  - Cards: `8px`
  - Pills/chips: `999px`
- Border standard: `1px solid var(--sh6-border-subtle)`.
- Shadows: subtle only, mostly for raised interactive elements.

## 6) Table density rules
- Header background should differ from rows.
- Stripe rows for long data sets.
- Numeric cells right aligned where relevant.
- Preserve compact rows for contest report speed scanning.
- Selected/current row must be visibly distinct but not saturated.

## 7) Interaction states
Every interactive element must define:
- Default
- Hover
- Active
- Disabled
- Focus-visible

Rules:
- Hover should not cause layout shift.
- Focus ring must remain visible on keyboard navigation.
- Clickable controls must show pointer cursor.

## 8) Accessibility baseline
- Target minimum text contrast 4.5:1 for core content.
- Keep semantic button/input elements whenever possible.
- Support keyboard-only path for:
  - load log
  - switch report
  - compare selections
  - export actions
- Respect reduced motion:
  - disable non-essential animations with `prefers-reduced-motion`.

## 9) Breakpoints
Design checks required at:
- 375px (mobile)
- 768px (tablet)
- 1024px (laptop)
- 1440px (desktop wide)

Responsive policy:
- Prioritize readable stacking over squeezing controls.
- Horizontal scroll is acceptable for wide data tables only.

## 10) Core component standards
- Sidebar nav:
  - clear active state
  - minimum click target 32px height
- Status rows:
  - consistent tone and spacing
  - success/warn/error color semantics
- Cards:
  - consistent heading treatment
  - stable padding and separators
- Compare panels:
  - aligned headings and action zones
  - avoid over-aligning independent long tables

## 11) Anti-patterns (do not introduce)
- Random color accents per section.
- Excessive gradients, glow, and decorative shadows.
- Inconsistent button radius/padding between reports.
- Hidden primary actions behind ambiguous icons.
- Dropdown-only controls for critical compare filters when direct choices fit.
- Layout jumps on hover/focus.
- Dense content without grouping headers.

## 12) Definition of visual done
- Start page flow is obvious in under 10 seconds for first-time user.
- Compare mode remains legible at 2/3/4 slots.
- Report tables look consistent in header, stripe, and cell spacing.
- Interactive elements are discoverable and keyboard-friendly.
