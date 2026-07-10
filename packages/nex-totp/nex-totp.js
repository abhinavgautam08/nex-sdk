/*! nex-totp v1.0.0 | (c) 2026 NEX SDK | MIT License */
/**
 * NEX-TOTP | Offline TOTP / 2FA Code Generator (RFC 6238)
 * Generates time-based one-time passwords entirely in the browser.
 * No server, no external dependency. Works 100% offline.
 *
 * Usage:
 *   <nex-totp id="totp" secret="JBSWY3DPEHPK3PXP" digits="6" period="30"></nex-totp>
 *
 *   // Generate current code
 *   const code = await totp.generate();   // e.g. "483920"
 *
 *   // Verify user input
 *   const ok = await totp.verify('483920', 1); // 1 = allow 1 window drift
 *
 * Attributes:
 *   secret   - Base32-encoded TOTP secret (required)
 *   digits   - OTP length: 6 or 8 (default: 6)
 *   period   - Time step in seconds (default: 30)
 *   display  - if present, renders a visible countdown + code display
 *
 * Events (bubbles + composed):
 *   nex-totp-refresh  - fired every period with { code, remaining }
 *   nex-totp-verified - fired on verify() result: { valid, code }
 */
class NexTOTP extends HTMLElement {
  static get observedAttributes() {
    return ['secret', 'digits', 'period', 'display'];
  }

  constructor() {
    super();
    this._timer = null;
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (this.hasAttribute('display')) {
      this.style.display = '';
      this._renderDisplay();
      this._startDisplayTimer();
    } else {
      this.style.display = 'none';
    }
  }

  disconnectedCallback() {
    if (this._timer) clearInterval(this._timer);
  }

  attributeChangedCallback() {
    if (this.isConnected && this.hasAttribute('display')) {
      this._updateDisplay();
    }
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Generates the current TOTP code.
   * @returns {Promise<string>} zero-padded OTP string
   */
  async generate() {
    const secret = this.getAttribute('secret') || '';
    const digits = parseInt(this.getAttribute('digits')) || 6;
    const period = parseInt(this.getAttribute('period')) || 30;
    return this._generateOTP(secret, digits, period, Math.floor(Date.now() / 1000 / period));
  }

  /**
   * Verifies a user-provided code within a drift window.
   * @param {string} code - user input
   * @param {number} drift - allowed time steps before/after (default: 1)
   * @returns {Promise<boolean>}
   */
  async verify(code, drift = 1) {
    const secret = this.getAttribute('secret') || '';
    const digits = parseInt(this.getAttribute('digits')) || 6;
    const period = parseInt(this.getAttribute('period')) || 30;
    const counter = Math.floor(Date.now() / 1000 / period);

    for (let d = -drift; d <= drift; d++) {
      const expected = await this._generateOTP(secret, digits, period, counter + d);
      if (this._constantTimeEqual(expected, code)) {
        this._emit('nex-totp-verified', { valid: true, code });
        return true;
      }
    }
    this._emit('nex-totp-verified', { valid: false, code });
    return false;
  }

  /**
   * Returns seconds remaining in the current TOTP window.
   * @returns {number}
   */
  getRemainingSeconds() {
    const period = parseInt(this.getAttribute('period')) || 30;
    return period - (Math.floor(Date.now() / 1000) % period);
  }

  // ── TOTP Core ────────────────────────────────────────────────────────────

  async _generateOTP(secret, digits, period, counter) {
    const keyBytes  = this._base32Decode(secret.replace(/\s/g, '').toUpperCase());
    const counterBytes = new Uint8Array(8);
    let c = counter;
    for (let i = 7; i >= 0; i--) {
      counterBytes[i] = c & 0xff;
      c >>= 8;
    }

    const key = await crypto.subtle.importKey(
      'raw', keyBytes,
      { name: 'HMAC', hash: 'SHA-1' },
      false, ['sign']
    );
    const sig    = await crypto.subtle.sign('HMAC', key, counterBytes);
    const hmac   = new Uint8Array(sig);
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code   = ((hmac[offset] & 0x7f) << 24 |
                     hmac[offset + 1] << 16 |
                     hmac[offset + 2] << 8 |
                     hmac[offset + 3]) % Math.pow(10, digits);
    return String(code).padStart(digits, '0');
  }

  _base32Decode(str) {
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0, value = 0;
    const output = [];
    for (const c of str.replace(/=+$/, '')) {
      const idx = CHARS.indexOf(c);
      if (idx < 0) continue;
      value = (value << 5) | idx;
      bits += 5;
      if (bits >= 8) {
        bits -= 8;
        output.push((value >> bits) & 0xff);
      }
    }
    return new Uint8Array(output);
  }

  _constantTimeEqual(a, b) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
  }

  // ── Display Mode ─────────────────────────────────────────────────────────

  _renderDisplay() {
    const period = parseInt(this.getAttribute('period')) || 30;
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-flex; align-items: center; gap: 12px; }
        .code {
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          font-size: 24px; font-weight: 700;
          color: #00f2ff; letter-spacing: 0.25em;
          background: rgba(0,242,255,0.06);
          border: 1px solid rgba(0,242,255,0.2);
          padding: 8px 16px;
          clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
          position: relative;
          box-sizing: border-box;
        }
        .code::after {
          content: '';
          position: absolute;
          top: -1px;
          right: -1px;
          width: 14px;
          height: 14px;
          background: transparent;
          border-top: 1.5px solid currentColor;
          border-right: 1.5px solid currentColor;
          pointer-events: none;
          clip-path: polygon(0 0, 100% 0, 100% 100%);
          transition: border-color 0.3s;
        }
        .countdown { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        svg { transform: rotate(-90deg); }
        circle.track { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 3; }
        circle.prog  { fill: none; stroke: #00f2ff; stroke-width: 3;
                        stroke-linecap: round; transition: stroke-dashoffset 1s linear; }
        .sec { font-family: monospace; font-size: 10px; color: rgba(255,255,255,0.4); }
      </style>
      <div class="code" id="code">------</div>
      <div class="countdown">
        <svg width="32" height="32" viewBox="0 0 32 32">
          <circle class="track" cx="16" cy="16" r="12"/>
          <circle class="prog" id="ring" cx="16" cy="16" r="12"
            stroke-dasharray="${2 * Math.PI * 12}"
            stroke-dashoffset="0"/>
        </svg>
        <span class="sec" id="sec">--s</span>
      </div>
    `;
    this._updateDisplay();
  }

  _startDisplayTimer() {
    this._timer = setInterval(() => this._updateDisplay(), 1000);
  }

  async _updateDisplay() {
    if (!this.shadowRoot) return;
    const code    = await this.generate();
    const remain  = this.getRemainingSeconds();
    const period  = parseInt(this.getAttribute('period')) || 30;
    const circ    = 2 * Math.PI * 12;
    const offset  = circ * (1 - remain / period);

    const codeEl = this.shadowRoot.querySelector('#code');
    const ringEl = this.shadowRoot.querySelector('#ring');
    const secEl  = this.shadowRoot.querySelector('#sec');

    if (codeEl) codeEl.textContent = code;
    if (ringEl) ringEl.style.strokeDashoffset = offset;
    if (secEl)  secEl.textContent = `${remain}s`;

    // Color warning when < 5s
    if (codeEl) codeEl.style.color = remain <= 5 ? '#ff0040' : '#00f2ff';
    if (ringEl) ringEl.style.stroke = remain <= 5 ? '#ff0040' : '#00f2ff';

    this._emit('nex-totp-refresh', { code, remaining: remain });
  }

  _emit(name, detail = {}) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
}

customElements.define('nex-totp', NexTOTP);
