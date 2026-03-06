export function createArchiveSearchRuntime(deps = {}) {
  const {
    getSlotElements,
    normalizeCall,
    escapeAttr,
    escapeHtml,
    trackEvent,
    queryArchiveRowsByCallsign,
    fetchArchiveLogText,
    applyLoadedLogToSlot,
    searchDebounceMs = 900,
    minInputAgeMs = 800
  } = deps;

  const controllers = new Map();
  const UNSPECIFIED_ARCHIVE_SUBCONTEST = '(unspecified)';

  function normalizeLabel(value) {
    return value == null ? '' : String(value).trim();
  }

  function normalizeCallsign(input) {
    const normalized = typeof normalizeCall === 'function'
      ? normalizeCall(input)
      : String(input || '').trim().toUpperCase();
    return normalized.replace(/\s+/g, '');
  }

  function escapeAttrSafe(value) {
    if (typeof escapeAttr === 'function') return escapeAttr(value);
    return String(value == null ? '' : value);
  }

  function escapeHtmlSafe(value) {
    if (typeof escapeHtml === 'function') return escapeHtml(value);
    return String(value == null ? '' : value);
  }

  function normalizeArchiveMode(value) {
    const mode = normalizeLabel(value).toUpperCase();
    return mode || 'UNSPECIFIED';
  }

  function normalizeArchiveSubcontest(row) {
    const contest = normalizeLabel(row?.contest).toUpperCase();
    if (contest !== 'ARRL') return '';
    const explicit = normalizeLabel(row?.subcontest);
    if (explicit) return explicit;
    const parts = normalizeLabel(row?.path).split('/').filter(Boolean);
    return parts[1] || UNSPECIFIED_ARCHIVE_SUBCONTEST;
  }

  function compareArchiveModes(modeA, modeB) {
    const a = normalizeArchiveMode(modeA);
    const b = normalizeArchiveMode(modeB);
    const aUnspecified = a === 'UNSPECIFIED' ? 1 : 0;
    const bUnspecified = b === 'UNSPECIFIED' ? 1 : 0;
    if (aUnspecified !== bUnspecified) return aUnspecified - bUnspecified;
    return a.localeCompare(b);
  }

  function getArchiveLeafName(path) {
    const safePath = normalizeLabel(path);
    const parts = safePath.split('/').filter(Boolean);
    return parts[parts.length - 1] || '';
  }

  function parseIsoWeek(dateStr) {
    const [y, m, d] = String(dateStr || '').split('-').map((value) => parseInt(value, 10));
    if (!y || !m || !d) return null;
    const date = new Date(Date.UTC(y, m - 1, d));
    const day = (date.getUTCDay() + 6) % 7;
    date.setUTCDate(date.getUTCDate() - day + 3);
    const firstThu = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
    const firstDay = (firstThu.getUTCDay() + 6) % 7;
    firstThu.setUTCDate(firstThu.getUTCDate() - firstDay + 3);
    const week = 1 + Math.round((date - firstThu) / 604800000);
    return { year: date.getUTCFullYear(), week };
  }

  function formatArchiveSubKey(row) {
    const contest = normalizeLabel(row?.contest);
    const path = normalizeLabel(row?.path);
    if (!contest || !path) return [normalizeLabel(row?.mode), normalizeLabel(row?.season)].filter(Boolean).join(' • ');
    if (contest.startsWith('WednesdayMiniTest')) {
      const match = path.match(/\d{4}-\d{2}-\d{2}/);
      if (match) {
        const iso = parseIsoWeek(match[0]);
        if (iso) return `Week ${iso.year}-W${String(iso.week).padStart(2, '0')}`;
      }
      return 'Week';
    }
    if (contest === 'EU_VHF_CONTESTS') {
      const parts = path.split('/').filter(Boolean);
      const event = parts[1] ? parts[1].replace(/_/g, ' ') : '';
      const band = parts[2] || '';
      return [event, band].filter(Boolean).join(' • ');
    }
    return [normalizeLabel(row?.mode), normalizeLabel(row?.season)].filter(Boolean).join(' • ');
  }

  function getNumericYear(value) {
    const year = Number(value);
    return Number.isFinite(year) ? year : -1;
  }

  function sortResults(rows) {
    return (Array.isArray(rows) ? rows : []).slice().sort((a, b) => {
      const contestA = normalizeLabel(a?.contest).toUpperCase();
      const contestB = normalizeLabel(b?.contest).toUpperCase();
      if (contestA !== contestB) return contestA.localeCompare(contestB);
      if (contestA === 'ARRL') {
        const subA = normalizeArchiveSubcontest(a);
        const subB = normalizeArchiveSubcontest(b);
        if (subA !== subB) return subA.localeCompare(subB);
      }
      const yearA = getNumericYear(a?.year);
      const yearB = getNumericYear(b?.year);
      if (yearA !== yearB) return yearB - yearA;
      if (contestA === 'ARRL') {
        const modeCmp = compareArchiveModes(a?.mode, b?.mode);
        if (modeCmp !== 0) return modeCmp;
        return normalizeLabel(getArchiveLeafName(a?.path)).localeCompare(normalizeLabel(getArchiveLeafName(b?.path)));
      }
      const modeA = normalizeLabel(a?.mode).toUpperCase();
      const modeB = normalizeLabel(b?.mode).toUpperCase();
      if (modeA !== modeB) return modeA.localeCompare(modeB);
      const seasonA = normalizeLabel(a?.season).toUpperCase();
      const seasonB = normalizeLabel(b?.season).toUpperCase();
      return seasonA.localeCompare(seasonB);
    });
  }

  function buildResultsTreeMarkup(rows) {
    const archiveRows = sortResults(rows);
    if (!archiveRows.length) {
      return {
        html: '',
        summary: 'No matches found in the archive.'
      };
    }

    const tree = new Map();
    const makeLeafButton = (row) => {
      const path = String(row?.path || '');
      const label = path.split('/').pop();
      const isReconstructed = path.startsWith('RECONSTRUCTED_LOGS/');
      const suffix = isReconstructed ? ' (reconstructed log)' : '';
      return `<button type="button" class="repo-leaf" data-path="${escapeAttrSafe(path)}">${escapeHtmlSafe((label || '') + suffix)}</button>`;
    };

    archiveRows.forEach((row) => {
      const contest = normalizeLabel(row?.contest);
      const year = getNumericYear(row?.year) >= 0 ? String(getNumericYear(row?.year)) : '';
      const isArrl = contest.toUpperCase() === 'ARRL';
      if (isArrl) {
        const subcontest = normalizeArchiveSubcontest(row);
        if (!tree.has(contest)) tree.set(contest, new Map());
        const subMap = tree.get(contest);
        if (!subMap.has(subcontest)) subMap.set(subcontest, new Map());
        const yearMap = subMap.get(subcontest);
        if (!yearMap.has(year)) yearMap.set(year, new Map());
        const modeMap = yearMap.get(year);
        const mode = normalizeArchiveMode(row?.mode);
        if (!modeMap.has(mode)) modeMap.set(mode, []);
        modeMap.get(mode).push(row);
        return;
      }
      const subKey = formatArchiveSubKey(row);
      if (!tree.has(contest)) tree.set(contest, new Map());
      const yearMap = tree.get(contest);
      if (!yearMap.has(year)) yearMap.set(year, new Map());
      const modeMap = yearMap.get(year);
      if (!modeMap.has(subKey)) modeMap.set(subKey, []);
      modeMap.get(subKey).push(row);
    });

    const chunks = ['<div class="repo-tree">'];
    tree.forEach((yearMap, contest) => {
      const hasContest = Boolean(contest);
      if (hasContest) chunks.push(`<details class="repo-contest"><summary>${escapeHtmlSafe(contest)}</summary>`);
      const isArrl = contest.toUpperCase() === 'ARRL';
      if (isArrl) {
        yearMap.forEach((yearModeMap, subcontest) => {
          chunks.push(`<details class="repo-subcat"><summary>${escapeHtmlSafe(subcontest)}</summary>`);
          const years = Array.from(yearModeMap.keys()).sort((a, b) => Number(b) - Number(a));
          years.forEach((year) => {
            const modeMap = yearModeMap.get(year) || new Map();
            const hasYear = Boolean(year);
            if (hasYear) chunks.push(`<details class="repo-year"><summary>${escapeHtmlSafe(year)}</summary>`);
            const modes = Array.from(modeMap.keys()).sort(compareArchiveModes);
            modes.forEach((mode) => {
              const modeRows = modeMap.get(mode) || [];
              const hasMode = Boolean(mode);
              if (hasMode) chunks.push(`<details class="repo-subcat"><summary>${escapeHtmlSafe(mode)}</summary>`);
              modeRows.forEach((row) => chunks.push(makeLeafButton(row)));
              if (hasMode) chunks.push('</details>');
            });
            if (hasYear) chunks.push('</details>');
          });
          chunks.push('</details>');
        });
      } else {
        yearMap.forEach((modeMap, year) => {
          const hasYear = Boolean(year);
          if (hasYear) chunks.push(`<details class="repo-year"><summary>${escapeHtmlSafe(year)}</summary>`);
          modeMap.forEach((modeRows, subKey) => {
            const hasSub = Boolean(subKey);
            if (hasSub) chunks.push(`<details class="repo-subcat"><summary>${escapeHtmlSafe(subKey)}</summary>`);
            modeRows.forEach((row) => chunks.push(makeLeafButton(row)));
            if (hasSub) chunks.push('</details>');
          });
          if (hasYear) chunks.push('</details>');
        });
      }
      if (hasContest) chunks.push('</details>');
    });
    chunks.push('</div>');

    return {
      html: chunks.join(''),
      summary: `Select a log to load. Found ${archiveRows.length} logs in ${tree.size} hamradio events.`
    };
  }

  function shouldQueryArchive(callsign, issuedAt) {
    if (!callsign || callsign.length < 3) return false;
    if (!/\d/.test(callsign)) return false;
    if (issuedAt && Date.now() - issuedAt < minInputAgeMs) return false;
    return true;
  }

  function createController(slotId) {
    const slotKey = String(slotId || 'A').toUpperCase();
    const elements = getSlotElements?.(slotKey) || {};
    const { searchInput, resultsEl, statusEl, statusTarget } = elements;
    if (!(searchInput instanceof HTMLElement) || !(resultsEl instanceof HTMLElement) || !(statusEl instanceof HTMLElement)) {
      return null;
    }

    const controller = {
      slotKey,
      timer: null,
      searchSeq: 0,
      lastTrackedSearch: '',
      archiveRows: []
    };

    const renderRows = (rows) => {
      controller.archiveRows = sortResults(rows);
      const tree = buildResultsTreeMarkup(controller.archiveRows);
      resultsEl.innerHTML = tree.html;
      if (tree.summary) statusEl.textContent = tree.summary;
    };

    const searchArchive = async (input, issuedAt) => {
      if (searchInput.value !== input) return;
      const callsign = normalizeCallsign(input);
      if (callsign.length < 3) {
        resultsEl.innerHTML = '';
        statusEl.textContent = '';
        statusEl.title = '';
        controller.archiveRows = [];
        return;
      }
      if (!shouldQueryArchive(callsign, issuedAt)) {
        resultsEl.innerHTML = '';
        statusEl.textContent = 'Enter full callsign (letters + number) to search.';
        statusEl.title = '';
        controller.archiveRows = [];
        return;
      }

      const trackKey = `${slotKey}|${callsign}`;
      if (trackKey !== controller.lastTrackedSearch) {
        trackEvent?.('archive_search', {
          slot: slotKey,
          callsign
        });
        controller.lastTrackedSearch = trackKey;
      }

      const seq = ++controller.searchSeq;
      statusEl.textContent = `Searching archive for ${callsign}...`;
      statusEl.title = '';
      try {
        const rows = await queryArchiveRowsByCallsign?.(callsign);
        if (seq !== controller.searchSeq || searchInput.value !== input) return;
        renderRows(rows || []);
        statusEl.textContent = rows && rows.length
          ? `Select a log to load for ${callsign}.`
          : `No matches found for ${callsign}.`;
      } catch (err) {
        if (seq !== controller.searchSeq) return;
        console.error('Archive search failed:', err);
        trackEvent?.('archive_shard_error', {
          slot: slotKey,
          callsign,
          message: err && err.message ? err.message : 'unknown error'
        });
        resultsEl.innerHTML = '';
        statusEl.textContent = `Archive search failed: ${err && err.message ? err.message : 'unknown error'}`;
        statusEl.title = '';
      }
    };

    const fetchFromArchive = async (path) => {
      if (!path) return;
      const name = String(path).split('/').pop() || '';
      trackEvent?.('archive_log_select', {
        slot: slotKey,
        path,
        name
      });
      statusEl.textContent = `Downloading ${name}...`;
      resultsEl.querySelectorAll('button').forEach((btn) => {
        btn.disabled = true;
      });
      try {
        const result = await fetchArchiveLogText?.(path);
        if (!result || typeof result.text !== 'string') {
          statusEl.textContent = 'Download failed.';
          statusEl.title = '';
          return;
        }
        await applyLoadedLogToSlot?.(
          slotKey,
          result.text,
          name,
          result.text.length,
          'Archive',
          statusTarget || null,
          path
        );
        statusEl.textContent = `Loaded ${name} from archive.`;
        statusEl.title = result.source || '';
      } catch (err) {
        statusEl.textContent = 'Failed to parse archive log.';
        statusEl.title = '';
        console.error('Archive parse failed:', err);
      } finally {
        resultsEl.querySelectorAll('button').forEach((btn) => {
          btn.disabled = false;
        });
      }
    };

    searchInput.addEventListener('input', (evt) => {
      if (controller.timer) clearTimeout(controller.timer);
      const value = evt?.target && typeof evt.target.value === 'string' ? evt.target.value : searchInput.value;
      const issuedAt = Date.now();
      controller.timer = setTimeout(() => {
        searchArchive(value, issuedAt);
      }, searchDebounceMs);
    });

    resultsEl.addEventListener('click', (evt) => {
      const target = evt.target instanceof HTMLElement ? evt.target.closest('button') : null;
      if (!target) return;
      const path = target.dataset.path;
      if (!path) return;
      fetchFromArchive(path);
    });

    return controller;
  }

  function setupRepoSearch(slotId) {
    const slotKey = String(slotId || 'A').toUpperCase();
    if (controllers.has(slotKey)) return controllers.get(slotKey);
    const controller = createController(slotKey);
    if (controller) {
      controllers.set(slotKey, controller);
    }
    return controller || null;
  }

  return {
    setupRepoSearch
  };
}
