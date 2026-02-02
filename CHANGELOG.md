# Changelog

Milestone-style history for SH6, based on reviewing diffs between version bump commits.
Dates are taken from the version bump commit date.

## v4.2.3 (2026-02-02)
- Add callsign grid lookup via azure API when log grid is missing, with cty.dat fallback.

## v4.2.2 (2026-02-02)
- Fix Maidenhead 6-character locator centering to remove ~100 km map offset.

## v4.2.1 (2026-02-01)
- Narrow Spots/RBN sliders and stack Rates compare panels vertically.

## v4.2.0 (2026-02-01)
- Show session controls once in compare mode and simplify Spots/RBN/Breaks compare controls.
- Fix Rates layout stacking and make it responsive.
- Apply band filter to Frequencies chart in compare mode.

## v4.1.9 (2026-02-01)
- Redesign log upload panel layout into step-based slots for clearer archive vs upload paths.

## v4.1.8 (2026-02-01)
- Make Operators view responsive with a grid layout that avoids overflow.

## v4.1.7 (2026-02-01)
- Redesign One Minute Rates layout to prevent overflow and wrap minutes cleanly.

## v4.1.6 (2026-02-01)
- Add session permalink migration layer to preserve compatibility across upgrades.

## v4.1.5 (2026-02-01)
- Rename Export menu to "EXPORT PDF or HTML".
- Move Export and Save&Load session menus just above QSL labels.

## v4.1.4 (2026-02-01)
- Add Save&Load session menu and session handling (permalinks + offline session files).
- Move QSL labels menu entry just above SH6 info.
- Lower Break time slider minimum to 2 minutes.

## v4.1.3 (2026-02-01)
- Add RBN date picker when logs span more than two UTC days, with per-slot selection in compare mode.
- Notify users about the two-day RBN query limit and drive RBN fetches from the selected dates.
- Aggregate Spot→Rate timeline markers when spot volume is high to keep the chart responsive.
- Hide Band change efficiency when logs show concurrent multi-band activity.
- Remove Unanswered spots, Unworked-after-spot rate, and DX spot conversion funnel from the RBN report.

## v3.4.1 (2026-02-01)
- Add RBN spots report with the same analysis blocks as Spots.
- Show Spots and RBN status indicators in the sidebar (on demand).
- Surface per-day RBN errors inside the RBN report.

## v3.4.0 (2026-01-31)
- Harden continent normalization to strip stray characters before coloring.

## v3.3.9 (2026-01-31)
- Normalize continent codes at ingest to fix table coloring.

## v3.3.8 (2026-01-31)
- Style demo log buttons to match landing page.

## v3.3.7 (2026-01-31)
- Replace empty-report placeholder with friendly “load a log” message and demo button.

## v3.3.6 (2026-01-31)
- Add plain-language explanations for each spots insight section.

## v3.3.5 (2026-01-31)
- Add 10 new spot insights tables at the bottom of the Spots report.

## v3.3.4 (2026-01-31)
- Remove scatter controls/graph and add full spot lists (of you / by you).

## v3.3.3 (2026-01-31)
- Wrap One Minute Rates minute list to avoid horizontal overflow.

## v3.3.2 (2026-01-31)
- Fix continent color mapping by normalizing continent codes.

## v3.3.1 (2026-01-31)
- Simplify Top spotters and Top DX tables to Spotter/DX, Spots, Top band.

## v3.3.0 (2026-01-31)
- Conversion by band table simplified to show only band + spot counts.

## v3.2.9 (2026-01-31)
- Add scatter bucket size selector for spot density vs QSO rate.

## v3.2.8 (2026-01-31)
- Changelog wording cleanup (all entries are released).

## v3.2.7 (2026-01-31)
- Version badge links to CHANGELOG.md.
- Removed sample ADIF log from the repo.

## v3.2.2 (2026-01-31)
- Spots workflow: menu scaffold, loader/matching, and gzip spot file support.
- Compare main/summary/QSL updated to a 2x2 layout.
- Added Spots report with charts and analysis (timeline, scatter, conversion, top tables).

## v3.1.8 (2026-01-31)
- Compare log selector improvements, action rename, and panel visibility fixes.
- QSL label service info added to the UI.
- Key files: main.js, style.css, index.html.

## v3.1.7 (2026-01-31)
- Multi-log compare (1–4 logs) with compare focus selectors, band pills, and compare-count body classes.
- QSL labels report and handoff to the label tool; ADIF payload sent when log input is not ADIF.
- Azure CORS sources for cty/master/QRZ plus source indicators in the status UI.
- Version/author moved into the sidebar and inlined into the UI.
- Reconstructed-log notice strengthened; break-time compare supports per-slot thresholds.
- Documentation refresh and sample ADIF log added; TODO parity list removed.
- Key files: main.js, style.css, index.html, worker.js, README.md, S53M_9ADX_2023.adi.

## v2.2.22 (2026-01-28)
- Reconstructed log flagging and notice updates; demo log loading from archive.
- WPX prefix extraction and grouping in Prefixes report; prefix/zone table labels refined.
- Frequency chart reworked to timeline scatter with weekend splits and band filtering.
- Sticky table wrappers and narrower table styling for dense reports.
- Possible-errors reporting tightened (counts, deduping, filtering) and proxy loading status highlighted.
- Archive/menu engagement and shard-error tracking added.
- Key files: main.js, style.css.

## v2.1.39 (2026-01-26)
- Export flow moved to a dedicated Export report; export selection/print pagination updated.
- Landing page redesign with new title/subtitle, brand logo, and favicon set.
- Drag-and-drop uploads (per-slot drop zones + global drag overlay).
- Raw log view with copy button; compare worker + 1000-row windowing; loading indicators for heavy renders.
- Operator/callsign filters, QS-per-station table redesign, and QRZ photo loading.
- All-QSO KMZ downloads and map-all links moved to footer.
- Sun/solar report removed from the nav/UI during the release cycle.
- Key files: main.js, style.css, index.html, worker.js, SH6_logo.png, favicon*.png, favicon.ico.

## v1.1.32 (2026-01-25)
- Restore list numbering for grouped navigation items.
- Key files: style.css, main.js.

## v1.1.31 (2026-01-24)
- Maintenance version bump only.
- Key files: main.js.

## v1.1.30 (2026-01-24)
- Collapsible nav groups no longer auto-open by default; only open when the active item is a list entry.
- One-minute compare forces stacked layout and can wrap compare tables for narrow screens.
- Key files: main.js, style.css.

## v1.1.29 (2026-01-24)
- Collapsible nav groups for charts and per-band subreports with auto-open on active selection.
- Key files: main.js, style.css.

## v1.1.28 (2026-01-24)
- Preserve base nav classes during active highlight; indent child nav items.
- Key files: main.js, style.css.

## v1.1.27 (2026-01-24)
- Compare layout tweaks for narrow reports (compare-narrow grid class).
- Key files: main.js, style.css.

## v1.1.26 (2026-01-24)
- Align compare charts for frequency and beam heading reports.
- Key files: main.js.

## v1.1.25 (2026-01-24)
- Add horizontal scroll wrapper for compare tables.
- Key files: main.js, style.css.

## v1.1.24 (2026-01-24)
- Refactor QS-by-minute rendering and align minute compare tables.
- Key files: main.js.

## v1.1.23 (2026-01-23)
- Compare-aligned renderers across core reports (countries, continents, zones, prefixes, callsign structure, distance, beam heading, countries-by-time).
- Compare tables aligned with shared time rows and sortable headers.
- Google Analytics tag added; archive picker copy updated.
- Key files: main.js, style.css, index.html.

## v1.1.17 (2026-01-22)
- Archive search via sqlite shards (sql.js-httpvfs) with CDN fallbacks and timeouts.
- Archive tree grouped by contest/year with labels, filters, and auto-close behavior.
- Cabrillo parsing, grid extraction, and Leaflet map view with great-circle paths.
- Dual-log compare mode with aligned buckets and improved controls.
- PDF/HTML export with pagination and callsign/year naming.
- Band ribbon + hour/minute filters; break threshold slider; beam heading filters.
- Data fetch fallbacks and source/proxy status labels for cty/master.
- Key files: main.js, style.css, index.html, vendor/sqljs-httpvfs/*.

## v0.5.10 (2026-01-20)
- Initial public feature set: reports, data loading, and core UI styling.
- Alpha README updates and early branding cleanup.
- Key files: main.js, style.css, index.html, README.md.

## Early development (pre-v0.5.10)
- Initial uploads, scaffolding, and baseline functionality.
