(() => {
  const SH6 = window.SH6;
  if (!SH6) return;

  const SPOTS_BASE_URL = 'https://azure.s53m.com/spots';
  const MODE_TOKENS = ['FT8', 'FT4', 'CW', 'SSB', 'RTTY', 'PSK', 'JT65', 'JT9', 'MSK144', 'Q65', 'AM', 'FM', 'PKT', 'DIGI', 'DATA'];
  const WINDOW_MIN = 10;
  const WINDOW_MAX = 24 * 60;
  const GROUPING_OPTIONS = [
    { value: 'band|mode|country', label: 'Band + Mode + DXCC (slot)' },
    { value: 'band|country', label: 'Band + DXCC' },
    { value: 'mode|country', label: 'Mode + DXCC' },
    { value: 'band|mode', label: 'Band + Mode' },
    { value: 'band', label: 'Band only' },
    { value: 'mode', label: 'Mode only' },
    { value: 'country', label: 'DXCC only' }
  ];
  const GROUPING_KEYS = GROUPING_OPTIONS.map((opt) => opt.value);
  const MODE_DIGITAL = new Set([
    'FT8', 'FT4', 'RTTY', 'PSK', 'PSK31', 'DATA', 'DIGI', 'MFSK',
    'JT65', 'JT9', 'OLIVIA', 'FSK', 'FSK441', 'AMTOR', 'Q65', 'MSK144'
  ]);
  const MODE_PHONE = new Set(['SSB', 'USB', 'LSB', 'AM', 'FM', 'PH', 'PHONE']);

  const BAND_PLAN = {
    '160M': [
      { min: 1.8, max: 1.838, mode: 'CW' },
      { min: 1.839, max: 1.845, mode: 'DIGI' },
      { min: 1.846, max: 2.0, mode: 'SSB' }
    ],
    '80M': [
      { min: 3.5, max: 3.58, mode: 'CW' },
      { min: 3.58, max: 3.62, mode: 'DIGI' },
      { min: 3.62, max: 4.0, mode: 'SSB' }
    ],
    '40M': [
      { min: 7.0, max: 7.07, mode: 'CW' },
      { min: 7.07, max: 7.1, mode: 'DIGI' },
      { min: 7.1, max: 7.3, mode: 'SSB' }
    ],
    '30M': [
      { min: 10.1, max: 10.15, mode: 'DIGI' }
    ],
    '20M': [
      { min: 14.0, max: 14.07, mode: 'CW' },
      { min: 14.07, max: 14.112, mode: 'DIGI' },
      { min: 14.112, max: 14.35, mode: 'SSB' }
    ],
    '17M': [
      { min: 18.068, max: 18.11, mode: 'DIGI' },
      { min: 18.11, max: 18.168, mode: 'SSB' }
    ],
    '15M': [
      { min: 21.0, max: 21.07, mode: 'CW' },
      { min: 21.07, max: 21.11, mode: 'DIGI' },
      { min: 21.11, max: 21.45, mode: 'SSB' }
    ],
    '12M': [
      { min: 24.89, max: 24.93, mode: 'DIGI' },
      { min: 24.93, max: 24.99, mode: 'SSB' }
    ],
    '10M': [
      { min: 28.0, max: 28.07, mode: 'CW' },
      { min: 28.07, max: 28.2, mode: 'DIGI' },
      { min: 28.2, max: 29.7, mode: 'SSB' }
    ],
    '6M': [
      { min: 50.0, max: 50.2, mode: 'CW' },
      { min: 50.2, max: 50.3, mode: 'DIGI' },
      { min: 50.3, max: 54.0, mode: 'SSB' }
    ],
    '2M': [
      { min: 144.0, max: 144.2, mode: 'CW' },
      { min: 144.2, max: 144.3, mode: 'DIGI' },
      { min: 144.3, max: 148.0, mode: 'SSB' }
    ]
  };

  const dayCache = new Map();
  const stateBySlot = new Map();

  const getDayKeyFromTs = (ts) => {
    const d = new Date(ts);
    const year = d.getUTCFullYear();
    const start = Date.UTC(year, 0, 1);
    const day = Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - start) / 86400000) + 1;
    return { year, doy: String(day).padStart(3, '0') };
  };

  const getDayKeysInRange = (startTs, endTs) => {
    const keys = [];
    const start = new Date(Date.UTC(new Date(startTs).getUTCFullYear(), new Date(startTs).getUTCMonth(), new Date(startTs).getUTCDate()));
    const end = new Date(Date.UTC(new Date(endTs).getUTCFullYear(), new Date(endTs).getUTCMonth(), new Date(endTs).getUTCDate()));
    for (let t = start.getTime(); t <= end.getTime(); t += 86400000) {
      keys.push(getDayKeyFromTs(t));
    }
    return keys;
  };

  const modeBucket = (mode) => {
    const m = SH6.normalizeMode(mode || '');
    if (m === 'CW') return 'CW';
    if (MODE_PHONE.has(m)) return 'Phone';
    if (MODE_DIGITAL.has(m)) return 'Digital';
    return 'Digital';
  };

  const extractMode = (comment, band, freqMHz) => {
    const upper = String(comment || '').toUpperCase();
    for (const token of MODE_TOKENS) {
      if (upper.includes(token)) return token;
    }
    if (!band || !Number.isFinite(freqMHz)) return 'UNKNOWN';
    const plan = BAND_PLAN[band] || [];
    for (const entry of plan) {
      if (freqMHz >= entry.min && freqMHz <= entry.max) return entry.mode;
    }
    return 'UNKNOWN';
  };

  const parseSpotLine = (line) => {
    const parts = String(line || '').split('^');
    if (parts.length < 6) return null;
    const freqKHz = parseFloat(parts[0]);
    const dxCall = SH6.normalizeCall(parts[1] || '');
    const ts = parseInt(parts[2], 10) * 1000;
    const comment = (parts[3] || '').trim();
    if (!dxCall || !Number.isFinite(ts)) return null;
    const freqMHz = Number.isFinite(freqKHz) ? freqKHz / 1000 : null;
    const band = freqMHz ? SH6.normalizeBandToken(SH6.parseBandFromFreq(freqMHz) || '') : '';
    const rawMode = extractMode(comment, band, freqMHz);
    const mode = rawMode === 'UNKNOWN' ? 'Unknown' : modeBucket(rawMode);
    return { freqKHz, freqMHz, dxCall, ts, comment, band, mode };
  };

  const fetchDaySpots = async (year, doy) => {
    const key = `${year}/${doy}`;
    if (dayCache.has(key)) return dayCache.get(key);
    const url = `${SPOTS_BASE_URL}/${year}/${doy}.dat`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Spot fetch failed: ${res.status}`);
    const text = await res.text();
    const lines = text.split(/\r?\n/);
    const spots = [];
    lines.forEach((line) => {
      if (!line) return;
      const spot = parseSpotLine(line);
      if (spot) spots.push(spot);
    });
    const payload = { spots, url };
    dayCache.set(key, payload);
    return payload;
  };

  const formatDayKey = (key) => {
    const day = parseInt(key.doy, 10);
    if (!Number.isFinite(day)) return '';
    const date = new Date(Date.UTC(key.year, 0, 1));
    date.setUTCDate(date.getUTCDate() + day - 1);
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const formatDateRange = (keys) => {
    if (!keys.length) return '';
    const first = formatDayKey(keys[0]);
    const last = formatDayKey(keys[keys.length - 1]);
    if (!first || !last) return '';
    if (first === last) return `${first} (UTC)`;
    return `${first} to ${last} (UTC)`;
  };

  const fetchSpotsForWindow = async (startTs, endTs) => {
    const keys = getDayKeysInRange(startTs, endTs);
    const all = [];
    let sourceUrl = '';
    for (const k of keys) {
      const data = await fetchDaySpots(k.year, k.doy);
      sourceUrl = data.url;
      all.push(...data.spots);
    }
    return { spots: all, url: sourceUrl, keys };
  };

  const buildWorkedIndex = (slot) => {
    const groups = new Map();
    GROUPING_KEYS.forEach((key) => groups.set(key, new Set()));
    const qsos = slot?.qsoData?.qsos || [];
    qsos.forEach((q) => {
      const band = SH6.normalizeBandToken(q.band || '') || '';
      if (!band) return;
      const mode = modeBucket(q.mode || '');
      const prefix = SH6.lookupPrefix(q.call || '');
      const country = (prefix?.country || q.country || '').trim();
      if (!country) return;
      const values = { band, mode, country };
      GROUPING_KEYS.forEach((groupKey) => {
        const key = groupKey.split('|').map((part) => values[part] || '').join('|');
        groups.get(groupKey).add(key);
      });
    });
    return groups;
  };

  const buildActiveSlots = (spots, now, windowMs) => {
    const active = new Map();
    const cutoff = now - windowMs;
    spots.forEach((s) => {
      if (!s.band) return;
      if (s.ts < cutoff || s.ts > now) return;
      const prefix = SH6.lookupPrefix(s.dxCall || '');
      const country = prefix?.country || '';
      if (!country) return;
      const mode = s.mode || 'Unknown';
      const key = `${s.band}|${mode}|${country}`;
      let entry = active.get(key);
      if (!entry) {
        entry = { band: s.band, mode, country, count: 0, lastTs: 0, calls: new Set() };
        active.set(key, entry);
      }
      entry.count += 1;
      if (s.ts > entry.lastTs) entry.lastTs = s.ts;
      if (s.dxCall) entry.calls.add(s.dxCall);
    });
    return active;
  };

  const getGroupingParts = (value) => {
    const allowed = new Set(['band', 'mode', 'country']);
    const parts = String(value || '').split('|').map((p) => p.trim()).filter((p) => allowed.has(p));
    return parts.length ? parts : ['band', 'mode', 'country'];
  };

  const buildGroupingKey = (entry, groupingParts) => (
    groupingParts.map((part) => entry[part] || '').join('|')
  );

  const buildGroupedRows = (entries, groupingParts) => {
    const grouped = new Map();
    entries.forEach((entry) => {
      const key = groupingParts.map((part) => entry[part] || '').join('|');
      let row = grouped.get(key);
      if (!row) {
        row = {
          band: entry.band || '',
          mode: entry.mode || '',
          country: entry.country || '',
          count: 0,
          lastTs: 0,
          calls: new Set(),
          slots: 0
        };
        grouped.set(key, row);
      }
      row.count += entry.count || 0;
      row.slots += 1;
      if (entry.lastTs > row.lastTs) row.lastTs = entry.lastTs;
      if (entry.calls && entry.calls.size) {
        entry.calls.forEach((call) => row.calls.add(call));
      }
    });
    return Array.from(grouped.values());
  };

  const renderTable = (container, rows, meta, groupingParts) => {
    rows.sort((a, b) => b.lastTs - a.lastTs || b.count - a.count);
    if (!rows.length) {
      container.innerHTML = '<p>No new results in the selected window.</p>';
      return;
    }
    const showBand = groupingParts.includes('band');
    const showMode = groupingParts.includes('mode');
    const showCountry = groupingParts.includes('country');
    const headerCells = [
      showBand ? '<th>Band</th>' : '',
      showMode ? '<th>Mode</th>' : '',
      showCountry ? '<th>DXCC</th>' : '',
      '<th>Spots</th>',
      '<th>Last spot (UTC)</th>',
      '<th>Example calls</th>'
    ].filter(Boolean).join('');
    const body = rows.map((row, idx) => {
      const calls = Array.from(row.calls).slice(0, 6).join(' ');
      const last = SH6.formatDateSh6(row.lastTs);
      const bandLabel = SH6.formatBandLabel(row.band || '');
      const bandCls = SH6.bandClass(row.band || '');
      const rowCells = [
        showBand ? `<td class="${bandCls}">${bandLabel}</td>` : '',
        showMode ? `<td>${row.mode}</td>` : '',
        showCountry ? `<td>${row.country}</td>` : '',
        `<td>${SH6.formatNumberSh6(row.count)}</td>`,
        `<td>${last}</td>`,
        `<td class="spot-hunter-calls">${calls}</td>`
      ].filter(Boolean).join('');
      return `
        <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
          ${rowCells}
        </tr>
      `;
    }).join('');
    const dateLabel = meta.dateRange ? meta.dateRange : meta.url;
    container.innerHTML = `
      <div class="spot-hunter-meta">
        <div><b>Spots date</b>: ${dateLabel}</div>
        <div><b>Window spots</b>: ${SH6.formatNumberSh6(meta.windowCount)} | <b>New slots</b>: ${SH6.formatNumberSh6(meta.unworkedCount)} | <b>Groups</b>: ${SH6.formatNumberSh6(rows.length)}</div>
      </div>
      <table class="mtc spot-hunter-table" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc">${headerCells}</tr>
        ${body}
      </table>
    `;
  };

  const renderBandFilters = (container, bandCounts, current, enabled) => {
    if (!enabled) {
      container.innerHTML = '';
      return;
    }
    const bands = Array.from(bandCounts.entries()).sort((a, b) => b[1] - a[1]).map(([band]) => band);
    if (current && current !== 'ALL' && !bands.includes(current)) {
      bands.push(current);
    }
    const allCount = Array.from(bandCounts.values()).reduce((a, b) => a + b, 0);
    const buttons = ['ALL', ...bands].map((band) => {
      const label = band === 'ALL' ? `All bands (${SH6.formatNumberSh6(allCount)})` : `${SH6.formatBandLabel(band)} (${SH6.formatNumberSh6(bandCounts.get(band) || 0)})`;
      const cls = band === 'ALL' ? '' : SH6.bandClass(band);
      const active = band === current ? 'active' : '';
      return `<button type="button" class="spot-hunter-filter ${active} ${cls}" data-band="${band}">${label}</button>`;
    }).join('');
    container.innerHTML = buttons;
  };

  const renderModeFilters = (container, modeCounts, current, enabled) => {
    if (!enabled) {
      container.innerHTML = '';
      return;
    }
    const modes = Array.from(modeCounts.entries()).sort((a, b) => b[1] - a[1]).map(([mode]) => mode);
    if (current && current !== 'ALL' && !modes.includes(current)) {
      modes.push(current);
    }
    const allCount = Array.from(modeCounts.values()).reduce((a, b) => a + b, 0);
    const buttons = ['ALL', ...modes].map((mode) => {
      const label = mode === 'ALL' ? `All modes (${SH6.formatNumberSh6(allCount)})` : `${mode} (${SH6.formatNumberSh6(modeCounts.get(mode) || 0)})`;
      const active = mode === current ? 'active' : '';
      return `<button type="button" class="spot-hunter-filter ${active}" data-mode="${mode}">${label}</button>`;
    }).join('');
    container.innerHTML = buttons;
  };

  const formatWindowLabel = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = minutes / 60;
    if (Number.isInteger(hours)) return `${hours} hr`;
    return `${hours.toFixed(1)} hr`;
  };

  const getSlotState = (slotId) => {
    if (!stateBySlot.has(slotId)) {
      stateBySlot.set(slotId, {
        windowMinutes: 60,
        bandFilter: 'ALL',
        modeFilter: 'ALL',
        groupBy: 'band|mode|country'
      });
    }
    return stateBySlot.get(slotId);
  };

  const renderForContainer = async (container) => {
    const slotId = container.dataset.slot || 'A';
    const slot = SH6.getSlotById(slotId);
    if (!slot?.qsoData) {
      container.innerHTML = '<p>No log loaded yet.</p>';
      return;
    }
    const state = getSlotState(slotId);
    const controls = document.createElement('div');
    controls.className = 'spot-hunter-controls';
    controls.innerHTML = `
      <p class="spot-hunter-intro">Spot hunter checks the newest DX spots and compares them with everything already worked in this log.<br>Choose how far back to look, then pick a grouping to see only the still-unworked opportunities for this log.</p>
      <label>Window: <span class="spot-hunter-window">${formatWindowLabel(state.windowMinutes)}</span></label>
      <input type="range" min="${WINDOW_MIN}" max="${WINDOW_MAX}" step="10" value="${state.windowMinutes}">
      <div class="spot-hunter-group">
        <span class="spot-hunter-group-label">Group by</span>
        <div class="spot-hunter-group-buttons">
          ${GROUPING_OPTIONS.map((opt) => {
            const active = opt.value === state.groupBy ? 'active' : '';
            return `<button type="button" class="spot-hunter-group-btn ${active}" data-group="${opt.value}">${opt.label}</button>`;
          }).join('')}
        </div>
      </div>
      <div class="spot-hunter-filters"></div>
      <div class="spot-hunter-mode-filters"></div>
      <div class="spot-hunter-table-wrap"><p>Loading latest spots...</p></div>
    `;
    container.innerHTML = '';
    container.appendChild(controls);

    const slider = controls.querySelector('input');
    const windowLabel = controls.querySelector('.spot-hunter-window');
    const groupButtons = controls.querySelectorAll('.spot-hunter-group-btn');
    const filters = controls.querySelector('.spot-hunter-filters');
    const modeFilters = controls.querySelector('.spot-hunter-mode-filters');
    const tableWrap = controls.querySelector('.spot-hunter-table-wrap');

    const refresh = async () => {
      const minutes = Number(slider.value) || 60;
      state.windowMinutes = minutes;
      windowLabel.textContent = formatWindowLabel(minutes);
      state.groupBy = state.groupBy || 'band|mode|country';
      const groupingParts = getGroupingParts(state.groupBy);
      const hasBand = groupingParts.includes('band');
      const hasMode = groupingParts.includes('mode');
      if (!hasBand) state.bandFilter = 'ALL';
      if (!hasMode) state.modeFilter = 'ALL';
      const nowLocal = Date.now();
      const windowMsLocal = minutes * 60000;
      const startLocal = nowLocal - windowMsLocal;
      try {
        SH6.setSpotHunterStatus('loading', { source: SPOTS_BASE_URL });
        const data = await fetchSpotsForWindow(startLocal, nowLocal);
        const active = buildActiveSlots(data.spots, nowLocal, windowMsLocal);
        let windowCount = 0;
        const unworked = [];
        const bandCounts = new Map();
        const modeCounts = new Map();
        const workedIndex = buildWorkedIndex(slot);
        const groupKey = groupingParts.join('|');
        const workedSet = workedIndex.get(groupKey) || new Set();
        active.forEach((entry) => {
          windowCount += entry.count;
          const entryKey = buildGroupingKey(entry, groupingParts);
          if (!workedSet.has(entryKey)) {
            unworked.push(entry);
          }
        });
        const baseForBands = unworked.filter((entry) => !hasMode || state.modeFilter === 'ALL' || entry.mode === state.modeFilter);
        const baseForModes = unworked.filter((entry) => !hasBand || state.bandFilter === 'ALL' || entry.band === state.bandFilter);
        baseForBands.forEach((entry) => {
          if (entry.band) {
            bandCounts.set(entry.band, (bandCounts.get(entry.band) || 0) + 1);
          }
        });
        baseForModes.forEach((entry) => {
          if (entry.mode) {
            modeCounts.set(entry.mode, (modeCounts.get(entry.mode) || 0) + 1);
          }
        });
        renderBandFilters(filters, bandCounts, state.bandFilter, hasBand);
        renderModeFilters(modeFilters, modeCounts, state.modeFilter, hasMode);
        let filteredEntries = unworked;
        if (hasBand && state.bandFilter !== 'ALL') {
          filteredEntries = filteredEntries.filter((entry) => entry.band === state.bandFilter);
        }
        if (hasMode && state.modeFilter !== 'ALL') {
          filteredEntries = filteredEntries.filter((entry) => entry.mode === state.modeFilter);
        }
        const groupedRows = buildGroupedRows(filteredEntries, groupingParts);
        const dateRange = formatDateRange(data.keys || []);
        renderTable(tableWrap, groupedRows, { url: data.url, windowCount, dateRange, unworkedCount: unworked.length }, groupingParts);
        SH6.setSpotHunterStatus('ok', { source: SPOTS_BASE_URL });
        if (hasBand) {
          filters.querySelectorAll('.spot-hunter-filter').forEach((btn) => {
            btn.addEventListener('click', () => {
              state.bandFilter = btn.dataset.band || 'ALL';
              refresh();
            });
          });
        }
        if (hasMode) {
          modeFilters.querySelectorAll('.spot-hunter-filter').forEach((btn) => {
            btn.addEventListener('click', () => {
              state.modeFilter = btn.dataset.mode || 'ALL';
              refresh();
            });
          });
        }
      } catch (err) {
        tableWrap.innerHTML = '<p>Failed to load the selected spots window.</p>';
        SH6.setSpotHunterStatus('error', { source: SPOTS_BASE_URL, error: err ? String(err) : 'Spot fetch failed' });
      }
    };

    slider.addEventListener('input', () => {
      refresh();
    });
    groupButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.groupBy = btn.dataset.group || state.groupBy;
        groupButtons.forEach((item) => item.classList.toggle('active', item === btn));
        refresh();
      });
    });

    refresh();
  };

  window.SpotHunterRender = () => {
    const containers = document.querySelectorAll('.spot-hunter');
    containers.forEach((container) => {
      renderForContainer(container);
    });
  };
})();
