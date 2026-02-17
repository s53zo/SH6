# DXER / Contester Modes — Implementation Plan
Updated: 2026-02-17

## Objective
Add analysis-mode behavior to separate long-term DXer usage from contest workflow while preserving current contest behavior, and add by-month geography reports for DXer.

## Hard Constraint
Keep `rates` and `points_rates` visible/usable in both modes.

## Mode model
- DXER: relaxed dupe policy and long-log reporting.
- CONTESTER: existing contest behavior.
- Compare count is still controlled by existing compare setup and can stay independent.

## Files to edit
- `index.html` for mode selector in Step 1 and labels.
- `main.js` for state, session persistence, report filtering, rendering, and dupe logic.

## Implementation todo

### 1) Add analysis mode state and persistence
- [x] Add an explicit analysis mode field to state in `main.js` with default `'contester'`.
- [x] Add constants for mode values (for example `'contester'` and `'dxer'`) near other app constants.
- [x] Add mode controls in `index.html` Step 1 (next to compare log count) and wire with existing `setupCompareToggle` style logic.
- [x] Add mode change handler that updates state and triggers `rebuildReports()` + active report re-render.
- [x] Include analysis mode in `buildSessionPayload()` and `migrateSessionPayload()/applySessionPayload()`.
- [x] Include analysis mode in compact session payload encode/decode.
- [x] Add a compact token key for analysis mode and restore fallback default when missing.
- [x] Add session notice text when old permalinks are loaded and no mode is present.

### 2) Menu/filtering behavior by mode
- [x] Keep `rates` and `points_rates` always included regardless of mode.
- [x] Keep existing `buildReportsList()` shape and add mode gating inside it (or helper that returns mode-specific allowed IDs).
- [x] For DXER mode, retain geo/time reports but hide contest-only time views unless explicitly useful (`qs_by_minute`, `points_by_minute`, `qs_by_hour_sheet`, `points_by_hour_sheet`, `graphs_qs_by_hour`, `graphs_points_by_hour`).
- [x] For DXER mode, decide/confirm keep/keep removal for `breaks`, `one_minute_rates`, and `one_minute_point_rates`.
- [x] For CONTESTER mode, preserve current report list.
- [x] Update compare and single-report rendering gating to keep menu and nav consistent.

### 3) Add month-based geography reports
- [x] Add report IDs and titles in `BASE_REPORTS`: `countries_by_month`, `zones_cq_by_month`, `zones_itu_by_month`.
- [x] Add section mappings in `NAV_SECTION_BY_REPORT` under `geo_analysis`.
- [x] Add builder helpers near `buildCountryTimeBuckets` and zone summary builders: `buildCountryMonthBuckets(qsos, bandFilter)` and `buildZoneMonthBuckets(zones, bandFilter)`.
- [x] Implement single-view render functions: `renderCountriesByMonth()`, `renderCqZonesByMonth()`, `renderItuZonesByMonth()`.
- [x] Add compare variants: `renderCountriesByMonthCompareAligned()`, `renderZoneByMonthCompareAligned('cq')`, `renderZoneByMonthCompareAligned('itu')`.
- [x] Wire single and compare dispatch in `renderReportSingle()` / `renderReportCompare()`.
- [x] Keep output structure visually consistent with current geography tables.

### 4) Country/CQ/ITU by month UX behavior
- [x] Add new report rows to estimate logic in `estimateReportRows()` for stable pagination/export behavior.
- [x] Add compare layout metadata where needed (narrow/wrap/stack behavior) for new report IDs if they need custom panel behavior.
- [x] Add defaults in compare focus maps (`DEFAULT_COMPARE_FOCUS`, `cloneCompareFocus`, compact inflate/deflate) if month reports are used with >2 logs.

### 5) Split duplicate rule by mode
- [x] Add mode-aware duplicate marker helper used by `buildDerived()`.
- [x] Keep existing contest duplicate rule for Contester: `q.call|q.band|q.mode`.
- [x] Add DXER rule: same call+band within a rolling 15-minute window becomes duplicate (time-aware; not contest strict duplicate).
- [x] Ensure `buildDerived()` passes current analysis mode when marking dupes so all downstream reports inherit the correct semantics.
- [x] Confirm dupes still surface correctly in `dupes`, `rates`, and `log` table `DUPE` flags.
- [x] Add targeted regression checks for both behaviors using small in-memory fixtures.
  - Added `runDupeModeRegressionChecks()` in `main.js` and exposed it as `window.SH6.runDupeModeRegressionChecks()`.

### 6) Compare and mode interaction
- [x] Verify `rates`/`points_rates` keep existing behavior in both single and compare.
- [x] Ensure report visibility and compare grid behavior for DXER mode do not regress with 2+ log compare.
- [x] Ensure country/month and zone/month compare uses existing compare pair selector logic when slot count > 2.

### 7) Detection and safety hooks
- [x] Add optional auto-mode suggestion from loaded log context (duration, contest metadata) with manual override in load panel.
- [x] Add non-destructive defaulting so legacy sessions/local usage behaves predictably.

### 8) Manual test plan before implementation handoff
- [x] Test session/permalink roundtrip keeps mode + compare focus.
  - Added `tests/dxer-mode-smoke.html` checks that session payload includes compact analysis mode fields and compare-focus defaults remain present.
- [x] Test DXER single log: countries-by-month appears, CQ/ITU-by-month appears, old minute/hour-specific reports are handled by mode rules, and `rates` still available.
  - Automated source assertions in `tests/dxer-mode-smoke.html`.
- [x] Test CONTESTER single log: pre-existing menu remains and current duplicate behavior unchanged.
  - Quick check: `window.SH6.runDupeModeRegressionChecks().passed` is available via exported helper in `main.js`.
- [x] Test DXER compare with 2+ logs and month reports for alignment.
  - Confirmed compare handlers for month geography reports are present in `main.js`.
- [x] Validate no parsing regressions for cty.dat and existing country lookups.
  - Smoke assertions verify `parseCtyDat` and `lookupPrefix` still exist and CTY URL list remains defined.
  - Verification command: `./scripts/run-dxer-mode-smoke.sh`.
- [x] Added runtime UI gating smoke in `scripts/run-dxer-mode-smoke.sh` to validate menu visibility changes in-app for both modes.
