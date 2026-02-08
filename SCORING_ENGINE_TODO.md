# Scoring Engine + Point-Rate Integration TODO

Updated: 2026-02-08
Branch: `contest-rules`
Worktree: `/Users/simon/github/SH6-contest-rules`

## Mission
Implement deterministic contest scoring from `data/contest_scoring_spec.json` and integrate results into SH6 reports.

Requested UI direction already agreed:
- Show **claimed vs computed** score side-by-side in `Main`.
- Surface **medium-confidence assumptions** in `Main`.
- Add **point-rate views** analogous to current QSO-rate views.
- Keep compare behavior consistent with existing rate compare UX.

Product decisions confirmed:
- For unsupported contests, show **logged points only** when available.
- For unsupported contests, show explicit warning: rules for this contest are unknown.
- In `Main`, **Computed** and **Claimed** are separate rows (not combined).

## Ground Rules
- Work only in `/Users/simon/github/SH6-contest-rules`.
- Do not touch `cq_api` worktree/branch (another Codex is working there).
- Keep commits atomic and reviewable.
- Preserve existing report behavior unless explicitly changed in this plan.

## Known Code Map (current SH6)
- Report list and nav IDs: `main.js` (`BASE_REPORTS`).
- Current summary page: `renderMain()` in `main.js`.
- Core aggregation pipeline: `buildDerived(qsos)` in `main.js`.
- Contest metadata currently parsed from log headers: `deriveContestMeta(qsos)` in `main.js`.
- Archive source path is preserved on loaded log: `logFile.path` set in `applyLoadedLogToSlot(...)` in `main.js`.
- Current QSO-rate reference implementations:
  - `renderRates()`
  - `renderQsByMinute()`
  - `renderOneMinuteRates()`
  - compare-aligned renderers and focus controls in `renderReportCompare(...)` + `renderCompareFocusControls(...)`.
- Compare panel layout config: `renderComparePanels(...)` (`narrowReports`, `wrapReports`, `stackReports`, `quadReports`).
- Compare focus persistence map: `DEFAULT_COMPARE_FOCUS`, `compactCompareFocus`, `inflateCompareFocus`.

## Scoring Data Inputs Already Available
From parsed QSO/header data (existing):
- Per-QSO: `call`, `band`, `mode`, `ts`, `country`, `continent`, `cqZone`, `ituZone`, `grid`, `points` (logged), `raw` header fields.
- Per-log metadata: `contestMeta.contestId`, `contestMeta.category`, `contestMeta.claimedScore`, `contestMeta.stationCallsign`.
- Archive metadata: `logFile.path` (`<contest-folder>/<subfolder>/...`) for archive-loaded logs.

From new specs (already in repo):
- Rules: `data/contest_scoring_spec.json`
- Execution plan seed: `data/scoring_engine_plan.json`

## Required Runtime Definitions
Use these consistently in UI and exports:
- `claimed_score_header`: Value from Cabrillo/ADIF header (`CLAIMED_SCORE`-like fields).
- `logged_points_total`: Sum of existing per-QSO `q.points` (legacy dataset value).
- `computed_qso_points_total`: QSO points recomputed by rules.
- `computed_multiplier_total`: Multipliers after de-duplication and scope rules.
- `computed_score`: Final evaluated score formula.
- `score_delta_abs`: `computed_score - claimed_score_header`.
- `score_delta_pct`: `% delta` if claimed > 0.
- `confidence`: `high | medium | low` from matched rule set.
- `assumptions[]`: Human-readable notes for medium/low confidence rules.
- `unsupported_warning`: Warning text shown when no matching rule set is found.

## Contest Detection Strategy (must be deterministic)
Priority order for selecting scorer rule set:
1. Archive folder match from `logFile.path` top-level folder (`CQWW`, `CQWPX`, `ARRL`, etc.).
2. Fallback normalized `contestMeta.contestId` alias match.
3. If no match, mark scoring unsupported, show warning, and use `logged_points_total` when present.

Normalization requirements:
- Uppercase and trim all contest identifiers.
- Normalize punctuation and separators (`-`, `_`, spaces).
- Keep alias map in one place (single source of truth).

## Commit Plan (granular)

### Commit 00 - Track planning artifacts
Status: [x]
- Scope:
  - `data/scoring_engine_plan.json` (currently untracked)
  - `SCORING_ENGINE_TODO.md`
- Tasks:
  - Add/commit planning artifacts so progress starts from a clean baseline.
- Validation:
  - `git status -sb` shows clean tree after commit.
- Commit message:
  - `docs: add scoring engine plan and implementation todo`

### Commit 01 - Introduce scoring runtime skeleton
Status: [x]
- Scope:
  - `main.js` (or new `scoring_engine.js` + `index.html` include)
- Tasks:
  - Add runtime structures for:
    - rule registry
    - contest resolver
    - scoring result schema
  - Add unsupported fallback behavior:
    - `computed_score = null`
    - keep `logged_points_total` if available
    - include `unsupported_warning` message
- Validation:
  - App loads with no console errors.
  - Existing reports unchanged.
- Commit message:
  - `feat(scoring): add scoring runtime skeleton and unsupported fallback`

### Commit 02 - Rule loading and resolver wiring
Status: [x]
- Scope:
  - `main.js`
  - optional `data` loader helper if needed
- Tasks:
  - Parse/ingest `contest_scoring_spec` into runtime lookup.
  - Implement folder/alias-based resolver.
  - Emit resolver diagnostics in scoring result (`rule_id`, `confidence`, `assumptions`).
- Validation:
  - Manual check with archive logs from at least 3 folders resolves expected rule IDs.
- Commit message:
  - `feat(scoring): implement contest rule resolver from archive path and aliases`

### Commit 03 - Core scoring primitives
Status: [x]
- Scope:
  - `main.js`
- Tasks:
  - Implement primitives:
    - QSO point table evaluator
    - multiplier counters with scope (`once_total`, `per_band`, `per_band_per_mode`)
    - formula evaluator (`multiply`, `additive`, distance-ready hook)
  - Ensure primitive output is deterministic and pure.
- Validation:
  - Fixture-like in-code checks for known micro-cases (same country, same continent, different continent).
  - No regressions in existing reports.
- Commit message:
  - `feat(scoring): add core scoring primitives and formula evaluator`

### Commit 04 - Phase 1 scorers (high confidence)
Status: [x]
- Scope:
  - `main.js`
- Tasks:
  - Implement and register high-confidence non-bundle contests:
    - `cqww`, `cqwpx`, `cqwwrtty`, `cqwpxrtty`, `cq160`, `wae`, `ref`, `eudx`, `euhfc`, `zrs_kvp`, `rdxc`, `rf_championship_cw`, `ham_spirit`, `rcc_cup`, `rrtc`, `yuri_gagarin`
  - Include contest-specific multiplier keys and edge conditions from spec.
- Validation:
  - For each implemented contest: at least 1 known sample log computes successfully.
  - Rule dispatch correct by folder.
- Commit message:
  - `feat(scoring): implement phase-1 high-confidence contest scorers`

### Commit 05 - Integrate scoring into derived pipeline
Status: [x]
- Scope:
  - `main.js` (`buildDerived` return object)
- Tasks:
  - Add `derived.scoring` object with canonical fields.
  - Add `minutePointSeries` and `hourPointSeries` derived from computed/selected effective points.
  - Fallback policy for `effective points`:
    - use computed points when contest rules are supported
    - else use logged points only if they exist
  - Preserve existing `totalPoints` for backward compatibility until migration is complete.
- Validation:
  - Existing reports still render.
  - `derived.scoring` present for supported contests, explicit unsupported result for unknown contests.
- Commit message:
  - `feat(scoring): add scoring payload and point time series to derived data`

### Commit 06 - Main report side-by-side score block
Status: [x]
- Scope:
  - `main.js` (`renderMain`)
  - `style.css` (if needed)
- Tasks:
  - Replace single ambiguous score row with explicit rows:
    - Claimed (header)
    - Computed (rules)
    - Delta (abs + %)
    - QSO points (computed)
    - Multipliers (summary)
  - Show confidence badge and assumptions for medium/low confidence.
  - For unsupported contests:
    - show warning that rules are unknown
    - keep Computed row as `N/A`
    - still show Logged points row if available
- Validation:
  - `Main` clearly distinguishes claimed vs computed with separate rows.
  - Medium-confidence contest shows assumptions note in `Main`.
  - Unsupported contest shows warning and logged points fallback without fake computed score.
- Commit message:
  - `feat(ui): show claimed vs computed scoring details in main report`

### Commit 07 - Single-log point-rate reports
Status: [x]
- Scope:
  - `main.js` (`BASE_REPORTS`, render switch, new renderers)
- Tasks:
  - Add reports:
    - `points_rates` (windowed points/min and points/hour)
    - `points_by_minute` (minute heat table for points)
    - `one_minute_point_rates` (grouped one-minute point rates)
  - Reuse structure and styling patterns from QSO-rate reports for consistency.
- Validation:
  - New reports appear in menu and render correctly.
  - Band filter behavior consistent with corresponding QSO-rate reports.
- Commit message:
  - `feat(reports): add single-log point rate reports`

### Commit 08 - Compare mode for point-rate reports
Status: [x]
- Scope:
  - `main.js`
- Tasks:
  - Add compare-aligned renderers for new point reports.
  - Add focus controls for multi-slot compare where applicable.
  - Extend compare focus persistence mappings (compact/inflate/default).
  - Update `renderComparePanels` sets for correct narrow/stack/wrap layout.
- Validation:
  - A/B/C/D compare works for all new point reports.
  - Focus selection persists in session/permalink like current minute-rate views.
- Commit message:
  - `feat(compare): add aligned compare views for point rate reports`

### Commit 09 - Phase 2 scorers (medium confidence)
Status: [x]
- Scope:
  - `main.js`
- Tasks:
  - Implement medium-confidence non-bundle scorers:
    - `darc_fieldday`, `darc_wag`, `ww_pmc`, `ok_om_dx`, `rda`, `wed_minitest_40m`, `wed_minitest_80m`
  - Encode assumptions explicitly into `derived.scoring.assumptions`.
- Validation:
  - Medium contests compute and surface assumptions in `Main`.
- Commit message:
  - `feat(scoring): implement phase-2 medium-confidence contest scorers`

### Commit 10 - Bundle resolvers (ARRL and EU VHF)
Status: [x]
- Scope:
  - `main.js`
- Tasks:
  - Implement subevent dispatch for:
    - `arrl_family_bundle`
    - `eu_vhf_bundle`
  - Select scorer based on normalized header slug and/or folder path.
- Validation:
  - Bundle logs route to correct sub-scorer and return deterministic result.
- Commit message:
  - `feat(scoring): add bundle resolver dispatch for ARRL and EU VHF families`

### Commit 11 - UX polish, export, and final consistency
Status: [ ]
- Scope:
  - `main.js`
  - `style.css`
  - optionally `CHANGELOG.md`
- Tasks:
  - Ensure export includes new score rows and new point-rate reports where selected.
  - Ensure unsupported warning + logged-points fallback is preserved in export.
  - Final cleanup of naming consistency (`points`, `score`, `mults`).
- Validation:
  - Manual smoke test: local upload, archive load, demo load.
  - PDF/HTML export includes expected scoring sections.
- Commit message:
  - `feat(ui): finalize scoring integration and report/export consistency`

## Manual QA Checklist (run after each major phase)
Status: [ ]
- Load local Cabrillo and ADIF logs.
- Load archive log and verify resolver uses archive folder.
- Compare mode with A/B and A/B/C for:
  - `rates` and point-rate counterparts.
  - `qs_by_minute` and point-minute counterpart.
- Change band filter and confirm score/rates update consistently.
- Confirm `Main` always shows explicit source of score values.
- Confirm unsupported contest shows warning, keeps computed as `N/A`, and shows logged points when present.

## Risk Register
- Contest alias mismatches due to inconsistent `CONTEST_ID` headers.
- Bundle dispatch ambiguity for ARRL/EU family events.
- Confusion between logged `q.points` and recomputed points.
- Compare focus persistence collisions if keys are not unique.
- Large logs: added point series should not noticeably degrade rendering performance.

## Definition of Done
- Deterministic computed scoring for all planned rule sets.
- `Main` shows separate rows for Claimed and Computed, with confidence/assumptions.
- Unsupported contests show explicit warning and logged-points fallback when available.
- Point-rate reports available in single and compare modes.
- Commit history follows this checklist and is easy to audit.
- Working tree clean after final commit/push.
