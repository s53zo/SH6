# SH6 report cleanup — v6.3.39

Branch: `Cleanup`. Presentation-only changes; no scoring, classification, parser or archive changes. No merge, deployment or push authorized.

## Policy and implementation

- Primary data, units, active context, filters and actionable warnings stay visible.
- Repeated titles, workflow instructions and irrelevant score/multiplier banners are removed.
- Useful methodology goes into native, default-closed bottom **More** disclosures. Per-log notes retain their scope; shared comparison controls have their own report-level More.
- `modules/reports/cleanup.js` only relocates explicitly marked notes and known method disclosures. It does not guess from arbitrary prose or sweep `.export-note`, which also contains headings, data and errors. Empty/nested More wrappers are removed; normalization is idempotent.
- Comparison grids, log identities and controls remain. Settings changes preserve focus/open disclosure state on the same report; navigation starts closed. Time locks remain visible.
- Static exports expand methods, discard inert comparison controls and empty disclosures, and retain external references.
- Narrow layouts stack navigation above reports and bound navigation height. Data tables may still scroll within their panels.

## Audit scope

The supplied public permalink restores EF8R (12,991 QSOs) and CQ9A (11,520 QSOs). The live application behind the s53m iframe was browsed read-only across all 52 reports available in that session. Local verification includes one/two/three/four logs, report tabs, 390px layouts, and empty states. Conditional fixtures cover tagged-radio reports, WAE QTCs, CQ WPX and DXer month/year reports. Copies in C/D test comparison layout, not independent contest evidence.

The first strict pass caught stale competitor-coach advice referring to the removed workspace; it was corrected. Another review caught a pre-existing NT mobile sidebar override that pushed the report offscreen; responsive stacking addresses that. The original preliminary audit was not a pristine before snapshot because implementation was already in progress; it is not used to claim quantitative before/after improvements.

## Report checklist

| Report | Covered log counts | Result/content decision |
| --- | --- | --- |
| Start | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Main | 1, 2, 3, 4 | Verified. Remove repeated intro; scorer methods in More; confidence/warnings visible |
| Compare Insights | 2, 3, 4 | Verified. Remove hero/workflow filler; methods in More; actual insights and inferred pace visible |
| Multiplier Opportunities | 1, 2, 3, 4 | Verified. Remove hero filler; methods in More; inference/confidence visible |
| Competitor coach | 1, 2, 3, 4 | Verified. Remove workflow filler; preserve cohort findings/actions/errors |
| Summary | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Log | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Operators | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| All callsigns | 1, 2, 3, 4 | Verified. Remove virtualization wording; retain counts/filter/pagination |
| Rates | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Countries | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Countries by time | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Countries by month | 1 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Countries by year | 1 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Qs per station | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Passed QSOs | 1, 2, 3, 4 | Verified. Pair definition in More; window and results visible |
| Dupes | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Qs by hour sheet | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Qs by hour | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Points by hour sheet | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| WPX by hour sheet | 1, 2 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Points by hour | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Qs by minute | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Points by minute | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| One minute rates | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| One minute point rates | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Radio timeline | 1, 2 | Verified. Methods in More; coverage/diagnostics and data visible |
| Multipliers | 1, 2, 3, 4 | Verified. Concise filter context; methods in More; partial/missing-time qualifiers visible |
| Radio coordination | 1, 2 | Verified. Methods in More; coverage/diagnostics and data visible |
| Possible radio handoffs | 1, 2 | Verified. Methods in More; coverage/diagnostics and data visible |
| Transmitter-rule audit | 1, 2 | Verified. Methods in More; coverage/diagnostics and data visible |
| Band-pair heatmap | 1, 2 | Verified. Methods in More; coverage/diagnostics and data visible |
| Prefixes | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Distance | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Break time | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Overview | 1, 2 | Verified. Methods in More where useful; QTC warnings/data visible |
| Timeline | 1, 2 | Verified. Methods in More where useful; QTC warnings/data visible |
| Efficiency | 1, 2 | Verified. Methods in More where useful; QTC warnings/data visible |
| Partners | 1, 2 | Verified. Methods in More where useful; QTC warnings/data visible |
| Series | 1, 2 | Verified. Methods in More where useful; QTC warnings/data visible |
| Quality | 1, 2 | Verified. Methods in More where useful; QTC warnings/data visible |
| Export | 1, 2 | Verified. Methods in More where useful; QTC warnings/data visible |
| RUN vs S&P vs INBAND | 1, 2, 3, 4 | Verified. Time/rate/anchor definitions in More; timeline and classifications visible |
| Continents | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| KMZ files | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Fields map | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Callsign length | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Callsign structure | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| CQ zones | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| ITU zones | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| CQ zones by month | 1 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| CQ zones by year | 1 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| ITU zones by month | 1 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| ITU zones by year | 1 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Not in master | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Possible errors | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Top 10 countries | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Qs by band | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Continents | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Frequencies | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Beam heading | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Beam heading by hour | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Comments | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Spots | 1, 2, 3, 4 | Verified. Metric methods in More; headings, errors and truncation visible |
| RBN spots | 1, 2, 3, 4 | Verified. Methods/reference in More; UTC-query limits visible |
| RBN compare signal | 1, 2, 3, 4 | Verified. Tips/reference in More; load controls and UTC-query limits visible |
| EXPORT PDF, HTML, CBR | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Save&Load session | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| QSL labels | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| Spot hunter | 1, 2, 3, 4 | Verified. Retain already concise data or task controls; remove workspace in comparisons |
| SH6 info | 1, 2, 3, 4 | Verified. Remove repeated cards; retain technical diagnostics in one table |


Counts include reference, conditional and empty-state runs; an unavailable-data message is verified as a state, not proof of unavailable analytical results. Internal-only legacy routes (`raw_log`, `points_rates`, `beam_heading`, `agent_briefing`, and legacy `::band` routes) were inspected at the shared-renderer/source level rather than falsely labelled independently browser-tested. Existing navigation/permalink regressions cover supported compatibility paths.

## Independent reviews and verification

- Content/usability review: no blocking content loss; warnings, actual insight explanations/actions and evidence scope retained.
- Engineering review: no calculation/session changes; fixed static inert controls, lost reference links and same-report keyboard focus. Nested/empty disclosure concerns resolved with fixtures.
- Regression/accessibility review: 365 report/viewport/tab snapshots, 3,012 checks, 70 unique report titles, 24 tabs and zero uncaught application errors in the final strict audit; native Enter/Space toggles verified. All 52 narrow states fit the viewport and keep navigation within 28vh; the maximum page-border overshoot is 3px.
- Normalizer: 13 fixtures. Operating-time full-app smoke: 24 checks. Workspace layout: 23; navigation: 22; controller: 16; radio full-app: 25; export runtime: 25.
- Protected scoring: 27 rules and 27 alias sets unchanged. Scoring, operating-style, radio, QTC, multiplier, competitor, Spots/RBN, session and v2/v3 permalink regressions pass.
- File-protocol startup verifies exact DOM text rather than CSS-transformed uppercase; fallback controls and local-server guidance are still asserted. Initialization/navigation resilience passes.

Detached HTML normalization adds some presentation overhead to comparison reports. Unmarked single reports take the fast path. No quantitative before/after performance claim is made.

Final operating-style PDF export: all eight pages visually inspected; tables, timeline, expanded methods and references are readable, with no clipped content. Supporting method cards were flattened to avoid oversized explanatory boxes. Seven report screenshots and native-keyboard disclosure evidence were independently inspected, including direct 390px layouts.

## Reproduce

```sh
bash scripts/run-report-cleanup-audit.sh
node tests/operating-time.test.mjs
node scripts/check-protected-scoring-baseline.mjs
bash scripts/run-compare-workspace-layout-smoke.sh
bash scripts/run-navigation-runtime-smoke.sh
bash scripts/run-export-runtime-smoke.sh
bash scripts/run-permalink-v3-browser-smoke.sh
OPERATING_TIME_PDF_MODE=compare bash scripts/run-operating-time-pdf-smoke.sh
```

Audit JSON, screenshots and print QA files are temporary outputs under `/tmp`; they are not shipped application assets. Browser fixtures fetch the public reference logs without modifying the archive.
