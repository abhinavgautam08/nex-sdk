/*! nex-auth v1.5.0 | (c) 2026 NEX SDK | MIT License */
class NexAuth extends HTMLElement {
  static get observedAttributes() {
    return ['endpoint', 'session-timeout', 'logo', 'min-strength'];
  }

  constructor() {
    super();
    this.currentView = 'login';
    this.sessionActive = false;
    this.timerInterval = null;
    this.timeLeft = 0;
    // ── Rate Limiter State ──────────────────────────────────────────
    this.failedAttempts = 0;
    this.lockoutUntil = null;
    this.lockoutTimer = null;
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.attachEvents();
  }

  disconnectedCallback() {
    this.stopSessionTimer();
    if (this.lockoutTimer) clearInterval(this.lockoutTimer);
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'logo' && this.shadowRoot) {
      const img = this.shadowRoot.querySelector('.nex-badge-logo');
      if (img) img.src = newVal || '../logo/logo.webp';
    }
  }

  showView(view) {
    this.currentView = view;
    this.render();
    this.attachEvents();
    this.dispatchEvent(new CustomEvent('view-change', { detail: { view } }));
  }

  startSessionTimer(seconds) {
    this.stopSessionTimer();
    this.sessionActive = true;
    this.timeLeft = seconds;
    this.render();
    this.attachEvents();

    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      const timerEl = this.shadowRoot.querySelector('.session-timer');
      if (timerEl) {
        timerEl.textContent = `SESSION ACTIVE // ${this.timeLeft}s`;
      }
      if (this.timeLeft <= 0) {
        this.logout();
      }
    }, 1000);
  }

  stopSessionTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.sessionActive = false;
  }

  logout() {
    this.stopSessionTimer();
    this.dispatchEvent(new CustomEvent('auth-logout'));
    this.showView('login');
  }

  attachEvents() {
    const shadow = this.shadowRoot;
    const form = shadow.querySelector('form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }

    const switchers = shadow.querySelectorAll('[data-view]');
    switchers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showView(btn.getAttribute('data-view'));
      });
    });

    const passInput = shadow.querySelector('#password');
    if (passInput) {
      passInput.addEventListener('input', () => {
        this.checkPasswordStrength(passInput.value);
      });
    }
  }

  // ── Enhanced Password Strength (5-level) ────────────────────────────────
  checkPasswordStrength(val) {
    const bar  = this.shadowRoot.querySelector('.strength-bar');
    const text = this.shadowRoot.querySelector('.strength-text');
    if (!bar || !text) return;

    let score = 0;
    if (val.length >= 6)  score++;
    if (val.length >= 12) score++;              // bonus for long passwords
    if (/[A-Z]/.test(val)) score++;            // uppercase
    if (/[0-9]/.test(val)) score++;            // digits
    if (/[^A-Za-z0-9]/.test(val)) score++;    // special chars

    const levels = [
      { pct: '0%',   color: 'transparent', label: '',          textColor: 'transparent' },
      { pct: '20%',  color: '#ff0040',     label: 'CRITICAL',  textColor: '#ff0040' },
      { pct: '40%',  color: '#ff007f',     label: 'WEAK',      textColor: '#ff007f' },
      { pct: '60%',  color: '#ffa500',     label: 'MODERATE',  textColor: '#ffa500' },
      { pct: '80%',  color: '#00e676',     label: 'STRONG',    textColor: '#00e676' },
      { pct: '100%', color: '#00f2ff',     label: 'FORTRESS',  textColor: '#00f2ff' },
    ];

    const level = levels[score] || levels[0];
    bar.style.width           = level.pct;
    bar.style.backgroundColor = level.color;
    text.textContent          = level.label;
    text.style.color          = level.textColor;
    bar.dataset.score         = score;
  }

  // ── Rate Limiter ─────────────────────────────────────────────────────
  getLockoutDuration() {
    if (this.failedAttempts >= 7) return 300;
    if (this.failedAttempts >= 5) return 60;
    if (this.failedAttempts >= 3) return 15;
    return 0;
  }

  _isLocked() {
    return !!(this.lockoutUntil && Date.now() < this.lockoutUntil);
  }

  /**
   * Call this when a login attempt fails (from your auth-submit handler).
   * Triggers the exponential backoff lockout if thresholds are crossed.
   */
  triggerFailure() {
    this.failedAttempts++;
    const duration = this.getLockoutDuration();
    if (duration > 0) {
      this.lockoutUntil = Date.now() + duration * 1000;
      this._startLockoutCountdown(duration);
      this.dispatchEvent(new CustomEvent('auth-locked', {
        detail: { attempts: this.failedAttempts, duration }
      }));
    }
  }

  _startLockoutCountdown(seconds) {
    if (this.lockoutTimer) clearInterval(this.lockoutTimer);
    let remaining = seconds;
    this._updateLockoutUI(remaining);
    this.lockoutTimer = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(this.lockoutTimer);
        this.lockoutTimer = null;
        this.lockoutUntil = null;
        this._updateLockoutUI(0);
      } else {
        this._updateLockoutUI(remaining);
      }
    }, 1000);
  }

  _updateLockoutUI(remaining) {
    const btn = this.shadowRoot.querySelector('.auth-btn[type="submit"]');
    const lockEl = this.shadowRoot.querySelector('.lockout-msg');
    if (btn) {
      btn.disabled = remaining > 0;
      btn.style.opacity = remaining > 0 ? '0.4' : '1';
      btn.style.cursor = remaining > 0 ? 'not-allowed' : 'pointer';
    }
    if (lockEl) {
      lockEl.style.display = remaining > 0 ? 'block' : 'none';
      lockEl.textContent = remaining > 0
        ? `LOCKOUT // RETRY IN ${remaining}s (${this.failedAttempts} FAILED ATTEMPTS)`
        : '';
    }
  }

  handleSubmit() {
    const shadow = this.shadowRoot;

    // ── Rate Limiter Guard ───────────────────────────────────────────────────
    if (this._isLocked()) {
      this.dispatchEvent(new CustomEvent('auth-rate-limited', {
        detail: { attempts: this.failedAttempts }
      }));
      return;
    }

    // ── Minimum Strength Guard (on login/register forms) ──────────────────
    const minStrength = parseInt(this.getAttribute('min-strength'));
    if (!isNaN(minStrength) && (this.currentView === 'login' || this.currentView === 'register')) {
      const bar = shadow.querySelector('.strength-bar');
      const score = bar ? parseInt(bar.dataset.score || '0') : 0;
      if (score < minStrength) {
        this.dispatchEvent(new CustomEvent('auth-weak-password', {
          detail: { score, required: minStrength }
        }));
        return;
      }
    }

    const inputs = shadow.querySelectorAll('input');
    const data = {};
    inputs.forEach(input => {
      if (input.id) data[input.id] = input.value;
    });

    this.dispatchEvent(new CustomEvent('auth-submit', {
      detail: { view: this.currentView, data }
    }));

    // Mock successful authentication for standalone CDN demo
    if (this.currentView === 'login' || this.currentView === 'register') {
      const timeout = parseInt(this.getAttribute('session-timeout')) || 300;
      this.dispatchEvent(new CustomEvent('auth-success', { detail: { data } }));
      this.startSessionTimer(timeout);
    } else if (this.currentView === 'otp') {
      this.dispatchEvent(new CustomEvent('auth-success', { detail: { data } }));
      this.startSessionTimer(300);
    } else if (this.currentView === 'forgot') {
      this.showView('otp');
    }
  }

  render() {
    const logoSrc = this.getAttribute('logo') || '../logo/logo.webp';
    let viewContent = '';

    if (this.sessionActive) {
      viewContent = `
        <div class="auth-box authenticated">
          <div class="auth-header">AUTHENTICATION_LINKED</div>
          <div class="session-timer">SESSION ACTIVE // ${this.timeLeft}s</div>
          <button class="auth-btn btn-danger" onclick="this.getRootNode().host.logout()">TERMINATE_LINK</button>
        </div>
      `;
    } else if (this.currentView === 'login') {
      viewContent = `
        <form class="auth-box">
          <div class="auth-header">SECURE_LOGIN_GATE</div>
          <div class="input-group">
            <label for="username">USER_HANDLE</label>
            <input type="text" id="username" placeholder="user@nex.net" required autocomplete="username">
          </div>
          <div class="input-group">
            <label for="password">ACCESS_PHRASE</label>
            <input type="password" id="password" required autocomplete="current-password">
          </div>
          <div class="strength-container" style="display:none;"></div>
          <div class="lockout-msg" style="display:none;color:#ff0040;font-size:9px;margin-bottom:8px;text-align:center;letter-spacing:0.1em;"></div>
          <button type="submit" class="auth-btn">AUTHORIZE_UPLINK</button>
          <div class="auth-links">
            <a href="#" data-view="register">NEW_NODE_REGISTER</a>
            <a href="#" data-view="forgot">RECOVER_KEYS</a>
          </div>
          <div class="social-header"><span>OR_CONNECT_VIA</span></div>
          <div class="social-buttons">
            <button type="button" class="social-btn">GITHUB</button>
            <button type="button" class="social-btn">DISCORD</button>
          </div>
        </form>
      `;
    } else if (this.currentView === 'register') {
      viewContent = `
        <form class="auth-box">
          <div class="auth-header">CREATE_SECURE_NODE</div>
          <div class="input-group">
            <label for="username">USER_HANDLE</label>
            <input type="text" id="username" placeholder="user@nex.net" required>
          </div>
          <div class="input-group">
            <label for="password">ACCESS_PHRASE</label>
            <input type="password" id="password" required autocomplete="new-password">
          </div>
          <div class="strength-container">
            <div class="strength-track"><div class="strength-bar"></div></div>
            <div class="strength-label">STRENGTH: <span class="strength-text">WEAK</span></div>
          </div>
          <div class="lockout-msg" style="display:none;color:#ff0040;font-size:9px;margin-bottom:8px;text-align:center;letter-spacing:0.1em;"></div>
          <button type="submit" class="auth-btn">GENERATE_CREDENTIALS</button>
          <div class="auth-links">
            <a href="#" data-view="login">ALREADY_REGISTERED</a>
          </div>
        </form>
      `;
    } else if (this.currentView === 'forgot') {
      viewContent = `
        <form class="auth-box">
          <div class="auth-header">RECOVER_NODE_KEYS</div>
          <div class="input-group">
            <label for="username">USER_HANDLE</label>
            <input type="text" id="username" placeholder="user@nex.net" required>
          </div>
          <button type="submit" class="auth-btn">REQUEST_OTP_TOKEN</button>
          <div class="auth-links">
            <a href="#" data-view="login">BACK_TO_LOGIN</a>
          </div>
        </form>
      `;
    } else if (this.currentView === 'otp') {
      viewContent = `
        <form class="auth-box">
          <div class="auth-header">OTP_VERIFICATION_REQUIRED</div>
          <div class="input-group">
            <label for="otp">SECURE_VERIFICATION_TOKEN</label>
            <input type="text" id="otp" placeholder="XXXXXX" required maxlength="6" pattern="[0-9]{6}">
          </div>
          <button type="submit" class="auth-btn">VERIFY_UPLINK</button>
          <div class="auth-links">
            <a href="#" data-view="login">BACK_TO_LOGIN</a>
          </div>
        </form>
      `;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          max-width: 360px;
          margin: 0 auto;
          font-family: 'Orbitron', 'JetBrains Mono', monospace, sans-serif;
          --nex-primary: var(--nex-primary, #00f2ff);
          --nex-accent: var(--nex-accent, #ff007f);
          --nex-bg: var(--nex-bg, #070707);
          --nex-glow: var(--nex-glow, rgba(0, 242, 255, 0.3));
          box-sizing: border-box;
        }

        .auth-wrapper {
          position: relative;
          width: 100%;
          background: var(--nex-bg, #070707);
          border: 1px solid var(--nex-glow, rgba(0, 242, 255, 0.3));
          box-shadow: 0 0 15px var(--nex-glow, rgba(0, 242, 255, 0.3));
          padding: 24px;
          box-sizing: border-box;
          clip-path: polygon(0 0, 93% 0, 100% 7%, 100% 100%, 0 100%);
        }

        .auth-header {
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.15em;
          color: var(--nex-primary, #00f2ff);
          margin-bottom: 20px;
          text-transform: uppercase;
          text-shadow: 0 0 5px var(--nex-glow, rgba(0, 242, 255, 0.3));
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 10px;
        }

        .input-group {
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group label {
          font-size: 8px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.6);
          letter-spacing: 0.1em;
        }

        .input-group input {
          width: 100%;
          background: #030303;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 10px 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .input-group input:focus {
          border-color: var(--nex-primary, #00f2ff);
          box-shadow: 0 0 5px var(--nex-glow, rgba(0, 242, 255, 0.3));
        }

        .auth-btn {
          width: 100%;
          background: transparent;
          border: 1px solid var(--nex-primary, #00f2ff);
          color: var(--nex-primary, #00f2ff);
          padding: 12px;
          font-family: inherit;
          font-size: 10px;
          font-weight: bold;
          letter-spacing: 0.15em;
          cursor: pointer;
          transition: all 0.2s ease;
          clip-path: polygon(0 0, 95% 0, 100% 12%, 100% 100%, 0 100%);
        }

        .auth-btn:hover {
          background: var(--nex-primary, #00f2ff);
          color: #000;
          box-shadow: 0 0 10px var(--nex-glow, rgba(0, 242, 255, 0.3));
        }

        .btn-danger {
          border-color: var(--nex-accent, #ff007f);
          color: var(--nex-accent, #ff007f);
        }

        .btn-danger:hover {
          background: var(--nex-accent, #ff007f);
          color: #000;
        }

        .auth-links {
          display: flex;
          justify-content: space-between;
          margin-top: 14px;
        }

        .auth-links a {
          font-size: 8px;
          color: rgba(255, 255, 255, 0.4);
          text-decoration: none;
          font-weight: bold;
          letter-spacing: 0.1em;
          transition: color 0.2s ease;
        }

        .auth-links a:hover {
          color: var(--nex-primary, #00f2ff);
        }

        .social-header {
          width: 100%;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          line-height: 0.1em;
          margin: 20px 0 16px;
        }

        .social-header span {
          background: var(--nex-bg, #070707);
          padding: 0 10px;
          font-size: 8px;
          color: rgba(255, 255, 255, 0.3);
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        .social-buttons {
          display: flex;
          gap: 10px;
        }

        .social-btn {
          flex: 1;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 8px;
          font-family: inherit;
          font-size: 8px;
          font-weight: bold;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .social-btn:hover {
          border-color: var(--nex-primary, #00f2ff);
          color: var(--nex-primary, #00f2ff);
        }

        .session-timer {
          font-size: 10px;
          color: var(--nex-accent, #ff007f);
          font-weight: bold;
          letter-spacing: 0.1em;
          margin-bottom: 16px;
        }

        /* Password Strength */
        .strength-container {
          margin-bottom: 14px;
        }

        .strength-track {
          width: 100%;
          height: 3px;
          background: rgba(255, 255, 255, 0.05);
          margin-bottom: 6px;
        }

        .strength-bar {
          height: 100%;
          width: 0;
          transition: width 0.3s ease, background-color 0.3s ease;
        }

        .strength-label {
          font-size: 7px;
          font-weight: bold;
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 0.1em;
        }

        /* Watermark */
        .nex-badge-inline {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 5px;
          color: rgba(255, 255, 255, 0.3);
          font-weight: 900;
          letter-spacing: 0.1em;
          z-index: 10;
          pointer-events: none;
        }
      </style>

      <div class="auth-wrapper">
        <div class="nex-badge-inline">
          <img class="nex-badge-logo" src="${logoSrc}" style="height: 5px; width: auto;" onerror="this.style.display='none'">
          <span>NEX_AUTH</span>
        </div>
        ${viewContent}
      </div>
    `;
  }
}

customElements.define('nex-auth', NexAuth);
