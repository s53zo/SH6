# CQ API Enrichment Todo

Last updated: 2026-02-08
Branch: `cq_api`

## 1. CQ API quick reference

- Base pattern (direct): `https://<contest-domain>/api/get/<endpoint>`
- Endpoint: `geolist`
  - Returns geo codes and labels (e.g. `WORLD`, `W1`, `EUR`)
- Endpoint: `catlist`
  - Returns category list with descriptions
- Endpoint: `clublist`
  - Returns clubs and regions
- Endpoint: `score/<mode>/<year|*>/<callsign>`
  - Returns score rows for a call/operator
- Endpoint: `record/<mode>/<category>/<geo>`
  - Returns record holder row for category + geo

API response notes:
- Success is generally `status: 200`.
- Some endpoints use `status_message`, some use `status message`.
- `CQWW` and `CQ160` expose multipliers differently than `CQWPX`.

## 2. Supported CQ contests

Contest IDs and domains used in SH6 enrichment module:
- `CQWW` -> `https://cqww.com`
- `CQWPX` -> `https://cqwpx.com`
- `CQWWRTTY` -> `https://cqwwrtty.com`
- `CQWPXRTTY` -> `https://cqwpxrtty.com`
- `CQ160` -> `https://cq160.com`

Mode mapping implemented:
- `CQWW`, `CQWPX`, `CQ160`: `cw`, `ph`
- `CQWWRTTY`, `CQWPXRTTY`: `rtty`

## 3. Public log archive source URLs (from Hamradio-Contest-logs-Archives scripts)

From `scripts/download_*` in `s53zo/Hamradio-Contest-logs-Archives`:
- `download_cqww_logs.py` -> `https://cqww.com/publiclogs/`
- `download_cqwpx_logs.py` -> `https://cqwpx.com/publiclogs/`
- `download_cqwwrtty_logs.py` -> `https://cqwwrtty.com/publiclogs/`
- `download_cqwpxrtty_logs.py` -> `https://cqwpxrtty.com/publiclogs/`
- `download_cq160_logs.py` -> `https://cq160.com/publiclogs/`

## 4. SH6 implementation plan (granular)

### 4.1 Client module and loading
- [x] Create separate lazy-loaded JS module `cq-api-enrichment.js`.
- [x] Keep `main.js` initial load lighter by dynamic script injection.
- [x] Add contest normalization and mode/category/geo inference.
- [x] Add endpoint wrappers for `geolist`, `catlist`, `clublist`, `score`, `record`.
- [x] Add response normalization for `status_message` and `status message`.

### 4.2 Data fetch behavior
- [x] Add in-memory cache and in-flight request deduplication.
- [x] Add localStorage cache for list endpoints (`geolist`, `catlist`, `clublist`).
- [x] Add proxy-first, direct-fallback source strategy.
- [x] Add enriched output object: current score, history, record, labels, source metadata.

### 4.3 SH6 UI integration
- [x] Add `apiEnrichment` state to primary and compare slots.
- [x] Trigger enrichment fetch after each loaded log.
- [x] Add CQ API status row in sidebar (`pending/loading/ok/error`).
- [x] Add source marker support for CQ API (`source-indicator`).
- [x] Add Main report CQ API enrichment card with:
  - [x] contest/mode summary
  - [x] current score + QSOs + multipliers
  - [x] record holder + record score + multipliers
  - [x] geo/category label resolution
  - [x] recent history table
- [x] Add CORS-help hint text in error state.

### 4.4 Responsiveness and rendering quality
- [x] Add dedicated card/table CSS classes for enrichment output.
- [x] Add mobile adjustments for CQ API card text density.

### 4.5 Validation
- [x] Syntax check `main.js`.
- [x] Syntax check `cq-api-enrichment.js`.
- [x] Validate proxy endpoint responses and headers.

## 5. CORS helper deployment (server)

Problem found:
- Direct contest API responses do not provide browser-friendly CORS headers.
- Existing helper path `https://azure.s53m.com/cors/cqapi/...` returned `404` before deployment.

Deployed fix (on `azure.s53m.com`):
- Nginx config file: `/opt/nginx-certbot/default.conf`
- Added rate-limit zones:
  - `sh6_cqapi_per_ip` at `120r/m`
  - `sh6_cqapi_total` at `800r/m`
- Added contest-specific proxy routes:
  - `/cors/cqapi/cqww/(.+)` -> `https://cqww.com/api/get/$1`
  - `/cors/cqapi/cqwpx/(.+)` -> `https://cqwpx.com/api/get/$1`
  - `/cors/cqapi/cqwwrtty/(.+)` -> `https://cqwwrtty.com/api/get/$1`
  - `/cors/cqapi/cqwpxrtty/(.+)` -> `https://cqwpxrtty.com/api/get/$1`
  - `/cors/cqapi/cq160/(.+)` -> `https://cq160.com/api/get/$1`
- Preserved global CORS headers from server block.

Deployment validation performed:
- Containerized `nginx -t` using same mounted config/certs path.
- Restarted `nginx.service`.
- Verified `HTTP 200` + `Access-Control-Allow-Origin: *` for:
  - `https://azure.s53m.com/cors/cqapi/cqwpx/geolist`
  - `https://azure.s53m.com/cors/cqapi/cqww/geolist`

Backup created on server:
- `/opt/nginx-certbot/default.conf.bak.20260208034255`

## 6. Remaining follow-up tasks

- [ ] Add optional debug view to display raw CQ API payload when `window.SH6_API_DEBUG` is enabled.
- [ ] Add defensive retry with short backoff for transient contest API failures.
- [ ] Add lightweight end-to-end browser test for one known call/year scenario.

