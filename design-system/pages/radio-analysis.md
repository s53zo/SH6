# Radio analysis reports

Radio analysis is conditional: the ribbon, Log column, summary cards, and dedicated reports appear only when at least one QSO contains a legitimate transmitter ID.

## Language and trust

- UI label: **Radio**. Technical copy may say **transmitter ID**.
- Render numeric submitted identifiers as R0, R1, etc.; retain other submitted identifiers without adding a second R prefix.
- Never equate a radio with an operator, RUN, S&P, in-band, or multiplier role.
- Mark operating style, activity, idle time, and handoffs as inferred or possible.
- Keep missing IDs visible and distinguish Complete, Partial, Suspicious, and Not applicable states.

## Controls and layout

- The global Radio ribbon follows the Band ribbon and offers All, each discovered ID, and Missing when applicable.
- In the Log report, Radio is always the last column, after Flags. It disappears entirely for logs without transmitter data.
- Radio summary/breakdown cards use ordinary report-card and retained-table styling and must remain horizontally scrollable at narrow widths.
- Existing reports expose report-specific radio splits in a collapsed disclosure instead of repeating a full radio workspace. Dedicated Radio reports remain full views.
- The timeline's primary view uses aligned lanes on one UTC axis. Band is encoded by colour, mode by fill pattern, QSO intensity by opacity, inferred operating style by the lower border, and multipliers/band changes by markers. The detailed table is a secondary accessible fallback.
- The band-pair heatmap offers explicit row-radio, column-radio, and metric selectors. Idle is a valid axis state.

## Analytical contract

Five-minute buckets are the default for timelines and activity sessionization. A radio remains analytically active for five minutes after its latest QSO; this is not proof of continuous transmission. Long empty spans are shown as idle rather than filled. Per-radio idle totals cover only that radio's first-to-last observed envelope; outside time is unknown. Possible handoffs require an apparent same-band stop/start between different recorded radios within ten minutes and do not claim operator intent.

The audit may expose results and unverifiable assumptions from existing scoring rules, but it must not independently invent contest restrictions. Minute-resolution Cabrillo timestamps cannot support a same-second collision finding.
