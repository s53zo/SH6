export function createSpotsDrilldownRuntime(deps = {}) {
  const {
    normalizeCall,
    lookupPrefix,
    baseCall,
    normalizeContinent,
    escapeAttr,
    escapeHtml,
    formatBandLabel,
    formatDateSh6,
    formatNumberSh6,
    bandClass,
    spotTableLimit = 400
  } = deps;

  function normalizeCallSafe(value) {
    if (typeof normalizeCall === 'function') return normalizeCall(value);
    return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
  }

  function lookupPrefixSafe(value) {
    if (typeof lookupPrefix === 'function') return lookupPrefix(value);
    return null;
  }

  function baseCallSafe(value) {
    if (typeof baseCall === 'function') return baseCall(value);
    return String(value || '').trim().toUpperCase();
  }

  function normalizeContinentSafe(value) {
    if (typeof normalizeContinent === 'function') return normalizeContinent(value);
    return String(value || '').trim().toUpperCase();
  }

  function escapeAttrSafe(value) {
    if (typeof escapeAttr === 'function') return escapeAttr(value);
    return String(value == null ? '' : value);
  }

  function escapeHtmlSafe(value) {
    if (typeof escapeHtml === 'function') return escapeHtml(value);
    return String(value == null ? '' : value);
  }

  function formatBandLabelSafe(value) {
    if (typeof formatBandLabel === 'function') return formatBandLabel(value);
    return String(value || '').trim().toUpperCase();
  }

  function formatDateSafe(value) {
    if (typeof formatDateSh6 === 'function') return formatDateSh6(value);
    return String(value == null ? '' : value);
  }

  function formatNumberSafe(value) {
    if (typeof formatNumberSh6 === 'function') return formatNumberSh6(value);
    const num = Number(value);
    return Number.isFinite(num) ? num.toLocaleString('en-US') : '0';
  }

  function bandClassSafe(value) {
    if (typeof bandClass === 'function') return bandClass(value);
    return '';
  }

  function resolveSpotterGeo(spotterCall) {
    const key = normalizeCallSafe(spotterCall || '');
    const prefix = key ? (lookupPrefixSafe(key) || lookupPrefixSafe(baseCallSafe(key))) : null;
    const continent = normalizeContinentSafe(prefix?.continent || '') || 'N/A';
    const cqZone = Number.isFinite(prefix?.cqZone) ? String(prefix.cqZone) : 'N/A';
    const ituZone = Number.isFinite(prefix?.ituZone) ? String(prefix.ituZone) : 'N/A';
    return { continent, cqZone, ituZone };
  }

  function renderDrillFilterRow({ label, type, counts, selectedValue, slotAttr, sourceAttr }) {
    const entries = Array.from(counts.entries()).sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      if (type === 'continent') {
        const order = ['NA', 'SA', 'EU', 'AF', 'AS', 'OC', 'N/A'];
        const aIdx = order.includes(a[0]) ? order.indexOf(a[0]) : 999;
        const bIdx = order.includes(b[0]) ? order.indexOf(b[0]) : 999;
        return aIdx - bIdx;
      }
      const aNum = Number(a[0]);
      const bNum = Number(b[0]);
      if (Number.isFinite(aNum) && Number.isFinite(bNum)) return aNum - bNum;
      return String(a[0]).localeCompare(String(b[0]));
    });
    const filterTypeClass = `type-${type}`;
    const allLabel = type === 'continent' ? 'All continents' : (type === 'cq' ? 'All CQ zones' : 'All ITU zones');
    const buttons = entries.map(([value, count]) => {
      const active = selectedValue === value;
      const valueAttr = escapeAttrSafe(String(value));
      const valueLabel = value === 'N/A' ? 'N/A' : escapeHtmlSafe(String(value));
      return `<button type="button" class="spots-drill-filter-btn ${filterTypeClass}${active ? ' active' : ''}" data-slot="${slotAttr}" data-source="${sourceAttr}" data-type="${type}" data-value="${valueAttr}" aria-pressed="${active ? 'true' : 'false'}">${valueLabel} (${formatNumberSafe(count)})</button>`;
    }).join('');
    return `
      <div class="spots-drill-filter-row">
        <span class="spots-drill-filter-label">${escapeHtmlSafe(label)}</span>
        <button type="button" class="spots-drill-filter-btn spots-drill-filter-all ${filterTypeClass}${selectedValue ? '' : ' active'}" data-slot="${slotAttr}" data-source="${sourceAttr}" data-type="${type}" data-value="" aria-pressed="${selectedValue ? 'false' : 'true'}">${allLabel}</button>
        ${buttons}
      </div>
    `;
  }

  function renderSpotBucketDetail(context = {}) {
    const {
      spots,
      drillBand,
      drillHour,
      drillContinent = '',
      drillCqZone = '',
      drillItuZone = '',
      slotAttr = 'A',
      sourceAttr = 'spots'
    } = context;
    if (!spots || !spots.length) return '';
    if (!drillBand || !Number.isFinite(drillHour)) {
      return '<div class="spots-drill-panel"><p class="cqapi-muted">Click a value in the band/hour table to inspect actual spots for that bucket.</p></div>';
    }
    const targetHour = Math.max(0, Math.min(23, Math.round(drillHour)));
    const rows = (spots || [])
      .filter((spot) => (spot.band || 'unknown') === drillBand)
      .filter((spot) => Number.isFinite(spot.ts) && new Date(spot.ts).getUTCHours() === targetHour)
      .map((spot) => {
        const geo = resolveSpotterGeo(spot.spotter || '');
        return {
          ...spot,
          continent: geo.continent,
          cqZone: geo.cqZone,
          ituZone: geo.ituZone
        };
      });
    if (!rows.length) {
      return `
        <div class="spots-drill-panel">
          <div class="spots-drill-head">
            <b>Bucket detail</b>
            <button type="button" class="button spots-drill-clear" data-slot="${slotAttr}" data-source="${sourceAttr}">Clear selection</button>
          </div>
          <p class="cqapi-muted">No spots found for ${escapeHtmlSafe(formatBandLabelSafe(drillBand))} at ${String(targetHour).padStart(2, '0')}:00Z.</p>
        </div>
      `;
    }

    const continentCounts = new Map();
    const cqCounts = new Map();
    const ituCounts = new Map();
    rows.forEach((row) => {
      continentCounts.set(row.continent, (continentCounts.get(row.continent) || 0) + 1);
      cqCounts.set(row.cqZone, (cqCounts.get(row.cqZone) || 0) + 1);
      ituCounts.set(row.ituZone, (ituCounts.get(row.ituZone) || 0) + 1);
    });
    const filtered = rows.filter((row) => {
      if (drillContinent && row.continent !== drillContinent) return false;
      if (drillCqZone && row.cqZone !== drillCqZone) return false;
      if (drillItuZone && row.ituZone !== drillItuZone) return false;
      return true;
    });
    if (!filtered.length) {
      return `
        <div class="spots-drill-panel">
          <div class="spots-drill-head">
            <b>Bucket detail: ${escapeHtmlSafe(formatBandLabelSafe(drillBand))} ${String(targetHour).padStart(2, '0')}:00Z</b>
            <button type="button" class="button spots-drill-clear" data-slot="${slotAttr}" data-source="${sourceAttr}">Clear selection</button>
          </div>
          ${renderDrillFilterRow({ label: 'Continent', type: 'continent', counts: continentCounts, selectedValue: drillContinent, slotAttr, sourceAttr })}
          ${renderDrillFilterRow({ label: 'CQ zone', type: 'cq', counts: cqCounts, selectedValue: drillCqZone, slotAttr, sourceAttr })}
          ${renderDrillFilterRow({ label: 'ITU zone', type: 'itu', counts: ituCounts, selectedValue: drillItuZone, slotAttr, sourceAttr })}
          <p class="cqapi-muted">No spots match the selected continent/zone filters in this bucket.</p>
        </div>
      `;
    }

    const matchedCount = filtered.filter((row) => row.matched).length;
    const sorted = filtered.slice().sort((a, b) => a.ts - b.ts);
    const clipped = sorted.slice(0, spotTableLimit);
    const truncatedList = sorted.length > spotTableLimit;
    const tableRows = clipped.map((row, idx) => {
      const cls = idx % 2 === 0 ? 'td1' : 'td0';
      const delta = Number.isFinite(row.delta) ? row.delta.toFixed(1) : 'N/A';
      return `
        <tr class="${cls}">
          <td>${escapeHtmlSafe(formatDateSafe(row.ts))}</td>
          <td class="${bandClassSafe(row.band || '')}">${escapeHtmlSafe(formatBandLabelSafe(row.band || ''))}</td>
          <td>${escapeHtmlSafe(String(row.freqKHz || ''))}</td>
          <td>${escapeHtmlSafe(row.spotter || '')}</td>
          <td>${escapeHtmlSafe(row.continent)}</td>
          <td>${escapeHtmlSafe(row.cqZone)}</td>
          <td>${escapeHtmlSafe(row.ituZone)}</td>
          <td>${row.matched ? 'Yes' : 'No'}</td>
          <td>${delta}</td>
          <td class="tl">${escapeHtmlSafe(row.comment || '')}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="spots-drill-panel">
        <div class="spots-drill-head">
          <b>Bucket detail: ${escapeHtmlSafe(formatBandLabelSafe(drillBand))} ${String(targetHour).padStart(2, '0')}:00Z</b>
          <button type="button" class="button spots-drill-clear" data-slot="${slotAttr}" data-source="${sourceAttr}">Clear selection</button>
        </div>
        <div class="spots-drill-stats">
          <span><b>Total spots</b>: ${formatNumberSafe(rows.length)}</span>
          <span><b>After filters</b>: ${formatNumberSafe(filtered.length)}</span>
          <span><b>Matched</b>: ${formatNumberSafe(matchedCount)}</span>
        </div>
        ${renderDrillFilterRow({ label: 'Continent', type: 'continent', counts: continentCounts, selectedValue: drillContinent, slotAttr, sourceAttr })}
        ${renderDrillFilterRow({ label: 'CQ zone', type: 'cq', counts: cqCounts, selectedValue: drillCqZone, slotAttr, sourceAttr })}
        ${renderDrillFilterRow({ label: 'ITU zone', type: 'itu', counts: ituCounts, selectedValue: drillItuZone, slotAttr, sourceAttr })}
        ${truncatedList ? `<div class="export-actions export-note">Showing first ${formatNumberSafe(spotTableLimit)} of ${formatNumberSafe(sorted.length)} rows.</div>` : ''}
        <table class="mtc" style="margin-top:5px;margin-bottom:10px;text-align:right;">
          <tr class="thc"><th>Time (UTC)</th><th>Band</th><th>Freq</th><th>Spotter</th><th>Cont</th><th>CQ</th><th>ITU</th><th>QSO</th><th>Delta m</th><th>Comment</th></tr>
          ${tableRows}
        </table>
      </div>
    `;
  }

  return {
    renderSpotBucketDetail
  };
}
