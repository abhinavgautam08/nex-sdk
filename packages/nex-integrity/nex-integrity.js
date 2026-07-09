/*! nex-integrity v1.0.0 | (c) 2026 NEX SDK | MIT License */
/**
 * NEX-INTEGRITY | Subresource Integrity (SRI) Monitor
 * Watches for external <script> and <link> tags injected after page load
 * and warns when they are loaded without an `integrity` SRI hash.
 *
 * Usage:
 *   <nex-integrity monitor warn></nex-integrity>
 *   <nex-integrity monitor warn strict></nex-integrity>  <!-- removes offending scripts -->
 *
 * Attributes:
 *   monitor - enables MutationObserver on DOM additions
 *   warn    - logs violations to console
 *   strict  - removes external assets that lack SRI hashes
 *
 * Events: nex-integrity-violation (bubbles, composed)
 */
class NexIntegrity extends HTMLElement {
  connectedCallback() {
    this.style.display = 'none';
    if (this.hasAttribute('monitor')) this._startMonitoring();
    // Also check any already-present elements
    this._auditExisting();
  }

  disconnectedCallback() {
    if (this._observer) this._observer.disconnect();
  }

  _auditExisting() {
    document.querySelectorAll('script[src], link[rel="stylesheet"][href]').forEach(node => {
      this._checkNode(node, false); // don't remove existing ones
    });
  }

  _startMonitoring() {
    this._observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1) this._checkNode(node, true);
        }
      }
    });
    this._observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  _checkNode(node, canRemove) {
    const isScript = node.tagName === 'SCRIPT' && node.src;
    const isStyle  = node.tagName === 'LINK' && node.rel === 'stylesheet' && node.href;

    if (!isScript && !isStyle) return;
    if (node.integrity) return; // SRI present — all good

    // Skip same-origin resources (SRI not required)
    try {
      const url = new URL(node.src || node.href);
      if (url.origin === location.origin) return;
    } catch { return; }

    const violation = {
      tag:          node.tagName.toLowerCase(),
      url:          node.src || node.href,
      hasIntegrity: false,
      action:       'WARNED'
    };

    if (this.hasAttribute('warn')) {
      console.warn('[NexIntegrity] External asset loaded without SRI integrity hash:', violation.url);
    }

    if (canRemove && this.hasAttribute('strict')) {
      node.remove();
      violation.action = 'REMOVED';
    }

    this._emit('nex-integrity-violation', violation);
  }

  _emit(name, detail = {}) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
}

customElements.define('nex-integrity', NexIntegrity);
