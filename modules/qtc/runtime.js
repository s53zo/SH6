const WARNING_LABELS = Object.freeze({
  missing_required_field: 'Missing required field',
  invalid_qtc_group: 'Invalid QTC group',
  invalid_qtc_group_range: 'QTC group outside 1-10',
  announced_size_mismatch: 'Announced and observed series sizes differ',
  pair_quota_exceeded: 'Station-pair quota exceeds 10',
  duplicate_reported_qso: 'Reported QSO appears more than once',
  returned_to_reported_station: 'QTC returned to the reported station',
  cw_ssb_invalid_direction: 'CW/SSB direction is not DX to Europe',
  rtty_same_continent: 'RTTY QTC does not cross continents',
  ambiguous_direction: 'Loaded station is neither QTC receiver nor transmitter'
});

function csvCell(value) {
  const raw = String(value == null ? '' : value);
  const text = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function csvRows(headers, rows) {
  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
}

export function buildQtcItemsCsv(items = []) {
  const headers = [
    'event_type', 'date_time_utc', 'frequency_mhz', 'band', 'mode', 'direction', 'receiver', 'transmitter',
    'partner', 'series_group', 'series_number', 'announced_size', 'reported_qso_time', 'reported_callsign',
    'reported_serial', 'parse_status', 'rule_warnings', 'series_id', 'raw_line'
  ];
  return csvRows(headers, items.map((item) => [
    'QTC', item.time, item.freq, item.band, item.mode, item.direction, item.receiver, item.transmitter,
    item.partner, item.seriesGroup, item.seriesNumber, item.seriesSize, item.reportedTime, item.reportedCall,
    item.reportedSerial, item.parseStatus, (item.validationWarnings || []).join('|'), item.seriesId, item.rawLine
  ]));
}

export function buildQtcSeriesCsv(series = []) {
  const headers = [
    'series_id', 'first_time_utc', 'last_time_utc', 'direction', 'receiver', 'transmitter', 'partner',
    'series_group', 'series_number', 'announced_size', 'observed_size', 'band', 'mode', 'warnings'
  ];
  return csvRows(headers, series.map((entry) => [
    entry.seriesId,
    Number.isFinite(entry.firstTs) ? new Date(entry.firstTs).toISOString() : '',
    Number.isFinite(entry.lastTs) ? new Date(entry.lastTs).toISOString() : '',
    entry.direction, entry.receiver, entry.transmitter, entry.partner, entry.seriesGroup, entry.seriesNumber,
    entry.announcedSize, entry.observedSize, entry.band, entry.mode, (entry.warnings || []).join('|')
  ]));
}

export function createQtcRuntime(deps = {}) {
  const {
    escapeHtml = (value) => String(value == null ? '' : value),
    escapeAttr = (value) => String(value == null ? '' : value),
    formatNumber = (value) => String(value == null ? '' : value),
    formatBand = (value) => String(value || ''),
    formatDate = (value) => (Number.isFinite(value) ? new Date(value).toISOString().replace('T', ' ').slice(0, 16) + 'Z' : 'N/A')
  } = deps;

  const fmt = (value, digits = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? number.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }) : '0';
  };
  const pct = (value) => `${fmt((Number(value) || 0) * 100, 1)}%`;
  const warningLabel = (code) => WARNING_LABELS[code] || String(code || '').replaceAll('_', ' ');
  const empty = (message = 'No QTC traffic is available for this log and filter.') => `<p class="qtc-empty">${escapeHtml(message)}</p>`;

  function getQtc(snapshot) {
    return snapshot?.derived?.qtc || { items: [], series: [], partners: [], timeline: [], warnings: [], overview: {} };
  }

  function renderKpis(entries) {
    return `<div class="qtc-kpi-grid">${entries.map(([label, value, note]) => `
      <div class="qtc-kpi">
        <div class="qtc-kpi-label">${escapeHtml(label)}</div>
        <div class="qtc-kpi-value">${escapeHtml(value)}</div>
        ${note ? `<div class="qtc-kpi-note">${escapeHtml(note)}</div>` : ''}
      </div>
    `).join('')}</div>`;
  }

  function renderOverview(snapshot) {
    const qtc = getQtc(snapshot);
    const o = qtc.overview || {};
    if (!qtc.items?.length) return empty();
    return `
      ${renderKpis([
        ['QTC units', formatNumber(o.units || 0), `${formatNumber(o.validUnits || 0)} parse-valid`],
        ['QTC series', formatNumber(o.seriesCount || 0), `${formatNumber(o.fullSeries || 0)} full 10-unit series (${pct(o.fullSeriesPct)})`],
        ['QTC points', formatNumber(o.qtcPoints || 0), 'Logged parse-valid units'],
        ['Point-unit share', pct(o.pointUnitShare), 'QTC units / QSO + QTC units'],
        ['QTC / QSO', fmt(o.qtcToQsoRatio, 2), `${formatNumber(o.qsoCount || 0)} QSOs`],
        ['Partners', formatNumber(o.uniquePartners || 0), `${formatNumber(o.sent || 0)} sent · ${formatNumber(o.received || 0)} received`],
        ['Average series', fmt(o.averageSeriesSize, 2), `Median ${fmt(o.medianSeriesSize, 1)}`],
        ['Rule warnings', formatNumber(o.warningUnits || 0), `${formatNumber(o.malformedUnits || 0)} malformed rows`]
      ])}
      <table class="mtc qtc-summary-table">
        <tr class="thc"><th>Band</th><th>QTC units</th></tr>
        ${(qtc.bandSummary || []).map((row, idx) => `<tr class="${idx % 2 ? 'td0' : 'td1'}"><td>${escapeHtml(formatBand(row.band))}</td><td>${formatNumber(row.units)}</td></tr>`).join('')}
      </table>
    `;
  }

  function renderTimeline(snapshot) {
    const qtc = getQtc(snapshot);
    if (!qtc.timeline?.length) return empty();
    const qsoByHour = new Map((snapshot?.derived?.hourSeries || []).map((row) => [row.hour, Number(row.qsos) || 0]));
    const qtcByHour = new Map(qtc.timeline.map((row) => [row.hour, row]));
    const timelineRows = Array.from(new Set([...qsoByHour.keys(), ...qtcByHour.keys()]))
      .sort((a, b) => a - b)
      .map((hour) => qtcByHour.get(hour) || { hour, units: 0, series: 0, sent: 0, received: 0 });
    let cumulative = 0;
    const maxUnits = Math.max(1, ...timelineRows.map((row) => Number(row.units) || 0));
    const peak = qtc.timeline.reduce((best, row) => ((Number(row.units) || 0) > (Number(best?.units) || 0) ? row : best), null);
    const inactive = [];
    for (let idx = 1; idx < qtc.timeline.length; idx += 1) {
      const previous = qtc.timeline[idx - 1];
      const current = qtc.timeline[idx];
      const missingHours = current.hour - previous.hour - 1;
      if (missingHours > 0) inactive.push({ start: previous.hour + 1, end: current.hour - 1, hours: missingHours });
    }
    const rows = timelineRows.map((row, idx) => {
      cumulative += Number(row.units) || 0;
      const width = Math.max(2, Math.round(((Number(row.units) || 0) / maxUnits) * 100));
      return `<tr class="${idx % 2 ? 'td0' : 'td1'}">
        <td>${escapeHtml(formatDate(row.hour * 3600000))}</td><td>${formatNumber(qsoByHour.get(row.hour) || 0)}</td><td>${formatNumber(row.units)}</td><td>${formatNumber(row.series)}</td>
        <td>${formatNumber(row.sent)}</td><td>${formatNumber(row.received)}</td><td>${formatNumber(cumulative)}</td>
        <td class="qtc-bar-cell"><span class="qtc-bar" style="width:${width}%"></span></td>
      </tr>`;
    }).join('');
    const breakdownRows = (qtc.bandSummary || []).map((row, idx) => `<tr class="${idx % 2 ? 'td0' : 'td1'}"><td>${escapeHtml(formatBand(row.band))}</td><td>${formatNumber(row.units)}</td></tr>`).join('');
    const modeRows = (qtc.modeSummary || []).map((row, idx) => `<tr class="${idx % 2 ? 'td0' : 'td1'}"><td>${escapeHtml(row.mode)}</td><td>${formatNumber(row.units)}</td></tr>`).join('');
    const inactivityText = inactive.length
      ? inactive.slice(0, 5).map((gap) => `${formatDate(gap.start * 3600000)} to ${formatDate((gap.end + 1) * 3600000)} (${gap.hours} empty hour${gap.hours === 1 ? '' : 's'})`).join('; ')
      : 'No empty UTC hours between the first and last QTC activity.';
    return `
      <p class="qtc-method-note">Hourly counts use logged minute-resolution timestamps. They do not imply second-level transfer speed.</p>
      ${renderKpis([
        ['Peak QTC hour', peak ? formatDate(peak.hour * 3600000) : 'N/A', peak ? `${formatNumber(peak.units)} QTC units` : ''],
        ['Inactive spans', formatNumber(inactive.length), inactivityText]
      ])}
      <table class="mtc qtc-timeline-table"><tr class="thc"><th>Hour UTC</th><th>QSOs</th><th>QTC units</th><th>Series</th><th>Sent</th><th>Received</th><th>Cumulative</th><th>Relative load</th></tr>${rows}</table>
      <div class="qtc-breakdown-grid">
        <table class="mtc"><tr class="thc"><th>Band</th><th>QTC units</th></tr>${breakdownRows}</table>
        <table class="mtc"><tr class="thc"><th>Mode</th><th>QTC units</th></tr>${modeRows}</table>
      </div>
    `;
  }

  function renderEfficiency(snapshot) {
    const qtc = getQtc(snapshot);
    const o = qtc.overview || {};
    if (!qtc.items?.length) return empty();
    const firstTs = qtc.series?.[0]?.firstTs;
    const lastTs = qtc.series?.[qtc.series.length - 1]?.lastTs;
    const elapsedHours = Number.isFinite(firstTs) && Number.isFinite(lastTs) && lastTs > firstTs ? (lastTs - firstTs) / 3600000 : 0;
    return `
      ${renderKpis([
        ['Units / active minute', fmt(o.unitsPerActiveMinute, 2), `${formatNumber(o.activeMinutes || 0)} timestamped active minutes`],
        ['Series / elapsed hour', elapsedHours ? fmt((o.seriesCount || 0) / elapsedHours, 2) : 'N/A', 'Elapsed span, not continuous operating time'],
        ['Units / series', fmt(o.averageSeriesSize, 2), `Median ${fmt(o.medianSeriesSize, 1)}`],
        ['Full-series rate', pct(o.fullSeriesPct), `${formatNumber(o.fullSeries || 0)} of ${formatNumber(o.seriesCount || 0)} series`],
        ['QTC point contribution', formatNumber(o.qtcPoints || 0), `${pct(o.pointUnitShare)} of logged point units`],
        ['QTC production', fmt(o.qtcToQsoRatio, 2), 'QTC units per QSO']
      ])}
      <p class="qtc-method-note">Rate metrics use distinct active minutes because Cabrillo QTC timestamps do not provide exact transfer duration.</p>
    `;
  }

  function renderPartners(snapshot) {
    const qtc = getQtc(snapshot);
    if (!qtc.partners?.length) return empty();
    const rows = qtc.partners.map((row, idx) => `<tr class="${idx % 2 ? 'td0' : 'td1'}" data-qtc-partner-row data-qtc-partner="${escapeAttr(row.partner)}">
      <td>${escapeHtml(row.partner)}</td><td>${escapeHtml(row.direction)}</td><td>${formatNumber(row.seriesCount)}</td>
      <td>${formatNumber(row.units)}</td><td>${fmt(row.averageSeriesSize, 2)}</td><td>${escapeHtml((row.bands || []).map(formatBand).join(', '))}</td>
      <td>${escapeHtml(formatDate(row.firstTs))}</td><td>${escapeHtml(formatDate(row.lastTs))}</td>
      <td>${formatNumber(row.quotaUsed)} / 10</td><td>${formatNumber(row.warningCount)}</td>
    </tr>`).join('');
    return `<label class="qtc-partner-filter">Partner callsign <input type="search" class="qtc-partner-search" aria-label="Search QTC partners" placeholder="Search callsign"></label><table class="mtc qtc-partners-table"><tr class="thc"><th>Partner</th><th>Direction</th><th>Series</th><th>Units</th><th>Avg.</th><th>Bands</th><th>First</th><th>Last</th><th>Quota</th><th>Warnings</th></tr>${rows}</table>`;
  }

  function renderSeries(snapshot) {
    const qtc = getQtc(snapshot);
    if (!qtc.series?.length) return empty();
    const rows = qtc.series.map((entry, idx) => {
      const itemRows = entry.items.map((item) => `<tr><td>${escapeHtml(item.reportedTime)}</td><td>${escapeHtml(item.reportedCall)}</td><td>${escapeHtml(item.reportedSerial)}</td><td><code>${escapeHtml(item.rawLine)}</code></td></tr>`).join('');
      return `<tr class="${idx % 2 ? 'td0' : 'td1'}">
        <td>${escapeHtml(formatDate(entry.firstTs))}</td><td>${escapeHtml(entry.direction)}</td><td>${escapeHtml(entry.receiver)}</td><td>${escapeHtml(entry.transmitter)}</td>
        <td>${escapeHtml(entry.seriesGroup)}</td><td>${formatNumber(entry.observedSize)} / ${formatNumber(entry.announcedSize)}</td><td>${escapeHtml(formatBand(entry.band))}</td>
        <td>${entry.warnings.length ? escapeHtml(entry.warnings.map(warningLabel).join('; ')) : 'None'}</td>
        <td><details class="qtc-series-details"><summary>Items</summary><table class="mtc"><tr class="thc"><th>QSO time</th><th>Call</th><th>Serial</th><th>Raw record</th></tr>${itemRows}</table></details></td>
      </tr>`;
    }).join('');
    return `<table class="mtc qtc-series-table"><tr class="thc"><th>Time UTC</th><th>Direction</th><th>Receiver</th><th>Transmitter</th><th>Group</th><th>Observed / announced</th><th>Band</th><th>Warnings</th><th>Contents</th></tr>${rows}</table>`;
  }

  function renderQuality(snapshot) {
    const qtc = getQtc(snapshot);
    if (!qtc.items?.length) return empty();
    if (!qtc.warnings?.length && !(qtc.overview?.malformedUnits > 0)) {
      return '<div class="state-card state-success"><h3>No QTC format or rule warnings</h3><p>All parsed QTC rows satisfy the checks SH6 can perform from this submitted log.</p></div>';
    }
    const parseRows = qtc.overview?.malformedUnits
      ? `<tr class="td1"><td>Malformed QTC records</td><td>${formatNumber(qtc.overview.malformedUnits)}</td><td>Required fields or QTC group syntax could not be parsed.</td></tr>`
      : '';
    const rows = (qtc.warnings || []).map((warning, idx) => `<tr class="${idx % 2 ? 'td1' : 'td0'}"><td>${escapeHtml(warningLabel(warning.code))}</td><td>${formatNumber(warning.count)}</td><td>Analysis warning only; official log adjudication remains authoritative.</td></tr>`).join('');
    return `<p class="qtc-method-note">These checks use only the loaded log and are not an adjudication result.</p><table class="mtc"><tr class="thc"><th>Check</th><th>Affected rows</th><th>Interpretation</th></tr>${parseRows}${rows}</table>`;
  }

  function renderExport(snapshot, slotId) {
    const qtc = getQtc(snapshot);
    if (!qtc.items?.length) return empty();
    return `
      ${renderKpis([['QTC items', formatNumber(qtc.items.length), 'One CSV row per QTC payload'], ['QTC series', formatNumber(qtc.series.length), 'One CSV row per grouped series']])}
      <div class="qtc-export-actions">
        <button type="button" class="button qtc-export-btn" data-qtc-export="items" data-slot="${escapeAttr(slotId)}">Export QTC items CSV</button>
        <button type="button" class="button qtc-export-btn" data-qtc-export="series" data-slot="${escapeAttr(slotId)}">Export QTC series CSV</button>
      </div>
    `;
  }

  function renderSlotReport(reportId, snapshot, slotId = 'A') {
    switch (reportId) {
      case 'qtc_overview': return renderOverview(snapshot);
      case 'qtc_timeline': return renderTimeline(snapshot);
      case 'qtc_efficiency': return renderEfficiency(snapshot);
      case 'qtc_partners': return renderPartners(snapshot);
      case 'qtc_series': return renderSeries(snapshot);
      case 'qtc_quality': return renderQuality(snapshot);
      case 'qtc_export': return renderExport(snapshot, slotId);
      default: return empty('Unknown QTC report.');
    }
  }

  function renderComparisonSummary(entries = []) {
    const ready = entries.filter((entry) => entry?.ready && entry?.snapshot?.derived?.qtc?.overview);
    if (ready.length < 2) return '';
    const metrics = [
      ['QTC units', (entry) => entry.snapshot.derived.qtc.overview.units || 0],
      ['QTC series', (entry) => entry.snapshot.derived.qtc.overview.seriesCount || 0],
      ['QTC / QSO', (entry) => entry.snapshot.derived.qtc.overview.qtcToQsoRatio || 0],
      ['Unique partners', (entry) => entry.snapshot.derived.qtc.overview.uniquePartners || 0],
      ['Average series', (entry) => entry.snapshot.derived.qtc.overview.averageSeriesSize || 0],
      ['Full-series rate', (entry) => entry.snapshot.derived.qtc.overview.fullSeriesPct || 0]
    ];
    const rows = metrics.map(([label, getter], idx) => {
      const ranked = ready.map((entry) => ({ entry, value: getter(entry) })).sort((a, b) => b.value - a.value);
      const leader = ranked[0];
      const spread = leader.value - ranked[ranked.length - 1].value;
      const isRatio = label === 'QTC / QSO' || label === 'Average series';
      const value = label.includes('rate') ? pct(leader.value) : (isRatio ? fmt(leader.value, 2) : formatNumber(leader.value));
      const spreadText = label.includes('rate') ? pct(spread) : (isRatio ? fmt(spread, 2) : formatNumber(spread));
      return `<tr class="${idx % 2 ? 'td0' : 'td1'}"><td>${escapeHtml(label)}</td><td>${escapeHtml(leader.entry.label)}</td><td>${escapeHtml(value)}</td><td>${escapeHtml(spreadText)}</td></tr>`;
    }).join('');
    return `<table class="mtc qtc-compare-summary"><tr class="thc"><th>Metric</th><th>Leader</th><th>Leader value</th><th>Spread</th></tr>${rows}</table>`;
  }

  return {
    renderSlotReport,
    renderComparisonSummary,
    buildQtcItemsCsv,
    buildQtcSeriesCsv
  };
}
