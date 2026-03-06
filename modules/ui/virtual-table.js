const DEFAULT_ROW_HEIGHT = 28;
const DEFAULT_OVERSCAN = 6;
const MIN_ROW_HEIGHT = 16;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toFiniteNumber(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function toPositiveInteger(value, fallback, min = 1) {
  return Math.max(min, Math.round(toFiniteNumber(value, fallback)));
}

function isElement(value) {
  return value && value.nodeType === 1;
}

function isNode(value) {
  return value && typeof value.nodeType === 'number';
}

function normalizeRenderer(renderRow) {
  if (typeof renderRow === 'function') return renderRow;
  return (row) => row;
}

function normalizeAlign(align) {
  return align === 'auto' || align === 'center' || align === 'end' ? align : 'start';
}

function createSpacerRow(documentRef, height, columnCount) {
  const safeHeight = Math.max(0, Math.round(height));
  if (!safeHeight) return null;
  const safeColumns = Math.max(1, Math.round(columnCount || 1));

  const row = documentRef.createElement('tr');
  row.className = 'virtual-spacer-row';
  row.setAttribute('aria-hidden', 'true');

  const cell = documentRef.createElement('td');
  cell.colSpan = safeColumns;
  cell.style.padding = '0';
  cell.style.border = '0';
  cell.style.height = `${safeHeight}px`;

  const block = documentRef.createElement('div');
  block.style.height = `${safeHeight}px`;
  cell.append(block);
  row.append(cell);
  return row;
}

function appendRenderedRow(target, output, documentRef, fallbackColumnCount) {
  if (output == null || output === false) return;

  if (Array.isArray(output)) {
    output.forEach((item) => appendRenderedRow(target, item, documentRef, fallbackColumnCount));
    return;
  }

  if (isNode(output)) {
    target.append(output);
    return;
  }

  if (typeof output === 'string') {
    const template = documentRef.createElement('template');
    template.innerHTML = output;
    target.append(template.content);
    return;
  }

  const row = documentRef.createElement('tr');
  const cell = documentRef.createElement('td');
  cell.colSpan = Math.max(1, Math.round(fallbackColumnCount || 1));
  cell.textContent = String(output);
  row.append(cell);
  target.append(row);
}

function resolveRange(scrollTop, viewportHeight, rowHeight, totalRows, overscan) {
  if (!totalRows) {
    return {
      start: 0,
      end: 0,
      visibleStart: 0,
      visibleEnd: 0,
      topHeight: 0,
      bottomHeight: 0
    };
  }

  const maxIndex = totalRows - 1;
  const visibleStart = clamp(Math.floor(Math.max(0, scrollTop) / rowHeight), 0, maxIndex);
  const visibleCount = Math.max(1, Math.ceil(Math.max(viewportHeight, rowHeight) / rowHeight));
  const visibleEnd = clamp(visibleStart + visibleCount, visibleStart + 1, totalRows);
  const start = clamp(visibleStart - overscan, 0, maxIndex);
  const end = clamp(visibleEnd + overscan, start + 1, totalRows);

  return {
    start,
    end,
    visibleStart,
    visibleEnd,
    topHeight: start * rowHeight,
    bottomHeight: Math.max(0, (totalRows - end) * rowHeight)
  };
}

function applyTableMetrics(tableBody, totalRows) {
  const table = tableBody.closest('table');
  if (table) {
    table.setAttribute('aria-rowcount', String(totalRows));
  }
}

function createNormalizedState(config) {
  const rows = Array.isArray(config.rows) ? config.rows.slice() : [];
  return {
    rows,
    rowHeight: Math.max(MIN_ROW_HEIGHT, toFiniteNumber(config.rowHeight, DEFAULT_ROW_HEIGHT)),
    overscan: toPositiveInteger(config.overscan, DEFAULT_OVERSCAN),
    columnCount: toPositiveInteger(config.columnCount, 1),
    renderRow: normalizeRenderer(config.renderRow),
    emptyHtml: config.emptyHtml == null ? '' : String(config.emptyHtml),
    onRangeChange: typeof config.onRangeChange === 'function' ? config.onRangeChange : null
  };
}

export function mountVirtualTable(config = {}) {
  const scrollHost = config.scrollHost;
  const tableBody = config.tableBody;

  if (!isElement(scrollHost)) {
    throw new Error('mountVirtualTable requires a scrollHost element.');
  }
  if (!isElement(tableBody)) {
    throw new Error('mountVirtualTable requires a tableBody element.');
  }

  const documentRef = tableBody.ownerDocument || document;
  const state = createNormalizedState(config);
  let destroyed = false;
  let rafId = 0;
  let lastRenderKey = '';
  let lastRange = resolveRange(0, 0, state.rowHeight, state.rows.length, state.overscan);
  let resizeObserver = null;

  function emitRangeChange(range) {
    if (typeof state.onRangeChange === 'function') {
      state.onRangeChange({
        start: range.start,
        end: range.end,
        visibleStart: range.visibleStart,
        visibleEnd: range.visibleEnd,
        totalRows: state.rows.length,
        rowHeight: state.rowHeight,
        overscan: state.overscan
      });
    }
  }

  function renderRows(range) {
    const fragment = documentRef.createDocumentFragment();
    const topSpacer = createSpacerRow(documentRef, range.topHeight, state.columnCount);
    const bottomSpacer = createSpacerRow(documentRef, range.bottomHeight, state.columnCount);

    if (topSpacer) fragment.append(topSpacer);

    for (let index = range.start; index < range.end; index += 1) {
      appendRenderedRow(
        fragment,
        state.renderRow(state.rows[index], index, state.rows),
        documentRef,
        state.columnCount
      );
    }

    if (bottomSpacer) fragment.append(bottomSpacer);

    tableBody.replaceChildren(fragment);
  }

  function render(force = false) {
    if (destroyed) return;

    const totalRows = state.rows.length;
    applyTableMetrics(tableBody, totalRows);

    if (!totalRows) {
      const emptyKey = `empty:${state.emptyHtml}`;
      if (force || lastRenderKey !== emptyKey) {
        if (state.emptyHtml) {
          tableBody.innerHTML = state.emptyHtml;
        } else {
          tableBody.replaceChildren();
        }
        lastRenderKey = emptyKey;
        lastRange = resolveRange(0, 0, state.rowHeight, 0, state.overscan);
        emitRangeChange(lastRange);
      }
      return;
    }

    const nextRange = resolveRange(
      scrollHost.scrollTop,
      Math.max(scrollHost.clientHeight || 0, state.rowHeight),
      state.rowHeight,
      totalRows,
      state.overscan
    );
    const nextKey = [
      nextRange.start,
      nextRange.end,
      nextRange.visibleStart,
      nextRange.visibleEnd,
      totalRows,
      state.rowHeight,
      state.columnCount
    ].join(':');

    if (!force && nextKey === lastRenderKey) return;

    renderRows(nextRange);
    lastRenderKey = nextKey;
    lastRange = nextRange;
    emitRangeChange(nextRange);
  }

  function scheduleRender(force = false) {
    if (destroyed) return;
    if (force) lastRenderKey = '';
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      render(force);
    });
  }

  function onScroll() {
    scheduleRender(false);
  }

  scrollHost.addEventListener('scroll', onScroll, { passive: true });

  if (typeof ResizeObserver === 'function') {
    resizeObserver = new ResizeObserver(() => scheduleRender(true));
    resizeObserver.observe(scrollHost);
  } else {
    window.addEventListener('resize', onScroll);
  }

  render(true);

  return {
    update(next = {}) {
      if (destroyed) return;
      if (Array.isArray(next.rows)) state.rows = next.rows.slice();
      if (next.rowHeight != null) {
        state.rowHeight = Math.max(MIN_ROW_HEIGHT, toFiniteNumber(next.rowHeight, state.rowHeight));
      }
      if (next.overscan != null) {
        state.overscan = toPositiveInteger(next.overscan, state.overscan);
      }
      if (next.columnCount != null || next.colspan != null) {
        state.columnCount = toPositiveInteger(
          next.columnCount != null ? next.columnCount : next.colspan,
          state.columnCount
        );
      }
      if (next.renderRow != null || next.rowRenderer != null) {
        state.renderRow = normalizeRenderer(
          next.renderRow != null ? next.renderRow : next.rowRenderer
        );
      }
      if (next.emptyHtml != null) {
        state.emptyHtml = String(next.emptyHtml);
      }
      if (next.onRangeChange != null) {
        state.onRangeChange = typeof next.onRangeChange === 'function' ? next.onRangeChange : null;
      }
      scheduleRender(true);
    },
    refresh() {
      if (destroyed) return;
      scheduleRender(true);
    },
    getState() {
      return {
        rows: state.rows.slice(),
        rowHeight: state.rowHeight,
        overscan: state.overscan,
        columnCount: state.columnCount,
        range: { ...lastRange }
      };
    },
    scrollToIndex(index = 0, options = {}) {
      if (destroyed || !state.rows.length) return;

      const safeIndex = clamp(
        Math.round(toFiniteNumber(index, 0)),
        0,
        Math.max(0, state.rows.length - 1)
      );
      const align = normalizeAlign(typeof options === 'string' ? options : options.align);
      const viewportHeight = Math.max(scrollHost.clientHeight || 0, state.rowHeight);
      const rowTop = safeIndex * state.rowHeight;
      const rowBottom = rowTop + state.rowHeight;
      const viewportTop = scrollHost.scrollTop;
      const viewportBottom = viewportTop + viewportHeight;
      let nextTop = rowTop;

      if (align === 'center') {
        nextTop = Math.max(0, rowTop - Math.floor((viewportHeight - state.rowHeight) / 2));
      } else if (align === 'end') {
        nextTop = Math.max(0, rowBottom - viewportHeight);
      } else if (align === 'auto') {
        if (rowTop >= viewportTop && rowBottom <= viewportBottom) return;
        nextTop = rowTop < viewportTop ? rowTop : Math.max(0, rowBottom - viewportHeight);
      }

      scrollHost.scrollTop = nextTop;
      scheduleRender(true);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (rafId) cancelAnimationFrame(rafId);
      scrollHost.removeEventListener('scroll', onScroll);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', onScroll);
      }
    }
  };
}

export function createVirtualTableController(config = {}) {
  return mountVirtualTable({
    scrollHost: config.scrollEl || config.scrollHost,
    tableBody: config.tbody || config.tableBody,
    rows: config.rows,
    rowHeight: config.rowHeight,
    overscan: config.overscan,
    columnCount: config.colspan || config.columnCount,
    renderRow: config.renderRow || config.rowRenderer,
    emptyHtml: config.emptyHtml,
    onRangeChange: config.onRangeChange
  });
}
