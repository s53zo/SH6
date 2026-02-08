(() => {
  'use strict';

  function safeString(value) {
    return value == null ? '' : String(value);
  }

  function parseNumber(value) {
    if (value == null || value === '') return null;
    const n = Number(String(value).replace(/,/g, ''));
    return Number.isFinite(n) ? n : null;
  }

  function normalizeCategoryKey(value) {
    return safeString(value)
      .replace(/%20/gi, ' ')
      .replace(/\+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase();
  }

  function normalizeScopeType(value) {
    const key = safeString(value).trim().toLowerCase();
    if (key === 'dxcc') return 'dxcc';
    if (key === 'continent') return 'continent';
    if (key === 'cq_zone' || key === 'cqzone' || key === 'cq') return 'cq_zone';
    if (key === 'itu_zone' || key === 'ituzone' || key === 'itu') return 'itu_zone';
    return 'dxcc';
  }

  function normalizeScopeValue(scopeType, value) {
    const text = safeString(value).trim();
    if (!text) return '';
    if (scopeType === 'cq_zone' || scopeType === 'itu_zone') {
      const n = parseInt(text, 10);
      return Number.isFinite(n) ? String(n) : '';
    }
    return text.toUpperCase();
  }

  function parseOperators(raw) {
    if (!raw) return [];
    return safeString(raw)
      .split(/[,;]+/)
      .flatMap((chunk) => chunk.split(/\s+/))
      .map((token) => token.trim().toUpperCase())
      .filter(Boolean);
  }

  function sumMultipliers(row) {
    if (!row || typeof row !== 'object') return null;
    const map = row.multBreakdown || {};
    let total = 0;
    let hasAny = false;
    Object.values(map).forEach((value) => {
      const n = parseNumber(value);
      if (!Number.isFinite(n)) return;
      total += n;
      hasAny = true;
    });
    if (hasAny) return total;
    return parseNumber(row.multTotal);
  }

  function normalizeRow(row) {
    if (!row || typeof row !== 'object') return null;
    const callsign = safeString(row.callsign || row.call).trim().toUpperCase();
    const category = normalizeCategoryKey(row.category || row.cat);
    const score = parseNumber(row.score);
    const qsos = parseNumber(row.qsos || row.q);
    const multTotal = sumMultipliers(row);
    const geo = safeString(row.geo || row.cty).trim().toUpperCase();
    return {
      callsign,
      category,
      score,
      qsos,
      multTotal,
      multBreakdown: row.multBreakdown || {},
      operators: safeString(row.operators || ''),
      year: parseNumber(row.year || row.yr),
      geo,
      raw: row
    };
  }

  function dedupeRows(rows) {
    const byKey = new Map();
    (rows || []).forEach((row) => {
      const key = `${row.callsign}|${row.category || '*'}`;
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, row);
        return;
      }
      const scoreA = Number(existing.score);
      const scoreB = Number(row.score);
      if (Number.isFinite(scoreB) && (!Number.isFinite(scoreA) || scoreB > scoreA)) {
        byKey.set(key, row);
      }
    });
    return Array.from(byKey.values());
  }

  function selectCurrentRow(rows, stationCall, operatorCalls) {
    const call = safeString(stationCall).trim().toUpperCase();
    const opSet = new Set((operatorCalls || []).map((item) => safeString(item).trim().toUpperCase()).filter(Boolean));
    if (call) {
      const callHit = (rows || []).find((row) => safeString(row.callsign).trim().toUpperCase() === call);
      if (callHit) return callHit;
    }
    if (opSet.size) {
      const opHit = (rows || []).find((row) => {
        const operators = parseOperators(row.operators);
        return operators.some((op) => opSet.has(op));
      });
      if (opHit) return opHit;
    }
    return null;
  }

  function buildInsights(model) {
    const rows = Array.isArray(model?.rows) ? model.rows : [];
    const current = model?.currentRow || null;
    if (!rows.length) {
      return ['No competitors matched the selected scope/category filters.'];
    }
    if (!current) {
      return ['Current station entry was not found in the filtered cohort.'];
    }

    const insights = [];
    const leaders = rows.filter((row) => Number.isFinite(row.scoreGap) && row.scoreGap > 0);
    if (!leaders.length) {
      insights.push('You are currently leading this filtered cohort by score.');
    } else {
      const top = leaders[0];
      const gap = Number(top.scoreGap) || 0;
      const avgScorePerQso = Number.isFinite(current.score) && Number.isFinite(current.qsos) && current.qsos > 0
        ? current.score / current.qsos
        : null;
      const avgScorePerMult = Number.isFinite(current.score) && Number.isFinite(current.multTotal) && current.multTotal > 0
        ? current.score / current.multTotal
        : null;
      if (gap > 0 && Number.isFinite(avgScorePerQso) && avgScorePerQso > 0) {
        const needed = Math.ceil(gap / avgScorePerQso);
        insights.push(`To match ${top.callsign}, you need about ${needed.toLocaleString('en-US')} extra QSOs at current efficiency.`);
      }
      if (gap > 0 && Number.isFinite(avgScorePerMult) && avgScorePerMult > 0) {
        const needed = Math.ceil(gap / avgScorePerMult);
        insights.push(`At current efficiency, ${needed.toLocaleString('en-US')} extra multipliers would close the score gap.`);
      }
      if (Number.isFinite(top.multGap) && top.multGap > 0 && (!Number.isFinite(top.qsoGap) || top.multGap >= top.qsoGap)) {
        insights.push('Multiplier deficit is the main gap driver in this cohort. Prioritize new multipliers.');
      } else if (Number.isFinite(top.qsoGap) && top.qsoGap > 0) {
        insights.push('QSO volume is the main gap driver in this cohort. Prioritize higher sustained rate.');
      }
    }
    insights.push(`Cohort rows analyzed: ${rows.length.toLocaleString('en-US')}.`);
    return insights.slice(0, 6);
  }

  function buildModel(options = {}) {
    const scopeType = normalizeScopeType(options.scopeType);
    const targetScopeValue = normalizeScopeValue(scopeType, options.scopeValue);
    const categoryMode = safeString(options.categoryMode).trim().toLowerCase() === 'all' ? 'all' : 'same';
    const targetCategory = normalizeCategoryKey(options.targetCategory);
    const resolveCallMeta = typeof options.resolveCallMeta === 'function'
      ? options.resolveCallMeta
      : () => ({ dxcc: '', continent: '', cqZone: '', ituZone: '' });
    const stationCall = safeString(options.stationCall).trim().toUpperCase();
    const operatorCalls = Array.isArray(options.operatorCalls) ? options.operatorCalls : [];
    const limit = Math.max(1, Math.min(200, Number(options.limit) || 60));

    const rows = dedupeRows((options.rows || [])
      .map((row) => normalizeRow(row))
      .filter(Boolean));

    const filtered = rows.map((row) => {
      const meta = resolveCallMeta(row.callsign) || {};
      let scopeValue = '';
      if (scopeType === 'dxcc') scopeValue = normalizeScopeValue(scopeType, row.geo || meta.dxcc || '');
      else if (scopeType === 'continent') scopeValue = normalizeScopeValue(scopeType, meta.continent || '');
      else if (scopeType === 'cq_zone') scopeValue = normalizeScopeValue(scopeType, meta.cqZone || '');
      else if (scopeType === 'itu_zone') scopeValue = normalizeScopeValue(scopeType, meta.ituZone || '');
      return {
        ...row,
        scopeValue
      };
    }).filter((row) => {
      if (targetScopeValue && row.scopeValue !== targetScopeValue) return false;
      if (categoryMode === 'same' && targetCategory && normalizeCategoryKey(row.category) !== targetCategory) return false;
      return true;
    }).sort((a, b) => {
      const scoreA = Number(a.score);
      const scoreB = Number(b.score);
      if (Number.isFinite(scoreA) && Number.isFinite(scoreB) && scoreA !== scoreB) return scoreB - scoreA;
      const qA = Number(a.qsos);
      const qB = Number(b.qsos);
      if (Number.isFinite(qA) && Number.isFinite(qB) && qA !== qB) return qB - qA;
      return safeString(a.callsign).localeCompare(safeString(b.callsign));
    });

    let currentRow = selectCurrentRow(filtered, stationCall, operatorCalls);
    if (!currentRow && options.fallbackCurrent) {
      const fallback = normalizeRow(options.fallbackCurrent);
      if (fallback) {
        const meta = resolveCallMeta(fallback.callsign) || {};
        let scopeValue = '';
        if (scopeType === 'dxcc') scopeValue = normalizeScopeValue(scopeType, fallback.geo || meta.dxcc || '');
        else if (scopeType === 'continent') scopeValue = normalizeScopeValue(scopeType, meta.continent || '');
        else if (scopeType === 'cq_zone') scopeValue = normalizeScopeValue(scopeType, meta.cqZone || '');
        else if (scopeType === 'itu_zone') scopeValue = normalizeScopeValue(scopeType, meta.ituZone || '');
        const scopeOk = !targetScopeValue || scopeValue === targetScopeValue;
        const categoryOk = categoryMode === 'all' || !targetCategory || normalizeCategoryKey(fallback.category) === targetCategory;
        if (scopeOk && categoryOk) {
          currentRow = {
            ...fallback,
            scopeValue
          };
        }
      }
    }

    const currentScore = Number(currentRow?.score);
    const currentQsos = Number(currentRow?.qsos);
    const currentMult = Number(currentRow?.multTotal);

    const withGaps = filtered.map((row, idx) => {
      const score = Number(row.score);
      const qsos = Number(row.qsos);
      const mult = Number(row.multTotal);
      const scoreGap = Number.isFinite(score) && Number.isFinite(currentScore) ? score - currentScore : null;
      const scoreGapPct = Number.isFinite(scoreGap) && Number.isFinite(currentScore) && currentScore > 0
        ? (scoreGap / currentScore) * 100
        : null;
      const qsoGap = Number.isFinite(qsos) && Number.isFinite(currentQsos) ? qsos - currentQsos : null;
      const multGap = Number.isFinite(mult) && Number.isFinite(currentMult) ? mult - currentMult : null;
      return {
        ...row,
        rank: idx + 1,
        scoreGap,
        scoreGapPct,
        qsoGap,
        multGap
      };
    });

    if (currentRow) {
      const hit = withGaps.find((row) => (
        safeString(row.callsign).toUpperCase() === safeString(currentRow.callsign).toUpperCase()
        && normalizeCategoryKey(row.category) === normalizeCategoryKey(currentRow.category)
      ));
      if (hit) currentRow = hit;
    }

    const limitedRows = withGaps.slice(0, limit);
    const insights = buildInsights({
      rows: withGaps,
      currentRow
    });

    return {
      scopeType,
      targetScopeValue,
      targetCategory,
      categoryMode,
      totalRows: withGaps.length,
      currentRow,
      rows: limitedRows,
      insights
    };
  }

  window.SH6CompetitorCoach = {
    version: '1.0.0',
    normalizeCategoryKey,
    normalizeScopeType,
    normalizeScopeValue,
    buildModel
  };
})();
