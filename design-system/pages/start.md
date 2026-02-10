# Start Page Override

Page: Start / log loading shell
Inherits: `design-system/MASTER.md`

## Purpose
Guide user from zero to loaded logs with minimal friction.

## Layout overrides
- Step cards must keep strong sequence emphasis:
  - Step 1: compare mode choice
  - Step 2: load source per slot
- Per-slot card must show status badge at top-right.
- Avoid duplicate explanatory text between slots.

## Interaction overrides
- Slot source selector (`Upload`, `Archive`, `Demo`) must behave like segmented controls:
  - clear active background and border
  - no ambiguous "selected" state
- Drop zones should visually react on drag-over.
- "Compare logs" radio controls must be large enough to tap.

## Copy/labeling overrides
- Keep action labels explicit:
  - "Upload Log A"
  - "Search archive"
  - "Load demo log"
- Prefer concise helper text below actions, not above large blocks.

## Compare mode ergonomics
- In 3/4 slot mode, reduce per-slot ornament and maximize control clarity.
- Keep slot header + state visible without scrolling inside card.
- Preserve visual parity across A/B/C/D cards.

## QA focus
- First-run path should be obvious without reading full descriptions.
- 4-slot layout should not create accidental horizontal overflow at 1024px+.
