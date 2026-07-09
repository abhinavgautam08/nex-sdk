/*! nex-network v1.3.0 | (c) 2026 NEX SDK | MIT License */
class NexNetwork extends HTMLElement {
  static get observedAttributes() {
    return ['ping-interval', 'logo'];
  }

  constructor() {
    super();
    this.online = navigator.onLine;
    this.latency = 0;
    this.intervalId = null;
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.startPinger();
    
    this._onlineHandler = () => this.updateStatus(true);
    this._offlineHandler = () => this.updateStatus(false);

    window.addEventListener('online', this._onlineHandler);
    window.addEventListener('offline', this._offlineHandler);
  }

  disconnectedCallback() {
    this.stopPinger();
    window.removeEventListener('online', this._onlineHandler);
    window.removeEventListener('offline', this._offlineHandler);
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'ping-interval' && this.shadowRoot) {
      this.startPinger();
    } else if (name === 'logo' && this.shadowRoot) {
      const img = this.shadowRoot.querySelector('.nex-badge-logo');
      if (img) img.src = newVal || '../logo/logo.webp';
    }
  }

  updateStatus(status) {
    this.online = status;
    this.render();
    this.dispatchEvent(new CustomEvent('connection-change', { detail: { online: status } }));
  }

  startPinger() {
    this.stopPinger();
    const sec = parseInt(this.getAttribute('ping-interval')) || 10;
    
    this.intervalId = setInterval(() => {
      this.checkConnection();
    }, sec * 1000);
  }

  stopPinger() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async checkConnection() {
    if (!navigator.onLine) {
      this.latency = 999;
      this.updateStatus(false);
      return;
    }

    const start = Date.now();
    try {
      // Mock probe or simple fetch ping
      await fetch('https://httpbin.org/get', { method: 'HEAD', cache: 'no-store', mode: 'no-cors' });
      this.latency = Date.now() - start;
      this.updateStatus(true);
      
      const latencyEl = this.shadowRoot.querySelector('.latency-text');
      if (latencyEl) {
        latencyEl.textContent = `RT_LATENCY // ${this.latency}ms`;
      }
      this.dispatchEvent(new CustomEvent('ping-result', { detail: { latency: this.latency } }));
    } catch (e) {
      this.latency = 999;
      this.updateStatus(false);
    }
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

        .network-wrapper {
          position: relative;
          background: var(--nex-bg, #070707);
          border: 1px solid var(--nex-glow, rgba(0, 242, 255, 0.3));
          box-shadow: 0 0 15px var(--nex-glow, rgba(0, 242, 255, 0.3));
          padding: 8px 12px;
          display: flex;
          gap: 12px;
          box-sizing: border-box;
          align-items: center;
          clip-path: polygon(0 0, 95% 0, 100% 8px, 100% 100%, 0 100%);
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .online-dot {
          background-color: #39ff14;
          box-shadow: 0 0 6px #39ff14;
        }

        .offline-dot {
          background-color: var(--nex-accent, #ff007f);
          box-shadow: 0 0 6px var(--nex-accent, #ff007f);
        }

        .status-text {
          font-size: 8px;
          font-weight: 900;
          color: #fff;
          letter-spacing: 0.1em;
        }

        .latency-text {
          font-size: 8px;
          color: rgba(255, 255, 255, 0.4);
          font-family: 'JetBrains Mono', monospace;
        }

        /* Banner styling when fully offline */
        .offline-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(255, 0, 127, 0.95);
          color: #000;
          text-align: center;
          padding: 8px;
          font-size: 9px;
          font-weight: bold;
          letter-spacing: 0.2em;
          z-index: 100000;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
          display: ${!this.online ? 'block' : 'none'};
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

      <div class="offline-banner">CONNECTION_LOST // NEURAL_LINK_OFFLINE</div>
      <div class="network-wrapper">
        <div class="nex-badge-inline">
          <img class="nex-badge-logo" src="${logoSrc}" style="height: 5px; width: auto;" onerror="this.style.display='none'">
          <span>NEX_NETWORK</span>
        </div>
        <span class="status-indicator ${this.online ? 'online-dot' : 'offline-dot'}"></span>
        <span class="status-text">${this.online ? 'NODE_ONLINE' : 'NODE_OFFLINE'}</span>
        <span class="latency-text">RT_LATENCY // ${this.latency}ms</span>
      </div>
    `;
  }
}

customElements.define('nex-network', NexNetwork);
