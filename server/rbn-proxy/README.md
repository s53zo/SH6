# RBN proxy

Source imported from the running Rust proxy on S50DXS (2026-11-05). Existing single-call `/rbn?call=...&days=...`, `/rbn/live` and `/health` remain supported.

## Batch archive API

`GET /rbn?calls=EF8R,CQ9A,PJ2T&days=20251129,20251130`

Public URL: `https://azure.s53m.com/cors/rbn?calls=EF8R,CQ9A&days=20251129`

Response: `{ "batchVersion": 1, "maxCalls": 32, "maxDays": 2, "maxSpots": 100000, "results": [...] }`.
The optional `ofUsOnly=1` query returns only spots of the requested stations, with `byUsIncluded:false`; ordinary requests still return both directions. Omitted by-station records do not consume the response budget. Each result has the existing single-call fields (`call`, `days`, totals, `ofUsSpots`, `byUsSpots`, errors and truncation flags) plus `baseCall`. Original calls are preserved as result keys; matching uses the existing base-call policy. Invalid calls/dates and oversized requests return HTTP 400. Duplicate calls/dates collapse.

Each date is decompressed/filtered once for all requested calls, under the existing archive-scan lock. The 100,000-record budget covers the complete batch, including both directions and dates. Counts continue after the budget is exhausted, and affected calls carry truncation flags. Missing days yield explicit per-call errors, never confirmed empty coverage. Live-day batches read the live shard once.

## Build and stage

On the Linux host with the existing Rust toolchain/dependency cache:

```
cargo test --offline
cargo build --release --offline
RBN_PROXY_DISABLE_INGEST=1 RBN_PROXY_LISTEN=127.0.0.1:18095 target/release/rbn-proxy-rs
```

The production service is `rbn-proxy.service`, executable `/opt/SH6/rbn-proxy/rbn-proxy`, source `/opt/SH6/rbn-proxy/rbn-proxy-rs/src/main.rs`. Back up executable and source before replacement. Stage with ingest disabled; compare batch payloads against single-call payloads before replacing the binary atomically and restarting the service. Check `/health`, the public batch URL, and `/rbn/live`. Restore the saved binary/source and restart to roll back. Never run a second ingest-enabled staging process.

Real historical comparison on 20251129: EF8R, CQ9A and PJ2T returned identical records/counts to three single calls; one batch took 2.183 seconds versus 6.132 seconds combined for the single calls (warm daily ZIP cache, one observation).

Deployment on 2026-11-05 passed public batch, existing live-feed, and SH6 ingestion checks. The pre-upgrade rollback copy is `/opt/SH6/rbn-proxy/backup-batch-20261105T130601Z` on S50DXS.
