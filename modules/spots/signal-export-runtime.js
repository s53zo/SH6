export function createRbnSignalExportRuntime(deps = {}) {
  const {
    canvasToBlobAsync,
    normalizeSpotterBase,
    sanitizeFilenameToken,
    showOverlayNotice,
    trackEvent,
    downloadBlobFile,
    html2canvasUrl = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
    renderElementToPngBlob: renderElementToPngBlobOverride,
    renderElementToPngBlobWithHtml2Canvas: renderElementToPngBlobWithHtml2CanvasOverride,
    copyImageBlobToClipboard: copyImageBlobToClipboardOverride
  } = deps;

  let html2CanvasLoadPromise = null;

  function getWindowSafe() {
    return typeof window !== 'undefined' ? window : globalThis;
  }

  function getDocumentSafe() {
    const win = getWindowSafe();
    return win.document || (typeof document !== 'undefined' ? document : null);
  }

  function canvasToBlobAsyncSafe(canvas, type = 'image/png', quality) {
    if (typeof canvasToBlobAsync === 'function') return canvasToBlobAsync(canvas, type, quality);
    return Promise.reject(new Error('canvasToBlobAsync unavailable'));
  }

  function normalizeSpotterBaseSafe(value) {
    if (typeof normalizeSpotterBase === 'function') return normalizeSpotterBase(value);
    return String(value || '').trim().toUpperCase().replace(/\s+/g, '').replace(/-\d+$/, '');
  }

  function sanitizeFilenameTokenSafe(value, fallback = 'item') {
    if (typeof sanitizeFilenameToken === 'function') return sanitizeFilenameToken(value, fallback);
    return String(value || '').trim() || fallback;
  }

  function showOverlayNoticeSafe(message, duration = 4500) {
    if (typeof showOverlayNotice === 'function') showOverlayNotice(message, duration);
  }

  function trackEventSafe(name, params) {
    if (typeof trackEvent === 'function') trackEvent(name, params);
  }

  function downloadBlobFileSafe(blob, filename) {
    if (typeof downloadBlobFile === 'function') downloadBlobFile(blob, filename);
  }

  function loadImageFromUrl(url) {
    return new Promise((resolve, reject) => {
      const win = getWindowSafe();
      const ImageCtor = win.Image || globalThis.Image;
      if (typeof ImageCtor === 'undefined') {
        reject(new Error('Image constructor unavailable'));
        return;
      }
      const img = new ImageCtor();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Unable to load rendered SVG image'));
      img.src = url;
    });
  }

  function loadHtml2CanvasLibrary() {
    const win = getWindowSafe();
    const doc = getDocumentSafe();
    if (typeof win.html2canvas === 'function') {
      return Promise.resolve(win.html2canvas);
    }
    if (html2CanvasLoadPromise) return html2CanvasLoadPromise;
    html2CanvasLoadPromise = new Promise((resolve, reject) => {
      if (!doc?.createElement || !doc.head?.appendChild) {
        reject(new Error('Document head unavailable'));
        return;
      }
      const script = doc.createElement('script');
      script.src = html2canvasUrl;
      script.async = true;
      script.onload = () => {
        if (typeof win.html2canvas === 'function') {
          resolve(win.html2canvas);
        } else {
          reject(new Error('html2canvas loaded but API is unavailable'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load html2canvas'));
      doc.head.appendChild(script);
    }).catch((err) => {
      html2CanvasLoadPromise = null;
      throw err;
    });
    return html2CanvasLoadPromise;
  }

  function copyComputedStyleToNode(sourceNode, targetNode) {
    const win = getWindowSafe();
    const ElementCtor = win.Element || globalThis.Element;
    if (typeof ElementCtor === 'undefined' || !(sourceNode instanceof ElementCtor) || !(targetNode instanceof ElementCtor)) return;
    const computed = win.getComputedStyle(sourceNode);
    for (let i = 0; i < computed.length; i += 1) {
      const prop = computed[i];
      targetNode.style.setProperty(prop, computed.getPropertyValue(prop), computed.getPropertyPriority(prop));
    }
  }

  function inlineComputedStylesDeep(sourceRoot, cloneRoot) {
    const win = getWindowSafe();
    const ElementCtor = win.Element || globalThis.Element;
    if (typeof ElementCtor === 'undefined' || !(sourceRoot instanceof ElementCtor) || !(cloneRoot instanceof ElementCtor)) return;
    copyComputedStyleToNode(sourceRoot, cloneRoot);
    const sourceChildren = Array.from(sourceRoot.children);
    const cloneChildren = Array.from(cloneRoot.children);
    const count = Math.min(sourceChildren.length, cloneChildren.length);
    for (let i = 0; i < count; i += 1) {
      inlineComputedStylesDeep(sourceChildren[i], cloneChildren[i]);
    }
  }

  function replaceCanvasWithImageSnapshots(sourceRoot, cloneRoot) {
    const win = getWindowSafe();
    const ElementCtor = win.Element || globalThis.Element;
    const CanvasCtor = win.HTMLCanvasElement || globalThis.HTMLCanvasElement;
    if (typeof ElementCtor === 'undefined' || typeof CanvasCtor === 'undefined') return;
    if (!(sourceRoot instanceof ElementCtor) || !(cloneRoot instanceof ElementCtor)) return;
    const doc = getDocumentSafe();
    if (!doc?.createElement) return;
    const sourceCanvases = Array.from(sourceRoot.querySelectorAll('canvas'));
    const cloneCanvases = Array.from(cloneRoot.querySelectorAll('canvas'));
    const count = Math.min(sourceCanvases.length, cloneCanvases.length);
    for (let i = 0; i < count; i += 1) {
      const sourceCanvas = sourceCanvases[i];
      const cloneCanvas = cloneCanvases[i];
      if (!(sourceCanvas instanceof CanvasCtor) || !(cloneCanvas instanceof CanvasCtor)) continue;
      let dataUrl = '';
      try {
        dataUrl = sourceCanvas.toDataURL('image/png');
      } catch (err) {
        dataUrl = '';
      }
      if (!dataUrl) continue;
      const image = doc.createElement('img');
      image.src = dataUrl;
      image.alt = sourceCanvas.getAttribute('aria-label') || 'Graph image';
      copyComputedStyleToNode(sourceCanvas, image);
      const width = sourceCanvas.clientWidth || sourceCanvas.width || 1;
      const height = sourceCanvas.clientHeight || sourceCanvas.height || 1;
      image.style.width = `${Math.max(1, Math.round(width))}px`;
      image.style.height = `${Math.max(1, Math.round(height))}px`;
      image.width = Math.max(1, Math.round(width));
      image.height = Math.max(1, Math.round(height));
      image.style.display = 'block';
      cloneCanvas.replaceWith(image);
    }
  }

  function applyRbnSignalExportLayout(root) {
    const win = getWindowSafe();
    const ElementCtor = win.Element || globalThis.Element;
    if (typeof ElementCtor === 'undefined' || !(root instanceof ElementCtor)) return;
    root.querySelectorAll('.rbn-signal-legend').forEach((legend) => {
      legend.style.overflowX = 'visible';
      legend.style.overflowY = 'visible';
      legend.style.flexWrap = 'wrap';
      legend.style.alignItems = 'flex-start';
    });
    root.querySelectorAll('.rbn-signal-legend-bands').forEach((bands) => {
      bands.style.flexWrap = 'wrap';
    });
    root.querySelectorAll('.rbn-legend-shape').forEach((shape) => {
      shape.style.marginLeft = '0';
      shape.style.flexWrap = 'wrap';
    });
  }

  async function renderElementToPngBlobInternal(element, options = {}) {
    const win = getWindowSafe();
    const doc = getDocumentSafe();
    const HTMLElementCtor = win.HTMLElement || globalThis.HTMLElement;
    if (typeof HTMLElementCtor === 'undefined' || !(element instanceof HTMLElementCtor)) {
      throw new Error('Element not found');
    }
    if (!doc?.createElement || !doc.body?.appendChild) {
      throw new Error('Document body unavailable');
    }
    const rect = element.getBoundingClientRect();
    const baseWidth = Math.max(1, Math.ceil(rect.width || element.offsetWidth || 1));
    const clone = element.cloneNode(true);
    if (!(clone instanceof HTMLElementCtor)) {
      throw new Error('Unable to clone element');
    }
    inlineComputedStylesDeep(element, clone);
    replaceCanvasWithImageSnapshots(element, clone);
    if (typeof options.prepareClone === 'function') {
      options.prepareClone(clone);
    }

    const host = doc.createElement('div');
    host.style.position = 'fixed';
    host.style.left = '-100000px';
    host.style.top = '0';
    host.style.opacity = '0';
    host.style.pointerEvents = 'none';
    host.style.zIndex = '-1';
    host.style.width = `${baseWidth}px`;
    clone.style.width = `${baseWidth}px`;
    clone.style.maxWidth = `${baseWidth}px`;
    host.appendChild(clone);
    doc.body.appendChild(host);
    let width = baseWidth;
    let height = Math.max(1, Math.ceil(element.getBoundingClientRect().height || element.offsetHeight || 1));
    let serialized = '';
    try {
      if (doc.fonts && doc.fonts.ready) {
        try {
          await doc.fonts.ready;
        } catch (err) {
          // Continue even when fonts cannot be awaited.
        }
      }

      const measureRect = clone.getBoundingClientRect();
      width = Math.max(1, Math.ceil(measureRect.width || baseWidth));
      height = Math.max(1, Math.ceil(measureRect.height || clone.scrollHeight || element.scrollHeight || 1));

      const wrapper = doc.createElement('div');
      wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
      wrapper.style.width = `${width}px`;
      wrapper.style.height = `${height}px`;
      wrapper.style.boxSizing = 'border-box';
      wrapper.appendChild(clone);
      serialized = new XMLSerializer().serializeToString(wrapper);
    } finally {
      if (host.parentNode) host.parentNode.removeChild(host);
    }
    if (!serialized) throw new Error('Failed to serialize graph content');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><foreignObject x="0" y="0" width="100%" height="100%">${serialized}</foreignObject></svg>`;
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    try {
      const img = await loadImageFromUrl(svgUrl);
      const dpr = Math.max(1, Math.min(2, win.devicePixelRatio || 1));
      const canvas = doc.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      return await canvasToBlobAsyncSafe(canvas, 'image/png');
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
  }

  async function renderElementToPngBlobWithHtml2CanvasInternal(element) {
    const win = getWindowSafe();
    const HTMLElementCtor = win.HTMLElement || globalThis.HTMLElement;
    if (typeof HTMLElementCtor === 'undefined' || !(element instanceof HTMLElementCtor)) {
      throw new Error('Element not found');
    }
    const html2canvas = await loadHtml2CanvasLibrary();
    const token = `rbn-export-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    element.dataset.exportToken = token;
    try {
      const dpr = Math.max(1, Math.min(2, win.devicePixelRatio || 1));
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: dpr,
        useCORS: true,
        logging: false,
        onclone: (doc) => {
          const clone = doc.querySelector(`[data-export-token="${token}"]`);
          if (clone) applyRbnSignalExportLayout(clone);
        }
      });
      return await canvasToBlobAsyncSafe(canvas, 'image/png');
    } finally {
      delete element.dataset.exportToken;
    }
  }

  async function copyImageBlobToClipboardInternal(blob) {
    const win = getWindowSafe();
    if (!(blob instanceof Blob)) return false;
    if (!(win.navigator?.clipboard && win.navigator.clipboard.write) || typeof win.ClipboardItem === 'undefined') {
      return false;
    }
    try {
      const item = new win.ClipboardItem({ [blob.type || 'image/png']: blob });
      await win.navigator.clipboard.write([item]);
      return true;
    } catch (err) {
      return false;
    }
  }

  async function renderElementToPngBlob(element, options = {}) {
    if (typeof renderElementToPngBlobOverride === 'function') {
      return renderElementToPngBlobOverride(element, options);
    }
    return renderElementToPngBlobInternal(element, options);
  }

  async function renderElementToPngBlobWithHtml2Canvas(element) {
    if (typeof renderElementToPngBlobWithHtml2CanvasOverride === 'function') {
      return renderElementToPngBlobWithHtml2CanvasOverride(element);
    }
    return renderElementToPngBlobWithHtml2CanvasInternal(element);
  }

  async function copyImageBlobToClipboard(blob) {
    if (typeof copyImageBlobToClipboardOverride === 'function') {
      return copyImageBlobToClipboardOverride(blob);
    }
    return copyImageBlobToClipboardInternal(blob);
  }

  async function copyRbnSignalCardImage(button) {
    const win = getWindowSafe();
    const HTMLButtonElementCtor = win.HTMLButtonElement || globalThis.HTMLButtonElement;
    const HTMLElementCtor = win.HTMLElement || globalThis.HTMLElement;
    if (typeof HTMLButtonElementCtor === 'undefined' || typeof HTMLElementCtor === 'undefined' || !(button instanceof HTMLButtonElementCtor)) return;
    const card = button.closest('.rbn-signal-card');
    const body = card ? card.querySelector('.rbn-signal-body') : null;
    if (!(body instanceof HTMLElementCtor)) {
      showOverlayNoticeSafe('Unable to find graph to copy.', 2600);
      return;
    }
    const labelEl = button.querySelector('.rbn-signal-copy-label');
    const prevLabel = labelEl ? labelEl.textContent : '';
    const continent = String(button.dataset.continent || '').trim().toUpperCase() || 'N/A';
    const select = card ? card.querySelector('.rbn-signal-select') : null;
    const spotter = normalizeSpotterBaseSafe(String(select?.value || '').trim()) || 'spotter';
    const filename = `rbn_compare_signal_${sanitizeFilenameTokenSafe(continent)}_${sanitizeFilenameTokenSafe(spotter)}.png`;

    button.disabled = true;
    button.classList.add('is-working');
    if (labelEl) labelEl.textContent = 'Copying...';
    try {
      let blob = null;
      try {
        blob = await renderElementToPngBlob(body, {
          prepareClone: applyRbnSignalExportLayout
        });
      } catch (primaryErr) {
        console.warn('Primary graph export failed, trying html2canvas fallback:', primaryErr);
        blob = await renderElementToPngBlobWithHtml2Canvas(body);
      }
      const copied = await copyImageBlobToClipboard(blob);
      trackEventSafe('rbn_compare_signal_copy_image', {
        continent,
        method: copied ? 'clipboard' : 'download'
      });
      if (copied) {
        showOverlayNoticeSafe('Graph copied as image.', 2200);
      } else {
        downloadBlobFileSafe(blob, filename);
        showOverlayNoticeSafe('Clipboard image copy is not available, PNG downloaded instead.', 3200);
      }
    } catch (err) {
      console.error('Copy graph as image failed:', err);
      showOverlayNoticeSafe('Unable to copy graph as an image.', 3200);
    } finally {
      button.disabled = false;
      button.classList.remove('is-working');
      if (labelEl) labelEl.textContent = prevLabel || 'Copy as image';
    }
  }

  return {
    applyRbnSignalExportLayout,
    renderElementToPngBlob,
    renderElementToPngBlobWithHtml2Canvas,
    copyImageBlobToClipboard,
    copyRbnSignalCardImage
  };
}
