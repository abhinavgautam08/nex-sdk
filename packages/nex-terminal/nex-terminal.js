/**
 * @license
 * NEX SDK - nex-terminal.js
 * Cyberpunk monospaced terminal simulator component.
 * License: MIT
 */

class NexTerminal extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'placeholder', 'logo'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.logs = [];
    this.commandHistory = [];
    this.historyIndex = -1;
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
    this.writeLine('NEX_OS v1.1.0 // SHELL_ESTABLISHED', 'success');
    this.writeLine('Type "help" for a list of available directives.', 'info');
  }

  disconnectedCallback() {
    const form = this.shadowRoot.querySelector('.nex-terminal-form');
    if (form) {
      form.removeEventListener('submit', this.handleSubmitBound);
    }
    const input = this.shadowRoot.querySelector('.nex-terminal-input');
    if (input) {
      input.removeEventListener('keydown', this.handleKeyDownBound);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.shadowRoot.innerHTML !== '') {
      if (name === 'title') {
        const titleEl = this.shadowRoot.querySelector('.nex-terminal-title');
        if (titleEl) titleEl.textContent = newValue || 'NEX_OS_TERMINAL';
      } else if (name === 'placeholder') {
        const inputEl = this.shadowRoot.querySelector('.nex-terminal-input');
        if (inputEl) inputEl.placeholder = newValue || 'ENTER DIRECTIVE...';
      } else if (name === 'logo') {
        const logoImg = this.shadowRoot.querySelector('.nex-badge-inline img');
        if (logoImg) logoImg.src = newValue || '../logo/logo.webp';
      }
    }
  }

  setupListeners() {
    this.handleSubmitBound = this.handleSubmit.bind(this);
    this.handleKeyDownBound = this.handleKeyDown.bind(this);

    const form = this.shadowRoot.querySelector('.nex-terminal-form');
    if (form) {
      form.addEventListener('submit', this.handleSubmitBound);
    }

    const input = this.shadowRoot.querySelector('.nex-terminal-input');
    if (input) {
      input.addEventListener('keydown', this.handleKeyDownBound);
    }
  }

  writeLine(text, type = 'info') {
    this.logs.push({ text, type });
    this.updateLogsUI();
  }

  clear() {
    this.logs = [];
    this.updateLogsUI();
  }

  updateLogsUI() {
    const list = this.shadowRoot.querySelector('.nex-terminal-logs');
    if (!list) return;

    list.innerHTML = this.logs.map(log => `
      <div class="nex-terminal-line ${log.type}">
        <span class="prefix">//</span> ${log.text}
      </div>
    `).join('');

    const scrollContainer = this.shadowRoot.querySelector('.nex-terminal-body');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    const input = this.shadowRoot.querySelector('.nex-terminal-input');
    if (!input) return;

    const cmd = input.value.trim();
    if (!cmd) return;

    this.commandHistory.push(cmd);
    this.historyIndex = this.commandHistory.length;

    this.writeLine(`> ${cmd}`, 'input');
    this.executeCommand(cmd);

    input.value = '';
  }

  handleKeyDown(e) {
    const input = this.shadowRoot.querySelector('.nex-terminal-input');
    if (!input) return;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        input.value = this.commandHistory[this.historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
        input.value = this.commandHistory[this.historyIndex];
      } else {
        this.historyIndex = this.commandHistory.length;
        input.value = '';
      }
    }
  }

  executeCommand(cmdString) {
    const parts = cmdString.toLowerCase().split(/\s+/);
    const mainCmd = parts[0];
    const args = parts.slice(1);
    let response = '';
    let responseType = 'info';

    switch (mainCmd) {
      case 'help':
        response = `AVAILABLE DIRECTIVES:\n  help      - DISPLAY SYSTEM DICTIONARY\n  clear     - WIPE TERMINAL DISPLAY\n  sysinfo   - PRINT INTERFACE SPECS\n  ping      - QUERY NETWORK LATENCY\n  status    - ASSESS LOCAL PORTAL UPLINKS`;
        responseType = 'info';
        break;
      case 'clear':
        this.clear();
        return;
      case 'sysinfo':
        response = `SYSTEM SPECIFICATIONS:\n  NEX SDK VERSION : v1.1.0\n  USER_AGENT      : ${navigator.userAgent.slice(0, 40)}...\n  RESOLVED_SCREEN : ${window.screen.width}x${window.screen.height}\n  LANGUAGE_PREF   : ${navigator.language}`;
        responseType = 'success';
        break;
      case 'ping':
        const latency = Math.floor(Math.random() * 45) + 12;
        response = `PONG // REPLY FROM GATEWAY: LATENCY=${latency}ms`;
        responseType = 'success';
        break;
      case 'status':
        response = `GATEWAY STATUS PORTAL:\n  UPLINK NETWORK  : ACTIVE\n  MOCK_UPLOADER   : STABLE\n  TELEMETRY CLIENT: STREAMING_BEACON`;
        responseType = 'warning';
        break;
      default:
        response = `DIRECTIVE "${cmdString.toUpperCase()}" NOT RECOGNIZED. TYPE "help" FOR MAN PATHS.`;
        responseType = 'error';
    }

    if (response) {
      const lines = response.split('\n');
      lines.forEach(line => this.writeLine(line, responseType));
    }

    this.dispatchEvent(new CustomEvent('command', {
      detail: { command: cmdString, response: response }
    }));
  }

  render() {
    const title = this.getAttribute('title') || 'NEX_OS_TERMINAL';
    const placeholder = this.getAttribute('placeholder') || 'ENTER DIRECTIVE...';
    const logoSrc = this.getAttribute('logo') || '../logo/logo.webp';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --nex-primary: var(--nex-primary, #39ff14);
          --nex-accent: var(--nex-accent, #ff007f);
          --nex-bg: var(--nex-bg, #070707);
          --nex-glow: var(--nex-glow, rgba(57, 255, 20, 0.3));
          display: block;
          width: 100%;
          max-width: 600px;
          font-family: 'Orbitron', 'JetBrains Mono', monospace, sans-serif;
          box-sizing: border-box;
        }

        .nex-terminal-container {
          background-color: var(--nex-bg, #070707);
          border: 1px solid var(--nex-glow, rgba(57, 255, 20, 0.3));
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8), 0 0 10px var(--nex-glow, rgba(57, 255, 20, 0.3));
          clip-path: polygon(0 0, 96% 0, 100% 15px, 100% 100%, 4% 100%, 0 94%);
          position: relative;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          height: 320px;
          overflow: hidden;
        }

        /* Scan line animation overlay */
        .nex-terminal-container::before {
          content: " ";
          display: block;
          position: absolute;
          top: 0; left: 0; bottom: 0; right: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          z-index: 20;
          background-size: 100% 2px, 3px 100%;
          pointer-events: none;
        }

        .nex-terminal-header {
          border-bottom: 1px solid var(--nex-glow, rgba(57, 255, 20, 0.3));
          padding: 8px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-sizing: border-box;
          background: rgba(57, 255, 20, 0.02);
        }

        .nex-terminal-title {
          font-size: 9px;
          font-weight: 900;
          color: var(--nex-primary, #39ff14);
          letter-spacing: 0.15em;
          text-shadow: 0 0 6px rgba(57, 255, 20, 0.4);
          text-transform: uppercase;
        }

        .nex-terminal-body {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-sizing: border-box;
          scrollbar-width: none;
        }

        .nex-terminal-body::-webkit-scrollbar {
          display: none;
        }

        .nex-terminal-logs {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .nex-terminal-line {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9.5px;
          line-height: 1.5;
          letter-spacing: 0.02em;
          white-space: pre-wrap;
        }

        .nex-terminal-line.info {
          color: rgba(255, 255, 255, 0.9);
        }

        .nex-terminal-line.success {
          color: var(--nex-primary, #39ff14);
          text-shadow: 0 0 5px rgba(57, 255, 20, 0.5);
        }

        .nex-terminal-line.warning {
          color: #ffb700;
          text-shadow: 0 0 5px rgba(255, 183, 0, 0.5);
        }

        .nex-terminal-line.error {
          color: var(--nex-accent, #ff007f);
          text-shadow: 0 0 5px rgba(255, 0, 85, 0.5);
        }

        .nex-terminal-line.input {
          color: #00f2ff;
          text-shadow: 0 0 5px rgba(0, 242, 255, 0.4);
          font-weight: bold;
        }

        .nex-terminal-line .prefix {
          color: var(--nex-primary, #39ff14);
          margin-right: 4px;
        }

        .nex-terminal-form {
          border-top: 1px solid var(--nex-glow, rgba(57, 255, 20, 0.3));
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.4);
          box-sizing: border-box;
        }

        .nex-terminal-prompt {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: var(--nex-primary, #39ff14);
          font-weight: bold;
          text-shadow: 0 0 5px rgba(57, 255, 20, 0.5);
        }

        .nex-terminal-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--nex-primary, #39ff14);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.05em;
          text-shadow: 0 0 5px rgba(57, 255, 20, 0.5);
          width: 100%;
        }

        .nex-terminal-input::placeholder {
          color: var(--nex-glow, rgba(57, 255, 20, 0.3));
          text-shadow: none;
        }

        /* Blinking cursor simulation */
        .cursor-indicator {
          width: 6px;
          height: 12px;
          background-color: var(--nex-primary, #39ff14);
          animation: blink 1s infinite step-end;
          box-shadow: 0 0 5px var(--nex-primary, #39ff14);
        }

        @keyframes blink {
          50% { opacity: 0; }
        }

        /* Ambient glowing corners */
        .nex-terminal-corner {
          position: absolute;
          width: 12px;
          height: 12px;
          pointer-events: none;
        }

        .corner-tl {
          top: 0;
          left: 0;
          border-top: 2px solid var(--nex-accent, #ff007f);
          border-left: 2px solid var(--nex-accent, #ff007f);
        }

        .corner-br {
          bottom: 0;
          right: 0;
          border-bottom: 2px solid var(--nex-primary, #39ff14);
          border-right: 2px solid var(--nex-primary, #39ff14);
        }
      </style>

      <div class="nex-terminal-container">
        <!-- Highlights -->
        <div class="nex-terminal-corner corner-tl"></div>
        <div class="nex-terminal-corner corner-br"></div>

        <div class="nex-terminal-header">
          <span class="nex-terminal-title">${title}</span>
          <div class="nex-badge-inline" style="display: flex; align-items: center; gap: 4px; font-size: 5.5px; color: rgba(255, 255, 255, 0.45); font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase;">
            <img src="${logoSrc}" style="height: 5.5px; width: auto;" onerror="this.style.display='none'">
            <span>NEX_SHELL</span>
          </div>
        </div>

        <div class="nex-terminal-body">
          <div class="nex-terminal-logs"></div>
        </div>

        <form class="nex-terminal-form">
          <span class="nex-terminal-prompt">NEX_SYS://></span>
          <input type="text" class="nex-terminal-input" placeholder="${placeholder}" autocomplete="off" spellcheck="false">
          <div class="cursor-indicator"></div>
        </form>
      </div>
    `;
  }
}

customElements.define('nex-terminal', NexTerminal);
