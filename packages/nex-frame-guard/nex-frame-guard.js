/*! nex-frame-guard v1.0.0 | (c) 2026 NEX SDK | MIT License */
/**
 * NEX-FRAME-GUARD | Clickjacking Shield
 * Detects if the page is embedded inside a cross-origin <iframe>.
 * Can show a blocking overlay or force a frame breakout.
 *
 * Usage:
 *   <nex-frame-guard action="blur"></nex-frame-guard>
 *
 * Attributes:
 *   action - "blur" (default) | "breakout" (force top navigation) | "none" (event only)
 *
 * Events: nex-frame-attack (bubbles, composed)
 */
class NexFrameGuard extends HTMLElement {
  static get observedAttributes() { return ['action']; }

  connectedCallback() {
    this.style.display = 'none';
    this._check();
  }

  _check() {
    let isFramed = false;
    let parentOrigin = 'unknown';

    try {
      isFramed = window.self !== window.top;
      if (isFramed) {
        try { parentOrigin = document.referrer || window.top.location.href; } catch { parentOrigin = 'cross-origin'; }
      }
    } catch {
      // Cross-origin access restriction itself proves we're framed
      isFramed = true;
      parentOrigin = 'cross-origin';
    }

    if (!isFramed) return;

    const action = this.getAttribute('action') || 'blur';
    this._emit('nex-frame-attack', { action, parentOrigin, url: location.href });

    if (action === 'breakout') {
      try { window.top.location = window.self.location; } catch { /* cross-origin restriction */ }
    } else if (action === 'blur') {
      this._applyOverlay();
    }
  }

  _applyOverlay() {
    if (document.getElementById('__nex_frame_overlay__')) return;
    const overlay = document.createElement('div');
    overlay.id = '__nex_frame_overlay__';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:2147483647;
      background:rgba(5,5,10,0.97);
      display:flex;align-items:center;justify-content:center;
      flex-direction:column;gap:16px;
      font-family:'Courier New',monospace;color:#ff0040;
      text-align:center;
    `;
    overlay.innerHTML = `
      <div style="font-size:40px;animation:pulse 1s infinite alternate">⚠</div>
      <div style="font-size:13px;font-weight:bold;letter-spacing:0.25em;">CLICKJACKING_DETECTED</div>
      <div style="font-size:9px;color:#ff007f;letter-spacing:0.12em;opacity:0.8;">
        THIS PAGE IS BEING EMBEDDED IN AN UNAUTHORIZED FRAME
      </div>
      <a href="${location.href}" target="_top"
         style="margin-top:8px;color:#00f2ff;font-size:10px;letter-spacing:0.1em;text-decoration:underline;">
        ↗ OPEN_DIRECT_LINK
      </a>
      <style>@keyframes pulse{from{opacity:0.6}to{opacity:1}}</style>
    `;
    document.body.appendChild(overlay);
  }

  _emit(name, detail = {}) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
}

customElements.define('nex-frame-guard', NexFrameGuard);
