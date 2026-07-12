# SH6 v6.3.21 Compare Insights Performance

Measured: 2026-07-12  
Platform: macOS, Node v25.8.2, browser automation against local HTTP

## Test log

The requested `~/Downloads/adif-20266111160038.adi` was not present. The nearest current large export was used instead:

- `~/Downloads/adif-20266121220256.adi`
- 93,534,277 bytes
- 472,658 parsed QSOs

## Node benchmark comparison

The same command was run before and after implementation:

```sh
node scripts/run-performance-benchmark.js --real-log "$HOME/Downloads/adif-20266121220256.adi"
```

| Metric | Before | After | Difference |
| --- | ---: | ---: | ---: |
| Real-log parse | 3,791.47 ms | 3,637.81 ms | -4.1% |
| Real-log derive | 7,545.98 ms | 7,058.68 ms | -6.5% |
| Compare projection | 93.37 ms | 100.50 ms | +7.6% |
| Compare buckets | 140.81 ms | 137.55 ms | -2.3% |
| Four-copy compare buckets | 502.01 ms | 489.72 ms | -2.4% |
| 160k comparison guard | 53.70 ms | 51.36 ms | -4.4% |

The small compare-projection increase is below one millisecond per 10,000 QSOs and is consistent with warm-process variance; Compare Insights does not run in this benchmark or change the projection implementation.

## Browser benchmarks

Real-log command:

```sh
bash scripts/run-browser-performance-benchmark.sh "$HOME/Downloads/adif-20266121220256.adi"
```

Results: startup interactive 262.2 ms, file-to-data-ready 11,943.9 ms, file-to-first-report 12,631.7 ms, main report render 1.6 ms.

Deterministic four-log command:

```sh
bash scripts/run-browser-performance-benchmark.sh --four-log 20000
```

Results: 80,000 total QSOs, worker compare 23.6 ms, click-to-paint 153 ms, rendered window 100 rows, no main-thread fallback, longest measured main-thread task 64 ms.

## Compare Insights bounds

- Model calculation reads derived summary arrays only, never full QSO arrays.
- Ranked cards are capped at eight, with no more than two per category.
- Timeline output is capped at 96 UTC-hour rows.
- Full-app manual runs rendered four loaded slots and six ranked cards without browser errors.

A focused 1,000-iteration model-plus-HTML-render benchmark used four slots, 48 UTC hours, 300 summary values, and the maximum eight cards. It completed in 1,054.2 ms total, or 1.0542 ms per uncached build/render, producing bounded 52,709-byte HTML. Normal app navigation additionally caches the model by slot versions, benchmark selection, score mode, break threshold, and shared UTC range.
