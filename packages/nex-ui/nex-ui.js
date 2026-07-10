/*! nex-ui v1.0.0 | (c) 2026 NEX SDK | MIT License | https://github.com/user/nex-sdk */
/**
 * NEX-UI | Cyberpunk Core Layout and Interaction Base Components Bundle
 * Contains: <nex-button>, <nex-modal>, <nex-toast>, <nex-loader>, and <nex-card>.
 */

// ==========================================
// 1. NEX-BUTTON
// ==========================================
class NexButton extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'size', 'disabled', 'loading'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot.innerHTML !== '') {
      this.render();
    }
  }

  render() {
    const type = this.getAttribute('type') || 'primary'; // primary, secondary, outline, fuchsia, lime
    const size = this.getAttribute('size') || 'md'; // sm, md, lg
    const isDisabled = this.hasAttribute('disabled') || this.hasAttribute('loading');
    const isLoading = this.hasAttribute('loading');
    const disabledAttr = isDisabled ? 'disabled' : '';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --nex-primary: var(--nex-primary, #00f2ff);
          --nex-accent: var(--nex-accent, #ff007f);
          --nex-bg: var(--nex-bg, #070707);
          --nex-glow: var(--nex-glow, rgba(0, 242, 255, 0.3));
          display: inline-block;
          font-family: 'Orbitron', 'JetBrains Mono', monospace, sans-serif;
        }

        button {
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 900;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
          box-sizing: border-box;
          outline: none;
          position: relative;
        }

        button::before {
          content: '';
          position: absolute;
          top: -1px;
          right: -1px;
          width: 8px;
          height: 8px;
          background: transparent;
          border-top: 1px solid currentColor;
          border-right: 1px solid currentColor;
          pointer-events: none;
          clip-path: polygon(0 0, 100% 0, 100% 100%);
          transition: border-color 0.3s;
        }

        button::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: -1px;
          width: 8px;
          height: 8px;
          background: transparent;
          border-bottom: 1px solid currentColor;
          border-left: 1px solid currentColor;
          pointer-events: none;
          clip-path: polygon(0 100%, 0 0, 100% 100%);
          transition: border-color 0.3s;
        }

        /* Sizes */
        .btn-sm {
          font-size: 8px;
          padding: 6px 12px;
          clip-path: polygon(0 0, 92% 0, 100% 30%, 100% 100%, 8% 100%, 0 70%);
        }
        .btn-md {
          font-size: 10px;
          padding: 10px 20px;
          clip-path: polygon(0 0, 92% 0, 100% 25%, 100% 100%, 8% 100%, 0 75%);
        }
        .btn-lg {
          font-size: 12px;
          padding: 14px 28px;
          clip-path: polygon(0 0, 92% 0, 100% 20%, 100% 100%, 8% 100%, 0 80%);
        }

        /* Types */
        .btn-primary {
          background-color: var(--nex-glow, rgba(0, 242, 255, 0.3));
          border: 1px solid var(--nex-primary, #00f2ff);
          color: var(--nex-primary, #00f2ff);
          text-shadow: 0 0 4px rgba(0, 242, 255, 0.4);
        }
        .btn-primary:hover:not(:disabled) {
          background-color: var(--nex-primary, #00f2ff);
          color: var(--nex-bg, #070707);
          box-shadow: 0 0 20px rgba(0, 242, 255, 0.6);
          text-shadow: none;
        }

        .btn-secondary {
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
        }
        .btn-secondary:hover:not(:disabled) {
          background-color: #fff;
          color: var(--nex-bg, #070707);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
        }

        .btn-outline {
          background-color: transparent;
          border: 1px solid rgba(0, 242, 255, 0.25);
          color: rgba(0, 242, 255, 0.8);
        }
        .btn-outline:hover:not(:disabled) {
          border-color: var(--nex-primary, #00f2ff);
          color: var(--nex-primary, #00f2ff);
          box-shadow: 0 0 10px rgba(0, 242, 255, 0.2);
        }

        .btn-fuchsia {
          background-color: rgba(255, 0, 127, 0.05);
          border: 1px solid var(--nex-accent, #ff007f);
          color: var(--nex-accent, #ff007f);
          text-shadow: 0 0 4px rgba(255, 0, 127, 0.4);
        }
        .btn-fuchsia:hover:not(:disabled) {
          background-color: var(--nex-accent, #ff007f);
          color: var(--nex-bg, #070707);
          box-shadow: 0 0 20px rgba(255, 0, 127, 0.6);
          text-shadow: none;
        }

        .btn-lime {
          background-color: rgba(57, 255, 20, 0.05);
          border: 1px solid #39ff14;
          color: #39ff14;
          text-shadow: 0 0 4px rgba(57, 255, 20, 0.4);
        }
        .btn-lime:hover:not(:disabled) {
          background-color: #39ff14;
          color: var(--nex-bg, #070707);
          box-shadow: 0 0 20px rgba(57, 255, 20, 0.6);
          text-shadow: none;
        }

        /* Disabled / Loading states */
        button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          box-shadow: none !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
          color: rgba(255, 255, 255, 0.3) !important;
          background-color: rgba(255, 255, 255, 0.02) !important;
          text-shadow: none !important;
        }

        /* Loader inside button */
        .btn-spinner {
          width: 10px;
          height: 10px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin-loader 0.8s linear infinite;
        }

        @keyframes spin-loader {
          to { transform: rotate(360deg); }
        }
      </style>

      <button class="btn-${size} btn-${type}" ${disabledAttr}>
        ${isLoading ? '<div class="btn-spinner"></div>' : ''}
        <slot></slot>
      </button>
    `;
  }
}
customElements.define('nex-button', NexButton);


// ==========================================
// 2. NEX-MODAL
// ==========================================
class NexModal extends HTMLElement {
  static get observedAttributes() {
    return ['open', 'title'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._previouslyFocusedElement = null;
  }

  connectedCallback() {
    this.render();
    this.setupModalEvents();
    this.escKeyListener = (e) => {
      if (e.key === 'Escape' && this.hasAttribute('open')) {
        this.close();
      }
    };
    document.addEventListener('keydown', this.escKeyListener);
  }

  disconnectedCallback() {
    if (this.escKeyListener) {
      document.removeEventListener('keydown', this.escKeyListener);
    }
  }

  attributeChangedCallback() {
    if (this.shadowRoot.innerHTML !== '') {
      this.render();
      this.setupModalEvents();
    }
  }

  setupModalEvents() {
    const overlay = this.shadowRoot.querySelector('.nex-modal-overlay');
    const closeBtn = this.shadowRoot.querySelector('.nex-modal-close-btn');

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.close();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
  }

  openModal() {
    this._previouslyFocusedElement = document.activeElement;
    this.setAttribute('open', '');
    this.dispatchEvent(new CustomEvent('open'));
    setTimeout(() => {
      const closeBtn = this.shadowRoot.querySelector('.nex-modal-close-btn');
      if (closeBtn) closeBtn.focus();
    }, 50);
  }

  close() {
    this.removeAttribute('open');
    this.dispatchEvent(new CustomEvent('close'));
    if (this._previouslyFocusedElement) {
      this._previouslyFocusedElement.focus();
      this._previouslyFocusedElement = null;
    }
  }

  render() {
    const isOpen = this.hasAttribute('open');
    const title = this.getAttribute('title') || 'ALERT // SYSTEM_LINK';
    const displayClass = isOpen ? 'active' : 'hidden';

    this.shadowRoot.innerHTML = `
      <style>
        .nex-modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(5, 5, 5, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          box-sizing: border-box;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .nex-modal-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }

        .nex-modal-container {
          background-color: var(--nex-bg, #070707);
          border: 1px solid var(--nex-glow, rgba(0, 242, 255, 0.3));
          box-shadow: 0 0 35px var(--nex-glow, rgba(0, 242, 255, 0.3));
          width: 100%;
          max-width: 500px;
          clip-path: polygon(0 0, 95% 0, 100% 5%, 100% 100%, 5% 100%, 0 95%);
          display: flex;
          flex-direction: column;
          transform: scale(0.9);
          transition: transform 0.3s cubic-bezier(0.19, 1, 0.22, 1);
          box-sizing: border-box;
        }

        .active .nex-modal-container {
          transform: scale(1);
        }

        .nex-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--nex-glow, rgba(0, 242, 255, 0.3));
          padding: 14px 18px;
          box-sizing: border-box;
        }

        .nex-modal-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.1em;
          color: var(--nex-primary, #00f2ff);
          text-shadow: 0 0 6px var(--nex-glow, rgba(0, 242, 255, 0.3));
          text-transform: uppercase;
        }

        .nex-modal-close-btn {
          background: transparent;
          border: none;
          color: var(--nex-accent, #ff007f);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s ease;
        }

        .nex-modal-close-btn:hover {
          transform: scale(1.1);
          color: #fff;
          filter: drop-shadow(0 0 4px var(--nex-accent, #ff007f));
        }

        .nex-modal-close-btn svg {
          width: 14px;
          height: 14px;
        }

        .nex-modal-content {
          padding: 20px 20px 24px;
          color: #fff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          line-height: 1.6;
          max-height: 70vh;
          overflow-y: auto;
          box-sizing: border-box;
        }

        .hidden {
          display: none !important;
        }
      </style>

      <div class="nex-modal-overlay ${displayClass}">
        <div class="nex-modal-container">
          <div class="nex-modal-header">
            <span class="nex-modal-title">${title}</span>
            <button class="nex-modal-close-btn" aria-label="Close Dialog">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div class="nex-modal-content">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define('nex-modal', NexModal);


// ==========================================
// 3. NEX-TOAST
// ==========================================
class NexToast extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.timeouts = [];
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    this.timeouts.forEach(t => clearTimeout(t));
    this.timeouts = [];
  }

  show(message, type = 'info', duration = 4000) {
    const list = this.shadowRoot.querySelector('.nex-toast-list');
    if (!list) return;

    const id = 'toast-' + Math.random().toString(36).substr(2, 9);
    const toast = document.createElement('div');
    toast.className = `nex-toast-item nex-toast-${type}`;
    toast.id = id;

    // Icon map
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>`;
    } else {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-indicator"></div>
      ${iconSvg}
      <span class="toast-msg">${message}</span>
    `;

    list.appendChild(toast);

    // Auto remove
    const t1 = setTimeout(() => {
      toast.classList.add('hiding');
      const t2 = setTimeout(() => {
        if (list.contains(toast)) list.removeChild(toast);
        this.timeouts = this.timeouts.filter(t => t !== t2);
      }, 300);
      this.timeouts.push(t2);
      this.timeouts = this.timeouts.filter(t => t !== t1);
    }, duration);
    this.timeouts.push(t1);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .nex-toast-list {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 10000;
          pointer-events: none;
          max-width: 320px;
          width: 100%;
        }

        .nex-toast-item {
          background-color: var(--nex-bg, #070707);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 18px;
          font-family: 'Orbitron', 'JetBrains Mono', monospace, sans-serif;
          font-size: 9px;
          font-weight: bold;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6);
          position: relative;
          pointer-events: auto;
          clip-path: polygon(0 0, 95% 0, 100% 12px, 100% 100%, 0 100%);
          animation: slide-in 0.3s cubic-bezier(0.19, 1, 0.22, 1) forwards;
          box-sizing: border-box;
        }

        .nex-toast-item.hiding {
          animation: fade-out 0.3s ease forwards;
        }

        .toast-indicator {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
        }

        .toast-icon {
          width: 14px;
          height: 14px;
          shrink: 0;
        }

        /* Success Theme */
        .nex-toast-success {
          border-color: rgba(57, 255, 20, 0.3);
          color: #fff;
        }
        .nex-toast-success .toast-indicator { background-color: #39ff14; }
        .nex-toast-success .toast-icon { color: #39ff14; filter: drop-shadow(0 0 3px #39ff14); }

        /* Error Theme */
        .nex-toast-error {
          border-color: rgba(255, 0, 127, 0.3);
          color: #fff;
        }
        .nex-toast-error .toast-indicator { background-color: var(--nex-accent, #ff007f); }
        .nex-toast-error .toast-icon { color: var(--nex-accent, #ff007f); filter: drop-shadow(0 0 3px var(--nex-accent, #ff007f)); }

        /* Info Theme */
        .nex-toast-info {
          border-color: var(--nex-glow, rgba(0, 242, 255, 0.3));
          color: #fff;
        }
        .nex-toast-info .toast-indicator { background-color: var(--nex-primary, #00f2ff); }
        .nex-toast-info .toast-icon { color: var(--nex-primary, #00f2ff); filter: drop-shadow(0 0 3px var(--nex-primary, #00f2ff)); }

        @keyframes slide-in {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fade-out {
          to {
            transform: scale(0.9);
            opacity: 0;
          }
        }
      </style>

      <div class="nex-toast-list"></div>
    `;
  }
}
customElements.define('nex-toast', NexToast);

// Global Toast Uplink Helper
window.showNexToast = (message, type = 'info', duration = 4000) => {
  let toastContainer = document.querySelector('nex-toast');
  if (!toastContainer) {
    toastContainer = document.createElement('nex-toast');
    document.body.appendChild(toastContainer);
  }
  toastContainer.show(message, type, duration);
};


// ==========================================
// 4. NEX-LOADER
// ==========================================
class NexLoader extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'text', 'logo'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot.innerHTML !== '') {
      this.render();
    }
  }

  render() {
    const type = this.getAttribute('type') || 'spinner'; // spinner, progress
    const text = this.getAttribute('text') || 'SYNCING_DATA_GATEWAY...';
    const logoSrc = this.getAttribute('logo') || '../logo/logo.webp';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --nex-primary: var(--nex-primary, #00f2ff);
          --nex-accent: var(--nex-accent, #ff007f);
          --nex-bg: var(--nex-bg, #070707);
          --nex-glow: var(--nex-glow, rgba(0, 242, 255, 0.3));
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Orbitron', 'JetBrains Mono', monospace, sans-serif;
          box-sizing: border-box;
          padding: 20px;
        }

        .loader-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        /* Spinner Type with brand logo */
        .spinner-container {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spinner-border {
          position: absolute;
          inset: 0;
          border: 3px solid var(--nex-glow, rgba(0, 242, 255, 0.3));
          border-top-color: var(--nex-primary, #00f2ff);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          box-shadow: 0 0 15px var(--nex-glow, rgba(0, 242, 255, 0.3));
        }

        .spinner-logo {
          width: 18px;
          height: 18px;
          object-fit: contain;
          z-index: 2;
          filter: drop-shadow(0 0 4px var(--nex-primary, #00f2ff));
        }

        /* Progress Bar Type */
        .progress-bar-container {
          width: 200px;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(0, 242, 255, 0.2);
        }

        .progress-fill {
          height: 100%;
          background: var(--nex-primary, #00f2ff);
          box-shadow: 0 0 10px var(--nex-primary, #00f2ff);
          width: 30%;
          animation: progress-slide 2s infinite ease-in-out;
        }

        .loader-text {
          font-size: 8px;
          font-weight: 900;
          color: var(--nex-primary, #00f2ff);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-shadow: 0 0 6px rgba(0, 242, 255, 0.4);
          animation: pulse-text 1.5s infinite ease-in-out;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes progress-slide {
          0% {
            left: -35%;
            width: 30%;
          }
          50% {
            left: 30%;
            width: 40%;
          }
          100% {
            left: 105%;
            width: 30%;
          }
        }

        @keyframes pulse-text {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      </style>

      <div class="loader-wrapper">
        ${type === 'spinner' ? `
          <div class="spinner-container">
            <div class="spinner-border"></div>
            <img class="spinner-logo" src="${logoSrc}" onerror="this.style.display='none'">
          </div>
        ` : ''}
        ${type === 'progress' ? '<div class="progress-bar-container"><div class="progress-fill"></div></div>' : ''}
        ${text ? `<div class="loader-text">${text}</div>` : ''}
      </div>
    `;
  }
}
customElements.define('nex-loader', NexLoader);


// ==========================================
// 5. NEX-CARD
// ==========================================
class NexCard extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'logo'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.shadowRoot.innerHTML !== '') {
      this.render();
    }
  }

  render() {
    const title = this.getAttribute('title') || '';
    const logoSrc = this.getAttribute('logo') || '../logo/logo.webp';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --nex-primary: var(--nex-primary, #00f2ff);
          --nex-accent: var(--nex-accent, #ff007f);
          --nex-bg: var(--nex-bg, #070707);
          --nex-glow: var(--nex-glow, rgba(0, 242, 255, 0.3));
          display: block;
          width: 100%;
          font-family: 'Orbitron', 'JetBrains Mono', monospace, sans-serif;
          box-sizing: border-box;
        }

        .nex-card-container {
          background-color: var(--nex-bg, #070707);
          border: 1px solid var(--nex-glow, rgba(0, 242, 255, 0.3));
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
          clip-path: polygon(0 0, 96% 0, 100% 12px, 100% 100%, 4% 100%, 0 92%);
          position: relative;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .nex-card-header {
          border-bottom: 1px solid var(--nex-glow, rgba(0, 242, 255, 0.3));
          padding: 12px 16px;
          display: flex;
          align-items: center;
          box-sizing: border-box;
        }

        .nex-card-title {
          font-size: 10px;
          font-weight: 900;
          color: var(--nex-primary, #00f2ff);
          letter-spacing: 0.12em;
          text-shadow: 0 0 6px var(--nex-glow, rgba(0, 242, 255, 0.3));
          text-transform: uppercase;
        }

        .nex-card-body {
          padding: 16px;
          color: rgba(255, 255, 255, 0.85);
          font-size: 11px;
          line-height: 1.6;
          font-family: 'JetBrains Mono', monospace;
          box-sizing: border-box;
        }

        /* Ambient glowing corners */
        .nex-card-corner {
          position: absolute;
          width: 10px;
          height: 10px;
          pointer-events: none;
        }

        .corner-tl {
          top: 0;
          left: 0;
          border-top: 1.5px solid var(--nex-accent, #ff007f);
          border-left: 1.5px solid var(--nex-accent, #ff007f);
        }

        .corner-br {
          bottom: 0;
          right: 0;
          border-bottom: 1.5px solid var(--nex-primary, #00f2ff);
          border-right: 1.5px solid var(--nex-primary, #00f2ff);
        }
      </style>

      <div class="nex-card-container">
        <!-- Frame Highlights -->
        <div class="nex-card-corner corner-tl"></div>
        <div class="nex-card-corner corner-br"></div>

        ${title ? `
          <div class="nex-card-header" style="justify-content: space-between; display: flex; width: 100%; align-items: center;">
            <span class="nex-card-title">${title}</span>
            <div class="nex-badge-inline" style="display: flex; align-items: center; gap: 4px; font-size: 5.5px; color: rgba(255, 255, 255, 0.45); font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; font-family: inherit;">
              <img src="${logoSrc}" style="height: 5.5px; width: auto;" onerror="this.style.display='none'">
              <span>NEX_UI</span>
            </div>
          </div>
        ` : ''}

        <div class="nex-card-body">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
customElements.define('nex-card', NexCard);
