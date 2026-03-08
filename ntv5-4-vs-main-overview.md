# NTv5.4 vs main

This branch is a large product and architecture pass over SH6. Against `main`, `NTv5.4` adds 30k+ lines, removes about 8.8k, and touches 96 files. The center of gravity moves from a mostly monolithic [main.js](/Users/simon/github/SH6/main.js) to a modular runtime layout under [modules/](/Users/simon/github/SH6/modules), backed by new browser smoke coverage under [tests/](/Users/simon/github/SH6/tests) and [scripts/](/Users/simon/github/SH6/scripts).

Representative commits:
- `a425995` `feat(trust): fix scoring duplicates and zero-point mults`
- `955f79b` `feat(workspace): add compare time locks and ranked coach actions`
- `70d8e65` `feat(engine): add durable storage and retained rendering foundations`
- `cde06cd` `feat(engine): workerize shared analysis core`
- `f910b71` `feat(agents): add actionable investigation perspectives`
- `12f4d2a` `fix(log): restore retained table model wiring`

## Startup/runtime

- Startup was reworked so navigation is available before the full optional runtime preload chain. The key behavior now lives in [main.js](/Users/simon/github/SH6/main.js) and [navigation-runtime.js](/Users/simon/github/SH6/modules/ui/navigation-runtime.js), instead of the old all-or-nothing boot flow.
- Optional runtimes are now guarded. Missing feature modules no longer take down report binding or sidebar initialization.
- Direct `file://` opens are handled explicitly. SH6 now shows a clear local-server-required state and includes [run-local-web.sh](/Users/simon/github/SH6/scripts/run-local-web.sh) instead of exposing a half-broken UI.
- The loading shell is hardened so synchronous report render failures produce an error card instead of leaving `Preparing ...` stuck forever.
- Recent stability fix: the retained `Log` report now correctly bridges `setRetainedReportModel(...)` through [retained-runtime.js](/Users/simon/github/SH6/modules/reports/retained-runtime.js), fixing the DXer/Contester `Preparing Log...` hang.

Representative files:
- [main.js](/Users/simon/github/SH6/main.js)
- [modules/ui/navigation-runtime.js](/Users/simon/github/SH6/modules/ui/navigation-runtime.js)
- [modules/reports/retained-runtime.js](/Users/simon/github/SH6/modules/reports/retained-runtime.js)

## Retained rendering

- Long reports moved to retained roots and virtualized bodies rather than full container replacement on every refresh.
- The retained runtime in [retained-runtime.js](/Users/simon/github/SH6/modules/reports/retained-runtime.js) now owns shell rendering, virtual-body binding, retained refreshes, and static fallback rendering.
- `Log`, `Countries`, `Prefixes`, `All callsigns`, `Passed QSOs`, `Possible errors`, `Competitor coach`, and `Agent briefing` were among the major retained-report targets.
- The shared virtual-table implementation now lives in [virtual-table.js](/Users/simon/github/SH6/modules/ui/virtual-table.js).

Representative commits:
- `70d8e65` durable storage and retained foundations
- `5999356` retain and virtualize summary tables
- `1480c25` retain more compare workspaces
- `909b76f` retain passed-qso and error reports
- `2903e41` extract retained report runtime

Representative files:
- [modules/reports/retained-runtime.js](/Users/simon/github/SH6/modules/reports/retained-runtime.js)
- [modules/ui/virtual-table.js](/Users/simon/github/SH6/modules/ui/virtual-table.js)
- [style.css](/Users/simon/github/SH6/style.css)

## Compare workspace

- Compare moved from plain report switching toward a workspace model with time-range locks, cross-highlighting, saved perspectives, and ranked jumps.
- The workspace renderer lives in [workspace-ui.js](/Users/simon/github/SH6/modules/compare/workspace-ui.js), with behavior/orchestration in [controller-runtime.js](/Users/simon/github/SH6/modules/compare/controller-runtime.js) and shared data logic in [compare-core.js](/Users/simon/github/SH6/modules/compare/compare-core.js).
- Coach outputs were reshaped into actionable perspectives instead of passive report pages. Saved/current compare perspectives are persisted through the session layer.
- Compare-specific retained/virtualized coverage was expanded for heavy compare reports and summary tables.

Representative commits:
- `955f79b` compare time locks and ranked coach actions
- `1335f97` extract workspace renderer module
- `398e01a` extract compare controller runtime
- `f910b71` add actionable investigation perspectives

Representative files:
- [modules/compare/workspace-ui.js](/Users/simon/github/SH6/modules/compare/workspace-ui.js)
- [modules/compare/controller-runtime.js](/Users/simon/github/SH6/modules/compare/controller-runtime.js)
- [modules/session/perspectives.js](/Users/simon/github/SH6/modules/session/perspectives.js)

## Storage/session

- Session state, permalink encoding/decoding, and saved compare perspectives are extracted from `main.js` into [codec.js](/Users/simon/github/SH6/modules/session/codec.js) and [perspectives.js](/Users/simon/github/SH6/modules/session/perspectives.js).
- Durable browser storage was introduced through [modules/storage/runtime.js](/Users/simon/github/SH6/modules/storage/runtime.js) and [modules/storage/persistence.js](/Users/simon/github/SH6/modules/storage/persistence.js).
- Autosave restore, raw-log caching, archive/raw-log persistence, and perspective persistence now have dedicated runtime hooks instead of scattered in-page logic.
- File-protocol startup handling also routes users toward a browser-safe local host flow, which matters for session/storage reliability.

Representative commits:
- `70d8e65` durable storage and retained rendering foundations
- `2371b2d` extract codec and perspective modules
- `73d7bca` extract durable storage runtime
- `bbbc73a` handle file protocol explicitly

Representative files:
- [modules/session/codec.js](/Users/simon/github/SH6/modules/session/codec.js)
- [modules/session/perspectives.js](/Users/simon/github/SH6/modules/session/perspectives.js)
- [modules/storage/runtime.js](/Users/simon/github/SH6/modules/storage/runtime.js)
- [modules/storage/persistence.js](/Users/simon/github/SH6/modules/storage/persistence.js)

## Archive/export

- Archive access was split into a lower-level client in [modules/archive/client.js](/Users/simon/github/SH6/modules/archive/client.js) and UI/runtime search orchestration in [modules/archive/search-runtime.js](/Users/simon/github/SH6/modules/archive/search-runtime.js).
- Export functionality was extracted into [modules/export/runtime.js](/Users/simon/github/SH6/modules/export/runtime.js), reducing `main.js` and giving export flows dedicated test coverage.
- Load-panel archive interactions and compact archive slot states moved into [load-panel-runtime.js](/Users/simon/github/SH6/modules/ui/load-panel-runtime.js).

Representative commits:
- `9eeb75f` extract archive client module
- `cbe0980` extract archive search runtime
- `104eda5` extract export runtime module
- `dac5234` extract load panel runtime

Representative files:
- [modules/archive/client.js](/Users/simon/github/SH6/modules/archive/client.js)
- [modules/archive/search-runtime.js](/Users/simon/github/SH6/modules/archive/search-runtime.js)
- [modules/export/runtime.js](/Users/simon/github/SH6/modules/export/runtime.js)
- [modules/ui/load-panel-runtime.js](/Users/simon/github/SH6/modules/ui/load-panel-runtime.js)

## Coach/agents

- SH6 gained an agent-style investigation layer. [modules/agents/runtime.js](/Users/simon/github/SH6/modules/agents/runtime.js) adds briefing/perspective generation and action suggestions.
- Competitor coach, CQ API enrichment, and coach-specific investigation flows moved into [modules/coach/runtime.js](/Users/simon/github/SH6/modules/coach/runtime.js).
- Coach and agent outputs were converted into retained workspaces and action runtimes, including saved review paths and largest-delta/time-lock jumps.
- Investigation-specific action binding moved into [modules/ui/investigation-actions-runtime.js](/Users/simon/github/SH6/modules/ui/investigation-actions-runtime.js).

Representative commits:
- `ad875c7` add agent briefing workspace
- `f910b71` add actionable investigation perspectives
- `6adc585` extract cq api and competitor runtime
- `7b62dab` extract investigation actions runtime
- `8ed3c05` retain coach and agent workspaces

Representative files:
- [modules/agents/runtime.js](/Users/simon/github/SH6/modules/agents/runtime.js)
- [modules/coach/runtime.js](/Users/simon/github/SH6/modules/coach/runtime.js)
- [modules/ui/investigation-actions-runtime.js](/Users/simon/github/SH6/modules/ui/investigation-actions-runtime.js)
- [modules/reports/investigation-workspace.js](/Users/simon/github/SH6/modules/reports/investigation-workspace.js)

## Spots/RBN

- This is the largest extraction area in the branch. Spots/RBN logic was broken into targeted modules for data loading, actions, compare controls, charting, diagnostics, coach summaries, drilldowns, signal export, and RBN compare subcomponents.
- The data/runtime split starts in [modules/spots/data-runtime.js](/Users/simon/github/SH6/modules/spots/data-runtime.js) and [modules/spots/actions-runtime.js](/Users/simon/github/SH6/modules/spots/actions-runtime.js).
- RBN compare is now separated into orchestration, model, view, and chart runtimes:
  - [rbn-compare-runtime.js](/Users/simon/github/SH6/modules/spots/rbn-compare-runtime.js)
  - [rbn-compare-model-runtime.js](/Users/simon/github/SH6/modules/spots/rbn-compare-model-runtime.js)
  - [rbn-compare-view-runtime.js](/Users/simon/github/SH6/modules/spots/rbn-compare-view-runtime.js)
  - [rbn-compare-chart-runtime.js](/Users/simon/github/SH6/modules/spots/rbn-compare-chart-runtime.js)
- Shared spots compare/report helpers now live in [compare-runtime.js](/Users/simon/github/SH6/modules/spots/compare-runtime.js), while charts, diagnostics, coach summaries, and drilldowns each have their own runtime.

Representative commits:
- `041d298` extract spots data runtime
- `af0ea1a` extract spots actions runtime
- `4a6598f` / `989cc0b` / `82b6b5e` / `dc5d2c3` split RBN compare runtime/model/view/chart
- `23cb3e9` extract coach summary runtime
- `54f72b9` extract diagnostics runtime
- `b428304` extract chart runtime

Representative files:
- [modules/spots/data-runtime.js](/Users/simon/github/SH6/modules/spots/data-runtime.js)
- [modules/spots/actions-runtime.js](/Users/simon/github/SH6/modules/spots/actions-runtime.js)
- [modules/spots/compare-runtime.js](/Users/simon/github/SH6/modules/spots/compare-runtime.js)
- [modules/spots/diagnostics-runtime.js](/Users/simon/github/SH6/modules/spots/diagnostics-runtime.js)
- [modules/spots/charts-runtime.js](/Users/simon/github/SH6/modules/spots/charts-runtime.js)
- [modules/spots/rbn-compare-chart-runtime.js](/Users/simon/github/SH6/modules/spots/rbn-compare-chart-runtime.js)

## Tests

- The branch adds a broad browser-smoke layer around almost every extracted runtime. This is one of the biggest practical changes versus `main`.
- New test HTML pages were added for navigation, load panel, analysis controls, compare controller, retained runtime, archive search, storage, coach runtime, investigation actions, export, spots data/actions/compare/charts/diagnostics/drilldown, RBN compare runtime/model/view/chart, canvas zoom, file-protocol startup, and the `Log` report.
- Matching shell runners in [scripts/](/Users/simon/github/SH6/scripts) now make these flows executable from the terminal.
- Existing smoke coverage was updated for newer module boundaries and startup behavior.

Representative files:
- [tests/navigation-runtime-smoke.html](/Users/simon/github/SH6/tests/navigation-runtime-smoke.html)
- [tests/load-panel-runtime-smoke.html](/Users/simon/github/SH6/tests/load-panel-runtime-smoke.html)
- [tests/analysis-controls-runtime-smoke.html](/Users/simon/github/SH6/tests/analysis-controls-runtime-smoke.html)
- [tests/retained-runtime-smoke.html](/Users/simon/github/SH6/tests/retained-runtime-smoke.html)
- [tests/storage-runtime-smoke.html](/Users/simon/github/SH6/tests/storage-runtime-smoke.html)
- [tests/spots-data-runtime-smoke.html](/Users/simon/github/SH6/tests/spots-data-runtime-smoke.html)
- [tests/rbn-compare-runtime-smoke.html](/Users/simon/github/SH6/tests/rbn-compare-runtime-smoke.html)
- [scripts/run-log-report-smoke.sh](/Users/simon/github/SH6/scripts/run-log-report-smoke.sh)
- [scripts/run-file-protocol-startup-smoke.sh](/Users/simon/github/SH6/scripts/run-file-protocol-startup-smoke.sh)

## Net effect

- `main.js` is still large, but it is no longer the only place where core UI/runtime behavior lives. `NTv5.4` turns SH6 into a modular static app with dedicated runtimes for most major subsystems.
- The branch materially improves correctness (score/dupe/mult handling), resilience (startup guards, loading-shell failure handling), usability (compare workspace, coach/agent actions), and maintainability (module extraction + smoke coverage).
- The main remaining cost is complexity spread across many new modules. The branch trades monolith size for subsystem structure and a much larger regression surface, which is why the expanded smoke harness matters.
