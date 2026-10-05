# Operating-style time and possible 2BSIQ — v6.3.39

## Using the reports

Open **Break time** for a compact minutes/percentage summary alongside the existing break information. Open **RUN vs S&P vs INBAND** for estimated rates, hourly timelines, and an expandable per-band breakdown. Possible 2BSIQ/dual RUN appears as a RUN subset. QSO classifications by band remain available; session evidence and per-QSO audit tables are no longer displayed on this page or its static exports. Detection and CSV evidence remain unchanged.

Hourly timelines preserve the actual minute order rather than grouping minutes by style. Outlined blocks represent consecutive same-style minutes; thin vertical lines mark each minute and stronger lines mark five minutes. Hover a block for its UTC start/end (exclusive). The minute ruler runs from 00 to 60; blank leading/trailing space in partial hours is outside the analyzed interval, not break or unclassified time. Possible 2BSIQ replaces ordinary RUN only in its detected minutes on the timeline; it remains a subset of RUN in totals.

The report ends with a collapsed **More** section containing heuristic settings, anchor counts, definitions, elapsed-time/rate accounting notes and the CT1BOH explanation link. Click its heading to expand it. Each comparison panel has its own details; comparison controls appear in a separate report-level More. Static exports expand methods, preserve references and remove inert controls.

The shared **Maximum activity gap** slider accepts 1–15 minutes and defaults to 5. It estimates continuity between nearby same-style contacts, not the duration of an individual contact. The separate break threshold decides which station-wide gaps are breaks. Both settings survive sessions and perspectives; the new gap setting also round-trips through v2/v3 permalinks. Old links default to five minutes. The optional v3 positional field is appended at index 24; existing slot index 23 and earlier fields retain their meanings.

Each comparison log has its own analysis and CSV button, with one shared gap control. Hour QSO buttons open the Log report at the corresponding UTC interval; in comparisons the interval applies to the compared logs, allowing examination of both stations during the same period.

## Minute accounting

The observation interval starts at the beginning of the first timed activity's UTC minute and ends immediately after the last timed activity's minute. A single timed contact contributes one observed minute. Nothing is inferred before/after that interval. Empty logs have no time estimate. Records without a finite timestamp are excluded and counted in the report.

Every elapsed minute belongs to exactly one category: RUN, INBAND S&P, Off-band S&P, Mixed activity, Unclassified time, or Break time. S&P is the subtotal of INBAND plus Off-band S&P, not another category. Concurrent RUN on different bands still counts once as station RUN. Conflicting styles, including known plus unclassified activity, produce Mixed activity.

Occupied minutes carry the existing QSO style. Missing frequencies or unsupported styles are unclassified. Between adjacent QSOs on the same band and mode, interior minutes are filled only when both endpoint styles agree and their timestamp gap is within the slider limit. RUN also requires endpoint frequencies within 2 kHz (4 kHz for phone). Style changes and larger frequency moves leave unsupported interior minutes unclassified. Seconds are used when evaluating timestamp-gap limits, although totals are UTC-minute estimates.

Station gaps use occupied QSO and QTC minutes. If adjacent occupied minutes are separated by more than the break threshold, the intervening empty minutes are breaks. Breaks take precedence over inferred activity. QTC timestamps interrupt breaks, but QTC activity itself is unclassified. Duplicates remain activity evidence, including in QSO rate numerators. The overall ON AIR figure includes the occupied endpoint minutes, so it reconciles with the inclusive observation interval; it is not a measurement of actual transmission time. Existing per-operator break information retains its own participation convention.

Per-band minutes count each band's minute once and can overlap other bands. Their sum can exceed elapsed station time; percentages use that band's activity-minute total. Station rates count QSOs inside the corresponding exclusive station-time category, not all QSOs previously classified with that style. QSOs in mixed minutes remain in the mixed numerator; a misleading style-specific rate is not shown for mixed/unclassified/break time.

## Possible 2BSIQ detection

[CT1BOH's explanation](https://www.qsl.net/ct1boh/2bsiq/) and the [WWROF webinar](https://wwrof.org/webinar-archive/1221/) describe Two Bands Synchronized Interleaved QSOs. One operator maintains two RUN streams and synchronizes exchanges while transmitting only one signal at a time. Cabrillo completion timestamps cannot prove that synchronization, physical radio count, or transmission compliance.

The detector checks each band pair in consecutive exclusive station-RUN minutes with RUN evidence on both bands. A period requires:

- At least 3 consecutive overlapping RUN minutes.
- At least 4 RUN QSOs on each band, with each band's supporting contacts spanning at least 2 minutes.
- At least 4 band alternations in timestamp/log order.
- At least 80% of each band's supporting frequencies within a 4 kHz span.

These are documented analytical heuristics, not contest rules. Single-op metadata produces **Possible 2BSIQ**; multi-op produces **Dual RUN**; unknown operator category produces Dual RUN with an uncertainty notice. Available radio IDs are displayed but are not required or interpreted as proof of two physical radios. The existing parser deliberately leaves some single-op Cabrillo transmitter tails unnormalized; the analytical layer recognizes an unambiguous standard CQWW 0/1 tail without changing parsed exchanges or scores.

The model and CSV retain band pairs, UTC boundaries (end exclusive), minutes, contact counts, rate, IDs and qualification evidence. Overlapping qualifying band-pair periods can occur; the summary unions their minutes. Dual-RUN minutes are always a subset of RUN, never additional elapsed time. Ordinary band changes and sparse second-band contacts fail the sustained-overlap tests.

Since v6.3.37, qualifying band-pair segments are grouped into sessions. Overlapping segments join; separated segments join only within the activity-gap slider limit, with a continuing band and exclusively RUN minutes in between. A mixed, unclassified, S&P or break minute prevents joining. CSV retains session and original band-pair evidence. Session span includes transitions, but detected dual minutes and rate exclude them. Contacts shared by overlapping band-pair segments are counted once in the session.

The station and band tables retain total RUN and show an indented Possible 2BSIQ (subset of RUN) row, or Dual RUN for non-single-op categories. Subset rows must not be added to the category total. Hourly bars split RUN into RUN (other) and the cyan dual-RUN subset; bar totals remain unchanged. Break time and CSV include the same subset information. Existing per-QSO RUN/S&P classifications remain unchanged.

## Exports and limitations

CSV includes settings, elapsed categories, per-band rows, hourly composition and dual-RUN periods. Static HTML and the shared PDF-report body expand details and remove interactive controls. Print styling preserves bar colors. Full-log QSO classifications and contest rules are untouched by the time model.

The model sorts a copy of event references and does not modify the source contacts. Typical contest grids are small; pathological intervals longer than approximately two years are rejected explicitly instead of allocating an unbounded minute grid. Very long supported intervals may still produce lengthy reports. Time estimates can overstate short activity bursts within an occupied minute, and inferred overlap does not prove simultaneous operation. Loaded spot anchors may affect the existing QSO classifier and therefore the evidence supplied to this model. No exact CQ/search/TX/RX duration is claimed.

## Validation and local testing

At the default gap 5 / break threshold 15, read-only public CQWW CW 2025 validation produced:

| Log | QSOs | Elapsed min | RUN | INBAND | Off-band | Mixed | Unclassified | Break | Unique dual-RUN min | Pair periods | Radio evidence |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| EF8R | 12,991 | 2,880 | 2,724 | 0 | 4 | 123 | 8 | 21 | 2,479 | 55 | 0 |
| CQ9A | 11,520 | 2,880 | 2,770 | 2 | 8 | 87 | 13 | 0 | 2,507 | 66 | 0, 1 |

Both begin with qualifying 20m/40m overlap. Computation took approximately 14–16 ms per log on the development machine, excluding parsing/classification. Every parsed QSO field remained identical before/after time analysis. These figures are heuristic estimates, not verified 2BSIQ operating durations. Downloads are kept in memory, not committed.

With v6.3.37 grouping at gap 5, EF8R's 55 segments form 35 sessions and CQ9A's 66 segments form 33 sessions. The detected dual-minute totals remain 2,479 and 2,507. CQ9A's opening 20m/40m and 40m/80m segments are now in the same session, together with subsequent qualifying segments connected by short RUN-only transitions. Grouping does not credit the 00:44 single-band minute as dual RUN. Model checks cover shared-band transitions, mixed/unsupported gaps, overlapping pairs and subset totals; full-app and static export checks include the cyan bar portion and subset rows.

Run from the repository root:

```sh
node tests/operating-time.test.mjs
node tests/operating-time-reference.test.mjs
SH6_UI_SMOKE_PAGE=operating-time-ui-smoke.html bash scripts/run-radio-ui-smoke.sh
bash scripts/run-export-runtime-smoke.sh
bash scripts/run-operating-time-pdf-smoke.sh
SH6_UI_SMOKE_PAGE=operating-time-reference-ui-smoke.html RADIO_UI_SMOKE_PORT=8836 bash scripts/run-radio-ui-smoke.sh
bash scripts/run-operating-style-regression.sh
bash scripts/run-radio-regression.sh
bash scripts/run-session-codec-smoke.sh
bash scripts/run-permalink-v3-browser-smoke.sh
bash scripts/run-scoring-regression-smoke.sh
node scripts/check-protected-scoring-baseline.mjs
```

For manual testing, run `python3 -m http.server 8000 --bind 127.0.0.1`, open `http://127.0.0.1:8000/`, and load a log or restore the supplied reference permalink with the localhost base URL. Inspect both reports, vary the gap slider, compare logs and export CSV/HTML/PDF. Reference validation requires internet access; synthetic model tests do not.

The PDF smoke prints the actual static exporter body through Chromium and renders it with Poppler for inspection; output is temporary under `/tmp/sh6-operating-time-pdf`. It requires agent-browser and Poppler. Use `OPERATING_TIME_PDF_MODE=compare` to exercise four-log print output. Printed comparison panels are stacked by log to avoid clipping. The report and its static export omit session tables and per-QSO audits, while retaining band classifications. Run browser tests sequentially or use distinct ports. Single-log and four-log prints were inspected for wrapping, tables, colors, expanded details and removed controls. Full-app reference comparison separately checks both restored logs and all 96 hourly bars. The UI smoke also verifies an actual saved-session upload restores the gap setting and time drilldowns open Log.

Verified on 2026-10-05: synthetic model/settings tests, public-reference model and browser tests, single/two/four-log UI tests, CSV/static-export checks, print rendering, operating-style and radio regressions, session codec and v2/v3 full-app permalink smoke, export runtime smoke, scoring regression smoke, and the protected baseline (27 rules plus 27 alias sets). Syntax checks and `git diff --check` pass. No scoring code or archive logs were changed. No push was performed.
