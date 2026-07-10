/*! nex-pow v1.0.0 | (c) 2026 NEX SDK | MIT License */
/**
 * NEX-POW | Proof-of-Work CAPTCHA (No Google, No Cookies, Zero Privacy Cost)
 * Makes the browser solve a SHA-256 hashcash puzzle before form submission.
 * Bots must do the same CPU work — making automated submissions costly.
 *
 * Usage:
 *   <nex-pow id="pow" difficulty="20" challenge="server-challenge-string"></nex-pow>
 *
 *   const pow = document.getElementById('pow');
 *   await pow.solve();  // resolves when proof is found, or call auto on form submit
 *
 *   pow.addEventListener('pow-solved', e => {
 *     console.log('Proof:', e.detail.proof);   // send to backend for verification
 *     console.log('Nonce:', e.detail.nonce);
 *     console.log('Took:', e.detail.duration, 'ms');
 *   });
 *
 * Attributes:
 *   difficulty  - number of leading zero BITS required (default: 20, ~1M hashes)
 *   challenge   - server-provided challenge string (default: random)
 *   auto        - if present, auto-solves on connectedCallback
 *
 * Events (bubbles + composed):
 *   pow-solving - fired when work begins
 *   pow-solved  - fired when proof found: { challenge, nonce, proof, duration, hashes }
 *   pow-progress - fired every 10k iterations: { hashes }
 *
 * Backend Verification (Node.js example):
 *   const crypto = require('crypto');
 *   const hash = crypto.createHash('sha256').update(challenge + nonce).digest('hex');
 *   const valid = hash.startsWith('0'.repeat(Math.floor(difficulty / 4)));
 */
class NexPOW extends HTMLElement {
  static get observedAttributes() {
    return ['difficulty', 'challenge', 'auto'];
  }

  constructor() {
    super();
    this._solving = false;
    this._proof   = null;
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
    if (this.hasAttribute('auto')) this.solve();
  }

  attributeChangedCallback() {
    this._proof = null;
    this._solving = false;
    if (this.isConnected) this._render();
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Starts the proof-of-work computation.
   * @returns {Promise<{challenge, nonce, proof, duration, hashes}>}
   */
  async solve() {
    if (this._solving) return this._proof;
    this._solving = true;

    const difficulty = parseInt(this.getAttribute('difficulty')) || 20;
    const challenge  = this.getAttribute('challenge') || NexPOW._randomChallenge();
    const target     = '0'.repeat(Math.floor(difficulty / 4)); // hex leading zeros

    this._setState('solving');
    this._emit('pow-solving', { challenge, difficulty });

    const start  = Date.now();
    let nonce    = 0;
    let proof    = '';

    while (true) {
      const attempt = challenge + nonce;
      proof = await NexPOW._sha256hex(attempt);

      if (proof.startsWith(target)) break;

      nonce++;
      if (nonce % 10000 === 0) {
        this._emit('pow-progress', { hashes: nonce });
        this._updateProgress(nonce);
        // Yield to event loop to avoid blocking UI
        await new Promise(r => setTimeout(r, 0));
      }
    }

    const duration = Date.now() - start;
    this._solving  = false;
    this._proof    = { challenge, nonce: String(nonce), proof, duration, hashes: nonce };

    this._setState('solved');
    this._emit('pow-solved', this._proof);
    return this._proof;
  }

  /** Returns the solved proof object, or null if not yet solved. */
  getProof() { return this._proof; }

  /** Returns true if the puzzle has been solved. */
  isSolved() { return this._proof !== null; }

  // ── Internals ────────────────────────────────────────────────────────────

  static async _sha256hex(text) {
    const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  static _randomChallenge() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }

  _setState(state) {
    const status = this.shadowRoot.querySelector('#status');
    const bar    = this.shadowRoot.querySelector('#bar');
    if (!status) return;

    if (state === 'solving') {
      status.textContent = 'SOLVING_PROOF_OF_WORK...';
      status.style.color = '#ffb700';
      if (bar) bar.style.width = '50%';
    } else if (state === 'solved') {
      status.textContent = `✓ PROOF_VERIFIED — ${this._proof.hashes.toLocaleString()} HASHES`;
      status.style.color = '#00f2ff';
      if (bar) { bar.style.width = '100%'; bar.style.background = '#00f2ff'; }
    }
  }

  _updateProgress(hashes) {
    const status = this.shadowRoot.querySelector('#status');
    if (status) status.textContent = `SOLVING... ${hashes.toLocaleString()} hashes`;
  }

  _render() {
    const difficulty = this.getAttribute('difficulty') || '20';
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; font-family: 'JetBrains Mono', monospace; }
        .wrap {
          display: flex; align-items: center; gap: 6px;
          border: 1px solid rgba(255,183,0,0.2);
          padding: 4px 8px; background: rgba(5,5,5,0.8);
        }
        .icon { font-size: 11px; color: #ffb700; }
        .status {
          font-size: 8px; letter-spacing: 0.1em; color: rgba(255,183,0,0.7);
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .track { height: 2px; background: rgba(255,255,255,0.08); flex: 1; min-width: 20px; position: relative; overflow: hidden; }
        .bar   { height: 100%; width: 0%; background: #ffb700; transition: width 0.3s ease; }
        .diff  { font-size: 7px; color: rgba(255,255,255,0.25); letter-spacing: 0.1em; }
      </style>
      <div class="wrap">
        <span class="icon">🛡</span>
        <span class="status" id="status">READY — DIFF ${difficulty}</span>
        <div class="track"><div class="bar" id="bar"></div></div>
        <span class="diff">POW</span>
      </div>
    `;
  }

  _emit(name, detail = {}) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
}

customElements.define('nex-pow', NexPOW);
