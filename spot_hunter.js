(() => {
  const SH6 = window.SH6;
  if (!SH6) return;

  const SPOTS_BASE_URL = 'https://azure.s53m.com/spots';
  const MODE_TOKENS = ['FT8', 'FT4', 'CW', 'SSB', 'RTTY', 'PSK', 'JT65', 'JT9', 'MSK144', 'Q65', 'AM', 'FM', 'PKT', 'DIGI', 'DATA'];
  const LAST_HOUR_MS = 60 * 60 * 1000;
  let cachedSpots = null;
  let cachedPromise = null;

  const getTodayKey = () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const start = Date.UTC(year, 0, 1);
    const day = Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - start) / 86400000) + 1;
    return { year, doy: String(day).padStart(3, '0') };
  };

  const extractMode = (comment) => {
    const upper = String(comment || '').toUpperCase();
    for (const token of MODE_TOKENS) {
      if (upper.includes(token)) return token;
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
    const mode = extractMode(comment);
    return { freqKHz, freqMHz, dxCall, ts, comment, band, mode };
  };

  const fetchTodaySpots = async () => {
    if (cachedPromise) return cachedPromise;
    cachedPromise = (async () => {
      const { year, doy } = getTodayKey();
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
      cachedSpots = { spots, url };
      return cachedSpots;
    })();
    return cachedPromise;
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

  const buildActiveSlots = (spots, now) => {
    const active = new Map();
    spots.forEach((s) => {
      if (!s.band) return;
      if (s.ts < now - LAST_HOUR_MS) return;
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

  const renderTable = (container, active, worked, meta) => {
    const rows = [];
    active.forEach((entry, key) => {
      if (worked.has(key)) return;
      rows.push(entry);
    });
    rows.sort((a, b) => b.lastTs - a.lastTs || b.count - a.count);
    if (!rows.length) {
      container.innerHTML = '<p>No new band/mode DXCC slots spotted in the last hour.</p>';
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
        <div><b>Last hour spots</b>: ${SH6.formatNumberSh6(meta.lastHour)} · <b>New slots</b>: ${SH6.formatNumberSh6(rows.length)}</div>
      </div>
      <table class="mtc spot-hunter-table" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>Band</th><th>Mode</th><th>DXCC</th><th>Spots</th><th>Last spot (UTC)</th><th>Example calls</th></tr>
        ${body}
      </table>
    `;
  };

  const renderForContainer = async (container) => {
    const slotId = container.dataset.slot || 'A';
    const slot = SH6.getSlotById(slotId);
    if (!slot?.qsoData) {
      container.innerHTML = '<p>No log loaded yet.</p>';
      return;
    }
    container.innerHTML = '<p>Loading latest spots for today…</p>';
    try {
      const data = await fetchTodaySpots();
      const now = Date.now();
      const active = buildActiveSlots(data.spots, now);
      let lastHourCount = 0;
      active.forEach((entry) => { lastHourCount += entry.count; });
      const worked = buildWorkedSlots(slot);
      renderTable(container, active, worked, { url: data.url, lastHour: lastHourCount });
    } catch (err) {
      container.innerHTML = '<p>Failed to load today’s spots.</p>';
    }
  };

  window.SpotHunterRender = () => {
    const containers = document.querySelectorAll('.spot-hunter');
    containers.forEach((container) => {
      renderForContainer(container);
    });
  };
})();
