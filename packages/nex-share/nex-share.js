/*! nex-share v1.3.0 | (c) 2026 NEX SDK | MIT License */
class NexShare extends HTMLElement {
  static get observedAttributes() {
    return ['url', 'title', 'text', 'logo'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.attachEvents();
  }

  disconnectedCallback() {}

  attributeChangedCallback(name, oldVal, newVal) {
    if (this.shadowRoot) {
      if (name === 'logo') {
        const img = this.shadowRoot.querySelector('.nex-badge-logo');
        if (img) img.src = newVal || '../logo/logo.webp';
      } else {
        this.render();
        this.attachEvents();
      }
    }
  }

  async share() {
    const url = this.getAttribute('url') || window.location.href;
    const title = this.getAttribute('title') || document.title;
    const text = this.getAttribute('text') || 'Check this out!';

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        this.dispatchEvent(new CustomEvent('share-success', { detail: { method: 'native' } }));
      } catch (err) {
        this.dispatchEvent(new CustomEvent('share-error', { detail: { error: err } }));
      }
    } else {
      // Trigger fallback UI panel
      const overlay = this.shadowRoot.querySelector('.fallback-panel');
      if (overlay) overlay.classList.remove('hidden');
    }
  }

  async copyLink() {
    const url = this.getAttribute('url') || window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      const copyBtn = this.shadowRoot.querySelector('.copy-btn');
      if (copyBtn) {
        copyBtn.textContent = 'LINK_COPIED';
        setTimeout(() => {
          if (copyBtn) copyBtn.textContent = 'COPY_LINK';
        }, 1500);
      }
      this.dispatchEvent(new CustomEvent('share-success', { detail: { method: 'copy' } }));
    } catch (err) {
      this.dispatchEvent(new CustomEvent('share-error', { detail: { error: err } }));
    }
  }

  toggleQrShare() {
    const qrModal = this.shadowRoot.querySelector('.qr-share-modal');
    if (qrModal) qrModal.classList.toggle('hidden');
  }

  attachEvents() {
    const shadow = this.shadowRoot;
    const shareBtn = shadow.querySelector('.main-share-btn');
    const copyBtn = shadow.querySelector('.copy-btn');
    const qrBtn = shadow.querySelector('.qr-btn');
    const closeQr = shadow.querySelector('.close-qr');

    if (shareBtn) shareBtn.addEventListener('click', () => this.share());
    if (copyBtn) copyBtn.addEventListener('click', () => this.copyLink());
    if (qrBtn) qrBtn.addEventListener('click', () => this.toggleQrShare());
    if (closeQr) closeQr.addEventListener('click', () => this.toggleQrShare());
  }

  render() {
    const logoSrc = this.getAttribute('logo') || '../logo/logo.webp';
    const url = this.getAttribute('url') || window.location.href;

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

        .share-wrapper {
          position: relative;
          background: var(--nex-bg, #070707);
          border: 1px solid var(--nex-glow, rgba(0, 242, 255, 0.3));
          box-shadow: 0 0 15px var(--nex-glow, rgba(0, 242, 255, 0.3));
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-sizing: border-box;
          clip-path: polygon(0 0, 93% 0, 100% 12px, 100% 100%, 0 100%);
        }

        .main-share-btn {
          background: transparent;
          border: 1px solid var(--nex-primary, #00f2ff);
          color: var(--nex-primary, #00f2ff);
          padding: 10px 14px;
          font-family: inherit;
          font-size: 9px;
          font-weight: bold;
          letter-spacing: 0.15em;
          cursor: pointer;
          transition: all 0.2s ease;
          clip-path: polygon(0 0, 95% 0, 100% 8px, 100% 100%, 0 100%);
        }

        .main-share-btn:hover {
          background: var(--nex-primary, #00f2ff);
          color: #000;
        }

        .fallback-panel {
          display: flex;
          flex-direction: column;
          gap: 6px;
          border-top: 1px dashed rgba(255, 255, 255, 0.1);
          padding-top: 10px;
        }

        .social-buttons {
          display: flex;
          gap: 6px;
        }

        .social-btn {
          flex: 1;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 6px;
          font-family: inherit;
          font-size: 7.5px;
          font-weight: bold;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .social-btn:hover {
          border-color: var(--nex-accent, #ff007f);
          color: var(--nex-accent, #ff007f);
        }

        /* QR Share */
        .qr-share-modal {
          position: absolute;
          inset: 0;
          background: rgba(7, 7, 7, 0.95);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          z-index: 100;
        }

        .qr-box {
          width: 80px;
          height: 80px;
          border: 1px solid var(--nex-primary, #00f2ff);
          background: repeating-linear-gradient(45deg, #000, #000 4px, var(--nex-primary, #00f2ff) 4px, var(--nex-primary, #00f2ff) 5px);
          opacity: 0.8;
        }

        .close-qr {
          background: transparent;
          border: none;
          color: var(--nex-accent, #ff007f);
          font-size: 8px;
          font-weight: bold;
          cursor: pointer;
          letter-spacing: 0.1em;
        }

        /* Watermark */
        .nex-badge-inline {
          position: absolute;
          top: 4px;
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

        .hidden { display: none !important; }
      </style>

      <div class="share-wrapper">
        <div class="nex-badge-inline">
          <img class="nex-badge-logo" src="${logoSrc}" style="height: 5px; width: auto;" onerror="this.style.display='none'">
          <span>NEX_SHARE</span>
        </div>
        <button class="main-share-btn">SHARE_LINK</button>
        
        <div class="fallback-panel">
          <div class="social-buttons">
            <button class="social-btn copy-btn">COPY_LINK</button>
            <button class="social-btn qr-btn">QR_SHARE</button>
          </div>
        </div>

        <div class="qr-share-modal hidden">
          <div class="qr-box"></div>
          <span style="font-size: 6px; color:#fff; font-weight:bold; letter-spacing:0.1em;">SCAN_QR_TO_OPEN</span>
          <button class="close-qr">CLOSE_QR</button>
        </div>
      </div>
    `;
  }
}

customElements.define('nex-share', NexShare);
