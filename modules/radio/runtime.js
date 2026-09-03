const MISSING_RADIO = '__MISSING__';
const DEFAULT_ACTIVITY_WINDOW_MS = 5 * 60 * 1000;
const DEFAULT_BUCKET_MS = 5 * 60 * 1000;
const HANDOFF_WINDOW_MS = 10 * 60 * 1000;

function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function csv(value) {
  const text = String(value == null ? '' : value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function normalizeRadioId(value) {
  if (value == null) return null;
  const id = String(value).trim().toUpperCase();
  return id && /^[A-Z0-9][A-Z0-9._-]{0,15}$/.test(id) ? id : null;
}

export function getQsoRadioId(qso) {
  return normalizeRadioId(qso?.txId ?? qso?.raw?.TX_ID ?? qso?.raw?.TRANSMITTER_ID ?? qso?.raw?.RADIO_ID ?? qso?.raw?.RADIO);
}

export function formatRadioLabel(value) {
  const id = normalizeRadioId(value);
  return id == null ? 'Missing' : (/^R[A-Z0-9]/.test(id) ? id : `R${id}`);
}

function naturalCompare(left, right) {
  return String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' });
}

export function discoverRadioIds(qsos) {
  return Array.from(new Set((qsos || []).map(getQsoRadioId).filter(Boolean))).sort(naturalCompare);
}

function declaredRadioExpectation(meta = {}) {
  const tx = String(meta.categoryTransmitter || meta.CATEGORY_TRANSMITTER || '').trim().toUpperCase();
  const op = String(meta.categoryOperator || meta.category || '').trim().toUpperCase();
  if (tx === 'TWO' || /(?:MULTI[- /]?TWO|\bM\/?2\b)/.test(`${tx} ${op}`)) return 2;
  // Cabrillo ONE describes simultaneous transmitted signals, not necessarily
  // the number of station/transmitter identifiers recorded by a multi-single log.
  if (tx === 'ONE' || tx === 'SINGLE') return null;
  if (tx === 'UNLIMITED') return null;
  const numeric = Number.parseInt(tx, 10);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function pointAt(qso, index, pointsByIndex) {
  const value = Array.isArray(pointsByIndex) ? Number(pointsByIndex[index]) : Number(qso?.points);
  return Number.isFinite(value) ? value : 0;
}

function multiplierCreditsByIndex(scoring) {
  const out = new Map();
  (scoring?.multiplierCredits || []).forEach((credit) => {
    const index = Number(credit?.qsoIndex);
    if (!Number.isFinite(index)) return;
    const amount = Number(credit?.rawCredit);
    out.set(index, (out.get(index) || 0) + (Number.isFinite(amount) ? amount : 1));
  });
  return out;
}

export function buildRadioDiagnostics(qsos, meta = {}, options = {}) {
  const list = Array.isArray(qsos) ? qsos : [];
  const ids = discoverRadioIds(list);
  const counts = Object.fromEntries(ids.map((id) => [id, 0]));
  let missingCount = 0;
  let malformedCount = 0;
  const collisionMap = new Map();
  const collisions = [];
  list.forEach((q, index) => {
    const rawValue = q?.txId ?? q?.raw?.TX_ID ?? q?.raw?.TRANSMITTER_ID ?? q?.raw?.RADIO_ID ?? q?.raw?.RADIO;
    const id = getQsoRadioId(q);
    if (id == null) {
      missingCount += 1;
      if (rawValue != null && String(rawValue).trim()) malformedCount += 1;
      return;
    }
    counts[id] = (counts[id] || 0) + 1;
    if (!Number.isFinite(q?.ts)) return;
    const rawTime = String(q?.raw?.TIME_ON || q?.raw?.TIME || '').replace(/\D/g, '');
    // Cabrillo normally records only minutes, so two QSOs sharing that timestamp
    // are not evidence of simultaneous transmission. Only audit exact collisions
    // when the source supplies seconds.
    if (rawTime.length < 6) return;
    const key = `${id}|${q.ts}`;
    const prior = collisionMap.get(key);
    if (prior != null) collisions.push({ radioId: id, timestamp: q.ts, firstIndex: prior, secondIndex: index });
    else collisionMap.set(key, index);
  });
  const expectedCount = declaredRadioExpectation(meta);
  const unexpectedIdCount = expectedCount != null && ids.length > expectedCount ? ids.length - expectedCount : 0;
  const declared = String(meta.categoryTransmitter || meta.CATEGORY_TRANSMITTER || '').trim().toUpperCase();
  let status = 'Not applicable';
  const findings = [];
  if (ids.length || missingCount < list.length || expectedCount != null) {
    status = 'Complete';
    if (missingCount > 0 && ids.length) {
      status = 'Partial';
      findings.push(`${missingCount} QSO${missingCount === 1 ? '' : 's'} lack a transmitter ID.`);
    }
    if (expectedCount === 2 && ids.length < 2 && list.length) {
      status = 'Suspicious';
      findings.push(`The log declares two transmitters but contains only ${ids.length || 'no'} transmitter ID${ids.length === 1 ? '' : 's'}.`);
    }
    if (unexpectedIdCount > 0) {
      status = 'Suspicious';
      findings.push(`${ids.length} transmitter IDs exceed the declared limit of ${expectedCount}.`);
    }
    if (malformedCount > 0) {
      status = 'Suspicious';
      findings.push(`${malformedCount} transmitter value${malformedCount === 1 ? ' is' : 's are'} malformed.`);
    }
    if (collisions.length) {
      status = 'Suspicious';
      findings.push(`${collisions.length} possible same-radio timestamp collision${collisions.length === 1 ? '' : 's'} found.`);
    }
    if (!ids.length && list.length) status = expectedCount != null ? 'Suspicious' : 'Not applicable';
  }
  const total = list.length;
  return {
    total, ids, counts, missingCount, malformedCount, expectedCount, unexpectedIdCount,
    collisions, declared, status, findings,
    coveragePct: total ? ((total - missingCount) / total) * 100 : 0
  };
}

export function filterQsosByRadio(qsos, radioFilter) {
  const filter = String(radioFilter || '').trim().toUpperCase();
  if (!filter) return Array.isArray(qsos) ? qsos.slice() : [];
  if (filter === MISSING_RADIO) return (qsos || []).filter((q) => getQsoRadioId(q) == null);
  return (qsos || []).filter((q) => getQsoRadioId(q) === filter);
}

function minutePeak(qsos) {
  const minutes = new Map();
  (qsos || []).forEach((q) => {
    if (!Number.isFinite(q?.ts)) return;
    const key = Math.floor(q.ts / 60000);
    minutes.set(key, (minutes.get(key) || 0) + 1);
  });
  return Math.max(0, ...minutes.values());
}

function aggregateRows(qsos, pointsByIndex, scoring) {
  const ids = discoverRadioIds(qsos);
  const mults = multiplierCreditsByIndex(scoring);
  const multiplierEntitiesByIndex = new Map();
  (scoring?.multiplierCredits || []).forEach((entry) => {
    const index = Number(entry?.qsoIndex);
    const entity = String(entry?.entityKey || '').trim();
    if (!Number.isFinite(index) || !entity) return;
    if (!multiplierEntitiesByIndex.has(index)) multiplierEntitiesByIndex.set(index, new Set());
    multiplierEntitiesByIndex.get(index).add(`${entry.group || ''}|${entry.scopeKey || ''}|${entity}`);
  });
  const rows = [...ids, MISSING_RADIO].map((id) => ({ id, qsos: 0, points: 0, multipliers: 0, multiplierEntities: new Set(), peakMinute: 0, activeMinutes: 0, idleMinutes: 0, longAbsences: [], bands: new Map(), modes: new Map(), styles: new Map(), list: [] }));
  const byId = new Map(rows.map((row) => [row.id, row]));
  (qsos || []).forEach((q, index) => {
    const id = getQsoRadioId(q) || MISSING_RADIO;
    const row = byId.get(id);
    if (!row) return;
    row.qsos += 1;
    row.points += pointAt(q, index, pointsByIndex);
    row.multipliers += mults.get(index) || 0;
    (multiplierEntitiesByIndex.get(index) || []).forEach((entity) => row.multiplierEntities.add(entity));
    row.bands.set(q.band || 'Unknown', (row.bands.get(q.band || 'Unknown') || 0) + 1);
    row.modes.set(q.mode || 'Unknown', (row.modes.get(q.mode || 'Unknown') || 0) + 1);
    const style = q.operatingStyleRole || 'Unclassified';
    row.styles.set(style, (row.styles.get(style) || 0) + 1);
    row.list.push(q);
  });
  rows.forEach((row) => {
    row.peakMinute = minutePeak(row.list);
    const timed = row.list.filter((q) => Number.isFinite(q?.ts)).sort((a, b) => a.ts - b.ts);
    row.firstTs = timed[0]?.ts ?? null;
    row.lastTs = timed.at(-1)?.ts ?? null;
    for (let i = 1; i < timed.length; i += 1) {
      const gapMs = timed[i].ts - timed[i - 1].ts;
      if (gapMs >= 30 * 60000) row.longAbsences.push({ startTs: timed[i - 1].ts, endTs: timed[i].ts, minutes: gapMs / 60000 });
    }
  });
  return rows.filter((row) => row.qsos > 0);
}

function dominant(map) {
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1] || naturalCompare(a[0], b[0]))[0]?.[0] || '—';
}

export function buildRadioTimeline(qsos, options = {}) {
  const bucketMs = Math.max(60000, Number(options.bucketMs) || DEFAULT_BUCKET_MS);
  const mults = multiplierCreditsByIndex(options.scoring);
  const buckets = new Map();
  (qsos || []).forEach((q, index) => {
    const id = getQsoRadioId(q) || MISSING_RADIO;
    if (!Number.isFinite(q?.ts)) return;
    const start = Math.floor(q.ts / bucketMs) * bucketMs;
    const key = `${start}|${id}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { start, radioId: id, qsos: 0, points: 0, multipliers: 0, bands: new Map(), modes: new Map(), styles: new Map() };
      buckets.set(key, bucket);
    }
    bucket.qsos += 1;
    bucket.points += pointAt(q, index, options.pointsByIndex);
    bucket.multipliers += mults.get(index) || 0;
    bucket.bands.set(q.band || 'Unknown', (bucket.bands.get(q.band || 'Unknown') || 0) + 1);
    bucket.modes.set(q.mode || 'Unknown', (bucket.modes.get(q.mode || 'Unknown') || 0) + 1);
    const style = q.operatingStyleRole || 'Unclassified';
    bucket.styles.set(style, (bucket.styles.get(style) || 0) + 1);
  });
  const recorded = Array.from(buckets.values()).map((bucket) => ({
    ...bucket, band: dominant(bucket.bands), mode: dominant(bucket.modes), style: dominant(bucket.styles)
  })).sort((a, b) => a.start - b.start || naturalCompare(a.radioId, b.radioId));
  const rows = recorded.slice();
  Array.from(new Set(recorded.map((row) => row.radioId))).forEach((id) => {
    const own = recorded.filter((row) => row.radioId === id).sort((a, b) => a.start - b.start);
    for (let i = 1; i < own.length; i += 1) {
      const gapMs = own[i].start - own[i - 1].start - bucketMs;
      if (gapMs >= bucketMs) rows.push({ start: own[i - 1].start + bucketMs, end: own[i].start, durationMs: gapMs, radioId: id, idle: true, qsos: 0, points: 0, multipliers: 0, band: 'Idle', mode: '—', style: '—' });
      if (own[i].band !== own[i - 1].band) own[i].bandChange = `${own[i - 1].band} → ${own[i].band}`;
    }
  });
  return rows.sort((a, b) => a.start - b.start || naturalCompare(a.radioId, b.radioId));
}

function buildMinuteStates(qsos, options = {}) {
  const activityWindowMs = Math.max(60000, Number(options.activityWindowMs) || DEFAULT_ACTIVITY_WINDOW_MS);
  const ids = discoverRadioIds(qsos);
  const valid = (qsos || []).filter((q) => getQsoRadioId(q) && Number.isFinite(q?.ts)).sort((a, b) => a.ts - b.ts);
  if (!valid.length) return { ids, states: [], activityWindowMs };
  const start = Math.floor(valid[0].ts / 60000) * 60000;
  const end = Math.floor(valid.at(-1).ts / 60000) * 60000;
  const byRadio = new Map(ids.map((id) => [id, valid.filter((q) => getQsoRadioId(q) === id)]));
  const cursors = new Map(ids.map((id) => [id, 0]));
  const latest = new Map();
  const states = [];
  for (let minute = start; minute <= end; minute += 60000) {
    const active = [];
    ids.forEach((id) => {
      const list = byRadio.get(id) || [];
      let cursor = cursors.get(id) || 0;
      while (cursor < list.length && list[cursor].ts <= minute + 59999) {
        latest.set(id, list[cursor]);
        cursor += 1;
      }
      cursors.set(id, cursor);
      const q = latest.get(id);
      if (q && minute + 59999 - q.ts < activityWindowMs) active.push({ radioId: id, band: q.band || 'Unknown', mode: q.mode || 'Unknown', qso: q });
    });
    states.push({ minute, active });
  }
  return { ids, states, activityWindowMs };
}

export function buildRadioCoordination(qsos, options = {}) {
  const { ids, states, activityWindowMs } = buildMinuteStates(qsos, options);
  const concurrency = {};
  const bandPairs = new Map();
  const modePairs = new Map();
  let sameBandMinutes = 0;
  let differentBandMinutes = 0;
  states.forEach((state) => {
    const count = state.active.length;
    concurrency[count] = (concurrency[count] || 0) + 1;
    if (count >= 2) {
      const bands = state.active.map((item) => `${formatRadioLabel(item.radioId)} ${item.band}`).sort();
      const modes = state.active.map((item) => `${formatRadioLabel(item.radioId)} ${item.mode}`).sort();
      const bandKey = bands.join(' + ');
      const modeKey = modes.join(' + ');
      bandPairs.set(bandKey, (bandPairs.get(bandKey) || 0) + 1);
      modePairs.set(modeKey, (modePairs.get(modeKey) || 0) + 1);
      if (new Set(state.active.map((item) => item.band)).size === 1) sameBandMinutes += 1;
      else differentBandMinutes += 1;
    }
  });
  const activeMulti = sameBandMinutes + differentBandMinutes;
  return {
    ids, states, activityWindowMs, totalMinutes: states.length, concurrency, bandPairs, modePairs,
    sameBandMinutes, differentBandMinutes,
    concurrentPct: states.length ? (activeMulti / states.length) * 100 : 0
  };
}

export function detectRadioHandoffs(qsos, options = {}) {
  const maxGapMs = Math.max(60000, Number(options.maxGapMs) || HANDOFF_WINDOW_MS);
  const mults = multiplierCreditsByIndex(options.scoring);
  const byBand = new Map();
  (qsos || []).forEach((q, index) => {
    const id = getQsoRadioId(q);
    if (!id || !q?.band || !Number.isFinite(q?.ts)) return;
    const list = byBand.get(q.band) || [];
    list.push({ q, index, id });
    byBand.set(q.band, list);
  });
  const results = [];
  byBand.forEach((entries, band) => {
    entries.sort((a, b) => a.q.ts - b.q.ts);
    const previousSameRadio = new Array(entries.length).fill(-1);
    const nextSameRadio = new Array(entries.length).fill(-1);
    const lastByRadio = new Map();
    entries.forEach((entry, index) => {
      previousSameRadio[index] = lastByRadio.get(entry.id) ?? -1;
      lastByRadio.set(entry.id, index);
    });
    const nextByRadio = new Map();
    for (let index = entries.length - 1; index >= 0; index -= 1) {
      const entry = entries[index];
      nextSameRadio[index] = nextByRadio.get(entry.id) ?? -1;
      nextByRadio.set(entry.id, index);
    }
    let nearbyLeft = 0;
    let nearbyRight = 0;
    for (let i = 1; i < entries.length; i += 1) {
      const prior = entries[i - 1];
      const next = entries[i];
      const gapMs = next.q.ts - prior.q.ts;
      if (prior.id === next.id || gapMs <= 0 || gapMs > maxGapMs) continue;
      const priorDestinationIndex = previousSameRadio[i];
      const nextSourceIndex = nextSameRadio[i - 1];
      if (priorDestinationIndex >= 0 && next.q.ts - entries[priorDestinationIndex].q.ts <= maxGapMs) continue;
      if (nextSourceIndex >= 0 && entries[nextSourceIndex].q.ts - prior.q.ts <= maxGapMs) continue;
      const windowStart = next.q.ts - 5 * 60000;
      const windowEnd = next.q.ts + 5 * 60000;
      while (nearbyLeft < entries.length && entries[nearbyLeft].q.ts < windowStart) nearbyLeft += 1;
      if (nearbyRight < nearbyLeft) nearbyRight = nearbyLeft;
      while (nearbyRight < entries.length && entries[nearbyRight].q.ts <= windowEnd) nearbyRight += 1;
      const nearby = nearbyRight - nearbyLeft;
      results.push({
        timestamp: next.q.ts, band, mode: next.q.mode || prior.q.mode || '', fromRadio: prior.id,
        toRadio: next.id, gapMs, nearbyRate: nearby, nearbyMultiplier: mults.has(prior.index) || mults.has(next.index)
      });
    }
  });
  return results.sort((a, b) => a.timestamp - b.timestamp);
}

export function buildBandPairHeatmap(qsos, options = {}) {
  const coordination = options.coordination || buildRadioCoordination(qsos, options);
  let selected = Array.isArray(options.radioIds) && options.radioIds.length >= 2
    ? options.radioIds.slice(0, 2).map(normalizeRadioId) : coordination.ids.slice(0, 2);
  if (!selected[0] || !selected[1] || selected[0] === selected[1] || !coordination.ids.includes(selected[0]) || !coordination.ids.includes(selected[1])) {
    selected = coordination.ids.slice(0, 2);
  }
  const [radioA, radioB] = selected;
  const cells = new Map();
  const stateByMinute = new Map(coordination.states.map((entry) => [entry.minute, entry]));
  const mults = multiplierCreditsByIndex(options.scoring);
  coordination.states.forEach((state) => {
    const a = state.active.find((item) => item.radioId === radioA)?.band || 'Idle';
    const b = state.active.find((item) => item.radioId === radioB)?.band || 'Idle';
    const key = `${a}|${b}`;
    const cell = cells.get(key) || { bandA: a, bandB: b, minutes: 0, qsos: 0, points: 0, multipliers: 0 };
    cell.minutes += 1;
    cells.set(key, cell);
  });
  (qsos || []).forEach((q, index) => {
    const id = getQsoRadioId(q);
    if (!id || !Number.isFinite(q?.ts) || ![radioA, radioB].includes(id)) return;
    const state = stateByMinute.get(Math.floor(q.ts / 60000) * 60000);
    const a = state?.active.find((item) => item.radioId === radioA)?.band || 'Idle';
    const b = state?.active.find((item) => item.radioId === radioB)?.band || 'Idle';
    const cell = cells.get(`${a}|${b}`);
    if (!cell) return;
    cell.qsos += 1;
    cell.points += pointAt(q, index, options.pointsByIndex);
    cell.multipliers += mults.get(index) || 0;
  });
  const cellList = Array.from(cells.values()).map((cell) => ({
    ...cell,
    combinedRate: cell.minutes ? (cell.qsos / cell.minutes) * 60 : 0
  }));
  return { radioA, radioB, cells: cellList, activityWindowMs: coordination.activityWindowMs };
}

export function buildRadioModel(qsos, meta = {}, options = {}) {
  const diagnostics = buildRadioDiagnostics(qsos, meta, options);
  const rows = aggregateRows(qsos, options.pointsByIndex, options.scoring);
  const coordination = buildRadioCoordination(qsos, options);
  rows.forEach((row) => {
    if (row.id === MISSING_RADIO) return;
    const firstMinute = Number.isFinite(row.firstTs) ? Math.floor(row.firstTs / 60000) * 60000 : null;
    const lastMinute = Number.isFinite(row.lastTs) ? Math.floor(row.lastTs / 60000) * 60000 : null;
    const ownStates = coordination.states.filter((state) => firstMinute != null && lastMinute != null && state.minute >= firstMinute && state.minute <= lastMinute);
    row.activeMinutes = ownStates.filter((state) => state.active.some((item) => item.radioId === row.id)).length;
    row.observedMinutes = ownStates.length;
    row.idleMinutes = Math.max(0, row.observedMinutes - row.activeMinutes);
  });
  return {
    visible: diagnostics.ids.length > 0,
    diagnostics, rows, coordination,
    scoring: options.scoring || null,
    timeline: buildRadioTimeline(qsos, options),
    minuteTimeline: buildRadioTimeline(qsos, { ...options, bucketMs: 60000 }),
    handoffs: detectRadioHandoffs(qsos, options),
    heatmap: buildBandPairHeatmap(qsos, { ...options, coordination }),
    multiplierOverlap: rows.filter((row) => row.id !== MISSING_RADIO).flatMap((left, index, all) => all.slice(index + 1).map((right) => ({ left: left.id, right: right.id, count: Array.from(left.multiplierEntities).filter((entity) => right.multiplierEntities.has(entity)).length }))),
    peakMinute: minutePeak(qsos)
  };
}

function table(headers, rows, cls = '', caption = '') {
  return `<div class="table-wrap"><table class="mtc ${cls}">${caption ? `<caption>${esc(caption)}</caption>` : ''}<thead><tr class="thc">${headers.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
}

function statusClass(status) {
  if (status === 'Complete') return 'state-success';
  if (status === 'Suspicious') return 'state-warning';
  return 'state-info';
}

export function renderRadioSummary(model) {
  if (!model?.visible) return '';
  const d = model.diagnostics;
  const rows = model.rows.map((row) => `<tr><td>${esc(formatRadioLabel(row.id))}</td><td>${row.qsos.toLocaleString()}</td><td>${d.total ? (row.qsos / d.total * 100).toFixed(1) : '0.0'}%</td><td>${Math.round(row.points).toLocaleString()}</td><td>${row.multipliers.toLocaleString()}</td><td>${row.peakMinute}</td></tr>`);
  return `<section class="radio-summary report-card"><h3>Transmitter data</h3><div class="state-card ${statusClass(d.status)}"><strong>${esc(d.status)}</strong> · ${d.coveragePct.toFixed(1)}% TX_ID coverage · missing ${d.missingCount.toLocaleString()} · discovered ${d.ids.map(formatRadioLabel).map(esc).join(', ') || 'none'}${d.declared ? ` · declared ${esc(d.declared)}` : ''}<br>${d.findings.map(esc).join(' ')}</div>${table(['Radio','QSOs','Share','Points','First mults','Peak Q/min'], rows, 'radio-summary-table')}<p class="export-note">Radio labels reproduce submitted transmitter IDs; they do not identify an operator or imply RUN/multiplier roles. Combined peak: ${model.peakMinute} Q/min. Concurrent multi-radio activity: ${model.coordination.concurrentPct.toFixed(1)}% using a ${model.coordination.activityWindowMs / 60000}-minute activity window.</p></section>`;
}

export function renderRadioBreakdown(model, title = 'By radio') {
  if (!model?.visible) return '';
  const rows = model.rows.map((row) => `<tr><td>${esc(formatRadioLabel(row.id))}</td><td>${row.qsos.toLocaleString()}</td><td>${Math.round(row.points).toLocaleString()}</td><td>${row.multipliers.toLocaleString()}</td><td>${row.multiplierEntities.size.toLocaleString()}</td><td>${row.peakMinute}</td><td>${row.id === MISSING_RADIO ? '—' : row.activeMinutes}</td><td>${row.id === MISSING_RADIO ? '—' : row.idleMinutes}</td><td>${esc(dominant(row.bands))}</td><td>${esc(dominant(row.modes))}</td><td>${esc(dominant(row.styles))} <small>(inferred)</small></td></tr>`);
  const overlaps = (model.multiplierOverlap || []).filter((row) => row.count).map((row) => `${formatRadioLabel(row.left)}/${formatRadioLabel(row.right)}: ${row.count}`).join(' · ');
  return `<section class="radio-breakdown report-card"><h3>${esc(title)}</h3>${table(['Radio','QSOs','Points','First mults','Mult entities seen','Peak Q/min','Active min','Idle min','Primary band','Primary mode','Primary style'], rows, 'radio-breakdown-table')}${overlaps ? `<p>Contest-semantic multiplier overlap: ${esc(overlaps)}.</p>` : ''}</section>`;
}

export function renderRadioMatrices(model) {
  if (!model?.visible) return '';
  const bands = Array.from(new Set(model.rows.flatMap((row) => Array.from(row.bands.keys())))).sort(naturalCompare);
  const modes = Array.from(new Set(model.rows.flatMap((row) => Array.from(row.modes.keys())))).sort(naturalCompare);
  const styles = Array.from(new Set(model.rows.flatMap((row) => Array.from(row.styles.keys())))).sort(naturalCompare);
  const bandRows = model.rows.map((row) => `<tr><th>${esc(formatRadioLabel(row.id))}</th>${bands.map((band) => `<td>${row.bands.get(band) || '—'}</td>`).join('')}<td>${row.qsos}</td></tr>`);
  const modeRows = model.rows.map((row) => `<tr><th>${esc(formatRadioLabel(row.id))}</th>${modes.map((mode) => `<td>${row.modes.get(mode) || '—'}</td>`).join('')}<td>${row.qsos}</td></tr>`);
  const styleRows = model.rows.map((row) => `<tr><th>${esc(formatRadioLabel(row.id))}</th>${styles.map((style) => `<td>${row.styles.get(style) || '—'}</td>`).join('')}<td>${row.qsos}</td></tr>`);
  return `<section class="radio-matrices report-card"><h3>Radio distribution</h3><div class="radio-grid">${table(['Radio', ...bands, 'Total'], bandRows, 'radio-band-matrix')}${table(['Radio', ...modes, 'Total'], modeRows, 'radio-mode-matrix')}${table(['Radio', ...styles.map((style) => `${style} (inferred)`), 'Total'], styleRows, 'radio-style-matrix')}</div></section>`;
}

export function renderRadioHourly(model, metric = 'qsos') {
  if (!model?.visible) return '';
  const ids = model.rows.map((row) => row.id);
  const buckets = new Map();
  (model.timeline || []).filter((row) => !row.idle).forEach((row) => {
    const hour = Math.floor(row.start / 3600000) * 3600000;
    if (!buckets.has(hour)) buckets.set(hour, new Map(ids.map((id) => [id, 0])));
    const map = buckets.get(hour);
    map.set(row.radioId, (map.get(row.radioId) || 0) + (Number(row[metric]) || 0));
  });
  const rows = Array.from(buckets.entries()).sort((a, b) => a[0] - b[0]).map(([hour, values]) => {
    const nums = ids.map((id) => values.get(id) || 0);
    const total = nums.reduce((sum, value) => sum + value, 0);
    const stacked = ids.map((id, index) => `<span class="radio-stack-segment" style="width:${total ? (nums[index] / total * 100) : 0}%;--radio-hue:${(index * 83 + 205) % 360}" title="${esc(`${formatRadioLabel(id)}: ${Math.round(nums[index])}`)}"></span>`).join('');
    return `<tr><td>${new Date(hour).toISOString().slice(0, 13).replace('T', ' ')}Z</td><td>${Math.round(total).toLocaleString()}</td>${nums.map((value) => `<td>${Math.round(value).toLocaleString()}</td>`).join('')}<td><span class="radio-stack" aria-label="${esc(ids.map((id, index) => `${formatRadioLabel(id)} ${Math.round(nums[index])}`).join(', '))}">${stacked}</span></td></tr>`;
  });
  return `<section class="radio-hourly report-card"><h3>${metric === 'points' ? 'Points' : 'QSOs'} by hour and radio</h3>${table(['UTC hour', 'Station total', ...ids.map(formatRadioLabel), 'Radio split'], rows, 'radio-hourly-table', `${metric === 'points' ? 'Points' : 'QSOs'} by UTC hour and submitted radio ID`)}</section>`;
}

export function renderRadioMinutePeaks(model, metric = 'qsos') {
  if (!model?.visible) return '';
  const recorded = (model.minuteTimeline || []).filter((row) => !row.idle);
  const combined = new Map();
  recorded.forEach((row) => combined.set(row.start, (combined.get(row.start) || 0) + (Number(row[metric]) || 0)));
  const rows = [];
  model.diagnostics.ids.forEach((id) => {
    recorded.filter((row) => row.radioId === id).sort((a, b) => (Number(b[metric]) || 0) - (Number(a[metric]) || 0)).slice(0, 5).forEach((row) => rows.push({ label: formatRadioLabel(id), start: row.start, value: Number(row[metric]) || 0 }));
  });
  Array.from(combined.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([start, value]) => rows.push({ label: 'Station total', start, value }));
  rows.sort((a, b) => b.value - a.value || a.start - b.start);
  return `<section class="radio-minute-peaks report-card"><h3>Top one-minute ${metric === 'points' ? 'point totals' : 'rates'} by radio</h3>${table(['Scope','UTC minute',metric === 'points' ? 'Points' : 'QSOs'], rows.map((row) => `<tr><td>${esc(row.label)}</td><td>${new Date(row.start).toISOString().slice(0,16).replace('T',' ')}Z</td><td>${Math.round(row.value).toLocaleString()}</td></tr>`), 'radio-minute-table')}</section>`;
}

export function renderRadioSeries(model, metric = 'qsos', resolution = 'five-minute') {
  if (!model?.visible) return '';
  const source = resolution === 'minute' ? model.minuteTimeline : model.timeline;
  const bucketMs = resolution === 'hour' ? 3600000 : (resolution === 'minute' ? 60000 : 300000);
  const ids = model.rows.map((row) => row.id);
  const buckets = new Map();
  (source || []).filter((row) => !row.idle).forEach((row) => {
    const start = Math.floor(row.start / bucketMs) * bucketMs;
    if (!buckets.has(start)) buckets.set(start, new Map(ids.map((id) => [id, 0])));
    const values = buckets.get(start);
    values.set(row.radioId, (values.get(row.radioId) || 0) + (Number(row[metric]) || 0));
  });
  const times = Array.from(buckets.keys()).sort((a, b) => a - b);
  if (!times.length) return '';
  const series = [
    { id: '__TOTAL__', label: 'Station total', color: '#173a5e', values: times.map((time) => Array.from(buckets.get(time).values()).reduce((sum, value) => sum + value, 0)) },
    ...ids.map((id, index) => ({ id, label: formatRadioLabel(id), color: `hsl(${(index * 83 + 205) % 360} 65% 42%)`, values: times.map((time) => buckets.get(time).get(id) || 0) }))
  ];
  const max = Math.max(1, ...series.flatMap((entry) => entry.values));
  const width = 900;
  const height = 230;
  const left = 42;
  const top = 14;
  const plotWidth = width - left - 12;
  const plotHeight = height - top - 32;
  const minTs = times[0];
  const maxTs = times.at(-1);
  const spanMs = Math.max(bucketMs, maxTs - minTs);
  const x = (time) => left + (times.length === 1 ? plotWidth / 2 : (time - minTs) / spanMs * plotWidth);
  const y = (value) => top + plotHeight - value / max * plotHeight;
  const splitRuns = (entry) => {
    const runs = [];
    let run = [];
    times.forEach((time, index) => {
      if (run.length && time - run.at(-1).time > bucketMs * 1.5) {
        runs.push(run);
        run = [];
      }
      run.push({ time, value: entry.values[index] });
    });
    if (run.length) runs.push(run);
    return runs;
  };
  const lines = series.map((entry) => splitRuns(entry).map((run) => {
    if (run.length === 1) {
      return `<circle cx="${x(run[0].time).toFixed(1)}" cy="${y(run[0].value).toFixed(1)}" r="${entry.id === '__TOTAL__' ? 2.5 : 2}" fill="${esc(entry.color)}"><title>${esc(entry.label)}</title></circle>`;
    }
    return `<polyline fill="none" stroke="${esc(entry.color)}" stroke-width="${entry.id === '__TOTAL__' ? 2.5 : 1.7}" points="${run.map((point) => `${x(point.time).toFixed(1)},${y(point.value).toFixed(1)}`).join(' ')}"><title>${esc(entry.label)}</title></polyline>`;
  }).join('')).join('');
  const grid = [0, .25, .5, .75, 1].map((ratio) => {
    const gy = top + plotHeight * (1 - ratio);
    return `<line x1="${left}" x2="${left + plotWidth}" y1="${gy}" y2="${gy}" class="radio-series-grid"/><text x="${left - 5}" y="${gy + 4}" text-anchor="end">${Math.round(max * ratio)}</text>`;
  }).join('');
  const startLabel = new Date(times[0]).toISOString().slice(0, 16).replace('T', ' ');
  const endLabel = new Date(times.at(-1)).toISOString().slice(0, 16).replace('T', ' ');
  const legend = series.map((entry) => `<span><i style="--series-color:${esc(entry.color)}"></i>${esc(entry.label)}</span>`).join('');
  const metricLabel = metric === 'points' ? 'points' : 'QSOs';
  return `<figure class="radio-series-figure"><svg role="img" aria-label="${esc(`${metricLabel} by ${resolution} and radio`)}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><title>${esc(`${metricLabel} by ${resolution} and radio`)}</title>${grid}${lines}<text x="${left}" y="${height - 6}">${esc(startLabel)}Z</text><text x="${left + plotWidth}" y="${height - 6}" text-anchor="end">${esc(endLabel)}Z</text></svg><div class="radio-series-legend">${legend}</div><figcaption>Aligned ${esc(resolution)} ${esc(metricLabel)} series. Station total includes the Missing group when transmitter IDs are incomplete. Each chart states its own numeric axes and is independently scaled; compare the axis labels or exact table values across logs.</figcaption></figure>`;
}

export function renderRadioCoach(model) {
  if (!model?.visible) return '';
  const d = model.diagnostics;
  if (d.status !== 'Complete') return `<section class="radio-coach report-card"><h3>Two-radio coaching</h3><p>Advice is suppressed because transmitter data is ${esc(d.status.toLowerCase())}; review the transmitter-rule audit before interpreting workload.</p></section>`;
  const rows = model.rows.filter((row) => row.id !== MISSING_RADIO).sort((a, b) => b.qsos - a.qsos);
  if (rows.length < 2) return '';
  const total = rows.reduce((sum, row) => sum + row.qsos, 0);
  const imbalance = total ? (rows[0].qsos - rows.at(-1).qsos) / total * 100 : 0;
  const advice = [];
  if (imbalance >= 20) advice.push(`Workload differs by ${imbalance.toFixed(1)} percentage points between the busiest and quietest recorded radios; review long idle periods and whether band coverage was intentional.`);
  const longestGap = rows.flatMap((row) => row.longAbsences.map((gap) => ({ ...gap, id: row.id }))).sort((a, b) => b.minutes - a.minutes)[0];
  if (longestGap) advice.push(`${formatRadioLabel(longestGap.id)} has a ${longestGap.minutes.toFixed(1)}-minute gap between recorded QSOs; check the timeline before treating this as avoidable idle time.`);
  const best = (model.heatmap?.cells || []).filter((cell) => cell.bandA !== 'Idle' && cell.bandB !== 'Idle').sort((a, b) => b.combinedRate - a.combinedRate)[0];
  if (best) advice.push(`The strongest recorded band pair was ${best.bandA} + ${best.bandB} at ${best.combinedRate.toFixed(1)} combined Q/h under the five-minute activity model.`);
  const multLeader = rows.slice().sort((a, b) => b.multipliers - a.multipliers)[0];
  if (multLeader?.multipliers) advice.push(`${formatRadioLabel(multLeader.id)} contributed the most first-worked multiplier credits (${multLeader.multipliers}); this is attribution, not proof of a multiplier-radio role.`);
  return `<section class="radio-coach report-card"><h3>Two-radio coaching</h3>${advice.length ? `<ul>${advice.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` : '<p>No strong radio-specific coaching signal was found.</p>'}</section>`;
}

function bandHue(band) {
  const known = { '160M': 282, '80M': 248, '40M': 215, '20M': 154, '15M': 45, '10M': 12, Idle: 0, Unknown: 190 };
  if (known[band] != null) return known[band];
  return Array.from(String(band || '')).reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) % 360, 205);
}

function timelineModeClass(mode) {
  const value = String(mode || '').toUpperCase();
  if (value === 'CW') return 'radio-mode-cw';
  if (/SSB|PHONE|PH|USB|LSB/.test(value)) return 'radio-mode-ssb';
  return 'radio-mode-digital';
}

function timelineStyleClass(style) {
  const value = String(style || '').toUpperCase();
  if (value === 'RUN') return 'radio-style-run';
  if (value === 'INBAND') return 'radio-style-inband';
  if (/S&P|SEARCH/.test(value)) return 'radio-style-search';
  return 'radio-style-unclassified';
}

function renderRadioTimelineVisual(model) {
  const recorded = (model.timeline || []).filter((row) => !row.idle && Number.isFinite(row.start));
  if (!recorded.length) return '';
  const bucketMs = 5 * 60000;
  const minTs = Number.isFinite(model?.displayRange?.minTs) ? model.displayRange.minTs : Math.min(...recorded.map((row) => row.start));
  const maxTs = Number.isFinite(model?.displayRange?.maxTs) ? model.displayRange.maxTs : Math.max(...recorded.map((row) => row.start + bucketMs));
  const span = Math.max(bucketMs, maxTs - minTs);
  const maxQsos = Number.isFinite(model?.displayMaxQsos) ? Math.max(1, model.displayMaxQsos) : Math.max(1, ...recorded.map((row) => row.qsos));
  const ids = Array.from(new Set(recorded.map((row) => row.radioId))).sort(naturalCompare);
  const lanes = ids.map((id) => {
    const segments = recorded.filter((row) => row.radioId === id).map((row) => {
      const left = (row.start - minTs) / span * 100;
      const width = bucketMs / span * 100;
      const title = `${formatRadioLabel(id)} · ${new Date(row.start).toISOString().slice(0, 16).replace('T', ' ')}Z · ${row.band} · ${row.mode} · ${row.qsos} QSO${row.qsos === 1 ? '' : 's'}${row.multipliers ? ` · ${row.multipliers} first mult` : ''}${row.bandChange ? ` · ${row.bandChange}` : ''}`;
      return `<span class="radio-timeline-segment ${timelineModeClass(row.mode)} ${timelineStyleClass(row.style)}${row.multipliers ? ' has-mult' : ''}${row.bandChange ? ' has-change' : ''}" style="left:${left}%;width:max(${width}%,2px);--band-hue:${bandHue(row.band)};--segment-opacity:${(0.35 + 0.65 * row.qsos / maxQsos).toFixed(2)}" title="${esc(title)}" aria-hidden="true"></span>`;
    }).join('');
    const laneRows = recorded.filter((row) => row.radioId === id);
    const laneSummary = `${formatRadioLabel(id)}: ${laneRows.reduce((sum, row) => sum + row.qsos, 0)} QSOs in ${laneRows.length} recorded five-minute buckets; use the detailed timeline table for exact values.`;
    return `<div class="radio-timeline-lane"><div class="radio-timeline-label">${esc(formatRadioLabel(id))}</div><div class="radio-timeline-track" role="img" tabindex="0" aria-label="${esc(laneSummary)}">${segments}</div></div>`;
  }).join('');
  const start = new Date(minTs).toISOString().slice(0, 16).replace('T', ' ');
  const end = new Date(maxTs).toISOString().slice(0, 16).replace('T', ' ');
  const bands = Array.from(new Set(recorded.map((row) => row.band || 'Unknown'))).sort(naturalCompare);
  const legend = bands.map((band) => `<span><i style="--band-hue:${bandHue(band)}"></i>${esc(band)}</span>`).join('');
  return `<figure class="radio-timeline-figure" aria-label="Radio activity timeline from ${esc(start)} UTC to ${esc(end)} UTC"><div class="radio-timeline-axis"><span>${esc(start)}Z</span><span>${esc(end)}Z</span></div>${lanes}<div class="radio-band-legend" aria-label="Timeline band colour legend">${legend}</div><figcaption>Five-minute recorded-activity lanes. Colour identifies band; solid/striped/dotted fills identify CW/phone/digital; opacity indicates QSO intensity; bottom borders identify inferred RUN/S&amp;P/INBAND style; ◆ marks first multipliers; a white divider marks a band change. Blank areas mean no tagged QSO was recorded.</figcaption></figure>`;
}

export function renderRadioTimeline(model) {
  if (!model?.visible) return '<div class="state-card state-info"><h3>No transmitter data</h3><p>This log has no recorded transmitter IDs.</p></div>';
  const max = Math.max(1, ...model.timeline.map((row) => row.qsos));
  const rows = model.timeline.map((row) => `<tr${row.idle ? ' class="radio-idle-row"' : ''}><td>${new Date(row.start).toISOString().slice(0,16).replace('T',' ')}Z${row.idle ? `–${new Date(row.end).toISOString().slice(11,16)}Z` : ''}</td><td>${esc(formatRadioLabel(row.radioId))}</td><td>${esc(row.bandChange || row.band)}</td><td>${esc(row.mode)}</td><td>${esc(row.style)}${row.idle ? '' : ' <small>(inferred)</small>'}</td><td>${row.idle ? `Idle ${Math.round(row.durationMs / 60000)} min` : `<span class="radio-intensity" style="--radio-intensity:${Math.max(0.08, row.qsos / max)}"></span>${row.qsos}`}</td><td>${Math.round(row.points)}</td><td>${row.multipliers}</td></tr>`);
  return `<p>Five-minute buckets contain recorded QSOs. Empty spans are shown explicitly and are never filled as continuous operation. Operating style is inferred independently of radio identity.</p>${renderRadioTimelineVisual(model)}<details class="radio-timeline-details"><summary>Detailed timeline table</summary>${table(['UTC bucket / interval','Radio','Band / change','Mode','Operating style','QSOs / state','Points','First mults'], rows, 'radio-timeline-table', 'Detailed five-minute radio timeline')}</details>`;
}

export function renderRadioCoordination(model) {
  if (!model?.visible) return '<p>No transmitter data is available.</p>';
  const c = model.coordination;
  const concurrency = Object.entries(c.concurrency).sort((a,b) => Number(a[0])-Number(b[0])).map(([count, minutes]) => `<tr><td>${count}</td><td>${minutes}</td><td>${c.totalMinutes ? (minutes / c.totalMinutes * 100).toFixed(1) : '0.0'}%</td></tr>`);
  const pairs = Array.from(c.bandPairs.entries()).sort((a,b) => b[1]-a[1]).slice(0,40).map(([pair, minutes]) => `<tr><td>${esc(pair)}</td><td>${minutes}</td></tr>`);
  const modePairs = Array.from(c.modePairs.entries()).sort((a,b) => b[1]-a[1]).slice(0,40).map(([pair, minutes]) => `<tr><td>${esc(pair)}</td><td>${minutes}</td></tr>`);
  const pairMetrics = (model.heatmap?.cells || []).filter((cell) => cell.bandA !== 'Idle' || cell.bandB !== 'Idle').sort((a, b) => b.combinedRate - a.combinedRate).slice(0, 40).map((cell) => `<tr><td>${esc(cell.bandA)} + ${esc(cell.bandB)}</td><td>${cell.minutes}</td><td>${cell.qsos}</td><td>${Math.round(cell.points)}</td><td>${cell.multipliers}</td><td>${cell.combinedRate.toFixed(1)}</td></tr>`);
  const combinedBuckets = new Map();
  (model.timeline || []).filter((row) => !row.idle).forEach((row) => {
    const bucket = combinedBuckets.get(row.start) || { qsos: 0, points: 0, radios: [] };
    bucket.qsos += row.qsos;
    bucket.points += row.points;
    bucket.radios.push(`${formatRadioLabel(row.radioId)} ${row.band}`);
    combinedBuckets.set(row.start, bucket);
  });
  const bestPeriods = Array.from(combinedBuckets.entries()).sort((a, b) => b[1].qsos - a[1].qsos).slice(0, 10).map(([start, bucket]) => `<tr><td>${new Date(start).toISOString().slice(0,16).replace('T',' ')}Z</td><td>${esc(bucket.radios.join(' + '))}</td><td>${bucket.qsos}</td><td>${bucket.qsos * 12}</td><td>${Math.round(bucket.points)}</td></tr>`);
  const workload = model.rows.filter((row) => row.id !== MISSING_RADIO).map((row) => `<tr><td>${esc(formatRadioLabel(row.id))}</td><td>${row.qsos}</td><td>${row.activeMinutes}</td><td>${row.idleMinutes}</td><td>${esc(dominant(row.bands))}</td><td>${esc(dominant(row.modes))}</td><td>${esc(dominant(row.styles))} <small>(inferred)</small></td></tr>`);
  return `<p>A radio remains active for ${c.activityWindowMs / 60000} minutes after its last QSO. Coordination spans the first through last valid tagged QSO. Per-radio idle time is limited to that radio’s first-to-last observed envelope; time outside it is unknown. This sessionization is an analytical estimate, not proof of continuous transmission.</p><div class="radio-grid">${table(['Active radios','Minutes','Analysis share'], concurrency)}${table(['Radio','QSOs','Active min','Idle min','Primary band','Primary mode','Primary style'], workload)}${table(['Band combination','Active minutes'], pairs)}${table(['Mode combination','Active minutes'], modePairs)}</div><h3>Selected radio-pair performance</h3>${table(['Band pair','Active min','QSOs','Points','First mults','Combined Q/h'], pairMetrics)}<h3>Best combined five-minute periods</h3>${table(['UTC bucket','Recorded radio/band activity','QSOs','Q/h','Points'], bestPeriods)}<p>Concurrent: ${c.concurrentPct.toFixed(1)}%; same-band: ${c.sameBandMinutes} min; different-band: ${c.differentBandMinutes} min.</p>`;
}

export function renderRadioHandoffs(model) {
  if (!model?.visible) return '<p>No transmitter data is available.</p>';
  const rows = model.handoffs.slice(0,1000).map((row) => `<tr><td>${new Date(row.timestamp).toISOString().slice(0,16).replace('T',' ')}Z</td><td>${esc(row.band)}</td><td>${esc(row.mode)}</td><td>${esc(formatRadioLabel(row.fromRadio))}</td><td>${esc(formatRadioLabel(row.toRadio))}</td><td>${(row.gapMs / 60000).toFixed(1)} min</td><td>${row.nearbyRate}</td><td>${row.nearbyMultiplier ? 'Yes' : 'No'}</td></tr>`);
  return `<p>Possible handoffs are adjacent same-band QSOs on different recorded radios no more than 10 minutes apart, where the destination radio was quiet beforehand and the source remains quiet afterward for that same window. This suppresses ordinary alternating two-radio activity and does not establish operator intent.</p>${rows.length ? table(['UTC','Band','Mode','From','To','Gap','Nearby QSOs','Nearby mult'], rows) : '<p>No possible radio handoffs detected.</p>'}`;
}

export function renderRadioAudit(model) {
  const d = model?.diagnostics;
  if (!d) return '<p>No log loaded.</p>';
  const findings = [];
  findings.push(['Recorded', `${d.total - d.missingCount}/${d.total} QSOs (${d.coveragePct.toFixed(1)}%)`, d.missingCount ? 'Suspicious data' : 'Information']);
  if (d.expectedCount != null) findings.push(['Declared capacity', `${d.expectedCount} transmitter${d.expectedCount === 1 ? '' : 's'}; discovered ${d.ids.length}`, d.ids.length > d.expectedCount ? 'Suspicious data' : 'Information']);
  d.findings.forEach((finding) => findings.push(['Diagnostic', finding, 'Suspicious data']));
  (model.scoring?.assumptions || []).filter((text) => /transmitter|TX_ID|band lock|multiplier-station/i.test(String(text))).forEach((text) => {
    findings.push(['Implemented scoring check', String(text), 'Existing SH6 rule result']);
  });
  if (/^naqp_|^rac_canada_/i.test(String(model.scoring?.ruleId || ''))) {
    findings.push(['Implemented scoring check', `${model.scoring.ruleId} transmitter-specific band/multiplier restrictions were evaluated by the existing SH6 scorer. The audit does not reimplement or reinterpret those rules.`, 'Existing SH6 rule result']);
  }
  model.rows.filter((row) => row.id !== MISSING_RADIO && row.longAbsences.length).forEach((row) => {
    const longest = Math.max(...row.longAbsences.map((gap) => gap.minutes));
    findings.push(['Activity gap', `${formatRadioLabel(row.id)} has ${row.longAbsences.length} recorded gap(s) of at least 30 minutes; longest ${longest.toFixed(1)} minutes.`, 'Information']);
  });
  if (!d.findings.length) findings.push(['Diagnostic', d.ids.length ? 'No transmitter-data anomalies detected.' : 'No transmitter IDs are available; transmitter rules cannot be verified.', d.ids.length ? 'Information' : 'Unverifiable']);
  findings.push(['Contest rules', 'Existing SH6 NAQP/RAC transmitter checks remain authoritative. This report does not invent additional contest rules.', 'Information']);
  return `<div class="state-card ${statusClass(d.status)}"><h3>${esc(d.status)}</h3><p>${esc(d.findings.join(' ') || 'Recorded transmitter identifiers are internally consistent with the available header.')}</p></div>${table(['Class','Finding','Evidence level'], findings.map((row) => `<tr><td>${esc(row[0])}</td><td>${esc(row[1])}</td><td>${esc(row[2])}</td></tr>`))}`;
}

export function renderBandPairHeatmap(model, metric = 'minutes') {
  if (!model?.visible || !model.heatmap?.radioA || !model.heatmap?.radioB) return '<p>At least two recorded radio IDs are required.</p>';
  const heat = model.heatmap;
  const bandsA = Array.from(new Set(heat.cells.map((cell) => cell.bandA))).sort(naturalCompare);
  const bandsB = Array.from(new Set(heat.cells.map((cell) => cell.bandB))).sort(naturalCompare);
  const max = Math.max(1, ...heat.cells.map((cell) => Number(cell[metric]) || 0));
  const lookup = new Map(heat.cells.map((cell) => [`${cell.bandA}|${cell.bandB}`, cell]));
  const rows = bandsA.map((a) => `<tr><th>${esc(a)}</th>${bandsB.map((b) => { const value = Number(lookup.get(`${a}|${b}`)?.[metric]) || 0; const shown = metric === 'combinedRate' ? value.toFixed(1) : Math.round(value).toLocaleString(); return `<td class="radio-heat-cell" style="--radio-intensity:${value / max}" title="${esc(`${a} / ${b}: ${shown} ${metric}`)}">${value ? shown : '—'}</td>`; }).join('')}</tr>`);
  return `<p>Rows: ${esc(formatRadioLabel(heat.radioA))}; columns: ${esc(formatRadioLabel(heat.radioB))}. Each minute uses the latest QSO within a ${heat.activityWindowMs / 60000}-minute activity window. Idle is retained explicitly.</p><div class="table-wrap"><table class="mtc radio-heatmap"><tr class="thc"><th>${esc(metric)}</th>${bandsB.map((b) => `<th>${esc(b)}</th>`).join('')}</tr>${rows.join('')}</table></div>`;
}

export function renderRadioReport(reportId, model) {
  switch (reportId) {
    case 'radio_timeline': return renderRadioTimeline(model);
    case 'radio_coordination': return renderRadioCoordination(model);
    case 'radio_handoffs': return renderRadioHandoffs(model);
    case 'radio_audit': return renderRadioAudit(model);
    case 'radio_band_pairs': return renderBandPairHeatmap(model);
    default: return renderRadioSummary(model);
  }
}

export function buildRadioCsv(reportId, model) {
  if (!model) return '';
  let headers = [];
  let rows = [];
  if (reportId === 'radio_timeline') {
    headers = ['startUtc', 'endUtc', 'radio', 'band', 'mode', 'operatingStyleInferred', 'idle', 'qsos', 'points', 'firstMultipliers'];
    rows = model.timeline.map((row) => [new Date(row.start).toISOString(), row.end ? new Date(row.end).toISOString() : '', row.radioId, row.bandChange || row.band, row.mode, row.style, row.idle ? 'yes' : 'no', row.qsos, row.points, row.multipliers]);
  } else if (reportId === 'radio_handoffs') {
    headers = ['timestampUtc', 'band', 'mode', 'fromRadio', 'toRadio', 'gapMinutes', 'nearbyQsos', 'nearbyMultiplier'];
    rows = model.handoffs.map((row) => [new Date(row.timestamp).toISOString(), row.band, row.mode, row.fromRadio, row.toRadio, row.gapMs / 60000, row.nearbyRate, row.nearbyMultiplier ? 'yes' : 'no']);
  } else if (reportId === 'radio_band_pairs') {
    headers = ['radioA', 'radioB', 'bandA', 'bandB', 'activeMinutes', 'qsos', 'qsoPoints', 'firstMultipliers', 'combinedQsPerHour'];
    rows = model.heatmap.cells.map((cell) => [model.heatmap.radioA, model.heatmap.radioB, cell.bandA, cell.bandB, cell.minutes, cell.qsos, cell.points, cell.multipliers, cell.combinedRate]);
  } else if (reportId === 'radio_coordination') {
    headers = ['section', 'key', 'minutes', 'analysisPercent', 'qsos', 'points', 'firstMultipliers', 'combinedQsPerHour'];
    const c = model.coordination;
    rows = Object.entries(c.concurrency).sort((a, b) => Number(a[0]) - Number(b[0])).map(([count, minutes]) => [
      'concurrency', `${count} active radios`, minutes, c.totalMinutes ? minutes / c.totalMinutes * 100 : 0, '', '', '', ''
    ]);
    rows.push(...model.rows.filter((row) => row.id !== MISSING_RADIO).map((row) => [
      'radio workload', formatRadioLabel(row.id), row.activeMinutes, row.observedMinutes ? row.activeMinutes / row.observedMinutes * 100 : 0, row.qsos, row.points, row.multipliers, row.peakMinute * 60
    ]));
    rows.push(...Array.from(c.bandPairs.entries()).map(([key, minutes]) => ['band combination', key, minutes, c.totalMinutes ? minutes / c.totalMinutes * 100 : 0, '', '', '', '']));
    rows.push(...Array.from(c.modePairs.entries()).map(([key, minutes]) => ['mode combination', key, minutes, c.totalMinutes ? minutes / c.totalMinutes * 100 : 0, '', '', '', '']));
    rows.push(...(model.heatmap?.cells || []).map((cell) => ['band pair', `${cell.bandA} + ${cell.bandB}`, cell.minutes, c.totalMinutes ? cell.minutes / c.totalMinutes * 100 : 0, cell.qsos, cell.points, cell.multipliers, cell.combinedRate]));
    rows.push(['coordination total', 'same-band active', c.sameBandMinutes, c.totalMinutes ? c.sameBandMinutes / c.totalMinutes * 100 : 0, '', '', '', '']);
    rows.push(['coordination total', 'different-band active', c.differentBandMinutes, c.totalMinutes ? c.differentBandMinutes / c.totalMinutes * 100 : 0, '', '', '', '']);
    const combinedBuckets = new Map();
    (model.timeline || []).filter((row) => !row.idle).forEach((row) => {
      const bucket = combinedBuckets.get(row.start) || { qsos: 0, points: 0, multipliers: 0, radios: [] };
      bucket.qsos += row.qsos;
      bucket.points += row.points;
      bucket.multipliers += row.multipliers;
      bucket.radios.push(`${formatRadioLabel(row.radioId)} ${row.band}`);
      combinedBuckets.set(row.start, bucket);
    });
    rows.push(...Array.from(combinedBuckets.entries()).sort((a, b) => b[1].qsos - a[1].qsos).slice(0, 10).map(([start, bucket]) => [
      'best five-minute period', `${new Date(start).toISOString()} ${bucket.radios.join(' + ')}`, 5, '', bucket.qsos, bucket.points, bucket.multipliers, bucket.qsos * 12
    ]));
  } else if (reportId === 'radio_audit') {
    headers = ['class', 'finding', 'evidenceLevel', 'status'];
    const d = model.diagnostics;
    rows = [['Coverage', `${d.total - d.missingCount}/${d.total} QSOs (${d.coveragePct.toFixed(1)}%)`, d.missingCount ? 'Suspicious data' : 'Information', d.status]];
    if (d.expectedCount != null) rows.push(['Declared capacity', `${d.expectedCount} transmitters; discovered ${d.ids.length}`, 'Information', d.status]);
    rows.push(...d.findings.map((finding) => ['Diagnostic', finding, 'Suspicious data', d.status]));
    rows.push(...(model.scoring?.assumptions || []).filter((value) => /transmitter|TX_ID|band lock|multiplier-station/i.test(String(value))).map((finding) => ['Implemented scoring check', finding, 'Existing SH6 rule result', d.status]));
    if (/^naqp_|^rac_canada_/i.test(String(model.scoring?.ruleId || ''))) {
      rows.push(['Implemented scoring check', `${model.scoring.ruleId} transmitter-specific band/multiplier restrictions were evaluated by the existing SH6 scorer. The audit does not reimplement or reinterpret those rules.`, 'Existing SH6 rule result', d.status]);
    }
    model.rows.filter((row) => row.id !== MISSING_RADIO && row.longAbsences.length).forEach((row) => {
      rows.push(['Activity gap', `${formatRadioLabel(row.id)}: ${row.longAbsences.length} gap(s), longest ${Math.max(...row.longAbsences.map((gap) => gap.minutes)).toFixed(1)} minutes`, 'Information', d.status]);
    });
    if (!d.findings.length) rows.push(['Diagnostic', d.ids.length ? 'No transmitter-data anomalies detected.' : 'No transmitter IDs available.', d.ids.length ? 'Information' : 'Unverifiable', d.status]);
    rows.push(['Contest rules', 'Existing SH6 NAQP/RAC transmitter checks remain authoritative. This report does not invent additional contest rules.', 'Information', d.status]);
  } else {
    headers = ['radio', 'qsos', 'points', 'firstMultipliers', 'multiplierEntitiesSeen', 'peakQsPerMinute', 'activeMinutesInferred', 'idleMinutesInferred', 'primaryBand', 'primaryMode', 'primaryStyleInferred', 'qualityStatus'];
    rows = model.rows.map((row) => [row.id === MISSING_RADIO ? '' : row.id, row.qsos, row.points, row.multipliers, row.multiplierEntities.size, row.peakMinute, row.activeMinutes, row.idleMinutes, dominant(row.bands), dominant(row.modes), dominant(row.styles), model.diagnostics.status]);
  }
  return `${headers.map(csv).join(',')}\r\n${rows.map((row) => row.map(csv).join(',')).join('\r\n')}\r\n`;
}

export const RADIO_MISSING_FILTER = MISSING_RADIO;
