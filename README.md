# SH6 Contest Report (client-side)

Use online: https://s53m.com/SH6/

SH6 is a static HTML/JS app that parses contest logs in your browser, fetches `cty.dat` and `MASTER.DTA`, and renders SH-style analysis reports. There is no required app backend for core reporting.

## Quick start
- Open https://s53m.com/SH6/
- On **START**, choose compare mode (1-4 logs)
- Load logs by:
  - Upload / drag-and-drop
  - Public archive search (GitHub raw access)
  - Demo log
- Open reports from the left menu

## Supported formats
- Cabrillo: `.log`, `.cbr`
- ADIF: `.adi`, `.adif`

## Current highlights
- Single + compare mode (up to 4 slots)
- Compare workspace toolbar with sync/sticky toggles and quick insight jumps
- Compare Insights cockpit for score, rate, multiplier, band, operating-style, and break gaps with direct QSO drilldowns
- CQ API enrichment (scores/history/records + competitor coach)
- Competitor coach priority cards with severity badges and direct rival-load actions
- Spots + RBN spots with interactive drilldown by band/hour and filters (continent, CQ zone, ITU zone)
- Spots coach action cards with one-click jump to detailed analysis sections
- Spot hunter for current-day opportunities
- Contest scoring engine with claimed vs computed score details
- Point-rate and QSO-rate reports
- Chart metric mode toggle (`Absolute` vs `Normalized %`) for fair compare across unequal log sizes
- Map view (Leaflet/OpenStreetMap) + KMZ exports
- **EXPORT PDF, HTML, CBR** menu for report and raw-log exports
- Save/load session and permalink support

## Running locally
Serve the repository over HTTP/HTTPS and open `index.html`.

## Performance diagnostics

Run deterministic parsing, analysis, worker-payload, and four-log benchmarks:

```sh
node scripts/run-performance-benchmark.js
node scripts/run-performance-benchmark.js --real-log /path/to/large-log.adi
bash scripts/run-browser-performance-benchmark.sh /path/to/log.adi
bash scripts/run-browser-performance-benchmark.sh --four-log 20000
```

In the browser, `window.SH6.getPerformance()` returns startup, worker, report-ready, render, and long-task timings. The v6.3.20 baseline and results are documented in [`docs/performance/SH6-v6.3.20-performance.md`](docs/performance/SH6-v6.3.20-performance.md).

## Privacy / network
- Log parsing happens locally in your browser (files are not uploaded by default)
- Optional network fetches are used for:
  - `cty.dat`
  - `MASTER.DTA`
  - archive search/load
  - CQ API enrichment
  - optional lookup/spot services
