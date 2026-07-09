/*! nex-https v1.0.0 | (c) 2026 NEX SDK | MIT License */
/**
 * NEX-HTTPS | Protocol Enforcer
 * Detects insecure HTTP connections and mixed-content resources.
 * Can warn, show a banner, or auto-redirect to HTTPS.
 *
 * Usage:
 *   <nex-https action="warn" banner mixed></nex-https>
 *
 * Attributes:
 *   action - "warn" (default) | "redirect" (auto-redirects to https://)
 *   banner - shows a sticky warning banner on HTTP pages
 *   mixed  - also scans for mixed-content (HTTP resources on HTTPS page)
 *
 * Events: nex-http-detected, nex-mixed-content (bubbles, composed)
 */
class NexHTTPS extends HTMLElement {
  connectedCallback() {
    this.style.display = 'none';
    this._check();
    if (this.hasAttribute('mixed')) this._checkMixedContent();
  }

  _isLocalhost() {
    return ['localhost', '127.0.0.1', '::1', ''].includes(location.hostname);
  }

  _check() {
    if (location.protocol === 'https:' || this._isLocalhost()) return;

    const action = this.getAttribute('action') || 'warn';
    this._emit('nex-http-detected', { protocol: location.protocol, url: location.href, action });

    if (action === 'redirect') {
      location.replace('https://' + location.host + location.pathname + location.search + location.hash);
      return;
    }

    console.warn('[NexHTTPS] Page is served over insecure HTTP. Upgrade to HTTPS.');

    if (this.hasAttribute('banner')) this._showBanner();
  }

  _checkMixedContent() {
    // Only meaningful on HTTPS pages
    if (location.protocol !== 'https:') return;

    const insecure = [];
    const selectors = ['script[src]', 'link[href]', 'img[src]', 'iframe[src]', 'video[src]', 'audio[src]'];
    document.querySelectorAll(selectors.join(',')).forEach(el => {
      const url = el.src || el.href;
      if (typeof url === 'string' && url.startsWith('http://')) {
        insecure.push({ tag: el.tagName.toLowerCase(), url });
      }
    });

    if (insecure.length > 0) {
      console.warn('[NexHTTPS] Mixed content detected:', insecure);
      this._emit('nex-mixed-content', { count: insecure.length, resources: insecure });
    }
  }

  _showBanner() {
    if (document.getElementById('__nex_https_banner__')) return;
    const banner = document.createElement('div');
    banner.id = '__nex_https_banner__';
    banner.style.cssText = `
      position:fixed;top:0;left:0;right:0;z-index:2147483646;
      background:#ff0040;color:#fff;
      font-family:'Courier New',monospace;font-size:11px;font-weight:bold;
      padding:8px 16px;text-align:center;letter-spacing:0.12em;
      display:flex;align-items:center;justify-content:center;gap:16px;
    `;
    banner.innerHTML = `
      <span>⚠ INSECURE_CONNECTION // PAGE IS NOT SERVED OVER HTTPS</span>
      <a href="https://${location.host}${location.pathname}${location.search}"
         style="color:#fff;text-decoration:underline;letter-spacing:0.08em;font-size:10px;">
        SWITCH_TO_HTTPS
      </a>
      <button onclick="this.parentElement.remove()"
              style="background:none;border:1px solid rgba(255,255,255,0.6);color:#fff;
                     padding:2px 8px;cursor:pointer;font-family:inherit;font-size:9px;">
        ✕
      </button>
    `;
    document.body.prepend(banner);
  }

  _emit(name, detail = {}) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
}

customElements.define('nex-https', NexHTTPS);
