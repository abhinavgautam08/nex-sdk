/*! nex-mask v1.0.0 | (c) 2026 NEX SDK | MIT License */
/**
 * NEX-MASK | Sensitive Data Auto-Masker
 * Wraps sensitive values (tokens, card numbers, OTPs, API keys)
 * as •••••••• and reveals on click with an auto-hide timeout.
 *
 * Usage:
 *   <nex-mask type="token" reveal-timeout="5">sk-abc123xyz789</nex-mask>
 *   <nex-mask type="card">4111 1111 1111 1111</nex-mask>
 *   <nex-mask type="otp" reveal-timeout="3">483920</nex-mask>
 *   <nex-mask type="key">AIzaSyAbCdEfGh1234567890</nex-mask>
 *
 * Attributes:
 *   type           - token | card | otp | key | password (default: token)
 *   reveal-timeout - seconds before auto-re-masking (default: 5, 0 = stay revealed)
 *   mask-char      - character used for masking (default: •)
 *
 * Events: nex-mask-revealed, nex-mask-hidden (bubbles)
 */
class NexMask extends HTMLElement {
  static get observedAttributes() { return ['type', 'reveal-timeout', 'mask-char']; }

  constructor() {
    super();
    this._revealed  = false;
    this._hideTimer = null;
    this._original  = '';
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._original = (this.textContent || '').trim();
    this.textContent = '';
    this._render();
    this._attachEvents();
  }

  attributeChangedCallback() {
    if (this._original) { this._render(); this._attachEvents(); }
  }

  // ── Masking Logic ────────────────────────────────────────────────────────

  _getMasked() {
    const char = this.getAttribute('mask-char') || '•';
    const type = this.getAttribute('type') || 'token';
    const text = this._original;

    if (type === 'card') {
      const digits = text.replace(/\D/g, '');
      return `${char.repeat(4)} ${char.repeat(4)} ${char.repeat(4)} ${digits.slice(-4)}`;
    }
    if (type === 'otp' || type === 'password') {
      return char.repeat(text.length);
    }
    // token / key: show first 3 + mask + last 3
    if (text.length > 8) {
      return `${text.slice(0, 3)}${char.repeat(Math.max(4, text.length - 6))}${text.slice(-3)}`;
    }
    return char.repeat(text.length);
  }

  // ── Render ───────────────────────────────────────────────────────────────

  _render() {
    const type     = this.getAttribute('type') || 'token';
    const display  = this._revealed ? this._original : this._getMasked();
    const btnLabel = this._revealed ? 'HIDE' : 'REVEAL';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          font-size: inherit;
          color: inherit;
        }
        .badge {
          font-size: 8px;
          padding: 1px 5px;
          border: 1px solid rgba(255,165,0,0.5);
          color: rgba(255,165,0,0.8);
          letter-spacing: 0.1em;
          border-radius: 2px;
        }
        .value {
          letter-spacing: ${this._revealed ? '0.04em' : '0.2em'};
          color: ${this._revealed ? 'inherit' : 'rgba(255,255,255,0.28)'};
          transition: all 0.25s ease;
          user-select: ${this._revealed ? 'text' : 'none'};
        }
        .toggle-btn {
          background: none;
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.4);
          font-family: inherit;
          font-size: 8px;
          padding: 2px 7px;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.08em;
        }
        .toggle-btn:hover {
          border-color: #00f2ff;
          color: #00f2ff;
        }
        .timer {
          font-size: 8px;
          color: rgba(255,165,0,0.6);
        }
      </style>
      <span class="badge">${type.toUpperCase()}</span>
      <span class="value" id="val">${display}</span>
      <button class="toggle-btn" id="toggle">${btnLabel}</button>
      ${this._revealed && parseInt(this.getAttribute('reveal-timeout')) > 0
        ? `<span class="timer" id="timer">⏱</span>` : ''}
    `;
  }

  _attachEvents() {
    const toggle = this.shadowRoot.querySelector('#toggle');
    if (toggle) toggle.addEventListener('click', () => this._revealed ? this._mask() : this._reveal());
  }

  // ── Public API ───────────────────────────────────────────────────────────

  _reveal() {
    this._revealed = true;
    this._render();
    this._attachEvents();
    this.dispatchEvent(new CustomEvent('nex-mask-revealed', {
      detail: { type: this.getAttribute('type') }, bubbles: true
    }));

    const timeout = parseInt(this.getAttribute('reveal-timeout'));
    if (!isNaN(timeout) && timeout > 0) {
      if (this._hideTimer) clearTimeout(this._hideTimer);
      let remaining = timeout;
      const timer = this.shadowRoot.querySelector('#timer');
      const tick = setInterval(() => {
        remaining--;
        if (timer) timer.textContent = `⏱ ${remaining}s`;
        if (remaining <= 0) { clearInterval(tick); this._mask(); }
      }, 1000);
      this._hideTimer = tick;
    }
  }

  _mask() {
    this._revealed = false;
    if (this._hideTimer) { clearInterval(this._hideTimer); this._hideTimer = null; }
    this._render();
    this._attachEvents();
    this.dispatchEvent(new CustomEvent('nex-mask-hidden', { bubbles: true }));
  }
}

customElements.define('nex-mask', NexMask);
