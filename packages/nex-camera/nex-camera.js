/*! nex-camera v1.3.0 | (c) 2026 NEX SDK | MIT License */
class NexCamera extends HTMLElement {
  static get observedAttributes() {
    return ['audio', 'logo'];
  }

  constructor() {
    super();
    this.stream = null;
    this.facingMode = 'user';
    this.isFlashOn = false;
    this.isMirrored = false;
    this.zoom = 1;
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.attachEvents();
    this.start();
  }

  disconnectedCallback() {
    this.stop();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'logo' && this.shadowRoot) {
      const img = this.shadowRoot.querySelector('.nex-badge-logo');
      if (img) img.src = newVal || '../logo/logo.webp';
    }
  }

  async start() {
    this.stop();
    const hasAudio = this.hasAttribute('audio');
    
    try {
      const constraints = {
        video: { facingMode: this.facingMode },
        audio: hasAudio
      };
      
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      const video = this.shadowRoot.querySelector('video');
      if (video) {
        video.srcObject = this.stream;
      }
      this.dispatchEvent(new CustomEvent('camera-start', { detail: { stream: this.stream } }));
    } catch (err) {
      console.error('Camera connection failed:', err);
      this.dispatchEvent(new CustomEvent('camera-error', { detail: { error: err } }));
      
      // Fallback message inside UI
      const feed = this.shadowRoot.querySelector('.camera-viewport');
      if (feed) {
        feed.innerHTML = `<div class="error-msg">HARDWARE_LINK_FAILED<br>PERMISSIONS_REQUIRED</div>`;
      }
    }
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    const video = this.shadowRoot.querySelector('video');
    if (video) video.srcObject = null;
    this.dispatchEvent(new CustomEvent('camera-stop'));
  }

  capture() {
    const video = this.shadowRoot.querySelector('video');
    if (!video || !this.stream) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');

    if (this.isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');

    // Simulate Flash animation
    const flash = this.shadowRoot.querySelector('.flash-overlay');
    if (flash) {
      flash.classList.add('active');
      setTimeout(() => flash.classList.remove('active'), 150);
    }

    this.dispatchEvent(new CustomEvent('photo-captured', { detail: { dataUrl } }));
    return dataUrl;
  }

  switchCamera() {
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    this.start();
  }

  toggleFlash() {
    this.isFlashOn = !this.isFlashOn;
    const flashBtn = this.shadowRoot.querySelector('.flash-btn');
    if (flashBtn) {
      flashBtn.textContent = this.isFlashOn ? '⚡ FLASH_ON' : '⚡ FLASH_OFF';
    }
    this.dispatchEvent(new CustomEvent('flash-toggle', { detail: { active: this.isFlashOn } }));
  }

  toggleMirror() {
    this.isMirrored = !this.isMirrored;
    const video = this.shadowRoot.querySelector('video');
    if (video) {
      video.style.transform = this.isMirrored ? 'scaleX(-1)' : 'none';
    }
  }

  setZoom(val) {
    this.zoom = val;
    const video = this.shadowRoot.querySelector('video');
    if (video) {
      video.style.transform += ` scale(${this.zoom})`;
    }
  }

  attachEvents() {
    const shadow = this.shadowRoot;
    const captureBtn = shadow.querySelector('.capture-btn');
    const switchBtn = shadow.querySelector('.switch-btn');
    const flashBtn = shadow.querySelector('.flash-btn');
    const mirrorBtn = shadow.querySelector('.mirror-btn');
    const zoomInput = shadow.querySelector('#zoom');

    if (captureBtn) captureBtn.addEventListener('click', () => this.capture());
    if (switchBtn) switchBtn.addEventListener('click', () => this.switchCamera());
    if (flashBtn) flashBtn.addEventListener('click', () => this.toggleFlash());
    if (mirrorBtn) mirrorBtn.addEventListener('click', () => this.toggleMirror());
    if (zoomInput) {
      zoomInput.addEventListener('input', () => {
        this.setZoom(zoomInput.value);
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
          max-width: 480px;
          font-family: 'Orbitron', 'JetBrains Mono', monospace, sans-serif;
          --nex-primary: var(--nex-primary, #00f2ff);
          --nex-accent: var(--nex-accent, #ff007f);
          --nex-bg: var(--nex-bg, #070707);
          --nex-glow: var(--nex-glow, rgba(0, 242, 255, 0.3));
          box-sizing: border-box;
        }

        .camera-container {
          position: relative;
          width: 100%;
          background: var(--nex-bg, #070707);
          border: 1px solid var(--nex-glow, rgba(0, 242, 255, 0.3));
          box-shadow: 0 0 15px var(--nex-glow, rgba(0, 242, 255, 0.3));
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          clip-path: polygon(0 0, 96% 0, 100% 15px, 100% 100%, 0 100%);
        }

        .camera-viewport {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          background: #000;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.2s ease;
        }

        .flash-overlay {
          position: absolute;
          inset: 0;
          background: #ffffff;
          opacity: 0;
          pointer-events: none;
          z-index: 10;
          transition: opacity 0.05s ease;
        }

        .flash-overlay.active {
          opacity: 1;
        }

        .error-msg {
          font-size: 9px;
          font-weight: bold;
          color: var(--nex-accent, #ff007f);
          text-shadow: 0 0 5px var(--nex-glow, rgba(255, 0, 127, 0.3));
          text-align: center;
          line-height: 1.6;
        }

        /* Control Panel */
        .camera-controls {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 14px;
          background: #030303;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .control-row {
          display: flex;
          gap: 8px;
          justify-content: space-between;
          align-items: center;
        }

        .cam-btn {
          flex: 1;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 8px;
          font-family: inherit;
          font-size: 8px;
          font-weight: bold;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .cam-btn:hover {
          border-color: var(--nex-primary, #00f2ff);
          color: var(--nex-primary, #00f2ff);
        }

        .capture-btn {
          border-color: var(--nex-accent, #ff007f);
          color: var(--nex-accent, #ff007f);
          font-size: 9px;
        }

        .capture-btn:hover {
          background: var(--nex-accent, #ff007f);
          color: #000;
          box-shadow: 0 0 10px var(--nex-glow, rgba(255, 0, 127, 0.3));
        }

        .zoom-slider {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }

        .zoom-slider label {
          font-size: 8px;
          color: rgba(255, 255, 255, 0.4);
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        .zoom-slider input {
          flex: 1;
          accent-color: var(--nex-primary, #00f2ff);
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
          color: rgba(255, 255, 255, 0.35);
          font-weight: 900;
          letter-spacing: 0.1em;
          z-index: 15;
          pointer-events: none;
          background: rgba(0,0,0,0.5);
          padding: 2px 5px;
        }
      </style>

      <div class="camera-container">
        <div class="nex-badge-inline">
          <img class="nex-badge-logo" src="${logoSrc}" style="height: 5px; width: auto;" onerror="this.style.display='none'">
          <span>NEX_CAMERA</span>
        </div>
        <div class="camera-viewport">
          <video autoplay playsinline muted></video>
          <div class="flash-overlay"></div>
        </div>
        <div class="camera-controls">
          <div class="zoom-slider">
            <label for="zoom">ZOOM_LEVEL</label>
            <input type="range" id="zoom" min="1" max="3" step="0.1" value="1">
          </div>
          <div class="control-row">
            <button class="cam-btn mirror-btn">MIRROR_OFF</button>
            <button class="cam-btn flash-btn">⚡ FLASH_OFF</button>
            <button class="cam-btn switch-btn">SWITCH_CAM</button>
            <button class="cam-btn capture-btn">CAPTURE_FRAME</button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('nex-camera', NexCamera);
