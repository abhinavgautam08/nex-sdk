/*! nex-auth v1.3.0 | (c) 2026 NEX SDK | MIT License */
class NexAuth extends HTMLElement {
  static get observedAttributes() {
    return ['endpoint', 'session-timeout', 'logo'];
  }

  constructor() {
    super();
    this.currentView = 'login';
    this.sessionActive = false;
    this.timerInterval = null;
    this.timeLeft = 0;
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.attachEvents();
  }

  disconnectedCallback() {
    this.stopSessionTimer();
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

  checkPasswordStrength(val) {
    const bar = this.shadowRoot.querySelector('.strength-bar');
    const text = this.shadowRoot.querySelector('.strength-text');
    if (!bar || !text) return;

    let score = 0;
    if (val.length >= 6) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    bar.style.width = `${score * 25}%`;
    if (score === 0) {
      bar.style.backgroundColor = 'transparent';
      text.textContent = 'WEAK';
      text.style.color = '#ff007f';
    } else if (score <= 2) {
      bar.style.backgroundColor = '#ff007f';
      text.textContent = 'MODERATE';
      text.style.color = '#ff007f';
    } else {
      bar.style.backgroundColor = '#00f2ff';
      text.textContent = 'STRONG';
      text.style.color = '#00f2ff';
    }
  }

  handleSubmit() {
    const shadow = this.shadowRoot;
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
