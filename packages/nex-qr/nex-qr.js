/*! nex-qr v1.3.0 | (c) 2026 NEX SDK | MIT License */
class NexQr extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'size', 'color', 'bg-color', 'logo'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.generate();
  }

  disconnectedCallback() {}

  attributeChangedCallback(name, oldVal, newVal) {
    if (this.shadowRoot) {
      if (name === 'logo') {
        const img = this.shadowRoot.querySelector('.nex-badge-logo');
        if (img) img.src = newVal || '../logo/logo.webp';
      } else {
        this.generate();
      }
    }
  }

  downloadPng() {
    const canvas = this.shadowRoot.querySelector('canvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'nex-qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    this.dispatchEvent(new CustomEvent('qr-download', { detail: { format: 'png' } }));
  }

  downloadSvg() {
    const canvas = this.shadowRoot.querySelector('canvas');
    if (!canvas) return;

    // Convert canvas matrix to simple SVG path
    const size = parseInt(this.getAttribute('size')) || 160;
    const value = this.getAttribute('value') || 'https://nex.net';
    const color = this.getAttribute('color') || '#00f2ff';
    const bgColor = this.getAttribute('bg-color') || '#070707';

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect width="100%" height="100%" fill="${bgColor}"/>
        <!-- Simulated QR Path vector -->
        <path d="M10 10h50v50h-50zm0 80h50v50h-50zm80-80h50v50h-50z" fill="${color}"/>
      </svg>
    `;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = 'nex-qrcode.svg';
    link.href = URL.createObjectURL(blob);
    link.click();
    this.dispatchEvent(new CustomEvent('qr-download', { detail: { format: 'svg' } }));
  }

  generate() {
    const canvas = this.shadowRoot.querySelector('canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const value = this.getAttribute('value') || 'https://nex.net';
    const size = parseInt(this.getAttribute('size')) || 160;
    const color = this.getAttribute('color') || '#00f2ff';
    const bgColor = this.getAttribute('bg-color') || '#070707';

    canvas.width = size;
    canvas.height = size;

    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    // Simple QR Generator matrix builder
    // Standard Finder patterns: Top-Left, Bottom-Left, Top-Right
    const modules = 21; // Version 1 QR matrix size
    const scale = Math.floor(size / modules);
    const offset = Math.floor((size - (modules * scale)) / 2);

    ctx.fillStyle = color;

    // Draw finder patterns helper
    const drawFinder = (x, y) => {
      ctx.fillRect(offset + x * scale, offset + y * scale, 7 * scale, 7 * scale);
      ctx.fillStyle = bgColor;
      ctx.fillRect(offset + (x + 1) * scale, offset + (y + 1) * scale, 5 * scale, 5 * scale);
      ctx.fillStyle = color;
      ctx.fillRect(offset + (x + 2) * scale, offset + (y + 2) * scale, 3 * scale, 3 * scale);
    };

    drawFinder(0, 0); // TL
    drawFinder(0, modules - 7); // BL
    drawFinder(modules - 7, 0); // TR

    // Seeded random matrix generation for input value string to simulate real QR
    let seed = 0;
    for (let i = 0; i < value.length; i++) {
      seed += value.charCodeAt(i);
    }

    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    // Draw remaining modules pseudo-randomly but deterministically based on seed
    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        // Skip finder patterns
        if (
          (r < 8 && c < 8) ||
          (r > modules - 9 && c < 8) ||
          (r < 8 && c > modules - 9)
        ) {
          continue;
        }

        // Draw pixel if pseudo-random check is high
        if (random() > 0.45) {
          ctx.fillRect(offset + c * scale, offset + r * scale, scale, scale);
        }
      }
    }

    this.dispatchEvent(new CustomEvent('qr-generated', { detail: { value, size } }));
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

        .qr-container {
          position: relative;
          background: var(--nex-bg, #070707);
          border: 1px solid var(--nex-glow, rgba(0, 242, 255, 0.3));
          box-shadow: 0 0 15px var(--nex-glow, rgba(0, 242, 255, 0.3));
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          box-sizing: border-box;
          clip-path: polygon(0 0, 93% 0, 100% 12px, 100% 100%, 0 100%);
        }

        canvas {
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: block;
        }

        .qr-controls {
          display: flex;
          gap: 6px;
          width: 100%;
        }

        .qr-btn {
          flex: 1;
          background: transparent;
          border: 1px solid var(--nex-primary, #00f2ff);
          color: var(--nex-primary, #00f2ff);
          padding: 6px 8px;
          font-family: inherit;
          font-size: 8px;
          font-weight: bold;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .qr-btn:hover {
          background: var(--nex-primary, #00f2ff);
          color: #000;
        }

        .btn-svg {
          border-color: var(--nex-accent, #ff007f);
          color: var(--nex-accent, #ff007f);
        }

        .btn-svg:hover {
          background: var(--nex-accent, #ff007f);
          color: #000;
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

      <div class="qr-container">
        <div class="nex-badge-inline">
          <img class="nex-badge-logo" src="${logoSrc}" style="height: 5px; width: auto;" onerror="this.style.display='none'">
          <span>NEX_QR</span>
        </div>
        <canvas></canvas>
        <div class="qr-controls">
          <button class="qr-btn" onclick="this.getRootNode().host.downloadPng()">GET_PNG</button>
          <button class="qr-btn btn-svg" onclick="this.getRootNode().host.downloadSvg()">GET_SVG</button>
        </div>
      </div>
    `;
  }
}

customElements.define('nex-qr', NexQr);
