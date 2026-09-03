#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

node --input-type=module <<'EOF'
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import {
  RADIO_MISSING_FILTER,
  buildRadioCsv,
  buildRadioModel,
  discoverRadioIds,
  detectRadioHandoffs,
  filterQsosByRadio,
  renderRadioHourly,
  renderRadioSeries,
  renderRadioReport
} from './modules/radio/runtime.js';

const require = createRequire(import.meta.url);
require('./modules/analysis/core.js');
const core = globalThis.SH6AnalysisCore;

const cabrillo = [
  'START-OF-LOG: 3.0',
  'CONTEST: IARU-HF',
  'CALLSIGN: MB5Q',
  'CATEGORY-OPERATOR: MULTI-OP',
  'CATEGORY-TRANSMITTER: TWO',
  'QSO: 14047 CW 2026-07-11 1200 MB5Q 599 27 HB2T 599 28 0',
  'QSO: 21007 CW 2026-07-11 1200 MB5Q 599 27 DA0BCC 599 28 1',
  'QSO: 14048 CW 2026-07-11 1201 MB5Q 599 27 SN0HQ 599 PZK 0',
  'END-OF-LOG:'
].join('\n');
const parsed = core.parseLogFile(cabrillo, 'MB5Q.log');
assert.deepEqual(parsed.qsos.map((q) => q.txId), ['0', '1', '0']);
assert.deepEqual(parsed.qsos.map((q) => q.raw.TX_ID), ['0', '1', '0']);
assert.match(parsed.qsos[0].rawLine, /HB2T.*0$/);
assert.deepEqual(discoverRadioIds(parsed.qsos), ['0', '1']);
assert.equal(filterQsosByRadio(parsed.qsos, '1').length, 1);

const partial = parsed.qsos.concat({ ...parsed.qsos[0], txId: null, raw: { ...parsed.qsos[0].raw, TX_ID: null }, ts: parsed.qsos[0].ts + 60000 });
assert.equal(filterQsosByRadio(partial, RADIO_MISSING_FILTER).length, 1);
const model = buildRadioModel(partial, { categoryTransmitter: 'TWO' }, { pointsByIndex: [1, 2, 3, 4] });
assert.equal(model.visible, true);
assert.equal(model.diagnostics.status, 'Partial');
assert.equal(model.rows.find((row) => row.id === '0').qsos, 2);
assert.ok(model.timeline.length >= 2);
assert.ok(model.coordination.concurrentPct >= 0);
assert.ok(model.heatmap.cells.length > 0);
assert.ok(model.heatmap.cells.every((cell) => Number.isFinite(cell.combinedRate)));
assert.match(renderRadioHourly(model), /Missing/);
assert.match(renderRadioSeries(model, 'qsos', 'minute'), /Station total/);
for (const report of ['radio_timeline', 'radio_coordination', 'radio_handoffs', 'radio_audit', 'radio_band_pairs']) {
  assert.ok(renderRadioReport(report, model).length > 20, `${report} should render`);
  assert.ok(buildRadioCsv(report, model).split('\r\n').length > 2, `${report} should export CSV`);
}

const racMostShape = cabrillo.replace('CATEGORY-TRANSMITTER: TWO', 'CATEGORY-TRANSMITTER: ONE');
assert.deepEqual(core.parseLogFile(racMostShape, 'rac-most.log').qsos.map((q) => q.txId), ['0', '1', '0']);
const ordinarySingle = racMostShape.replace('CATEGORY-OPERATOR: MULTI-OP', 'CATEGORY-OPERATOR: SINGLE-OP');
assert.deepEqual(core.parseLogFile(ordinarySingle, 'single.log').qsos.map((q) => q.txId), [null, null, null]);
const missingTrailingId = cabrillo.replace('HB2T 599 28 0', 'HB2T 599 28');
const missingParsed = core.parseLogFile(missingTrailingId, 'missing-id.log');
assert.equal(missingParsed.qsos[0].txId, null);
assert.equal(missingParsed.qsos[0].exchRcvd, '28');
const repeatedExchangeTail = [
  'START-OF-LOG: 3.0',
  'CONTEST: NAQP-CW',
  'CALLSIGN: TEST1',
  'CATEGORY-OPERATOR: MULTI-OP',
  'CATEGORY-TRANSMITTER: UNLIMITED',
  'QSO: 14047 CW 2026-07-11 1200 TEST1 599 CA K1ABC 599 AL TX',
  'QSO: 14048 CW 2026-07-11 1201 TEST1 599 CA K2ABC 599 ED TX',
  'END-OF-LOG:'
].join('\n');
const repeatedExchangeParsed = core.parseLogFile(repeatedExchangeTail, 'multi-token-exchange.log');
assert.deepEqual(repeatedExchangeParsed.qsos.map((q) => q.txId), [null, null]);
assert.deepEqual(repeatedExchangeParsed.qsos.map((q) => q.exchRcvd), ['AL TX', 'ED TX']);

const allZero = parsed.qsos.map((q) => ({ ...q, txId: '0', raw: { ...q.raw, TX_ID: '0' } }));
assert.equal(buildRadioModel(allZero, { categoryTransmitter: 'TWO' }).diagnostics.status, 'Suspicious');

const threeIds = parsed.qsos.map((q, index) => ({ ...q, txId: ['ALPHA', '2', 'R3'][index], raw: { ...q.raw, TX_ID: ['ALPHA', '2', 'R3'][index] } }));
assert.deepEqual(discoverRadioIds(threeIds), ['2', 'ALPHA', 'R3']);
assert.equal(buildRadioModel(threeIds, { categoryTransmitter: 'UNLIMITED' }).rows.length, 3);
const adif = '<CALL:5>K1ABC<QSO_DATE:8>20260101<TIME_ON:6>120000<BAND:3>20M<MODE:2>CW<TX_ID:2>R3<EOR>';
assert.equal(core.parseLogFile(adif, 'radio.adi').qsos[0].txId, 'R3');
const n1mmAdif = '<CALL:5>K1ABC<QSO_DATE:8>20260101<TIME_ON:6>120000<BAND:3>20M<MODE:2>CW<APP_N1MM_RADIO_NR:1>2<EOR>';
assert.equal(core.parseLogFile(n1mmAdif, 'n1mm.adi').qsos[0].txId, '2');
const cbf = '20260101;120000;K1ABC;20M;CW;599;599;001;002;TEST1;JN76;15;28;ALPHA';
assert.equal(core.parseLogFile(cbf, 'radio.cbf').qsos[0].txId, 'ALPHA');

const legacyMulti = cabrillo.replace('CATEGORY-TRANSMITTER: TWO\n', '');
assert.deepEqual(core.parseLogFile(legacyMulti, 'legacy-multi.log').qsos.map((q) => q.txId), ['0', '1', '0']);

const malformed = [{ ...parsed.qsos[0], txId: 'bad id', raw: { ...parsed.qsos[0].raw, TX_ID: 'bad id' } }, parsed.qsos[1]];
assert.equal(buildRadioModel(malformed, { categoryTransmitter: 'TWO' }).diagnostics.status, 'Suspicious');
const collision = [0, 1].map((index) => ({ ...parsed.qsos[0], id: index, txId: '0', ts: Date.UTC(2026, 6, 11, 12, 0, 5), raw: { ...parsed.qsos[0].raw, TX_ID: '0', TIME_ON: '120005' } }));
assert.equal(buildRadioModel(collision, { categoryTransmitter: 'ONE' }).diagnostics.collisions.length, 1);
const secondPrecisionModel = buildRadioModel(collision.slice(0, 1), { categoryTransmitter: 'ONE' });
assert.equal(secondPrecisionModel.rows[0].activeMinutes, 1);
assert.equal(secondPrecisionModel.rows[0].observedMinutes, 1);

const handoffBase = parsed.qsos[0];
const trueHandoff = [
  { ...handoffBase, ts: 0, txId: '0', band: '20M' },
  { ...handoffBase, ts: 5 * 60000, txId: '1', band: '20M' }
];
assert.equal(detectRadioHandoffs(trueHandoff).length, 1, 'quiet stop/start should remain a possible handoff');
const alternating = [
  { ...handoffBase, ts: 0, txId: '0', band: '20M' },
  { ...handoffBase, ts: 60000, txId: '1', band: '20M' },
  { ...handoffBase, ts: 2 * 60000, txId: '0', band: '20M' }
];
assert.equal(detectRadioHandoffs(alternating).length, 0, 'ordinary alternating activity is not a stop/start handoff');
const simultaneous = [
  { ...handoffBase, ts: 0, txId: '0', band: '20M' },
  { ...handoffBase, ts: 0, txId: '1', band: '20M' }
];
assert.equal(detectRadioHandoffs(simultaneous).length, 0, 'simultaneous activity has no directional handoff');

const gappedSeries = buildRadioModel([
  { ...handoffBase, ts: Date.UTC(2026, 6, 11, 0, 0), txId: '0' },
  { ...handoffBase, ts: Date.UTC(2026, 6, 11, 6, 0), txId: '0' }
], { categoryTransmitter: 'TWO' });
assert.match(renderRadioSeries(gappedSeries, 'qsos', 'five-minute'), /<circle/, 'isolated periods must not be bridged by a line');

const mainSource = fs.readFileSync('./main.js', 'utf8');
assert.match(mainSource, /<th>Flags<\/th>\$\{showRadioColumn \? '<th>Radio<\/th>'/);
assert.ok(mainSource.indexOf("{ id: 'flags', label: 'Flags' }") < mainSource.indexOf("{ id: 'radio', label: 'Radio' }"));
assert.match(mainSource, /function buildQsoLiteArray[\s\S]*?txId:\s*q\.txId/);
assert.match(mainSource, /Matched-QSO attribution by radio \(inferred\)/);
assert.match(mainSource, /radio-csv-export[\s\S]*?withBandContext\(reportId, \(\) => withRadioTimeContext/, 'Radio CSV export must use the displayed time window');
const workerSource = fs.readFileSync('./modules/engine/task-worker.js', 'utf8');
assert.match(workerSource, /txId:\s*q\.txId/);

const scoringSpec = JSON.parse(fs.readFileSync('./data/contest_scoring_spec.json', 'utf8'));
const resources = { scoringSpec, ctyTable: core.parseCtyDat(fs.readFileSync('./cty.dat', 'utf8')), masterCalls: [] };
const archiveShapeDerived = core.buildDerived(allZero, { logFile: { name: 'MB5Q.log' } }, resources);
assert.equal(archiveShapeDerived.contestMeta.categoryTransmitter, 'TWO');
assert.equal(buildRadioModel(allZero, archiveShapeDerived.contestMeta).diagnostics.status, 'Suspicious');
const racDerived = core.buildDerived(core.parseLogFile(racMostShape.replace('CONTEST: IARU-HF', 'CONTEST: RAC'), 'rac-most.log').qsos, { scoringRuleOverride: 'rac_canada_2026' }, resources);
assert.ok(!(racDerived.scoring.assumptions || []).some((value) => /lacks Cabrillo transmitter ID/i.test(value)), 'parsed RAC MOST IDs must reach existing scoring enforcement');
const twoCreditModel = buildRadioModel(parsed.qsos.slice(0, 1), { categoryTransmitter: 'TWO' }, { scoring: { multiplierCredits: [{ qsoIndex: 0, group: 'country', entityKey: 'A' }, { qsoIndex: 0, group: 'zone', entityKey: 'B' }] } });
assert.equal(twoCreditModel.rows[0].multipliers, 2);
assert.match(buildRadioCsv('radio_coordination', model), /^section,key,minutes/);
assert.match(buildRadioCsv('radio_audit', model), /^class,finding,evidenceLevel,status/);
const timedHandoffs = (count) => {
  const dense = Array.from({ length: count }, (_, index) => ({ ...parsed.qsos[index % parsed.qsos.length], ts: Date.UTC(2026, 6, 11, 12, 0) + index * 1000, band: '20M', txId: String(index % 2) }));
  const started = performance.now();
  detectRadioHandoffs(dense);
  return performance.now() - started;
};
const handoffSmallMs = timedHandoffs(12000);
const handoffLargeMs = timedHandoffs(48000);
assert.ok(handoffLargeMs < 1500 && handoffLargeMs < handoffSmallMs * 8 + 50, `handoff detection should scale near-linearly (${handoffSmallMs.toFixed(1)}ms -> ${handoffLargeMs.toFixed(1)}ms)`);
const scoredWithNormalized = core.buildDerived(parsed.qsos.map((q) => ({ ...q, raw: { ...q.raw } })), { scoringRuleOverride: 'wrtc_2026' }, resources).scoring;
const rawCompatibleQsos = parsed.qsos.map((q) => { const copy = { ...q, raw: { ...q.raw } }; delete copy.txId; return copy; });
const scoredWithRawOnly = core.buildDerived(rawCompatibleQsos, { scoringRuleOverride: 'wrtc_2026' }, resources).scoring;
assert.equal(scoredWithNormalized.computedScore, scoredWithRawOnly.computedScore, 'WRTC scoring must not change when q.txId is promoted');

console.log('[radio-regression] PASS');
EOF
