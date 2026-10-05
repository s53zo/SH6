(() => {
  // Presentation only: never infer whether arbitrary text is data or a warning.
  function simplifyReportHtml(html, documentRef = globalThis.document) {
    if (!documentRef || !/data-report-note|report-more|operating-analysis-details|compare-insights-limitations/.test(html)) return html;
    const root = documentRef.createElement('div');
    root.innerHTML = html;
    const scopes = new Map();
    const scopeFor = node => node.closest('.compare-panel, .operating-style-report, .multiplier-overview-panel, .spots-panel, [data-retained-root]') || root;
    const disclosureFor = scope => {
      if (scopes.has(scope)) return scopes.get(scope);
      const details = documentRef.createElement('details');
      details.className = 'report-more';
      const summary = documentRef.createElement('summary');
      summary.textContent = 'More';
      details.append(summary);
      scopes.set(scope, details);
      return details;
    };
    root.querySelectorAll('details.report-more, details.operating-analysis-details, details.compare-insights-limitations').forEach(details => {
      if (!root.contains(details)) return;
      const target = disclosureFor(scopeFor(details));
      if (details.hasAttribute('data-compare-settings')) target.setAttribute('data-compare-settings', '');
      const heading = details.querySelector(':scope > summary');
      Array.from(details.childNodes).filter(node => node !== heading).forEach(node => target.append(node));
      details.remove();
    });
    root.querySelectorAll('[data-report-note]').forEach(note => {
      const target = disclosureFor(scopeFor(note));
      note.removeAttribute('data-report-note');
      if (note.dataset.noteTitle) {
        const heading = documentRef.createElement('h4');
        heading.textContent = note.dataset.noteTitle;
        target.append(heading);
        note.removeAttribute('data-note-title');
      }
      target.append(note);
    });
    for (const [scope, details] of scopes) {
      const content = Array.from(details.childNodes).slice(1).some(node => node.textContent.trim() || (node.nodeType === 1 && node.querySelector('input,select,button,img,table')));
      if (content) scope.append(details);
    }
    root.querySelectorAll('.report-more .report-more, .report-more .operating-analysis-details').forEach(nested => {
      const summary = nested.querySelector(':scope > summary');
      summary?.remove();
      nested.replaceWith(...nested.childNodes);
    });
    root.querySelectorAll('.report-intro-card').forEach(card => {
      if (!card.textContent.trim()) card.remove();
    });
    return root.innerHTML;
  }
  globalThis.SH6ReportCleanup = simplifyReportHtml;
})();
