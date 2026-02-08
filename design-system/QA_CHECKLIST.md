# SH6 UI QA Checklist

Updated: 2026-02-08
Use this before merging UI changes.

## 1) Interaction states
- [x] All clickable controls show hover state.
- [x] All clickable controls show visible focus ring via keyboard navigation.
- [x] Active/selected state is visually distinct for segmented controls.
- [x] Disabled states are readable and clearly non-interactive.

## 2) Keyboard navigation
- [x] Start page can be completed without mouse.
- [x] Report menu is keyboard reachable and active entry is visible.
- [x] Competitor coach scope/category controls are keyboard operable.
- [x] Competitor row load actions (to B/C/D) are keyboard operable.
- [x] Spots heat cells and drilldown filters are keyboard operable.

## 3) Responsive checks
- [x] 375px: no blocked primary actions.
- [x] 768px: slot controls remain readable and usable.
- [x] 1024px: 2-4 compare slots remain legible.
- [x] 1440px: spacing remains balanced; no over-stretching.

## 4) Compare-mode parity checks
- [x] Start view: 1/2/3/4 slot transitions are clear.
- [x] Spots and RBN spots top analytics sections remain aligned.
- [x] Alignment intentionally stops before "All spots of you" raw list sections.
- [x] Competitor coach and export screens remain usable in compare mode.

## 5) Empty/loading/error states
- [x] Start page empty slot states are clear.
- [x] CQ API loading and no-result states are understandable.
- [x] Competitor coach empty cohort has practical next-step hints.
- [x] Spots/RBN errors do not break report rendering.
- [x] Data-status sidebar reflects current state without stale rows.

## 6) Regression checks by key pages
- [x] START: load A, then load B/C/D in compare mode.
- [x] MAIN: score and enrichment cards render correctly.
- [x] SPOTS: band/hour clicks open drilldown detail.
- [x] RBN SPOTS: same interaction model as Spots.
- [x] COMPETITOR COACH: row-to-slot load actions work correctly.
- [x] EXPORT PDF, HTML, CBR: label consistency and action clarity.

## 7) Smoke test and manual sanity
- [x] `./scripts/run-cq-api-browser-smoke.sh` passes.
- [x] One single-log permalink tested manually.
- [x] One 2-log permalink tested manually.
- [ ] One 4-slot compare flow tested manually.

## 8) Release notes readiness
- [x] CHANGELOG entry added for UI updates.
- [x] README menu names and feature labels are current.
- [x] Before/after screenshots captured for changed pages.
- [x] Residual risks documented.

## Screenshot Evidence
- Start page (before): `docs/screenshots/ui-ux/before/start.png`
- Start page (after): `docs/screenshots/ui-ux/after/start.png`
- Spots compare (before): `docs/screenshots/ui-ux/before/spots-compare.png`
- Spots compare (after): `docs/screenshots/ui-ux/after/spots-compare.png`
- Competitor coach (before): `docs/screenshots/ui-ux/before/competitor-coach.png`
- Competitor coach (after): `docs/screenshots/ui-ux/after/competitor-coach.png`

## Residual Risks
- `4-slot compare` still needs a dedicated manual pass with a fresh live run and visual verification across 375/768/1024 widths.
