# SH6 Contest Report (client-side)

Use online: https://s53zo.github.io/SH6/

SH6 is a static HTML/JS app that parses contest logs in your browser, fetches `cty.dat` and `MASTER.DTA`, and renders SH-style analysis reports. There is no required app backend for core reporting.

## Quick start
- Open https://s53zo.github.io/SH6/
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
- CQ API enrichment (scores/history/records + competitor coach)
- Spots + RBN spots with interactive drilldown by band/hour and filters (continent, CQ zone, ITU zone)
- Spot hunter for current-day opportunities
- Contest scoring engine with claimed vs computed score details
- Point-rate and QSO-rate reports
- Map view (Leaflet/OpenStreetMap) + KMZ exports
- **EXPORT PDF, HTML, CBR** menu for report and raw-log exports
- Save/load session and permalink support

## Running locally
Serve the repository over HTTP/HTTPS and open `index.html`.

## Privacy / network
- Log parsing happens locally in your browser (files are not uploaded by default)
- Optional network fetches are used for:
  - `cty.dat`
  - `MASTER.DTA`
  - archive search/load
  - CQ API enrichment
  - optional lookup/spot services
