# Compare Insights UX Contract

Updated: 2026-07-12  
Introduced: SH6 v6.3.21

## User question

Compare Insights is the post-contest cockpit for answering:

> Where did my log lose points compared with the selected benchmark log?

The report is available only when at least two logs are loaded. It supports two, three, and four active slots without changing any scoring or parsing behavior.

## Information hierarchy

1. Benchmark selector and score provenance.
2. Bounded, ranked investigation cards.
3. Synchronized UTC-hour timeline.
4. Calculation and inference limitations.

The cockpit uses existing derived summaries and never scans complete QSO arrays while rendering.

## Metrics

- QSOs and effective points by UTC hour, including cumulative totals.
- Selected final total: computed score, claimed score, or logged points.
- Explicitly inferred score pace, scaled from final score and cumulative effective-points share. It is never presented as exact in-contest scoring.
- Computed multiplier total when available.
- Per-band QSO and effective-point deficits.
- Existing RUN, S&P, and INBAND heuristic totals.
- Existing break summaries and reference activity during the same UTC period.
- Potential country, zone, or prefix leads. These are never claimed as verified multiplier credits.

## Action contract

- Time and band insights open the shared compare Log with the relevant filter added.
- Existing band, mode, operator, callsign, and operating-style filters remain intact unless an insight explicitly changes that dimension.
- Those filters scope the resulting Log drilldown; cockpit totals remain full-log because SH6 reuses bounded derived summaries. A shared UTC time range limits timeline comparisons and is shown explicitly.
- Score and potential-multiplier insights open an existing supporting report when an exact QSO filter is unavailable.
- Clicking a UTC-hour row opens the corresponding filtered compare Log.
- The workspace toolbar provides a direct Compare Insights jump from other compare reports.

## Trust and availability

- Cards are labelled `Fact` or `Inference`.
- Score provenance is shown per slot.
- Different contests or non-overlapping UTC ranges suppress time-based conclusions and display a warning.
- The timeline is bounded to 96 UTC-hour rows. A shared time filter selects another range for long logs.
- Fewer than two ready logs produce no cockpit or navigation entry.

## Responsive and accessibility requirements

- Mobile-first single-column order at 375px.
- Two-column cards from 768px, three from 1024px, and four from 1440px.
- Wide timeline data scrolls inside its own container without causing page overflow.
- All actions use native buttons/selects, visible `:focus-visible` rings, and minimum 44px interactive height.
- The cockpit uses a labelled semantic section, table headings, and explanatory copy that remains meaningful in PDF/HTML export.
