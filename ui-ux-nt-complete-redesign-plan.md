# Plan: SH6 UI/UX NT Complete Redesign

**Generated**: 2026-02-08  
**Branch**: `UI_UX_NT`  
**Estimated Complexity**: High

## Overview
Deliver a full UI redesign for SH6 while preserving existing scoring logic, CQ API behavior, and data correctness.

Approach:
- Keep static architecture (`index.html` + `style.css` + `main.js`).
- Build a new UX shell and report presentation layer in incremental, reversible slices.
- Prioritize desktop data density and fast compare workflows, while improving tablet/mobile usability.
- Avoid high-risk big-bang rewrite; use phased rollout and parity checks.

## Redesign Goals
1. Introduce a clearly modernized visual identity (not just polish).
2. Rework navigation and report discoverability for large menu depth.
3. Make compare mode the primary, first-class workflow.
4. Turn coach reports into actionable decision surfaces.
5. Improve readability/performance for very large tables/logs.

## Non-goals
- No contest score formula changes.
- No CQ API endpoint changes.
- No backend required for core redesign.
- No framework migration (React/Vue/etc.).

## Prerequisites
- Branch: `UI_UX_NT`.
- Existing assets and docs:
  - `main.js`
  - `style.css`
  - `index.html`
  - `design-system/MASTER.md`
  - `design-system/pages/*.md`
  - `design-system/QA_CHECKLIST.md`
- Validation:
  - `node --check main.js`
  - `./scripts/run-cq-api-browser-smoke.sh`

## Sprint 1: Redesign Foundation
**Goal**: Establish new visual language + shell scaffolding without breaking report rendering.

**Demo/Validation**:
- App visibly different on Start + Main pages.
- Existing reports still render and navigation still works.

### Task 1.1: Define NT design tokens and component contracts
- **Location**: `design-system/MASTER.md`, new `design-system/nt/` docs
- **Description**:
  - Add NT token set (colors, typography scale, spacing, surfaces, shadows, states).
  - Define component contracts: app shell, nav group, toolbar, card, dense table, compare panel, coach card.
- **Dependencies**: none
- **Acceptance Criteria**:
  - NT tokens are explicit and reusable.
  - Visual direction is concrete enough to implement without guesswork.
- **Validation**:
  - Manual review of docs completeness.

### Task 1.2: Add dual-theme shell support (`classic` vs `nt`)
- **Location**: `main.js`, `style.css`, `index.html`
- **Description**:
  - Add CSS namespacing strategy for NT styles.
  - Add UI version switch in state for controlled rollout.
- **Dependencies**: Task 1.1
- **Acceptance Criteria**:
  - Both shells can render without runtime errors.
  - NT shell can be enabled without affecting scoring logic.
- **Validation**:
  - `node --check main.js`

### Task 1.3: Implement NT app shell skeleton
- **Location**: `index.html`, `style.css`, optional light hooks in `main.js`
- **Description**:
  - Redesign top bar, left navigation container, content frame, status rail.
  - Keep all existing menu/report IDs and behavior.
- **Dependencies**: Task 1.2
- **Acceptance Criteria**:
  - Start/Main/Export reports open in new shell.
- **Validation**:
  - Manual: Start, Main, Export, Spots.

---

## Sprint 2: Information Architecture + Navigation Redesign
**Goal**: Reduce cognitive load in long menu and improve report discoverability.

**Demo/Validation**:
- Users can find reports faster via grouped nav + quick jump.

### Task 2.1: Group menu into workflow sections
- **Location**: `main.js` report model, `style.css`
- **Description**:
  - Group reports into sections: Load, Core, Geography, Rates, Spots, Compare/Coach, Export/Tools.
  - Keep backward-compatible report IDs.
- **Dependencies**: Sprint 1
- **Acceptance Criteria**:
  - Menu is grouped and collapsible with clear active state.
- **Validation**:
  - Manual scan + keyboard navigation.

### Task 2.2: Add quick-find report command/search
- **Location**: `main.js`, `style.css`
- **Description**:
  - Add inline report search box and keyboard shortcut (e.g., `/` or `Ctrl+K`).
- **Dependencies**: Task 2.1
- **Acceptance Criteria**:
  - Typing filters reports instantly and opens selected report.
- **Validation**:
  - Manual keyboard-only workflow.

### Task 2.3: Improve status and data-health panel
- **Location**: `main.js`, `style.css`
- **Description**:
  - Redesign data status block with severity hierarchy and context hints.
- **Dependencies**: Task 2.1
- **Acceptance Criteria**:
  - `cty/master/QTH/CQ API/spots` statuses are clearer at a glance.
- **Validation**:
  - Manual with healthy and degraded states.

---

## Sprint 3: Report Presentation System v2
**Goal**: Standardize report layout patterns and table readability across all menus.

**Demo/Validation**:
- Major report pages share consistent headings, actions, card rhythm, table behavior.

### Task 3.1: Create report layout primitives
- **Location**: `style.css`, `main.js` render helpers
- **Description**:
  - Add reusable primitives: section header, action row, context chips, note block, card grid.
- **Dependencies**: Sprint 1
- **Acceptance Criteria**:
  - Start/Main/Summary/Spots/Coach use consistent primitives.
- **Validation**:
  - Manual comparison across pages.

### Task 3.2: Introduce dense table system v2
- **Location**: `style.css`, `main.js` helper class hooks
- **Description**:
  - Standardize numeric alignment, sticky columns/headers, row state, striped contrast, compact density presets.
- **Dependencies**: Task 3.1
- **Acceptance Criteria**:
  - Table-heavy pages are visibly consistent and easier to scan.
- **Validation**:
  - Summary, Countries, Zones, Spots, Competitor Coach.

### Task 3.3: Add reusable empty/loading/error state components
- **Location**: `main.js`, `style.css`
- **Description**:
  - Replace ad hoc text-only states with consistent state blocks and actions.
- **Dependencies**: Task 3.1
- **Acceptance Criteria**:
  - All critical reports show coherent state messaging.
- **Validation**:
  - Force no-data/error paths manually.

---

## Sprint 4: Compare Workspace Redesign
**Goal**: Make 2/3/4-slot compare the fastest path for analysis.

**Demo/Validation**:
- Compare mode has persistent context, synchronized interactions, and strong slot identity.

### Task 4.1: Compare workspace header + global controls bar
- **Location**: `main.js`, `style.css`
- **Description**:
  - Add sticky compare toolbar with slot summary, lock/sync toggles, and quick actions.
- **Dependencies**: Sprint 2
- **Acceptance Criteria**:
  - User keeps compare context while scrolling.
- **Validation**:
  - Manual on Spots, Summary, Log.

### Task 4.2: Expand synchronized behavior controls
- **Location**: `main.js`
- **Description**:
  - Add per-report sync strategy: horizontal sync, shared filters, optional paired focus view.
- **Dependencies**: Task 4.1
- **Acceptance Criteria**:
  - Sync applies only where structures match and remains stable.
- **Validation**:
  - Spots, RBN Spots, Countries/Continents.

### Task 4.3: Compare insight strip
- **Location**: `main.js`, `style.css`
- **Description**:
  - Add top-level auto-insights (score delta, rate delta, multiplier delta) with direct links to relevant reports.
- **Dependencies**: Task 4.1
- **Acceptance Criteria**:
  - Users can jump from macro deltas to report details quickly.
- **Validation**:
  - Manual with 2 and 4 loaded logs.

---

## Sprint 5: Coach Experience Redesign
**Goal**: Convert coach reports from data-heavy to action-first surfaces.

**Demo/Validation**:
- Competitor Coach and Spots Coach provide prioritized actions with direct compare/load outcomes.

### Task 5.1: Competitor Coach dashboard mode
- **Location**: `main.js`, `competitor-coach.js`, `style.css`
- **Description**:
  - Redesign coach above-the-fold into cards: nearest chase targets, gap driver, confidence, next recommended action.
- **Dependencies**: Sprint 4
- **Acceptance Criteria**:
  - User gets a clear “what to do next” in <10 seconds.
- **Validation**:
  - Narrow cohort + broad cohort tests.

### Task 5.2: Spots Coach executive summary + drilldown handoff
- **Location**: `main.js`, `style.css`
- **Description**:
  - Extend new spots coach cards with explicit action paths to drilldown buckets/filters.
- **Dependencies**: Sprint 4
- **Acceptance Criteria**:
  - Coach cards map directly to clickable deep-dive sections.
- **Validation**:
  - Manual from card -> table -> filtered detail path.

### Task 5.3: Unified coach language and severity model
- **Location**: `main.js`, `style.css`
- **Description**:
  - Standardize terms and severity badges (critical/high/medium/opportunity/info).
- **Dependencies**: Task 5.1, Task 5.2
- **Acceptance Criteria**:
  - Coaching language is consistent across reports.
- **Validation**:
  - Manual copy and UI review.

---

## Sprint 6: Charts and Visual Analytics Upgrade
**Goal**: Upgrade visual analytics quality and comparability.

**Demo/Validation**:
- Charts are clearer, responsive, and compare-friendly.

### Task 6.1: Chart style system refresh
- **Location**: `style.css`, chart render helpers in `main.js`
- **Description**:
  - Define chart palettes, axes, gridline hierarchy, tooltip style, and compare color semantics.
- **Dependencies**: Sprint 3
- **Acceptance Criteria**:
  - All chart reports share unified visual language.
- **Validation**:
  - Manual across chart menus.

### Task 6.2: Compare overlays and normalized views
- **Location**: `main.js`
- **Description**:
  - Add optional normalized/percentage views to support fair compare across unequal log sizes.
- **Dependencies**: Task 6.1
- **Acceptance Criteria**:
  - Users can toggle between absolute and normalized metrics.
- **Validation**:
  - Manual compare with very different log sizes.

### Task 6.3: Export-safe chart rendering polish
- **Location**: `main.js`, `style.css`
- **Description**:
  - Ensure chart visuals remain readable in PDF/HTML export.
- **Dependencies**: Task 6.1
- **Acceptance Criteria**:
  - Exported artifacts preserve chart clarity and labels.
- **Validation**:
  - Manual export spot checks.

---

## Sprint 7: Accessibility, Responsiveness, and Performance Hardening
**Goal**: Make redesigned UI robust for real-world usage and large logs.

**Demo/Validation**:
- Smooth interaction with large logs and clear keyboard/mobile behavior.

### Task 7.1: Accessibility hardening pass
- **Location**: `main.js`, `style.css`, `index.html`
- **Description**:
  - ARIA, focus order, contrast, reduced motion, keyboard shortcuts and escape paths.
- **Dependencies**: Sprints 1-6
- **Acceptance Criteria**:
  - Critical flows are keyboard-complete and focus-visible.
- **Validation**:
  - Manual checklist from `design-system/QA_CHECKLIST.md`.

### Task 7.2: Responsive breakpoint pass (375/768/1024/1440)
- **Location**: `style.css`
- **Description**:
  - Refine NT shell and report layouts at mandatory breakpoints.
- **Dependencies**: Sprints 1-6
- **Acceptance Criteria**:
  - No blocked primary action at target breakpoints.
- **Validation**:
  - Manual viewport tests.

### Task 7.3: Rendering performance pass
- **Location**: `main.js`
- **Description**:
  - Optimize expensive DOM updates and large table rendering patterns.
  - Add lightweight instrumentation for render hotspots.
- **Dependencies**: Sprints 3-6
- **Acceptance Criteria**:
  - No notable regressions in report load and compare interactions.
- **Validation**:
  - Manual large-log checks + smoke.

---

## Sprint 8: Rollout, QA, and Release
**Goal**: Safely ship redesign with fallback and documentation.

**Demo/Validation**:
- NT redesign can be enabled confidently and reverted quickly.

### Task 8.1: Expand smoke checks for NT UI blocks
- **Location**: `tests/cq-api-browser-smoke.html`, `scripts/run-cq-api-browser-smoke.sh`
- **Description**:
  - Add non-brittle checks for core NT containers and coach surfaces.
- **Dependencies**: All previous sprints
- **Acceptance Criteria**:
  - Smoke catches major UI regressions.
- **Validation**:
  - Smoke test passes in CI/local.

### Task 8.2: Documentation and design-system refresh
- **Location**: `README.md`, `CHANGELOG.md`, `design-system/*`
- **Description**:
  - Document redesigned workflows and user-facing behavior changes.
- **Dependencies**: Task 8.1
- **Acceptance Criteria**:
  - Release docs reflect shipped UI.
- **Validation**:
  - Manual documentation pass.

### Task 8.3: Version bump and evidence capture
- **Location**: `main.js`, `docs/screenshots/ui-ux-nt/`
- **Description**:
  - Bump app version, capture before/after screenshots, and finalize release notes.
- **Dependencies**: Task 8.2
- **Acceptance Criteria**:
  - Release-ready state with evidence and clean changelog.
- **Validation**:
  - `git status -sb` clean after commit.

---

## Atomic Commit Plan (recommended)
1. `docs(plan): add UI_UX_NT complete redesign roadmap`
2. `feat(ui-nt): add nt token set and shell toggle`
3. `feat(ui-nt): implement redesigned app shell`
4. `feat(nav): grouped navigation and quick-find`
5. `feat(ui): report layout primitives and table system v2`
6. `feat(compare): redesign compare workspace toolbar and sync controls`
7. `feat(coach): redesign competitor and spots coach surfaces`
8. `feat(charts): upgrade chart visual system and normalized compare views`
9. `fix(a11y): accessibility, responsive, and performance hardening`
10. `test(ui): extend smoke coverage for NT redesign`
11. `docs(release): update docs, changelog, screenshots, and version`

## Testing Strategy
- Per commit:
  - `node --check main.js`
  - `./scripts/run-cq-api-browser-smoke.sh`
- Per sprint manual:
  - Single-log flow
  - 2-slot compare flow
  - 4-slot compare flow
  - Competitor coach narrow + broad cohort
  - Spots + RBN drilldown and coach cards
- Release gate:
  - Full `design-system/QA_CHECKLIST.md`
  - Screenshot evidence in `docs/screenshots/ui-ux-nt/`

## Risks and Mitigations
- **Risk**: Big-bang visual breakage across many reports.  
  **Mitigation**: Dual-shell rollout and phased migration.
- **Risk**: Compare regressions in complex reports.  
  **Mitigation**: Explicit per-report sync policy + smoke checks.
- **Risk**: Performance drop on huge logs.  
  **Mitigation**: Incremental render optimization and hotspot instrumentation.
- **Risk**: UI inconsistency during transition.  
  **Mitigation**: component contracts + checklist enforcement.

## Rollback Plan
- Keep classic shell as fallback until Sprint 8 release cut.
- Revert by sprint-level commits if regressions appear.
- If needed, disable NT mode by default while retaining merged internals.

## Locked Decisions (2026-02-08)
1. Visual direction: `hybrid` (technical + modern).
2. Typography: keep Verdana-based identity in NT track.
3. Rollout: ship behind feature toggle for one release, then flip default.
4. Include compact/dense mode toggle for tables.
5. Dark theme: defer to a later track.
