(() => {
  const SH6 = window.SH6;
  if (!SH6) return;

  const SPOTS_BASE_URL = 'https://azure.s53m.com/spots';
  const MODE_TOKENS = ['FT8', 'FT4', 'CW', 'SSB', 'RTTY', 'PSK', 'JT65', 'JT9', 'MSK144', 'Q65', 'AM', 'FM', 'PKT', 'DIGI', 'DATA'];
  const WINDOW_MIN = 10;
  const WINDOW_MAX = 24 * 60;

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
    const mode = extractMode(comment, band, freqMHz);
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

  const fetchSpotsForWindow = async (startTs, endTs) => {
    const keys = getDayKeysInRange(startTs, endTs);
    const all = [];
    let sourceUrl = '';
    for (const k of keys) {
      const data = await fetchDaySpots(k.year, k.doy);
      sourceUrl = data.url;
      all.push(...data.spots);
    }
    return { spots: all, url: sourceUrl };
  };

  const buildWorkedSlots = (slot) => {
    const worked = new Set();
    const qsos = slot?.qsoData?.qsos || [];
    qsos.forEach((q) => {
      const band = SH6.normalizeBandToken(q.band || '') || '';
      if (!band) return;
      const mode = SH6.normalizeMode(q.mode || '') || 'UNKNOWN';
      const prefix = q.country ? { country: q.country } : SH6.lookupPrefix(q.call || '');
      const country = prefix?.country || '';
      if (!country) return;
      worked.add(`${band}|${mode}|${country}`);
    });
    return worked;
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
      const mode = s.mode || 'UNKNOWN';
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

  const renderTable = (container, active, worked, meta, filterBand) => {
    const rows = [];
    active.forEach((entry, key) => {
      if (worked.has(key)) return;
      if (filterBand && filterBand !== 'ALL' && entry.band !== filterBand) return;
      rows.push(entry);
    });
    rows.sort((a, b) => b.lastTs - a.lastTs || b.count - a.count);
    if (!rows.length) {
      container.innerHTML = '<p>No new band/mode DXCC slots in the selected window.</p>';
      return;
    }
    const body = rows.map((row, idx) => {
      const calls = Array.from(row.calls).slice(0, 6).join(' ');
      const last = SH6.formatDateSh6(row.lastTs);
      const bandLabel = SH6.formatBandLabel(row.band || '');
      const bandCls = SH6.bandClass(row.band || '');
      return `
        <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
          <td class="${bandCls}">${bandLabel}</td>
          <td>${row.mode}</td>
          <td>${row.country}</td>
          <td>${SH6.formatNumberSh6(row.count)}</td>
          <td>${last}</td>
          <td class="spot-hunter-calls">${calls}</td>
        </tr>
      `;
    }).join('');
    container.innerHTML = `
      <div class="spot-hunter-meta">
        <div><b>Source</b>: ${meta.url}</div>
        <div><b>Window spots</b>: ${SH6.formatNumberSh6(meta.windowCount)} · <b>New slots</b>: ${SH6.formatNumberSh6(rows.length)}</div>
      </div>
      <table class="mtc spot-hunter-table" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>Band</th><th>Mode</th><th>DXCC</th><th>Spots</th><th>Last spot (UTC)</th><th>Example calls</th></tr>
        ${body}
      </table>
    `;
  };

  const renderBandFilters = (container, bandCounts, current) => {
    const bands = Array.from(bandCounts.entries()).sort((a, b) => b[1] - a[1]).map(([band]) => band);
    const allCount = Array.from(bandCounts.values()).reduce((a, b) => a + b, 0);
    const buttons = ['ALL', ...bands].map((band) => {
      const label = band === 'ALL' ? `All bands (${SH6.formatNumberSh6(allCount)})` : `${SH6.formatBandLabel(band)} (${SH6.formatNumberSh6(bandCounts.get(band) || 0)})`;
      const cls = band === 'ALL' ? '' : SH6.bandClass(band);
      const active = band === current ? 'active' : '';
      return `<button type="button" class="spot-hunter-filter ${active} ${cls}" data-band="${band}">${label}</button>`;
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
      stateBySlot.set(slotId, { windowMinutes: 60, bandFilter: 'ALL' });
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
    const now = Date.now();
    const windowMs = Math.min(WINDOW_MAX, Math.max(WINDOW_MIN, state.windowMinutes)) * 60000;
    const startTs = now - windowMs;
    const controls = document.createElement('div');
    controls.className = 'spot-hunter-controls';
    controls.innerHTML = `
      <label>Window: <span class="spot-hunter-window">${formatWindowLabel(state.windowMinutes)}</span></label>
      <input type="range" min="${WINDOW_MIN}" max="${WINDOW_MAX}" step="10" value="${state.windowMinutes}">
      <div class="spot-hunter-filters"></div>
      <div class="spot-hunter-table-wrap"><p>Loading latest spots…</p></div>
    `;
    container.innerHTML = '';
    container.appendChild(controls);

    const slider = controls.querySelector('input');
    const windowLabel = controls.querySelector('.spot-hunter-window');
    const filters = controls.querySelector('.spot-hunter-filters');
    const tableWrap = controls.querySelector('.spot-hunter-table-wrap');

    const refresh = async () => {
      const minutes = Number(slider.value) || 60;
      state.windowMinutes = minutes;
      windowLabel.textContent = formatWindowLabel(minutes);
      const nowLocal = Date.now();
      const windowMsLocal = minutes * 60000;
      const startLocal = nowLocal - windowMsLocal;
      try {
        const data = await fetchSpotsForWindow(startLocal, nowLocal);
        const active = buildActiveSlots(data.spots, nowLocal, windowMsLocal);
        let windowCount = 0;
        const bandCounts = new Map();
        active.forEach((entry) => {
          windowCount += entry.count;
          bandCounts.set(entry.band, (bandCounts.get(entry.band) || 0) + 1);
        });
        renderBandFilters(filters, bandCounts, state.bandFilter);
        const worked = buildWorkedSlots(slot);
        renderTable(tableWrap, active, worked, { url: data.url, windowCount }, state.bandFilter);
        filters.querySelectorAll('.spot-hunter-filter').forEach((btn) => {
          btn.addEventListener('click', () => {
            state.bandFilter = btn.dataset.band || 'ALL';
            refresh();
          });
        });
      } catch (err) {
        tableWrap.innerHTML = '<p>Failed to load today’s spots.</p>';
      }
    };

    slider.addEventListener('input', () => {
      refresh();
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
