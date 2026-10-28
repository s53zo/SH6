(function initSourceStatus(globalScope) {
  'use strict';

  // Presentation only: these labels never authorize a fetch or a redirect.
  function classifySource(source) {
    const unknown = { mark: '', className: '' };
    if (typeof source !== 'string' || !/^https:\/\/[^/?#\\\s@]+(?:[/?#]|$)/i.test(source)) return unknown;
    try {
      // No base URL: relative resources must not inherit a trusted hostname.
      const url = new URL(source);
      if (url.protocol !== 'https:' || url.username || url.password || url.port) return unknown;
      if (url.hostname === 'azure.s53m.com') return { mark: '✓', className: 'source-local' };
      if (url.hostname === 'corsproxy.io' || url.hostname === 'api.allorigins.win') {
        return { mark: '✓', className: 'source-proxy' };
      }
    } catch (error) {
      return unknown;
    }
    return unknown;
  }

  function isProxy(source) {
    return classifySource(source).className === 'source-proxy';
  }

  globalScope.SH6SourceStatus = { classifySource, isProxy };
})(globalThis);
