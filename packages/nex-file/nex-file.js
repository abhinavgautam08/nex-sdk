/*! nex-file v1.0.0 | (c) 2026 NEX SDK | MIT License | https://github.com/user/nex-sdk */
/**
 * NEX-FILE | Cyberpunk File Preview & Utility Component
 * Displays file information and renders dynamic inline previews for images, videos, PDFs, and generic files.
 */

class NexFile extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'name', 'size', 'type', 'logo'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupDownload();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.shadowRoot.innerHTML !== '') {
      this.render();
      this.setupDownload();
    }
  }

  setupDownload() {
    const downloadBtn = this.shadowRoot.querySelector('.nex-file-download');
    if (!downloadBtn) return;

    downloadBtn.addEventListener('click', (e) => {
      const src = this.getAttribute('src');
      const name = this.getAttribute('name') || this.getFileName(src);
      if (!src) return;

      // Create temporary download anchor
      const a = document.createElement('a');
      a.href = src;
      a.download = name;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      this.dispatchEvent(new CustomEvent('download', { detail: { src, name } }));
      if (window.dispatchNexAnalytics) {
        window.dispatchNexAnalytics(this, 'file', 'download', name);
      }
    });
  }

  getFileName(url) {
    if (!url) return 'UNKNOWN_FILE';
    try {
      const decoded = decodeURIComponent(url);
      const parts = decoded.split('/');
      return parts[parts.length - 1].split('?')[0] || 'UNKNOWN_FILE';
    } catch (e) {
      return 'UNKNOWN_FILE';
    }
  }

  getFileExtension(fileName) {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'RAW';
  }

  formatBytes(bytesStr) {
    const bytes = parseFloat(bytesStr);
    if (isNaN(bytes) || bytes === 0) return bytesStr || '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  deduceMimeType(url) {
    const name = this.getFileName(url).toLowerCase();
    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.gif') || name.endsWith('.webp') || name.endsWith('.svg') || name.endsWith('.avif')) {
      return 'image';
    }
    if (name.endsWith('.mp4') || name.endsWith('.webm') || name.endsWith('.ogg') || name.endsWith('.mkv') || name.endsWith('.m3u8')) {
      return 'video';
    }
    if (name.endsWith('.pdf')) {
      return 'pdf';
    }
    return 'generic';
  }

  renderPreview(src, mimeType) {
    if (mimeType.startsWith('image')) {
      return `<img src="${src}" class="nex-file-img-preview" alt="File Preview">`;
    }
    if (mimeType.startsWith('video')) {
      return `
        <video class="nex-file-video-preview" controls playsinline>
          <source src="${src}">
          Your browser does not support video previews.
        </video>
      `;
    }
    if (mimeType === 'pdf' || mimeType.startsWith('application/pdf')) {
      return `<iframe src="${src}#toolbar=0" class="nex-file-pdf-preview" title="PDF Preview"></iframe>`;
    }
    
    // Generic File Icon representation
    const ext = this.getFileExtension(this.getFileName(src));
    return `
      <div class="nex-file-generic-preview">
        <svg class="nex-file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <div class="nex-file-extension-badge">${ext}</div>
      </div>
    `;
  }

  render() {
    const src = this.getAttribute('src') || '';
    const name = this.getAttribute('name') || this.getFileName(src);
    const size = this.getAttribute('size') ? this.formatBytes(this.getAttribute('size')) : 'UNKNOWN_SIZE';
    const declaredType = this.getAttribute('type');
    const deducedType = declaredType ? declaredType : this.deduceMimeType(src);
    const logoSrc = this.getAttribute('logo') || '../logo/logo.webp';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --nex-primary: var(--nex-primary, #00f2ff);
          --nex-accent: var(--nex-accent, #ff007f);
          --nex-bg: var(--nex-bg, #070707);
          --nex-glow: rgba(0, 242, 255, 0.3);
          display: block;
          max-width: 420px;
          font-family: 'Orbitron', 'JetBrains Mono', monospace, sans-serif;
          box-sizing: border-box;
        }

        .nex-file-card {
          background-color: var(--nex-bg, #070707);
          border: 1px solid var(--nex-glow, rgba(0, 242, 255, 0.3));
          clip-path: polygon(0% 0%, 94% 0%, 100% 6%, 100% 100%, 0% 100%);
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
          box-sizing: border-box;
          overflow: hidden;
        }

        .nex-file-preview-area {
          position: relative;
          width: 100%;
          height: 200px;
          background-color: #0d0d0d;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid rgba(0, 242, 255, 0.1);
          overflow: hidden;
        }

        .nex-file-img-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .nex-file-video-preview {
          width: 100%;
          height: 100%;
          background: #000;
        }

        .nex-file-pdf-preview {
          width: 100%;
          height: 100%;
          border: none;
        }

        .nex-file-generic-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .nex-file-icon {
          width: 64px;
          height: 64px;
          color: var(--nex-primary, #00f2ff);
          filter: drop-shadow(0 0 8px rgba(0, 242, 255, 0.3));
        }

        .nex-file-extension-badge {
          position: absolute;
          bottom: -2px;
          background: var(--nex-accent, #ff007f);
          color: #fff;
          font-size: 8px;
          font-weight: 900;
          padding: 2px 6px;
          letter-spacing: 0.1em;
          border: 1px solid rgba(255, 0, 127, 0.5);
          text-transform: uppercase;
        }

        .nex-file-info-area {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .nex-file-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nex-file-name {
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          word-break: break-all;
          text-transform: uppercase;
        }

        .nex-file-details {
          display: flex;
          gap: 12px;
          font-size: 8px;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.1em;
          font-weight: bold;
        }

        .nex-file-size-badge {
          color: var(--nex-primary, #00f2ff);
        }

        .nex-file-download {
          background: var(--nex-glow, rgba(0, 242, 255, 0.3));
          border: 1px solid var(--nex-primary, #00f2ff);
          color: var(--nex-primary, #00f2ff);
          font-family: inherit;
          font-size: 9px;
          font-weight: 900;
          padding: 8px 16px;
          cursor: pointer;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .nex-file-download:hover {
          background: var(--nex-primary, #00f2ff);
          color: #050505;
          box-shadow: 0 0 15px var(--nex-glow, rgba(0, 242, 255, 0.3));
        }

        .nex-file-download:active {
          transform: scale(0.98);
        }

        .download-btn-icon {
          width: 12px;
          height: 12px;
        }
      </style>

      <div class="nex-file-card">
        <!-- Preview -->
        <div class="nex-file-preview-area">
          ${this.renderPreview(src, deducedType)}
        </div>

        <!-- Info & Controls -->
        <div class="nex-file-info-area">
          <div class="nex-file-meta">
            <div class="nex-file-name">${name}</div>
            <div class="nex-file-details">
              <span class="nex-file-size-badge">// SIZE: ${size}</span>
              <span class="nex-file-type-badge">// FORMAT: ${deducedType.toUpperCase()}</span>
              <div class="nex-badge-inline" style="display: inline-flex; align-items: center; gap: 4px; font-size: 5.5px; color: rgba(255, 255, 255, 0.45); font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; font-family: inherit; margin-left: 8px; vertical-align: middle;">
                <img src="${logoSrc}" style="height: 5.5px; width: auto;" onerror="this.style.display='none'">
                <span>NEX_FILE</span>
              </div>
            </div>
          </div>

          <button class="nex-file-download" aria-label="Download File">
            <svg class="download-btn-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Payload
          </button>
        </div>
      </div>
    `;
  }
}

customElements.define('nex-file', NexFile);
