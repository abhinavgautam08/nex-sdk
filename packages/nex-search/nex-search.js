/*! nex-search v1.0.0 | (c) 2026 NEX SDK | MIT License */
/**
 * NEX-SEARCH | Cyberpunk URL / Query Search Bar
 * A styled search input with a ⚡ FETCH button. Fires events on submit.
 * Supports auto-detect mode, paste-to-submit, Enter key, and custom actions.
 *
 * Usage:
 *   <nex-search
 *     id="search"
 *     placeholder="PASTE URL / magnet:?xt=..."
 *     button-text="FETCH"
 *     icon="bolt"
 *     hint="TikTok · Terabox · Magnet · Phone">
 *   </nex-search>
 *
 *   search.addEventListener('nex-search-submit', e => {
 *     console.log('Query:', e.detail.query);  // the URL/value entered
 *   });
 *
 * Attributes:
 *   placeholder  - input placeholder text (default: PASTE URL / magnet:?xt=...)
 *   button-text  - button label (default: FETCH)
 *   icon         - material icon name shown in button (default: bolt)
 *   hint         - subtitle hint text below input
 *   loading      - if present, shows spinner and disables button
 *   value        - pre-fills the input value
 *   clearable    - if present, shows a clear (×) button when input has value
 *
 * Public Methods:
 *   getValue()   - returns current input value
 *   setValue(v)  - sets input value programmatically
 *   setLoading(bool) - show/hide loading state
 *   clear()      - clears the input
 *   focus()      - focuses the input
 *
 * Events (bubbles + composed):
 *   nex-search-submit  - fired on button click or Enter key, detail: { query }
 *   nex-search-clear   - fired when input is cleared
 *   nex-search-change  - fired on every input change, detail: { query }
 */
class NexSearch extends HTMLElement {
  static get observedAttributes() {
    return ['placeholder', 'button-text', 'icon', 'hint', 'loading', 'value', 'clearable'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { if (this.shadowRoot.innerHTML) this._render(); }

  // ── Public API ───────────────────────────────────────────────────────────
  getValue() { return this._input()?.value || ''; }
  setValue(v) { if (this._input()) { this._input().value = v; this._updateClear(); } }
  clear()    { this.setValue(''); this._emit('nex-search-clear', {}); }
  focus()    { this._input()?.focus(); }

  setLoading(isLoading) {
    if (isLoading) {
      this.setAttribute('loading', '');
    } else {
      this.removeAttribute('loading');
    }
  }

  // ── Internal ─────────────────────────────────────────────────────────────
  _input()  { return this.shadowRoot.querySelector('#nex-input'); }
  _btn()    { return this.shadowRoot.querySelector('#nex-btn'); }
  _clearBtn(){ return this.shadowRoot.querySelector('#nex-clear'); }

  _submit() {
    const query = this.getValue().trim();
    if (!query) { this._input()?.focus(); return; }
    this._emit('nex-search-submit', { query });
  }

  _updateClear() {
    const clearBtn = this._clearBtn();
    if (!clearBtn) return;
    clearBtn.style.opacity = this.getValue() ? '1' : '0';
    clearBtn.style.pointerEvents = this.getValue() ? 'auto' : 'none';
  }

  _emit(name, detail) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  _render() {
    const placeholder = this.getAttribute('placeholder') || 'PASTE URL / magnet:?xt=...';
    const buttonText  = this.getAttribute('button-text') || 'FETCH';
    const icon        = this.getAttribute('icon')        || 'bolt';
    const hint        = this.getAttribute('hint')        || '';
    const isLoading   = this.hasAttribute('loading');
    const value       = this.getAttribute('value')       || '';
    const clearable   = this.hasAttribute('clearable');

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

        :host {
          display: block;
          width: 100%;
          font-family: 'JetBrains Mono', 'Courier New', monospace;
        }

        * { box-sizing: border-box; }

        .search-wrap {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }

        .input-row {
          display: flex;
          flex-direction: row;
          gap: 0;
          width: 100%;
          position: relative;
        }

        .input-container {
          position: relative;
          flex: 1;
          min-width: 0;
        }

        #nex-input {
          width: 100%;
          background: #050505;
          border: 2px solid var(--nex-input-border, rgba(0, 242, 255, 0.35));
          border-right: none;
          color: var(--nex-input-color, #00f2ff);
          font-family: 'JetBrains Mono', monospace;
          font-size: clamp(11px, 2vw, 15px);
          letter-spacing: 0.06em;
          padding: 14px 44px 14px 18px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          caret-color: #00f2ff;
          width: 100%;
          box-shadow: var(--nex-input-shadow, none);
        }

        #nex-input::placeholder {
          color: rgba(0, 242, 255, 0.25);
          letter-spacing: 0.08em;
        }

        #nex-input:focus {
          border-color: var(--nex-input-focus-border, #00f2ff);
          box-shadow: var(--nex-input-focus-shadow, 0 0 0 1px rgba(0, 242, 255, 0.15), 0 0 20px rgba(0, 242, 255, 0.08));
        }

        #nex-clear {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(0, 242, 255, 0.4);
          cursor: pointer;
          font-size: 14px;
          padding: 4px;
          line-height: 1;
          transition: color 0.15s, opacity 0.15s;
          opacity: 0;
          pointer-events: none;
          font-family: monospace;
        }
        #nex-clear:hover { color: #00f2ff; }

        #nex-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: #00f2ff;
          color: #050505;
          border: 2px solid #00f2ff;
          font-family: 'Orbitron', 'JetBrains Mono', monospace;
          font-weight: 900;
          font-size: clamp(9px, 1.5vw, 11px);
          letter-spacing: 0.15em;
          padding: 14px 20px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, box-shadow 0.15s;
          white-space: nowrap;
          shrink: 0;
          position: relative;
          overflow: hidden;
          /* Cyberpunk corner clip — top-right diagonal cut */
          clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%);
        }

        /* Corner accent line on the clipped notch */
        #nex-btn::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 17px;
          height: 17px;
          background: transparent;
          border-top: 2px solid rgba(5,5,5,0.35);
          border-right: 2px solid rgba(5,5,5,0.35);
          transform: rotate(0deg);
          clip-path: polygon(0 0, 100% 0, 100% 100%);
          pointer-events: none;
        }

        #nex-btn:hover:not(:disabled) {
          background: #fff;
          border-color: #fff;
          box-shadow: 0 0 30px rgba(0, 242, 255, 0.4);
        }

        #nex-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        #nex-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-icon {
          font-family: 'Material Symbols Outlined', 'Material Icons';
          font-size: 16px;
          line-height: 1;
          font-weight: normal;
          font-style: normal;
          display: inline-block;
          text-transform: none;
          word-wrap: normal;
          white-space: nowrap;
          direction: ltr;
          -webkit-font-smoothing: antialiased;
        }

        /* Spinner */
        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(5,5,5,0.3);
          border-top-color: #050505;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .hint-text {
          font-size: 9px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.18em;
          text-align: center;
          text-transform: uppercase;
          padding: 0 2px;
        }

        .hint-text span {
          color: rgba(0, 242, 255, 0.35);
          margin: 0 4px;
        }
      </style>

      <div class="search-wrap">
        <div class="input-row">
          <div class="input-container">
            <input
              id="nex-input"
              type="text"
              placeholder="${placeholder}"
              value="${value}"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
            />
            ${clearable ? `<button id="nex-clear" title="Clear" aria-label="Clear input">✕</button>` : ''}
          </div>
          <button id="nex-btn" ${isLoading ? 'disabled' : ''} aria-label="${buttonText}">
            ${isLoading
              ? `<div class="spinner"></div>`
              : `<span class="btn-icon">${icon}</span>`
            }
            <span>${buttonText}</span>
          </button>
        </div>
        ${hint ? `<div class="hint-text">${hint.split('·').map(t => `<span>·</span>${t.trim()}`).join('').replace(/^<span>·<\/span>/, '')}</div>` : ''}
      </div>
    `;

    // Events
    const input   = this._input();
    const btn     = this._btn();
    const clearBtn = this._clearBtn();

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._submit();
    });

    input.addEventListener('input', () => {
      this._updateClear();
      this._emit('nex-search-change', { query: input.value });
    });

    btn.addEventListener('click', () => this._submit());

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clear();
        input.focus();
      });
    }

    // Restore clear visibility if value present
    if (value) this._updateClear();
  }
}

customElements.define('nex-search', NexSearch);
