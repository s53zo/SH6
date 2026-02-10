# UI/UX Upgrade TODO (Detailed + LLM Execution Instructions)

Updated: 2026-02-08  
Branch: `UI_UX`  
Worktree: `/Users/simon/github/SH6`

## Mission
Upgrade SH6 UI/UX quality while preserving existing scoring/API behavior.

Primary goals:
- Improve visual consistency and readability across all menus.
- Make compare workflows clearer and faster.
- Improve accessibility (keyboard, focus, contrast, reduced motion).
- Keep initial load and runtime performance stable or better.

## Non-goals (for this track)
- No scoring rule logic changes.
- No CQ API schema changes.
- No backend dependency required for UI-only improvements.
- No large framework migration (stay static HTML/CSS/JS).

## Current Code Map (for task routing)
- Core app shell and report rendering: `main.js`
- CQ API module: `cq-api-enrichment.js`
- Competitor module: `competitor-coach.js`
- Spot hunter module: `spot_hunter.js`
- Main markup shell: `index.html`
- Global styling: `style.css`
- Browser smoke test: `tests/cq-api-browser-smoke.html`
- Smoke runner: `scripts/run-cq-api-browser-smoke.sh`

## LLM Execution Contract (follow exactly)
1. Work only on branch `UI_UX`.
2. Keep commits atomic (one task = one commit when possible).
3. After each task:
   - Run validation commands listed in the task.
   - Manually sanity-check at least one single-log and one 4-slot compare flow.
4. Do not change contest scoring formulas, CQ API parsing, or lookup backends in this UI track.
5. Prefer edits in `style.css` + small, isolated `main.js` render helpers.
6. Use existing SH6 class patterns; avoid introducing UI frameworks.
7. Accessibility baseline required for every new control:
   - visible `:focus-visible`
   - keyboard reachable
   - clear hover/active states
8. Push to remote after each sprint completion.

---

## Sprint 1: Design System Baseline
Goal: create a stable visual language and implementation guardrails before UI rewrites.

### Task 1.1: Create master design-system doc
- Status: [ ]
- Scope:
  - `design-system/MASTER.md` (new)
- Instruction to LLM:
  - Create `design-system/MASTER.md`.
  - Define:
    - color tokens (light mode first, no purple bias)
    - typography scale
    - spacing scale
    - border radius/shadows
    - table density rules
    - interaction states (hover/focus/disabled)
    - breakpoints: 375 / 768 / 1024 / 1440
  - Include explicit anti-patterns to avoid in SH6 (visual noise, inconsistent paddings, unclear clickable affordance).
- Acceptance criteria:
  - File exists and is complete enough to guide all follow-up tasks.
- Validation:
  - `test -f design-system/MASTER.md`
- Commit message:
  - `docs(ui): add SH6 master design system baseline`

### Task 1.2: Create page-level override docs
- Status: [ ]
- Scope:
  - `design-system/pages/start.md` (new)
  - `design-system/pages/spots.md` (new)
  - `design-system/pages/competitor-coach.md` (new)
- Instruction to LLM:
  - Add only page-specific deviations from `MASTER.md`.
  - `start.md`: loading flow, slot cards, compare mode ergonomics.
  - `spots.md`: compare-aligned analytics layout and drilldown readability.
  - `competitor-coach.md`: filter controls and row-to-slot loading UX.
- Acceptance criteria:
  - Each file contains concrete component rules and user flow guidance.
- Validation:
  - `ls design-system/pages`
- Commit message:
  - `docs(ui): add page-specific design system overrides`

### Task 1.3: Add UI QA checklist for PRs
- Status: [ ]
- Scope:
  - `design-system/QA_CHECKLIST.md` (new)
- Instruction to LLM:
  - Add checklist sections:
    - interaction states
    - keyboard navigation
    - responsive checks
    - compare-mode parity checks
    - empty/loading/error state checks
    - regression checks for start, spots, rbn spots, competitor coach, export
- Acceptance criteria:
  - Checklist can be used as a release gate.
- Validation:
  - `test -f design-system/QA_CHECKLIST.md`
- Commit message:
  - `docs(ui): add UI QA checklist for release gating`

---

## Sprint 2: Global CSS Foundation
Goal: introduce reusable tokens and consistent primitives without breaking behavior.

### Task 2.1: Introduce CSS custom properties
- Status: [ ]
- Scope:
  - `style.css`
- Instruction to LLM:
  - Add a `:root` token section near top of file.
  - Convert repeated hardcoded colors/spacing/border values to tokens in foundational selectors only first.
  - Keep existing class names unchanged.
- Acceptance criteria:
  - Visual output remains equivalent or cleaner; no broken layout.
- Validation:
  - Load app and verify Start + Main + Spots render.
- Commit message:
  - `refactor(ui): add root design tokens to stylesheet`

### Task 2.2: Normalize button/link/input states
- Status: [ ]
- Scope:
  - `style.css`
  - `index.html` (only if semantic attributes are missing)
- Instruction to LLM:
  - Standardize hover/active/focus-visible styling for:
    - `.button`
    - nav buttons
    - slot source controls
    - coach controls
    - table action buttons
  - Ensure clickable elements show pointer and keyboard focus ring.
- Acceptance criteria:
  - All interactive controls have consistent visual states.
- Validation:
  - Manual keyboard tab walkthrough on Start and Competitor coach.
- Commit message:
  - `feat(ui): unify interaction states across controls`

### Task 2.3: Define shared card/table primitives
- Status: [ ]
- Scope:
  - `style.css`
- Instruction to LLM:
  - Add reusable classes/tokens for:
    - card surfaces
    - report section headings
    - dense table spacing
    - striped rows and selected row treatment
  - Avoid mass HTML rewrites; map existing selectors to shared styles.
- Acceptance criteria:
  - Existing report cards/tables look more consistent.
- Validation:
  - Check Main, Summary, Competitor coach, Spots tables in single + compare.
- Commit message:
  - `feat(ui): add shared card and table style primitives`

---

## Sprint 3: Start Page and Compare Shell UX
Goal: improve first-run clarity and multi-slot usability.

### Task 3.1: Start page hierarchy cleanup
- Status: [ ]
- Scope:
  - `main.js`
  - `style.css`
- Instruction to LLM:
  - Improve visual hierarchy of:
    - Step 1 compare mode
    - Step 2 load logs
    - per-slot status
  - Keep current functionality exactly the same.
- Acceptance criteria:
  - First-time users can understand loading flow without tooltips.
- Validation:
  - Manual test: load A only, then 4-slot compare.
- Commit message:
  - `feat(ui): improve start flow hierarchy and slot clarity`

### Task 3.2: Compare shell spacing/alignment polish
- Status: [ ]
- Scope:
  - `style.css`
  - `main.js` (only compare wrapper classes/hooks)
- Instruction to LLM:
  - Normalize compare panel gutters, vertical rhythm, and heading alignment.
  - Preserve rule: avoid over-alignment beyond intended sections (as already done for spots).
- Acceptance criteria:
  - 2/3/4 slot compare view feels balanced and readable.
- Validation:
  - Open 4-slot compare on Start, Spots, RBN spots.
- Commit message:
  - `feat(ui): polish compare panel spacing and alignment`

### Task 3.3: Sidebar/nav readability pass
- Status: [ ]
- Scope:
  - `style.css`
  - `index.html` (minimal)
- Instruction to LLM:
  - Improve readability of left nav list and status block.
  - Keep numbering and menu order unchanged.
  - Ensure active report is clearly visible in long nav lists.
- Acceptance criteria:
  - Navigation scan time improves; active report always obvious.
- Validation:
  - Switch rapidly across 10+ menu entries and verify active-state clarity.
- Commit message:
  - `feat(ui): improve sidebar navigation readability`

---

## Sprint 4: Report-Specific UX Upgrades
Goal: focus on high-impact report ergonomics.

### Task 4.1: Competitor coach control ergonomics
- Status: [ ]
- Scope:
  - `main.js`
  - `style.css`
  - `competitor-coach.js` (only if needed for metadata exposure)
- Instruction to LLM:
  - Keep scope/category visible and easy to tap (avoid hidden/dropdown-only interactions).
  - Simplify row load interaction so destination slot selection is unambiguous.
  - Do not expose technical API source URLs in UI.
- Acceptance criteria:
  - User can select competitor row and load to B/C/D in one clear flow.
- Validation:
  - Manual scenario with one row and with multi-row cohort.
- Commit message:
  - `feat(ui): streamline competitor coach controls and row actions`

### Task 4.2: Spots/RBN drilldown usability
- Status: [ ]
- Scope:
  - `main.js`
  - `style.css`
- Instruction to LLM:
  - Keep "Spots of you by band/hour" prominent.
  - Ensure clickable values are visually obvious and keyboard focusable.
  - Improve drilldown filter chips for continent/CQ/ITU clarity.
- Acceptance criteria:
  - User can reliably discover drilldown and filter to desired subset.
- Validation:
  - Manual drilldown on at least 2 buckets per source (`spots`, `rbn`).
- Commit message:
  - `feat(ui): improve spots drilldown discoverability and filtering`

### Task 4.3: Export surface clarity
- Status: [ ]
- Scope:
  - `main.js`
  - `style.css`
- Instruction to LLM:
  - Keep menu label consistent everywhere: `EXPORT PDF, HTML, CBR`.
  - Improve export action grouping and explanatory notes.
  - Ensure compare mode export behavior is clearly communicated.
- Acceptance criteria:
  - Export options are self-explanatory without trial/error.
- Validation:
  - Manual check in single and compare mode.
- Commit message:
  - `feat(ui): polish export menu clarity and action grouping`

---

## Sprint 5: Accessibility + Responsive Hardening
Goal: make SH6 robust across keyboard and mobile/tablet form factors.

### Task 5.1: Focus and keyboard audit fixes
- Status: [ ]
- Scope:
  - `style.css`
  - `main.js` (event handling only where needed)
- Instruction to LLM:
  - Ensure all custom button-like controls are keyboard operable.
  - Add/normalize `aria-pressed`, `aria-selected`, labels where missing.
  - Ensure focus order follows visual order.
- Acceptance criteria:
  - Core flows usable without mouse.
- Validation:
  - Keyboard-only run: load log, open competitor coach, load compare slot.
- Commit message:
  - `fix(a11y): improve keyboard and focus behavior across reports`

### Task 5.2: Responsive breakpoints pass
- Status: [ ]
- Scope:
  - `style.css`
  - `index.html` (if minor structural hooks required)
- Instruction to LLM:
  - Verify and tune layout for widths:
    - 375px
    - 768px
    - 1024px
    - 1440px
  - Keep density high for desktop; preserve usability on small screens.
- Acceptance criteria:
  - No horizontal overflow in core screens unless data tables require it.
- Validation:
  - Browser responsive mode checks at all target widths.
- Commit message:
  - `feat(ui): harden responsive behavior for core breakpoints`

### Task 5.3: Motion and contrast safeguards
- Status: [ ]
- Scope:
  - `style.css`
- Instruction to LLM:
  - Respect `prefers-reduced-motion` for animations/spinners/transitions.
  - Ensure minimum readable contrast for text and controls.
- Acceptance criteria:
  - Reduced-motion mode remains functional and clear.
- Validation:
  - Toggle reduced motion in devtools and verify behavior.
- Commit message:
  - `fix(ui): add reduced-motion and contrast safety improvements`

---

## Sprint 6: QA, Regression, and Documentation Closeout
Goal: finish with stable, testable, documented results.

### Task 6.1: Extend smoke checks for UI-critical regressions
- Status: [ ]
- Scope:
  - `tests/cq-api-browser-smoke.html`
  - optional new small UI smoke file in `tests/`
  - `scripts/` test runner if needed
- Instruction to LLM:
  - Keep existing CQ API smoke test passing.
  - Add lightweight assertions for:
    - competitor coach render availability
    - spots view render availability
    - export menu label exact text
- Acceptance criteria:
  - Smoke tests catch obvious UI regressions.
- Validation:
  - `./scripts/run-cq-api-browser-smoke.sh`
  - plus new smoke command if added.
- Commit message:
  - `test(ui): add smoke checks for key report surfaces`

### Task 6.2: Update user-facing docs and changelog
- Status: [ ]
- Scope:
  - `README.md`
  - `CHANGELOG.md`
- Instruction to LLM:
  - Update README feature list to reflect current menu/report names.
  - Add changelog entry summarizing UI/UX improvements and a11y/responsive work.
- Acceptance criteria:
  - Docs match shipped behavior.
- Validation:
  - Manual read-through for stale menu names/terms.
- Commit message:
  - `docs: update README and changelog for UI_UX release`

### Task 6.3: Release preparation checklist
- Status: [ ]
- Scope:
  - `design-system/QA_CHECKLIST.md`
  - release PR description template (if used)
- Instruction to LLM:
  - Mark completed checklist items and note residual risks.
  - Include before/after screenshots for:
    - Start page
    - Spots compare
    - Competitor coach
- Acceptance criteria:
  - Release notes include explicit validation evidence.
- Validation:
  - Checklist fully reviewed and signed off.
- Commit message:
  - `chore(release): finalize UI_UX validation checklist`

---

## Sprint 7: UX Measurement and Success Metrics
Goal: move from subjective UI polish to measurable UX outcomes.

### Task 7.1: Define SH6 UX KPI framework
- Status: [ ]
- Scope:
  - `design-system/UX_METRICS.md` (new)
- Instruction to LLM:
  - Create a KPI spec for core flows:
    - time to first successful single-log render
    - time to first successful 4-slot compare render
    - spots drilldown completion rate
    - export completion success rate
  - Include baseline collection method and target thresholds.
- Acceptance criteria:
  - KPI definitions are unambiguous and measurable.
- Validation:
  - `test -f design-system/UX_METRICS.md`
- Commit message:
  - `docs(ux): define SH6 UX metrics and targets`

### Task 7.2: Add lightweight instrumentation hooks
- Status: [ ]
- Scope:
  - `main.js`
- Instruction to LLM:
  - Add a small, isolated instrumentation helper for key events in:
    - log load
    - compare render
    - spots drilldown
    - export trigger/success
  - Keep it local-only and toggleable (no backend required).
  - Must not alter scoring logic or CQ API behavior.
- Acceptance criteria:
  - Core flows emit timing/error markers in debug mode.
- Validation:
  - Manual check in browser console for all four flows.
- Commit message:
  - `feat(ux): add debug instrumentation for core user journeys`

### Task 7.3: Add UX performance budgets
- Status: [ ]
- Scope:
  - `design-system/UX_METRICS.md`
  - optional small helper in `scripts/`
- Instruction to LLM:
  - Define pass/fail budgets for:
    - LCP
    - INP
    - CLS
    - JS/CSS size growth guardrails
  - Add how to run and record periodic checks.
- Acceptance criteria:
  - Budgets are numeric and actionable.
- Validation:
  - Manual Lighthouse run compared against documented thresholds.
- Commit message:
  - `docs(perf): add UX performance budgets and check procedure`

---

## Sprint 8: Information Architecture and Navigation Efficiency
Goal: reduce cognitive load and speed up report navigation.

### Task 8.1: Add report grouping in navigation
- Status: [ ]
- Scope:
  - `index.html`
  - `style.css`
  - `main.js` (if nav is rendered dynamically)
- Instruction to LLM:
  - Group navigation items into clear sections while preserving existing order inside each section.
  - Keep numbering/menu semantics intact.
  - Ensure active report remains highly visible in long menus.
- Acceptance criteria:
  - Scan time improves and users can orient quickly in nav.
- Validation:
  - Manual rapid-switch test across 10+ entries.
- Commit message:
  - `feat(ui): group nav sections for faster report discovery`

### Task 8.2: Add persistent page context header
- Status: [ ]
- Scope:
  - `main.js`
  - `style.css`
- Instruction to LLM:
  - Add a compact context row near top of report area showing:
    - current report
    - single vs compare mode
    - active slots
    - key active filters (when applicable)
  - Keep visual density high; avoid bulky banners.
- Acceptance criteria:
  - Context updates correctly as user navigates and switches mode.
- Validation:
  - Manual checks in single-log and A/B/C/D compare flows.
- Commit message:
  - `feat(ui): add persistent context header for report state`

### Task 8.3: Add skip link and landmark structure
- Status: [ ]
- Scope:
  - `index.html`
  - `style.css`
- Instruction to LLM:
  - Add keyboard-first skip link (`Skip to main report`).
  - Ensure semantic landmarks are explicit and stable (`header`, `nav`, `main`).
  - Skip link must be visible when focused.
- Acceptance criteria:
  - Keyboard users can bypass repeated navigation quickly.
- Validation:
  - Keyboard-only test from page load to main report content.
- Commit message:
  - `fix(a11y): add skip-to-main link and explicit landmarks`

---

## Sprint 9: Error Prevention and Recovery UX
Goal: prevent user mistakes and make recovery clear and fast.

### Task 9.1: Standardize inline validation and error copy
- Status: [ ]
- Scope:
  - `main.js`
  - `style.css`
- Instruction to LLM:
  - Normalize field/action validation patterns across major controls.
  - Error copy format must include:
    - what happened
    - what user should do next
  - Place error feedback near the triggering control.
- Acceptance criteria:
  - Errors are specific, actionable, and consistently styled.
- Validation:
  - Trigger known invalid states and confirm placement + message clarity.
- Commit message:
  - `feat(ux): standardize inline validation and error messaging`

### Task 9.2: Add recoverable risky-action flows
- Status: [ ]
- Scope:
  - `main.js`
  - `style.css`
- Instruction to LLM:
  - For destructive or slot-replacing actions, add either:
    - undo affordance, or
    - explicit confirmation with slot target details
  - Avoid ambiguous yes/no copy.
- Acceptance criteria:
  - Accidental destructive actions are recoverable or clearly confirmed.
- Validation:
  - Manual accidental-action tests in single and compare mode.
- Commit message:
  - `feat(ux): add recovery patterns for risky user actions`

### Task 9.3: Create shared empty/loading/error state templates
- Status: [ ]
- Scope:
  - `main.js`
  - `style.css`
- Instruction to LLM:
  - Build shared render helpers for empty/loading/error surfaces.
  - Apply to Start, Spots, RBN spots, and Competitor coach first.
  - Keep behavior stable; change presentation/copy consistency only.
- Acceptance criteria:
  - State transitions feel consistent across targeted reports.
- Validation:
  - Manual checks for empty, loading, and failure states per report.
- Commit message:
  - `refactor(ui): unify empty loading and error state templates`

---

## Recommended Execution Order (atomic)
1. Sprint 1 docs only.
2. Sprint 2 CSS tokens/primitives.
3. Sprint 3 Start + compare shell polish.
4. Sprint 4 report-specific UX.
5. Sprint 5 accessibility/responsive.
6. Sprint 6 tests/docs/release prep.
7. Sprint 7 UX metrics and instrumentation.
8. Sprint 8 IA/navigation efficiency improvements.
9. Sprint 9 error prevention and recovery UX.

## Minimal Validation Loop (run every sprint)
- `git status -sb`
- Manual load test:
  - Single-log mode
  - 4-slot compare mode
  - `Competitor coach`
  - `Spots` + `RBN spots`
  - `EXPORT PDF, HTML, CBR`
- Automated:
  - `./scripts/run-cq-api-browser-smoke.sh`

## Definition of Done
- All sprint tasks completed.
- No regressions in core reports.
- Compare mode still works in A/B/C/D.
- Accessibility baseline met for all new/updated controls.
- Docs and changelog updated for release.
