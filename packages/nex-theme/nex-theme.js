/*! nex-theme v1.3.0 | (c) 2026 NEX SDK | MIT License */
class NexTheme extends HTMLElement {
  static get observedAttributes() {
    return ['storage-key', 'logo'];
  }

  constructor() {
    super();
    this.activeTheme = 'dark';
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.initTheme();
    this.render();
    this.attachEvents();
  }

  disconnectedCallback() {}

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'logo' && this.shadowRoot) {
      const img = this.shadowRoot.querySelector('.nex-badge-logo');
      if (img) img.src = newVal || '../logo/logo.webp';
    }
  }

  initTheme() {
    const key = this.getAttribute('storage-key') || 'nex-theme-preference';
    const saved = localStorage.getItem(key);
    if (saved) {
      this.setTheme(saved, false);
    } else {
      this.setTheme('dark', false); // default theme
    }
  }

  setTheme(theme, save = true) {
    this.activeTheme = theme;
    const key = this.getAttribute('storage-key') || 'nex-theme-preference';
    
    if (save) {
      localStorage.setItem(key, theme);
    }

    let targetTheme = theme;
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      targetTheme = prefersDark ? 'dark' : 'light';
    }

    // Apply attributes and variables to HTML element
    const root = document.documentElement;
    root.setAttribute('data-theme', targetTheme);

    if (targetTheme === 'light') {
      root.style.setProperty('--nex-primary', '#0070f3');
      root.style.setProperty('--nex-accent', '#ff007f');
      root.style.setProperty('--nex-bg', '#ffffff');
      root.style.setProperty('--nex-glow', 'rgba(0, 112, 243, 0.15)');
    } else {
      root.style.setProperty('--nex-primary', '#00f2ff');
      root.style.setProperty('--nex-accent', '#ff007f');
      root.style.setProperty('--nex-bg', '#070707');
      root.style.setProperty('--nex-glow', 'rgba(0, 242, 255, 0.3)');
    }

    if (this.shadowRoot) {
      this.render();
      this.attachEvents();
    }

    this.dispatchEvent(new CustomEvent('theme-change', { detail: { theme, resolved: targetTheme } }));
  }

  attachEvents() {
    const shadow = this.shadowRoot;
    shadow.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setTheme(btn.dataset.theme);
      });
    });
  }

  render() {
    const logoSrc = this.getAttribute('logo') || '../logo/logo.webp';
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          font-family: 'Orbitron', 'JetBrains Mono', monospace, sans-serif;
          --nex-primary: var(--nex-primary, #00f2ff);
          --nex-accent: var(--nex-accent, #ff007f);
          --nex-bg: var(--nex-bg, #070707);
          --nex-glow: var(--nex-glow, rgba(0, 242, 255, 0.3));
          box-sizing: border-box;
        }

        .theme-container {
          position: relative;
          background: var(--nex-bg, #070707);
          border: 1px solid var(--nex-glow, rgba(0, 242, 255, 0.3));
          box-shadow: 0 0 15px var(--nex-glow, rgba(0, 242, 255, 0.3));
          padding: 8px 12px;
          display: flex;
          gap: 6px;
          box-sizing: border-box;
          clip-path: polygon(0 0, 95% 0, 100% 8px, 100% 100%, 0 100%);
          align-items: center;
        }

        .theme-label {
          font-size: 8px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 0.1em;
          margin-right: 6px;
        }

        .theme-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 6px 10px;
          font-family: inherit;
          font-size: 8px;
          font-weight: bold;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .theme-btn:hover {
          border-color: var(--nex-primary, #00f2ff);
          color: var(--nex-primary, #00f2ff);
        }

        .theme-btn.active {
          border-color: var(--nex-primary, #00f2ff);
          color: var(--nex-primary, #00f2ff);
          background: rgba(0, 242, 255, 0.05);
          box-shadow: 0 0 8px var(--nex-glow, rgba(0, 242, 255, 0.2));
        }

        /* Watermark */
        .nex-badge-inline {
          position: absolute;
          top: -12px;
          right: 8px;
          display: none;
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

      <div class="theme-container">
        <div class="nex-badge-inline">
          <img class="nex-badge-logo" src="${logoSrc}" style="height: 5px; width: auto;" onerror="this.style.display='none'">
          <span>NEX_THEME</span>
        </div>
        <span class="theme-label">SYS_THEME</span>
        <button class="theme-btn ${this.activeTheme === 'light' ? 'active' : ''}" data-theme="light">LIGHT</button>
        <button class="theme-btn ${this.activeTheme === 'dark' ? 'active' : ''}" data-theme="dark">DARK</button>
        <button class="theme-btn ${this.activeTheme === 'auto' ? 'active' : ''}" data-theme="auto">AUTO</button>
      </div>
    `;
  }
}

customElements.define('nex-theme', NexTheme);
