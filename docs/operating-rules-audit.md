# Operating rules audit — v6.3.45

## Coverage and official verification

Quality & Review → **Operating rules audit** appears for a loaded CQWW/CQ WPX CW or SSB M/S or M/2 category. It is a band-change/residence audit, not a general compliance certificate. Other contests, RTTY, SOAB, operating/off-time limits and penalties are outside scope. Unsupported editions and missing evidence are explicitly not checked.

Annual editions were verified on **2026-10-29**, including every intervening year in each enabled range. CW and SSB share the restrictions below. Profiles resolve to the actual log year and link that year's official document; future years are not inferred.

| Category | Verified editions | Restriction | Scope |
| --- | --- | --- | --- |
| CQWW M/S | 2000–2026 | 10-minute residence | Independent RUN 0 / MULT 1 |
| CQWW M/2 | 2002–2026 | 8 changes / UTC clock hour | Each declared signal independently |
| CQ WPX M/S | 2009 | 10-minute residence | Independent RUN 0 / MULT 1; new prefixes across the whole log |
| CQ WPX M/S | 2010–2026 | 10 changes / UTC clock hour | Whole station, not per radio |
| CQ WPX M/2 | 2003–2026 | 8 changes / UTC clock hour | Each declared transmitter independently |

The [annual source inventory](operating-rules-editions.json) records official URLs, reviewed document SHA-256 values, enabled categories and limitations for all 54 editions inspected (2000–2026 for each contest). It is evidence metadata, not a runtime network dependency. Tests match every enabled year/category to its inventory entry. Rule profiles remain separate from scoring.

Historical interpretation:

- CQWW's [official contest history](https://cqww.com/history.htm), written in July 2000 with later additions, explains the ten-minute periods for both stations. It supplements the 2000–2010 annual wording; independent clocks are explicit in the annual text from 2011 onward. M/2 first appears in 2002. Profiles do not simulate historical penalties or category reclassification.
- The [2009 WPX director's explanation](https://cqwpx.com/blog/survey-results-3-multi-single/) confirms separate RUN/MULT timers. The 2009 annual rules define first-contact starts and functional IDs; multiplier eligibility is a new prefix **anywhere in the contest**, not a new country/zone or a prefix on a new band. The existing analysis core supplies resolved prefixes. Missing prefixes and same-minute ties remain uncertain.
- WPX M/S changes in the 2010 annual rules: the multiplier exception disappears and the station gets ten changes per clock hour. WPX M/2 has eight per transmitter from its first listed edition in 2003.
- The official 2016 WPX archive contains a contest announcement, not the full numbered rules. It explicitly confirms 10/8 changes per hour. Clock-hour boundary interpretation is supplemented by the official FAQ and is identified as such in the profile's source section. Other enabled annual editions explicitly state the clock-hour convention.
- CQWW before 2000, WPX M/S before 2009, and future editions remain not checked. Older WPX M/S rules exist, but required signal-role/timing semantics have not been fully verified; SH6 does not invent assignments for those logs. M/2 is not applied before its introduction. The WPX 2000 PDF is scanned and is inventoried without enabling categories.
- Historical country/entity data can differ from today's resources. Multiplier eligibility remains based on the resolved evidence available to SH6, with unresolved evidence shown as uncertain; this is not a historical adjudication service.

Primary sources:

- [CQWW rules](https://cqww.com/rules/), [CQWW FAQ](https://cqww.com/rules/faq.htm), [CQWW Cabrillo](https://cqww.com/cabrillo.htm).
- [CQ WPX rules](https://cqwpx.com/rules/), [CQ WPX FAQ](https://cqwpx.com/rules_faq.htm), [CQ WPX Cabrillo](https://cqwpx.com/cabrillo.htm).

CQWW FAQ explicitly assigns a boundary change to the destination contact’s hour. WPX FAQ’s 12:59 → 13:00 example confirms the same interpretation. Both specifications define excluded X-QSO records as ignored in the submitted log, while the FAQs reserve adjudication against abuse. SH6 therefore does not award excluded contacts credit or use them as definite clock starts: they interrupt confidence in affected counts. Residence timing remains provisional if X-QSO exists, preserving the prior conservative policy.

The WPX 2013 archived rules have a 2013 heading/magazine issue but a 2012 date-line typo. The current WPX web page is headed 2026 but its SSB date line contains a 2025 typo. Profiles use its explicit 2026 edition and operating restrictions; this audit does not validate contest start/end dates.

## Architecture and compatibility

- `modules/audit/profiles.js`: immutable, source-backed category/edition profiles; exact CW/SSB contest IDs; modern and legacy M/S/M/2 declarations. Conflicting declarations are not guessed away.
- `modules/audit/evidence.js`: timestamp, mode, band, stream and source-provenance validation; malformed/unparsed/X-QSO coverage. Source contacts are referenced, never edited.
- `modules/audit/band-changes.js`: station/per-stream clock-hour counting and conservative lower bounds.
- `cqww-ms-audit.js`: compatibility facade and existing CQWW residence checker. Both `SH6OperatingAudit` and `SH6CqwwMsAudit` expose the same API. Missing dependencies leave the optional audit unavailable, not the entire app unusable.
- `modules/audit/view.js`: shared presentation; `main.js` supplies complete per-slot originals and navigation.

The public report ID remains **`cqww_ms_audit`**. Only its visible title changes; no session, perspective or permalink format migration is needed. Perspectives continue using their existing local store, separate from session files. Tests restore a legacy-ID perspective after loading a saved four-log session.

Every audit uses the slot’s full source data and metadata, independent of global band/radio/year/month, log search/time and comparison locks. Scores, multiplier scoring rules and inferred QSO styles are not altered. A scoring model’s availability does not establish operating-rule coverage.

## Counting and uncertainty

All profiles use UTC whole-minute evidence. A same-band contact does not reset a residence clock or add a band change. A → B → A counts two changes; the starting band is not itself a change. Prior band history crosses hours and midnight. M/2 allowances cannot be pooled; WPX M/S ignores physical-radio identifiers for station-wide counting.

For unordered multi-band minutes, a small dynamic program retains possible ending bands and the minimum changes required by the observed bands. It does not invent line order, even if the source contains seconds. A same-band duplicate adds no change; a band switch in a duplicate QSO remains logged activity evidence. The test suite independently enumerates tiny permutations to verify the lower-bound formula.

Missing required IDs, invalid bands/modes/times, skipped raw records and excluded contacts interrupt certainty. A barrier can precede or follow ordinary contacts in the same minute, so its outgoing band is not assumed at an hour boundary. Unknown-time evidence makes hours uncertain. Missing IDs in one M/2 contact can affect either stream; WPX M/S does not require IDs. ADIF radio numbers are never accepted as per-stream functional assignments; a station-wide WPX M/S count can use ADIF time/band evidence without assigning streams.

Hourly output distinguishes **Within logged limit**, **At limit**, **Uncertain**, **Over limit**, and **Over limit (minimum)**. An uncertain count is labelled `≥`, not exact. A minimum above the allowance demonstrates an excess in the known sequence, but the exact first excess contact may precede the displayed minimum crossing. No within-limit conclusion is made for incomplete hours. This does not certify unlogged activity.

The shared residence checker keeps independent first-contact clocks and source-QSO links. Only an established new multiplier starts a MULT band period (country/zone per band for CQWW; station-wide prefix for WPX 2009). Questionable eligibility stays a separate concern; it cannot create a phantom 01:39 clock against S53M’s V26B at 01:44. Signal assignments are never silently rewritten. The removed speculative same-minute and inferred RUN/MULT overlap warnings remain absent.

## Presentation and navigation

The report shows contest/mode, edition, category, restriction, evidence coverage and uncertainty. Residence profiles show bracketed locks, period starts, earliest next-band times and anchor contacts. Change profiles show hourly counts and allowances, with expandable preceding band sequences. “Hour sequence” opens the correct disclosure and moves focus; Enter repeats stay on the opener until keyup to avoid toggling the target closed.

Every finding’s evidence and QSO buttons open the correct slot’s ±15-minute window across all bands and signal IDs. The original event remains identified. Missing-time cases fall back to the exact contact. Log exports retain that context. Supporting methods and official links are in a collapsed bottom More; essential limitations stay visible.

Static HTML/PDF expands disclosures, preserves tables, clocks, sequence evidence and source references, and removes inert controls. Printed comparison panels are stacked by log with wrapping tables rather than clipped side-by-side columns.

## Verification

Required commands (browser prerequisites: agent-browser and, for PDF QA, Chromium and Poppler):

```sh
node tests/cqww-ms-audit.test.mjs
node tests/operating-rules-audit.test.mjs
SH6_UI_SMOKE_PAGE=operating-rules-audit-ui-smoke.html bash scripts/run-radio-ui-smoke.sh
SH6_UI_SMOKE_PAGE=cqww-ms-audit-ui-smoke.html bash scripts/run-radio-ui-smoke.sh
SH6_UI_SMOKE_PAGE=report-cleanup-normalizer-smoke.html bash scripts/run-radio-ui-smoke.sh
SH6_UI_SMOKE_PAGE=export-runtime-smoke.html bash scripts/run-radio-ui-smoke.sh
SH6_UI_SMOKE_PAGE=scoring-regression-smoke.html bash scripts/run-radio-ui-smoke.sh
SH6_UI_SMOKE_PAGE=operating-time-ui-smoke.html bash scripts/run-radio-ui-smoke.sh
node tests/operating-time.test.mjs
node scripts/check-protected-scoring-baseline.mjs
bash scripts/run-session-codec-smoke.sh
bash scripts/run-navigation-runtime-smoke.sh
bash scripts/run-permalink-v3-browser-smoke.sh
```

Model coverage includes all four profiles, mode/edition/category gating, exact 8/9 and 10/11 boundaries, A→B→A, cross-hour/midnight carry, unordered minutes, malformed/missing streams and timestamps, reversed input immutability, duplicates, X-QSO and unparsed barriers, unknown country/zone data, V26B, lower-bound first-excess wording and missing optional dependencies.

Browser coverage includes both modes for every profile, single/two/four slots, mixed categories, filters, keyboard disclosures, at-limit versus over-limit, ±15-minute identity/context, static exports, source immutability during audit rendering, saved sessions and legacy-ID perspectives. Existing filtering can recompute its own derived fields; immutability assertions isolate audit rendering rather than attributing pre-existing filter recalculation to the audit.

### Initial v6.3.43 verification results

- Shared four-profile model suite and existing CQWW residence/V26B suite: PASS.
- Full-app shared audit: **56 checks**, zero failures or uncaught application errors; includes both modes, independent M/2 streams, invalid-source-time fallback, filters, four-slot context, saved session and legacy-ID perspective restoration.
- Existing CQWW UI: 15 checks; cleanup normalizer: 14; static export runtime: 25; operating-time UI: 30; navigation: 22. All PASS.
- Scoring regression: 149 checks PASS. Protected baseline: 27 rules and 27 alias sets unchanged. Operating-time model and classifier regressions PASS.
- Final checks against the concurrent local CodeQL-fix commit also pass: scoring regression, both audit models, formula-security tests and source-status security tests. That commit is preserved unchanged beneath the audit release.
- Session codec: 70 checks PASS. v3 and v2 full-app permalink restoration, copy path and invalid-link notice PASS.
- Read-only local S53M Cabrillo validation: V26B 01:44 has no finding; parsed contacts and scoring remain byte-for-byte identical after audit execution. No private log is committed.
- Four-profile static PDF: all **four final pages visually inspected**. The print override was strengthened after detecting an inherited comparison-table width conflict; final tables, sequences, source anchors and expanded methods are readable without clipping.
- Three independent SWE reviews completed: rule/evidence correctness, architecture/regressions, and UI/accessibility/comparison/export. Confirmed issues were fixed and reverified: unknown-time status, uncertain first-excess wording, optional dependency safety, hour-sequence opening/focus, and scoped methods/print layout. No unresolved review findings remain.

The machine’s default Homebrew Node stopped launching during validation because of a missing `libsimdjson` dependency. Tests were run using the existing bundled Node v24.21.0 by prefixing `PATH=/Applications/ChatGPT.app/Contents/Resources/cua_node/bin:$PATH`; no system installation was repaired or changed.

Temporary browser logs and PDF QA files are under `/tmp`, not shipped assets or deliverables. Release commits are pushed only when explicitly requested.

## v6.3.45 historical coverage verification

- Annual inventory: 54 official editions inspected; 94 enabled category/year combinations, each tested in CW and SSB (188 cases). The category introduced later or with unverified timing semantics stays disabled.
- Shared model and historical regressions cover 2009 prefix newness across bands, independent clocks, missing prefixes, same-minute ties, phantom clock prevention and the 2010 mechanism change. Existing CQWW/V26B tests remain unchanged apart from unsupported-year fixture dates.
- Full-app audit browser suite: 82 checks, including all four categories in 2025, earliest supported editions, WPX 2009 prefix evidence/navigation, the 2010 change, unsupported older logs and mixed historical comparison exports.
- Version/cache references and changelog are updated together; unrelated working-tree deletions are preserved.
- Historical release regression checks also pass: legacy CQWW UI (15), scoring browser (149), static-export runtime, operating-time model, both security suites and protected scoring (27 rules/27 alias sets). The legacy UI fixture now waits for Start initialization before uploading, eliminating an observed startup race.
