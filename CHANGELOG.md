# Changelog

Milestone-style history for SH6, based on reviewing diffs between version bump commits.

## v6.1.19 (2026-02-26)
- Compare layout audit: prevent table-based reports from using the `compare-narrow` grid path that can suppress per-panel horizontal scrolling.
- Table-heavy compare reports now stay in standard panel-width layout, so horizontal overflow is handled consistently inside each `compare-scroll` panel.
- Keeps `compare-narrow` only for compact non-table reports (`One minute rates`, `One minute point rates`, `Rates`).
- Version bump to `v6.1.19` and refresh cache-busting references in `index.html`.

## v6.1.18 (2026-02-26)
- Compare mode: fix horizontal scrolling for `Qs by hour sheet` and `Points by hour sheet` by removing these reports from the `compare-narrow` layout path.
- Keeps scroll behavior inside each compare panel (`compare-scroll`) instead of expanding panel columns to table width.
- Version bump to `v6.1.18` and refresh cache-busting references in `index.html`.

## v6.1.17 (2026-02-25)
- RBN compare signal: standardize X-axis tick labels to always use `DD.MM HH:mmZ`, regardless of zoom level.
- Version bump to `v6.1.17` and refresh cache-busting references in `index.html`.

## v6.1.16 (2026-02-25)
- Countries by month: fix table alignment/spacing issues by switching to stable fixed-width column layout and compare-friendly horizontal scrolling.
- Countries by month: tune first columns (`#`, Prefix, Country, All bands QSOs`) to narrower widths for denser display.
- Analysis modes: hide month/year geography reports in `Contester` mode (`Countries/CQ zones/ITU zones by month/year` remain available in `DXer` mode).
- Version bump to `v6.1.16` and refresh cache-busting references in `index.html`.

## v6.1.15 (2026-02-18)
- Countries by month: merge month heatmap into the main `Countries by month` report (single menu entry).
- Countries by month: render Jan-Dec heatmap cells with contact counts shown inside each colored cell.
- Countries by month: fix table formatting with consistent fixed-width month columns in single and compare views.
- Version bump to `v6.1.15` and refresh cache-busting references in `index.html`.

## v6.1.14 (2026-02-18)
- Add analysis mode split (`Contester` and `DXer`) with synced toggles in sidebar and start panel.
- Start flow redesign by mode: DXer enforces single-log flow, hides extra slots without dropping loaded data, and updates step labels.
- DXer UX cleanup: hide contest/rules-focused wording/reports where not relevant, including competitor coach and archive recommendation tip.
- Add DXer period filtering (year/month multi-select) across band-filtered reports.
- Add yearly geography reports in DXer mode (`Countries/CQ zones/ITU zones by year`).
- Archive search: fix ARRL tree grouping to `ARRL -> subcontest -> year -> mode -> file` and add compatibility fallback for shards missing `subcontest`.
- Analysis mode help text: add interactive “What’s the difference?” tooltip with hover/click behavior.

## v5.2.26 (2026-02-12)
- Rates and time-series reports: exclude duplicate QSOs from UTC hour/minute/10-minute rate buckets.
- Peak-rate windows: exclude duplicate QSOs from best QSO window and best points window calculations (10/20/30/60/120 min).
- Point time-series: exclude duplicate QSOs from points-by-hour and points-by-minute aggregates.

## v5.2.25 (2026-02-12)
- RBN compare signal: add drag-to-zoom on the time axis (X only), with double-click reset and per-card `Reset zoom` button.
- RBN compare signal: add inline chart hint text and visible drag-selection overlay/cursor feedback.
- Spots canvas hook: add shared canvas zoom handlers so future Spots canvases can use the same drag-zoom/reset behavior.

## v5.2.24 (2026-02-11)
- Header: make the SH6 logo clickable to `https://s53m.com/SH6`.
- Load panel: add `Reset selections` action to return to a clean first-load page state (clears permalink/query/hash).
- RBN compare signal: add per-card `Copy as image` action next to the skimmer selector, capturing the full chart panel including legends; when clipboard image write is unavailable, automatically download PNG.

## v5.2.23 (2026-02-11)
- Spots/RBN compare: fix repeated reload/render loop (blinking) by coalescing in-flight Spots fetches and avoiding redundant auto-load triggers while loading/QRX/current-ready.
- Spots/RBN time window: clip displayed spot analytics to log hours; in compare mode, use the combined min/max window across loaded logs.
- Spots/RBN compare UI: improve horizontal swipe/scroll reliability for wide `Spots of you by band/hour` tables and harden compare scroll sync behavior.

## v5.2.22 (2026-02-10)
- Status bar: show green source checkmarks only when the corresponding feed status is `OK` (hide them for loading/QRX/error).

## v5.2.21 (2026-02-10)
- UI: remove Classic theme and the theme toggle; keep NT as the only/default design.

## v5.2.20 (2026-02-10)
- Cache busting: load `main.js` and `style.css` with a `?v=` query param so browsers pick up new releases immediately.

## v5.2.19 (2026-02-10)
- CQ API: disable `raw/.../callsign/...` requests for contests that don't support the endpoint (prevents HTTP 400 noise on CQWPX/CQ160, etc.).

## v5.2.18 (2026-02-10)
- CQ API: avoid noisy HTTP 400 console errors by not calling the `raw/.../callsign/...` endpoint unless it is required as a fallback, and stop using it in Competitor coach.

## v5.2.17 (2026-02-10)
- Status bar: show `QRX` (instead of `error`) for HTTP 429 rate limiting across CTY, MASTER, QTH lookup, CQ API, Spots, and RBN; retry automatically and throttle repeat requests.

## v5.2.16 (2026-02-10)
- RBN fetch: handle HTTP 429 rate limiting with a visible retry message, respect `Retry-After` when present, and coalesce in-flight requests to avoid accidental parallel fetches.

## v5.2.15 (2026-02-10)
- Hide verbose analysis sections (kept in code) for Spots/RBN Spots and Competitor coach, keeping the focused tables.
- Remove manual spot-loading controls (spots auto-load) and keep compare workspace header informational only.
- RBN fetch hardening: treat 404 as empty dataset and avoid rapid retry loops on stable errors.

## v5.2.14 (2026-02-10)
- Merge UI_UX_NT into main: UI/UX refresh across tables/navigation/compare workspace, plus new RBN compare signal report with fast rendering and improved legends/trendlines.

## v5.1.20 (2026-02-10)
- RBN compare signal: show continental skimmer charts as full-width stacked panels.
- RBN compare signal: use stronger band colors and display log callsigns in the marker legend.
- RBN compare signal: add subtle per-band trendlines and stabilize performance with caching, lazy rendering, sampling, and progressive drawing.

## v5.1.21 (2026-02-10)
- RBN compare signal: trendline now shows the 75th percentile SNR per time bucket, with per-log line styles and 15-minute gap breaks.

## v5.1.22 (2026-02-10)
- RBN compare signal: trendline gap breaks now use a 30-minute threshold, and the legend is shown to the right with visual line-style samples.

## v5.1.23 (2026-02-10)
- RBN compare signal: move legend below the plot to keep charts full width.

## v5.1.24 (2026-02-10)
- RBN compare signal: keep legend below plot in a single row, and make p75 trendlines easier to appear while still dropping out during no-spot gaps.

## v5.1.25 (2026-02-10)
- RBN compare signal: remove filter notices from the header and add quick actions to load competitor logs into B/C/D when slots are empty.

## v5.1.19 (2026-02-09)
- Table hardening: eliminate page-level horizontal overflow across all menus and extend wrapper coverage to wide matrix tables (including Fields map).
- Table context: add sticky report headers plus sticky key columns for long/wide reports (`Log`, minute matrices, Countries, Countries by time, Continents, Beam heading family).
- Long-report orientation: add quick-jump toolbar (`Top / section / Bottom`) for heavy reports and introduce tall table containers with internal vertical scroll to keep context visible.
- Coach + spots flow: standardize `Step 1..4` interaction order across `Competitor coach`, `Spots`, and `RBN spots` (filters → summary → primary table → advanced diagnostics).
- Spots actions: normalize coach action wording to explicit jump actions (`Jump to ...`) for faster navigation.
- Utility pages: redesign `EXPORT PDF, HTML, CBR` and `Save&Load session` into clearer action-first layouts with structured notes.
- SH6 info: add compact diagnostics cards (build, loaded log, performance hotspot, data file status) above detailed parameter table.

## v5.1.18 (2026-02-08)
- NT compare workspace: add sticky compare toolbar with slot context, sync/sticky toggles, and quick report jump actions.
- NT compare insights: add score/QSO/multiplier spread chips to speed up first-pass compare decisions.
- Coach redesign: add shared severity model (`critical/high/medium/opportunity/info`) and action-first priority cards in Competitor coach.
- Spots coach redesign: add severity badges plus one-click jump actions from summary cards to detailed drilldown sections.
- Charts redesign: add `Absolute` vs `Normalized %` metric mode for compare fairness across unequal log sizes.
- Charts styling: refresh bar chart rendering with improved tracks, value labels, and mode controls.
- Hardening: improve touch-target sizes on mobile, add loading `aria-busy` semantics, and add render-time instrumentation (last render + hotspot) in SH6 info.
- Smoke coverage: extend browser smoke checks for compare workspace, chart mode controls, and coach severity UI contracts.
- Docs: refresh README highlights and NT shell contract for the redesigned compare/coach/chart workflows.

## v5.1.17 (2026-02-08)
- UI/UX foundation: add `design-system/` docs (`MASTER`, page overrides, QA checklist) for consistent future UI work.
- Global UI polish: introduce shared CSS tokens, unified interaction states, focus rings, and shared card/table styling primitives.
- Start/compare shell: improve start-page hierarchy, slot status clarity, compare panel spacing, and sidebar active-state readability.
- Competitor coach UX: clarify row actions with explicit `Log B/C/D` targets and replace technical API wording with user-facing labels.
- Spots/RBN UX: strengthen band/hour drilldown discoverability and improve filter-chip clarity for continent/CQ/ITU filtering.
- Export UX: reorganize `EXPORT PDF, HTML, CBR` into clearer format groups with compare-mode guidance.
- Accessibility/responsive: keyboard activation for sidebar entries, better tab semantics for slot source controls, reduced-motion safeguards, and breakpoint hardening for 375/768/1024/1440 layouts.
- Tests: extend browser smoke test with UI assertions for competitor coach renderer, spots renderer, and exact export menu label.

## v5.1.16 (2026-02-08)
- Scoring autoheal: fix exchange-aware EU/non-EU detection for EUDX and correct REF multiplier scope for non-French logs.
- Scoring autoheal: add DARC Fieldday HF high/low band-group multiplier handling and EUHFC band-wise score aggregation.
- Scoring autoheal: improve Cabrillo/exchange-derived multiplier extraction and annotate WAE logs when QTC lines are missing from archive data.
- QTH lookup: harden callsign-grid lookups with adaptive request splitting, retries, timeout handling, and paced requests for large logs.
- QTH lookup: tighten batching by payload size and skip invalid callsign tokens before lookup.
- Spot hunter: export `sortBands` to the shared `window.SH6` API so Spot hunter no longer fails at runtime.

## v5.1.15 (2026-02-08)
- Competitor coach: replace row actions with a compact segmented `Load to B/C/D` control and add a per-row `Last loaded to Log X` marker.
- Spots and RBN spots: make `Spots of you by band/hour` values clickable for bucket drilldown.
- Spots and RBN spots: add bucket detail view with actual spot rows plus interactive filters and stats by continent, CQ zone, and ITU zone.

## v5.1.14 (2026-02-08)
- Competitor coach: add robust fallback to CQ raw category cohorts when yearly official ranking endpoint has no results.
- Competitor coach: improve category-family matching so broad labels (for example `MULTI-OP`) resolve to practical CQ categories.
- Competitor coach: hide API source URL from UI and keep source details internal.
- Competitor coach: default scope to `Continent` to avoid overly narrow first-pass cohorts.
- Competitor coach: replace scope/category dropdowns with always-visible toggle buttons.

## v5.1.13 (2026-02-08)
- CQ API: improve record matching by scope/category, including `WORLD` fallback handling.
- CQ API: keep raw score as fallback when official score is missing.
- CQ API: enrich history table with category/operators and add per-row actions to load matching archive logs into compare slots.
- Competitor coach: add raw-category fallback when official yearly ranking (`score/<year>/*`) is unavailable, and map broad categories (for example `MULTI-OP`) to CQ category families.
- Competitor coach: hide API source URL in UI, default scope to continent for broader cohorts, and add hints when selected scope/category is too narrow.
- Competitor coach: replace scope/category dropdowns with always-visible toggle buttons for faster selection.
- CQ API: render year values as plain years (for example `2024`, not `2,024`).
- Compare mode: render singleton pages only once (`Start`, `Charts`, `EXPORT PDF, HTML, CBR`, `Save&Load session`, `QSL labels`).
- Export: add CBR export actions for loaded slots.
- Menu: remove `Raw log` entry (raw export remains available from `EXPORT PDF, HTML, CBR`).

## v5.1.12 (2026-02-08)
- Merge `contest-rules` and `cq_api` into `main`.
- Add contest scoring engine with computed score details and point-rate reports.
- Add CQ API enrichment with geo/category-aware history/record lookups and fallback handling.

## v4.3.0 (2026-02-08)
- Add contest scoring engine scaffold with archive/header rule resolution from `data/contest_scoring_spec.json`.
- Add computed scoring primitives (QSO points, multipliers, formula evaluation) with fallback to logged points where required.
- Add scoring details to Main report with separate `Claimed score (header)` and `Computed score (rules)` rows.
- Show clear warning for unknown contest rules and keep logged-points fallback behavior.
- Add new point-rate reports: `Points rates`, `Points by minute`, and `One minute point rates`.
- Add compare-mode alignment and focus controls for point-rate reports.
- Add heuristic bundle scoring for ARRL family and EU VHF contest bundles.

## v4.2.32 (2026-02-07)
- Countries report: add a `Unique` column with unique callsign count per DXCC.

## v4.2.31 (2026-02-06)
- Add compact permalink encoding (`state=v2...`) with shorter key names and default-value omission.
- Keep backward compatibility: existing legacy `state` permalinks still decode and load.

## v4.2.24 (2026-02-03)
- Refresh log selection and landing flow (Start menu entry, landing copy updates, hide banner when loading logs).
- Restore archive log tree browsing and streamline log slot controls.
- Make View reports button more prominent and route it to the Main report.

## v4.2.25 (2026-02-03)
- Add archive-search recommendation sticker in the load panel.

## v4.2.26 (2026-02-03)
- Color-code Archive/Demo buttons to match the new sticker style.

## v4.2.27 (2026-02-03)
- Keep map view active across data refreshes and widen map layout after “Map all”.

## v4.2.28 (2026-02-03)
- Make map view card expand to full available width.

## v4.2.30 (2026-02-03)
- Preserve full-size map layout when opening map permalinks with session state.
- Clear nav highlight while map view is active to avoid misleading selection.
- Force map view containers to span full width while in map mode.

## v4.2.29 (2026-02-03)
- Ensure map view uses full-width layout and map card styling.

## v4.2.23 (2026-02-03)
- Prefer CQ/ITU zones from the log when present; fall back to cty.dat otherwise.

## v4.2.22 (2026-02-03)
- Enlarge map view and add a full-size map link that opens in a new tab.

## v4.2.21 (2026-02-03)
- Break spot rate timeline lines when a 10-minute bucket is missing.

## v4.2.20 (2026-02-02)
- Spot hunter: add grouping buttons, synced band/mode filters, and clearer intro text.
- Spot hunter: bucket modes, align DXCC matching with prefix lookup, and show spot date range + status indicator.
- Spot hunter: slider styling aligned to Spots controls.
- Spots/RBN file lists and RBN date pickers now show dates instead of filenames.

## v4.2.19 (2026-02-02)
- Spot hunter: keep band/mode filter counts in sync with each other.

## v4.2.18 (2026-02-02)
- Spot hunter: add mode filter buttons when grouping includes mode.

## v4.2.17 (2026-02-02)
- Spot hunter: add intro guidance and replace grouping dropdown with quick-select buttons.

## v4.2.16 (2026-02-02)
- Spot hunter: align DXCC matching with prefix lookup to avoid showing already-worked countries as new.

## v4.2.15 (2026-02-02)
- Spot hunter: bucket modes into CW/Phone/Digital for grouping consistency.

## v4.2.14 (2026-02-02)
- Spot hunter: add grouping selector for slot/band/mode/DXCC combinations and keep band filters in sync.
- Spots/RBN file lists and pickers now show dates instead of filenames.

## v4.2.13 (2026-02-02)
- Spot hunter: show spot date range (not raw URL), and wire status indicator while loading.

## v4.2.12 (2026-02-02)
- Spot hunter: add band-plan mode guessing, per-band filters, and adjustable window (10m–24h) with multi-day spot fetch.

## v4.2.11 (2026-02-02)
- Add Spot hunter menu with lazy-loaded module for live daily spots vs worked slots.

## v4.2.10 (2026-02-02)
- Hide QTH data status row until a lookup request starts.

## v4.2.9 (2026-02-02)
- Remove /lookup fallback; use only /sh6/lookup endpoint.

## v4.2.8 (2026-02-02)
- Reduce lookup request count (bigger batch) and retry once on rate limit responses.

## v4.2.7 (2026-02-02)
- Normalize lookup grids (trim 8/10/12-char locators to 6-char) and ignore invalid/empty entries.

## v4.2.6 (2026-02-02)
- Add fallback lookup endpoint to avoid HTTP 404 from /sh6/lookup.

## v4.2.5 (2026-02-02)
- Show QTH data status only when lookup is requested (no pre-check error).

## v4.2.4 (2026-02-02)
- Add QTH data status line with lookup health check.

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
- Rename Export menu to "EXPORT PDF, HTML, CBR".
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
