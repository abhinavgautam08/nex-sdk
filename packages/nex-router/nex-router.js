/**
 * @license
 * NEX SDK - nex-router.js
 * Cyberpunk navigation bar component featuring digital glitch tab transitions.
 * License: MIT
 */

class NexRouter extends HTMLElement {
  static get observedAttributes() {
    return ['tabs', 'active-tab', 'logo'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.tabList = [];
    this.activeTabId = '';
  }

  connectedCallback() {
    this.parseTabs();
    this.render();
    this.setupListeners();
  }

  disconnectedCallback() {
    const list = this.shadowRoot.querySelector('.nex-router-tabs');
    if (list) {
      list.removeEventListener('click', this.handleTabClickBound);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.shadowRoot.innerHTML !== '') {
      if (name === 'tabs' || name === 'active-tab') {
        this.parseTabs();
        this.render();
        this.setupListeners();
      } else if (name === 'logo') {
        const logoImg = this.shadowRoot.querySelector('.nex-badge-inline img');
        if (logoImg) logoImg.src = newValue || '../logo/logo.webp';
      }
    }
  }

  parseTabs() {
    const tabsAttr = this.getAttribute('tabs') || 'PORTAL:portal;DATA:data;SHELL:shell';
    this.tabList = tabsAttr.split(';').map(item => {
      const parts = item.split(':');
      return {
        label: parts[0] || 'TAB',
        id: parts[1] || parts[0].toLowerCase()
      };
    });

    const activeAttr = this.getAttribute('active-tab');
    if (activeAttr) {
      this.activeTabId = activeAttr;
    } else if (this.tabList.length > 0) {
      this.activeTabId = this.tabList[0].id;
    }
  }

  setupListeners() {
    this.handleTabClickBound = this.handleTabClick.bind(this);
    const list = this.shadowRoot.querySelector('.nex-router-tabs');
    if (list) {
      list.addEventListener('click', this.handleTabClickBound);
    }
  }

  handleTabClick(e) {
    const btn = e.target.closest('.nex-router-tab');
    if (!btn || btn.classList.contains('active')) return;

    const tabId = btn.getAttribute('data-id');
    const tabObj = this.tabList.find(t => t.id === tabId);

    // Apply digital glitch flash effect class
    btn.classList.add('glitching');
    
    setTimeout(() => {
      btn.classList.remove('glitching');
      this.setActiveTab(tabId);
      
      this.dispatchEvent(new CustomEvent('tab-change', {
        detail: { tabId: tabId, label: tabObj ? tabObj.label : '' }
      }));
    }, 150);
  }

  setActiveTab(tabId) {
    this.activeTabId = tabId;
    this.setAttribute('active-tab', tabId);
    
    const tabs = this.shadowRoot.querySelectorAll('.nex-router-tab');
    tabs.forEach(tab => {
      if (tab.getAttribute('data-id') === tabId) {
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
      } else {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
      }
    });

    // Automatically toggle visibility of associated element panels in the page if they have class and id matching tabId
    const rootDoc = this.getRootNode();
    if (rootDoc) {
      this.tabList.forEach(t => {
        const pane = rootDoc.getElementById(t.id);
        if (pane) {
          if (t.id === tabId) {
            pane.classList.remove('hidden');
            pane.style.display = '';
          } else {
            pane.classList.add('hidden');
            pane.style.display = 'none';
          }
        }
      });
    }
  }

  render() {
    const logoSrc = this.getAttribute('logo') || '../logo/logo.webp';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          font-family: 'Orbitron', 'JetBrains Mono', monospace, sans-serif;
          box-sizing: border-box;
        }

        .nex-router-container {
          background-color: #070707;
          border: 1px solid rgba(255, 0, 127, 0.15);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
          padding: 8px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          box-sizing: border-box;
          clip-path: polygon(0 0, 98% 0, 100% 8px, 100% 100%, 2% 100%, 0 85%);
        }

        .nex-router-tabs {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .nex-router-tab {
          background: transparent;
          border: 1px solid transparent;
          color: rgba(255, 255, 255, 0.5);
          font-family: inherit;
          font-size: 8.5px;
          font-weight: 900;
          letter-spacing: 0.15em;
          padding: 8px 16px;
          cursor: pointer;
          text-transform: uppercase;
          transition: all 0.2s ease;
          position: relative;
          outline: none;
        }

        .nex-router-tab:hover {
          color: #ff007f;
          background: rgba(255, 0, 127, 0.03);
          border-color: rgba(255, 0, 127, 0.1);
        }

        .nex-router-tab.active {
          color: #fff;
          background: rgba(255, 0, 127, 0.1);
          border-color: #ff007f;
          box-shadow: 0 0 10px rgba(255, 0, 127, 0.2);
          text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
        }

        /* Glitch effect style */
        .nex-router-tab.glitching {
          animation: glitch-anim 0.15s infinite linear;
          background: #ff007f;
          color: #050505;
        }

        @keyframes glitch-anim {
          0% {
            clip-path: inset(10% 0 30% 0);
            transform: translate(-2px, 1px);
          }
          30% {
            clip-path: inset(40% 0 10% 0);
            transform: translate(2px, -2px);
          }
          70% {
            clip-path: inset(20% 0 50% 0);
            transform: translate(-1px, 2px);
          }
          100% {
            clip-path: inset(0 0 0 0);
            transform: translate(0);
          }
        }

        /* Ambient glowing corners */
        .nex-router-corner {
          position: absolute;
          width: 8px;
          height: 8px;
          pointer-events: none;
        }

        .corner-tl {
          top: 0;
          left: 0;
          border-top: 1.5px solid #ff007f;
          border-left: 1.5px solid #ff007f;
        }

        .corner-br {
          bottom: 0;
          right: 0;
          border-bottom: 1.5px solid #ff007f;
          border-right: 1.5px solid #ff007f;
        }
      </style>

      <div class="nex-router-container">
        <!-- Highlights -->
        <div class="nex-router-corner corner-tl"></div>
        <div class="nex-router-corner corner-br"></div>

        <div class="nex-router-tabs" role="tablist">
          ${this.tabList.map(t => `
            <button class="nex-router-tab ${t.id === this.activeTabId ? 'active' : ''}" 
                    data-id="${t.id}"
                    role="tab"
                    aria-selected="${t.id === this.activeTabId ? 'true' : 'false'}"
                    type="button">
              ${t.label}
            </button>
          `).join('')}
        </div>

        <div class="nex-badge-inline" style="display: flex; align-items: center; gap: 4px; font-size: 5.5px; color: rgba(255, 255, 255, 0.45); font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase;">
          <img src="${logoSrc}" style="height: 5.5px; width: auto;" onerror="this.style.display='none'">
          <span>NEX_ROUTER</span>
        </div>
      </div>
    `;
  }
}

customElements.define('nex-router', NexRouter);
