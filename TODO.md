# SH6 Contest Report Generator – TODO (recreated summary)

## Data & Parsing
- [x] ADIF parser (core fields, exchanges, grid, operator).
- [x] CBF parser (tolerant CSV/TSV/semicolon; operator/exchange/grid/CQ/ITU capture).  
  - [ ] Harden to fixed-field spec (zones/locators/operators) and bandplan validation.
- [x] Normalization (band/mode/time/call); derived prefix/country/zone via live `cty.dat`; master check via `MASTER.DTA`.
- [x] Dupes; per-hour/per-minute/10-minute buckets; station/grid → distance/heading.
- [ ] Basic validation expansion (band/freq plausibility, zone vs prefix, etc.).

## UI & Navigation
- [x] Static HTML/CSS/JS shell; sidebar nav + Prev/Next.
- [x] File upload; fetch `cty.dat`/`MASTER.DTA`; surface fetch errors.
- [x] Log pagination (200 rows); needs virtualization for very large logs.

## Reports (implemented)
- Main, Summary, Log (paged), Dupes, Operators/QS per station, Countries (bands/first/last), Continents, CQ/ITU zones, Qs by hour sheet, Rates (hour + 10-min peaks), Qs by minute, One-minute rates, Prefixes, Callsign length, Callsign structure, All callsigns, Not in master, Countries by time (all + per band), Distance, Beam heading, Breaks, Possible errors (heuristic), Comments, Fields map (table + bars), Beam heading by hour (sectors), Simple charts (Qs by band, Top 10 countries, Continents), KMZ/Sun placeholders.

## Reports (remaining/polish)
- [ ] Graphs Qs by hour: improve visuals (canvas/SVG) for all/per-band.
- [ ] Charts: better styling; beam heading by hour visualization.
- [ ] KMZ generation (optional) and richer fields map (visual map).
- [ ] Sun page: offline indices or configurable feed.
- [ ] Passed QSOs: detect if format supports it.
- [ ] Possible errors: add band/freq plausibility, zone vs prefix checks.
- [ ] Log view: toggle time visibility; add filters/sorting.

## Data enhancements
- [ ] Operator/station model: distinguish station IDs if present; per-station QSOs.
- [ ] Countries: add per-band multipliers/points if contest rules provided.
- [ ] Rate windows: optional 10-minute charts; per-band rates.

## Notes
- Serve via HTTP/HTTPS; `file://` may block fetching `cty.dat`/`MASTER.DTA`.
