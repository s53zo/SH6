# CQWW Multi-Single audit

Quality & Review → CQWW M/S rules audit is available when any active comparison slot declares CQ-WW-CW/SSB and Multi-Single (MULTI-OP + ONE, or an explicit legacy M/S category). Other slots show not applicable. An ADIF physical radio identifier is not accepted as a functional RUN/MULT assignment.

The first supported edition is **2026**. Other years show a not-checked notice. Reference sources, checked 2026-10-27:

- https://cqww.com/rules/ (V.C.1)
- https://cqww.com/rules/faq.htm (Multi-Single FAQ)

The full, unfiltered loaded log is used. Whole UTC minutes are evaluated, separately for declared signal 0 and signal 1. Observed band-period starts and earliest next-band times are displayed in two bracket lanes and a detailed table. This is not a transmission timeline.

Findings distinguish logged early changes, multiplier concerns, incomplete input and review-only ambiguity. Same-minute multi-band order, missing data, X-QSO and cascading timing conflicts prevent definitive downstream timing findings. For safety, X-QSO presence makes all timing findings provisional; excluded contacts do not silently earn multipliers or disappear without a coverage notice. The original parsed data and scoring are never modified.

Multiplier newness considers earlier contacts across both functions, with same-minute ties and unresolved country/zone history handled conservatively. This is a logged-evidence screen, not adjudicated multiplier credit: invalid/busted contacts and official log checking may change eligibility. Same-band RUN/MULT observations are review candidates, not proof of concurrent signals. Unlogged transmissions, CQ solicitation and hardware interlock compliance cannot be established.

Finding buttons open exact full-log contacts, including comparison slots. Standard static HTML/PDF report generation preserves findings and lock tables while freezing navigation buttons. No new automatic scoring penalties are applied.

Tests: `node tests/cqww-ms-audit.test.mjs`; `SH6_UI_SMOKE_PAGE=cqww-ms-audit-ui-smoke.html bash scripts/run-radio-ui-smoke.sh`.
