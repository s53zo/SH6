export function createRetainedReportRuntime(deps = {}) {
  const {
    escapeAttr,
    getDom,
    getCurrentReportId,
    isRetainedReport,
    loadVirtualTableModule,
    renderRetainedReportContent,
    bindReportInteractions,
    renderCurrentReportWithLoading
  } = deps;

  const virtualTableControllers = new Map();
  const retainedReportModels = Object.create(null);
  let staticVirtualTableRenderDepth = 0;

  function escapeAttrSafe(value) {
    if (typeof escapeAttr === 'function') return escapeAttr(value);
    return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => {
      switch (ch) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#39;';
        default: return ch;
      }
    });
  }

  function getViewContainer() {
    const dom = typeof getDom === 'function' ? getDom() : null;
    return dom?.viewContainer || null;
  }

  function destroyVirtualTableControllers() {
    virtualTableControllers.forEach((controller) => {
      try {
        controller.destroy();
      } catch (err) {
        /* ignore teardown failures */
      }
    });
    virtualTableControllers.clear();
  }

  function setRetainedReportModel(reportId, model) {
    retainedReportModels[String(reportId || '')] = model || null;
  }

  function renderRetainedReportShell(reportId, html) {
    const key = String(reportId || '').split('::')[0];
    return `<div class="retained-report-root" data-retained-root="${escapeAttrSafe(key)}">${html}</div>`;
  }

  function joinTableRows(rows) {
    if (Array.isArray(rows)) return rows.join('');
    return String(rows || '');
  }

  function sanitizeTableHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = String(html || '');
    template.content.querySelectorAll('script,iframe,object,embed,link,meta,base,style').forEach((node) => node.remove());
    template.content.querySelectorAll('*').forEach((node) => {
      Array.from(node.attributes || []).forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = String(attr.value || '').replace(/[\u0000-\u001F\u007F\s]+/g, '').toLowerCase();
        const unsafeUrl = value.startsWith('javascript:')
          || value.startsWith('vbscript:')
          || value.startsWith('data:');
        const unsafeStyle = /(?:expression\s*\(|url\s*\(|javascript:|vbscript:|data:text\/html)/i.test(attr.value || '');
        if (name.startsWith('on') || name === 'srcdoc') {
          node.removeAttribute(attr.name);
        } else if ((name === 'href' || name === 'src' || name === 'srcset' || name === 'xlink:href' || name === 'action' || name === 'formaction') && unsafeUrl) {
          node.removeAttribute(attr.name);
        } else if (name === 'style' && unsafeStyle) {
          node.removeAttribute(attr.name);
        }
      });
    });
    return template.innerHTML;
  }

  function withStaticVirtualTableRender(fn) {
    staticVirtualTableRenderDepth += 1;
    try {
      return fn();
    } finally {
      staticVirtualTableRenderDepth = Math.max(0, staticVirtualTableRenderDepth - 1);
    }
  }

  function renderRetainedVirtualTable(reportId, options = {}) {
    const key = String(reportId || '').split('::')[0];
    const rows = Array.isArray(options.rows) ? options.rows : [];
    const columnCount = Math.max(1, Number(options.columnCount) || 1);
    const emptyHtml = options.emptyHtml == null ? '' : String(options.emptyHtml);
    const tableClass = options.tableClass || 'mtc';
    const tableStyle = options.tableStyle || 'margin-top:5px;margin-bottom:10px;text-align:right;';
    const colgroup = sanitizeTableHtml(options.colgroupHtml || '');
    const header = sanitizeTableHtml(options.headerHtml || '');
    const footer = sanitizeTableHtml(options.footerHtml ? `<tfoot>${options.footerHtml}</tfoot>` : '');
    if (staticVirtualTableRenderDepth > 0) {
      const body = sanitizeTableHtml(rows.length ? joinTableRows(rows) : emptyHtml);
      return `
        <table class="${escapeAttrSafe(tableClass)}" style="${escapeAttrSafe(tableStyle)}">
          ${colgroup}
          ${header}
          <tbody>${body}</tbody>
          ${footer}
        </table>
      `;
    }
    setRetainedReportModel(key, {
      rows,
      rowHeight: Math.max(20, Number(options.rowHeight) || 28),
      overscan: Math.max(4, Number(options.overscan) || 10),
      colspan: columnCount,
      emptyHtml
    });
    return `
      <div class="virtual-table-shell" data-virtual-table="${escapeAttrSafe(key)}">
        <table class="${escapeAttrSafe(tableClass)}" style="${escapeAttrSafe(tableStyle)}">
          ${colgroup}
          ${header}
          <tbody data-virtual-body="${escapeAttrSafe(key)}"></tbody>
          ${footer}
        </table>
      </div>
    `;
  }

  function bindVirtualTable(reportId) {
    const key = String(reportId || '').split('::')[0];
    const viewContainer = getViewContainer();
    const shell = viewContainer instanceof HTMLElement
      ? viewContainer.querySelector(`[data-virtual-table="${escapeAttrSafe(key)}"]`)
      : null;
    const tbody = viewContainer instanceof HTMLElement
      ? viewContainer.querySelector(`[data-virtual-body="${escapeAttrSafe(key)}"]`)
      : null;
    const model = retainedReportModels[key];
    if (!(shell instanceof HTMLElement) || !(tbody instanceof HTMLElement) || !model || !Array.isArray(model.rows)) {
      return Promise.resolve();
    }
    return Promise.resolve(loadVirtualTableModule?.())
      .then((mod) => {
        if (!mod || typeof mod.createVirtualTableController !== 'function') return;
        const existing = virtualTableControllers.get(key);
        if (existing) {
          existing.destroy();
          virtualTableControllers.delete(key);
        }
        const controller = mod.createVirtualTableController({
          scrollEl: shell,
          tbody,
          rows: model.rows,
          rowHeight: model.rowHeight,
          overscan: model.overscan,
          colspan: model.colspan,
          emptyHtml: model.emptyHtml
        });
        virtualTableControllers.set(key, controller);
      })
      .catch(() => {
        if (tbody instanceof HTMLElement) {
          tbody.innerHTML = sanitizeTableHtml(model.rows.length ? model.rows.join('') : model.emptyHtml);
        }
      });
  }

  function refreshCurrentReportView(reportId = getCurrentReportId?.() || '') {
    const key = String(reportId || '').split('::')[0];
    const currentReportId = String(getCurrentReportId?.() || '').split('::')[0];
    const viewContainer = getViewContainer();
    if (!isRetainedReport?.(key) || currentReportId !== key || !(viewContainer instanceof HTMLElement)) {
      renderCurrentReportWithLoading?.();
      return;
    }
    const root = viewContainer.querySelector(`[data-retained-root="${escapeAttrSafe(key)}"]`);
    if (!(root instanceof HTMLElement)) {
      renderCurrentReportWithLoading?.();
      return;
    }
    destroyVirtualTableControllers();
    root.innerHTML = renderRetainedReportContent?.(key) || '';
    bindReportInteractions?.(key);
  }

  return {
    bindVirtualTable,
    destroyVirtualTableControllers,
    refreshCurrentReportView,
    renderRetainedReportShell,
    renderRetainedVirtualTable,
    setRetainedReportModel,
    withStaticVirtualTableRender
  };
}
