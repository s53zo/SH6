# Plan: UI/UX Strong Visual + Compare + Coach + Spots

**Generated**: 2026-02-08  
**Estimated Complexity**: High

## Overview
Deliver the next SH6 UI wave focused on four workstreams:
1. Stronger visual pass (typography hierarchy, section separation, denser-clean tables).
2. Compare UX pack (sticky compare headers, synchronized horizontal scrolling, clearer slot identity).
3. Competitor Coach v2 (closest rivals, gap-driver explanation, quick action hints).
4. Spots Coach layer (best hour/band guidance, spotter reliability highlights, missed multiplier opportunities surfaced as top cards).

Approach:
- Keep static HTML/CSS/JS architecture.
- Reuse current report functions in `main.js`.
- Implement in thin vertical slices with one objective per commit.
- Keep CQ API/scoring logic unchanged unless explicitly required for display-only aggregations.

## Prerequisites
- Branch: `UI_UX`
- Existing files:
  - `main.js`
  - `style.css`
  - `index.html`
  - `tests/cq-api-browser-smoke.html`
  - `scripts/run-cq-api-browser-smoke.sh`
- Existing design docs:
  - `design-system/MASTER.md`
  - `design-system/pages/*.md`
  - `design-system/QA_CHECKLIST.md`

## Scope and Non-goals
### In scope
- UI hierarchy and readability upgrades.
- Compare view navigation ergonomics.
- Coaching insights quality in existing competitor/spots reports.
- Additional UI smoke assertions.

### Out of scope
- Contest score formula changes.
- CQ API endpoint schema changes.
- New backend/server requirement.
- Framework migration.

---

## Sprint 1: Strong Visual Pass
**Goal**: Make UI differences obvious and intentional while preserving report behavior.

**Demo/Validation**:
- Start page and Main report visually show stronger hierarchy.
- Table readability improved in single and compare modes.

### Task 1.1: Typography and heading scale uplift
- **Location**: `style.css`
- **Description**:
  - Increase separation between page title, section title, card title, and table labels.
  - Introduce explicit typography utility classes for report headings and note text.
- **Dependencies**: none
- **Instruction to LLM**:
  - Update typographic scales without changing data semantics.
  - Ensure dense tables remain compact but no longer visually flat.
- **Acceptance Criteria**:
  - Headings and key section boundaries are immediately distinguishable.
  - No overflow regressions on existing report headers.
- **Validation**:
  - Manual: `START`, `MAIN`, `SPOTS`, `COMPETITOR COACH`.
  - `./scripts/run-cq-api-browser-smoke.sh`

### Task 1.2: Section separators + card visual rhythm
- **Location**: `style.css`, optional tiny hook classes in `main.js`
- **Description**:
  - Add clearer spacing and separators between report blocks.
  - Standardize card interiors (padding/notes/action rows).
- **Dependencies**: Task 1.1
- **Instruction to LLM**:
  - Keep color palette aligned with current SH6 identity; avoid noisy gradients.
  - Improve scanability for long reports.
- **Acceptance Criteria**:
  - Distinct visual grouping of summary cards vs large tables.
- **Validation**:
  - Manual comparison of before/after screenshots.

### Task 1.3: Dense table modernization pass
- **Location**: `style.css`
- **Description**:
  - Improve column alignment, header contrast, zebra consistency, selected-row styling.
  - Ensure numerical columns remain easy to compare.
- **Dependencies**: Task 1.2
- **Instruction to LLM**:
  - Focus on readability and compare scanning speed.
- **Acceptance Criteria**:
  - Table-heavy pages require less horizontal/vertical eye effort.
- **Validation**:
  - Manual: `SUMMARY`, `RATES`, `COUNTRIES`, `SPOTS`, `COMPETITOR COACH`.

### Task 1.4: Commit + checkpoint evidence
- **Location**: `docs/screenshots/ui-ux/`
- **Description**:
  - Capture Start/Main before/after screenshots for visual pass.
- **Dependencies**: Tasks 1.1-1.3
- **Acceptance Criteria**:
  - Evidence images added and referenced in checklist.
- **Validation**:
  - Files present in `docs/screenshots/ui-ux/`.

---

## Sprint 2: Compare UX Pack
**Goal**: Make compare mode faster to use and easier to read under 2/3/4-slot workflows.

**Demo/Validation**:
- User can keep context while scrolling horizontally.
- Slot identity remains obvious across report pages.

### Task 2.1: Sticky compare header bar
- **Location**: `main.js`, `style.css`
- **Description**:
  - Add sticky compare header region with slot labels and key meta at top of each compare panel.
- **Dependencies**: Sprint 1
- **Instruction to LLM**:
  - Keep sticky behavior subtle and non-obstructive.
- **Acceptance Criteria**:
  - Slot header remains visible while scrolling report content.
- **Validation**:
  - Manual in compare mode for at least 3 report types.

### Task 2.2: Synchronized horizontal scroll groups
- **Location**: `main.js`, `style.css`
- **Description**:
  - Add opt-in synchronization for paired compare tables where structure matches.
  - Do not force sync for independent raw listing sections.
- **Dependencies**: Task 2.1
- **Instruction to LLM**:
  - Reuse existing compare-panel wrappers; bind sync only to marked groups.
- **Acceptance Criteria**:
  - Scrolling one aligned table keeps paired table in sync for eligible sections.
- **Validation**:
  - Manual on `SPOTS`, `RBN SPOTS`, at least one classic compare table report.

### Task 2.3: Slot identity reinforcement
- **Location**: `main.js`, `style.css`
- **Description**:
  - Improve visual labels for Log A/B/C/D across compare surfaces.
  - Ensure color coding + text label remains accessible (not color-only).
- **Dependencies**: Task 2.1
- **Instruction to LLM**:
  - Add explicit slot badges in compare heads and important action rows.
- **Acceptance Criteria**:
  - No ambiguity which slot a table or action belongs to.
- **Validation**:
  - Manual through 4-slot permalink flow.

### Task 2.4: Commit + smoke update
- **Location**: `tests/cq-api-browser-smoke.html` (if needed)
- **Description**:
  - Add lightweight checks for compare shell class presence/labels.
- **Dependencies**: Tasks 2.1-2.3
- **Acceptance Criteria**:
  - Smoke test still passes; compare labels not regressed.
- **Validation**:
  - `./scripts/run-cq-api-browser-smoke.sh`

---

## Sprint 3: Competitor Coach v2
**Goal**: Shift from data table only to actionable competitor coaching.

**Demo/Validation**:
- Competitor coach explains "who to chase" and "what to improve first".

### Task 3.1: Closest rivals module
- **Location**: `main.js`, optional helper in `competitor-coach.js`
- **Description**:
  - Compute and display top nearest rivals by score gap around current station.
  - Include quick shortlist card above table.
- **Dependencies**: Sprint 2
- **Instruction to LLM**:
  - Keep model local and deterministic; no new API required.
- **Acceptance Criteria**:
  - User sees 3-5 closest rivals instantly when cohort exists.
- **Validation**:
  - Manual on at least 2 contests (one broad cohort, one narrow).

### Task 3.2: Gap-driver explanation
- **Location**: `main.js`, `competitor-coach.js`
- **Description**:
  - Add explanation of whether QSO volume or multipliers dominate score gap.
  - Present as concise ranked bullets.
- **Dependencies**: Task 3.1
- **Instruction to LLM**:
  - Avoid generic wording; include measurable numbers.
- **Acceptance Criteria**:
  - At least one specific, numeric recommendation shown when leader exists.
- **Validation**:
  - Manual with different category scopes.

### Task 3.3: Quick action hints
- **Location**: `main.js`, `style.css`
- **Description**:
  - Add actionable hints near load controls (e.g., "Load nearest rival to Log B").
  - Improve empty-state suggestions when cohort size is very small.
- **Dependencies**: Task 3.2
- **Instruction to LLM**:
  - Keep hints short and tied to current filter context.
- **Acceptance Criteria**:
  - User gets next action without reading full table.
- **Validation**:
  - Manual with empty, single-row, and multi-row cohorts.

### Task 3.4: Commit + focused checks
- **Location**: `tests/cq-api-browser-smoke.html` optional text checks
- **Description**:
  - Add minimal string-presence checks for new coach summary block.
- **Dependencies**: Tasks 3.1-3.3
- **Acceptance Criteria**:
  - Coach v2 key blocks render without JS errors.
- **Validation**:
  - `node --check main.js`
  - `./scripts/run-cq-api-browser-smoke.sh`

---

## Sprint 4: Spots Coach Layer
**Goal**: Surface high-value coaching cards from existing spots data.

**Demo/Validation**:
- Top cards answer: when to call CQ, which spotters are reliable, where multipliers are being missed.

### Task 4.1: Best hour/band recommendation card
- **Location**: `main.js`, `style.css`
- **Description**:
  - Build a compact recommendation card from existing band/hour + conversion data.
  - Include confidence note based on sample size.
- **Dependencies**: Sprint 3
- **Instruction to LLM**:
  - Use current derived stats; no extra network calls.
- **Acceptance Criteria**:
  - Card shows top 1-3 candidate hour/band windows with rationale.
- **Validation**:
  - Manual in `SPOTS` and `RBN SPOTS`.

### Task 4.2: Spotter reliability top-card summary
- **Location**: `main.js`, `style.css`
- **Description**:
  - Promote most actionable spotter reliability metrics to top summary cards.
  - Keep detailed table below.
- **Dependencies**: Task 4.1
- **Instruction to LLM**:
  - Prioritize readability; keep card count small.
- **Acceptance Criteria**:
  - User can identify high-value spotters without scrolling deep.
- **Validation**:
  - Manual on logs with enough spot volume.

### Task 4.3: Missed multiplier opportunities card
- **Location**: `main.js`, `style.css`
- **Description**:
  - Surface missed mult opportunities as a priority card with simple action framing.
- **Dependencies**: Task 4.1
- **Instruction to LLM**:
  - Reuse current missed-mult computation; summarize top opportunities.
- **Acceptance Criteria**:
  - Card highlights most impactful missed opportunities.
- **Validation**:
  - Manual on one high-volume CQWW log.

### Task 4.4: Cohesive coach layout integration
- **Location**: `main.js`, `style.css`
- **Description**:
  - Reorder Spots sections so coaching cards appear near top, details below.
- **Dependencies**: Tasks 4.1-4.3
- **Instruction to LLM**:
  - Keep existing deep-dive tables available and intact.
- **Acceptance Criteria**:
  - Coach cards are immediately visible after load.
- **Validation**:
  - Manual in single + compare mode.

---

## Sprint 5: Final QA + Release Preparation
**Goal**: Validate and package changes safely.

**Demo/Validation**:
- Stable UI, passing smoke, updated docs/changelog, screenshot evidence.

### Task 5.1: Extend smoke checks for new UI surfaces
- **Location**: `tests/cq-api-browser-smoke.html`
- **Description**:
  - Add non-brittle presence checks for new compare/coach card blocks.
- **Dependencies**: Sprint 4
- **Acceptance Criteria**:
  - Smoke catches regressions in major new UI blocks.
- **Validation**:
  - `./scripts/run-cq-api-browser-smoke.sh`

### Task 5.2: Update release docs
- **Location**: `README.md`, `CHANGELOG.md`, `design-system/QA_CHECKLIST.md`
- **Description**:
  - Add concise notes for new compare/coach UX capabilities.
- **Dependencies**: Task 5.1
- **Acceptance Criteria**:
  - Docs reflect delivered behavior.
- **Validation**:
  - Manual read-through.

### Task 5.3: Version bump and evidence capture
- **Location**: `main.js`, `docs/screenshots/ui-ux/`
- **Description**:
  - Bump app version and capture before/after images for Start, Compare, Competitor Coach, Spots Coach cards.
- **Dependencies**: Task 5.2
- **Acceptance Criteria**:
  - Version/changelog aligned with shipped UI features.
- **Validation**:
  - Final smoke + git clean state check.

---

## Commit Plan (atomic sequence)
1. `feat(ui): strengthen typography hierarchy and section rhythm`
2. `feat(ui): modernize dense table readability`
3. `feat(compare): add sticky compare headers and slot identity cues`
4. `feat(compare): add synchronized horizontal scrolling for aligned panels`
5. `feat(coach): add closest rivals summary and gap-driver hints`
6. `feat(coach): add quick action guidance and improved empty states`
7. `feat(spots): add best hour-band and spotter reliability coach cards`
8. `feat(spots): add missed multiplier opportunities summary card`
9. `test(ui): extend smoke checks for compare and coach blocks`
10. `docs: update UI release docs and checklist`
11. `chore(release): bump version and capture UI evidence`

## Testing Strategy
- Per commit:
  - `node --check main.js`
  - `./scripts/run-cq-api-browser-smoke.sh`
- Per sprint manual verification:
  - Single-log path
  - 2-slot compare path
  - 4-slot compare path
  - Competitor coach (narrow + broad cohort)
  - Spots/RBN spots with drilldown and coach cards
- Release gate:
  - `git status -sb` clean
  - screenshots stored under `docs/screenshots/ui-ux/`

## Potential Risks & Gotchas
- Sticky headers can clash with existing map/fullscreen report modes.
  - Mitigation: scope sticky behavior to compare report wrappers only.
- Scroll sync can become noisy on non-isomorphic tables.
  - Mitigation: enable sync only on explicit matched container groups.
- Coach summaries can feel wrong on tiny cohorts.
  - Mitigation: sample-size thresholds + confidence notes.
- Additional cards can push key tables too far down.
  - Mitigation: keep coach card count limited and collapsible where needed.

## Rollback Plan
- Revert by feature commit group (Sprints 1-5 are independent).
- If compare regressions appear, disable sync/sticky hooks first while keeping visual improvements.
- Keep smoke checks; remove only brittle assertions if necessary.

## Assumptions used
- No backend/server dependency will be introduced.
- Existing CQ API and scoring payloads remain unchanged.
- We optimize for desktop-first data density while preserving mobile usability.
