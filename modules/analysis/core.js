(function initSh6AnalysisCore(globalScope) {
  'use strict';

  const ANALYSIS_MODE_CONTESTER = 'contester';
  const ANALYSIS_MODE_DXER = 'dxer';
  const ANALYSIS_MODE_DEFAULT = ANALYSIS_MODE_CONTESTER;
  const DUPE_WINDOW_MS = 15 * 60 * 1000;
  const SCORING_UNKNOWN_WARNING = 'Rules for this contest are unknown. Showing logged points only if available.';
  const SCORING_UNKNOWN_WARNING_DXER = 'Scoring rules are unavailable. Showing logged points only.';

  const BAND_DEFS = [
    { label: '2190M', min: 0.1357, max: 0.1378 },
    { label: '630M', min: 0.472, max: 0.479 },
    { label: '560M', min: 0.5, max: 0.51 },
    { label: '160M', min: 1.8, max: 2.0 },
    { label: '80M', min: 3.4, max: 4.0 },
    { label: '60M', min: 5.0, max: 5.5 },
    { label: '40M', min: 6.9, max: 7.5 },
    { label: '30M', min: 10.0, max: 10.2 },
    { label: '20M', min: 13.9, max: 15.0 },
    { label: '17M', min: 18.0, max: 18.2 },
    { label: '15M', min: 20.8, max: 22.0 },
    { label: '12M', min: 24.8, max: 25.0 },
    { label: '10M', min: 27.9, max: 29.8 },
    { label: '8M', min: 40.0, max: 45.0 },
    { label: '6M', min: 50.0, max: 54.0 },
    { label: '5M', min: 54.0, max: 70.0 },
    { label: '4M', min: 70.0, max: 71.0 },
    { label: '2M', min: 144.0, max: 148.0 },
    { label: '1.25M', min: 222.0, max: 225.0 },
    { label: '70CM', min: 420.0, max: 450.0 },
    { label: '33CM', min: 902.0, max: 928.0 },
    { label: '23CM', min: 1240.0, max: 1300.0 },
    { label: '13CM', min: 2300.0, max: 2450.0 },
    { label: '9CM', min: 3300.0, max: 3500.0 },
    { label: '6CM', min: 5650.0, max: 5925.0 },
    { label: '3CM', min: 10000.0, max: 10500.0 },
    { label: '1.25CM', min: 24000.0, max: 24250.0 },
    { label: '6MM', min: 47000.0, max: 47200.0 },
    { label: '4MM', min: 75500.0, max: 81000.0 },
    { label: '2.5MM', min: 122000.0, max: 123000.0 },
    { label: '2MM', min: 134000.0, max: 141000.0 },
    { label: '1MM', min: 241000.0, max: 250000.0 }
  ];
  const BAND_LABELS = new Set(BAND_DEFS.map((b) => b.label));
  const BAND_ORDER_INDEX = new Map(BAND_DEFS.map((b, idx) => [b.label, idx]));
  const METER_TOKEN_MAP = new Map();
  BAND_DEFS.forEach((band) => {
    const match = band.label.match(/^(\d+(?:\.\d+)?)(M)$/i);
    if (!match) return;
    const num = match[1];
    const norm = String(parseFloat(num));
    METER_TOKEN_MAP.set(num, band.label);
    METER_TOKEN_MAP.set(norm, band.label);
  });
  const SUPPORTED_BANDS = new Set([...BAND_LABELS, 'LIGHT']);

  const MODE_DIGITAL = new Set([
    'FT8', 'FT4', 'RTTY', 'PSK', 'PSK31', 'DATA', 'DIGI', 'MFSK',
    'JT65', 'JT9', 'OLIVIA', 'FSK', 'FSK441', 'AMTOR'
  ]);
  const MODE_PHONE = new Set(['SSB', 'USB', 'LSB', 'AM', 'FM', 'PH', 'PHONE']);

  const SCORING_RULE_ALIASES = Object.freeze({
    cqww: ['CQWW', 'CQ-WW', 'CQ WW', 'CQ WORLD WIDE'],
    cqwpx: ['CQWPX', 'CQ-WPX', 'CQ WPX'],
    cqwwrtty: ['CQWWRTTY', 'CQ-WW-RTTY', 'CQ WW RTTY'],
    cqwpxrtty: ['CQWPXRTTY', 'CQ-WPX-RTTY', 'CQ WPX RTTY'],
    cq160: ['CQ160', 'CQ 160', 'CQ-160'],
    wae: ['WAE', 'WORKED ALL EUROPE'],
    darc_fieldday: ['DARC FIELDDAY', 'DARC FIELD DAY'],
    darc_wag: ['DARC WAG', 'WAG CONTEST'],
    ref: ['COUPE DU REF', 'REF CONTEST'],
    eudx: ['EU DX', 'EUDX', 'EU DX CONTEST'],
    euhfc: ['EUHFC', 'EUROPEAN HF CHAMPIONSHIP'],
    eu_vhf_bundle: ['IARU REGION 1 VHF', 'EU VHF', 'ALPE ADRIA'],
    ww_pmc: ['WW PMC', 'WORLDWIDE PEACE MESSENGER'],
    zrs_kvp: ['ZRS KVP'],
    ok_om_dx: ['OK OM DX', 'OK-OM DX', 'OK DX', 'OM DX'],
    rdxc: ['RDXC', 'RUSSIAN DX'],
    rf_championship_cw: ['RF CHAMPIONSHIP CW', 'CHAMPIONSHIP OF RUSSIA CW'],
    ham_spirit: ['HAM SPIRIT'],
    rcc_cup: ['RCC CUP'],
    rda: ['RDA CONTEST', 'RUSSIAN DISTRICT AWARD'],
    rrtc: ['RRTC', 'RUSSIAN RADIO TEAM CHAMPIONSHIP'],
    yuri_gagarin: ['YURI GAGARIN', 'GAGARIN'],
    wed_minitest_40m: ['WEDNESDAY MINITEST 40M', 'WED MINI 40M'],
    wed_minitest_80m: ['WEDNESDAY MINITEST 80M', 'WED MINI 80M'],
    arrl_family_bundle: ['ARRL']
  });
  const SCORING_PHASE1_RULES = new Set([
    'cqww',
    'cqwpx',
    'cqwwrtty',
    'cqwpxrtty',
    'cq160',
    'wae',
    'ref',
    'eudx',
    'euhfc',
    'zrs_kvp',
    'rdxc',
    'rf_championship_cw',
    'ham_spirit',
    'rcc_cup',
    'rrtc',
    'yuri_gagarin'
  ]);
  const SCORING_PHASE2_RULES = new Set([
    'darc_fieldday',
    'darc_wag',
    'ww_pmc',
    'ok_om_dx',
    'rda',
    'wed_minitest_40m',
    'wed_minitest_80m'
  ]);
  const US_STATE_CODES = new Set([
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC'
  ]);
  const VE_AREA_CODES = new Set(['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']);
  const PORTABLE_CALL_SUFFIXES = new Set(['P', 'M', 'MM', 'AM', 'QRP']);
  const SLASH_AREA_TOKEN_RE = /^[A-Z]{1,2}\d{1,2}$/;
  const KG4_US_CALL_RE = /^KG4[A-Z]{1,3}$/;
  const KG4_GITMO_RE = /^KG4[A-Z]{2}$/;
  const WPX_IGNORE_SUFFIXES = new Set(['A', 'E', 'J', 'P', 'M', 'MM', 'AM', 'QRP', 'QRPP']);

  const scoringIndexCache = new WeakMap();
  let activeAnalysisEnv = null;

  function makeEmptyAnalysisEnv() {
    return {
      ctyTable: [],
      prefixCache: new Map(),
      countryPrefixMap: null,
      masterSet: null,
      scoringSpec: null,
      scoringRuleMap: new Map(),
      scoringRuleByFolder: new Map(),
      scoringAliasMap: new Map(),
      scoringStatus: 'pending',
      scoringError: '',
      scoringSource: '',
      analysisMode: ANALYSIS_MODE_DEFAULT,
      callsignGridCache: new Map()
    };
  }

  function normalizeAnalysisMode(value) {
    return value === ANALYSIS_MODE_DXER ? ANALYSIS_MODE_DXER : ANALYSIS_MODE_CONTESTER;
  }

  function normalizeCall(call) {
    return (call || '').trim().toUpperCase();
  }

  function bandOrderIndex(band) {
    const key = (band || '').toUpperCase();
    if (BAND_ORDER_INDEX.has(key)) return BAND_ORDER_INDEX.get(key);
    const num = parseFloat(key);
    if (Number.isFinite(num)) return 1000 + num;
    return 9999;
  }

  function sortBands(list) {
    return (list || []).slice().sort((a, b) => {
      const ai = bandOrderIndex(a);
      const bi = bandOrderIndex(b);
      if (ai !== bi) return ai - bi;
      return String(a || '').localeCompare(String(b || ''));
    });
  }

  function formatBandLabel(band) {
    if (!band) return '';
    const raw = String(band).trim();
    if (!raw) return '';
    if (raw === 'All' || raw === 'ALL') return 'All';
    const key = raw.toUpperCase();
    if (BAND_LABELS.has(key) || key === 'LIGHT') return key.toLowerCase();
    return raw;
  }

  function bandLabelFromNumberToken(token) {
    if (!token) return '';
    const key = String(token).trim();
    if (!key) return '';
    const direct = METER_TOKEN_MAP.get(key);
    if (direct) return direct;
    const norm = String(parseFloat(key));
    return METER_TOKEN_MAP.get(norm) || '';
  }

  function parseBandFromFreq(freqMHz) {
    if (!Number.isFinite(freqMHz)) return '';
    for (const band of BAND_DEFS) {
      if (freqMHz >= band.min && freqMHz < band.max) return band.label;
    }
    return '';
  }

  function normalizeBandToken(raw) {
    if (!raw) return '';
    const cleaned = String(raw).trim();
    if (!cleaned) return '';
    let token = cleaned.toLowerCase().replace(/\s+/g, '');
    token = token
      .replace(/meters?|metres?/g, 'm')
      .replace(/centimeters?|centimetres?/g, 'cm')
      .replace(/millimeters?|millimetres?/g, 'mm');
    let match = token.match(/^(\d+(?:\.\d+)?)(mm|cm|m)$/);
    if (match) {
      const num = String(parseFloat(match[1]));
      return `${num}${match[2]}`.toUpperCase();
    }
    match = token.match(/^(\d+(?:\.\d+)?)g(?:hz)?$/);
    if (match) {
      const ghz = parseFloat(match[1]);
      if (Number.isFinite(ghz)) {
        const band = parseBandFromFreq(ghz * 1000);
        return band || `${match[1]}G`.toUpperCase();
      }
    }
    if (/^\d+(\.\d+)?$/.test(token)) {
      const fromToken = bandLabelFromNumberToken(token);
      if (fromToken) return fromToken;
      const num = parseFloat(token);
      if (!Number.isFinite(num)) return '';
      const mhz = num >= 1000 ? num / 1000 : num;
      const band = parseBandFromFreq(mhz);
      return band || String(num).toUpperCase();
    }
    return cleaned.toUpperCase();
  }

  function normalizeBand(rawBand, freq) {
    const band = normalizeBandToken(rawBand);
    if (band) return band;
    if (Number.isFinite(freq)) return parseBandFromFreq(freq);
    return '';
  }

  function normalizeMode(mode) {
    return (mode || '').trim().toUpperCase();
  }

  function modeBucket(mode) {
    const m = normalizeMode(mode);
    if (m === 'CW') return 'CW';
    if (MODE_PHONE.has(m)) return 'Phone';
    if (MODE_DIGITAL.has(m)) return 'Digital';
    return 'Digital';
  }

  function dateKeyFromTs(ts) {
    const d = new Date(ts);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    return y * 10000 + m * 100 + day;
  }

  function monthKeyFromTs(ts) {
    if (!Number.isFinite(ts)) return '';
    const d = new Date(ts);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    return `${y}-${String(m).padStart(2, '0')}`;
  }

  function yearKeyFromTs(ts) {
    if (!Number.isFinite(ts)) return '';
    const d = new Date(ts);
    return String(d.getUTCFullYear());
  }

  function buildCountryMonthBuckets(qsos, bandFilter) {
    const map = new Map();
    const bandKey = bandFilter ? normalizeBandToken(bandFilter) : '';
    qsos.forEach((q) => {
      const qBand = q.band ? normalizeBandToken(q.band) : '';
      if (bandKey && qBand !== bandKey) return;
      if (q.country == null || q.ts == null) return;
      const monthKey = monthKeyFromTs(q.ts);
      if (!monthKey) return;
      if (!map.has(q.country)) {
        map.set(q.country, { total: 0, months: new Map() });
      }
      const buckets = map.get(q.country);
      buckets.total += 1;
      buckets.months.set(monthKey, (buckets.months.get(monthKey) || 0) + 1);
    });
    return map;
  }

  function buildZoneMonthBuckets(qsos, field, bandFilter) {
    const map = new Map();
    const bandKey = bandFilter ? normalizeBandToken(bandFilter) : '';
    const fieldName = field === 'itu' ? 'ituZone' : 'cqZone';
    qsos.forEach((q) => {
      const qBand = q.band ? normalizeBandToken(q.band) : '';
      if (bandKey && qBand !== bandKey) return;
      const zone = Number.isFinite(q[fieldName]) ? q[fieldName] : null;
      if (!zone || q.ts == null) return;
      const monthKey = monthKeyFromTs(q.ts);
      if (!monthKey) return;
      if (!map.has(zone)) {
        map.set(zone, { total: 0, months: new Map(), countries: new Set() });
      }
      const buckets = map.get(zone);
      buckets.total += 1;
      buckets.months.set(monthKey, (buckets.months.get(monthKey) || 0) + 1);
      if (q.country) buckets.countries.add(q.country);
    });
    return map;
  }

  function buildCountryYearBuckets(qsos, bandFilter) {
    const map = new Map();
    const bandKey = bandFilter ? normalizeBandToken(bandFilter) : '';
    qsos.forEach((q) => {
      const qBand = q.band ? normalizeBandToken(q.band) : '';
      if (bandKey && qBand !== bandKey) return;
      if (q.country == null || q.ts == null) return;
      const yearKey = yearKeyFromTs(q.ts);
      if (!yearKey) return;
      if (!map.has(q.country)) {
        map.set(q.country, { total: 0, years: new Map() });
      }
      const buckets = map.get(q.country);
      buckets.total += 1;
      buckets.years.set(yearKey, (buckets.years.get(yearKey) || 0) + 1);
    });
    return map;
  }

  function buildZoneYearBuckets(qsos, field, bandFilter) {
    const map = new Map();
    const bandKey = bandFilter ? normalizeBandToken(bandFilter) : '';
    const fieldName = field === 'itu' ? 'ituZone' : 'cqZone';
    qsos.forEach((q) => {
      const qBand = q.band ? normalizeBandToken(q.band) : '';
      if (bandKey && qBand !== bandKey) return;
      const zone = Number.isFinite(q[fieldName]) ? q[fieldName] : null;
      if (!zone || q.ts == null) return;
      const yearKey = yearKeyFromTs(q.ts);
      if (!yearKey) return;
      if (!map.has(zone)) {
        map.set(zone, { total: 0, years: new Map(), countries: new Set() });
      }
      const buckets = map.get(zone);
      buckets.total += 1;
      buckets.years.set(yearKey, (buckets.years.get(yearKey) || 0) + 1);
      if (q.country) buckets.countries.add(q.country);
    });
    return map;
  }

  function computeBreakSummary(minutesMap, threshold) {
    const minutes = Array.from(minutesMap.keys()).sort((a, b) => a - b);
    if (!minutes.length) return { totalBreakMin: 0, breaks: [] };
    const breaks = [];
    let totalBreakMin = 0;
    for (let i = 1; i < minutes.length; i += 1) {
      const gap = minutes[i] - minutes[i - 1];
      if (gap > threshold) {
        const len = gap - 1;
        totalBreakMin += len;
        breaks.push({ start: minutes[i - 1] + 1, end: minutes[i] - 1, minutes: len });
      }
    }
    return { totalBreakMin, breaks };
  }

  function clampNumber(value, min, max) {
    const num = Number(value);
    if (!Number.isFinite(num)) return min;
    return Math.max(min, Math.min(max, num));
  }

  function medianNumber(values) {
    const list = (values || []).filter((value) => Number.isFinite(value)).slice().sort((a, b) => a - b);
    if (!list.length) return null;
    const mid = Math.floor(list.length / 2);
    return list.length % 2 ? list[mid] : (list[mid - 1] + list[mid]) / 2;
  }

  function exportOperatingStyleFrequencies(freqMap) {
    return Array.from((freqMap instanceof Map ? freqMap : new Map()).entries())
      .sort((a, b) => b[1] - a[1] || a[0] - b[0])
      .slice(0, 3)
      .map(([freqKey, count]) => ({ freq: freqKey / 1000, count }));
  }

  function estimateOperatingStyleRadiusKhz(freqs, mode) {
    const unique = Array.from(new Set((freqs || []).filter((value) => Number.isFinite(value)))).sort((a, b) => a - b);
    const diffs = [];
    for (let i = 1; i < unique.length; i += 1) {
      const deltaKhz = (unique[i] - unique[i - 1]) * 1000;
      if (deltaKhz > 0.01) diffs.push(deltaKhz);
    }
    const medianStepKhz = medianNumber(diffs);
    const isPhone = mode === 'Phone';
    const minRadiusKhz = isPhone ? 2.5 : 1;
    const maxRadiusKhz = isPhone ? 4 : 2;
    const candidateKhz = Number.isFinite(medianStepKhz) ? medianStepKhz : minRadiusKhz;
    return clampNumber(candidateKhz, minRadiusKhz, maxRadiusKhz);
  }

  function buildOperatingStyleSummary(qsos) {
    const meta = {
      windowRadiusQsos: 20,
      minClusterCount: 4,
      dominanceShareMin: 0.35,
      inbandReturnRadiusQsos: 10
    };
    const buckets = new Map();
    let excludedQsoCount = 0;
    (qsos || []).forEach((q, index) => {
      if (!q || q.isQtc) return;
      if (!Number.isFinite(q.ts) || !Number.isFinite(q.freq)) {
        excludedQsoCount += 1;
        return;
      }
      const band = normalizeBand(q.band, q.freq) || 'unknown';
      const mode = modeBucket(q.mode);
      const key = `${band}|${mode}`;
      if (!buckets.has(key)) buckets.set(key, { band, mode, items: [] });
      buckets.get(key).items.push({ q, index });
    });
    const bandMap = new Map();
    const ensureBand = (band) => {
      if (!bandMap.has(band)) {
        bandMap.set(band, {
          band,
          qsos: 0,
          runQsos: 0,
          inbandQsos: 0,
          searchQsos: 0,
          spQsos: 0,
          runPct: 0,
          inbandPct: 0,
          searchPct: 0,
          spPct: 0,
          topRunFrequencies: [],
          modeBreakdown: [],
          _runFreqs: new Map()
        });
      }
      return bandMap.get(band);
    };

    buckets.forEach((bucket) => {
      const list = bucket.items.slice().sort((a, b) => (
        (a.q.ts - b.q.ts)
        || ((a.q.qsoNumber || 0) - (b.q.qsoNumber || 0))
        || (a.index - b.index)
      ));
      const radiusKhz = estimateOperatingStyleRadiusKhz(list.map((entry) => entry.q.freq), bucket.mode);
      const radiusMHz = radiusKhz / 1000;
      const modeEntry = {
        mode: bucket.mode,
        qsos: list.length,
        runQsos: 0,
        inbandQsos: 0,
        searchQsos: 0,
        spQsos: 0,
        runPct: 0,
        inbandPct: 0,
        searchPct: 0,
        spPct: 0,
        clusterRadiusKhz: radiusKhz,
        topRunFrequencies: []
      };
      const modeRunFreqs = new Map();
      const bandEntry = ensureBand(bucket.band);
      const analysis = new Array(list.length);
      const countSupport = (centerFreq, lo, hi) => {
        let count = 0;
        for (let k = lo; k <= hi; k += 1) {
          if (Math.abs(list[k].q.freq - centerFreq) <= radiusMHz + 1e-9) count += 1;
        }
        return count;
      };

      for (let i = 0; i < list.length; i += 1) {
        const lo = Math.max(0, i - meta.windowRadiusQsos);
        const hi = Math.min(list.length - 1, i + meta.windowRadiusQsos);
        let bestFreq = null;
        let bestCount = 0;
        let bestDistance = Infinity;
        for (let j = lo; j <= hi; j += 1) {
          const center = list[j].q.freq;
          const count = countSupport(center, lo, hi);
          const distance = Math.abs(list[i].q.freq - center);
          if (count > bestCount || (count === bestCount && distance < bestDistance)) {
            bestFreq = center;
            bestCount = count;
            bestDistance = distance;
          }
        }
        const windowSize = hi - lo + 1;
        const dominance = windowSize ? (bestCount / windowSize) : 0;
        const centeredRunActive = bestCount >= meta.minClusterCount && dominance >= meta.dominanceShareMin;
        const centeredOnRun = centeredRunActive && Math.abs(list[i].q.freq - bestFreq) <= radiusMHz + 1e-9;
        let streakLo = i;
        while (streakLo > 0 && Math.abs(list[streakLo - 1].q.freq - list[i].q.freq) <= radiusMHz + 1e-9) streakLo -= 1;
        let streakHi = i;
        while (streakHi + 1 < list.length && Math.abs(list[streakHi + 1].q.freq - list[i].q.freq) <= radiusMHz + 1e-9) streakHi += 1;
        analysis[i] = {
          centeredRunActive,
          centeredOnRun,
          dominantRunFreq: Number.isFinite(bestFreq) ? bestFreq : null,
          streakRunSupported: (streakHi - streakLo + 1) >= meta.minClusterCount
        };
      }

      for (let i = 0; i < list.length; i += 1) {
        let hasPrevCenteredRun = false;
        for (let j = i - 1; j >= Math.max(0, i - meta.inbandReturnRadiusQsos); j -= 1) {
          if (analysis[j].centeredOnRun) {
            hasPrevCenteredRun = true;
            break;
          }
        }
        let hasNextCenteredRun = false;
        for (let j = i + 1; j <= Math.min(list.length - 1, i + meta.inbandReturnRadiusQsos); j += 1) {
          if (analysis[j].centeredOnRun) {
            hasNextCenteredRun = true;
            break;
          }
        }
        const hasRunReturn = hasPrevCenteredRun && hasNextCenteredRun;
        const transitionRun = analysis[i].streakRunSupported && !hasRunReturn;
        const role = analysis[i].centeredOnRun || transitionRun
          ? 'RUN'
          : (analysis[i].centeredRunActive && hasRunReturn ? 'INBAND' : 'SEARCH');
        const q = list[i].q;
        q.operatingStyleRole = role;
        q.operatingStyleBand = bucket.band;
        q.operatingStyleMode = bucket.mode;
        q.operatingStyleRunFreq = role === 'RUN'
          ? (analysis[i].centeredOnRun ? analysis[i].dominantRunFreq : q.freq)
          : analysis[i].dominantRunFreq;

        bandEntry.qsos += 1;
        modeEntry.qsos = list.length;
        if (role === 'RUN') {
          bandEntry.runQsos += 1;
          modeEntry.runQsos += 1;
          const runFreq = Number.isFinite(q.operatingStyleRunFreq) ? q.operatingStyleRunFreq : q.freq;
          const freqKey = Math.round(runFreq * 1000);
          bandEntry._runFreqs.set(freqKey, (bandEntry._runFreqs.get(freqKey) || 0) + 1);
          modeRunFreqs.set(freqKey, (modeRunFreqs.get(freqKey) || 0) + 1);
        } else if (role === 'INBAND') {
          bandEntry.inbandQsos += 1;
          modeEntry.inbandQsos += 1;
        } else {
          bandEntry.searchQsos += 1;
          modeEntry.searchQsos += 1;
        }
      }

      modeEntry.spQsos = modeEntry.inbandQsos + modeEntry.searchQsos;
      if (modeEntry.qsos) {
        modeEntry.runPct = (modeEntry.runQsos / modeEntry.qsos) * 100;
        modeEntry.inbandPct = (modeEntry.inbandQsos / modeEntry.qsos) * 100;
        modeEntry.searchPct = (modeEntry.searchQsos / modeEntry.qsos) * 100;
        modeEntry.spPct = (modeEntry.spQsos / modeEntry.qsos) * 100;
      }
      modeEntry.topRunFrequencies = exportOperatingStyleFrequencies(modeRunFreqs);
      bandEntry.modeBreakdown.push(modeEntry);
    });

    const modeOrder = new Map([['CW', 0], ['Phone', 1], ['Digital', 2]]);
    const bands = Array.from(bandMap.values()).map((entry) => {
      entry.spQsos = entry.inbandQsos + entry.searchQsos;
      if (entry.qsos) {
        entry.runPct = (entry.runQsos / entry.qsos) * 100;
        entry.inbandPct = (entry.inbandQsos / entry.qsos) * 100;
        entry.searchPct = (entry.searchQsos / entry.qsos) * 100;
        entry.spPct = (entry.spQsos / entry.qsos) * 100;
      }
      entry.modeBreakdown.sort((a, b) => {
        const ai = modeOrder.has(a.mode) ? modeOrder.get(a.mode) : 99;
        const bi = modeOrder.has(b.mode) ? modeOrder.get(b.mode) : 99;
        if (ai !== bi) return ai - bi;
        return String(a.mode || '').localeCompare(String(b.mode || ''));
      });
      entry.topRunFrequencies = exportOperatingStyleFrequencies(entry._runFreqs);
      delete entry._runFreqs;
      return entry;
    }).sort((a, b) => {
      const ai = bandOrderIndex(a.band);
      const bi = bandOrderIndex(b.band);
      if (ai !== bi) return ai - bi;
      return String(a.band || '').localeCompare(String(b.band || ''));
    });

    const totals = bands.reduce((acc, entry) => {
      acc.qsos += entry.qsos;
      acc.runQsos += entry.runQsos;
      acc.inbandQsos += entry.inbandQsos;
      acc.searchQsos += entry.searchQsos;
      return acc;
    }, {
      band: 'All',
      qsos: 0,
      runQsos: 0,
      inbandQsos: 0,
      searchQsos: 0,
      spQsos: 0,
      runPct: 0,
      inbandPct: 0,
      searchPct: 0,
      spPct: 0,
      topRunFrequencies: [],
      modeBreakdown: []
    });
    totals.spQsos = totals.inbandQsos + totals.searchQsos;
    if (totals.qsos) {
      totals.runPct = (totals.runQsos / totals.qsos) * 100;
      totals.inbandPct = (totals.inbandQsos / totals.qsos) * 100;
      totals.searchPct = (totals.searchQsos / totals.qsos) * 100;
      totals.spPct = (totals.spQsos / totals.qsos) * 100;
    }

    return {
      meta,
      analyzedQsoCount: totals.qsos,
      excludedQsoCount,
      bands,
      totals
    };
  }

  function gridToLatLon(grid) {
    if (!grid || grid.length < 4) return null;
    const g = grid.trim().toUpperCase();
    const A = 'A'.charCodeAt(0);
    const R = 'R'.charCodeAt(0);
    const X = 'X'.charCodeAt(0);
    const lonField = g.charCodeAt(0);
    const latField = g.charCodeAt(1);
    if (lonField < A || lonField > R || latField < A || latField > R) return null;
    const lonSquare = parseInt(g[2], 10);
    const latSquare = parseInt(g[3], 10);
    if (!Number.isFinite(lonSquare) || !Number.isFinite(latSquare)) return null;
    const lon = (lonField - A) * 20 - 180 + lonSquare * 2;
    const lat = (latField - A) * 10 - 90 + latSquare * 1;
    if (g.length >= 6) {
      const lonSub = g.charCodeAt(4);
      const latSub = g.charCodeAt(5);
      if (lonSub < A || lonSub > X || latSub < A || latSub > X) return null;
      const lonMin = (lonSub - A) * (5 / 60) + (2.5 / 60);
      const latMin = (latSub - A) * (2.5 / 60) + (1.25 / 60);
      return { lat: lat + latMin, lon: lon + lonMin };
    }
    return { lat: lat + 0.5, lon: lon + 1 };
  }

  function latLonToField(lat, lon) {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    const fieldLon = Math.floor((lon + 180) / 20);
    const fieldLat = Math.floor((lat + 90) / 10);
    if (fieldLon < 0 || fieldLon > 17 || fieldLat < 0 || fieldLat > 17) return null;
    const A = 'A'.charCodeAt(0);
    return String.fromCharCode(A + fieldLon) + String.fromCharCode(A + fieldLat);
  }

  function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function bearingDeg(lat1, lon1, lat2, lon2) {
    const toRad = (d) => (d * Math.PI) / 180;
    const toDeg = (r) => (r * 180) / Math.PI;
    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
    const brng = toDeg(Math.atan2(y, x));
    return (brng + 360) % 360;
  }

  function firstNonNull(...vals) {
    for (const v of vals) {
      if (v !== undefined && v !== null && v !== '') return v;
    }
    return null;
  }

  function parseZone(val) {
    const n = parseInt((val ?? '').toString().trim(), 10);
    return Number.isFinite(n) ? n : null;
  }

  function classifyCallStructure(call) {
    const m = String(call || '').match(/^([A-Z]+)(\d+)([A-Z]+)$/);
    if (!m) return 'other';
    const pre = m[1].length;
    const digits = m[2].length;
    const suf = m[3].length;
    return `${pre}x${suf}d${digits}`;
  }

  function parseOperatorsList(raw) {
    if (!raw) return [];
    const tokens = String(raw)
      .split(/[,;]+/)
      .flatMap((chunk) => chunk.split(/\s+/))
      .map((t) => t.trim())
      .filter(Boolean);
    const out = [];
    const seen = new Set();
    tokens.forEach((t) => {
      const norm = normalizeCall(t);
      if (!norm || seen.has(norm)) return;
      seen.add(norm);
      out.push(norm);
    });
    return out;
  }

  function deriveStationCallsign(qsos) {
    for (const q of qsos || []) {
      const r = q.raw || {};
      const call = firstNonNull(r.STATION_CALLSIGN, r.OPERATOR, q.op);
      const normalized = normalizeCall(call);
      if (normalized) return normalized;
    }
    return null;
  }

  function isMaidenheadGrid(token) {
    if (!token) return false;
    const t = token.trim().toUpperCase();
    return /^[A-R]{2}\d{2}([A-X]{2})?$/.test(t);
  }

  function normalizeLookupGrid(raw) {
    if (!raw) return null;
    const t = String(raw).trim().toUpperCase();
    if (!t) return null;
    if (t.length >= 6 && /^[A-R]{2}\d{2}[A-X]{2}/.test(t)) return t.slice(0, 6);
    if (t.length >= 4 && /^[A-R]{2}\d{2}/.test(t)) return t.slice(0, 4);
    return null;
  }

  function getCallsignGrid(call) {
    const key = normalizeCall(call);
    if (!key) return null;
    const cache = activeAnalysisEnv?.callsignGridCache;
    if (!(cache instanceof Map) || !cache.has(key)) return null;
    return cache.get(key) || null;
  }

  function deriveStation(qsos) {
    for (const q of qsos || []) {
      const r = q.raw || {};
      const grids = [
        r.MY_GRIDSQUARE,
        r.STATION_LOC,
        r.GRID,
        r['GRID-LOCATOR'],
        r['HQ-GRID-LOCATOR']
      ].filter((g) => g !== undefined && g !== null && g !== '');
      for (const g of grids) {
        const loc = gridToLatLon(g);
        if (loc) return { lat: loc.lat, lon: loc.lon, source: 'grid', value: g };
      }
      if (r.MY_LAT && r.MY_LON) {
        const lat = parseFloat(r.MY_LAT);
        const lon = parseFloat(r.MY_LON);
        if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon, source: 'latlon', value: `${lat},${lon}` };
      }
    }
    const stationCall = deriveStationCallsign(qsos);
    if (stationCall) {
      const lookupGrid = getCallsignGrid(stationCall);
      if (lookupGrid) {
        const loc = gridToLatLon(lookupGrid);
        if (loc) return { lat: loc.lat, lon: loc.lon, source: 'lookup', value: lookupGrid };
      }
      const prefix = lookupPrefix(stationCall);
      if (prefix && prefix.lat != null && prefix.lon != null) {
        return { lat: prefix.lat, lon: prefix.lon, source: 'cty', value: stationCall };
      }
    }
    return null;
  }

  function deriveRemoteLatLon(q, prefix) {
    if (q.grid) {
      const loc = gridToLatLon(q.grid);
      if (loc) return loc;
    }
    if (q.call) {
      const lookupGrid = getCallsignGrid(q.call);
      if (lookupGrid) {
        const loc = gridToLatLon(lookupGrid);
        if (loc) return loc;
      }
    }
    if (prefix && prefix.lat != null && prefix.lon != null) {
      return { lat: prefix.lat, lon: prefix.lon };
    }
    return null;
  }

  function makeDistanceSummary() {
    let count = 0;
    let sum = 0;
    let min = null;
    let max = null;
    const histogram = new Map();
    return {
      add(d, band) {
        if (!Number.isFinite(d)) return;
        count += 1;
        sum += d;
        if (min == null || d < min) min = d;
        if (max == null || d > max) max = d;
        const bucket = Math.floor(d / 1000) * 1000;
        if (!histogram.has(bucket)) histogram.set(bucket, { count: 0, bands: new Map() });
        const entry = histogram.get(bucket);
        entry.count += 1;
        if (band) entry.bands.set(band, (entry.bands.get(band) || 0) + 1);
      },
      export() {
        const buckets = Array.from(histogram.entries()).sort((a, b) => a[0] - b[0]).map(([start, data]) => ({
          range: `${start}-${start + 999}`,
          count: data.count,
          bands: data.bands
        }));
        return {
          count,
          avg: count ? sum / count : null,
          min,
          max,
          buckets
        };
      }
    };
  }

  function makeHeadingSummary() {
    const sectors = new Map();
    return {
      add(b, band) {
        if (!Number.isFinite(b)) return;
        const bucket = Math.floor(b / 10) * 10;
        if (!sectors.has(bucket)) {
          sectors.set(bucket, { count: 0, bands: new Map() });
        }
        const entry = sectors.get(bucket);
        entry.count += 1;
        if (band) entry.bands.set(band, (entry.bands.get(band) || 0) + 1);
      },
      export() {
        return Array.from(sectors.entries()).sort((a, b) => a[0] - b[0]).map(([start, data]) => ({
          sector: `${String(start).padStart(3, '0')} - ${String(start + 9).padStart(3, '0')}`,
          start,
          count: data.count,
          bands: data.bands
        }));
      }
    };
  }

  function parseDateTime(dateStr, timeStr) {
    const d = (dateStr || '').trim().replace(/\D/g, '');
    const t = (timeStr || '').trim().replace(/\D/g, '');
    if (d.length !== 8) return null;
    const year = parseInt(d.slice(0, 4), 10);
    const month = parseInt(d.slice(4, 6), 10) - 1;
    const day = parseInt(d.slice(6, 8), 10);
    let hh = 0;
    let mm = 0;
    let ss = 0;
    if (t.length >= 2) hh = parseInt(t.slice(0, 2), 10) || 0;
    if (t.length >= 4) mm = parseInt(t.slice(2, 4), 10) || 0;
    if (t.length >= 6) ss = parseInt(t.slice(4, 6), 10) || 0;
    const ts = Date.UTC(year, month, day, hh, mm, ss);
    return Number.isNaN(ts) ? null : ts;
  }

  function normalizeCabrilloMode(mode) {
    const m = normalizeMode(mode);
    if (m === 'RY' || m === 'RTTY') return 'RTTY';
    if (m === 'PH') return 'SSB';
    return m;
  }

  function isCallsignToken(token) {
    if (!token) return false;
    const t = token.trim().toUpperCase();
    if (isMaidenheadGrid(t)) return false;
    return /[A-Z]/.test(t) && /\d/.test(t);
  }

  function isLikelyRstToken(token) {
    if (!token) return false;
    const t = String(token).trim().toUpperCase();
    if (!t) return false;
    if (/^[1-5]\d{1,2}$/.test(t)) return true;
    if (/^(5NN|5NNN)$/.test(t)) return true;
    if (/^5NN[+-]?\d*$/.test(t)) return true;
    return false;
  }

  function parseCabrilloFreqToken(token) {
    const raw = (token || '').trim();
    if (!raw) return { freqMHz: null, band: '' };
    const upper = raw.toUpperCase();
    if (upper === 'LIGHT') return { freqMHz: null, band: 'LIGHT' };

    const ghzMatch = upper.match(/^(\d+(?:\.\d+)?)\s*G(?:HZ)?$/);
    if (ghzMatch) {
      const ghz = parseFloat(ghzMatch[1]);
      if (Number.isFinite(ghz)) {
        const mhz = ghz * 1000;
        const band = parseBandFromFreq(mhz) || `${ghzMatch[1]}G`.toUpperCase();
        return { freqMHz: mhz, band };
      }
    }

    const mhzMatch = upper.match(/^(\d+(?:\.\d+)?)\s*M(?:HZ)?$/);
    if (mhzMatch) {
      const mhz = parseFloat(mhzMatch[1]);
      if (Number.isFinite(mhz)) {
        const band = parseBandFromFreq(mhz) || normalizeBandToken(raw);
        return { freqMHz: mhz, band };
      }
    }

    if (/^\d+(\.\d+)?$/.test(upper)) {
      const bandToken = bandLabelFromNumberToken(upper);
      if (bandToken) return { freqMHz: null, band: bandToken };
      const num = parseFloat(upper);
      if (!Number.isFinite(num)) return { freqMHz: null, band: '' };
      const mhz = num >= 1000 ? num / 1000 : num;
      const band = parseBandFromFreq(mhz) || String(num).toUpperCase();
      return { freqMHz: mhz, band };
    }

    return { freqMHz: null, band: normalizeBandToken(raw) };
  }

  function normalizeCabrilloHeaderValue(value) {
    if (Array.isArray(value)) return value.join(' ');
    return value;
  }

  function shouldParseCabrilloTxId(header) {
    const tx = String(normalizeCabrilloHeaderValue(header?.['CATEGORY-TRANSMITTER'] || '') || '').toUpperCase();
    const op = String(normalizeCabrilloHeaderValue(header?.['CATEGORY-OPERATOR'] || '') || '').toUpperCase();
    if (tx && tx !== 'ONE' && tx !== 'SINGLE') return true;
    if (op.includes('MULTI')) return true;
    return false;
  }

  function parseCabrillo(text) {
    const lines = String(text || '').split(/\r?\n/);
    const header = {};
    const qsos = [];
    const parseQsoTokens = (tokens, isQtc) => {
      if (tokens.length < 8) return;
      const freqInfo = parseCabrilloFreqToken(tokens[0]);
      const freqMHz = freqInfo.freqMHz;
      const mode = normalizeCabrilloMode(tokens[1]);
      const date = tokens[2] || '';
      const time = tokens[3] || '';
      const myCall = tokens[4] || '';
      let txId = null;
      const working = tokens.slice();
      if (working.length >= 9 && /^\d$/.test(working[working.length - 1]) && shouldParseCabrilloTxId(header)) {
        txId = working.pop();
      }

      const isVhfGrid = working.length >= 8
        && isMaidenheadGrid(working[5])
        && isCallsignToken(working[6])
        && isMaidenheadGrid(working[7]);

      if (isVhfGrid) {
        const sentGrid = working[5] || '';
        const call = working[6] || '';
        const rcvdTokens = working.slice(7).map((t) => t.trim()).filter(Boolean);
        const exchSent = sentGrid;
        const exchRcvd = rcvdTokens.join(' ').trim();
        const rcvdGrid = rcvdTokens.find((t) => isMaidenheadGrid(t));
        qsos.push({
          QSO_DATE: date,
          TIME_ON: time,
          BAND: freqInfo.band || (freqMHz ? parseBandFromFreq(freqMHz) : ''),
          MODE: mode,
          CALL: call,
          FREQ: freqMHz,
          RST_SENT: '',
          RST_RCVD: '',
          STX_STRING: exchSent,
          SRX_STRING: exchRcvd,
          MY_GRIDSQUARE: sentGrid,
          GRIDSQUARE: rcvdGrid,
          OPERATOR: myCall,
          IS_QTC: isQtc,
          TX_ID: txId
        });
        return;
      }

      const hasLegacyNoSentExchange = working.length >= 8
        && isCallsignToken(working[5])
        && isLikelyRstToken(working[6])
        && isLikelyRstToken(working[7]);

      if (hasLegacyNoSentExchange) {
        const call = working[5] || '';
        const rstSent = working[6] || '';
        const rstRcvd = working[7] || '';
        const exchRcvd = working.slice(8).join(' ').trim();
        const rcvdTokens = working.slice(8).map((t) => t.trim()).filter(Boolean);
        const rcvdGrid = rcvdTokens.find((t) => isMaidenheadGrid(t));
        qsos.push({
          QSO_DATE: date,
          TIME_ON: time,
          BAND: freqInfo.band || (freqMHz ? parseBandFromFreq(freqMHz) : ''),
          MODE: mode,
          CALL: call,
          FREQ: freqMHz,
          RST_SENT: rstSent,
          RST_RCVD: rstRcvd,
          STX_STRING: '',
          SRX_STRING: exchRcvd,
          MY_GRIDSQUARE: '',
          GRIDSQUARE: rcvdGrid,
          OPERATOR: myCall,
          IS_QTC: isQtc,
          TX_ID: txId
        });
        return;
      }

      if (working.length < 9) return;
      const rstSent = working[5] || '';
      const rest = working.slice(6);
      let dxIndex = -1;
      for (let i = 0; i < rest.length; i += 1) {
        if (!isCallsignToken(rest[i])) continue;
        if (i + 1 < rest.length && isLikelyRstToken(rest[i + 1])) {
          dxIndex = i;
          break;
        }
        if (dxIndex === -1) dxIndex = i;
      }
      if (dxIndex === -1 || dxIndex + 1 >= rest.length) {
        dxIndex = Math.max(0, Math.min(1, rest.length - 2));
      }
      const exchSent = rest.slice(0, dxIndex).join(' ').trim();
      const call = rest[dxIndex] || '';
      const rstRcvd = rest[dxIndex + 1] || '';
      const exchRcvd = rest.slice(dxIndex + 2).join(' ').trim();
      const sentTokens = rest.slice(0, dxIndex).map((t) => t.trim()).filter(Boolean);
      const rcvdTokens = rest.slice(dxIndex + 2).map((t) => t.trim()).filter(Boolean);
      const sentGrid = sentTokens.find((t) => isMaidenheadGrid(t));
      const rcvdGrid = rcvdTokens.find((t) => isMaidenheadGrid(t));
      qsos.push({
        QSO_DATE: date,
        TIME_ON: time,
        BAND: freqInfo.band || (freqMHz ? parseBandFromFreq(freqMHz) : ''),
        MODE: mode,
        CALL: call,
        FREQ: freqMHz,
        RST_SENT: rstSent,
        RST_RCVD: rstRcvd,
        STX_STRING: exchSent,
        SRX_STRING: exchRcvd,
        MY_GRIDSQUARE: sentGrid,
        GRIDSQUARE: rcvdGrid,
        OPERATOR: myCall,
        IS_QTC: isQtc,
        TX_ID: txId
      });
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (/^QSO:/i.test(trimmed)) {
        parseQsoTokens(trimmed.replace(/^QSO:\s*/i, '').split(/\s+/), false);
      } else if (/^QTC:/i.test(trimmed)) {
        parseQsoTokens(trimmed.replace(/^QTC:\s*/i, '').split(/\s+/), true);
      } else {
        const idx = trimmed.indexOf(':');
        if (idx === -1) return;
        const key = trimmed.slice(0, idx).trim().toUpperCase();
        const value = trimmed.slice(idx + 1).trim();
        if (!key) return;
        if (header[key] == null) header[key] = value;
        else if (Array.isArray(header[key])) header[key].push(value);
        else header[key] = [header[key], value];
      }
    });

    return { header, qsos };
  }

  function parseAdif(text) {
    const records = [];
    const parts = String(text || '').split(/<eor>/i);
    for (const raw of parts) {
      const rec = {};
      let i = 0;
      while (i < raw.length) {
        const lt = raw.indexOf('<', i);
        if (lt === -1) break;
        const gt = raw.indexOf('>', lt);
        if (gt === -1) break;
        const header = raw.slice(lt + 1, gt);
        const [namePart, restPart] = header.split(':');
        const name = (namePart || '').trim().toUpperCase();
        const lenStr = (restPart || '').split(/[>:]/)[0];
        const len = parseInt(lenStr, 10);
        if (!name || !Number.isFinite(len) || len <= 0) {
          i = gt + 1;
          continue;
        }
        const value = raw.substr(gt + 1, len);
        rec[name] = value.trim();
        i = gt + 1 + len;
      }
      if (Object.keys(rec).length > 0) records.push(rec);
    }
    return records;
  }

  function parseCbf(text) {
    const lines = String(text || '').split(/\r?\n/).filter((l) => l.trim().length > 0 && !l.startsWith(';'));
    const qsos = [];
    for (const line of lines) {
      const cleaned = line.replace(/(\d),(?=\d)/g, '$1.');
      const parts = cleaned.split(/[\t;]+/).map((p) => p.trim());
      if (parts.length < 5) continue;
      const fields = parts.length >= 5 ? parts : line.split(',').map((p) => p.trim());
      const [date, time, call, bandOrFreq, mode, rstSent, rstRcvd, exchSent, exchRcvd, operator, grid, cqz, ituz] = fields;
      const freqInfo = parseCabrilloFreqToken(bandOrFreq);
      const band = freqInfo.band || normalizeBandToken(bandOrFreq);
      const freq = Number.isFinite(freqInfo.freqMHz) ? freqInfo.freqMHz : null;
      qsos.push({
        DATE: date,
        TIME: time,
        BAND: band,
        MODE: mode,
        CALL: call,
        FREQ: freq,
        RST_SENT: rstSent,
        RST_RCVD: rstRcvd,
        EXCH_SENT: exchSent,
        EXCH_RCVD: exchRcvd,
        OPERATOR: operator,
        GRIDSQUARE: grid,
        CQZ: cqz,
        ITUZ: ituz
      });
    }
    return qsos;
  }

  function parseLogFile(text, filename) {
    const lower = String(filename || '').toLowerCase();
    if (lower.endsWith('.log') || lower.endsWith('.cbr') || /START-OF-LOG:/i.test(text) || /^QSO:/im.test(text)) {
      const cab = parseCabrillo(text);
      const metaRaw = cab.header || {};
      const meta = {};
      Object.keys(metaRaw).forEach((key) => {
        meta[key] = normalizeCabrilloHeaderValue(metaRaw[key]);
      });
      const sharedRaw = {
        STATION_CALLSIGN: meta.CALLSIGN || meta.CALL || null,
        CONTEST: meta.CONTEST || null,
        CATEGORY_OPERATOR: meta['CATEGORY-OPERATOR'] || null,
        CATEGORY_ASSISTED: meta['CATEGORY-ASSISTED'] || null,
        CATEGORY_POWER: meta['CATEGORY-POWER'] || null,
        CATEGORY_BAND: meta['CATEGORY-BAND'] || null,
        CATEGORY_MODE: meta['CATEGORY-MODE'] || null,
        CATEGORY_TRANSMITTER: meta['CATEGORY-TRANSMITTER'] || null,
        CATEGORY_STATION: meta['CATEGORY-STATION'] || null,
        CLUB: meta.CLUB || null,
        SOFTWARE: meta['CREATED-BY'] || null,
        CLAIMED_SCORE: meta['CLAIMED-SCORE'] || meta['CLAIMED-SCORE:'] || null,
        OPERATORS: meta.OPERATORS || null,
        GRID: meta['GRID-LOCATOR'] || meta['HQ-GRID-LOCATOR'] || null,
        MY_GRIDSQUARE: meta['GRID-LOCATOR'] || meta['HQ-GRID-LOCATOR'] || null,
        LOCATION: meta.LOCATION || null
      };
      const qsos = cab.qsos.map((r, idx) => ({
        id: idx,
        qsoNumber: idx + 1,
        call: normalizeCall(r.CALL),
        band: normalizeBand(r.BAND, r.FREQ),
        mode: normalizeMode(r.MODE),
        freq: r.FREQ ? parseFloat(r.FREQ) : null,
        time: `${(r.QSO_DATE || '').trim()} ${(r.TIME_ON || '').trim()}`,
        ts: parseDateTime(r.QSO_DATE, r.TIME_ON),
        op: normalizeCall(r.OPERATOR || sharedRaw.STATION_CALLSIGN),
        grid: r.GRIDSQUARE,
        rstSent: r.RST_SENT,
        rstRcvd: r.RST_RCVD,
        exchSent: firstNonNull(r.STX_STRING, r.STX),
        exchRcvd: firstNonNull(r.SRX_STRING, r.SRX),
        points: parseInt(firstNonNull(r.POINTS), 10),
        srx: firstNonNull(r.SRX_STRING, r.SRX),
        stx: firstNonNull(r.STX_STRING, r.STX),
        isQtc: Boolean(r.IS_QTC),
        raw: Object.assign({}, sharedRaw, r)
      }));
      return { type: 'CABRILLO', qsos };
    }
    if (lower.endsWith('.adi') || lower.endsWith('.adif') || /<eoh>/i.test(text) || /<eor>/i.test(text)) {
      const adifRecords = parseAdif(text);
      const qsos = adifRecords.map((r, idx) => ({
        id: idx,
        qsoNumber: idx + 1,
        call: normalizeCall(r.CALL),
        band: normalizeBand(r.BAND, r.FREQ ? parseFloat(r.FREQ) : null),
        mode: normalizeMode(r.MODE),
        freq: r.FREQ ? parseFloat(r.FREQ) : null,
        time: `${(r.QSO_DATE || '').trim()} ${(r.TIME_ON || '').trim()}`,
        ts: parseDateTime(r.QSO_DATE, r.TIME_ON),
        op: normalizeCall(r.OPERATOR || r.STATION_CALLSIGN),
        grid: r.GRIDSQUARE,
        rstSent: r.RST_SENT,
        rstRcvd: r.RST_RCVD,
        exchSent: firstNonNull(r.STX_STRING, r.STX),
        exchRcvd: firstNonNull(r.SRX_STRING, r.SRX, r.APP_N1MM_EXCHANGE1),
        points: parseInt(firstNonNull(r.APP_N1MM_POINTS, r.QSO_PTS, r.QSO_POINTS, r.POINTS), 10),
        srx: firstNonNull(r.SRX_STRING, r.SRX),
        stx: firstNonNull(r.STX_STRING, r.STX),
        comment: r.COMMENT || r.NOTES,
        raw: r
      }));
      return { type: 'ADIF', qsos };
    }
    if (lower.endsWith('.cbf')) {
      const cbfRecords = parseCbf(text);
      const qsos = cbfRecords.map((r, idx) => ({
        id: idx,
        qsoNumber: idx + 1,
        call: normalizeCall(r.CALL),
        band: normalizeBand(r.BAND, null),
        mode: normalizeMode(r.MODE),
        freq: null,
        time: `${(r.DATE || '').trim()} ${(r.TIME || '').trim()}`,
        ts: parseDateTime(r.DATE, r.TIME),
        op: normalizeCall(r.OPERATOR || r.STATION_CALLSIGN),
        grid: r.GRIDSQUARE,
        rstSent: r.RST_SENT,
        rstRcvd: r.RST_RCVD,
        exchSent: firstNonNull(r.EXCH_SENT, r.STX),
        exchRcvd: firstNonNull(r.EXCH_RCVD, r.SRX),
        points: parseInt(firstNonNull(r.POINTS), 10),
        srx: firstNonNull(r.EXCH_RCVD, r.SRX),
        stx: firstNonNull(r.EXCH_SENT, r.STX),
        comment: r.COMMENT || r.NOTES,
        raw: r
      }));
      return { type: 'CBF', qsos };
    }
    const adifRecords = parseAdif(text);
    if (adifRecords.length) {
      const qsos = adifRecords.map((r, idx) => ({
        id: idx,
        qsoNumber: idx + 1,
        call: normalizeCall(r.CALL),
        band: normalizeBand(r.BAND, r.FREQ ? parseFloat(r.FREQ) : null),
        mode: normalizeMode(r.MODE),
        freq: r.FREQ ? parseFloat(r.FREQ) : null,
        time: `${(r.QSO_DATE || '').trim()} ${(r.TIME_ON || '').trim()}`,
        ts: parseDateTime(r.QSO_DATE, r.TIME_ON),
        op: normalizeCall(r.OPERATOR || r.STATION_CALLSIGN),
        rstSent: r.RST_SENT,
        rstRcvd: r.RST_RCVD,
        exchSent: firstNonNull(r.STX_STRING, r.STX),
        exchRcvd: firstNonNull(r.SRX_STRING, r.SRX, r.APP_N1MM_EXCHANGE1),
        points: parseInt(firstNonNull(r.APP_N1MM_POINTS, r.QSO_PTS, r.QSO_POINTS, r.POINTS), 10),
        raw: r
      }));
      return { type: 'ADIF', qsos };
    }
    return { type: 'unknown', qsos: [] };
  }

  function parseCtyDat(text) {
    if (!text || /<html|<body/i.test(text)) return [];
    const lines = String(text).split(/\r?\n/);
    const entries = [];
    const parseToken = (tok, base, isPrimary) => {
      const cleaned = tok.replace(/[:\s]+$/g, '');
      const m = cleaned.match(/^(=)?([^(\[\s]+)(?:\((\d+)\))?(?:\[(\d+)\])?$/);
      if (!m) return null;
      const [, exactMark, bodyRaw, cqOverride, ituOverride] = m;
      const body = bodyRaw.replace(/^\*+/, '');
      if (!body) return null;
      return {
        prefix: body.toUpperCase(),
        exact: exactMark === '=',
        primary: Boolean(isPrimary),
        country: base.country,
        cqZone: cqOverride ? parseInt(cqOverride, 10) : base.cqZone,
        ituZone: ituOverride ? parseInt(ituOverride, 10) : base.ituZone,
        continent: base.continent,
        lat: base.lat,
        lon: base.lon,
        tz: base.tz
      };
    };

    let buffer = '';
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      buffer += (buffer ? ' ' : '') + line;
      while (buffer.includes(';')) {
        const [entryChunk, restChunk] = buffer.split(/;\s*/, 2);
        buffer = restChunk || '';
        const entryLine = entryChunk.trim();
        if (!entryLine) continue;
        const fields = entryLine.split(':');
        if (fields.length < 8) continue;
        const [name, cqZone, ituZone, continent, lat, lon, tz, ...restFields] = fields;
        const prefixBlock = restFields.join(':').replace(/;+$/, '');
        const prefixes = prefixBlock.split(/[, \t]+/).filter(Boolean);
        const lonVal = parseFloat(lon);
        const base = {
          country: name,
          cqZone: parseInt(cqZone, 10) || null,
          ituZone: parseInt(ituZone, 10) || null,
          continent: (continent || '').trim() || null,
          lat: parseFloat(lat) || null,
          lon: Number.isFinite(lonVal) ? -lonVal : null,
          tz: parseFloat(tz) || null
        };
        let primarySet = false;
        for (const p of prefixes) {
          const parsed = parseToken(p.trim(), base, !primarySet);
          if (parsed) {
            entries.push(parsed);
            if (!primarySet) primarySet = true;
          }
        }
      }
    }

    const sorted = entries.sort((a, b) => {
      if (a.exact !== b.exact) return a.exact ? -1 : 1;
      return b.prefix.length - a.prefix.length;
    });
    if (sorted.length > 0) return sorted;

    const looseEntries = [];
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const firstColon = line.indexOf(':');
      if (firstColon === -1) continue;
      const countryFields = line.split(':');
      if (countryFields.length < 7) continue;
      const [name, cqZone, ituZone, continent, lat, lon, tz, restFields] = countryFields;
      const suffix = restFields ? restFields.split(/[;,]/) : [];
      const lonVal = parseFloat(lon);
      const base = {
        country: name,
        cqZone: parseInt(cqZone, 10) || null,
        ituZone: parseInt(ituZone, 10) || null,
        continent: (continent || '').trim() || null,
        lat: parseFloat(lat) || null,
        lon: Number.isFinite(lonVal) ? -lonVal : null,
        tz: parseFloat(tz) || null
      };
      let primarySet = false;
      for (const t of suffix) {
        const parsed = parseToken(t.trim(), base, !primarySet);
        if (parsed) {
          looseEntries.push(parsed);
          if (!primarySet) primarySet = true;
        }
      }
    }
    return looseEntries.sort((a, b) => {
      if (a.exact !== b.exact) return a.exact ? -1 : 1;
      return b.prefix.length - a.prefix.length;
    });
  }

  function baseCall(call) {
    if (!call) return '';
    const parts = call.split('/');
    if (parts.length === 1) return call;
    const suffix = parts[parts.length - 1];
    if (PORTABLE_CALL_SUFFIXES.has(suffix)) return parts[0];
    const cand = parts.reduce((best, p) => (p.length > best.length ? p : best), '');
    return cand || call;
  }

  function parseMasterDta(text) {
    let data = text;
    if (typeof text !== 'string') {
      try {
        data = new TextDecoder('utf-8').decode(text);
      } catch (e) {
        data = '';
      }
    }
    const set = new Set();
    const lines = String(data || '').split(/\r?\n/);
    for (const line of lines) {
      const cleaned = line.replace(/\0/g, '').trim();
      const call = normalizeCall(cleaned);
      if (call) {
        set.add(call);
        const base = baseCall(call);
        if (base) set.add(base);
      }
    }
    if (set.size < 1000) {
      let scan = data;
      if (typeof text !== 'string') {
        try {
          scan = new TextDecoder('latin1').decode(text);
        } catch (e) {
          scan = data;
        }
      }
      const re = /[A-Z0-9/]{3,12}/g;
      let m;
      while ((m = re.exec(scan)) !== null) {
        const token = m[0];
        if (!/^\w/.test(token)) continue;
        if (!/[0-9]/.test(token)) continue;
        const call = normalizeCall(token);
        if (call) {
          set.add(call);
          const base = baseCall(call);
          if (base) set.add(base);
        }
      }
    }
    return set;
  }

  function extractWpxPrefix(part) {
    if (!part) return '';
    const text = normalizeCall(part).replace(/[^A-Z0-9]/g, '');
    if (!text) return '';
    const lastDigitIndex = text.search(/\d(?!.*\d)/);
    if (lastDigitIndex >= 0) {
      if (lastDigitIndex === 0) {
        const leading = text.match(/^(\d+[A-Z]+)/);
        if (leading) return leading[1];
      }
      return text.slice(0, lastDigitIndex + 1);
    }
    const letters = text.replace(/[^A-Z]/g, '');
    if (!letters) return '';
    if (letters.length >= 2) return `${letters.slice(0, 2)}0`;
    return `${letters[0]}0`;
  }

  function wpxPrefix(call) {
    const norm = normalizeCall(call);
    if (!norm) return '';
    const parts = norm.split('/').filter(Boolean);
    const base = baseCall(norm) || norm;
    let candidate = '';
    let candidateHasDigit = false;
    for (const part of parts) {
      if (!part || part === base) continue;
      if (WPX_IGNORE_SUFFIXES.has(part)) continue;
      if (!/[A-Z]/.test(part)) continue;
      const hasDigit = /\d/.test(part);
      if (!candidate || (hasDigit && !candidateHasDigit)) {
        candidate = part;
        candidateHasDigit = hasDigit;
        if (candidateHasDigit) break;
      }
    }
    return extractWpxPrefix(candidate || base || parts[0] || norm);
  }

  function findPrefixEntry(key) {
    if (!activeAnalysisEnv?.ctyTable || !key) return null;
    for (const entry of activeAnalysisEnv.ctyTable) {
      if (entry.exact) {
        if (key === entry.prefix) return entry;
      } else if (key.startsWith(entry.prefix)) {
        return entry;
      }
    }
    return null;
  }

  function getUnitedStatesEntry() {
    if (!activeAnalysisEnv?.ctyTable) return null;
    return activeAnalysisEnv.ctyTable.find((entry) => !entry.exact && entry.country === 'United States' && entry.prefix === 'K') || null;
  }

  function isLikelyUsKg4Call(key) {
    if (!key) return false;
    const base = key.split('/')[0] || key;
    if (!KG4_US_CALL_RE.test(base)) return false;
    return !KG4_GITMO_RE.test(base);
  }

  function lookupPrefix(call) {
    if (!activeAnalysisEnv?.ctyTable || !call) return null;
    const key = normalizeCall(call);
    if (!key) return null;
    if (activeAnalysisEnv.prefixCache.has(key)) return activeAnalysisEnv.prefixCache.get(key);

    let found = findPrefixEntry(key);
    if (key.includes('/')) {
      const fullExact = Boolean(found && found.exact && found.prefix === key);
      if (!fullExact) {
        const parts = key.split('/').filter(Boolean);
        const suffix = parts[parts.length - 1] || '';
        if (SLASH_AREA_TOKEN_RE.test(suffix) && !PORTABLE_CALL_SUFFIXES.has(suffix)) {
          const suffixHit = findPrefixEntry(suffix);
          if (suffixHit) found = suffixHit;
        }
        const base = baseCall(key);
        const baseHit = base && base !== key ? findPrefixEntry(base) : null;
        if (baseHit && baseHit.exact) found = baseHit;
      }
    }

    if (found && found.country === 'Guantanamo Bay' && found.prefix === 'KG4' && isLikelyUsKg4Call(key)) {
      const usEntry = getUnitedStatesEntry();
      if (usEntry) found = usEntry;
    }

    if (activeAnalysisEnv.prefixCache.size > 10000) activeAnalysisEnv.prefixCache.clear();
    activeAnalysisEnv.prefixCache.set(key, found);
    return found;
  }

  function buildCountryPrefixMap() {
    if (activeAnalysisEnv?.countryPrefixMap instanceof Map) return activeAnalysisEnv.countryPrefixMap;
    const map = new Map();
    if (!activeAnalysisEnv?.ctyTable) return map;
    for (const entry of activeAnalysisEnv.ctyTable) {
      if (!entry.country || !entry.prefix || !entry.primary) continue;
      if (!map.has(entry.country)) map.set(entry.country, entry.prefix);
    }
    for (const entry of activeAnalysisEnv.ctyTable) {
      if (!entry.country || !entry.prefix) continue;
      if (map.has(entry.country)) continue;
      const current = map.get(entry.country);
      if (!current || entry.prefix.length < current.length) {
        map.set(entry.country, entry.prefix);
      }
    }
    if (activeAnalysisEnv) activeAnalysisEnv.countryPrefixMap = map;
    return map;
  }

  function normalizeContinent(code) {
    const raw = (code || '').trim().toUpperCase();
    if (!raw) return '';
    if (raw === 'NA' || raw === 'SA' || raw === 'EU' || raw === 'AF' || raw === 'AS' || raw === 'OC') return raw;
    const words = raw.replace(/[^A-Z]/g, ' ').split(/\s+/).filter(Boolean);
    if (raw.includes('AMERICA')) {
      if (raw.includes('SOUTH') || words.includes('S')) return 'SA';
      if (raw.includes('NORTH') || words.includes('N')) return 'NA';
      return 'NA';
    }
    if (raw.includes('EUROPE')) return 'EU';
    if (raw.includes('AFRICA')) return 'AF';
    if (raw.includes('ASIA')) return 'AS';
    if (raw.includes('OCEANIA') || raw.includes('AUSTRALIA')) return 'OC';
    const match = raw.match(/[A-Z]{2}/);
    return match ? match[0] : '';
  }

  function markDupes(qsos, analysisMode = ANALYSIS_MODE_CONTESTER) {
    const seen = new Map();
    const dupes = [];
    const isDxer = analysisMode === ANALYSIS_MODE_DXER;
    for (const q of qsos || []) {
      if (!q.call) {
        q.isDupe = false;
        continue;
      }
      const call = q.call;
      const band = q.band || '';
      const key = `${call}|${band}`;
      if (isDxer) {
        const lastTs = seen.get(key);
        if (Number.isFinite(q.ts) && Number.isFinite(lastTs) && (q.ts - lastTs) <= DUPE_WINDOW_MS && (q.ts - lastTs) >= 0) {
          q.isDupe = true;
          dupes.push(q);
        } else {
          q.isDupe = false;
        }
        if (Number.isFinite(q.ts)) seen.set(key, q.ts);
        continue;
      }
      const mode = q.mode || '';
      const strictKey = `${key}|${mode}`;
      if (seen.has(strictKey)) {
        q.isDupe = true;
        dupes.push(q);
      } else {
        q.isDupe = false;
        seen.set(strictKey, true);
      }
    }
    return dupes;
  }

  function deriveContestMeta(qsos) {
    const meta = {
      stationCallsign: null,
      contestId: null,
      category: null,
      categoryOperator: null,
      categoryMode: null,
      categoryBand: null,
      categoryPower: null,
      categoryTransmitter: null,
      categoryStation: null,
      claimedScore: null,
      club: null,
      software: null,
      operators: null
    };
    for (const q of qsos || []) {
      const r = q.raw || {};
      if (!meta.stationCallsign) meta.stationCallsign = firstNonNull(r.STATION_CALLSIGN, r.OPERATOR, q.op);
      if (!meta.contestId) meta.contestId = firstNonNull(r.CONTEST_ID, r.CONTEST_NAME, r.CONTEST);
      if (!meta.category) meta.category = firstNonNull(r.CATEGORY_OPERATOR, r.CATEGORY, r.CATEGORY_OVERLAY);
      if (!meta.categoryOperator) meta.categoryOperator = firstNonNull(r.CATEGORY_OPERATOR, r.CATEGORY);
      if (!meta.categoryMode) meta.categoryMode = firstNonNull(r.CATEGORY_MODE, r.MODE);
      if (!meta.categoryBand) meta.categoryBand = firstNonNull(r.CATEGORY_BAND, r.BAND);
      if (!meta.categoryPower) meta.categoryPower = firstNonNull(r.CATEGORY_POWER);
      if (!meta.categoryTransmitter) meta.categoryTransmitter = firstNonNull(r.CATEGORY_TRANSMITTER);
      if (!meta.categoryStation) meta.categoryStation = firstNonNull(r.CATEGORY_STATION);
      if (meta.claimedScore == null) meta.claimedScore = firstNonNull(r.CLAIMED_SCORE, r.CLAIMED, r.APP_N1MM_CLAIMED_SCORE);
      if (!meta.club) meta.club = firstNonNull(r.CLUB, r.APP_N1MM_CLUB);
      if (!meta.software) meta.software = firstNonNull(r.APP_N1MM_N1MMVERSION, r.SW_VERSION, r.SOFTWARE);
      if (!meta.operators) meta.operators = firstNonNull(r.OPERATORS);
      if (meta.stationCallsign && meta.contestId && meta.category) break;
    }
    return meta;
  }

  function normalizeContestKey(value) {
    return String(value || '').toUpperCase().replace(/[^A-Z0-9]+/g, '').trim();
  }

  function parseClaimedScoreNumber(value) {
    if (value == null || value === '') return null;
    const raw = String(value).trim();
    if (!raw) return null;
    const normalized = raw.replace(/,/g, '');
    const num = Number(normalized.replace(/[^\d.\-]/g, ''));
    if (!Number.isFinite(num)) return null;
    return Math.round(num);
  }

  function getArchiveFolderFromPath(path) {
    const raw = String(path || '').trim();
    if (!raw) return '';
    const clean = raw.replace(/^\/+|\/+$/g, '');
    if (!clean) return '';
    return (clean.split('/')[0] || '').trim();
  }

  function addScoringAlias(aliasMap, alias, ruleId, bias = 0) {
    const key = normalizeContestKey(alias);
    if (!key || !ruleId) return;
    const list = aliasMap.get(key) || [];
    list.push({ ruleId, score: key.length + bias });
    aliasMap.set(key, list);
  }

  function pickBestAliasCandidate(candidates) {
    if (!Array.isArray(candidates) || !candidates.length) return null;
    return candidates.slice().sort((a, b) => {
      if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
      return String(a.ruleId || '').localeCompare(String(b.ruleId || ''));
    })[0] || null;
  }

  function buildScoringIndexes(spec) {
    const byId = new Map();
    const byFolder = new Map();
    const aliasMap = new Map();
    const list = Array.isArray(spec?.rule_sets) ? spec.rule_sets : [];
    list.forEach((rule) => {
      if (!rule || !rule.id) return;
      byId.set(rule.id, rule);
      if (rule.archive_folder) {
        byFolder.set(normalizeContestKey(rule.archive_folder), rule.id);
      }
      addScoringAlias(aliasMap, rule.id, rule.id, 70);
      addScoringAlias(aliasMap, rule.archive_folder, rule.id, 80);
      addScoringAlias(aliasMap, rule.name, rule.id, 10);
      if (Array.isArray(rule.aliases)) {
        rule.aliases.forEach((alias) => addScoringAlias(aliasMap, alias, rule.id, 90));
      }
      const builtIn = SCORING_RULE_ALIASES[rule.id];
      if (Array.isArray(builtIn)) {
        builtIn.forEach((alias) => addScoringAlias(aliasMap, alias, rule.id, 100));
      }
      if (Array.isArray(rule?.subevents)) {
        rule.subevents.forEach((sub) => {
          if (!sub) return;
          addScoringAlias(aliasMap, sub.id, rule.id, 50);
          if (Array.isArray(sub.slug_patterns)) {
            sub.slug_patterns.forEach((pattern) => addScoringAlias(aliasMap, pattern, rule.id, 60));
          }
        });
      }
    });
    return { byId, byFolder, aliasMap };
  }

  function resolveRuleIdByContestName(contestIdRaw) {
    const key = normalizeContestKey(contestIdRaw);
    if (!key) return null;
    const aliasMap = activeAnalysisEnv?.scoringAliasMap instanceof Map ? activeAnalysisEnv.scoringAliasMap : new Map();
    if (aliasMap.has(key)) {
      const best = pickBestAliasCandidate(aliasMap.get(key));
      return best ? best.ruleId : null;
    }
    let winner = null;
    aliasMap.forEach((candidates, alias) => {
      if (!alias) return;
      if (!key.includes(alias) && !alias.includes(key)) return;
      const best = pickBestAliasCandidate(candidates);
      if (!best) return;
      const matchScore = (best.score || 0) + Math.min(alias.length, key.length);
      if (!winner || matchScore > winner.score) {
        winner = { ruleId: best.ruleId, score: matchScore };
      }
    });
    return winner ? winner.ruleId : null;
  }

  function getConfidenceLabel(rule) {
    const raw = String(rule?.confidence || '').trim().toLowerCase();
    if (raw === 'high') return 'high';
    if (raw.startsWith('medium')) return 'medium';
    if (raw === 'low') return 'low';
    return 'unknown';
  }

  function resolveArrlSubevent(rule, contestIdRaw) {
    if (!rule || !Array.isArray(rule.subevents)) return null;
    const key = normalizeContestKey(contestIdRaw);
    if (!key) return null;
    let winner = null;
    rule.subevents.forEach((sub) => {
      const patterns = Array.isArray(sub?.slug_patterns) ? sub.slug_patterns : [];
      patterns.forEach((pattern) => {
        const patternKey = normalizeContestKey(pattern);
        if (!patternKey) return;
        if (!key.includes(patternKey) && !patternKey.includes(key)) return;
        const score = patternKey.length;
        if (!winner || score > winner.score) {
          winner = { subevent: sub, score };
        }
      });
    });
    return winner ? winner.subevent : null;
  }

  function resolveEuVhfModel(rule, contestIdRaw) {
    const key = normalizeContestKey(contestIdRaw);
    if (!key || !Array.isArray(rule?.subevent_models)) return null;
    if (key.includes('ALPEADRIA')) return rule.subevent_models.find((m) => m.model_id === 'distance_times_multipliers') || null;
    if (key.includes('MICROWAVE') || key.includes('MARATON') || key.includes('SHF')) {
      return rule.subevent_models.find((m) => m.model_id === 'band_weighted_distance') || null;
    }
    if (key.includes('IARU') || key.includes('REGION1') || key.includes('VHF')) {
      return rule.subevent_models.find((m) => m.model_id === 'distance_only') || null;
    }
    return null;
  }

  function resolveContestRuleSet(contestMeta, context = {}) {
    const byId = activeAnalysisEnv?.scoringRuleMap;
    const byFolder = activeAnalysisEnv?.scoringRuleByFolder;
    if (!(byId instanceof Map) || byId.size === 0 || !(byFolder instanceof Map)) {
      const failed = activeAnalysisEnv?.scoringStatus === 'error';
      return {
        supported: false,
        reason: failed ? 'spec_error' : 'spec_unavailable',
        warning: failed
          ? 'Scoring rules failed to load. Showing logged points only if available.'
          : 'Scoring rules are still loading. Please retry in a moment.',
        assumptions: failed
          ? [activeAnalysisEnv?.scoringError ? `Scoring spec load error: ${activeAnalysisEnv.scoringError}` : 'Scoring spec load failed.']
          : ['Scoring spec file is not loaded in runtime yet.'],
        detectionMethod: 'none'
      };
    }
    const archivePath = context?.logFile?.path || context?.sourcePath || '';
    const folder = getArchiveFolderFromPath(archivePath);
    const contestRaw = String(contestMeta?.contestId || '').trim();
    const bundleHint = `${contestRaw} ${archivePath}`.trim();
    const folderKey = normalizeContestKey(folder);
    let ruleId = folderKey ? byFolder.get(folderKey) : null;
    let detectionMethod = ruleId ? 'archive_folder' : 'contest_id_alias';
    if (!ruleId) ruleId = resolveRuleIdByContestName(contestRaw);
    const rule = ruleId ? byId.get(ruleId) : null;
    if (!rule) {
      return {
        supported: false,
        reason: 'unknown_rule',
        warning: activeAnalysisEnv?.analysisMode === ANALYSIS_MODE_DXER ? SCORING_UNKNOWN_WARNING_DXER : SCORING_UNKNOWN_WARNING,
        assumptions: ['No matching scoring rule set found for this log.'],
        detectionMethod,
        detectionValue: contestRaw || folder || ''
      };
    }
    let bundle = null;
    const assumptions = [];
    if (rule.bundle === true && rule.id === 'arrl_family_bundle') {
      const subevent = resolveArrlSubevent(rule, bundleHint);
      if (subevent) {
        bundle = { type: 'arrl', subeventId: subevent.id, subevent };
      } else {
        assumptions.push('ARRL bundle matched but exact subevent slug was not detected.');
      }
    }
    if (rule.bundle === true && rule.id === 'eu_vhf_bundle') {
      const model = resolveEuVhfModel(rule, bundleHint);
      if (model) {
        bundle = { type: 'eu_vhf', subeventModelId: model.model_id, subeventModel: model };
      } else {
        assumptions.push('EU VHF bundle matched but subevent model could not be inferred from contest name.');
      }
    }
    return {
      supported: true,
      rule,
      ruleId: rule.id,
      confidence: getConfidenceLabel(rule),
      detectionMethod,
      detectionValue: detectionMethod === 'archive_folder' ? folder : contestRaw,
      assumptions,
      bundle
    };
  }

  function computeLoggedPointsTotal(qsos) {
    return (qsos || []).reduce((sum, q) => (Number.isFinite(q?.points) ? sum + q.points : sum), 0);
  }

  function normalizeCountryName(value) {
    return String(value || '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
  }

  function hasCountryToken(country, tokens) {
    const key = normalizeCountryName(country);
    if (!key) return false;
    return tokens.some((token) => key.includes(token));
  }

  function isCountryUs(country) {
    return hasCountryToken(country, ['UNITED STATES', 'USA', 'K ', 'W ']);
  }

  function isCountryVe(country) {
    return hasCountryToken(country, ['CANADA']);
  }

  function isCountryUsOrVe(country) {
    return isCountryUs(country) || isCountryVe(country);
  }

  function isCountryRu(country) {
    return hasCountryToken(country, ['RUSSIA', 'RUSSIAN FEDERATION']);
  }

  function isCountryFrench(country) {
    return hasCountryToken(country, ['FRANCE']);
  }

  function isCountryDl(country) {
    return hasCountryToken(country, ['GERMANY', 'FEDERAL REPUBLIC OF GERMANY']);
  }

  function isPortableStation(contestMeta, stationCall) {
    const cat = String(contestMeta?.categoryStation || '').toUpperCase();
    const call = String(stationCall || '').toUpperCase();
    if (cat.includes('PORTABLE')) return true;
    if (cat === 'MOBILE') return true;
    if (call.includes('/P') || call.includes('/M') || call.includes('/MM')) return true;
    return false;
  }

  function extractExchangeTokens(q) {
    const raw = firstNonNull(
      q?.exchRcvd,
      q?.srx,
      q?.raw?.SRX_STRING,
      q?.raw?.EXCH_RCVD,
      q?.raw?.STATE,
      q?.raw?.SECTION,
      q?.raw?.RDA,
      q?.raw?.DOK,
      q?.raw?.EXCHANGE
    );
    if (!raw) return [];
    return String(raw).toUpperCase().split(/[\s,;:/]+/).map((t) => t.trim()).filter(Boolean);
  }

  function extractWVeQth(tokens) {
    for (const token of tokens) {
      if (US_STATE_CODES.has(token)) return token;
      if (VE_AREA_CODES.has(token)) return token;
    }
    return '';
  }

  function extractDokToken(tokens) {
    return tokens.find((token) => /^[A-Z]{1,3}\d{1,3}$/.test(token)) || '';
  }

  function extractEuRegionToken(tokens) {
    return tokens.find((token) => /^[A-Z]{1,3}\d{1,3}$/.test(token)) || '';
  }

  function extractRdaToken(tokens) {
    return tokens.find((token) => /^[A-Z]{2}\d{2,3}$/.test(token)) || '';
  }

  function extractRccNumber(tokens) {
    return tokens.find((token) => /^\d{1,4}$/.test(token)) || '';
  }

  function extractSerialToken(tokens) {
    return tokens.find((token) => /^\d{1,4}$/.test(token)) || '';
  }

  function extractRefDepartmentToken(tokens) {
    return tokens.find((token) => /^\d{2}[A-Z]?$/.test(token)) || '';
  }

  function extractTeamCode(tokens) {
    return tokens.find((token) => /^[A-Z]{2}\d{1,2}$/.test(token)) || '';
  }

  function extractYearToken(tokens) {
    return tokens.find((token) => /^(19|20)\d{2}$/.test(token)) || '';
  }

  function extractRegionToken(tokens) {
    return tokens.find((token) => /^[A-Z]{2,4}$/.test(token)) || '';
  }

  function extractSentExchangeTokens(q) {
    const raw = firstNonNull(q?.exchSent, q?.stx, q?.raw?.STX_STRING, q?.raw?.EXCH_SENT);
    if (!raw) return [];
    return String(raw).toUpperCase().split(/[\s,;:/]+/).map((t) => t.trim()).filter(Boolean);
  }

  function modeKeyForScoring(mode) {
    const bucket = modeBucket(mode);
    if (bucket === 'CW') return 'CW';
    if (bucket === 'Phone') return 'SSB';
    return 'DIG';
  }

  function lookupBandCoefficient(map, bandNorm) {
    if (!map || typeof map !== 'object') return 1;
    const key = String(bandNorm || '').toLowerCase();
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      const val = Number(map[key]);
      return Number.isFinite(val) ? val : 1;
    }
    if (Object.prototype.hasOwnProperty.call(map, bandNorm)) {
      const val = Number(map[bandNorm]);
      return Number.isFinite(val) ? val : 1;
    }
    return 1;
  }

  function hfBandGroupKey(bandNorm) {
    const band = String(bandNorm || '').toUpperCase();
    if (band === '160M' || band === '80M' || band === '40M') return 'LOW';
    if (band === '20M' || band === '15M' || band === '10M') return 'HIGH';
    return band || 'OTHER';
  }

  function buildStationScoringProfile(qsos, contestMeta) {
    const stationCall = normalizeCall(contestMeta?.stationCallsign || deriveStationCallsign(qsos));
    const stationPrefix = stationCall ? lookupPrefix(stationCall) : null;
    const stationCountry = stationPrefix?.country || '';
    const stationContinent = normalizeContinent(stationPrefix?.continent || '');
    let stationSentEuRegion = '';
    let stationHasSentExchangeTokens = false;
    for (const q of (qsos || [])) {
      const sentTokens = extractSentExchangeTokens(q);
      if (!sentTokens.length) continue;
      stationHasSentExchangeTokens = true;
      const euRegion = extractEuRegionToken(sentTokens);
      if (euRegion) {
        stationSentEuRegion = euRegion;
        break;
      }
    }
    return {
      stationCall,
      stationPrefixToken: stationPrefix?.prefix || '',
      stationCountry,
      stationCountryKey: normalizeCountryName(stationCountry),
      stationContinent,
      stationCqZone: stationPrefix?.cqZone || null,
      stationItuZone: stationPrefix?.ituZone || null,
      stationIsEu: stationContinent === 'EU',
      stationIsNa: stationContinent === 'NA',
      stationIsRu: isCountryRu(stationCountry),
      stationIsFrench: isCountryFrench(stationCountry),
      stationIsDl: isCountryDl(stationCountry),
      stationIsWVe: isCountryUsOrVe(stationCountry),
      stationSentEuRegion,
      stationHasSentExchangeTokens,
      stationIsEuExchangeMember: Boolean(stationSentEuRegion),
      stationPortable: isPortableStation(contestMeta, stationCall)
    };
  }

  function makeScoringRuntime(station) {
    return {
      station,
      callContacts: new Map(),
      callBandModes: new Map(),
      zoneBandSeen: new Set(),
      rfSubjectSeen: new Set(),
      unknownWhen: new Set(),
      unknownMultiplier: new Set()
    };
  }

  function buildQsoScoringFacts(q, station, runtime) {
    const call = normalizeCall(q?.call);
    const prefix = call ? lookupPrefix(call) : null;
    const qCountry = q?.country || prefix?.country || '';
    const qCountryKey = normalizeCountryName(qCountry);
    const qContinent = normalizeContinent(q?.continent || prefix?.continent || '');
    const qCqZone = q?.cqZone != null ? q.cqZone : (prefix?.cqZone || null);
    const qItuZone = q?.ituZone != null ? q.ituZone : (prefix?.ituZone || null);
    const sameCountry = Boolean(station.stationCountryKey && qCountryKey && station.stationCountryKey === qCountryKey);
    const sameContinent = Boolean(station.stationContinent && qContinent && station.stationContinent === qContinent);
    const exchangeTokens = extractExchangeTokens(q);
    const exchangeSentTokens = extractSentExchangeTokens(q);
    const bandNorm = normalizeBandToken(q?.band);
    const modeKey = modeKeyForScoring(q?.mode);
    const bandModeKey = `${bandNorm}|${modeKey}`;
    const seenCount = runtime.callContacts.get(call) || 0;
    const seenBandModes = runtime.callBandModes.get(call) || new Set();
    const zoneBandKey = (qCqZone != null && bandNorm) ? `${bandNorm}|${qCqZone}` : '';
    const rfSubject = exchangeTokens[0] || '';
    const qPrefixToken = prefix?.prefix || '';
    const exchangeEuRegion = extractEuRegionToken(exchangeTokens);
    return {
      q,
      call,
      validQso: Boolean(call),
      qCountry,
      qCountryKey,
      qContinent,
      qCqZone,
      qItuZone,
      qIsEu: qContinent === 'EU',
      qIsNa: qContinent === 'NA',
      qIsRu: isCountryRu(qCountry),
      qIsFrench: isCountryFrench(qCountry),
      qIsDl: isCountryDl(qCountry),
      qIsWVe: isCountryUsOrVe(qCountry),
      sameCountry,
      sameContinent,
      differentContinent: Boolean(station.stationContinent && qContinent && station.stationContinent !== qContinent),
      differentCqZone: qCqZone != null && station.stationCqZone != null && Number(qCqZone) !== Number(station.stationCqZone),
      differentItuZone: qItuZone != null && station.stationItuZone != null && Number(qItuZone) !== Number(station.stationItuZone),
      exchangeTokens,
      exchangeSentTokens,
      hasExchangeTokens: exchangeTokens.length > 0,
      exchangePrimary: exchangeTokens[0] || '',
      exchangeSentPrimary: exchangeSentTokens[0] || '',
      exchangeWVeQth: extractWVeQth(exchangeTokens),
      exchangeDok: extractDokToken(exchangeTokens),
      exchangeEuRegion,
      qIsEuExchangeMember: Boolean(exchangeEuRegion),
      exchangeSerial: extractSerialToken(exchangeTokens),
      exchangeSentSerial: extractSerialToken(exchangeSentTokens),
      exchangeRefDepartment: extractRefDepartmentToken(exchangeTokens),
      exchangeRda: extractRdaToken(exchangeTokens),
      exchangeRccNumber: extractRccNumber(exchangeTokens),
      exchangeTeamCode: extractTeamCode(exchangeTokens),
      exchangeYear: extractYearToken(exchangeTokens),
      exchangeRegion: extractRegionToken(exchangeTokens),
      bandNorm,
      modeKey,
      bandModeKey,
      isQtc: Boolean(q?.isQtc),
      isSatellite: bandNorm === 'LIGHT' || normalizeMode(q?.mode).includes('SAT'),
      isMaritime: /\/MM/.test(call),
      qPortable: /\/P|\/M/.test(call),
      wpx: q?.wpxPrefix || wpxPrefix(call),
      samePrefix: Boolean(station.stationPrefixToken && qPrefixToken && station.stationPrefixToken === qPrefixToken),
      seenCount,
      isNewBandModeForCall: Boolean(call) && !seenBandModes.has(bandModeKey),
      isNewZoneOnBand: Boolean(zoneBandKey) && !runtime.zoneBandSeen.has(zoneBandKey),
      zoneBandKey,
      rfSubject,
      isNewRfSubject: Boolean(rfSubject) && !runtime.rfSubjectSeen.has(rfSubject),
      isRccMember: /RCC|RC\d{1,3}/.test(exchangeTokens.join(' ')),
      isRrtcTeam: /^[A-Z]{2}\d{1,2}$/.test(exchangeTokens[0] || '')
    };
  }

  function markScoringRuntime(facts, runtime) {
    if (!facts.call) return;
    runtime.callContacts.set(facts.call, facts.seenCount + 1);
    const set = runtime.callBandModes.get(facts.call) || new Set();
    set.add(facts.bandModeKey);
    runtime.callBandModes.set(facts.call, set);
    if (facts.zoneBandKey) runtime.zoneBandSeen.add(facts.zoneBandKey);
    if (facts.rfSubject) runtime.rfSubjectSeen.add(facts.rfSubject);
  }

  function evaluateScoringCondition(when, facts, runtime, assumptions) {
    const stationIsEuForExchangeRules = runtime.station.stationHasSentExchangeTokens
      ? runtime.station.stationIsEuExchangeMember
      : runtime.station.stationIsEu;
    const qIsEuForExchangeRules = facts.hasExchangeTokens ? facts.qIsEuExchangeMember : facts.qIsEu;
    switch (when) {
      case 'any_valid_qso':
      case 'valid_qso':
        return facts.validQso;
      case 'valid_qtc_sent_or_received':
        return facts.validQso && facts.isQtc;
      case 'same_country':
        return facts.sameCountry;
      case 'same_country_same_prefix':
        return facts.sameCountry && facts.samePrefix;
      case 'same_country_different_prefix_or_same_continent_different_country':
        return (facts.sameCountry && !facts.samePrefix) || (facts.sameContinent && !facts.sameCountry);
      case 'same_continent_different_country':
      case 'different_country_same_continent':
        return facts.sameContinent && !facts.sameCountry;
      case 'same_continent_different_itu_zone':
        return facts.sameContinent && !facts.sameCountry && facts.differentItuZone;
      case 'different_continent':
        return facts.differentContinent;
      case 'different_continent_and_zone':
        return facts.differentContinent && facts.differentCqZone;
      case 'non_eu_same_country':
        return !stationIsEuForExchangeRules && facts.sameCountry;
      case 'non_eu_other_country_same_continent':
        return !stationIsEuForExchangeRules && facts.sameContinent && !facts.sameCountry;
      case 'non_eu_other_continent':
        return !stationIsEuForExchangeRules && facts.differentContinent;
      case 'same_continent_non_member':
        return facts.sameContinent && !facts.sameCountry && !facts.isRccMember;
      case 'different_continent_non_member':
        return facts.differentContinent && !facts.isRccMember;
      case 'non_eu_to_eu':
        return !stationIsEuForExchangeRules && qIsEuForExchangeRules;
      case 'eu_to_eu_other_country':
      case 'eu_or_east_med_to_eu_or_east_med':
        return stationIsEuForExchangeRules && qIsEuForExchangeRules && !facts.sameCountry;
      case 'eu_to_own_country':
        return stationIsEuForExchangeRules && qIsEuForExchangeRules && facts.sameCountry;
      case 'eu_to_non_eu_same_continent':
        return stationIsEuForExchangeRules && !qIsEuForExchangeRules && facts.sameContinent;
      case 'eu_to_other_continent':
      case 'eu_or_east_med_to_other_continent':
        return stationIsEuForExchangeRules && facts.differentContinent;
      case 'ru_to_ru_same_continent':
        return runtime.station.stationIsRu && facts.qIsRu && facts.sameContinent;
      case 'ru_to_ru_other_continent':
        return runtime.station.stationIsRu && facts.qIsRu && facts.differentContinent;
      case 'ru_to_other_country_same_continent':
        return runtime.station.stationIsRu && !facts.qIsRu && facts.sameContinent;
      case 'ru_to_other_continent':
        return runtime.station.stationIsRu && facts.differentContinent;
      case 'non_ru_same_country':
        return !runtime.station.stationIsRu && facts.sameCountry;
      case 'non_ru_same_continent_other_country':
        return !runtime.station.stationIsRu && facts.sameContinent && !facts.sameCountry;
      case 'non_ru_other_continent':
        return !runtime.station.stationIsRu && facts.differentContinent;
      case 'non_ru_to_ru':
        return !runtime.station.stationIsRu && facts.qIsRu;
      case 'fixed_eu':
        return !runtime.station.stationPortable && runtime.station.stationIsEu;
      case 'fixed_outside_eu':
        return !runtime.station.stationPortable && !runtime.station.stationIsEu;
      case 'portable_eu':
        return runtime.station.stationPortable && runtime.station.stationIsEu;
      case 'portable_outside_eu':
        return runtime.station.stationPortable && !runtime.station.stationIsEu;
      case 'fixed_to_fixed':
        return !runtime.station.stationPortable && !facts.qPortable;
      case 'dl_station_working_dl':
        return runtime.station.stationIsDl && facts.qIsDl;
      case 'dl_station_working_europe_non_dl':
        return runtime.station.stationIsDl && facts.qIsEu && !facts.qIsDl;
      case 'dl_station_working_dx':
        return runtime.station.stationIsDl && !facts.qIsEu;
      case 'non_dl_station_any_valid_qso':
        return !runtime.station.stationIsDl && facts.validQso;
      case 'french_station_to_foreign_same_continent':
        return runtime.station.stationIsFrench && !facts.qIsFrench && facts.sameContinent;
      case 'french_station_to_foreign_other_continent':
        return runtime.station.stationIsFrench && !facts.qIsFrench && facts.differentContinent;
      case 'french_station_to_french_same_continent':
        return runtime.station.stationIsFrench && facts.qIsFrench && facts.sameContinent;
      case 'french_station_to_french_other_continent':
        return runtime.station.stationIsFrench && facts.qIsFrench && facts.differentContinent;
      case 'non_french_station_to_french_same_continent':
        return !runtime.station.stationIsFrench && facts.qIsFrench && facts.sameContinent;
      case 'non_french_station_to_french_other_continent':
        return !runtime.station.stationIsFrench && facts.qIsFrench && facts.differentContinent;
      case 'same_p150_country':
        return facts.sameCountry;
      case 'with_rcc_member_station':
        return facts.isRccMember;
      case 'with_rrtc_team_station':
        return facts.isRrtcTeam;
      case 'with_non_team_same_itu_zone':
        return !facts.isRrtcTeam && !facts.differentItuZone;
      case 'with_non_team_different_itu_zone':
        return !facts.isRrtcTeam && facts.differentItuZone;
      case 'special_station_ok5o':
        return facts.call === 'OK5O';
      case 'iss_rs0iss':
        return facts.call === 'RS0ISS';
      case 'maritime_mobile':
        return facts.isMaritime;
      case 'satellite_qso':
        return facts.isSatellite;
      case 'first_contact_with_callsign':
        return facts.seenCount === 0;
      case 'second_contact_with_callsign_new_band_or_mode':
        return facts.seenCount === 1 && facts.isNewBandModeForCall;
      case 'third_contact_with_callsign_new_band_or_mode':
        return facts.seenCount === 2 && facts.isNewBandModeForCall;
      case 'new_zone_on_band':
        return facts.isNewZoneOnBand;
      case 'new_rf_subject_once_contest':
        return facts.isNewRfSubject;
      case 'other_pairs':
        return facts.validQso;
      default:
        if (!runtime.unknownWhen.has(when)) {
          runtime.unknownWhen.add(when);
          assumptions.add(`Unhandled scoring condition: ${when}`);
        }
        return false;
    }
  }

  function pointsFromConditionRules(rules, facts, runtime, assumptions) {
    if (!Array.isArray(rules)) return null;
    for (const row of rules) {
      const points = Number(row?.points);
      if (!Number.isFinite(points)) continue;
      if (!evaluateScoringCondition(String(row?.when || ''), facts, runtime, assumptions)) continue;
      return points;
    }
    return null;
  }

  function resolveScoringDuplicatePolicy(rule) {
    const key = String(firstNonNull(rule?.duplicate_policy, rule?.qso_points?.duplicate_policy) || '').trim().toLowerCase();
    if (key === 'include_all_dupes' || key === 'include_dupes') return 'include_all_dupes';
    return 'exclude_all_dupes';
  }

  function resolveMultiplierCreditPolicy(rule) {
    if (rule?.multipliers?.credit_on_zero_point_valid_qso === true) return 'valid_qso_allow_zero_points';
    const key = String(rule?.multipliers?.credit_policy || '').trim().toLowerCase();
    if (key === 'valid_qso_allow_zero_points' || key === 'valid_qso_zero_points' || key === 'valid_qso_allow_zero_point') {
      return 'valid_qso_allow_zero_points';
    }
    return 'positive_points_non_dupe';
  }

  function resolveQsoPointValue(qsoPointsRule, facts, station, assumptions) {
    if (!qsoPointsRule) return Number.isFinite(facts.q?.points) ? facts.q.points : 0;
    if (typeof qsoPointsRule === 'number') return qsoPointsRule;
    if (Number.isFinite(Number(qsoPointsRule?.fixed))) return Number(qsoPointsRule.fixed);

    const matrices = Array.isArray(qsoPointsRule?.matrix) ? qsoPointsRule.matrix : [];
    for (const entry of matrices) {
      const when = Array.isArray(entry?.when) ? entry.when : [entry?.when];
      const passes = when.filter(Boolean).every((cond) => evaluateScoringCondition(cond, facts, { station }, assumptions));
      if (!passes) continue;
      const value = Number(entry?.points);
      if (Number.isFinite(value)) return value;
    }

    const byContinent = qsoPointsRule?.by_continent;
    if (byContinent && typeof byContinent === 'object') {
      const key = facts.qContinent || '';
      const value = Number(byContinent[key] ?? byContinent.default);
      if (Number.isFinite(value)) return value;
    }
    return Number.isFinite(facts.q?.points) ? facts.q.points : 0;
  }

  function computeRuleQsoPoints(rule, qsos, station, assumptions) {
    const runtime = makeScoringRuntime(station);
    const model = String(rule?.qso_points?.model || '').trim();
    const duplicatePolicy = resolveScoringDuplicatePolicy(rule);
    const scoreDuplicates = duplicatePolicy === 'include_all_dupes';
    const pointsByIndex = new Array((qsos || []).length).fill(0);
    const uniqueCalls = new Set();
    let qsoPointsTotal = 0;
    let weightedQsoPointsTotal = 0;
    let qsoCount = 0;
    let qtcCount = 0;
    let matrixBasePoints = 0;
    let newZoneBonus = 0;
    let newRegionBonus = 0;
    const modePoints = { CW: 0, SSB: 0, DIG: 0 };
    const bandPoints = {};
    const handledTableModels = new Set([
      'table_by_geography',
      'table_by_portable_status_and_geography',
      'table_by_station_region',
      'table_by_station_region_and_geography',
      'table_by_eu_membership_and_geography',
      'table_by_region_pairing',
      'table_by_country_prefix_continent',
      'table_by_ru_status_and_geography',
      'table_by_ru_non_ru',
      'table_by_station_type_and_itu_relation',
      'table_with_member_bonus'
    ]);
    (qsos || []).forEach((q, idx) => {
      const facts = buildQsoScoringFacts(q, station, runtime);
      const isDuplicate = Boolean(q?.isDupe);
      if (facts.call && (!isDuplicate || scoreDuplicates)) uniqueCalls.add(facts.call);
      if (isDuplicate && !scoreDuplicates) {
        pointsByIndex[idx] = 0;
        return;
      }
      let points = null;
      if (handledTableModels.has(model)) {
        points = pointsFromConditionRules(rule?.qso_points?.rules, facts, runtime, assumptions);
      } else if (model === 'table_by_geography_and_band_group') {
        const groups = rule?.qso_points?.band_groups || {};
        const isLowBand = ['160M', '80M', '40M'].includes(facts.bandNorm);
        const low = groups.low_bands_40_80_160 || groups.low_bands_40_80 || null;
        const high = groups.high_bands_10_15_20 || null;
        const table = isLowBand ? low : high;
        if (table) {
          if (facts.differentContinent) points = Number(table.different_continent);
          else if (facts.sameCountry) points = Number(table.same_country);
          else if (facts.sameContinent) {
            if (facts.qIsNa && station.stationIsNa && Number.isFinite(Number(table.na_intra_continent_exception))) {
              points = Number(table.na_intra_continent_exception);
            } else {
              points = Number(table.same_continent_different_country);
            }
          }
        }
      } else if (model === 'table_by_band_group') {
        const groups = rule?.qso_points?.band_groups || {};
        if (['160M', '80M', '40M'].includes(facts.bandNorm)) points = Number(groups['160_80_40']);
        else points = Number(groups['20_15_10']);
      } else if (model === 'by_mode') {
        const rows = Array.isArray(rule?.qso_points?.rules) ? rule.qso_points.rules : [];
        const key = normalizeMode(q?.mode);
        const row = rows.find((r) => normalizeMode(r?.mode) === key) || rows.find((r) => modeKeyForScoring(r?.mode) === facts.modeKey);
        points = Number(row?.points);
      } else if (model === 'fixed') {
        points = Number(rule?.qso_points?.rules?.[0]?.points);
      } else if (model === 'qso_and_qtc_units') {
        points = facts.validQso ? 1 : 0;
        if (facts.isQtc) qtcCount += 1;
      } else if (model === 'zone_matrix_plus_bonuses') {
        const base = facts.validQso ? (facts.differentContinent && facts.differentCqZone ? 2 : 1) : 0;
        points = base;
        matrixBasePoints += base;
        const bonuses = Array.isArray(rule?.qso_points?.bonuses) ? rule.qso_points.bonuses : [];
        bonuses.forEach((bonus) => {
          if (!evaluateScoringCondition(String(bonus?.when || ''), facts, runtime, assumptions)) return;
          const b = Number(bonus?.points);
          if (!Number.isFinite(b)) return;
          points += b;
          if (String(bonus.when) === 'new_zone_on_band') newZoneBonus += b;
          else newRegionBonus += b;
        });
      } else if (model === 'progressive_per_callsign_plus_geography_bonus') {
        const base = pointsFromConditionRules(rule?.qso_points?.rules, facts, runtime, assumptions);
        const modeCoefficients = rule?.qso_points?.mode_coefficients || {};
        const modeCoeff = Number(modeCoefficients[facts.modeKey] ?? 1);
        points = Number.isFinite(base) ? (base * modeCoeff) : null;
        const bonuses = Array.isArray(rule?.qso_points?.geography_bonus) ? rule.qso_points.geography_bonus : [];
        bonuses.forEach((row) => {
          if (!evaluateScoringCondition(String(row?.when || ''), facts, runtime, assumptions)) return;
          const b = Number(row?.bonus);
          if (!Number.isFinite(b)) return;
          points = (Number.isFinite(points) ? points : 0) + b;
        });
      } else if (model === 'base_points_with_band_and_mode_coefficients') {
        const base = pointsFromConditionRules(rule?.qso_points?.base_rules, facts, runtime, assumptions);
        const bandCoeff = lookupBandCoefficient(rule?.qso_points?.band_coefficients, facts.bandNorm);
        const modeCoeffs = rule?.qso_points?.mode_coefficients || {};
        const modeCoeff = Number(modeCoeffs[facts.modeKey] ?? 1);
        points = Number.isFinite(base) ? (base * bandCoeff * modeCoeff) : null;
      }
      if (!Number.isFinite(points)) {
        if (!model) assumptions.add('Missing qso_points.model, using logged points fallback.');
        else assumptions.add(`Scoring model fallback used for ${model}.`);
        points = Number.isFinite(q?.points) ? q.points : 0;
      }
      pointsByIndex[idx] = points;
      qsoPointsTotal += points;
      weightedQsoPointsTotal += points;
      if (!facts.isQtc && facts.validQso) qsoCount += 1;
      modePoints[facts.modeKey] = (modePoints[facts.modeKey] || 0) + points;
      const bandKey = facts.bandNorm || 'UNKNOWN';
      bandPoints[bandKey] = (bandPoints[bandKey] || 0) + points;
      markScoringRuntime(facts, runtime);
    });
    return {
      pointsByIndex,
      qsoPointsTotal,
      weightedQsoPointsTotal,
      qsoCount,
      qtcCount,
      modePoints,
      uniqueCallCount: uniqueCalls.size,
      matrixBasePoints,
      newZoneBonus,
      newRegionBonus
      ,
      bandPoints
    };
  }

  function getMultiplierValue(group, facts, station, runtime, assumptions) {
    switch (group) {
      case 'country':
      case 'country_for_ru_entries':
      case 'dxcc_country':
      case 'dxcc_entities_for_french_entries':
      case 'dl_station_uses_country_entities':
      case 'wae_country_or_dxcc_set_by_station_region':
        return facts.qCountryKey || '';
      case 'cq_zone':
        return facts.qCqZone != null ? String(facts.qCqZone) : '';
      case 'cq_zone_except_own':
        if (facts.qCqZone == null || station.stationCqZone == null) return '';
        return Number(facts.qCqZone) === Number(station.stationCqZone) ? '' : String(facts.qCqZone);
      case 'itu_zone':
        return facts.qItuZone != null ? String(facts.qItuZone) : '';
      case 'itu_zone_plus_locator_sector': {
        const grid = String(facts.q?.grid || '').slice(0, 2).toUpperCase();
        return facts.qItuZone != null ? `${facts.qItuZone}|${grid}` : '';
      }
      case 'w_ve_qth':
      case 'us_states_dc':
      case 've_provinces_areas':
        return facts.exchangeWVeQth || '';
      case 'wpx_prefix':
        return facts.wpx || '';
      case 'prefix_within_zone':
        return (facts.wpx && facts.qCqZone != null) ? `${facts.wpx}|${facts.qCqZone}` : '';
      case 'ok_district':
      case 'om_district':
      case 'non_dl_station_uses_dok_districts':
        return facts.exchangeDok || '';
      case 'rda_district':
      case 'russian_oblast':
        return facts.exchangeRda || '';
      case 'rcc_number':
        return facts.exchangeRccNumber || '';
      case 'rrtc_team_code':
        return facts.exchangeTeamCode || '';
      case 'special_station_abbreviation':
      case 'departments_and_special_prefixes':
        return facts.exchangeRefDepartment || facts.exchangeRegion || facts.exchangePrimary || '';
      case 'eu_region_code':
        return facts.exchangeEuRegion || '';
      case 'unique_year_number_exchange':
        return facts.exchangeYear || facts.exchangeSerial || facts.exchangeSentSerial || '';
      case 'unique_callsign':
        return facts.call || '';
      default:
        if (!runtime.unknownMultiplier.has(group)) {
          runtime.unknownMultiplier.add(group);
          assumptions.add(`Unhandled multiplier group: ${group}`);
        }
        return '';
    }
  }

  function computeRuleMultipliers(rule, qsos, station, pointState, assumptions) {
    const model = String(rule?.multipliers?.model || '');
    const configuredGroups = Array.isArray(rule?.multipliers?.groups) ? rule.multipliers.groups : [];
    const configuredScope = String(rule?.multipliers?.counting_scope || 'once_total');
    const multiplierCreditPolicy = resolveMultiplierCreditPolicy(rule);
    const bandWeights = rule?.multipliers?.band_weights || {};
    let effectiveGroups = configuredGroups.slice();
    let effectiveScope = configuredScope;

    if (model === 'station_dependent_group') {
      if (rule?.id === 'darc_wag') {
        effectiveGroups = [station.stationIsDl ? 'dl_station_uses_country_entities' : 'non_dl_station_uses_dok_districts'];
        if (!station.stationIsDl) {
          effectiveScope = 'once_total';
          assumptions.add('Applied non-DL WAG multiplier scope override: once_total.');
        }
      } else if (rule?.id === 'ref') {
        effectiveGroups = station.stationIsFrench
          ? ['departments_and_special_prefixes', 'dxcc_entities_for_french_entries']
          : ['departments_and_special_prefixes'];
      }
    }
    if (rule?.id === 'darc_fieldday') {
      effectiveScope = 'per_hf_band_group';
      assumptions.add('Applied DARC Fieldday multiplier scope override: high/low HF band groups.');
    }

    const runtime = makeScoringRuntime(station);
    const perGroup = new Map();
    const groupCounts = {};
    const bandMultiplierCounts = {};
    let weightedTotal = 0;
    const modeMultiplierSets = { CW: new Set(), SSB: new Set(), DIG: new Set() };

    (qsos || []).forEach((q, idx) => {
      const facts = buildQsoScoringFacts(q, station, runtime);
      const pointValue = Number(pointState?.pointsByIndex?.[idx]);
      const eligible = multiplierCreditPolicy === 'valid_qso_allow_zero_points'
        ? (!q?.isDupe && facts.validQso && (!Number.isFinite(pointValue) || pointValue >= 0))
        : (!q?.isDupe && Number.isFinite(pointValue) && pointValue > 0);
      if (!eligible) {
        markScoringRuntime(facts, runtime);
        return;
      }
      effectiveGroups.forEach((group) => {
        const value = getMultiplierValue(group, facts, station, runtime, assumptions);
        if (!value) return;
        let scopeKey = 'ALL';
        if (effectiveScope === 'per_mode') scopeKey = facts.modeKey || 'UNKNOWN';
        if (effectiveScope === 'per_band') scopeKey = facts.bandNorm || 'UNKNOWN';
        if (effectiveScope === 'per_band_per_mode') scopeKey = `${facts.bandNorm || 'UNKNOWN'}|${facts.modeKey}`;
        if (effectiveScope === 'per_hf_band_group') scopeKey = hfBandGroupKey(facts.bandNorm);
        const uniqueKey = `${scopeKey}|${value}`;
        const set = perGroup.get(group) || new Set();
        if (set.has(uniqueKey)) return;
        set.add(uniqueKey);
        perGroup.set(group, set);
        groupCounts[group] = (groupCounts[group] || 0) + 1;
        if (effectiveScope === 'per_band' || effectiveScope === 'per_hf_band_group') {
          bandMultiplierCounts[scopeKey] = (bandMultiplierCounts[scopeKey] || 0) + 1;
        }
        modeMultiplierSets[facts.modeKey].add(uniqueKey);
        if (model === 'weighted_mults' && effectiveScope === 'per_band') {
          const w = lookupBandCoefficient(bandWeights, facts.bandNorm);
          weightedTotal += Number.isFinite(w) ? w : 1;
        }
      });
      markScoringRuntime(facts, runtime);
    });

    const total = Object.values(groupCounts).reduce((acc, n) => acc + (Number(n) || 0), 0);
    let multiplierTotal = total;
    if (model === 'single_group') multiplierTotal = Number(groupCounts[effectiveGroups[0]] || 0);
    if (model === 'none_multiplicative') multiplierTotal = 0;
    if (model === 'weighted_mults') multiplierTotal = weightedTotal > 0 ? weightedTotal : total;

    return {
      groupCounts,
      total: multiplierTotal,
      weightedTotal: weightedTotal > 0 ? weightedTotal : multiplierTotal,
      bandMultiplierCounts,
      modeCounts: {
        CW: modeMultiplierSets.CW.size,
        SSB: modeMultiplierSets.SSB.size,
        DIG: modeMultiplierSets.DIG.size
      }
    };
  }

  function evalNumericExpression(expression, vars) {
    const safe = String(expression || '').replace(/[^A-Za-z0-9_+\-*/().\s]/g, ' ');
    const replaced = safe.replace(/\b[A-Za-z_][A-Za-z0-9_]*\b/g, (name) => {
      const val = Number(vars[name]);
      return Number.isFinite(val) ? String(val) : '0';
    });
    try {
      const out = Function(`"use strict"; return (${replaced});`)();
      return Number.isFinite(out) ? Math.round(out) : null;
    } catch (err) {
      return null;
    }
  }

  function evaluateRuleFormula(rule, pointState, multState, station, assumptions) {
    const vars = {
      qso_points_total: pointState.qsoPointsTotal || 0,
      weighted_qso_points_total: pointState.weightedQsoPointsTotal || pointState.qsoPointsTotal || 0,
      qso_count: pointState.qsoCount || 0,
      qtc_count: pointState.qtcCount || 0,
      cw_points: pointState.modePoints?.CW || 0,
      ssb_points: pointState.modePoints?.SSB || 0,
      multipliers_total: multState.total || 0,
      weighted_multiplier_sum: multState.weightedTotal || multState.total || 0,
      cq_zone_mults: multState.groupCounts?.cq_zone || 0,
      country_mults:
        (multState.groupCounts?.country || 0)
        + (multState.groupCounts?.dxcc_country || 0)
        + (multState.groupCounts?.country_for_ru_entries || 0),
      w_ve_qth_mults:
        (multState.groupCounts?.w_ve_qth || 0)
        + (multState.groupCounts?.us_states_dc || 0)
        + (multState.groupCounts?.ve_provinces_areas || 0),
      wpx_prefix_mults: multState.groupCounts?.wpx_prefix || 0,
      eu_region_mults: multState.groupCounts?.eu_region_code || 0,
      oblast_mults: multState.groupCounts?.russian_oblast || 0,
      rda_mults: multState.groupCounts?.rda_district || 0,
      cw_mults: multState.modeCounts?.CW || 0,
      ssb_mults: multState.modeCounts?.SSB || 0,
      unique_callsigns: multState.groupCounts?.unique_callsign || pointState.uniqueCallCount || 0,
      section_mults:
        (multState.groupCounts?.us_states_dc || 0)
        + (multState.groupCounts?.ve_provinces_areas || 0)
        + (multState.groupCounts?.w_ve_qth || 0),
      matrix_base_points: pointState.matrixBasePoints || 0,
      new_zone_bonus: pointState.newZoneBonus || 0,
      new_region_bonus: pointState.newRegionBonus || 0
    };
    if (String(rule?.id || '') === 'euhfc') {
      const bandPoints = pointState?.bandPoints || {};
      const bandMults = multState?.bandMultiplierCounts || {};
      const bands = new Set([...Object.keys(bandPoints), ...Object.keys(bandMults)]);
      let bandwiseScore = 0;
      bands.forEach((band) => {
        const pts = Number(bandPoints[band] || 0);
        const mults = Number(bandMults[band] || 0);
        if (!Number.isFinite(pts) || !Number.isFinite(mults) || pts <= 0 || mults <= 0) return;
        bandwiseScore += (pts * mults);
      });
      if (bandwiseScore > 0) {
        assumptions.add('Applied EUHFC band-wise score formula override.');
        return Math.round(bandwiseScore);
      }
    }
    const formulaRaw = String(rule?.formula || '').trim();
    if (!formulaRaw) {
      if (String(rule?.multipliers?.model || '') === 'none_multiplicative') {
        return (vars.matrix_base_points + vars.new_zone_bonus + vars.new_region_bonus);
      }
      if (vars.multipliers_total > 0) return vars.qso_points_total * vars.multipliers_total;
      return vars.qso_points_total;
    }
    let expression = formulaRaw;
    if (formulaRaw.includes(';')) {
      const parts = formulaRaw.split(';').map((p) => p.trim()).filter(Boolean);
      const selected = station.stationIsRu
        ? (parts.find((p) => p.toLowerCase().includes('ru_score')) || parts[parts.length - 1])
        : (parts.find((p) => p.toLowerCase().includes('non_ru_score')) || parts[0]);
      expression = selected || formulaRaw;
    }
    if (expression.includes('=')) expression = expression.split('=').slice(1).join('=').trim();
    const score = evalNumericExpression(expression, vars);
    if (score == null) {
      assumptions.add(`Formula evaluation fallback used: ${formulaRaw}`);
      if (vars.multipliers_total > 0) return vars.qso_points_total * vars.multipliers_total;
      return vars.qso_points_total;
    }
    return score;
  }

  function scoreFromRule(rule, qsos, contestMeta, assumptions) {
    const station = buildStationScoringProfile(qsos, contestMeta);
    const pointState = computeRuleQsoPoints(rule, qsos, station, assumptions);
    const multState = computeRuleMultipliers(rule, qsos, station, pointState, assumptions);
    const computedScore = evaluateRuleFormula(rule, pointState, multState, station, assumptions);
    if (String(rule?.id || '') === 'wae') {
      const claimed = parseClaimedScoreNumber(contestMeta?.claimedScore);
      if (Number.isFinite(claimed) && claimed > 0 && Number(pointState?.qtcCount || 0) === 0 && computedScore < (claimed * 0.8)) {
        assumptions.add('No QTC records found in this WAE log; claimed score may include QTC traffic omitted from the archive file.');
      }
    }
    return { station, pointState, multState, computedScore };
  }

  function arlVhfBandFactor(bandNorm) {
    switch (String(bandNorm || '').toUpperCase()) {
      case '6M':
      case '2M':
        return 1;
      case '1.25M':
      case '70CM':
        return 2;
      case '33CM':
      case '23CM':
        return 4;
      default:
        return 8;
    }
  }

  function euVhfBandFactor(bandNorm) {
    switch (String(bandNorm || '').toUpperCase()) {
      case '6M':
      case '4M':
      case '2M':
        return 1;
      case '1.25M':
      case '70CM':
        return 2;
      case '33CM':
      case '23CM':
        return 3;
      default:
        return 4;
    }
  }

  function firstGrid4FromFacts(facts) {
    const direct = String(facts?.q?.grid || '').toUpperCase();
    if (/^[A-R]{2}\d{2}/.test(direct)) return direct.slice(0, 4);
    for (const token of (facts?.exchangeTokens || [])) {
      if (/^[A-R]{2}\d{2}/.test(token)) return token.slice(0, 4);
    }
    return '';
  }

  function scoreArrlBundle(resolved, qsos, contestMeta, assumptions) {
    const subeventId = String(resolved?.bundle?.subeventId || '');
    const station = buildStationScoringProfile(qsos, contestMeta);
    const runtime = makeScoringRuntime(station);
    const duplicatePolicy = resolveScoringDuplicatePolicy(resolved?.rule);
    const scoreDuplicates = duplicatePolicy === 'include_all_dupes';
    const pointsByIndex = new Array((qsos || []).length).fill(0);
    const multOnce = new Set();
    const multPerBand = new Set();
    const multPerMode = { CW: new Set(), SSB: new Set(), DIG: new Set() };
    const uniqueCalls = new Set();
    let qsoPointsTotal = 0;
    let multiplierTotal = 0;

    (qsos || []).forEach((q, idx) => {
      const facts = buildQsoScoringFacts(q, station, runtime);
      if (q?.isDupe && !scoreDuplicates) return;
      if (!facts.validQso) {
        markScoringRuntime(facts, runtime);
        return;
      }
      uniqueCalls.add(facts.call);
      const distance = Number(q?.distance);
      let points = 0;
      if (subeventId === 'arrl_dx') {
        points = 3;
        const multVal = station.stationIsWVe ? facts.qCountryKey : (facts.exchangeWVeQth || facts.qCountryKey);
        if (multVal) multPerBand.add(`${facts.bandNorm}|${multVal}`);
      } else if (subeventId === 'arrl_sweepstakes') {
        points = 2;
        const multVal = facts.exchangeWVeQth || facts.exchangeRegion;
        if (multVal) multOnce.add(multVal);
      } else if (subeventId === 'arrl_10m') {
        points = facts.modeKey === 'CW' ? 4 : 2;
        const baseVals = [facts.exchangeWVeQth, facts.qCountryKey, facts.qItuZone != null ? String(facts.qItuZone) : ''].filter(Boolean);
        baseVals.forEach((value) => multPerMode[facts.modeKey].add(value));
      } else if (subeventId === 'arrl_160m') {
        points = (station.stationIsWVe && facts.qIsWVe) ? 2 : 5;
        const multVal = station.stationIsWVe ? (facts.exchangeWVeQth || facts.qCountryKey) : (facts.exchangeWVeQth || '');
        if (multVal) multOnce.add(multVal);
      } else if (subeventId === 'arrl_rtty_roundup') {
        points = 1;
        const multVal = facts.exchangeWVeQth || facts.qCountryKey;
        if (multVal) multOnce.add(multVal);
      } else if (subeventId === 'arrl_intl_digital') {
        const bonus = Number.isFinite(distance) ? Math.max(1, Math.ceil(distance / 500)) : 1;
        points = 1 + bonus;
      } else if (subeventId === 'arrl_vhf_jan_jun_sep') {
        points = arlVhfBandFactor(facts.bandNorm);
        const grid4 = firstGrid4FromFacts(facts);
        if (grid4) multPerBand.add(`${facts.bandNorm}|${grid4}`);
      } else if (subeventId === 'arrl_222_up_distance') {
        points = Number.isFinite(distance) ? Math.round(distance * arlVhfBandFactor(facts.bandNorm)) : 0;
      } else if (subeventId === 'arrl_10ghz_up') {
        points = Number.isFinite(distance) ? Math.round(distance * arlVhfBandFactor(facts.bandNorm)) : 0;
      } else if (subeventId === 'arrl_eme') {
        points = 100;
        const grid4 = firstGrid4FromFacts(facts);
        if (grid4) multPerBand.add(`${facts.bandNorm}|${grid4}`);
      } else {
        points = Number.isFinite(q?.points) ? q.points : 0;
        assumptions.add('ARRL subevent fallback to logged points because subevent pattern was not matched.');
      }
      pointsByIndex[idx] = points;
      qsoPointsTotal += points;
      markScoringRuntime(facts, runtime);
    });

    if (subeventId === 'arrl_dx') multiplierTotal = multPerBand.size;
    else if (subeventId === 'arrl_10m') multiplierTotal = multPerMode.CW.size + multPerMode.SSB.size + multPerMode.DIG.size;
    else if (subeventId === 'arrl_vhf_jan_jun_sep' || subeventId === 'arrl_eme') multiplierTotal = multPerBand.size;
    else multiplierTotal = multOnce.size;

    let computedScore = null;
    if (subeventId === 'arrl_intl_digital' || subeventId === 'arrl_222_up_distance') {
      computedScore = qsoPointsTotal;
    } else if (subeventId === 'arrl_10ghz_up') {
      computedScore = qsoPointsTotal + (uniqueCalls.size * 100);
      assumptions.add('ARRL 10 GHz bonus uses heuristic +100 per unique call.');
    } else if (multiplierTotal > 0) {
      computedScore = qsoPointsTotal * multiplierTotal;
    } else {
      computedScore = qsoPointsTotal;
    }

    assumptions.add('ARRL bundle scorer uses heuristic interpretation from bundled rules metadata.');
    return { qsoPointsTotal, multiplierTotal, computedScore, pointsByIndex };
  }

  function scoreEuVhfBundle(resolved, qsos, contestMeta, assumptions) {
    const modelId = String(resolved?.bundle?.subeventModelId || '');
    const station = buildStationScoringProfile(qsos, contestMeta);
    const runtime = makeScoringRuntime(station);
    const duplicatePolicy = resolveScoringDuplicatePolicy(resolved?.rule);
    const scoreDuplicates = duplicatePolicy === 'include_all_dupes';
    const pointsByIndex = new Array((qsos || []).length).fill(0);
    const multPerBand = new Set();
    let qsoPointsTotal = 0;

    (qsos || []).forEach((q, idx) => {
      const facts = buildQsoScoringFacts(q, station, runtime);
      if (q?.isDupe && !scoreDuplicates) return;
      const distance = Number(q?.distance);
      let points = 0;
      if (modelId === 'distance_only') {
        points = Number.isFinite(distance) ? Math.max(0, Math.round(distance)) : 0;
      } else if (modelId === 'distance_times_multipliers') {
        points = Number.isFinite(distance) ? Math.max(1, Math.round(distance)) : 1;
        const grid4 = firstGrid4FromFacts(facts);
        if (grid4) multPerBand.add(`${facts.bandNorm}|${grid4}`);
      } else if (modelId === 'band_weighted_distance') {
        points = Number.isFinite(distance) ? Math.max(0, Math.round(distance * euVhfBandFactor(facts.bandNorm))) : 0;
      } else {
        points = Number.isFinite(q?.points) ? q.points : 0;
        assumptions.add('EU VHF bundle fallback to logged points because no subevent model matched.');
      }
      pointsByIndex[idx] = points;
      qsoPointsTotal += points;
      markScoringRuntime(facts, runtime);
    });

    const multiplierTotal = multPerBand.size;
    let computedScore = qsoPointsTotal;
    if (modelId === 'distance_times_multipliers') {
      computedScore = multiplierTotal > 0 ? (qsoPointsTotal * multiplierTotal) : qsoPointsTotal;
    }
    assumptions.add('EU VHF bundle scorer uses heuristic interpretation from bundled model hints.');
    return { qsoPointsTotal, multiplierTotal, computedScore, pointsByIndex };
  }

  function computeContestScoringSummary(qsos, contestMeta, context = {}) {
    const loggedPointsTotal = computeLoggedPointsTotal(qsos);
    const claimedScoreHeader = parseClaimedScoreNumber(contestMeta?.claimedScore);
    const resolved = resolveContestRuleSet(contestMeta, context);
    const ruleSpecVersion = String(activeAnalysisEnv?.scoringSpec?.spec_version || '');
    const ruleSpecSource = String(activeAnalysisEnv?.scoringSource || '');
    const duplicatePolicy = resolved?.rule ? resolveScoringDuplicatePolicy(resolved.rule) : '';
    const multiplierCreditPolicy = resolved?.rule ? resolveMultiplierCreditPolicy(resolved.rule) : '';
    const ruleReferenceUrl = Array.isArray(resolved?.rule?.official_rules_urls) && resolved.rule.official_rules_urls.length
      ? String(resolved.rule.official_rules_urls[0] || '')
      : '';
    if (!resolved.supported) {
      return {
        supported: false,
        confidence: 'unknown',
        warning: resolved.warning || (activeAnalysisEnv?.analysisMode === ANALYSIS_MODE_DXER ? SCORING_UNKNOWN_WARNING_DXER : SCORING_UNKNOWN_WARNING),
        assumptions: Array.isArray(resolved.assumptions) ? resolved.assumptions : [],
        detectionMethod: resolved.detectionMethod || 'none',
        detectionValue: resolved.detectionValue || '',
        ruleId: null,
        ruleName: activeAnalysisEnv?.analysisMode === ANALYSIS_MODE_DXER ? 'Unknown rules' : 'Unknown contest',
        claimedScoreHeader,
        loggedPointsTotal,
        ruleSpecVersion,
        ruleSpecSource,
        ruleReferenceUrl,
        duplicatePolicy,
        multiplierCreditPolicy,
        computedQsoPointsTotal: null,
        computedMultiplierTotal: null,
        computedScore: null,
        scoreDeltaAbs: null,
        scoreDeltaPct: null,
        effectivePointsSource: loggedPointsTotal > 0 ? 'logged' : 'none',
        bundle: null,
        computedPointsByIndex: []
      };
    }
    const assumptions = new Set(Array.isArray(resolved.assumptions) ? resolved.assumptions : []);
    if (resolved.rule?.bundle === true) {
      let bundleScore = null;
      if (resolved.bundle?.type === 'arrl') {
        bundleScore = scoreArrlBundle(resolved, qsos, contestMeta, assumptions);
      } else if (resolved.bundle?.type === 'eu_vhf') {
        bundleScore = scoreEuVhfBundle(resolved, qsos, contestMeta, assumptions);
      } else {
        assumptions.add('Bundle matched but subevent was not detected. Logged points fallback is used.');
      }
      const computedScore = Number.isFinite(bundleScore?.computedScore) ? Math.round(bundleScore.computedScore) : null;
      const deltaAbs = (computedScore != null && Number.isFinite(claimedScoreHeader)) ? computedScore - claimedScoreHeader : null;
      const deltaPct = (deltaAbs != null && Number.isFinite(claimedScoreHeader) && claimedScoreHeader !== 0)
        ? (deltaAbs / claimedScoreHeader) * 100
        : null;
      return {
        supported: true,
        confidence: resolved.confidence || 'unknown',
        warning: '',
        assumptions: Array.from(assumptions),
        detectionMethod: resolved.detectionMethod || '',
        detectionValue: resolved.detectionValue || '',
        ruleId: resolved.ruleId || '',
        ruleName: resolved.rule?.name || resolved.ruleId || '',
        ruleSpecVersion,
        ruleSpecSource,
        ruleReferenceUrl,
        duplicatePolicy,
        multiplierCreditPolicy,
        claimedScoreHeader,
        loggedPointsTotal,
        computedQsoPointsTotal: Number.isFinite(bundleScore?.qsoPointsTotal) ? Math.round(bundleScore.qsoPointsTotal) : null,
        computedMultiplierTotal: Number.isFinite(bundleScore?.multiplierTotal) ? Number(bundleScore.multiplierTotal) : null,
        computedScore,
        scoreDeltaAbs: deltaAbs,
        scoreDeltaPct: deltaPct,
        effectivePointsSource: computedScore != null ? 'computed' : (loggedPointsTotal > 0 ? 'logged' : 'none'),
        bundle: resolved.bundle || null,
        computedPointsByIndex: Array.isArray(bundleScore?.pointsByIndex) ? bundleScore.pointsByIndex : []
      };
    }
    const ruleId = String(resolved.ruleId || '');
    const inPhase1 = SCORING_PHASE1_RULES.has(ruleId);
    const inPhase2 = SCORING_PHASE2_RULES.has(ruleId);
    if (!inPhase1 && !inPhase2) {
      assumptions.add(`Scorer for ${resolved.ruleId} is not enabled in current rollout.`);
      return {
        supported: true,
        confidence: resolved.confidence || 'unknown',
        warning: '',
        assumptions: Array.from(assumptions),
        detectionMethod: resolved.detectionMethod || '',
        detectionValue: resolved.detectionValue || '',
        ruleId: resolved.ruleId || '',
        ruleName: resolved.rule?.name || resolved.ruleId || '',
        ruleSpecVersion,
        ruleSpecSource,
        ruleReferenceUrl,
        duplicatePolicy,
        multiplierCreditPolicy,
        claimedScoreHeader,
        loggedPointsTotal,
        computedQsoPointsTotal: null,
        computedMultiplierTotal: null,
        computedScore: null,
        scoreDeltaAbs: null,
        scoreDeltaPct: null,
        effectivePointsSource: loggedPointsTotal > 0 ? 'logged' : 'none',
        bundle: resolved.bundle || null,
        computedPointsByIndex: []
      };
    }
    if (inPhase2) assumptions.add('Medium-confidence scorer active: validate assumptions against yearly published rules.');
    const scored = scoreFromRule(resolved.rule, qsos, contestMeta, assumptions);
    const computedScore = Number.isFinite(scored.computedScore) ? Math.round(scored.computedScore) : null;
    const deltaAbs = (computedScore != null && Number.isFinite(claimedScoreHeader)) ? computedScore - claimedScoreHeader : null;
    const deltaPct = (deltaAbs != null && Number.isFinite(claimedScoreHeader) && claimedScoreHeader !== 0)
      ? (deltaAbs / claimedScoreHeader) * 100
      : null;
    return {
      supported: true,
      confidence: resolved.confidence || 'unknown',
      warning: '',
      assumptions: Array.from(assumptions),
      detectionMethod: resolved.detectionMethod || '',
      detectionValue: resolved.detectionValue || '',
      ruleId: resolved.ruleId || '',
      ruleName: resolved.rule?.name || resolved.ruleId || '',
      ruleSpecVersion,
      ruleSpecSource,
      ruleReferenceUrl,
      duplicatePolicy,
      multiplierCreditPolicy,
      claimedScoreHeader,
      loggedPointsTotal,
      computedQsoPointsTotal: Math.round(scored.pointState.qsoPointsTotal || 0),
      computedMultiplierTotal: Number(scored.multState.total || 0),
      computedScore,
      scoreDeltaAbs: deltaAbs,
      scoreDeltaPct: deltaPct,
      effectivePointsSource: computedScore != null ? 'computed' : (loggedPointsTotal > 0 ? 'logged' : 'none'),
      bundle: resolved.bundle || null,
      computedPointsByIndex: Array.isArray(scored.pointState.pointsByIndex) ? scored.pointState.pointsByIndex : []
    };
  }

  function toCallsignGridMap(resources = {}) {
    if (resources.callsignGridCache instanceof Map) {
      return new Map(resources.callsignGridCache);
    }
    const map = new Map();
    const entries = Array.isArray(resources.callsignGridEntries) ? resources.callsignGridEntries : [];
    entries.forEach((entry) => {
      if (!Array.isArray(entry) || entry.length < 2) return;
      const key = normalizeCall(entry[0]);
      if (!key) return;
      map.set(key, normalizeLookupGrid(entry[1]));
    });
    return map;
  }

  function buildAnalysisEnv(resources = {}) {
    const env = makeEmptyAnalysisEnv();
    env.ctyTable = Array.isArray(resources.ctyTable) ? resources.ctyTable : [];
    env.masterSet = resources.masterSet instanceof Set
      ? new Set(resources.masterSet)
      : new Set(Array.isArray(resources.masterCalls) ? resources.masterCalls.map((call) => normalizeCall(call)).filter(Boolean) : []);
    env.analysisMode = normalizeAnalysisMode(resources.analysisMode || ANALYSIS_MODE_DEFAULT);
    env.scoringSpec = resources.scoringSpec && typeof resources.scoringSpec === 'object' ? resources.scoringSpec : null;
    env.scoringSource = String(resources.scoringSource || '');
    env.scoringError = String(resources.scoringError || '');
    env.scoringStatus = env.scoringSpec ? 'ok' : (resources.scoringStatus === 'error' ? 'error' : 'pending');
    env.callsignGridCache = toCallsignGridMap(resources);
    if (env.scoringSpec) {
      let indexes = scoringIndexCache.get(env.scoringSpec);
      if (!indexes) {
        indexes = buildScoringIndexes(env.scoringSpec);
        scoringIndexCache.set(env.scoringSpec, indexes);
      }
      env.scoringRuleMap = indexes.byId;
      env.scoringRuleByFolder = indexes.byFolder;
      env.scoringAliasMap = indexes.aliasMap;
    }
    return env;
  }

  function withAnalysisEnv(resources, fn) {
    const previous = activeAnalysisEnv;
    activeAnalysisEnv = buildAnalysisEnv(resources);
    try {
      return fn();
    } finally {
      activeAnalysisEnv = previous;
    }
  }

  function buildDerivedInternal(qsos, context = {}) {
    if (!qsos) return null;
    const dupes = markDupes(qsos, context.analysisMode || activeAnalysisEnv?.analysisMode || ANALYSIS_MODE_DEFAULT);
    const calls = new Set();
    const bands = new Map();
    const bandModes = new Map();
    const countries = new Map();
    const continents = new Map();
    const cqZones = new Map();
    const hours = new Map();
    const minutes = new Map();
    const tenMinutes = new Map();
    const countriesByMonth = new Map();
    const cqZonesByMonth = new Map();
    const ituZonesByMonth = new Map();
    const countriesByYear = new Map();
    const cqZonesByYear = new Map();
    const ituZonesByYear = new Map();
    const wpxPrefixes = new Map();
    const wpxPrefixGroups = new Map();
    const callsignLengths = new Map();
    const notInMasterCalls = new Map();
    const allCalls = new Map();
    const hoursCountries = new Map();
    const bandHourCountry = new Map();
    const ops = new Map();
    const structures = new Map();
    const ituZones = new Map();
    const distanceSummary = makeDistanceSummary();
    const headingSummary = makeHeadingSummary();
    const headingByHour = new Map();
    const freqBins = new Map();
    const possibleErrors = [];
    const comments = new Set();
    const fields = new Map();
    let minTs = null;
    let maxTs = null;
    let totalPoints = 0;

    const station = deriveStation(qsos);
    const contestMeta = deriveContestMeta(qsos);
    const countryPrefixMap = buildCountryPrefixMap();

    qsos.forEach((q) => {
      if (q.call) calls.add(q.call);
      if (typeof q.ts === 'number') {
        if (minTs === null || q.ts < minTs) minTs = q.ts;
        if (maxTs === null || q.ts > maxTs) maxTs = q.ts;
      }
      const bandKey = normalizeBand(q.band, Number.isFinite(q.freq) ? q.freq : null) || 'unknown';
      if (bandKey && bandKey !== q.band) q.band = bandKey;
      if (!bands.has(bandKey)) {
        bands.set(bandKey, { qsos: 0, uniques: new Set(), dupes: 0 });
      }
      const b = bands.get(bandKey);
      b.qsos += 1;
      if (q.isDupe) b.dupes += 1;
      if (q.call) b.uniques.add(q.call);

      if (!bandModes.has(bandKey)) {
        bandModes.set(bandKey, { band: bandKey, cw: 0, digital: 0, phone: 0, all: 0, points: 0, countries: new Set() });
      }
      const bm = bandModes.get(bandKey);
      const bucket = modeBucket(q.mode);
      if (bucket === 'CW') bm.cw += 1;
      if (bucket === 'Digital') bm.digital += 1;
      if (bucket === 'Phone') bm.phone += 1;
      bm.all += 1;

      const loggedCq = parseZone(q.raw?.CQZ ?? q.raw?.CQ_ZONE);
      const loggedItu = parseZone(q.raw?.ITUZ ?? q.raw?.ITU_ZONE);
      if (loggedCq != null) q.cqZone = loggedCq;
      if (loggedItu != null) q.ituZone = loggedItu;

      const prefix = lookupPrefix(q.call);
      const wpx = wpxPrefix(q.call);
      if (wpx) q.wpxPrefix = wpx;
      if (prefix) {
        const cont = normalizeContinent(prefix.continent);
        q.country = prefix.country;
        if (q.cqZone == null) q.cqZone = prefix.cqZone;
        if (q.ituZone == null) q.ituZone = prefix.ituZone;
        q.continent = cont;
        q.prefix = prefix.prefix;
        if (prefix.country) {
          if (!countries.has(prefix.country)) {
            countries.set(prefix.country, {
              qsos: 0,
              uniques: new Set(),
              bands: new Set(),
              bandCounts: new Map(),
              cw: 0,
              digital: 0,
              phone: 0,
              firstTs: q.ts,
              lastTs: q.ts,
              continent: cont || null,
              distSum: 0,
              distCount: 0
            });
          }
          const c = countries.get(prefix.country);
          c.qsos += 1;
          if (q.call) c.uniques.add(q.call);
          if (q.band) {
            c.bands.add(q.band);
            c.bandCounts.set(q.band, (c.bandCounts.get(q.band) || 0) + 1);
          }
          if (bucket === 'CW') c.cw += 1;
          if (bucket === 'Digital') c.digital += 1;
          if (bucket === 'Phone') c.phone += 1;
          bm.countries.add(prefix.country);
          if (typeof q.ts === 'number') {
            if (c.firstTs == null || q.ts < c.firstTs) c.firstTs = q.ts;
            if (c.lastTs == null || q.ts > c.lastTs) c.lastTs = q.ts;
          }
        }
        if (cont) {
          if (!continents.has(cont)) {
            continents.set(cont, { qsos: 0, uniques: new Set(), bandCounts: new Map(), cw: 0, digital: 0, phone: 0 });
          }
          const c = continents.get(cont);
          c.qsos += 1;
          if (q.call) c.uniques.add(q.call);
          if (q.band) c.bandCounts.set(q.band, (c.bandCounts.get(q.band) || 0) + 1);
          if (bucket === 'CW') c.cw += 1;
          if (bucket === 'Digital') c.digital += 1;
          if (bucket === 'Phone') c.phone += 1;
        }
      }

      if (q.cqZone) {
        if (!cqZones.has(q.cqZone)) cqZones.set(q.cqZone, { qsos: 0, countries: new Set(), bandCounts: new Map() });
        const z = cqZones.get(q.cqZone);
        z.qsos += 1;
        if (q.country) z.countries.add(q.country);
        if (q.band) z.bandCounts.set(q.band, (z.bandCounts.get(q.band) || 0) + 1);
      }
      if (q.ituZone) {
        if (!ituZones.has(q.ituZone)) ituZones.set(q.ituZone, { qsos: 0, countries: new Set(), bandCounts: new Map() });
        const z = ituZones.get(q.ituZone);
        z.qsos += 1;
        if (q.country) z.countries.add(q.country);
        if (q.band) z.bandCounts.set(q.band, (z.bandCounts.get(q.band) || 0) + 1);
      }

      if (activeAnalysisEnv?.masterSet && activeAnalysisEnv.masterSet.size > 0) {
        const callKey = normalizeCall(q.call);
        const base = baseCall(callKey);
        q.inMaster = (callKey && activeAnalysisEnv.masterSet.has(callKey)) || (base && activeAnalysisEnv.masterSet.has(base));
        if (!q.inMaster && q.call) {
          if (!notInMasterCalls.has(q.call)) notInMasterCalls.set(q.call, { qsos: 0, firstTs: q.ts, lastTs: q.ts });
          const n = notInMasterCalls.get(q.call);
          n.qsos += 1;
          if (typeof q.ts === 'number') {
            if (n.firstTs == null || q.ts < n.firstTs) n.firstTs = q.ts;
            if (n.lastTs == null || q.ts > n.lastTs) n.lastTs = q.ts;
          }
        }
      }

      if (typeof q.ts === 'number' && !q.isDupe) {
        const hourBucket = Math.floor(q.ts / 3600000);
        if (!hours.has(hourBucket)) hours.set(hourBucket, { qsos: 0, byBand: new Map() });
        const h = hours.get(hourBucket);
        h.qsos += 1;
        if (!h.byBand.has(bandKey)) h.byBand.set(bandKey, 0);
        h.byBand.set(bandKey, h.byBand.get(bandKey) + 1);

        const minuteBucket = Math.floor(q.ts / 60000);
        if (!minutes.has(minuteBucket)) minutes.set(minuteBucket, { qsos: 0 });
        minutes.get(minuteBucket).qsos += 1;

        const tenBucket = Math.floor(q.ts / (60000 * 10));
        if (!tenMinutes.has(tenBucket)) tenMinutes.set(tenBucket, { qsos: 0 });
        tenMinutes.get(tenBucket).qsos += 1;

        if (q.country) {
          if (!hoursCountries.has(hourBucket)) hoursCountries.set(hourBucket, new Map());
          const hc = hoursCountries.get(hourBucket);
          hc.set(q.country, (hc.get(q.country) || 0) + 1);

          if (!bandHourCountry.has(bandKey)) bandHourCountry.set(bandKey, new Map());
          const bandMap = bandHourCountry.get(bandKey);
          if (!bandMap.has(hourBucket)) bandMap.set(hourBucket, new Map());
          const bhc = bandMap.get(hourBucket);
          bhc.set(q.country, (bhc.get(q.country) || 0) + 1);
        }
      }

      if (wpx) {
        if (!wpxPrefixes.has(wpx)) wpxPrefixes.set(wpx, { qsos: 0, uniques: new Set() });
        const p = wpxPrefixes.get(wpx);
        p.qsos += 1;
        if (q.call) p.uniques.add(q.call);

        const countryKey = prefix?.country || 'Unknown';
        if (!wpxPrefixGroups.has(countryKey)) {
          wpxPrefixGroups.set(countryKey, {
            country: countryKey,
            continent: prefix?.continent || '',
            id: prefix?.country ? (countryPrefixMap.get(prefix.country) || '') : '',
            prefixes: new Set()
          });
        }
        wpxPrefixGroups.get(countryKey).prefixes.add(wpx);
      }

      if (q.call) {
        const len = q.call.length;
        if (!callsignLengths.has(len)) callsignLengths.set(len, { callsigns: new Set(), qsos: 0 });
        const lenEntry = callsignLengths.get(len);
        lenEntry.qsos += 1;
        lenEntry.callsigns.add(q.call);
        const struct = classifyCallStructure(q.call);
        if (!structures.has(struct)) structures.set(struct, { callsigns: new Set(), qsos: 0, example: q.call });
        const structEntry = structures.get(struct);
        structEntry.qsos += 1;
        structEntry.callsigns.add(q.call);
        if (!structEntry.example) structEntry.example = q.call;
      }

      if (q.call) {
        if (!allCalls.has(q.call)) allCalls.set(q.call, { qsos: 0, bands: new Set(), bandCounts: new Map(), firstTs: q.ts, lastTs: q.ts });
        const a = allCalls.get(q.call);
        a.qsos += 1;
        if (q.band) {
          a.bands.add(q.band);
          a.bandCounts.set(q.band, (a.bandCounts.get(q.band) || 0) + 1);
        }
        if (typeof q.ts === 'number') {
          if (a.firstTs == null || q.ts < a.firstTs) a.firstTs = q.ts;
          if (a.lastTs == null || q.ts > a.lastTs) a.lastTs = q.ts;
        }
      }

      if (q.op) {
        if (!ops.has(q.op)) ops.set(q.op, { qsos: 0, uniques: new Set() });
        const o = ops.get(q.op);
        o.qsos += 1;
        if (q.call) o.uniques.add(q.call);
      }

      if (station && station.lat != null && station.lon != null) {
        const remote = deriveRemoteLatLon(q, prefix);
        if (remote) {
          const dist = haversineKm(station.lat, station.lon, remote.lat, remote.lon);
          const brng = bearingDeg(station.lat, station.lon, remote.lat, remote.lon);
          q.distance = dist;
          q.bearing = brng;
          distanceSummary.add(dist, q.band);
          headingSummary.add(brng, q.band);
          if (q.country && countries.has(q.country)) {
            const c = countries.get(q.country);
            c.distSum += dist;
            c.distCount += 1;
          }
          if (typeof q.ts === 'number') {
            const hourBucket = Math.floor(q.ts / 3600000);
            if (!headingByHour.has(hourBucket)) headingByHour.set(hourBucket, new Map());
            const hb = headingByHour.get(hourBucket);
            const sector = Math.floor(brng / 30) * 30;
            hb.set(sector, (hb.get(sector) || 0) + 1);
          }
        }
      }

      const comment = q.raw?.COMMENT || q.raw?.NOTES;
      if (comment) comments.add(comment);

      if (q.grid && q.grid.length >= 2) {
        const field = q.grid.slice(0, 2).toUpperCase();
        fields.set(field, (fields.get(field) || 0) + 1);
      } else {
        const remote = deriveRemoteLatLon(q, prefix);
        if (remote) {
          const field = latLonToField(remote.lat, remote.lon);
          if (field) fields.set(field, (fields.get(field) || 0) + 1);
        }
      }

      const freqBand = Number.isFinite(q.freq) ? parseBandFromFreq(q.freq) : null;
      if (!q.call) possibleErrors.push({ reason: 'Missing callsign', q });
      else if (classifyCallStructure(q.call) === 'other') possibleErrors.push({ reason: 'Unrecognized callsign pattern', q });
      if (!prefix) possibleErrors.push({ reason: 'Prefix not found in cty.dat', q });
      if (q.ts == null) possibleErrors.push({ reason: 'Invalid/missing time', q });
      if (q.band && !SUPPORTED_BANDS.has(q.band)) {
        const bandLabel = formatBandLabel(q.band) || q.band;
        possibleErrors.push({ reason: `Unexpected band value "${bandLabel}"`, q });
      }
      if (Number.isFinite(q.freq)) {
        if (!freqBand) {
          possibleErrors.push({ reason: `Frequency ${q.freq} MHz is outside supported bands`, q });
        } else if (q.band && q.band !== freqBand) {
          possibleErrors.push({ reason: `Band/freq mismatch: band ${formatBandLabel(q.band)}, freq ${q.freq} MHz (${formatBandLabel(freqBand)})`, q });
        }
        const bin = Math.floor(q.freq * 10) / 10;
        freqBins.set(bin, (freqBins.get(bin) || 0) + 1);
      }
      if (prefix) {
        if (prefix.cqZone && loggedCq != null && loggedCq !== prefix.cqZone) {
          possibleErrors.push({ reason: `CQ zone mismatch: logged ${loggedCq}, prefix ${prefix.cqZone}`, q });
        }
        if (prefix.ituZone && loggedItu != null && loggedItu !== prefix.ituZone) {
          possibleErrors.push({ reason: `ITU zone mismatch: logged ${loggedItu}, prefix ${prefix.ituZone}`, q });
        }
      }
    });

    const bandSummary = [];
    bands.forEach((v, k) => {
      bandSummary.push({ band: k, qsos: v.qsos, dupes: v.dupes, uniques: v.uniques.size });
    });
    bandSummary.sort((a, b) => {
      const ai = bandOrderIndex(a.band);
      const bi = bandOrderIndex(b.band);
      if (ai !== bi) return ai - bi;
      return (a.band || '').localeCompare(b.band || '');
    });

    const bandModeSummary = Array.from(bandModes.values()).map((b) => ({
      band: b.band,
      cw: b.cw,
      digital: b.digital,
      phone: b.phone,
      all: b.all,
      countries: b.countries.size,
      points: b.points
    })).sort((a, b) => {
      const ai = bandOrderIndex(a.band);
      const bi = bandOrderIndex(b.band);
      if (ai !== bi) return ai - bi;
      return a.band.localeCompare(b.band);
    });

    const countrySummary = [];
    countries.forEach((v, k) => {
      countrySummary.push({
        country: k,
        qsos: v.qsos,
        uniques: v.uniques.size,
        bands: sortBands(Array.from(v.bands)),
        bandCounts: v.bandCounts,
        cw: v.cw,
        digital: v.digital,
        phone: v.phone,
        continent: v.continent,
        distanceAvg: v.distCount ? v.distSum / v.distCount : null,
        prefixCode: countryPrefixMap.get(k) || '',
        firstTs: v.firstTs,
        lastTs: v.lastTs
      });
    });
    const continentOrder = ['NA', 'SA', 'EU', 'AF', 'AS', 'OC'];
    countrySummary.sort((a, b) => {
      const ai = continentOrder.indexOf((a.continent || '').toUpperCase());
      const bi = continentOrder.indexOf((b.continent || '').toUpperCase());
      if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return (a.prefixCode || a.country).localeCompare(b.prefixCode || b.country);
    });

    const continentSummary = [];
    continents.forEach((v, k) => {
      continentSummary.push({
        continent: k,
        qsos: v.qsos,
        uniques: v.uniques.size,
        bandCounts: v.bandCounts,
        cw: v.cw,
        digital: v.digital,
        phone: v.phone
      });
    });
    continentSummary.sort((a, b) => {
      const ai = continentOrder.indexOf((a.continent || '').toUpperCase());
      const bi = continentOrder.indexOf((b.continent || '').toUpperCase());
      if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return (a.continent || '').localeCompare(b.continent || '');
    });

    const cqZoneSummary = [];
    cqZones.forEach((v, k) => {
      cqZoneSummary.push({ cqZone: k, qsos: v.qsos, countries: v.countries.size, bandCounts: v.bandCounts });
    });
    cqZoneSummary.sort((a, b) => a.cqZone - b.cqZone);

    const ituZoneSummary = [];
    ituZones.forEach((v, k) => {
      ituZoneSummary.push({ ituZone: k, qsos: v.qsos, countries: v.countries.size, bandCounts: v.bandCounts });
    });
    ituZoneSummary.sort((a, b) => a.ituZone - b.ituZone);

    const hourSeries = Array.from(hours.entries()).sort((a, b) => a[0] - b[0]).map(([hour, v]) => {
      const bandsObj = {};
      v.byBand.forEach((count, band) => {
        bandsObj[band] = count;
      });
      return { hour, qsos: v.qsos, bands: bandsObj };
    });

    const minuteSeries = Array.from(minutes.entries()).sort((a, b) => a[0] - b[0]).map(([minute, v]) => ({ minute, qsos: v.qsos }));
    const breakSummary = computeBreakSummary(minutes, 60);
    const tenMinuteSeries = Array.from(tenMinutes.entries()).sort((a, b) => a[0] - b[0]).map(([bucket, v]) => ({ bucket, qsos: v.qsos }));

    const prefixSummary = [];
    wpxPrefixes.forEach((v, k) => {
      prefixSummary.push({ prefix: k, qsos: v.qsos, uniques: v.uniques.size });
    });
    prefixSummary.sort((a, b) => b.qsos - a.qsos || a.prefix.localeCompare(b.prefix));

    const callsignLengthSummary = Array.from(callsignLengths.entries()).map(([len, info]) => ({
      len,
      callsigns: info.callsigns.size,
      qsos: info.qsos
    })).sort((a, b) => a.len - b.len);

    const notInMasterList = Array.from(notInMasterCalls.entries()).map(([call, info]) => ({
      call,
      qsos: info.qsos,
      firstTs: info.firstTs,
      lastTs: info.lastTs
    })).sort((a, b) => b.qsos - a.qsos || a.call.localeCompare(b.call));

    const allCallsList = Array.from(allCalls.entries()).map(([call, info]) => ({
      call,
      qsos: info.qsos,
      bands: Array.from(info.bands).sort(),
      bandCounts: info.bandCounts,
      firstTs: info.firstTs,
      lastTs: info.lastTs
    })).sort((a, b) => a.call.localeCompare(b.call));

    const callCountMap = new Map();
    allCalls.forEach((info, call) => callCountMap.set(call, info.qsos));
    qsos.forEach((q) => {
      if (!q || !q.call) return;
      q.callCount = callCountMap.get(q.call) || 0;
    });

    let operatorsSummary = Array.from(ops.entries()).map(([op, info]) => ({
      op,
      qsos: info.qsos,
      uniques: info.uniques.size
    })).sort((a, b) => b.qsos - a.qsos || a.op.localeCompare(b.op));
    const headerOperators = parseOperatorsList(contestMeta?.operators);
    if (headerOperators.length) {
      const stationNorm = normalizeCall(contestMeta?.stationCallsign || '');
      const opKeys = Array.from(ops.keys()).map((op) => normalizeCall(op)).filter(Boolean);
      const onlyStation = opKeys.length === 0 || (opKeys.length === 1 && stationNorm && opKeys[0] === stationNorm);
      if (onlyStation) {
        operatorsSummary = headerOperators.map((op) => ({ op, qsos: 0, uniques: 0 }));
      }
    }

    const countryMonthBuckets = buildCountryMonthBuckets(qsos);
    const cqZoneMonthBuckets = buildZoneMonthBuckets(qsos, 'cq');
    const ituZoneMonthBuckets = buildZoneMonthBuckets(qsos, 'itu');
    const countryYearBuckets = buildCountryYearBuckets(qsos);
    const cqZoneYearBuckets = buildZoneYearBuckets(qsos, 'cq');
    const ituZoneYearBuckets = buildZoneYearBuckets(qsos, 'itu');
    const monthColumns = new Set();
    const yearColumns = new Set();
    for (const [, data] of countryMonthBuckets.entries()) {
      for (const key of data.months.keys()) monthColumns.add(key);
    }
    for (const [zone, data] of cqZoneMonthBuckets.entries()) {
      cqZonesByMonth.set(zone, data);
      for (const key of data.months.keys()) monthColumns.add(key);
    }
    for (const [zone, data] of ituZoneMonthBuckets.entries()) {
      ituZonesByMonth.set(zone, data);
      for (const key of data.months.keys()) monthColumns.add(key);
    }
    for (const [country, data] of countryMonthBuckets.entries()) countriesByMonth.set(country, data);
    for (const [zone, data] of cqZoneYearBuckets.entries()) {
      cqZonesByYear.set(zone, data);
      for (const key of data.years.keys()) yearColumns.add(key);
    }
    for (const [zone, data] of ituZoneYearBuckets.entries()) {
      ituZonesByYear.set(zone, data);
      for (const key of data.years.keys()) yearColumns.add(key);
    }
    for (const [country, data] of countryYearBuckets.entries()) {
      countriesByYear.set(country, data);
      for (const key of data.years.keys()) yearColumns.add(key);
    }

    const structureSummary = Array.from(structures.entries()).map(([struct, info]) => ({
      struct,
      example: info.example,
      callsigns: info.callsigns.size,
      qsos: info.qsos
    })).sort((a, b) => b.qsos - a.qsos || a.struct.localeCompare(b.struct));

    const headingByHourSeries = Array.from(headingByHour.entries()).sort((a, b) => a[0] - b[0]).map(([hour, m]) => ({
      hour,
      sectors: Array.from(m.entries()).sort((a, b) => a[0] - b[0]).map(([sector, count]) => ({ sector, count }))
    }));

    const frequencySummary = Array.from(freqBins.entries()).sort((a, b) => a[0] - b[0]).map(([freq, count]) => ({ freq, count }));
    const fieldsSummary = Array.from(fields.entries()).map(([field, count]) => ({ field, count }))
      .sort((a, b) => b.count - a.count || a.field.localeCompare(b.field));

    const scoring = computeContestScoringSummary(qsos, contestMeta, {
      logFile: context?.logFile || null,
      sourcePath: context?.sourcePath || ''
    });
    const effectivePointsByIndex = (scoring?.effectivePointsSource === 'computed'
      && Array.isArray(scoring.computedPointsByIndex)
      && scoring.computedPointsByIndex.length === qsos.length)
      ? scoring.computedPointsByIndex
      : qsos.map((q) => (Number.isFinite(q?.points) ? q.points : 0));
    const hourPoints = new Map();
    const minutePoints = new Map();
    qsos.forEach((q, idx) => {
      if (!Number.isFinite(q?.ts) || q?.isDupe) return;
      const points = Number(effectivePointsByIndex[idx] || 0);
      if (!Number.isFinite(points)) return;
      const hourBucket = Math.floor(q.ts / 3600000);
      const minuteBucket = Math.floor(q.ts / 60000);
      hourPoints.set(hourBucket, (hourPoints.get(hourBucket) || 0) + points);
      minutePoints.set(minuteBucket, (minutePoints.get(minuteBucket) || 0) + points);
    });
    const hourPointSeries = Array.from(hourPoints.entries()).sort((a, b) => a[0] - b[0]).map(([hour, points]) => ({ hour, points }));
    const minutePointSeries = Array.from(minutePoints.entries()).sort((a, b) => a[0] - b[0]).map(([minute, points]) => ({ minute, points }));
    const effectivePointsTotal = effectivePointsByIndex.reduce((sum, p) => sum + (Number.isFinite(p) ? p : 0), 0);
    const effectivePointsByBand = new Map();
    qsos.forEach((q, idx) => {
      const points = Number(effectivePointsByIndex[idx] || 0);
      if (!Number.isFinite(points)) return;
      const bandKey = normalizeBand(q?.band, Number.isFinite(q?.freq) ? q.freq : null) || 'unknown';
      effectivePointsByBand.set(bandKey, (effectivePointsByBand.get(bandKey) || 0) + points);
    });
    bandModeSummary.forEach((entry) => {
      entry.points = effectivePointsByBand.get(entry.band) || 0;
    });
    totalPoints = effectivePointsTotal;
    const monthColumnList = Array.from(monthColumns).sort((a, b) => a.localeCompare(b));
    const yearColumnList = Array.from(yearColumns).sort((a, b) => Number(a) - Number(b));
    const operatingStyle = buildOperatingStyleSummary(qsos);

    return {
      dupes,
      countriesByYear,
      countriesByMonth,
      cqZonesByYear,
      cqZonesByMonth,
      ituZonesByYear,
      ituZonesByMonth,
      yearColumns: yearColumnList,
      monthColumns: monthColumnList,
      uniqueCallsCount: calls.size,
      bandSummary,
      bandModeSummary,
      countrySummary,
      continentSummary,
      cqZoneSummary,
      ituZoneSummary,
      hourSeries,
      minuteSeries,
      hourPointSeries,
      minutePointSeries,
      tenMinuteSeries,
      prefixSummary,
      prefixGroups: wpxPrefixGroups,
      callsignLengthSummary,
      notInMasterList,
      allCallsList,
      hoursCountries,
      bandHourCountry,
      operatorsSummary,
      structureSummary,
      distanceSummary: distanceSummary.export(),
      headingSummary: headingSummary.export(),
      headingByHourSeries,
      frequencySummary,
      fieldsSummary,
      station,
      contestMeta,
      scoring,
      comments: Array.from(comments),
      possibleErrors,
      timeRange: { minTs, maxTs },
      breakSummary,
      operatingStyle,
      totalPoints,
      effectivePointsTotal
    };
  }

  function buildDerived(qsos, context = {}, resources = {}) {
    return withAnalysisEnv(resources, () => buildDerivedInternal(qsos, context));
  }

  function analyzeLogText(text, filename, context = {}, resources = {}) {
    return withAnalysisEnv(resources, () => {
      const qsoData = parseLogFile(text, filename);
      const derived = buildDerivedInternal(qsoData.qsos, context);
      return { qsoData, derived };
    });
  }

  function deriveLog(qsoData, context = {}, resources = {}) {
    return withAnalysisEnv(resources, () => {
      const safeData = qsoData && typeof qsoData === 'object'
        ? Object.assign({}, qsoData, { qsos: Array.isArray(qsoData.qsos) ? qsoData.qsos : [] })
        : { type: 'unknown', qsos: [] };
      const derived = buildDerivedInternal(safeData.qsos, context);
      return { qsoData: safeData, derived };
    });
  }

  const api = {
    parseCtyDat,
    parseMasterDta,
    parseLogFile,
    buildDerived,
    analyzeLogText,
    deriveLog
  };

  const existing = globalScope && typeof globalScope.SH6AnalysisCore === 'object' && globalScope.SH6AnalysisCore
    ? globalScope.SH6AnalysisCore
    : {};
  globalScope.SH6AnalysisCore = Object.assign({}, existing, api);
})(typeof globalThis !== 'undefined' ? globalThis : self);
