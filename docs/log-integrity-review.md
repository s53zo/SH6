# Log integrity review

Quality & Review → Log integrity review uses original full-log contacts independently per comparison slot. Candidate detection does not use cluster/RBN anchors or inferred operating styles. It identifies review patterns, never intent or a cheating probability.

Default candidate thresholds are three distinct HF bands within five occupied UTC minutes. Controls allow 2–6 bands and 1–60 minutes. A contact starting at the window endpoint is excluded. Overlapping qualifying windows become one case. Timestamp endpoints describe whole-minute intervals: elapsed lower bound is max(0, last minute − first minute − 1), upper bound is last minute − first minute + 1. Same-minute order is unknown. Default calibration inspected the 33-contact operating-style fixture, three-contact radio fixture and a private 5,937-contact CQWW M/S log: none produced a candidate. The synthetic three-band sequence does produce one. These defaults prioritize reviewable clusters; they are not statistically validated misconduct thresholds. No private contacts are committed.

Counterpart retrieval uses existing callsign-index SQLite shards and cached archive text; it does not reconstruct logs or scrape sites. Submitted logs are preferred after exact edition/mode selection; reconstructed logs are fallback observations. Lookup is bounded to two workers and guards log-version and threshold-generation changes. Ready results survive report rerenders and repeated load actions; partial/errors can be retried. Partial alias lookup is explicit. Missing or failed downloads never mean zero contacts.

Reconstruction provenance follows the existing generator: worked callsign identifies the reporting station. Its records inherit reporting-station frequencies. Synthetic category headers do not establish actual operators or category. Reconstructed output lacks source-file/line provenance, so the report identifies the reconstruction path and reporting callsign rather than inventing those fields. Identical record signatures collapse; discrepancies remain. Independent counts exclude reports originating from the reviewed entrant. A validated submitted counterpart log supplies direct counterpart reporting. Counts represent observed archive activity, not total QSOs made; missing reconstruction does not establish a ten-contact threshold.

Submitted reciprocal checks use a five-minute tolerance and compare band, mode and available exchanges. Unmatched records require review and can reflect clock differences or logging errors. Reconstruction cannot independently corroborate its own source reports.

Hypothetical scoring clones full source data, reconstructs canonical retained events and preserves QTCs. It uses the normal scoring engine with one resource/context snapshot, recalculating duplicate and multiplier replacement credit. Numeric output requires matching supported scoring rule identities and finite scores. Actual logs/scores remain unchanged. No adjudication penalty is applied. Source-QSO controls open the correct slot with ±15-minute context. Static exports expand evidence and retain original source labels and bottom More source links.

## Local validation

Serve repository using `/usr/bin/python3 -m http.server 8850 --bind 127.0.0.1`, open `http://127.0.0.1:8850/`, load a contest log and select Quality & Review → Log integrity review. Inspect candidates, load counterpart evidence and calculate hypothetical impacts. Browser fixture: `/tests/log-integrity-ui-smoke.html`; model tests: `node tests/log-integrity-model.test.mjs`.

## Verification and limits

Model tests cover boundaries/grouping, reversed input, same-minute uncertainty, exact edition/detail selection, partial retry, submitted preference, provenance/portable calls, deduplication, reciprocal discrepancies, bounded retrieval, score compatibility, source order, detached session events and QTC preservation. A real-engine WPX test verifies duplicate replacement preserves multiplier credit.

Full-app smoke covers one/four slots, source immutability, hypothetical scoring, filter independence, expanded static export with source labels, and correct Log D ±15-minute navigation. Regression pages pass: existing operating audit (126 checks), scoring (149), export runtime, navigation and cleanup normalizer. Existing model/security suites and protected scoring (27 rules/27 alias sets) pass. Three independent reviews covered evidence provenance, scoring correctness and UI/performance; confirmed issues were fixed and retested.

Counterpart source validation checks index contest/year/mode and parsed identity, modes and dates. Ambiguous season/subcontest/detail metadata remains unselected. Parsed contacts outside three days of the entrant's observed date range are rejected; this conservative sanity check does not replace an organizer's event calendar. Mixed entries use the declared Mixed mode and CW/phone contacts, not synthetic reconstruction category declarations. Incomplete archive coverage cannot prove absence. Reciprocal time tolerance and review observation counts are transparent review aids, not statistical probabilities or adjudication.

Local release is v6.3.52. No push is authorized by this goal.


## v6.3.49 review corrections

Counterpart-derived discrepancy text is escaped throughout. Reciprocal pairing compares both exchange directions, ranks compatible exchanges and time proximity, and uses each counterpart record at most once across a callsign's cases. Tied pairings remain ambiguous; missing matches are not labelled conflicts. Numeric exchange tokens normalize leading zeros only for the implemented CQWW/WPX, ARRL DX and EUHFC families; unknown contest exchanges retain their spelling. Original exchange text remains visible.

A reconstructed entrant cannot establish independent corroboration from records that may have generated it. Its activity remains visible, but independent confirmation is unassessed and does not increase review priority. Mixed events accept compatible single-mode counterpart entries, while separate CW/phone events remain isolated. Loaded archive metadata supplies season/subcontest/detail when available; uncertainty remains explicit otherwise.

Both scoring baseline and hypothetical use canonical event references. Scoring context/resources invalidate cached results and interrupt obsolete calculations. Sorting ignores nested-table headers/events. Exports retain thresholds, filter and displayed/total counts. On-screen timelines initially show at most 100 records, with a Show all control; production HTML/PDF rendering includes full activity. Timestamp indexes avoid scanning the complete entrant log for every case.

Browser regression now clicks Load counterpart evidence with a deterministic archive/worker fixture, checks hostile exchange text, selects the correct seasonal event, and exports more than 100 counterpart contacts through the real HTML export controls. No external logs are scraped by these tests.

## Multiplier timing against cluster/RBN — v6.3.50

The follow-up request adds the article's spot-to-multiplier analysis. Opening Log integrity review automatically loads the relevant cluster/RBN histories and then calculates the timing table. Loaded data is reused across rerenders; retry/recalculate and cancel controls remain available. It checks every contact receiving implemented multiplier credit, including single-band contacts outside rapid multiband cases. Unsupported scoring models explicitly show that multiplier identification is unavailable.

Cluster daily files come from the existing SH6 spot archive. RBN queries target the callsigns worked, using the existing call/day proxy. Queries cover up to 60 minutes before credited contacts, including the previous UTC date near midnight. RBN concurrency is two; HTTP 429 stops additional queued calls and makes coverage partial. Errors, truncation, missing days, cancellation and source-query coverage remain visible. The default timing window is ten minutes, adjustable from one to sixty without another download when history is cached. Spot requests have a thirty-second timeout and are limited to a single event spanning at most seven UTC dates.

Matching uses callsign, band and available transmitted mode. The table shows nearest spot time/source/spotter, both source matches where present, timestamp delay bounds and logged/spot frequency difference. Generic band frequencies have no claimed frequency precision. Same-minute ordering is uncertain; contacts with no matching spot are described only relative to loaded data. Percentage counts describe observed temporal correlation, not statistical significance or proof of assistance. No operating-style labels or RBN-based RUN anchors enter this calculation. Opening a source QSO retains the existing ±15-minute navigation.

Tests: `node tests/integrity-spots.test.mjs` covers multiplier credit indexing, source/mode/band/call matching, time windows, midnight coverage, failures/truncation, rate limiting, cancellation and HTML safety. The full-app smoke loads mocked Cluster/RBN through the production action and checks a standalone multiplier contact and source navigation. Existing model, scoring, export, navigation, cleanup and operating-rule regressions remain passing.


Only a spot strictly preceding the QSO minute with an entire delay interval inside the chosen window counts as a definite within-window observation. Same-minute spots remain additional uncertain evidence and do not hide an earlier definite match. Delay intervals crossing the window boundary are reported separately. RBN responses must confirm requested UTC dates; missing confirmation makes coverage partial. Gzip fallback links identify the file actually loaded.


## Automatic loading and focused results — v6.3.51

Automatic loading starts only for the interactive integrity report, not static export generation. It attempts once per log/scoring context; failed, partial or cancelled requests require explicit retry, avoiding network retry loops. Reopening the same report reuses completed history. A newly loaded log or scoring context starts a fresh check. Rows without matching spots are hidden in both the report and exports; summary denominators still include all credited multiplier contacts, with coverage gaps visible.


## Counterpart-activity threshold — v6.3.52

Load counterpart evidence checks the union of rapid-sequence counterparts and all credited multiplier stations. A matching submitted or reconstructed log with at least five unique worked callsigns shows OK for this check. The reviewed entrant counts as one if present. Repeated contacts do not inflate the count; portable slash/underscore spellings normalize consistently. Fewer than five shows Limited activity. An exhaustive lookup with no matching log shows Review — counterpart log not found. Failures, partial lookup without a source and ambiguous event matches remain Not checked. This threshold does not certify other checks or prove a missing log represents misconduct.
