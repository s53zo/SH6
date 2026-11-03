import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import '../modules/analysis/core.js';

const source = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8');
const functions = source.slice(source.indexOf('  function getLogExchangeValue('), source.indexOf('  function renderRawLogPanel('));
let retained;
let filtered;
const identity = (value) => String(value ?? '');
const context = {
  state: { qsoData: { qsos: [] }, logPage: 0, logPageSize: 1 },
  radioRuntime: null,
  getRadioRuntime: () => ({ RADIO_MISSING_FILTER: 'missing', formatRadioLabel: identity }),
  getLogFilters: () => ({}), applyLogFilters: (qsos) => filtered ?? qsos,
  setRetainedReportModel: (_id, model) => { retained = model; },
  renderLogCompareContent: () => 'comparison unchanged',
  renderPlaceholder: () => '',
  escapeCall: identity, escapeHtml: identity, escapeAttr: identity, escapeCountry: identity,
  formatBandLabel: identity, formatFrequency: identity, formatDateSh6: identity,
  formatNumberSh6: identity, formatNumberHtmlSh6: identity,
  bandClass: () => '', modeClass: () => '', continentClass: () => ''
};
vm.createContext(context);
vm.runInContext(functions, context);
const qso = (stx, srx) => ({ call: '4L7T', rstSent: '-14', rstRcvd: '-12', stx, srx });
function render(qsos, sent, received) {
  context.state.fullQsoData = { qsos };
  context.state.qsoData = { qsos };
  const html = context.renderLogContent();
  assert.equal(html.includes('<th>Exch Sent</th>'), sent);
  assert.equal(html.includes('<th>Exch Rcvd</th>'), received);
  const count = (html.match(/<th>/g) || []).length;
  assert.equal(count, 15 + Number(sent) + Number(received));
  assert.equal(retained.colspan, count);
  for (const row of retained.rows) assert.equal((row.match(/<td(?:\s|>)/g) || []).length, count);
  assert.ok(retained.emptyHtml.includes(`colspan="${count}"`));
  return html;
}
render([qso('', '-'), qso('  ', ' - ')], false, false);
assert.ok(retained.rows[0].includes('>-14</td>') && retained.rows[0].includes('>-12</td>'));
for (const value of ['0', 0, '001', 'JN76JG', '001 NV']) {
  render([qso(value, '-')], true, false);
  render([qso('-', value)], false, true);
}
render([{ exchSent: '001', exchRcvd: 'JO31AA' }], true, true);
render([{ stx: '-', exchSent: '0', srx: ' ', exchRcvd: '001 NV' }], true, true);
assert.ok(retained.rows[0].includes('>0</td>') && retained.rows[0].includes('>001 NV</td>'));
const wholeLog = [qso('-', '-'), qso('001', 'JN76')];
filtered = [wholeLog[0]];
render(wholeLog, true, true);
context.state.logPage = 1;
filtered = undefined;
render(wholeLog, true, true);
filtered = [];
render(wholeLog, true, true);
filtered = undefined;
context.state.compareEnabled = true;
assert.equal(context.renderLogContent(), 'comparison unchanged');
context.state.compareEnabled = false;
context.state.logPage = 0;
const sample = 'START-OF-LOG: 3.0\nQSO: 14000 RY 2026-04-11 1204 4Z4UO -14 - 4L7T -12 -\n';
const parsed = globalThis.SH6AnalysisCore.parseLogFile(sample, '4Z4UO.log');
render(parsed.qsos, false, false);
assert.equal(parsed.qsos[0].mode, 'RTTY');
assert.equal(parsed.qsos[0].rstSent, '-14');
assert.equal(parsed.qsos[0].rstRcvd, '-12');
assert.equal(parsed.qsos[0].exchSent, '-');
if (process.argv[2]) {
  const real = globalThis.SH6AnalysisCore.parseLogFile(fs.readFileSync(process.argv[2], 'utf8'), '4Z4UO.log');
  render(real.qsos, false, false);
  console.log(`Real archive log: ${real.qsos.length} contacts; both exchange columns hidden`);
}
console.log('Log exchange columns PASS: independent visibility, zero, serials, locators, full-log stability, row/virtual colspan alignment, compare routing, RST and mode preservation');
