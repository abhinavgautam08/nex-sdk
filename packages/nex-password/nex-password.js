/*! nex-password v1.0.0 | (c) 2026 NEX SDK | MIT License */
/**
 * NEX-PASSWORD | Cryptographically Secure Password Generator UI
 * Generates strong passwords using window.crypto.getRandomValues().
 * Displays entropy strength in bits and can auto-fill a target input.
 *
 * Usage:
 *   <nex-password id="pg" length="20" symbols numbers uppercase target="#password-input"></nex-password>
 *
 *   pg.generate();           // returns a new password string and updates display
 *   pg.getPassword();        // returns current generated password
 *   pg.copyToClipboard();    // copies to clipboard
 *
 * Attributes:
 *   length      - password length (default: 16, min: 8, max: 128)
 *   uppercase   - include A-Z (default: true)
 *   lowercase   - include a-z (default: true)
 *   numbers     - include 0-9
 *   symbols     - include !@#$%^&*
 *   no-ambiguous - exclude O, 0, I, l, 1
 *   target      - CSS selector of input to auto-fill on generate
 *
 * Events (bubbles + composed):
 *   nex-password-generated - { password, entropy, strength }
 *   nex-password-copied    - { password }
 */
class NexPassword extends HTMLElement {
  static get observedAttributes() {
    return ['length', 'uppercase', 'lowercase', 'numbers', 'symbols', 'no-ambiguous', 'target'];
  }

  constructor() {
    super();
    this._current = '';
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
    this.generate();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this._render();
      this.generate();
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  generate() {
    const charset = this._buildCharset();
    if (!charset) return '';

    const length = Math.min(128, Math.max(8, parseInt(this.getAttribute('length')) || 16));
    const bytes  = crypto.getRandomValues(new Uint32Array(length));
    const pwd    = Array.from(bytes, b => charset[b % charset.length]).join('');

    this._current = pwd;
    const entropy = Math.floor(length * Math.log2(charset.length));
    const strength = this._strengthLabel(entropy);

    this._updateDisplay(pwd, entropy, strength);
    this._fillTarget(pwd);
    this._emit('nex-password-generated', { password: pwd, entropy, strength });
    return pwd;
  }

  getPassword() { return this._current; }

  async copyToClipboard() {
    try {
      await navigator.clipboard.writeText(this._current);
      this._showCopied();
      this._emit('nex-password-copied', { password: this._current });
    } catch (_) {}
  }

  // ── Internals ─────────────────────────────────────────────────────────────

  _buildCharset() {
    const noAmbiguous = this.hasAttribute('no-ambiguous');
    let chars = '';
    if (this.getAttribute('lowercase') !== 'false') {
      chars += noAmbiguous ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
    }
    if (this.hasAttribute('uppercase') || this.getAttribute('uppercase') !== 'false') {
      chars += noAmbiguous ? 'ABCDEFGHJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    if (this.hasAttribute('numbers')) {
      chars += noAmbiguous ? '23456789' : '0123456789';
    }
    if (this.hasAttribute('symbols')) {
      chars += '!@#$%^&*-_+=?';
    }
    return chars || 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }

  _strengthLabel(entropy) {
    if (entropy < 28) return { label: 'CRITICAL',  color: '#ff003c' };
    if (entropy < 36) return { label: 'WEAK',      color: '#ff6b00' };
    if (entropy < 60) return { label: 'MODERATE',  color: '#ffb700' };
    if (entropy < 80) return { label: 'STRONG',    color: '#00f2ff' };
    return              { label: 'FORTRESS',  color: '#00ff85' };
  }

  _fillTarget(pwd) {
    const sel = this.getAttribute('target');
    if (!sel) return;
    const el = document.querySelector(sel);
    if (el) { el.value = pwd; el.dispatchEvent(new Event('input', { bubbles: true })); }
  }

  _updateDisplay(pwd, entropy, strength) {
    const pwdEl     = this.shadowRoot.querySelector('#pwd');
    const entropyEl = this.shadowRoot.querySelector('#entropy');
    const badgeEl   = this.shadowRoot.querySelector('#badge');
    const barEl     = this.shadowRoot.querySelector('#bar');

    if (pwdEl)     pwdEl.textContent  = pwd;
    if (entropyEl) entropyEl.textContent = `${entropy} bits`;
    if (badgeEl)   { badgeEl.textContent = strength.label; badgeEl.style.color = strength.color; }
    if (barEl)     {
      barEl.style.width = `${Math.min(100, (entropy / 100) * 100)}%`;
      barEl.style.background = strength.color;
    }
  }

  _showCopied() {
    const btn = this.shadowRoot.querySelector('#copyBtn');
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = '✓ COPIED';
    setTimeout(() => { btn.textContent = orig; }, 1500);
  }

  _render() {
    const length = this.getAttribute('length') || 16;
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
        :host { display: block; font-family: 'JetBrains Mono', monospace; }
        * { box-sizing: border-box; }
        .wrap { background: #0a0a0a; border: 1px solid rgba(0,242,255,0.15); padding: 14px; display: flex; flex-direction: column; gap: 10px; }
        .pwd-row { display: flex; gap: 8px; align-items: center; }
        #pwd {
          flex: 1; font-size: 13px; color: #00f2ff; letter-spacing: 0.08em;
          word-break: break-all; line-height: 1.5; user-select: all;
        }
        .btn-row { display: flex; gap: 6px; flex-wrap: wrap; }
        button {
          font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 700;
          letter-spacing: 0.12em; padding: 5px 10px; cursor: pointer; border: 1px solid;
          transition: all 0.15s; text-transform: uppercase;
        }
        #regenBtn { background: rgba(0,242,255,0.08); color: #00f2ff; border-color: rgba(0,242,255,0.3); }
        #regenBtn:hover { background: #00f2ff; color: #050505; }
        #copyBtn { background: rgba(255,183,0,0.08); color: #ffb700; border-color: rgba(255,183,0,0.3); }
        #copyBtn:hover { background: #ffb700; color: #050505; }
        .strength-row { display: flex; align-items: center; gap: 8px; }
        .track { flex: 1; height: 2px; background: rgba(255,255,255,0.08); }
        .bar   { height: 100%; width: 0%; transition: width 0.3s, background 0.3s; }
        #entropy { font-size: 8px; color: rgba(255,255,255,0.3); white-space: nowrap; }
        #badge   { font-size: 8px; font-weight: 700; letter-spacing: 0.1em; white-space: nowrap; }
        .len-row { display: flex; align-items: center; gap: 8px; }
        .len-row label { font-size: 8px; color: rgba(255,255,255,0.3); letter-spacing: 0.1em; }
        input[type=range] { flex: 1; accent-color: #00f2ff; cursor: pointer; }
        .len-val { font-size: 8px; color: #00f2ff; min-width: 24px; text-align: right; }
      </style>
      <div class="wrap">
        <div class="pwd-row">
          <span id="pwd">——————————</span>
        </div>
        <div class="strength-row">
          <div class="track"><div class="bar" id="bar"></div></div>
          <span id="badge">——</span>
          <span id="entropy">—— bits</span>
        </div>
        <div class="len-row">
          <label>LENGTH</label>
          <input type="range" id="lenRange" min="8" max="64" value="${length}">
          <span class="len-val" id="lenVal">${length}</span>
        </div>
        <div class="btn-row">
          <button id="regenBtn">↺ Regenerate</button>
          <button id="copyBtn">⎘ Copy</button>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('#regenBtn')?.addEventListener('click', () => this.generate());
    this.shadowRoot.querySelector('#copyBtn')?.addEventListener('click', () => this.copyToClipboard());
    this.shadowRoot.querySelector('#lenRange')?.addEventListener('input', (e) => {
      const val = e.target.value;
      this.setAttribute('length', val);
      this.shadowRoot.querySelector('#lenVal').textContent = val;
    });
  }

  _emit(name, detail = {}) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
}

customElements.define('nex-password', NexPassword);
