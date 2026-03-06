export function createExportRuntime(deps = {}) {
  const {
    getState,
    getReports,
    getSlotById,
    getActiveCompareSlots,
    withBandContext,
    withStaticVirtualTableRender,
    renderReport,
    renderPlaceholder,
    showOverlayNotice,
    trackEvent,
    formatNumberSh6,
    formatDateSh6,
    formatBandLabel,
    formatFrequency,
    bandClass,
    modeClass,
    continentClass,
    escapeCall,
    escapeCountry,
    escapeHtml,
    escapeAttr
  } = deps;

  const EXPORT_EXCLUDE_IDS = new Set(['load_logs', 'export']);

  function getStateSafe() {
    return getState?.() || {};
  }

  function getReportsSafe() {
    return Array.isArray(getReports?.()) ? getReports() : [];
  }

  function buildExportFilename(ext) {
    const state = getStateSafe();
    const call = state.derived?.contestMeta?.stationCallsign || 'CALL';
    const contest = state.derived?.contestMeta?.contestId || 'CONTEST';
    const year = state.derived?.timeRange?.minTs ? new Date(state.derived.timeRange.minTs).getUTCFullYear() : 'YEAR';
    const safe = (val) => String(val || '').trim().replace(/[^A-Za-z0-9_-]+/g, '_');
    return `${safe(call)}_${safe(contest)}_${year}.${ext}`;
  }

  function buildExportFilenameForSlot(ext, slotId = 'A') {
    const state = getStateSafe();
    const key = String(slotId || 'A').toUpperCase();
    const slot = getSlotById?.(key) || state;
    const call = slot?.derived?.contestMeta?.stationCallsign || 'CALL';
    const contest = slot?.derived?.contestMeta?.contestId || 'CONTEST';
    const year = slot?.derived?.timeRange?.minTs ? new Date(slot.derived.timeRange.minTs).getUTCFullYear() : 'YEAR';
    const safe = (val) => String(val || '').trim().replace(/[^A-Za-z0-9_-]+/g, '_');
    const suffix = key === 'A' ? '' : `_${safe(key)}`;
    return `${safe(call)}_${safe(contest)}_${year}${suffix}.${ext}`;
  }

  function downloadTextFile(text, filename, mimeType = 'text/plain;charset=utf-8') {
    const blob = new Blob([String(text || '')], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function renderLogExport() {
    const state = getStateSafe();
    if (!state.qsoData) return renderPlaceholder({ id: 'log', title: 'Log' });
    const rows = state.qsoData.qsos.map((q, idx) => {
      const call = escapeCall(q.call || '');
      const op = escapeHtml(q.op || '');
      const country = escapeCountry(q.country || '');
      const grid = escapeHtml(q.grid || '');
      const mode = escapeHtml(q.mode || '');
      const band = escapeHtml(formatBandLabel(q.band || ''));
      const cont = escapeHtml(q.continent || '');
      const flags = escapeHtml(q.isQtc ? 'QTC' : `${q.inMaster === false ? 'NOT-IN-MASTER' : ''}${q.isDupe ? ' DUPE' : ''}`.trim());
      const time = escapeHtml(q.time || '');
      const freq = escapeHtml(formatFrequency(q.freq));
      const cq = escapeHtml(q.cqZone || '');
      const itu = escapeHtml(q.ituZone || '');
      return `
      <tr class="${idx % 2 === 0 ? 'td1' : 'td0'}">
        <td class="log-qso c1">${formatNumberSh6(q.qsoNumber || '')}</td>
        <td>${q.ts ? formatDateSh6(q.ts) : time}</td>
        <td class="${bandClass(q.band)}">${band}</td>
        <td class="${modeClass(q.mode)}">${mode}</td>
        <td class="${bandClass(q.band)}">${freq}</td>
        <td class="tl">${call}</td>
        <td>${formatNumberSh6(q.rstSent || '')}</td>
        <td>${formatNumberSh6(q.rstRcvd || '')}</td>
        <td>${formatNumberSh6(q.stx || q.exchSent || '')}</td>
        <td>${formatNumberSh6(q.srx || q.exchRcvd || '')}</td>
        <td>${op}</td>
        <td class="tl">${country}</td>
        <td class="tac ${continentClass(q.continent)}">${cont}</td>
        <td>${cq}</td>
        <td>${itu}</td>
        <td class="tl">${grid}</td>
        <td class="tl">${flags}</td>
      </tr>
    `;
    }).join('');
    return `
      <table class="mtc log-table" style="margin-top:5px;margin-bottom:10px;text-align:right;">
        <tr class="thc"><th>#</th><th>Time</th><th>Band</th><th>Mode</th><th>Freq</th><th>Call</th><th>RST S</th><th>RST R</th><th>Exch Sent</th><th>Exch Rcvd</th><th>Op</th><th>Country</th><th>Cont.</th><th>CQ</th><th>ITU</th><th>Grid</th><th>Flags</th></tr>
        ${rows}
      </table>
    `;
  }

  function exportCbrForSlot(slotId = 'A') {
    const state = getStateSafe();
    const key = String(slotId || 'A').toUpperCase();
    const slot = getSlotById?.(key) || state;
    const rawText = slot?.rawLogText || '';
    if (!rawText) {
      showOverlayNotice?.(`No raw log available in Log ${key}.`, 2400);
      return;
    }
    const filename = buildExportFilenameForSlot('cbr', key);
    downloadTextFile(rawText, filename, 'text/plain;charset=utf-8');

    const compareSlots = getActiveCompareSlots?.() || [];
    const logParams = {};
    compareSlots.forEach((entry) => {
      logParams[`log_${entry.id.toLowerCase()}`] = entry.slot?.derived?.contestMeta?.stationCallsign || '';
    });
    trackEvent?.('download_cbr', {
      ...logParams,
      slot: key,
      compare: state.compareEnabled ? 'yes' : 'no',
      compare_count: state.compareCount || 1
    });
    showOverlayNotice?.(`Exported ${filename}.`, 1800);
  }

  function stripLinks(html) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    wrapper.querySelectorAll('a').forEach((link) => {
      const span = document.createElement('span');
      span.textContent = link.textContent || '';
      const title = link.getAttribute('title');
      if (title) span.setAttribute('title', title);
      link.replaceWith(span);
    });
    return wrapper.innerHTML;
  }

  function renderReportExport(report) {
    if (report.id === 'log') return renderLogExport();
    if (report.id === 'map_view') {
      return '<p>Map view is interactive and not included in exports. Use the in-app map or KMZ files.</p>';
    }
    const html = withStaticVirtualTableRender(() => renderReport(report));
    return stripLinks(html);
  }

  function resolveExportReports(reportIds) {
    const reports = getReportsSafe();
    const allowed = reports.filter((r) => !EXPORT_EXCLUDE_IDS.has(r.id));
    if (!Array.isArray(reportIds) || reportIds.length === 0) return allowed;
    const map = new Map(allowed.map((r) => [r.id, r]));
    return reportIds.map((id) => map.get(id)).filter(Boolean);
  }

  function buildExportHtmlSections(reportList) {
    if (!reportList || reportList.length === 0) {
      return '<section class="export-section"><div class="export-header"><div class="export-title">No sections selected</div><div class="export-page"></div></div><p>No content selected for export.</p></section>';
    }
    return reportList.map((r) => `
      <section class="export-section">
        <div class="export-header">
          <div class="export-title">${r.title}</div>
          <div class="export-page"></div>
        </div>
        ${withBandContext(r.id, () => renderReportExport(r))}
      </section>
    `).join('');
  }

  async function getStyleText() {
    try {
      const res = await fetch('style.css', { cache: 'no-store' });
      if (!res.ok) throw new Error('style fetch failed');
      return await res.text();
    } catch (err) {
      console.warn('Style fetch failed:', err);
      return '';
    }
  }

  async function exportHtmlFile(reportIds) {
    const state = getStateSafe();
    if (!state.qsoData) return;
    const styleText = await getStyleText();
    const body = `<div class="export-doc">${buildExportHtmlSections(resolveExportReports(reportIds))}</div>`;
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>SH6 Export</title><style>${styleText}</style></head><body>${body}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = buildExportFilename('html');
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPdf(reportIds) {
    const state = getStateSafe();
    if (!state.qsoData) return;
    const styleText = await getStyleText();
    const body = `<div class="export-doc">${buildExportHtmlSections(resolveExportReports(reportIds))}</div>`;
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>SH6 Export</title><style>${styleText}</style></head><body>${body}</body></html>`;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.document.title = buildExportFilename('pdf').replace(/\.pdf$/, '');
    const triggerPrint = () => {
      win.focus();
      win.print();
    };
    win.addEventListener('load', () => {
      const fonts = win.document.fonts;
      if (fonts && typeof fonts.ready?.then === 'function') {
        fonts.ready.then(() => setTimeout(triggerPrint, 0));
      } else {
        setTimeout(triggerPrint, 0);
      }
    });
  }

  function openExportDialog(type) {
    const state = getStateSafe();
    if (!state.qsoData) return;
    const existing = document.getElementById('exportDialog');
    if (existing) existing.remove();
    const reportOptions = resolveExportReports().map((r) => `
      <label class="export-option">
        <input type="checkbox" data-report-id="${escapeAttr(r.id)}" checked>
        <span>${escapeHtml(r.title)}</span>
      </label>
    `).join('');
    const overlay = document.createElement('div');
    overlay.id = 'exportDialog';
    overlay.className = 'export-dialog-overlay no-print';
    overlay.innerHTML = `
      <div class="export-dialog">
        <div class="export-dialog-head">
          <strong>Export ${type === 'pdf' ? 'PDF' : 'HTML'}</strong>
        </div>
        <p>Select sections to include.</p>
        <div class="export-dialog-actions">
          <button type="button" id="exportSelectAll">Select all</button>
          <button type="button" id="exportSelectNone">Select none</button>
          <button type="button" id="exportCurrent">Current report only</button>
        </div>
        <div class="export-dialog-list">
          ${reportOptions}
        </div>
        <div class="export-dialog-footer">
          <button type="button" id="exportDoIt">Export selected</button>
          <button type="button" id="exportCancel">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    const getChecks = () => Array.from(overlay.querySelectorAll('input[type="checkbox"][data-report-id]'));
    const setAll = (checked) => getChecks().forEach((cb) => { cb.checked = checked; });
    const close = () => overlay.remove();
    const exportSelected = (reportIds) => {
      const compareSlots = getActiveCompareSlots?.() || [];
      const logParams = {};
      compareSlots.forEach((entry) => {
        logParams[`log_${entry.id.toLowerCase()}`] = entry.slot?.derived?.contestMeta?.stationCallsign || '';
      });
      trackEvent?.(type === 'pdf' ? 'download_pdf' : 'download_html', {
        ...logParams,
        compare: state.compareEnabled ? 'yes' : 'no',
        compare_count: state.compareCount || 1
      });
      if (type === 'pdf') {
        exportPdf(reportIds);
      } else {
        exportHtmlFile(reportIds);
      }
      close();
    };
    overlay.addEventListener('click', (evt) => {
      if (evt.target === overlay) close();
    });
    const selectAllBtn = overlay.querySelector('#exportSelectAll');
    const selectNoneBtn = overlay.querySelector('#exportSelectNone');
    const exportCurrentBtn = overlay.querySelector('#exportCurrent');
    const exportBtn = overlay.querySelector('#exportDoIt');
    const cancelBtn = overlay.querySelector('#exportCancel');
    if (selectAllBtn) selectAllBtn.addEventListener('click', () => setAll(true));
    if (selectNoneBtn) selectNoneBtn.addEventListener('click', () => setAll(false));
    if (exportCurrentBtn) {
      exportCurrentBtn.addEventListener('click', () => {
        const reports = getReportsSafe();
        const report = reports[state.activeIndex];
        if (!report) return;
        if (EXPORT_EXCLUDE_IDS.has(report.id)) {
          window.alert('The current view cannot be exported. Please select sections manually.');
          return;
        }
        exportSelected([report.id]);
      });
    }
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const selected = getChecks().filter((cb) => cb.checked).map((cb) => cb.dataset.reportId);
        if (!selected.length) {
          window.alert('Select at least one section to export.');
          return;
        }
        exportSelected(selected);
      });
    }
    if (cancelBtn) cancelBtn.addEventListener('click', close);
  }

  return {
    buildExportFilename,
    buildExportFilenameForSlot,
    exportCbrForSlot,
    openExportDialog,
    renderLogExport,
    renderReportExport
  };
}
