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
- Region 1 EDI: `.edi`
- Cabrillo: `.log`, `.cbr`
- ADIF: `.adi`, `.adif`
- CBF: `.cbf`

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
- Data-driven Cabrillo transmitter-ID support: a global Radio filter, final-column Radio values in Log views, per-radio summaries, and timeline/coordination/handoff/audit/band-pair reports
- Chart metric mode toggle (`Absolute` vs `Normalized %`) for fair compare across unequal log sizes
- Map view (Leaflet/OpenStreetMap) + KMZ exports
- **EXPORT PDF, HTML, CBR** menu for report and raw-log exports
- Save/load session support and shorter compressed `v3` permalinks, with legacy and `v2` links retained

## Permalinks

SH6 chooses the shorter of its existing `v2` compact JSON and the new `v3` compressed positional JSON whenever a permalink is copied. Restoration remains synchronous and offline; old non-prefixed and `v2.` links continue to work. The wire schema, safety limits, dependency information, compatibility policy, and reproducible size results are documented in [the permalink v3 notes](docs/permalink-v3.md).

## Radio / transmitter IDs

For logs that actually record a Cabrillo transmitter ID (commonly the final `0` or `1` field in multi-operator entries), SH6 promotes it to normalized QSO data while retaining the submitted raw value and QSO line. Cabrillo parsing is deliberately conservative: it requires a structurally separate received exchange and only consumes the standard trailing `0` or `1`. Broader identifiers remain supported in explicitly named ADIF and CBF fields. ADIF also recognizes the common N1MM `APP_N1MM_RADIO_NR` field. Radio controls remain hidden when no legitimate identifier is present. Partial logs retain a visible `Missing` group.

The UI renders submitted IDs as R0, R1, and so on. An ID represents a submitted transmitter stream—not an operator and not inherently a RUN, S&P, in-band, or multiplier role. Operating-style labels and activity windows are explicitly inferred. The Transmitter-rule audit reports completeness/category disagreements and reuses results from existing SH6 scoring enforcement; it does not create or alter contest rules.

The archived WRTC 2026 MB5Q file is a known source-data example: it declares two transmitters but contains only ID 0, so SH6 marks it Suspicious. Other checked WRTC examples (MB5O, MB4G, MB1T) contain both IDs and classify as Complete.

The Radio timeline leads with aligned five-minute lanes for simultaneous activity; its exact bucket table is collapsed as an accessible detail view. Additional radio splits in ordinary reports are likewise collapsed to keep the primary report readable. Compare mode renders one panel per loaded log.

## Multipliers

Use the six wrapping tabs: **Hourly**, **Rate**, **Cumulative**, **Band & type**, **Timeline**, and **Efficiency**. Arrow keys move between tabs; Enter or Space opens the focused view. The Rolling window setting appears only in Rate.

Multipliers is item **11 in Rates & Time**. Charts use bars; rate bars span the selected 15/30/60-minute rolling window and show non-overlapping samples, while tables/CSV retain all rolling samples. The Y maximum slider controls every multiplier chart without filtering the underlying analysis; Reset Y restores automatic scaling. Charts always show the full selected time range. The Y setting is saved with the other multiplier settings.

Open **Multipliers** in the report menu. Select hourly totals, rolling 15/30/60-minute rates, cumulative progress, band/type breakdown, exact credit timeline, or operating efficiency. Compare mode shows one panel per log, with shared scales only for compatible rules and station perspectives. The existing **Multiplier Opportunities** report remains the place to explore missing entities. The strategy and missing-time views have been removed; older saved selections open the hourly overview instead.

Credits come from the complete scored log before band, mode, time, type, or radio filters. Raw credits, weighted scoring units, and multiplier-bearing QSOs are distinct. Cumulative selections retain their opening balance; elapsed UTC rates disclose partial evidence and gaps. Records without usable timestamps remain excluded from time-based totals; inspect original records in Log. Timeline links open the exact source QSO; Radio remains the last Log column.

Operating styles are inferred, radio IDs are not operators, and occupied-radio-minute efficiency is a proxy rather than measured search time. Sparse evidence is labeled. Existing bundled ARRL/EU scoring remains heuristic. For non-Russian RDA entrants, existing country credits are displayed but do not contribute to the district-only score formula; that pre-existing discrepancy has not been changed.

Per-log settings persist in sessions and saved perspectives. CSV exports retain all selected rows even when interactive tables paginate; HTML/PDF output contains static assumptions and expanded details. Dense charts use bounded endpoint/extrema sampling while tables and CSV remain exact. Implementation and validation evidence are recorded in [the implementation notes](docs/multiplier-overview-implementation.md).

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
