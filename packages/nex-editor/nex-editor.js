/*! nex-editor v1.3.0 | (c) 2026 NEX SDK | MIT License */
class NexEditor extends HTMLElement {
  static get observedAttributes() {
    return ['logo'];
  }

  constructor() {
    super();
    this.history = [];
    this.historyIndex = -1;
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.attachEvents();
    this.saveState(); // initial save
  }

  disconnectedCallback() {}

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'logo' && this.shadowRoot) {
      const img = this.shadowRoot.querySelector('.nex-badge-logo');
      if (img) img.src = newVal || '../logo/logo.webp';
    }
  }

  getHtml() {
    const area = this.shadowRoot.querySelector('.editor-workspace');
    return area ? area.innerHTML : '';
  }

  getMarkdown() {
    let html = this.getHtml();
    // basic markdown compiler rules
    html = html.replace(/<b>(.*?)<\/b>/gi, '**$1**');
    html = html.replace(/<i>(.*?)<\/i>/gi, '*$1*');
    html = html.replace(/<code>(.*?)<\/code>/gi, '`$1`');
    html = html.replace(/<a href="(.*?)">(.*?)<\/a>/gi, '[$2]($1)');
    html = html.replace(/<br>/gi, '\n');
    html = html.replace(/<div>/gi, '\n');
    html = html.replace(/<\/div>/gi, '');
    return html.replace(/<[^>]*>/g, ''); // strip remaining tags
  }

  setMarkdown(md) {
    let html = md;
    html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    html = html.replace(/\n/g, '<br>');
    
    const area = this.shadowRoot.querySelector('.editor-workspace');
    if (area) {
      area.innerHTML = html;
      this.saveState();
    }
  }

  saveState() {
    const html = this.getHtml();
    if (this.history[this.historyIndex] === html) return;
    
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(html);
    this.historyIndex = this.history.length - 1;
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const area = this.shadowRoot.querySelector('.editor-workspace');
      if (area) area.innerHTML = this.history[this.historyIndex];
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const area = this.shadowRoot.querySelector('.editor-workspace');
      if (area) area.innerHTML = this.history[this.historyIndex];
    }
  }

  execCommand(cmd, value = null) {
    const shadow = this.shadowRoot;
    const workspace = shadow.querySelector('.editor-workspace');
    workspace.focus();

    if (cmd === 'bold') {
      document.execCommand('bold', false, null);
    } else if (cmd === 'italic') {
      document.execCommand('italic', false, null);
    } else if (cmd === 'code') {
      const selected = window.getSelection().toString();
      document.execCommand('insertHTML', false, `<code>${selected || 'code'}</code>`);
    } else if (cmd === 'link') {
      const url = prompt('Enter Destination URL:');
      if (url) document.execCommand('createLink', false, url);
    } else if (cmd === 'image') {
      const url = prompt('Enter Image Source URL:');
      if (url) document.execCommand('insertImage', false, url);
    } else if (cmd === 'table') {
      const tableHtml = `
        <table style="border: 1px solid var(--nex-primary); border-collapse: collapse; margin: 10px 0; width: 100%;">
          <tr><th style="border: 1px solid rgba(255,255,255,0.2); padding: 6px;">HEADER 1</th><th style="border: 1px solid rgba(255,255,255,0.2); padding: 6px;">HEADER 2</th></tr>
          <tr><td style="border: 1px solid rgba(255,255,255,0.2); padding: 6px;">DATA 1</td><td style="border: 1px solid rgba(255,255,255,0.2); padding: 6px;">DATA 2</td></tr>
        </table>
      `;
      document.execCommand('insertHTML', false, tableHtml);
    }

    this.saveState();
    this.dispatchEvent(new CustomEvent('change', { detail: { html: this.getHtml() } }));
  }

  attachEvents() {
    const shadow = this.shadowRoot;
    const workspace = shadow.querySelector('.editor-workspace');

    workspace.addEventListener('input', () => {
      this.saveState();
      this.dispatchEvent(new CustomEvent('change', { detail: { html: this.getHtml() } }));
    });

    shadow.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = btn.dataset.action;
        if (action === 'undo') this.undo();
        else if (action === 'redo') this.redo();
        else if (action === 'html') {
          this.dispatchEvent(new CustomEvent('export', { detail: { format: 'html', data: this.getHtml() } }));
        } else if (action === 'markdown') {
          this.dispatchEvent(new CustomEvent('export', { detail: { format: 'markdown', data: this.getMarkdown() } }));
        } else {
          this.execCommand(action);
        }
      });
    });
  }

  render() {
    const logoSrc = this.getAttribute('logo') || '../logo/logo.webp';
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          font-family: 'Orbitron', 'JetBrains Mono', monospace, sans-serif;
          --nex-primary: var(--nex-primary, #00f2ff);
          --nex-accent: var(--nex-accent, #ff007f);
          --nex-bg: var(--nex-bg, #070707);
          --nex-glow: var(--nex-glow, rgba(0, 242, 255, 0.3));
          box-sizing: border-box;
        }

        .editor-container {
          position: relative;
          width: 100%;
          background: var(--nex-bg, #070707);
          border: 1px solid var(--nex-glow, rgba(0, 242, 255, 0.3));
          box-shadow: 0 0 15px var(--nex-glow, rgba(0, 242, 255, 0.3));
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          clip-path: polygon(0 0, 97% 0, 100% 15px, 100% 100%, 0 100%);
        }

        .editor-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          padding: 8px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          background: #030303;
          align-items: center;
        }

        .tool-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 6px 10px;
          font-size: 8px;
          font-weight: bold;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s ease;
        }

        .tool-btn:hover {
          border-color: var(--nex-primary, #00f2ff);
          color: var(--nex-primary, #00f2ff);
        }

        .btn-accent {
          border-color: var(--nex-accent, #ff007f);
          color: var(--nex-accent, #ff007f);
        }

        .btn-accent:hover {
          background: var(--nex-accent, #ff007f);
          color: #000;
        }

        .editor-workspace {
          flex: 1;
          min-height: 180px;
          max-height: 350px;
          overflow-y: auto;
          padding: 16px;
          outline: none;
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11.5px;
          line-height: 1.6;
          box-sizing: border-box;
        }

        .editor-workspace code {
          background: rgba(255, 255, 255, 0.05);
          color: var(--nex-primary, #00f2ff);
          padding: 2px 4px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          font-family: inherit;
        }

        .editor-workspace a {
          color: var(--nex-accent, #ff007f);
          text-decoration: underline;
        }

        /* Watermark */
        .nex-badge-inline {
          position: absolute;
          top: 8px;
          right: 12px;
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

      <div class="editor-container">
        <div class="nex-badge-inline">
          <img class="nex-badge-logo" src="${logoSrc}" style="height: 5px; width: auto;" onerror="this.style.display='none'">
          <span>NEX_EDITOR</span>
        </div>
        <div class="editor-toolbar">
          <button class="tool-btn" data-action="bold">BOLD</button>
          <button class="tool-btn" data-action="italic">ITALIC</button>
          <button class="tool-btn" data-action="code">CODE</button>
          <button class="tool-btn" data-action="link">LINK</button>
          <button class="tool-btn" data-action="image">IMAGE</button>
          <button class="tool-btn" data-action="table">TABLE</button>
          <span style="width: 1px; height: 12px; background: rgba(255,255,255,0.1); margin: 0 4px;"></span>
          <button class="tool-btn" data-action="undo">UNDO</button>
          <button class="tool-btn" data-action="redo">REDO</button>
          <span style="flex: 1;"></span>
          <button class="tool-btn btn-accent" data-action="html">EXPORT_HTML</button>
          <button class="tool-btn btn-accent" data-action="markdown">EXPORT_MD</button>
        </div>
        <div class="editor-workspace" contenteditable="true" spellcheck="false"></div>
      </div>
    `;
  }
}

customElements.define('nex-editor', NexEditor);
