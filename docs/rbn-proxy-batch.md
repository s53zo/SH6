# RBN batching in SH6

Integrity review groups missing callsigns sharing UTC dates into requests of at most 32 calls and two dates. Longer date sets are split into two-day groups, up to the review's seven-date limit. The proxy scans each day's archive once per group. Every response is partitioned by callsign and validated before use; missing calls, failed dates, truncation and rate limiting never count as successful empty coverage.

The existing spot runtime ingests batch results into its per-call cache, shared with RBN menus. Loaded complete responses and covered date subsets are reused, including matching in-flight single requests. Fully cached requests perform no network work. Memory remains capped at 64 MiB (up to 512 entries); current-day payloads expire after one minute. Cancellation stops the review and prevents subsequent batches; requests already shared with other reports may finish and populate cache.

Servers without batch support fall back to the existing single-call endpoint for HTTP 400/404/405. Other failures stop subsequent batch work, including HTTP 429. Integrity results remain withheld until complete coverage is available. The frontend does not reconstruct RBN data or interpret a missing response as zero spots.

Proxy source, request schema, limits, deployment and rollback are documented in [server/rbn-proxy/README.md](../server/rbn-proxy/README.md).

## Count-limit recovery

HTTP success alone does not establish complete coverage. When the proxy marks a call truncated, SH6 retains complete calls and automatically retries only affected calls in smaller groups, using reported totals to fit the response budget. If a single call across two dates still exceeds the limit, those dates are queried separately. A single-call/single-date truncation remains explicitly incomplete; retries cannot recurse further. Missing dates and other source errors remain unassessed and are not disguised as truncation. Final failures identify the affected source/calls and expose the full list under Loading details. The proxy's 100,000-record safety limit remains unchanged.

Integrity requests set `ofUsOnly=1` so a multiplier station's skimmer reports do not consume the spot budget. Responses explicitly identify omitted by-station data with `byUsIncluded:false`. That cache entry cannot satisfy a normal RBN menu request needing both directions. Large recovered arrays are merged without JavaScript argument spreading, which can overflow the call stack.
