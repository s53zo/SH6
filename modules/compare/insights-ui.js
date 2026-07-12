export function createCompareInsightsRenderer(deps = {}) {
  const {
    escapeHtml = defaultEscapeHtml,
    escapeAttr = defaultEscapeAttr,
    formatNumber = defaultFormatNumber,
    formatDate = defaultFormatDate
  } = deps;

  function renderScoreProvenance(slot) {
    const source = String(slot?.scoreProvenance || 'unavailable');
    const labels = {
      computed: 'Computed score',
      claimed: 'Claimed score',
      'logged-points': 'Logged points',
      unavailable: 'Score unavailable'
    };
    const value = Number.isFinite(slot?.score) ? formatNumber(slot.score) : 'N/A';
    const confidence = slot?.scoreConfidence && slot.scoreConfidence !== 'unknown'
      ? ` · ${escapeHtml(slot.scoreConfidence)} confidence`
      : '';
    return `${escapeHtml(labels[source] || source)} ${value}${confidence}`;
  }

  function renderSlotCards(model) {
    return `
      <div class="compare-insights-slot-grid">
        ${model.slots.map((slot) => `
          <article class="compare-insights-slot compare-${escapeAttr(slot.id.toLowerCase())}">
            <div class="compare-insights-slot-head">
              <span class="compare-slot-badge compare-slot-${escapeAttr(slot.id.toLowerCase())}">${escapeHtml(slot.label)}</span>
              <strong>${escapeHtml(slot.call || 'Unknown callsign')}</strong>
            </div>
            <dl>
              <div><dt>QSOs</dt><dd>${formatNumber(slot.qsoTotal)}</dd></div>
              <div><dt>Effective points</dt><dd>${formatNumber(slot.pointTotal)}</dd></div>
              <div><dt>Multipliers</dt><dd>${Number.isFinite(slot.multiplierTotal) ? formatNumber(slot.multiplierTotal) : 'N/A'}</dd></div>
              <div><dt>Break time</dt><dd>${formatNumber(slot.breakMinutes)} min</dd></div>
            </dl>
            <p class="compare-insights-provenance">${renderScoreProvenance(slot)}</p>
          </article>
        `).join('')}
      </div>
    `;
  }

  function renderInsightCards(model) {
    if (!model.insights.length) {
      return `
        <section class="compare-insights-section">
          <h3>Actionable differences</h3>
          <div class="state-card state-info">
            <h4>No material gaps found</h4>
            <p>The selected logs have no supported differences large enough to rank with the available summaries.</p>
          </div>
        </section>
      `;
    }
    return `
      <section class="compare-insights-section" aria-labelledby="compareInsightsActionsTitle">
        <div class="compare-insights-section-head">
          <div>
            <h3 id="compareInsightsActionsTitle">Where to investigate first</h3>
            <p>Ranked from existing SH6 facts and explicitly labelled inferences.</p>
          </div>
        </div>
        <div class="compare-insights-card-grid">
          ${model.insights.map((insight, index) => {
            const kindLabel = insight.kind === 'fact' ? 'Fact' : 'Inference';
            const actionLabel = insight.drilldownFilters ? 'Open supporting QSOs' : `Open ${humanizeReport(insight.targetReport)}`;
            return `
              <article class="compare-insight-card compare-insight-${escapeAttr(insight.severity)}" data-insight-category="${escapeAttr(insight.category)}">
                <div class="compare-insight-card-meta">
                  <span class="compare-insight-rank">#${index + 1}</span>
                  <span class="compare-insight-kind compare-insight-kind-${escapeAttr(insight.kind)}">${kindLabel}</span>
                  <span class="compare-insight-severity">${escapeHtml(insight.severity)}</span>
                </div>
                <h4>${escapeHtml(insight.title)}</h4>
                <p>${escapeHtml(insight.why)}</p>
                <button
                  type="button"
                  class="button compare-insight-action no-print"
                  data-compare-insight-id="${escapeAttr(insight.id)}"
                >${escapeHtml(actionLabel)}</button>
                <p class="compare-insight-export-note print-only">Supporting report: ${escapeHtml(humanizeReport(insight.targetReport))}</p>
              </article>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }

  function renderTimeline(model) {
    if (!model.timeline.length) return '';
    const slotHeaders = model.slots.map((slot) => `<th colspan="4" scope="colgroup">${escapeHtml(slot.label)}</th>`).join('');
    const metricHeaders = model.slots.map(() => '<th scope="col">QSOs</th><th scope="col">Points</th><th scope="col">Contest-to-date points</th><th scope="col">Score pace*</th>').join('');
    const rows = model.timeline.map((bucket) => `
      <tr>
        <th scope="row">
          <button type="button" class="link-button compare-insights-hour no-print" data-compare-insights-hour-start="${escapeAttr(bucket.startTs)}" data-compare-insights-hour-end="${escapeAttr(bucket.endTs)}">${escapeHtml(formatDate(bucket.startTs))}</button>
          <span class="print-only">${escapeHtml(formatDate(bucket.startTs))}</span>
        </th>
        ${model.slots.map((slot) => {
          const values = bucket.bySlot?.[slot.id] || {};
          return `
            <td>${formatNumber(values.qsos || 0)}</td>
            <td>${formatNumber(values.points || 0)}</td>
            <td>${formatNumber(values.cumulativePoints || 0)}</td>
            <td>${Number.isFinite(values.scoreProgress) ? formatNumber(values.scoreProgress) : 'N/A'}</td>
          `;
        }).join('')}
      </tr>
    `).join('');
    return `
      <section class="compare-insights-section" aria-labelledby="compareInsightsTimelineTitle">
        <div class="compare-insights-section-head">
          <div>
            <h3 id="compareInsightsTimelineTitle">Synchronized UTC timeline</h3>
            <p>Click an hour to open its QSOs. Cumulative values remain contest-to-date when a shared UTC range is active. *Score pace is an inference scaled from the final selected total; it is not exact in-contest scoring.</p>
          </div>
        </div>
        <div class="table-wrap compare-insights-timeline-wrap">
          <table class="mtc compare-insights-timeline">
            <thead>
              <tr class="thc"><th rowspan="2" scope="col">UTC hour</th>${slotHeaders}</tr>
              <tr class="thc">${metricHeaders}</tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderReferenceControl(model) {
    return `
      <label class="compare-insights-reference no-print">
        Benchmark log
        <select data-compare-insights-reference aria-label="Benchmark log for Compare Insights">
          ${model.slots.map((slot) => `<option value="${escapeAttr(slot.id)}"${slot.id === model.referenceSlotId ? ' selected' : ''}>${escapeHtml(slot.label)} · ${escapeHtml(slot.call || 'Unknown')}</option>`).join('')}
        </select>
      </label>
    `;
  }

  function render(model, context = {}) {
    if (!model?.visible) return '';
    const warnings = Array.isArray(model.axis?.warnings) ? model.axis.warnings : [];
    const activeFilterText = String(context.activeFilterText || '').trim();
    return `
      <section class="compare-insights-cockpit" aria-labelledby="compareInsightsTitle" data-compare-insights-visible="true">
        <header class="compare-insights-hero">
          <div>
            <p class="compare-insights-eyebrow">Compare Insights</p>
            <h2 id="compareInsightsTitle">Where did I lose points?</h2>
            <p>Compare score, rate, multipliers, bands, operating style, and breaks without opening several reports.</p>
          </div>
          ${renderReferenceControl(model)}
        </header>
        ${activeFilterText ? `<div class="compare-insights-filter-context"><strong>Drilldown filters preserved:</strong> ${escapeHtml(activeFilterText)}. Cockpit totals remain full-log; the shared UTC range limits timeline insights.</div>` : ''}
        ${warnings.length ? `<div class="state-card state-warning"><h3>Comparison limits</h3><ul>${warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join('')}</ul></div>` : ''}
        ${renderSlotCards(model)}
        ${renderInsightCards(model)}
        ${renderTimeline(model)}
        <details class="compare-insights-limitations">
          <summary>How SH6 calculated these insights</summary>
          <ul>${(model.limitations || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        </details>
      </section>
    `;
  }

  return { render };
}

function humanizeReport(value) {
  return String(value || 'report').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function defaultFormatNumber(value) {
  return Math.round(Number(value) || 0).toLocaleString('en-US');
}

function defaultFormatDate(value) {
  const date = new Date(Number(value));
  return Number.isFinite(date.getTime()) ? `${date.toISOString().slice(0, 10)} ${date.toISOString().slice(11, 13)}:00 UTC` : 'Unknown UTC';
}

function defaultEscapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function defaultEscapeAttr(value) {
  return defaultEscapeHtml(value);
}
