# SH6 report parity - TODO

Goal: match legacy report content/structure as closely as practical using online-generated data (ADIF/CBR). This list is derived from the legacy sample pages and current SH6 renderers.

## Input/log normalization (shared prerequisites)
- [ ] Ensure ADIF/CBR parser exposes fields needed by legacy reports: callsign, operator, station callsign, contest id, band/freq, mode, RST sent/rcvd, serial/exchange, points, continents, CQ/ITU zones, grid/locator, time on/off, and any N1MM app fields.
- [ ] Add derived QSO index (1..N) to match legacy log links and rate windows.
- [ ] Normalize modes into CW/Digital/Phone buckets (legacy summary/rates).
- [ ] Capture station metadata (country, locator, lat/lon) for distance/beam heading/fields map.
- [ ] Add solar data hooks (SSN/K-index by hour) if available; otherwise allow CSV/JSON import.

## Report-by-report TODO (match legacy content/columns)

### Main (index.htm)
- [ ] Replace SH6 main fields with legacy parameter list: Callsign, Country, Locator, Sunrise/Sunset, Contest, Category, Operators, Start/End date, Participation/Break/Operating time, QSOs, Dupes, Unique callsigns, QSOs per station, Kilometers per QSO, Countries, Fields, Moves, Claimed score, Software, SSN, Callsigns not in master, Prefixes, Club.
- [ ] Compute sunrise/sunset from station locator; compute break/operating time; compute moves/points if present in log.
- [ ] Link key values to their reports (dupes, countries, prefixes, etc.) like the legacy layout.

### Summary (summary.htm)
- [ ] Replace SH6 summary table with legacy columns: Band, CW, Digital, Phone, All, Countries, Qs Pts, Map.
- [ ] Compute per-mode counts, per-band countries, and points; include map placeholder/links.

### Log (log.htm)
- [ ] Replace static table with legacy-style log viewer: page links (500 Qs/page), callsign search, and JS-driven table.
- [ ] Match legacy column order/labels (based on legacy log script); include QSO # and exchange/RST fields.
- [ ] Add search and deep-linking from other reports (qs links open/filter log).

### Operators (operators.htm)
- [ ] Switch from QSOs table to legacy layout: operator cards with QRZ links and optional photos.
- [ ] Define photo lookup (images folder naming) and fallback behavior.

### All callsigns (all_callsigns.htm)
- [ ] Change to legacy format: list of callsigns with QSO counts (#, Callsign, QSOs).
- [ ] Add links to log filter per callsign (like the legacy layout).

### Rates (rates.htm)
- [ ] Implement legacy periods table: 10/20/30/60/120 min windows with QSOs, per-minute, per-hour, start/end time, start/end QSO #.
- [ ] Add links to log ranges for each row.

### Countries (countries.htm)
- [ ] Replace SH6 columns with legacy columns: #, Cont., Country, Distance (km), QSOs, Bands, Map.
- [ ] Compute per-country distance (avg/median as the legacy reports expect), continent, and band list.

### Countries by time (countries_by_time*.htm)
- [ ] Replace SH6 hour matrix with legacy heatmap layout: per-continent sections, country rows, 15-min buckets by hour, legend, and All m Qs per country.
- [ ] Implement band-filtered variants (10/15/20/40/80/160) with identical structure.
- [ ] Use legacy color classes (s0..s9) for bucket intensity.

### QSOs per station (qs_per_station.htm)
- [ ] Implement legacy grouping: rows by QSO count, with list of callsigns in that bucket, stations count, total QSOs per bucket.
- [ ] Add log links for each callsign.

### Passed QSOs (passed_qsos.htm)
- [ ] Define detection rules for “passed” QSOs (needs marker in log or heuristic) and render legacy-style output.

### Dupes (dupes.htm)
- [ ] Render dupes via legacy log viewer (same log script) with dupe indices highlighted.

### Qs by hour sheet (qs_by_hour_sheet.htm)
- [ ] Replace SH6 hour table with legacy columns: Day, Hour, SSN, K-index, per-band counts, All, Accum., Pts, Avg. Pts.
- [ ] Add accumulation and points per hour.

### Qs by hour (graphs_qs_by_hour*.htm)
- [ ] Replace bar list with legacy chart-style output (all bands + band-specific pages).
- [ ] Match legacy hour binning and styling.

### Qs by minute (qs_by_minute.htm)
- [ ] Replace list with legacy minute heatmap table (Day/Hour + 60 minute columns) using s0..s9 classes.

### One minute rates (one_minute_rates.htm)
- [ ] Replace top-20 list with legacy grouped table: Qs per minute, list of minutes (links to log), and total count.

### Prefixes (prefixes.htm)
- [ ] Replace SH6 prefix summary with legacy columns: #, Cont., ID, Country, Prefixes (list).
- [ ] Use cty.dat prefix metadata for continent and country.

### Distance (distance.htm)
- [ ] Replace SH6 distance stats with legacy columns: Distance (km), QSOs, %, Map.
- [ ] Add distance binning to match legacy ranges; include per-bin percentage.

### Beam heading (beam_heading.htm)
- [ ] Replace SH6 sector list with legacy columns: Heading (deg), QSOs, %, Map.
- [ ] Add heading bins and percentages; map/rose placeholder.

### Break time (breaks.htm)
- [ ] Replace SH6 gap list with legacy columns: #, From, To, Break time (HH:mm), Accum. HH:mm.
- [ ] Ensure break thresholds/logic match legacy behavior.

### Continents (continents.htm)
- [ ] Replace SH6 table with legacy columns: Continent, QSOs, Map.

### KMZ files (kmz_files.htm)
- [ ] Implement KMZ generation per band with download links (or stub list matching legacy format).

### Fields map (fields_map.htm)
- [ ] Replace SH6 bar list with legacy grid map of Maidenhead fields (clickable, colored by count).
- [ ] Implement mapf/grid interaction and per-field counts.

### Callsign length (callsign_length.htm)
- [ ] Replace SH6 table with legacy columns: Length, Callsigns, %, QSOs, %.

### Callsign structure (callsign_structure.htm)
- [ ] Replace SH6 table with legacy columns: #, Structure, Example, Callsigns, %, QSOs, %.

### CQ zones / ITU zones (zones_cq.htm, zones_itu.htm)
- [ ] Replace SH6 tables with legacy columns: Zone, Number of countries in zone, QSOs, Map.

### Sun (sun.htm)
- [ ] Implement legacy-style solar report (SSN/K-index by hour, sunrise/sunset data). Provide data source or allow user import.

### Not in master (not_in_master.htm)
- [ ] Replace SH6 list with legacy grouping by QSO count: QSOs | Callsigns | Total.
- [ ] Add log links for each callsign.

### Possible errors (possible_errors.htm)
- [ ] Replace SH6 heuristic list with legacy comparison: callsign in log vs nearest/possible calls in MASTER.DTA (1-char differences, permutations).

### Charts (charts.htm + subcharts)
- [ ] Implement legacy-style charts: Qs by band, Top 10 countries, Continents, Frequencies, Beam heading, Beam heading by hour.
- [ ] Align chart labels and ordering with legacy output.

### Comments (comments.htm)
- [ ] Verify comments extraction matches legacy output (order and formatting).

### SH6 info (sh6.htm)
- [ ] Replace SH6 “App info” with legacy-style parameter table (version, generation date, file info, etc.).

## Cross-cutting legacy behavior to replicate
- [ ] Provide log filter links from reports (callsign/range) similar to legacy `sqs()` behavior.
- [ ] Align number formatting, date formatting, and UTC handling to legacy output.
- [ ] Ensure report order matches legacy menu order and band-specific pages.
- [ ] Use legacy heatmap classes (`s0..s9`) and table striping for reports that rely on intensity.
