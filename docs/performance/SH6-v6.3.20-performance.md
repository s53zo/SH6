# SH6 v6.3.20 performance audit

Date: 2026-07-11  
Branch: `NTv5.4`  
Environment: macOS (`darwin-x64`), Node.js `v25.8.2`, Chromium through `agent-browser`

## Scope and method

The historical baseline was captured before the performance changes on the same workstation. The current tree can reproduce the final measurements, but it cannot independently reproduce those baseline values; no baseline checkout or raw machine-readable baseline artifact is included here. Treat baseline deltas as historical audit evidence, not as a benchmark that this checkout alone can regenerate. Final command-line values are medians unless explicitly marked as a single real-log or browser run.

Node derivation measurements are repeated operations in one warm process and can reuse immutable resource indexes after first use. They are therefore warm-process throughput measurements, not cold-cache timings. Browser START values come from a newly created browser session and are process-cold for the page under test, although operating-system disk caches are uncontrolled. The Node benchmark emits this distinction in its `methodology` object.

Datasets:

- Small: deterministic 100-QSO synthetic log and a 33-QSO browser fixture.
- Typical: deterministic 2,000-QSO synthetic log.
- Large: deterministic 20,000-QSO synthetic log.
- High-cardinality: 2,000 and 20,000 unique calls, to avoid benchmarking only cache-friendly repeated calls.
- Four-log: four distinct 2,000-QSO and 20,000-QSO logs. The browser generator aligns all four slots to the same contest interval, offsets timestamps by 250 ms per slot, and includes the slot ID in callsigns; a real browser run also used 4 x 20,000 QSOs.
- Scale guard: 4 x 40,000 QSOs crossing a UTC week boundary.
- Extreme real log: `adif-20266121220256.adi`, 93,534,277 bytes and 472,658 QSOs. This local user file is not committed.

Reproduce the measurements:

```sh
node scripts/run-performance-benchmark.js
node scripts/run-performance-benchmark.js --real-log /path/to/large-log.adi
bash scripts/run-browser-performance-benchmark.sh /path/to/log.adi
bash scripts/run-browser-performance-benchmark.sh --four-log 20000
```

The browser harness blocks analytics and optional CDN routes to remove those external dependencies from local timing; the blocked routes are included in its JSON output. This improves repeatability but does not make workstation scheduling or OS caches deterministic. Map lazy-loading was checked separately with deterministic Leaflet responses. In a running page, `window.SH6.getPerformance()` returns navigation timing, bounded events/long tasks, worker timing, next-paint report timing, and render summaries. Each browser command has a bounded execution time, including session cleanup.

## Result summary

| Workflow | Baseline | Final | Change |
| --- | ---: | ---: | ---: |
| Local START interactive, observed samples | 288-311 ms | 258-279 ms | target met; single-run ranges |
| Small browser log, selection to data ready | not recorded | 86 ms | under 1 second |
| Small browser log, selection through first painted report | not recorded | 391 ms | under 1 second |
| Real 93 MB log, selection to data ready | 17,103 ms | 11,637 ms | 32.0% faster |
| Real 93 MB log, selection through first painted report | approximately 17.1 s | 12,287 ms | approximately 28% faster |
| Real-log derived analysis, warm Node process | 15,035.9 ms | 6,960.2 ms | 53.7% faster |
| Real-log main-thread long-task total | 4,740 ms | 2,279 ms | 51.9% lower |
| Real-log longest main-thread task | 2,484 ms | 2,034 ms | 18.1% lower |
| Small report transition through next paint | not recorded | 39 ms | under 100 ms |
| Real-log Main transition through next paint | not recorded | 204 ms | extreme-input result |
| Real-log Main HTML generation | 11.8 ms | 1.6 ms | below one frame in both runs |

START remains comfortably below the one-second target. The range is reported instead of a precise percentage because browser-process and cache state create meaningful single-run variance.

The baseline build did not expose a worker-ready signal or next-paint report event. Its first-report value is therefore an approximation from data-ready plus measured render generation, and its observed 3,867 ms single-payload clone is retained only as a transfer proxy, not used for a percentage claim. v6.3.20 adds separable worker startup, resource round-trip, data-ready, and next-paint events for future comparisons.

## Parsing and analysis benchmarks

All values are milliseconds. Parse, derive, and analyze are separate measurements; analyze includes parse plus derived analysis. These are warm-process medians, and the historical baseline used the same repeated-process shape. They quantify steady-state throughput and must not be presented as cold-cache latency.

| Dataset | Metric | Baseline | Final | Change |
| --- | --- | ---: | ---: | ---: |
| 100 QSOs | Parse | 0.99 | 0.90 | 9.1% faster |
| 100 QSOs | Derive | 17.75 | 7.50 | 57.7% faster |
| 100 QSOs | Analyze | 16.55 | 4.53 | 72.6% faster |
| 2,000 QSOs | Parse | 17.10 | 12.25 | 28.4% faster |
| 2,000 QSOs | Derive | 62.22 | 44.67 | 28.2% faster |
| 2,000 QSOs | Analyze | 78.79 | 61.82 | 21.5% faster |
| 20,000 QSOs | Parse | 129.08 | 121.68 | 5.7% faster |
| 20,000 QSOs | Derive | 400.87 | 370.24 | 7.6% faster |
| 20,000 QSOs | Analyze | 543.11 | 500.36 | 7.9% faster |
| 472,658 QSOs | Parse | 3,791.0 | 3,628.5 | 4.3% faster |
| 472,658 QSOs | Derive | 15,035.9 | 6,960.2 | 53.7% faster |

The parser was intentionally left semantically unchanged; its small differences are normal run variation. Final high-cardinality derive medians were 58.86 ms for 2,000 unique calls and 571.68 ms for 20,000 unique calls. This makes the workload shape explicit while the supplied real log confirms the large practical gain.

## Four-log and worker benchmarks

| Measurement | Legacy/baseline shape | Final | Change |
| --- | ---: | ---: | ---: |
| 4 x 2,000 engine task clone | 97.53 ms | 70.36 ms | 27.9% lower |
| 4 x 20,000 engine task clone | 687.91 ms | 680.33 ms | 1.1% lower; QSO transfer dominates |
| 4 x 20,000 derived analysis | 1,606.57 ms | 1,361.97 ms | 15.2% faster |
| 4 x 20,000 compare projection | main thread during interaction | 6.36 ms in worker after analysis |
| 4 x 20,000 compare request clone | 246.17 ms of QSO data | 0.01 ms of IDs + filters | QSO clone removed |
| 4 x 20,000 compare bucketing | not recorded | 21.20 ms | new direct metric |
| 4 x 20,000 browser worker compare | not recorded | 24.6-27.1 ms | observed runs; no fallback |
| 4 x 20,000 browser click through painted Log | not recorded | 121.1-149.9 ms | observed runs; longest main task 50-63 ms |
| 4 x 40,000 scale guard | previously threw above argument limit | 52.5 ms | 160,000 QSOs pass |

The comparison worker now retains a compact per-slot projection produced off the main thread. Filter changes send only slot IDs and filters, so they no longer rebuild and clone all four logs. The four-log Log report window is capped adaptively (100 rows with four slots), reducing the measured HTML from about 326 KB to 35 KB and the longest render-path main task from 420 ms to 50 ms.

The supplied real log also passed a four-copy comparison calculation: 1,890,632 QSO references were bucketed in 481.3 ms without the former `RangeError`. That computation remains in the worker in the browser.

Actual browser worker startup was 25.8 ms on the final real-log run. Static resource configuration took 36.1 ms round trip and occurs once per resource revision; the Node-only resource clone median was 18.85 ms. Real-log worker analysis/result transfer took 11,208.9 ms.

## Confirmed bottlenecks

1. CTY lookup was the dominant compute hotspot. A CPU profile attributed 3,397 samples to `findPrefixEntry`; each uncached lookup linearly scanned 7,330 CTY entries. The main derive loop accounted for 3,115 samples and ADIF parsing for 1,672.
2. Per-QSO metadata was normalized and recomputed repeatedly. Base calls, structure checks, prefix data, and WPX prefixes are now reused through a bounded cache.
3. Worker tasks repeatedly cloned static analysis resources. The worker now receives them only when their identity or revision changes.
4. Compare projections and full QSO arrays were copied on the main thread and retransmitted for every filter change.
5. The four-log Log view generated a 1,000-row/roughly 326 KB HTML window; DOM insertion and binding, not bucketing, caused the 420 ms main task.
6. Large compare ordering used `Math.min(...timestamps)`, which exceeds the JavaScript argument limit around 150,000 QSOs.
7. CTY, MASTER, scoring, and lookup completions could request overlapping full re-derives; stale results were discarded only after doing the work.
8. CTY, MASTER, and scoring fetches used `no-store`, preventing safe reuse.
9. Optional Leaflet was loaded on the START page path. Analytics initialization was deferred until after local page load; that reduces startup contention, but the available timings do not prove analytics was part of the original critical path. SQL remains on its archive-use path.

The following suspected areas did not justify broader changes:

- Main-report HTML generation was about 11.8 ms at baseline, so the general renderer was not a hotspot. Only the confirmed large compare window was reduced.
- Existing single-log Log rendering already uses virtualization and continues to pass in both Contester and DXer modes.
- A single-pass ADIF parser prototype was slightly slower and was reverted in full.

## Implemented optimizations

- Indexed exact and prefix CTY entries while preserving original first-match precedence, including unsorted/custom tables.
- Reused immutable CTY, MASTER, and callsign-grid indexes through `WeakMap` caches.
- Added a bounded 25,000-entry per-analysis callsign metadata cache and a supported-band fast path.
- Cached static resources in the analysis worker, fixed resource-sync serialization, and used a stable empty-resource identity.
- Coalesced CTY, MASTER, scoring, and lookup re-derive requests into one active calculation plus, when required, one latest-state follow-up.
- Retained compare projections in the analysis worker, preserved operator/duplicate fields, and sent only IDs/filters for compare work.
- Replaced large timestamp spreads with iterative range scans in compare, hour, and minute paths.
- Reduced large compare report windows adaptively while keeping complete next/previous navigation.
- Enabled normal browser caching for unchanged CTY, MASTER, and scoring resources with existing fallbacks intact.
- Loaded Leaflet only when Map is opened, kept SQL on its existing archive-use path, and started analytics after local page load. The analytics change is treated as contention reduction, not a measured critical-path removal.
- Added bounded browser instrumentation and deterministic Node/browser benchmarks, including worker startup, resource round trip, next-paint report readiness, long tasks, direct compare work, and 160,000-QSO regression coverage.

## Correctness and verification

- JavaScript syntax validation passed for all tracked non-vendor JavaScript files.
- Shell syntax validation passed for benchmark and smoke scripts.
- `git diff --check` passed.
- The complete repository regression/browser smoke matrix passed sequentially, including analysis, archive, canvas, coach, compare, CQ API, DXer, exports, startup/fallback, investigation, Log rendering, navigation, scoring, sessions, storage, Spots, and RBN.
- Analysis-core regression coverage locks CTY exact/prefix/portable/first-match behavior and ADIF edge cases.
- Compare-core regression coverage locks operator/dupe filtering, week-wrap ordering, all four counts, and 160,000-QSO execution.
- A 4 x 20,000 browser workflow completed through the worker with no main-thread fallback, 24.6 ms worker compare time, and no task longer than 50 ms during the separately click-aligned Log render interaction. The harness now records the pre-click report-event count and waits for a new post-click paint event, rather than correlating unrelated latest events.
- Final clean verification runs on 2026-07-11 measured 24.0-25.6 ms worker comparison, 148.4-149.9 ms click-to-paint, 63-64 ms longest compare-interaction tasks, and 7.5-13.8 ms maximum animation-frame probes while later log analyses were in flight. The live render assertion also confirmed that the requested 1,000-row session preference remained unchanged while the four-log view used its 100-row adaptive window.
- The final 93 MB browser run completed through the worker with no analysis fallback.
- Repeat-load cache verification showed zero transfer bytes for unchanged CTY, MASTER, and scoring resources while decoded sizes remained unchanged.
- A deterministic browser check proved Leaflet was absent before Map, then loaded its CSS/JS and initialized Map on first use.

## Remaining risks and recommended follow-up

- The 93 MB input still produces a roughly 2.0-second main-thread task when the enormous worker result is delivered. Chunked results, transferable columnar data, or keeping more report state in the worker are the next high-value options, but each changes a broad data contract.
- The extreme Main report transition is about 204 ms through the next paint. Normal and four-log interactions avoid 200 ms main-thread tasks, but this deliberately extreme input remains just beyond that interaction target.
- Worker-resident compare projections add bounded per-loaded-log memory in the worker. They are replaced on reload and cleared on slot reset, but four exceptionally large simultaneous logs still require memory testing on lower-end devices.
- Hardware-throttled mobile measurements were not run. Use the reproducible harness on representative slower devices before setting device-specific budgets.
- Optional networks can still fail when their feature is used. Leaflet success/failure UI and archive/CQ/Spots/RBN fallbacks remain important; deterministic tests do not replace an optional live integration check.
