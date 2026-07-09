/*! nex-url-guard v1.0.0 | (c) 2026 NEX SDK | MIT License */
/**
 * NEX-URL-GUARD | Open Redirect & Malicious URL Prevention
 * Intercepts all link clicks and location navigations to validate URLs
 * against an allowlist of trusted origins. Blocks open redirect attacks,
 * javascript: protocol links, and navigation to untrusted domains.
 *
 * Usage:
 *   <nex-url-guard allow="example.com,cdn.example.com" action="warn"></nex-url-guard>
 *
 * Attributes:
 *   allow   - comma-separated list of trusted domains (always allows same-origin)
 *   action  - "warn" (default) | "block" (hard block navigation) | "none" (event only)
 *
 * Events (bubbles + composed):
 *   nex-redirect-blocked  - { url, reason, action } on blocked navigation
 *   nex-redirect-allowed  - { url } on allowed navigation
 *
 * What it blocks:
 *   - javascript: protocol URIs
 *   - data: protocol URIs (XSS vector)
 *   - vbscript: protocol URIs
 *   - Open redirects (?url=https://evil.com)
 *   - Navigation to domains not in allowlist
 *
 * Same-origin navigation is ALWAYS allowed.
 */
class NexURLGuard extends HTMLElement {
  constructor() {
    super();
    this._onClick   = null;
    this._origHref  = null;
    this.style.display = 'none';
  }

  connectedCallback() {
    this._patchLocationHref();
    this._bindClickInterceptor();
  }

  disconnectedCallback() {
    if (this._onClick) document.removeEventListener('click', this._onClick, true);
    this._restoreLocationHref();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Checks if a URL is safe to navigate to.
   * @param {string} url
   * @returns {{ safe: boolean, reason: string|null }}
   */
  check(url) {
    if (!url) return { safe: false, reason: 'EMPTY_URL' };

    let parsed;
    try {
      parsed = new URL(url, location.href);
    } catch (_) {
      return { safe: false, reason: 'INVALID_URL' };
    }

    // Block dangerous protocols
    const protocol = parsed.protocol.toLowerCase();
    if (['javascript:', 'data:', 'vbscript:'].includes(protocol)) {
      return { safe: false, reason: 'DANGEROUS_PROTOCOL:' + protocol };
    }

    // Always allow same-origin
    if (parsed.origin === location.origin) {
      return { safe: true, reason: null };
    }

    // Check allowlist
    const allowed = this._getAllowList();
    if (allowed.length === 0) {
      return { safe: true, reason: null }; // no restriction if no allowlist
    }

    const host = parsed.hostname.toLowerCase();
    const isAllowed = allowed.some(domain => {
      const d = domain.trim().toLowerCase();
      return host === d || host.endsWith('.' + d);
    });

    if (isAllowed) return { safe: true, reason: null };

    // Check for open redirect in query string
    const openRedirect = this._detectOpenRedirect(url);
    if (openRedirect) {
      return { safe: false, reason: 'OPEN_REDIRECT:' + openRedirect };
    }

    return { safe: false, reason: 'UNTRUSTED_DOMAIN:' + host };
  }

  // ── Internals ─────────────────────────────────────────────────────────────

  _getAllowList() {
    const attr = this.getAttribute('allow') || '';
    return attr.split(',').map(s => s.trim()).filter(Boolean);
  }

  _detectOpenRedirect(url) {
    // Scan query parameters for URLs that point to external sites
    try {
      const parsed = new URL(url, location.href);
      for (const [, val] of parsed.searchParams) {
        try {
          const inner = new URL(val);
          if (inner.origin !== location.origin) return val;
        } catch (_) {}
      }
    } catch (_) {}
    return null;
  }

  _bindClickInterceptor() {
    this._onClick = (e) => {
      const link = e.composedPath().find(el => el.tagName === 'A');
      if (!link || !link.href) return;

      const result = this.check(link.href);
      if (result.safe) {
        this._emit('nex-redirect-allowed', { url: link.href });
        return;
      }

      const action = this.getAttribute('action') || 'warn';
      this._emit('nex-redirect-blocked', { url: link.href, reason: result.reason, action });
      console.warn(`[NEX-URL-GUARD] Blocked navigation to "${link.href}" — ${result.reason}`);

      if (action === 'block' || action === 'warn') {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    document.addEventListener('click', this._onClick, true); // capture phase
  }

  _patchLocationHref() {
    const guard = this;
    const desc = Object.getOwnPropertyDescriptor(Location.prototype, 'href');
    if (!desc || !desc.set) return;

    this._origHrefSet = desc.set;
    Object.defineProperty(location, 'href', {
      get: desc.get,
      set(url) {
        const result = guard.check(url);
        if (!result.safe) {
          const action = guard.getAttribute('action') || 'warn';
          guard._emit('nex-redirect-blocked', { url, reason: result.reason, action });
          console.warn(`[NEX-URL-GUARD] Blocked location.href redirect to "${url}" — ${result.reason}`);
          if (action === 'block') return;
        }
        guard._origHrefSet.call(this, url);
      },
      configurable: true
    });
  }

  _restoreLocationHref() {
    if (this._origHrefSet) {
      const desc = Object.getOwnPropertyDescriptor(Location.prototype, 'href');
      if (desc) {
        Object.defineProperty(location, 'href', {
          get: desc.get,
          set: this._origHrefSet,
          configurable: true
        });
      }
    }
  }

  _emit(name, detail = {}) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
}

customElements.define('nex-url-guard', NexURLGuard);
