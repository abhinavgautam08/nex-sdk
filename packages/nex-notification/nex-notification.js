/*! nex-notification v1.3.0 | (c) 2026 NEX SDK | MIT License */
class NexNotification extends HTMLElement {
  static get observedAttributes() {
    return ['position', 'max-notifications'];
  }

  constructor() {
    super();
    this.notifications = [];
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.registerGlobalHelper();
  }

  disconnectedCallback() {}

  attributeChangedCallback(name, oldVal, newVal) {
    if (this.shadowRoot) {
      this.render();
    }
  }

  registerGlobalHelper() {
    window.showNexNotification = (type, text, duration) => {
      this.show(type, text, duration);
    };
  }

  show(type, text, duration = 3000) {
    const max = parseInt(this.getAttribute('max-notifications')) || 5;
    
    const notification = {
      id: Date.now() + Math.random(),
      type: type || 'info', // success, error, warning, info
      text: text,
      duration: duration
    };

    this.notifications.push(notification);
    if (this.notifications.length > max) {
      this.notifications.shift();
    }

    this.renderNotifications();
    this.dispatchEvent(new CustomEvent('notification-show', { detail: { notification } }));
  }

  remove(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.renderNotifications();
  }

  clear() {
    this.notifications = [];
    this.renderNotifications();
  }

  renderNotifications() {
    const list = this.shadowRoot.querySelector('.notification-list');
    if (!list) return;

    list.innerHTML = this.notifications.map(n => {
      let icon = 'info';
      let borderClass = 'border-info';
      if (n.type === 'success') {
        icon = 'check_circle';
        borderClass = 'border-success';
      } else if (n.type === 'error') {
        icon = 'error';
        borderClass = 'border-error';
      } else if (n.type === 'warning') {
        icon = 'warning';
        borderClass = 'border-warning';
      }

      return `
        <div class="notification-item ${borderClass}" id="n-${n.id}">
          <div class="notification-icon">${n.type.toUpperCase() === 'SUCCESS' ? '✓' : n.type.toUpperCase() === 'ERROR' ? '⚠' : 'ℹ'}</div>
          <div class="notification-text">${n.text}</div>
          <button class="close-btn" onclick="this.getRootNode().host.remove(${n.id})">×</button>
          <div class="progress-bar" style="animation-duration: ${n.duration}ms;"></div>
        </div>
      `;
    }).join('');

    // Setup auto-close timers
    this.notifications.forEach(n => {
      const el = this.shadowRoot.querySelector(`#n-${n.id}`);
      if (el && !el.dataset.timerSet) {
        el.dataset.timerSet = 'true';
        setTimeout(() => {
          this.remove(n.id);
        }, n.duration);
      }
    });
  }

  render() {
    const position = this.getAttribute('position') || 'bottom-right';
    
    let posStyles = '';
    if (position === 'top-right') posStyles = 'top: 20px; right: 20px;';
    else if (position === 'top-left') posStyles = 'top: 20px; left: 20px;';
    else if (position === 'bottom-left') posStyles = 'bottom: 20px; left: 20px;';
    else posStyles = 'bottom: 20px; right: 20px;';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          ${posStyles}
          z-index: 99999;
          font-family: 'Orbitron', 'JetBrains Mono', monospace, sans-serif;
          --nex-primary: var(--nex-primary, #00f2ff);
          --nex-accent: var(--nex-accent, #ff007f);
          --nex-bg: var(--nex-bg, #070707);
          --nex-glow: var(--nex-glow, rgba(0, 242, 255, 0.3));
          box-sizing: border-box;
          pointer-events: none;
        }

        .notification-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: auto;
        }

        .notification-item {
          position: relative;
          background: var(--nex-bg, #070707);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 14px 40px 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #ffffff;
          font-size: 10px;
          font-weight: bold;
          letter-spacing: 0.1em;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
          width: 280px;
          box-sizing: border-box;
          overflow: hidden;
          clip-path: polygon(0 0, 95% 0, 100% 12px, 100% 100%, 0 100%);
          animation: slide-in 0.25s cubic-bezier(0.19, 1, 0.22, 1);
        }

        .border-info {
          border-left: 3px solid var(--nex-primary, #00f2ff);
          box-shadow: 0 0 10px var(--nex-glow, rgba(0, 242, 255, 0.2));
        }

        .border-success {
          border-left: 3px solid #39ff14;
          box-shadow: 0 0 10px rgba(57, 255, 20, 0.2);
        }

        .border-error {
          border-left: 3px solid var(--nex-accent, #ff007f);
          box-shadow: 0 0 10px var(--nex-glow, rgba(255, 0, 127, 0.2));
        }

        .border-warning {
          border-left: 3px solid #ffb700;
          box-shadow: 0 0 10px rgba(255, 183, 0, 0.2);
        }

        .notification-icon {
          font-size: 12px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .border-info .notification-icon { color: var(--nex-primary, #00f2ff); }
        .border-success .notification-icon { color: #39ff14; }
        .border-error .notification-icon { color: var(--nex-accent, #ff007f); }
        .border-warning .notification-icon { color: #ffb700; }

        .notification-text {
          flex: 1;
          word-break: break-word;
          line-height: 1.4;
        }

        .close-btn {
          position: absolute;
          top: 8px;
          right: 12px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.3);
          font-size: 14px;
          cursor: pointer;
          padding: 0;
        }

        .close-btn:hover {
          color: #ffffff;
        }

        .progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          background: rgba(255, 255, 255, 0.2);
          width: 100%;
          animation: shrink linear forwards;
        }

        .border-info .progress-bar { background: var(--nex-primary, #00f2ff); }
        .border-success .progress-bar { background: #39ff14; }
        .border-error .progress-bar { background: var(--nex-accent, #ff007f); }
        .border-warning .progress-bar { background: #ffb700; }

        @keyframes slide-in {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      </style>
      <div class="notification-list"></div>
    `;
  }
}

// Auto-instantiate container if not loaded to prevent global function errors
if (!customElements.get('nex-notification')) {
  customElements.define('nex-notification', NexNotification);
  
  // Append default container automatically
  window.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('nex-notification')) {
      const container = document.createElement('nex-notification');
      document.body.appendChild(container);
    }
  });
}
