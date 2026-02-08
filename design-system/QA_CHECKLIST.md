# SH6 UI QA Checklist

Updated: 2026-02-08
Use this before merging UI changes.

## 1) Interaction states
- [ ] All clickable controls show hover state.
- [ ] All clickable controls show visible focus ring via keyboard navigation.
- [ ] Active/selected state is visually distinct for segmented controls.
- [ ] Disabled states are readable and clearly non-interactive.

## 2) Keyboard navigation
- [ ] Start page can be completed without mouse.
- [ ] Report menu is keyboard reachable and active entry is visible.
- [ ] Competitor coach scope/category controls are keyboard operable.
- [ ] Competitor row load actions (to B/C/D) are keyboard operable.
- [ ] Spots heat cells and drilldown filters are keyboard operable.

## 3) Responsive checks
- [ ] 375px: no blocked primary actions.
- [ ] 768px: slot controls remain readable and usable.
- [ ] 1024px: 2-4 compare slots remain legible.
- [ ] 1440px: spacing remains balanced; no over-stretching.

## 4) Compare-mode parity checks
- [ ] Start view: 1/2/3/4 slot transitions are clear.
- [ ] Spots and RBN spots top analytics sections remain aligned.
- [ ] Alignment intentionally stops before "All spots of you" raw list sections.
- [ ] Competitor coach and export screens remain usable in compare mode.

## 5) Empty/loading/error states
- [ ] Start page empty slot states are clear.
- [ ] CQ API loading and no-result states are understandable.
- [ ] Competitor coach empty cohort has practical next-step hints.
- [ ] Spots/RBN errors do not break report rendering.
- [ ] Data-status sidebar reflects current state without stale rows.

## 6) Regression checks by key pages
- [ ] START: load A, then load B/C/D in compare mode.
- [ ] MAIN: score and enrichment cards render correctly.
- [ ] SPOTS: band/hour clicks open drilldown detail.
- [ ] RBN SPOTS: same interaction model as Spots.
- [ ] COMPETITOR COACH: row-to-slot load actions work correctly.
- [ ] EXPORT PDF, HTML, CBR: label consistency and action clarity.

## 7) Smoke test and manual sanity
- [ ] `./scripts/run-cq-api-browser-smoke.sh` passes.
- [ ] One single-log permalink tested manually.
- [ ] One 2-log permalink tested manually.
- [ ] One 4-slot compare flow tested manually.

## 8) Release notes readiness
- [ ] CHANGELOG entry added for UI updates.
- [ ] README menu names and feature labels are current.
- [ ] Before/after screenshots captured for changed pages.
- [ ] Residual risks documented.
