#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

node --input-type=module <<'EOF'
import fs from 'node:fs';
const moduleSource = fs.readFileSync('./modules/multipliers/opportunities-model.js', 'utf8');
const { buildMultiplierOpportunities, rowsToSafeCsv } = await import(`data:text/javascript;base64,${Buffer.from(moduleSource).toString('base64')}`);
const viewSource = fs.readFileSync('./modules/multipliers/opportunities-view.js', 'utf8');
const { createMultiplierOpportunitiesView } = await import(`data:text/javascript;base64,${Buffer.from(viewSource).toString('base64')}`);

function assert(condition, message, details) {
  if (condition) return;
  console.error(`[multiplier-opportunities] ${message}`);
  if (details !== undefined) console.error(JSON.stringify(details, null, 2));
  process.exit(1);
}

const perspective = {
  compatibilityKey: 'wae|weighted_mults|per_band|common|wae_country_or_dxcc_set_by_station_region',
  countingScope: 'per_band',
  stationPerspective: 'common'
};
const base = Date.UTC(2025, 7, 9, 0, 0);
const credit = (entityKey, callsign, band, weightedCredit, timestamp = base) => ({
  ruleId: 'wae', group: 'wae_country_or_dxcc_set_by_station_region', entityKey,
  entityLabel: entityKey, countingScope: 'per_band', scopeKey: band, band, mode: 'CW',
  rawCredit: 1, weightedCredit, callsign, timestamp, qsoIndex: 0
});
const slots = [
  {
    id: 'A', callsign: 'S53M', stationContinent: 'EU',
    qsos: [
      { call: 'K1A', band: '20M', ts: base + (10 * 60000) },
      { call: 'K2A', band: '40M', ts: base + (31 * 60000) }
    ],
    scoring: {
      ruleId: 'wae', multiplierModelSupported: true, multiplierPerspective: perspective,
      computedRawMultiplierTotal: 1, computedMultiplierTotal: 445,
      multiplierCredits: [credit('GERMANY', 'DL1A', '20M', 445)], multiplierRejections: []
    }
  },
  {
    id: 'B', callsign: 'OM2VL', stationContinent: 'EU', qsos: [],
    scoring: {
      ruleId: 'wae', multiplierModelSupported: true, multiplierPerspective: perspective,
      computedRawMultiplierTotal: 2, computedMultiplierTotal: 505,
      multiplierCredits: [credit('GERMANY', 'DL1A', '20M', 445), credit('FRANCE', 'F1A', '20M', 60)],
      multiplierRejections: []
    }
  }
];
const model = buildMultiplierOpportunities({
  slots, referenceSlotId: 'A', correlationWindowMinutes: 15,
  contestStartTs: base, contestEndTs: base + 3600000,
  rbnSpots: [
    { dxCall: 'F1A', spotter: 'DL0SK1', spotterContinent: 'EU', band: '20M', mode: 'CW', ts: base + (5 * 60000) },
    { dxCall: 'F1A', spotter: 'OH0SK2', spotterContinent: 'EU', band: '20M', mode: 'CW', ts: base + (15 * 60000) },
    { dxCall: 'F1A', spotter: 'K1SK', spotterContinent: 'NA', band: '20M', mode: 'CW', ts: base + (15 * 60000) },
    { dxCall: 'F1A', spotter: 'DL0LATE', spotterContinent: 'EU', band: '20M', mode: 'CW', ts: base + 7200000 }
  ],
  clusterSpots: [{ dxCall: 'F1A', spotter: 'S50X', spotterContinent: 'EU', band: '20M', ts: base + (10 * 60000) }],
  resolveDxccPrefix: (call) => call.startsWith('F') ? 'F' : ''
});

assert(model.supported, 'WAE model should be supported', model);
assert(model.weightedGap === 60 && model.rawGap === 1, 'Raw and weighted gaps must use compatible ledgers', model);
assert(model.bandModeGaps.reduce((sum, row) => sum + row.weightedGap, 0) === 60, 'Band/mode weighted gaps must reconcile to the total gap', model.bandModeGaps);
assert(model.candidates.length === 1, 'Comparison-only credit should create one entity candidate', model.candidates);
assert(model.candidates[0].confidence === 'High', 'Two same-continent RBN skimmers plus same-band activity should be High', model.candidates[0]);
assert(model.candidates[0].factors.distinctRbnSkimmers === 2, 'Different-continent and out-of-period spots must be excluded', model.candidates[0]);
assert(model.candidates[0].evidence.length === 3, 'Qualifying cluster and RBN events should be retained', model.candidates[0].evidence);
assert(model.candidates[0].dxccPrefix === 'F', 'Country opportunities must expose the canonical DXCC prefix', model.candidates[0]);
assert(model.bandModeGaps.some((row) => row.band === '40M' && row.loadedQsos === 1), 'Bands used by either loaded log must appear even without multiplier credits', model.bandModeGaps);
assert(model.bandModeGaps.every((row) => row.loadedQsos > 0), 'Breakdown rows must require a QSO in a loaded log', model.bandModeGaps);

const view = createMultiplierOpportunitiesView({
  escapeHtml: (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'),
  escapeAttr: (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('"', '&quot;')
});
const rendered = view.render(model, { slots });
assert(rendered.includes('<th>DXCC / multiplier</th>') && rendered.includes('>F</td>'), 'Compact table must display DXCC prefixes', rendered.slice(0, 2000));
assert(!rendered.includes('<th>Group</th>') && !rendered.includes('<th>Scope</th>') && !rendered.includes('<th>Status</th>'), 'Compact table must omit diagnostic columns', rendered.slice(0, 4000));

const boundary = buildMultiplierOpportunities({
  slots, referenceSlotId: 'A', correlationWindowMinutes: 5, contestStartTs: base, contestEndTs: base + 3600000,
  rbnSpots: [{ dxCall: 'F1A', spotter: 'DL0SK1', spotterContinent: 'EU', band: '20M', mode: 'CW', ts: base + (5 * 60000) }]
});
assert(boundary.candidates[0].factors.sameBandActivity, 'Correlation window boundaries must be inclusive', boundary.candidates[0]);

const spottedOnlyKey = 'wae_country_or_dxcc_set_by_station_region|per_band|20M|ITALY';
const spottedOnly = buildMultiplierOpportunities({
  slots: [slots[0]], referenceSlotId: 'A', contestStartTs: base, contestEndTs: base + 3600000,
  clusterSpots: [{
    dxCall: 'I1ABC', spotter: 'DL1SP', spotterContinent: 'EU', band: '20M', ts: base + (8 * 60000),
    multiplierEntities: [{ key: spottedOnlyKey, group: 'wae_country_or_dxcc_set_by_station_region', entityKey: 'ITALY', entityLabel: 'Italy', countingScope: 'per_band', scopeKey: '20M', band: '20M', mode: 'CW', rawValue: 1, weightedValue: 2 }]
  }]
});
assert(spottedOnly.candidates.length === 1 && spottedOnly.candidates[0].status === 'Weak opportunity', 'Eligible spots must create candidates without comparison-log credit', spottedOnly.candidates);

const incompatible = buildMultiplierOpportunities({
  slots: [slots[0], { ...slots[1], scoring: { ...slots[1].scoring, multiplierPerspective: { ...perspective, compatibilityKey: 'wae|other' } } }],
  referenceSlotId: 'A'
});
assert(incompatible.compatibility[0].compatible === false && incompatible.weightedGap === 0, 'Incompatible perspectives must disable gap totals', incompatible);

const fourSlotModel = buildMultiplierOpportunities({
  slots: [
    ...slots,
    { ...slots[1], id: 'C', callsign: 'C1TEST', scoring: { ...slots[1].scoring, computedMultiplierTotal: 510, multiplierCredits: [...slots[1].scoring.multiplierCredits, credit('ITALY', 'I1A', '20M', 5)] } },
    { ...slots[1], id: 'D', callsign: 'D1TEST', scoring: { ...slots[1].scoring, computedMultiplierTotal: 515, multiplierCredits: [...slots[1].scoring.multiplierCredits, credit('SPAIN', 'EA1A', '20M', 10)] } }
  ],
  referenceSlotId: 'A'
});
assert(fourSlotModel.compatibility.length === 3 && fourSlotModel.comparisonLeaderSlotId === 'D', 'All four comparison slots must participate in compatible leader selection', fourSlotModel);

const cqPerspective = { compatibilityKey: 'cqww|sum_of_groups|per_band|common|cq_zone,country', countingScope: 'per_band', stationPerspective: 'common' };
const cqCredit = { ...credit('JAPAN', 'JA1ABC', '20M', 1), ruleId: 'cqww', group: 'country', entityLabel: 'Japan' };
const cqModel = buildMultiplierOpportunities({
  slots: [
    { id: 'A', callsign: 'S53M', stationContinent: 'EU', qsos: [], scoring: { ruleId: 'cqww', multiplierModelSupported: true, multiplierPerspective: cqPerspective, computedRawMultiplierTotal: 0, computedMultiplierTotal: 0, multiplierCredits: [], multiplierRejections: [] } },
    { id: 'B', callsign: 'OM2VL', stationContinent: 'EU', qsos: [], scoring: { ruleId: 'cqww', multiplierModelSupported: true, multiplierPerspective: cqPerspective, computedRawMultiplierTotal: 1, computedMultiplierTotal: 1, multiplierCredits: [cqCredit], multiplierRejections: [] } }
  ], referenceSlotId: 'A'
});
assert(cqModel.supported && cqModel.candidates[0]?.group === 'country', 'Non-WAE multiplier contests must use the same ledger opportunity model', cqModel);

const unsupported = buildMultiplierOpportunities({
  slots: [{ id: 'A', scoring: { ruleId: 'rf', multiplierModelSupported: false } }], referenceSlotId: 'A'
});
assert(!unsupported.supported, 'Non-multiplier contests must return an unsupported state', unsupported);

const csv = rowsToSafeCsv(['call', 'note'], [{ call: '=CMD()', note: 'A,"B"' }]);
assert(csv.includes("'=CMD()") && csv.includes('"A,""B"""'), 'CSV must neutralize formulas and escape quotes', csv);

console.log('[multiplier-opportunities] PASS');
EOF
