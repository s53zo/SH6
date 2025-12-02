# SH6 Contest Report (client-side)

Static HTML/JS app that parses ADIF/CBF contest logs in the browser, fetches `cty.dat` and `MASTER.DTA` at runtime, and renders SH5-like reports (Main, Summary, Log, Dupes, Countries, Continents, Zones, Rates, etc.). No server-side code.

## Usage
- Serve or open `index.html` via HTTP/HTTPS.
- Upload an ADIF/CBF log; the app fetches the latest `cty.dat` and `MASTER.DTA` automatically.
- Reports populate in the browser; no server code required.
- Opening via `file://` may block network fetches in some browsers.

## Status
- Parsing: ADIF, basic CBF (semicolon/comma/tab separated; band inference; operator/exchange/grid/CQ/ITU capture).
- Derived: dupes, band summary, countries/continents/zones, prefixes, callsign length/structure, operators, per-hour/minute, countries-by-time, not-in-master, distance/heading (if station/location data present), breaks, comments, possible errors (heuristic).
- Reports implemented: Main, Summary, Log (paged 200 rows), Dupes, Operators/QS per station, Countries (with bands/first/last), Continents, CQ/ITU zones, Qs by hour sheet, Rates, Qs by minute, One-minute rates, Prefixes, Callsign length, Callsign structure, All callsigns, Not in master, Countries by time (overall + per band), Distance, Beam heading, Breaks, Possible errors, Comments, simple charts (Qs by band, Top 10 countries, Continents), Fields map (table), Beam heading by hour (sector table), KMZ/Sun placeholders.

## Next steps
- Harden CBF fixed-field parsing (zones/locators/operators).
- Add beam heading by hour chart and chart polish.
- Refine possible errors, KMZ/fields map/sun pages, and improve log virtualization.
