# SH6 Contest Report Generator – TODO

## 1. Overall task description

- Build a **single static HTML/JS page** (no server side code) that:
  - Lets the user **upload a contest log file** in **ADIF** or **CBF** format.
  - Parses the log in the browser and builds an internal **QSO data model**.
  - Generates a **set of reports** similar in content and structure to the SH5 report for  
    `2025 CQ-WW-CW TK0C` (`https://s53m.com/sh5/2025%20CQ-WW-CW%20TK0C/`).
  - Provides **navigation** between reports (sidebar + “Prev / Next” links) similar to SH5.
  - Uses only **client‑side technologies**: HTML, CSS, JavaScript (no backend).
  - Ideally can be opened locally (e.g. `file://`) but must also be able to **fetch remote data files**.

- The final solution should:
  - Be **log‑format agnostic** where possible (ADIF/CBF) by mapping both to a common schema.
  - Be designed so that **additional reports** and **new contests** can be added easily.
  - Keep JS/CSS local, but **fetch external data files at runtime**:
    - `https://www.country-files.com/cty/cty.dat` for DXCC/prefix/zone/geo data.
    - `https://www.supercheckpartial.com/MASTER.DTA` for master callsign data.

---

## 2. Data model and parsing – TODO

- [x] Define the **core QSO data model** (per QSO):
  - Timestamp (UTC), band, frequency, mode, call, exchange, serial, zone, continent, DXCC, country, grid/locator, operator/station, unique QSO id, etc.
  - Flags: duplicate, invalid/possible error, passed QSO, “not in master”, etc.
- [ ] Define a **station/operators model**:
  - Operators list, station identifiers (if used), mapping QSO → operator/station when possible.
- [x] Define **derived entities**:
  - Countries, prefixes, fields, zones, continents, distances, beam headings, rates.
- [x] Implement **ADIF parser** in JS:
  - Minimal, robust parsing of ADIF header + records.
  - Field mapping from ADIF tags to internal QSO model.
- [ ] Implement **CBF parser** in JS:
  - Parse CBF fixed/column-based fields (as used by SH5/loggers).
  - Map to internal model.
- [x] Add **operator/station fields** into QSO model from ADIF/CBF (OPERATOR, STATION_CALLSIGN, etc.).
- [ ] Add **operator/station fields** into QSO model from ADIF/CBF (OPERATOR, STATION_CALLSIGN, etc.).
- [x] Implement **basic rate/hour aggregation** (hour buckets).
- [x] Implement a **normalization layer**:
  - Normalize bands, modes, frequencies, call signs (uppercase, trim), locators, zones.
  - Resolve missing derived data (DXCC, continent, grid, etc.) using **in‑memory tables** built
    from `cty.dat` and, where appropriate, `MASTER.DTA`.
- [ ] Implement **basic validation**:
  - Mark obviously invalid entries (e.g. broken time, band, missing call).
  - Prepare hooks for “possible errors” report.

---

## 3. UI shell and navigation – TODO

- [ ] Create base HTML layout:
  - Top header with contest name, year, callsign and “Prev / Next” controls.
  - Left sidebar with ordered list of report links (similar order to SH5).
  - Main content area where the currently selected report is rendered.
- [x] Implement **file upload UI**:
  - Button/input for selecting ADIF/CBF file.
  - Show basic file info (name, size, format detection result).
  - On load, automatically parse and build all in-memory indices/statistics.
- [x] Implement **navigation behavior**:
  - Sidebar links switch the main report view (e.g. via hash routing or JS tabs).
  - “Prev / Next” buttons follow the same order as the sidebar menu.
- [x] Implement **styling**:
  - Simple CSS that echoes SH5’s feel (tables, alternating rows, gradients, etc.).
  - Responsive enough to be usable on different screen sizes.

---

## 4. Reports – structure and content (by topic)

Below is a topic‑by‑topic description of what each SH5 page presents and what we need to reproduce or approximate.

### 4.1 Main (index.htm)

- SH5 content:
  - Title: “Main – [year] [contest] [call] – SH5 v.x”.
  - Top table of **contest parameters**:
    - Callsign (with link to QRZ), Country, Locator.
    - Sunrise / Sunset.
    - Contest name, Category.
    - Operators list (with count and link to “Operators” report).
    - Start date, End date.
    - Participation time, Break time, Operating time.
    - Key stats: QSOs, Dupes, Unique callsigns, QSOs per station.
    - Kilometers per QSO, total Countries, Fields, Moves.
    - Claimed score, Software, Sunspot number, Club.
    - “Callsigns not found in sh5.master”, Prefixes.
  - Footer: “Created by SH5 v.x, [date]” + registration info.

- TODO:
  - [ ] Define which of these fields can be computed from a raw log alone:
    - QSO count, dupes, uniques, operators, time span, participation time, operating/break time.
  - [ ] Decide on optional fields that may require **extra files or config**:
    - Sunrise/sunset at station locator, sunspot number, “not in master” stats, fields map coverage, kilometers/QSO, software, club.
  - [ ] Implement the **Main** view that:
    - Shows all computable fields from the uploaded log.
    - Explicitly marks non-computable fields as “N/A” or hides them based on configuration.

### 4.2 Summary (summary.htm)

- SH5 content:
  - Band/mode summary: QSOs, points, multipliers, score per band and total.
  - Totals for all bands.

- TODO:
  - [x] Define generic **summary table schema**:
    - By band and optionally by mode (e.g. 10/15/20/40/80/160, CW/SSB/RTTY).
  - [ ] Calculate per band:
    - Total QSOs, dupes excluded, unique calls, maybe points/mults if contest rules are provided.
  - [x] Implement **Summary** report rendering using internal QSO data.

### 4.3 Log (log.htm)

- SH5 content:
  - Full chronological list of QSOs from the log.
  - Columns typically include: time, band, mode, frequency, call, sent/received exchange, points, multiplier flags, etc.
  - Optional “hide time in log” setting.

- TODO:
  - [x] Implement initial **log view** (first N rows) with basic columns (time, band, mode, freq, call, flags).
  - [ ] Implement **paginated or virtualized log view** for performance on large logs.
  - [ ] Choose a standard column set independent of contest type (with an extension mechanism).
  - [ ] Respect a “show/hide time” display toggle.

### 4.4 Operators (operators.htm)

- SH5 content:
  - List of operators.
  - For multi-op logs, QSOs per operator/station; totals, averages.

- TODO:
  - [ ] Define how to detect **operator/station** from ADIF/CBF fields (OPERATOR, STATION_CALLSIGN, etc.).
  - [ ] Aggregate **QSOs per operator** and compute:
    - Total QSOs per operator, percentages.
  - [ ] Implement the Operators report with a simple table.

### 4.5 All callsigns (all_callsigns.htm)

- SH5 content:
  - Alphabetical list of all unique callsigns worked.
  - May include per-call statistics (band count, QSO count, first/last time).

- TODO:
  - [x] Compute the set of unique calls.
  - [x] For each call, compute:
    - Total QSOs, bands worked, first/last QSO time.
  - [ ] Implement this view with sorting and basic filters (optional).

### 4.6 Rates (rates.htm)

- SH5 content:
  - QSO rates over time (e.g. 10‑minute or 60‑minute windows).
  - Often displayed as tables and/or inline charts.

- TODO:
  - [x] Decide on a **rate window** (current: hourly buckets and peak).
  - [ ] Add finer windows (e.g. 10‑minute) if needed.
  - [x] Precompute QSO counts per window and per band if needed (hourly done).
  - [ ] Implement a table and (optionally) small chart using canvas/SVG.

### 4.7 Countries (countries.htm)

- SH5 content:
  - Table of worked DXCC entities (countries).
  - For each country: QSOs, unique calls, bands, maybe distance stats.

- TODO:
  - [x] Implement mapping calls → country using **live `cty.dat`** (prefix table parsed at runtime).
  - [x] Aggregate per-country stats:
    - QSOs, uniques.
  - [x] Implement Countries report (QSOs, uniques table).
  - [ ] Add bands, first/last time if needed.

### 4.8 Countries by time (countries_by_time + band-specific pages)

- SH5 content:
  - `countries_by_time.htm`:
    - Shows when countries were worked over time (probably per hour vs country).
  - `10_countries_by_time.htm`, `15_...`, `20_...`, `40_...`, `80_...`, `160_...`:
    - Same concept but restricted to a single band.

- TODO:
  - [x] Decide **time granularity** (per hour).
  - [x] Build a matrix: time slot × country → QSO count (overall and per band).
  - [x] Implement:
    - Countries by time (all bands).
    - Countries by time per band (10/15/20/40/80/160).

### 4.9 Qs per station (qs_per_station.htm)

- SH5 content:
  - QSOs per station (operator position).

- TODO:
  - [x] If station identifiers exist in the log (e.g. STATION_ID/OPERATOR), aggregate QSOs (currently using OPERATOR/STATION_CALLSIGN).
  - [x] Otherwise, mark this report as “not available” or use only OPERATOR field (implemented).

### 4.10 Passed QSOs (passed_qsos.htm)

- SH5 content:
  - “Passed” QSOs: QSOs referred from one station to another (requires specific logging annotations).

- TODO:
  - [ ] Determine if input formats contain markers for passed QSOs.
  - [ ] If not generally available, treat this report as optional/advanced.

### 4.11 Dupes (dupes.htm)

- SH5 content:
  - List of duplicate QSOs (same call/band/mode with certain time constraints).

- TODO:
  - [x] Define **duplicate rules** (call + band + mode with simple seen-set).
  - [x] Compute and mark dupes during preprocessing.
  - [x] Provide Dupes report listing all such QSOs with context.

### 4.12 Qs by hour sheet (qs_by_hour_sheet.htm)

- SH5 content:
  - Grid/table of QSOs per hour for each band, plus totals.

- TODO:
  - [x] Build time buckets per hour.
  - [x] Count QSOs per band per hour.
  - [x] Render as a table similar to SH5.

### 4.13 Qs by hour graphs (graphs_qs_by_hour + band-specific)

- SH5 content:
  - `graphs_qs_by_hour.htm`: overall QSO rate vs time for all bands.
  - `10_graphs_qs_by_hour.htm`, `15_...`, etc.: per-band QSO/hour graphs.

- TODO:
  - [ ] Reuse the same hourly buckets as the sheet.
  - [ ] Render line/bar charts in canvas/SVG for:
    - All bands combined.
    - Individual bands (10/15/20/40/80/160).

### 4.14 Qs by minute (qs_by_minute.htm)

- SH5 content:
  - QSO count per minute over the contest period; may show short‑term bursts.

- TODO:
  - [x] Build per-minute buckets (current: 1-minute).
  - [x] Render as table (graph optional).

### 4.15 One minute rates (one_minute_rates.htm)

- SH5 content:
  - The highest 1‑minute rates, possibly with times and bands.

- TODO:
  - [x] Scan the per-minute series to find peak highs.
  - [x] Present top N one-minute rates with context (top 20 shown).

### 4.16 Prefixes (prefixes.htm)

- SH5 content:
  - Table of prefixes worked (e.g. DL1, W1, JA1).

- TODO:
  - [x] Implement a prefix extraction function from calls (longest match from cty prefixes).
  - [x] Aggregate QSOs per prefix and show counts/uniques.
  - [ ] Add per-band data if needed.

### 4.17 Distance (distance.htm)

- SH5 content:
  - Distance of QSOs (km), average distance, possibly histograms.

- TODO:
  - [x] Decide how to estimate distance with only client‑side data:
    - Station locator + remote locator or lat/lon from prefix table.
  - [x] Implement great-circle distance computation.
  - [x] Build histograms/averages for display (simple bucketed table).

### 4.18 Beam heading (beam_heading.htm)

- SH5 content:
  - Beam headings from home QTH to each QSO (azimuth).

- TODO:
  - [x] Use same geospatial model as distance.
  - [x] Compute bearing for each QSO.
  - [x] Aggregate by direction sectors (e.g. 0–30°, 30–60°, etc.) (table).

### 4.19 Break time (breaks.htm)

- SH5 content:
  - Breaks (off-times) derived from the log.
  - Total break time and percentage.

- TODO:
  - [x] Define “break” threshold (currently >60 minutes without QSO).
  - [x] Compute all gaps between QSOs and classify as breaks (simple table).

### 4.20 Continents (continents.htm)

- SH5 content:
  - QSOs by continent: counts, percentages, maybe per band.

- TODO:
  - [x] Map each QSO to a continent (using country/prefix table).
  - [x] Aggregate counts and render table (chart optional).

### 4.21 KMZ files (kmz_files.htm)

- SH5 content:
  - Links to Google Earth KMZ files for QSO locations.

- TODO:
  - [ ] Decide if we want to support generating KMZ as a **downloadable file** created client‑side (optional).
  - [ ] If yes, define simplified KMZ/KML output based on locator/lat/lon.
  - [x] Provide placeholder note (not implemented) for now.

### 4.22 Fields map (fields_map.htm)

- SH5 content:
  - Map of worked Maidenhead grid fields.

- TODO:
  - [x] Derive grid fields (e.g. JN, JO, etc.) from locators.
  - [x] Count fields and compute coverage count (table).
  - [ ] Render as a map (optional).

### 4.23 Callsign length (callsign_length.htm)

- SH5 content:
  - Distribution of callsigns by length (number of characters).

- TODO:
  - [x] Compute histogram of callsign lengths.
  - [x] Render as table (chart optional).

### 4.24 Callsign structure (callsign_structure.htm)

- SH5 content:
  - Analysis of callsign patterns (prefix/suffix structure).

- TODO:
  - [x] Decide on a simple pattern classification (prefix letters x suffix letters; includes digits count).
  - [x] Count calls per pattern and render table.

### 4.25 CQ zones & ITU zones (zones_cq.htm, zones_itu.htm)

- SH5 content:
  - Distribution of QSOs by CQ zone and ITU zone.

- TODO:
  - [x] Map calls to zones using data parsed from **live `cty.dat`**.
  - [x] Aggregate per zone: QSOs, uniques (bands TBD).

### 4.26 Sun (sun.htm)

- SH5 content:
  - Solar/geomagnetic indices corresponding to contest dates (from `ssnak.indices`).

- TODO:
  - [ ] Decide whether to support this **offline**:
    - Probably provide an optional static table for a limited date range.
    - Or mark as “not available” unless external data source is provided.
  - [x] Provide placeholder note for now.

### 4.27 Not in master (not_in_master.htm)

- SH5 content:
  - Calls not found in `sh5.master` callsign database.

- TODO:
  - [x] Fetch **master callsign list** from:
    - `https://www.supercheckpartial.com/MASTER.DTA` at runtime (on load or after upload).
  - [x] Parse `MASTER.DTA` into an efficient in‑memory structure (set of calls).
  - [x] Mark calls not found as “not in master” and aggregate them for this report.
  - [ ] Handle errors (no network, fetch/parse failure) by:
    - Marking the report as unavailable or degraded instead of breaking the app.

### 4.28 Possible errors (possible_errors.htm)

- SH5 content:
  - A list of QSOs flagged as suspicious or possibly incorrect (typos, wrong zones, bad exchanges, etc.).

- TODO:
  - [ ] Define **basic error detection rules**, e.g.:
    - Calls with invalid structure.
    - Zones inconsistent with prefix/country.
    - Impossible bands/frequencies for given band plan.
  - [ ] Mark QSOs and list them with explanation.

### 4.29 Charts and subcharts (charts*.htm)

- SH5 content:
  - `charts.htm`: index of chart views.
  - `charts_top_10_countries.htm`: chart of top 10 worked countries by QSO count.
  - `charts_qs_by_band.htm`: chart of total QSOs by band.
  - `charts_continents.htm`: chart of QSOs by continent.
  - `charts_beam_heading_by_hour.htm`: heatmap/graph of beam headings vs time.

- TODO:
  - [ ] Implement a small charting utility (or tiny custom chart functions) in JS:
    - Bar charts, line charts, maybe heatmaps.
  - [ ] Implement each chart view using previously computed aggregates:
    - Top 10 countries.
    - QSOs by band.
    - Continents distribution.
    - Beam heading by hour matrix.

### 4.30 Comments (comments.htm)

- SH5 content:
  - Free‑form text comments (likely imported from the log or user input).

- TODO:
  - [ ] Decide whether to read comments from:
    - ADIF COMMENT fields.
    - Or a separate text file / manual input.
  - [ ] Display comments in a simple text area / read‑only panel.

### 4.31 SH5 info (sh5.htm)

- SH5 content:
  - Technical information about the SH5 engine:
    - SH5 version, registered to, master file version, cty.dat version, indices range.
    - SH5 settings: passed QSO window, break time threshold, include log, hide time, etc.

- TODO:
  - [ ] Provide an analogous **“App info / Settings”** page:
    - App version, internal settings (break threshold, rate window, etc.).
    - Path / version info for any bundled auxiliary data (prefix table, zones table).
  - [ ] Allow some settings to be adjustable in the UI and reflected here.

---

## 5. Implementation plan (high level)

- [ ] Phase 1 – Minimal viable reports:
  - Implement upload, parsing (ADIF first), internal model, and:
    - Main, Summary, Log, Operators, All callsigns, Dupes, QS by hour sheet, simple rates.
- [ ] Phase 2 – Geo and country data:
  - Fetch and parse **`cty.dat` and `MASTER.DTA`** at runtime.
  - Add prefix → country/continent/zone mapping based on `cty.dat`.
  - Implement Countries, Continents, Zones, basic Distance and Beam heading.
- [ ] Phase 3 – Time‑based and chart reports:
  - Qs by minute, One minute rates, Countries by time, charts.
- [ ] Phase 4 – Advanced/optional reports:
  - Not in master, Sun, KMZ, Possible errors, Comments enhancements.
- [ ] Phase 5 – Polishing:
  - Styling tweaks, performance optimizations for large logs, documentation.

---

## 6. Open questions for discussion

- [ ] Which **contest types** must be supported initially (CQ WW only, or generic)?
- [ ] How much **DXCC / prefix / zone accuracy** is required for v1?
- [ ] Do we need fully matching **distance/beam headings** or is an approximate model ok?
- [ ] Should “Not in master” and “Sun” be implemented in v1 or left as placeholders?
- [ ] What is the **maximum log size** we need to handle comfortably in the browser?
- [ ] Preferred **languages/localization** (e.g. English only, or multi‑language labels)?
 - [ ] Deployment: will the page be opened mainly over **HTTP/HTTPS** (ideal for fetching `cty.dat` and `MASTER.DTA`), or must full `file://` usage be supported even if browsers restrict cross‑origin fetches?
