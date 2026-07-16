export function createMultiplierOpportunitiesView(deps = {}) {
  const escapeHtml = deps.escapeHtml || ((value) => String(value ?? ''));
  const escapeAttr = deps.escapeAttr || escapeHtml;
  const formatNumber = deps.formatNumber || ((value) => String(value ?? 0));
  const formatDate = deps.formatDate || ((value) => value == null ? 'N/A' : new Date(value).toISOString());

  function option(value, label, selected) {
    return `<option value="${escapeAttr(value)}"${value === selected ? ' selected' : ''}>${escapeHtml(label)}</option>`;
  }

  function displayMultiplier(row) {
    return row?.dxccPrefix || row?.entityLabel || row?.entityKey || 'N/A';
  }

  function renderSummary(model) {
    const counts = model.confidenceCounts || {};
    const weightedValue = (model.candidates || []).filter((row) => row.confidence !== 'No evidence')
      .reduce((sum, row) => sum + Number(row.weightedValue || 0), 0);
    return `<section class="mult-op-section" aria-labelledby="mult-op-summary-title">
      <div class="mult-op-section-head"><h2 id="mult-op-summary-title">Opportunity summary</h2><p>Facts come from scoring credits; opportunity labels are propagation inferences.</p></div>
      <dl class="mult-op-metrics">
        <div><dt>Reference</dt><dd>${escapeHtml(model.referenceCallsign)}</dd></div>
        <div><dt>Reference multipliers</dt><dd>${formatNumber(model.referenceWeightedTotal)}</dd></div>
        <div><dt>Comparison leader</dt><dd>${escapeHtml(model.comparisonLeaderCallsign || 'N/A')}</dd></div>
        <div><dt>Leader multipliers</dt><dd>${formatNumber(model.comparisonLeaderWeightedTotal)}</dd></div>
        <div><dt>Scoring rule</dt><dd>${escapeHtml(model.ruleId)}</dd></div>
        <div><dt>Raw gap</dt><dd>${formatNumber(model.rawGap)}</dd></div>
        <div><dt>Weighted gap</dt><dd>${formatNumber(model.weightedGap)}</dd></div>
        <div><dt>High / Medium</dt><dd>${formatNumber(counts.High || 0)} / ${formatNumber(counts.Medium || 0)}</dd></div>
        <div><dt>Plausible weighted value</dt><dd>${formatNumber(weightedValue)}</dd></div>
      </dl>
    </section>`;
  }

  function renderBreakdown(candidates, bandModeGaps) {
    const map = new Map();
    (bandModeGaps || []).forEach((gap) => {
      const key = `${gap.band || 'UNKNOWN'}|${gap.mode || 'ALL'}`;
      map.set(key, { band: gap.band || 'UNKNOWN', mode: gap.mode || 'ALL', raw: gap.rawGap, weighted: gap.weightedGap, High: 0, Medium: 0, Low: 0, referenceQsos: gap.referenceQsos, loadedQsos: gap.loadedQsos, operatingHours: gap.operatingHours, sameBandEvidence: gap.sameBandEvidence, strongestOpportunity: gap.strongestOpportunity });
    });
    candidates.forEach((row) => {
      const key = `${row.band || 'UNKNOWN'}|${row.mode || 'ALL'}`;
      const item = map.get(key) || Array.from(map.values()).find((candidate) => candidate.band === row.band);
      if (!item) return;
      if (Object.prototype.hasOwnProperty.call(item, row.confidence)) item[row.confidence] += 1;
    });
    const rows = Array.from(map.values()).sort((a, b) => a.band.localeCompare(b.band) || a.mode.localeCompare(b.mode));
    return `<section class="mult-op-section" aria-labelledby="mult-op-band-title">
      <div class="mult-op-section-head"><h2 id="mult-op-band-title">Band and mode breakdown</h2></div>
      <div class="table-wrap"><table class="sticky-head"><thead><tr><th>Band</th><th>Mode</th><th>Raw gap</th><th>Weighted gap</th><th>High</th><th>Medium</th><th>Low</th><th>QSOs ref / all</th><th>Operating span</th><th>Same-band evidence</th><th>Strongest opportunity</th></tr></thead><tbody>
        ${rows.map((row) => `<tr><td>${escapeHtml(row.band)}</td><td>${escapeHtml(row.mode)}</td><td>${formatNumber(row.raw)}</td><td>${formatNumber(row.weighted)}</td><td>${formatNumber(row.High)}</td><td>${formatNumber(row.Medium)}</td><td>${formatNumber(row.Low)}</td><td>${formatNumber(row.referenceQsos || 0)} / ${formatNumber(row.loadedQsos || 0)}</td><td>${Number(row.operatingHours || 0).toFixed(1)} h</td><td>${formatNumber(row.sameBandEvidence || 0)}</td><td>${escapeHtml(row.strongestOpportunity || 'N/A')}</td></tr>`).join('') || '<tr><td colspan="11">No QSOs were made on the active bands.</td></tr>'}
      </tbody></table></div>
    </section>`;
  }

  function renderTable(candidates) {
    const visible = candidates.slice(0, 500);
    return `<section class="mult-op-section" aria-labelledby="mult-op-table-title">
      <div class="mult-op-section-head"><h2 id="mult-op-table-title">Opportunity table</h2><p>${formatNumber(candidates.length)} entities${candidates.length > visible.length ? `; first ${formatNumber(visible.length)} shown` : ''}</p></div>
      <div class="table-wrap table-wrap--tall"><table class="sticky-head"><thead><tr>
        <th>DXCC / multiplier</th><th>Band</th><th>Value</th><th>Found by</th><th>Candidate calls</th><th>Evidence</th><th>Reference activity</th><th>Confidence</th><th>Details</th>
      </tr></thead><tbody>${visible.map((row) => `<tr>
        <td title="${escapeAttr(row.entityLabel)}">${escapeHtml(displayMultiplier(row))}</td><td>${escapeHtml(row.band)}</td><td>${formatNumber(row.weightedValue)}</td><td>${escapeHtml(row.creditedSlots.join(', ') || 'Spots')}</td><td>${escapeHtml(row.representativeCallsigns.slice(0, 3).join(', ') || 'N/A')}</td>
        <td>${escapeHtml(row.strongestEvidenceSource)}${row.strongestEvidenceSource !== 'None' ? ` · ${formatNumber((row.factors?.distinctRbnSkimmers || 0) + (row.factors?.distinctClusterSpotters || 0))} rx` : ''}</td><td>${row.factors?.sameBandActivity ? 'Same band' : (row.factors?.referenceActive ? 'Other band' : 'Off time')}</td>
        <td><span class="mult-op-confidence mult-op-confidence--${escapeAttr(row.confidence.toLowerCase().replace(/\s+/g, '-'))}">${escapeHtml(row.confidence)}</span></td>
        <td><button type="button" class="mult-op-inspect" data-candidate-key="${escapeAttr(row.key)}" aria-label="Inspect ${escapeAttr(displayMultiplier(row))}">View</button></td>
      </tr>`).join('') || '<tr><td colspan="9">No opportunities match the active filters.</td></tr>'}</tbody></table></div>
    </section>`;
  }

  function renderDrilldown(candidate) {
    if (!candidate) return `<section class="mult-op-section" aria-labelledby="mult-op-detail-title"><div class="mult-op-section-head"><h2 id="mult-op-detail-title">Evidence drilldown</h2><p>Select an entity from the opportunity table.</p></div></section>`;
    const events = candidate.evidence || [];
    return `<section class="mult-op-section" aria-labelledby="mult-op-detail-title">
      <div class="mult-op-section-head"><h2 id="mult-op-detail-title">${escapeHtml(displayMultiplier(candidate))}${candidate.dxccPrefix && candidate.entityLabel !== candidate.dxccPrefix ? ` · ${escapeHtml(candidate.entityLabel)}` : ''}</h2><p>${escapeHtml(candidate.explanation)}</p></div>
      <dl class="mult-op-detail-facts">
        <div><dt>Multiplier group</dt><dd>${escapeHtml(candidate.group)}</dd></div><div><dt>Scope</dt><dd>${escapeHtml(candidate.countingScope)} / ${escapeHtml(candidate.scopeKey)}</dd></div>
        <div><dt>Comparison credits</dt><dd>${formatNumber(candidate.comparisonCredits.length)}</dd></div><div><dt>Rejected reference credits</dt><dd>${formatNumber(candidate.rejectedCredits.length)}</dd></div>
        <div><dt>RBN skimmers</dt><dd>${formatNumber(candidate.factors.distinctRbnSkimmers)}</dd></div><div><dt>Cluster spotters</dt><dd>${formatNumber(candidate.factors.distinctClusterSpotters)}</dd></div>
      </dl>
      <div class="table-wrap"><table><thead><tr><th>UTC</th><th>Source</th><th>Candidate</th><th>Receiver</th><th>Band</th><th>Frequency</th><th>SNR</th><th>Reference activity</th></tr></thead><tbody>
        ${events.slice(0, 300).map((event) => `<tr><td>${escapeHtml(formatDate(event.ts))}</td><td>${escapeHtml(event.source === 'rbn' ? 'RBN' : 'Cluster')}</td><td>${escapeHtml(event.dxCall)}</td><td>${escapeHtml(event.receiverCall)} (${escapeHtml(event.receiverContinent)})</td><td>${escapeHtml(event.band || candidate.band)}</td><td>${escapeHtml(event.freqKHz ?? event.freqMHz ?? '')}</td><td>${escapeHtml(event.snr ?? '')}</td><td>${event.referenceActivity?.sameBand ? 'Same band' : (event.referenceActivity?.anyBand ? 'Other band' : 'Off time')}</td></tr>`).join('') || '<tr><td colspan="8">No qualifying same-continent evidence loaded.</td></tr>'}
      </tbody></table></div>
      <p class="mult-op-limitation">Same-continent reception shows propagation into the reference continent. It is not adjudication and does not prove the reference station could have completed the QSO.</p>
    </section>`;
  }

  function renderTimeline(model) {
    const byHour = new Map();
    (model.candidates || []).forEach((candidate) => (candidate.evidence || []).forEach((event) => {
      const hour = new Date(event.ts).toISOString().slice(0, 13) + ':00Z';
      const row = byHour.get(hour) || { events: 0, high: new Set(), medium: new Set() };
      row.events += 1;
      if (candidate.confidence === 'High') row.high.add(candidate.key);
      if (candidate.confidence === 'Medium') row.medium.add(candidate.key);
      byHour.set(hour, row);
    }));
    const timelineSlots = model.creditTimeline?.[0]?.slots || [];
    return `<section class="mult-op-section" aria-labelledby="mult-op-timeline-title"><div class="mult-op-section-head"><h2 id="mult-op-timeline-title">Opportunity timeline</h2></div>
      <div class="table-wrap"><table><thead><tr><th>UTC hour</th>${timelineSlots.map((slot) => `<th>${escapeHtml(slot.callsign)} cumulative</th><th>${escapeHtml(slot.callsign)} new</th>`).join('')}<th>Reference state</th></tr></thead><tbody>
        ${(model.creditTimeline || []).map((row) => `<tr><td>${escapeHtml(formatDate(row.hourTs))}</td>${row.slots.map((slot) => `<td>${formatNumber(slot.weighted)}</td><td>${formatNumber(slot.newWeighted)}</td>`).join('')}<td>${Number(row.slots[0]?.newRaw || 0) === 0 ? 'Multiplier drought' : 'New multipliers'}</td></tr>`).join('') || '<tr><td>No credit timeline is available.</td></tr>'}
      </tbody></table></div>
      <div class="mult-op-timeline">${Array.from(byHour.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([hour, row]) => `<div><time>${escapeHtml(hour)}</time><span style="--density:${Math.min(100, row.events * 8)}%"></span><strong>${formatNumber(row.events)} evidence</strong><small>${formatNumber(row.high.size)} high, ${formatNumber(row.medium.size)} medium</small></div>`).join('') || '<p>No qualifying evidence timeline is available.</p>'}</div>
    </section>`;
  }

  function render(model, options = {}) {
    if (!model?.supported) return `<div class="report-empty"><h2>Multiplier Opportunities</h2><p>${escapeHtml(model?.reason || 'Multiplier analysis is unavailable.')}</p></div>`;
    const filters = options.filters || {};
    const slots = options.slots || [];
    const bands = Array.from(new Set(model.candidates.map((row) => row.band))).sort();
    const candidates = model.candidates.filter((row) => {
      if (filters.search && !`${row.dxccPrefix || ''} ${row.entityLabel} ${row.entityKey} ${row.representativeCallsigns.join(' ')}`.toUpperCase().includes(filters.search.toUpperCase())) return false;
      if (filters.comparison && !row.creditedSlots.includes(filters.comparison)) return false;
      if (filters.band && row.band !== filters.band) return false;
      if (filters.confidence && row.confidence !== filters.confidence) return false;
      if (filters.evidence && row.strongestEvidenceSource !== filters.evidence) return false;
      return true;
    });
    const selected = model.candidates.find((row) => row.key === options.selectedCandidateKey) || candidates[0] || null;
    const incompatibilities = model.compatibility.filter((row) => !row.compatible);
    return `<div class="mult-op-report">
      <header class="mult-op-header"><div><h1>Multiplier Opportunities</h1><p>Contest-rule credits, comparison activity, and same-continent reception evidence.</p></div>
        <div class="mult-op-controls">
          <label>Reference log<select id="mult-op-reference">${slots.map((slot) => option(slot.id, `${slot.id}: ${slot.callsign || slot.label}`, model.referenceSlotId)).join('')}</select></label>
          <label>Activity window<select id="mult-op-window">${[5, 10, 15, 30, 60].map((value) => option(String(value), `${value} minutes`, String(model.windowMinutes))).join('')}</select></label>
          <button type="button" data-mult-op-rbn${options.rbnStatus === 'loading' ? ' disabled' : ''}>${options.rbnStatus === 'loading' ? 'Loading RBN...' : 'Load candidate RBN'}</button>
        </div>
      </header>
      ${incompatibilities.length ? `<div class="notice warning">${escapeHtml(incompatibilities.map((row) => `${row.slotId}: ${row.reason}`).join(' '))} Incompatible logs are shown separately and excluded from gap totals.</div>` : ''}
      ${options.dataNotice ? `<div class="notice">${escapeHtml(options.dataNotice)}</div>` : ''}
      ${renderSummary(model)}
      ${renderBreakdown(candidates, (model.bandModeGaps || []).filter((row) => !filters.band || row.band === filters.band))}
      <section class="mult-op-section mult-op-filters" aria-label="Opportunity filters">
        <label>Search<input id="mult-op-search" type="search" value="${escapeAttr(filters.search || '')}" placeholder="DXCC prefix or callsign"></label>
        <label>Comparison log<select id="mult-op-comparison">${option('', 'All comparison logs', filters.comparison || '')}${slots.filter((slot) => slot.id !== model.referenceSlotId).map((slot) => option(slot.id, `${slot.id}: ${slot.callsign || slot.label}`, filters.comparison || '')).join('')}</select></label>
        <label>Band<select id="mult-op-band">${option('', 'All bands', filters.band || '')}${bands.map((value) => option(value, value, filters.band || '')).join('')}</select></label>
        <label>Confidence<select id="mult-op-confidence">${option('', 'All confidence', filters.confidence || '')}${['High', 'Medium', 'Low', 'No evidence'].map((value) => option(value, value, filters.confidence || '')).join('')}</select></label>
        <label>Evidence source<select id="mult-op-evidence">${option('', 'All evidence', filters.evidence || '')}${['RBN + cluster', 'RBN', 'Cluster', 'None'].map((value) => option(value, value, filters.evidence || '')).join('')}</select></label>
      </section>
      ${renderTable(candidates)}
      ${renderDrilldown(selected)}
      ${renderTimeline(model)}
      <section class="mult-op-section" aria-labelledby="mult-op-export-title"><div class="mult-op-section-head"><h2 id="mult-op-export-title">Export</h2></div><div class="mult-op-export-actions">
        <button type="button" data-mult-op-export="ledger">Multiplier ledger CSV</button><button type="button" data-mult-op-export="candidates">Candidates CSV</button><button type="button" data-mult-op-export="evidence">Evidence CSV</button><button type="button" data-mult-op-export="bands">Band/mode CSV</button>
      </div></section>
    </div>`;
  }

  return { render };
}
