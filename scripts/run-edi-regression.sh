#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

node <<'EOF'
const fs = require('fs');
const path = require('path');

require('./modules/analysis/core.js');
const core = globalThis.SH6AnalysisCore;

if (!core || typeof core.parseLogFile !== 'function') {
  throw new Error('SH6AnalysisCore.parseLogFile is unavailable');
}

const fixtureDir = path.join('tests', 'fixtures', 'edi-regression');
const failures = [];
const checks = [];

function check(name, condition, details) {
  const passed = Boolean(condition);
  checks.push({ name, passed, ...(details === undefined ? {} : { details }) });
  if (!passed) failures.push({ name, details });
}

function readFixture(name) {
  return fs.readFileSync(path.join(fixtureDir, name), 'utf8');
}

function firstObject(...values) {
  return values.find((value) => value && typeof value === 'object') || {};
}

function metadata(parsed) {
  return firstObject(parsed.meta, parsed.metadata, parsed.header, parsed.contestMeta, parsed.raw?.header, parsed.qsos?.[0]?.raw);
}

function value(parsed, key) {
  const meta = metadata(parsed);
  const upper = String(key).toUpperCase();
  const ediHeader = firstObject(meta.EDI_HEADER, meta.ediHeader);
  return meta[key] ?? meta[upper] ?? ediHeader[key] ?? ediHeader[upper] ?? parsed[key] ?? parsed[upper] ?? '';
}

function warnings(parsed) {
  return parsed.warnings || parsed.parseWarnings || parsed.issues || [];
}

function qsoRaw(qso) {
  return firstObject(qso.edi, qso.rawEDI, qso.raw, qso.source);
}

function qsoValue(qso, ...keys) {
  const raw = qsoRaw(qso);
  for (const key of keys) {
    if (qso[key] !== undefined && qso[key] !== null && (qso[key] !== '' || raw[key] === undefined)) return qso[key];
    if (raw[key] !== undefined && raw[key] !== null) return raw[key];
    const upper = String(key).toUpperCase();
    if (qso[upper] !== undefined && qso[upper] !== null && (qso[upper] !== '' || raw[upper] === undefined)) return qso[upper];
    if (raw[upper] !== undefined && raw[upper] !== null) return raw[upper];
  }
  return '';
}

function qsoFields(qso) {
  const raw = qsoRaw(qso);
  return qso.ediFields || qso.fields || qso.rawFields || qsoValue(qso, 'EDI_FIELDS', 'QSO_FIELDS', 'fields') || raw.fields;
}

function fieldAt(qso, index) {
  const fields = qsoFields(qso);
  return Array.isArray(fields) ? fields[index] : undefined;
}

function dateUtc(year, month, day, hh, mm) {
  return Date.UTC(year, month - 1, day, hh, mm);
}

function normalizedMode(qso) {
  const mode = String(qsoValue(qso, 'mode', 'MODE', 'ediMode', 'modeCode')).trim().toUpperCase();
  const tx = String(qsoValue(qso, 'txMode', 'TX_MODE')).trim().toUpperCase();
  const rx = String(qsoValue(qso, 'rxMode', 'RX_MODE')).trim().toUpperCase();
  return { mode, tx, rx };
}

function modeMatches(qso, code) {
  const expected = {
    '0': ['0', 'UNSPECIFIED', 'UNKNOWN', ''],
    '1': ['1', 'SSB'],
    '2': ['2', 'CW'],
    '3': ['3', 'SSB/CW', 'SSB-CW'],
    '4': ['4', 'CW/SSB', 'CW-SSB'],
    '5': ['5', 'AM'],
    '6': ['6', 'FM'],
    '7': ['7', 'RTTY', 'MGM'],
    '8': ['8', 'SSTV'],
    '9': ['9', 'ATV']
  }[String(code)];
  const actual = normalizedMode(qso);
  return expected.some((candidate) => actual.mode === candidate || actual.tx === candidate || actual.rx === candidate)
    || (String(code) === '3' && actual.tx === 'SSB' && actual.rx === 'CW')
    || (String(code) === '4' && actual.tx === 'CW' && actual.rx === 'SSB');
}

function parseFixture(name, filename = name) {
  return core.parseLogFile(readFixture(name), filename);
}

function modeQsoBandIs(parsed, expected) {
  return (parsed.qsos || []).every((qso) => String(qso.band || '').toUpperCase() === String(expected).toUpperCase());
}

const allModesText = readFixture('all-modes.edi');
const allModes = core.parseLogFile(allModesText, 'ALL-MODES.EDI');
const modeQso = allModes.qsos || [];
check('recognizes REG1TEST EDI regardless of extension case', allModes.type === 'EDI', allModes.type);
check('parses all ten synthetic QSO records', allModes.qsos?.length === 10, allModes.qsos?.length);
check('preserves station callsign metadata', String(value(allModes, 'PCall')).toUpperCase() === 'TEST1', metadata(allModes));
check('preserves full contest dates', String(value(allModes, 'TDate')) === '19991231;20000101', metadata(allModes));
check('preserves decimal-comma GHz PBand text', String(value(allModes, 'PBand')) === '1,3 GHz', metadata(allModes));
check('normalizes decimal-comma GHz PBand to a stable band label', modeQsoBandIs(allModes, '23CM'), (allModes.qsos || []).map((qso) => qso.band));
check('does not fabricate an exact frequency from PBand', allModes.freqMHz == null && (allModes.qsos || []).every((qso) => qso.freq == null), { freqMHz: allModes.freqMHz, freqs: (allModes.qsos || []).map((qso) => qso.freq) });
const unsupportedVersion = core.parseLogFile(allModesText.replace('[REG1TEST;1]', '[REG1TEST;2]'), 'unsupported-version.edi');
check('does not silently accept unsupported EDI versions', unsupportedVersion.type === 'unknown'
  || warnings(unsupportedVersion).some((warning) => /version|unsupported|identifier/i.test(String(warning.code || warning.message || warning))), unsupportedVersion);
check('records declared and actual QSO counts', Number(allModes.declaredRecords || value(allModes, 'declaredRecordCount') || value(allModes, 'qsoRecordsDeclared') || allModes.recordCount?.declared) === 10
  && Number(allModes.parsedRecords || value(allModes, 'actualRecordCount') || allModes.recordCount?.actual || allModes.qsos?.length) === 10, allModes);

const expectedModes = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
expectedModes.forEach((code, index) => {
  const qso = modeQso[index] || {};
  check(`preserves EDI mode code ${code}`, String(qsoValue(qso, 'modeCode', 'ediMode', 'MODE', 'mode')).trim() === code || modeMatches(qso, code), qso);
});

const first = modeQso[0] || {};
check('resolves YYMMDD 991231 using TDate century', Number(qsoValue(first, 'ts', 'timestamp')) === dateUtc(1999, 12, 31, 23, 59), first);
check('resolves YYMMDD 000101 using TDate century', Number(qsoValue(modeQso[1] || {}, 'ts', 'timestamp')) === dateUtc(2000, 1, 1, 0, 1), modeQso[1]);
check('keeps leading zeros in sent serial', String(qsoValue(modeQso[0] || {}, 'stx', 'sentSerial', 'sentQsoNumber', 'STX')) === '001', modeQso[0]);
check('keeps received exchange and locator separately', String(qsoValue(first, 'exchRcvd', 'receivedExchange', 'SRX_STRING', 'SRX')) === 'EX'
  && String(qsoValue(first, 'grid', 'locator', 'receivedLocator', 'GRIDSQUARE')) === 'JN76AA', first);
check('keeps logged QSO points separate from distance', Number(qsoValue(first, 'points', 'qsoPoints', 'QSO_POINTS')) === 10, first);
check('preserves all 15 semicolon-separated QSO fields', modeQso.every((qso) => Array.isArray(qsoFields(qso)) && qsoFields(qso).length === 15), modeQso.map(qsoFields));
check('preserves new and duplicate source flags', String(qsoValue(modeQso[0] || {}, 'newExchange', 'NEW_EXCHANGE', 'newWwl', 'NEW_WWL')).toUpperCase() === 'N'
  && String(qsoValue(modeQso[4] || {}, 'duplicate', 'duplicateQso', 'DUPLICATE_QSO')).toUpperCase() === 'D', { first: modeQso[0], dupe: modeQso[4] });

const malformed = parseFixture('error-and-malformed.edi', 'error-and-malformed.edi');
check('retains ERROR placeholder as an auditable record', malformed.qsos?.some((qso) => String(qso.call || qso.raw?.CALL || '').toUpperCase() === 'ERROR'), malformed.qsos);
const errorQso = (malformed.qsos || []).find((qso) => String(qso.call || qso.raw?.CALL || '').toUpperCase() === 'ERROR');
check('ERROR placeholder has zero points and is not usable', errorQso && Number(qsoValue(errorQso, 'points', 'qsoPoints', 'QSO_POINTS') || 0) === 0
  && (errorQso.isError === true || errorQso.error === true || String(qsoValue(errorQso, 'recordStatus', 'status')).toUpperCase() === 'ERROR'), errorQso);
check('retains duplicate source record with zero points', malformed.qsos?.some((qso) => String(qsoValue(qso, 'duplicate', 'duplicateQso', 'DUPLICATE_QSO')).toUpperCase() === 'D'
  && Number(qsoValue(qso, 'points', 'qsoPoints', 'QSO_POINTS') || 0) === 0), malformed.qsos);
check('reports malformed record with actionable warning', warnings(malformed).length > 0, warnings(malformed));
check('reports declared/actual mismatch or malformed count', Number(malformed.declaredRecords || value(malformed, 'declaredRecordCount') || value(malformed, 'qsoRecordsDeclared') || malformed.recordCount?.declared) === 5
  && Number(malformed.parsedRecords || value(malformed, 'actualRecordCount') || malformed.recordCount?.actual || malformed.qsos?.length) === 4
  && warnings(malformed).some((warning) => /count|record/i.test(String(warning.code || warning.message || warning))), malformed);

const overflow = core.parseLogFile(`[REG1TEST;1]\nTDate=20240101;20240101\nPCall=TEST\nPBand=144 MHz\n[QSORecords;1]\n240101;1200;S51AAA;1;59;001;59;001;;JN76AA;10;;;;\n240101;1201;S52BBB;1;59;002;59;002;;JN76AB;10;;;;\n[END]\n`, 'overflow.edi');
check('does not silently discard records beyond declared count', overflow.qsos?.length === 2 && warnings(overflow).some((warning) => warning.code === 'record-count-overflow'), { count: overflow.qsos?.length, warnings: warnings(overflow) });
const longLine = core.parseLogFile(`[REG1TEST;1]\nTDate=20240101;20240101\nPCall=TEST\n[QSORecords;1]\n240101;1200;S51AAA;1;59;001;59;001;${'X'.repeat(5000)};JN76AA;10;;;;\n`, 'long-line.edi');
check('bounds oversized EDI lines with a warning', warnings(longLine).some((warning) => warning.code === 'line-too-long'), warnings(longLine));

// The parser must tolerate all line ending forms and an optional UTF-8 BOM.
for (const [label, transformed] of [
  ['LF', allModesText.replace(/\r\n|\r/g, '\n')],
  ['CRLF', allModesText.replace(/\r\n|\r|\n/g, '\r\n')],
  ['CR', allModesText.replace(/\r\n|\r|\n/g, '\r')],
  ['BOM + CRLF', `\uFEFF${allModesText.replace(/\r\n|\r|\n/g, '\r\n')}`]
]) {
  const parsed = core.parseLogFile(transformed, `line-endings-${label}.edi`);
  check(`supports ${label} line endings`, parsed.type === 'EDI' && parsed.qsos?.length === 10, { type: parsed.type, count: parsed.qsos?.length });
}

// The real file is deliberately optional for CI, but when it is present this is a
// strict reconciliation of the public sample used by the EDI implementation task.
const realPath = process.env.SH6_EDI_REAL_FILE || path.join(process.env.HOME || '', 'Downloads', 'aavhf2020.edi');
if (fs.existsSync(realPath)) {
  const realText = fs.readFileSync(realPath, 'utf8');
  const real = core.parseLogFile(realText, path.basename(realPath));
  const declared = Number((realText.match(/^\[QSORecords;(\d+)\]/mi) || [])[1]);
  const qsoCount = Array.isArray(real.qsos) ? real.qsos.length : 0;
  check('real aavhf2020.edi is recognized as EDI', real.type === 'EDI', real.type);
  check('real file preserves 545 declared records', declared === 545, declared);
  check('real file parses 545 records', qsoCount === 545, qsoCount);
  check('real file preserves S50C station call', String(value(real, 'PCall')).toUpperCase() === 'S50C', metadata(real));
  check('real file preserves JN76JG station locator', String(value(real, 'PWWLo')).toUpperCase() === 'JN76JG', metadata(real));
  check('real file preserves 144 MHz band declaration', /144\s*MHZ/i.test(String(value(real, 'PBand'))), metadata(real));
  const firstReal = real.qsos?.[0] || {};
  check('real file resolves first record to 2020-08-02 06:00 UTC', Number(qsoValue(firstReal, 'ts', 'timestamp')) === dateUtc(2020, 8, 2, 6, 0), firstReal);
  console.log(`[edi-regression] real file: ${realPath} declared=${declared} parsed=${qsoCount}`);
} else {
  console.log(`[edi-regression] SKIP real-file reconciliation; set SH6_EDI_REAL_FILE to an EDI sample`);
}

const passed = failures.length === 0;
console.log(JSON.stringify({
  passed,
  checkCount: checks.length,
  failedChecks: failures.map((entry) => entry.name),
  failures
}, null, 2));
if (!passed) process.exit(1);
console.log(`[edi-regression] PASS (${checks.length} checks)`);
EOF
