/*! nex-upload v1.0.0 | (c) 2026 NEX SDK | MIT License | https://github.com/user/nex-sdk */
/**
 * NEX-UPLOAD | Cyberpunk Dynamic File Uploader Component
 * Implements interactive Drag & Drop, multiple file validation queues, progress loaders, and upload event dispatches.
 */

class NexUpload extends HTMLElement {
  static get observedAttributes() {
    return ['endpoint', 'multiple', 'accept', 'max-size', 'auto-upload', 'logo'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.fileQueue = [];
  }

  connectedCallback() {
    this.render();
    this.setupEvents();
  }

  disconnectedCallback() {
    this.fileQueue.forEach(item => {
      if (item.xhr) {
        try {
          item.xhr.abort();
        } catch (e) {}
      }
      if (item.interval) {
        clearInterval(item.interval);
      }
    });
  }

  attributeChangedCallback() {
    if (this.shadowRoot.innerHTML !== '') {
      this.render();
      this.setupEvents();
    }
  }

  setupEvents() {
    const root = this.shadowRoot;
    const dropzone = root.querySelector('.nex-upload-dropzone');
    const fileInput = root.querySelector('.nex-upload-input');
    const selectBtn = root.querySelector('.nex-upload-select-btn');
    const uploadAllBtn = root.querySelector('.nex-upload-action-btn');

    // Trigger file input click
    selectBtn.addEventListener('click', () => fileInput.click());

    // File input change
    fileInput.addEventListener('change', (e) => {
      this.handleFiles(e.target.files);
      fileInput.value = ''; // Reset input to allow selecting same file again
    });

    // Drag & Drop events
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      this.handleFiles(dt.files);
    }, false);

    // Upload action button click
    if (uploadAllBtn) {
      uploadAllBtn.addEventListener('click', () => {
        this.fileQueue.forEach(item => {
          if (item.status === 'pending' || item.status === 'error') {
            this.uploadFile(item);
          }
        });
      });
    }
  }

  handleFiles(files) {
    const multiple = this.hasAttribute('multiple');
    const accept = this.getAttribute('accept');
    const maxSize = parseFloat(this.getAttribute('max-size'));

    let filesArray = Array.from(files);
    
    // If not multiple, limit queue to 1 file
    if (!multiple && filesArray.length > 0) {
      filesArray = [filesArray[0]];
      this.fileQueue = [];
    }

    filesArray.forEach(file => {
      let error = null;

      // Validate Type
      if (accept) {
        const allowedTypes = accept.split(',').map(t => t.trim());
        const fileType = file.type;
        const fileName = file.name.toLowerCase();
        
        const isAllowed = allowedTypes.some(allowed => {
          if (allowed.startsWith('.')) {
            return fileName.endsWith(allowed.toLowerCase());
          }
          if (allowed.endsWith('/*')) {
            const group = allowed.split('/')[0];
            return fileType.startsWith(group);
          }
          return fileType === allowed;
        });

        if (!isAllowed) {
          error = 'INVALID_FORMAT';
        }
      }

      // Validate Size
      if (!error && !isNaN(maxSize) && file.size > maxSize) {
        error = `SIZE_LIMIT_EXCEEDED (${this.formatBytes(maxSize)})`;
      }

      const queueItem = {
        id: 'file-' + Math.random().toString(36).substr(2, 9),
        file: file,
        status: error ? 'error' : 'pending',
        progress: 0,
        errorMessage: error
      };

      this.fileQueue.push(queueItem);
      this.dispatchEvent(new CustomEvent('file-added', { detail: { file, error } }));
      if (window.dispatchNexAnalytics) {
        window.dispatchNexAnalytics(this, 'upload', 'file-added', file.name, error ? 0 : 1);
      }
    });

    this.updateQueueUI();

    // Trigger auto-upload if attribute is active
    if (this.hasAttribute('auto-upload')) {
      this.fileQueue.forEach(item => {
        if (item.status === 'pending') {
          this.uploadFile(item);
        }
      });
    }
  }

  uploadFile(item) {
    const endpoint = this.getAttribute('endpoint');
    
    if (!endpoint) {
      // Mock upload if no endpoint is configured (Dispatches Custom Events)
      this.mockUpload(item);
      return;
    }

    item.status = 'uploading';
    this.updateItemUI(item);

    const xhr = new XMLHttpRequest();
    item.xhr = xhr;
    const formData = new FormData();
    formData.append('file', item.file);

    xhr.open('POST', endpoint, true);

    // Event listener for progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded * 100) / e.total);
        item.progress = percent;
        this.updateItemUI(item);
        this.dispatchEvent(new CustomEvent('upload-progress', { detail: { file: item.file, progress: percent } }));
      }
    });

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        item.status = 'success';
        item.progress = 100;
        this.dispatchEvent(new CustomEvent('upload-success', { detail: { file: item.file, response: xhr.responseText } }));
        if (window.dispatchNexAnalytics) {
          window.dispatchNexAnalytics(this, 'upload', 'upload-success', item.file.name);
        }
      } else {
        item.status = 'error';
        item.errorMessage = `HTTP_${xhr.status}`;
        this.dispatchEvent(new CustomEvent('upload-error', { detail: { file: item.file, error: item.errorMessage } }));
        if (window.dispatchNexAnalytics) {
          window.dispatchNexAnalytics(this, 'upload', 'upload-error', item.file.name);
        }
      }
      this.updateItemUI(item);
    };

    xhr.onerror = () => {
      item.status = 'error';
      item.errorMessage = 'CONNECTION_FAILED';
      this.updateItemUI(item);
      this.dispatchEvent(new CustomEvent('upload-error', { detail: { file: item.file, error: item.errorMessage } }));
      if (window.dispatchNexAnalytics) {
        window.dispatchNexAnalytics(this, 'upload', 'upload-error', item.file.name);
      }
    };

    xhr.send(formData);
    this.dispatchEvent(new CustomEvent('upload-start', { detail: { file: item.file } }));
    if (window.dispatchNexAnalytics) {
      window.dispatchNexAnalytics(this, 'upload', 'upload-start', item.file.name);
    }
  }

  mockUpload(item) {
    item.status = 'uploading';
    this.updateItemUI(item);
    this.dispatchEvent(new CustomEvent('upload-start', { detail: { file: item.file } }));
    if (window.dispatchNexAnalytics) {
      window.dispatchNexAnalytics(this, 'upload', 'upload-start', item.file.name);
    }

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      item.progress = progress;
      this.updateItemUI(item);
      this.dispatchEvent(new CustomEvent('upload-progress', { detail: { file: item.file, progress } }));

      if (progress >= 100) {
        clearInterval(interval);
        item.status = 'success';
        this.updateItemUI(item);
        this.dispatchEvent(new CustomEvent('upload-success', { detail: { file: item.file, response: 'MOCK_UPLOAD_SUCCESS' } }));
        if (window.dispatchNexAnalytics) {
          window.dispatchNexAnalytics(this, 'upload', 'upload-success', item.file.name);
        }
      }
    }, 200);
    item.interval = interval;
  }

  removeQueueItem(itemId) {
    this.fileQueue = this.fileQueue.filter(item => item.id !== itemId);
    this.updateQueueUI();
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  updateQueueUI() {
    const listContainer = this.shadowRoot.querySelector('.nex-upload-list');
    const actionArea = this.shadowRoot.querySelector('.nex-upload-action-area');
    
    if (!listContainer) return;

    if (this.fileQueue.length === 0) {
      listContainer.innerHTML = '';
      if (actionArea) actionArea.classList.add('hidden');
      return;
    }

    if (actionArea && !this.hasAttribute('auto-upload')) {
      actionArea.classList.remove('hidden');
    }

    listContainer.innerHTML = this.fileQueue.map(item => `
      <div class="nex-upload-item" id="${item.id}">
        <div class="nex-upload-item-meta">
          <div class="nex-upload-item-name" title="${item.file.name}">${item.file.name}</div>
          <div class="nex-upload-item-size">${this.formatBytes(item.file.size)}</div>
        </div>
        
        <div class="nex-upload-progress-row">
          <div class="nex-upload-bar-track">
            <div class="nex-upload-bar-fill ${item.status}" style="width: ${item.progress}%"></div>
          </div>
          <div class="nex-upload-status-badge ${item.status}">
            ${item.status === 'error' ? (item.errorMessage || 'ERROR') : item.status.toUpperCase()}
          </div>
        </div>

        <button class="nex-upload-remove-btn" data-id="${item.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    `).join('');

    // Attach individual remove events
    listContainer.querySelectorAll('.nex-upload-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.removeQueueItem(btn.dataset.id);
      });
    });
  }

  updateItemUI(item) {
    const itemEl = this.shadowRoot.getElementById(item.id);
    if (!itemEl) return;

    const fillEl = itemEl.querySelector('.nex-upload-bar-fill');
    const badgeEl = itemEl.querySelector('.nex-upload-status-badge');

    if (fillEl) {
      fillEl.style.width = `${item.progress}%`;
      fillEl.className = `nex-upload-bar-fill ${item.status}`;
    }

    if (badgeEl) {
      badgeEl.className = `nex-upload-status-badge ${item.status}`;
      badgeEl.textContent = item.status === 'error' ? (item.errorMessage || 'ERROR') : item.status.toUpperCase();
    }
  }

  render() {
    const accept = this.getAttribute('accept') || '*/*';
    const multiple = this.hasAttribute('multiple') ? 'multiple' : '';
    const logoSrc = this.getAttribute('logo') || '../logo/logo.webp';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --nex-primary: var(--nex-primary, #00f2ff);
          --nex-accent: var(--nex-accent, #ff007f);
          --nex-bg: var(--nex-bg, #070707);
          --nex-glow: var(--nex-glow, rgba(0, 242, 255, 0.3));
          display: block;
          max-width: 480px;
          font-family: 'Orbitron', 'JetBrains Mono', monospace, sans-serif;
          box-sizing: border-box;
        }

        .nex-upload-container {
          background-color: var(--nex-bg, #070707);
          border: 1px solid rgba(0, 242, 255, 0.15);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-sizing: border-box;
          clip-path: polygon(0% 0%, 95% 0%, 100% 5%, 100% 100%, 0% 100%);
        }

        .nex-upload-dropzone {
          border: 1px dashed var(--nex-glow, rgba(0, 242, 255, 0.3));
          background: var(--nex-glow, rgba(0, 242, 255, 0.3));
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          box-sizing: border-box;
        }

        .nex-upload-dropzone:hover,
        .nex-upload-dropzone.dragover {
          border-color: var(--nex-accent, #ff007f);
          background: rgba(255, 0, 127, 0.04);
          box-shadow: inset 0 0 10px rgba(255, 0, 127, 0.1);
        }

        .nex-upload-icon {
          width: 36px;
          height: 36px;
          color: var(--nex-primary, #00f2ff);
          margin-bottom: 12px;
          transition: transform 0.2s ease, color 0.2s ease;
        }

        .nex-upload-dropzone:hover .nex-upload-icon,
        .nex-upload-dropzone.dragover .nex-upload-icon {
          transform: translateY(-4px);
          color: var(--nex-accent, #ff007f);
        }

        .nex-upload-prompt {
          font-size: 10px;
          font-weight: 900;
          color: #fff;
          letter-spacing: 0.1em;
          margin-bottom: 4px;
          text-transform: uppercase;
        }

        .nex-upload-subprompt {
          font-size: 7.5px;
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .nex-upload-select-btn {
          margin-top: 12px;
          background: transparent;
          border: 1px solid var(--nex-primary, #00f2ff);
          color: var(--nex-primary, #00f2ff);
          font-family: inherit;
          font-size: 8px;
          font-weight: bold;
          padding: 6px 12px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: all 0.2s ease;
        }

        .nex-upload-select-btn:hover {
          background: var(--nex-primary, #00f2ff);
          color: #050505;
          box-shadow: 0 0 10px var(--nex-glow, rgba(0, 242, 255, 0.3));
        }

        .nex-upload-input {
          display: none;
        }

        /* Upload Queue List */
        .nex-upload-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 220px;
          overflow-y: auto;
          scrollbar-width: none;
        }

        .nex-upload-list::-webkit-scrollbar {
          display: none;
        }

        .nex-upload-item {
          background: var(--nex-bg, #070707);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          position: relative;
        }

        .nex-upload-item-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-right: 20px; /* space for remove button */
        }

        .nex-upload-item-name {
          font-size: 9px;
          color: #fff;
          font-weight: 700;
          letter-spacing: 0.05em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 75%;
          text-transform: uppercase;
        }

        .nex-upload-item-size {
          font-size: 8px;
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 0.05em;
        }

        .nex-upload-progress-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .nex-upload-bar-track {
          flex: 1;
          height: 3px;
          background: rgba(255, 255, 255, 0.1);
          overflow: hidden;
          position: relative;
        }

        .nex-upload-bar-fill {
          height: 100%;
          background: var(--nex-primary, #00f2ff);
          width: 0%;
          transition: width 0.1s ease;
        }

        .nex-upload-bar-fill.success {
          background: #39ff14;
          box-shadow: 0 0 6px #39ff14;
        }

        .nex-upload-bar-fill.error {
          background: var(--nex-accent, #ff007f);
          box-shadow: 0 0 6px var(--nex-accent, #ff007f);
        }

        .nex-upload-bar-fill.uploading {
          background: var(--nex-primary, #00f2ff);
          box-shadow: 0 0 6px var(--nex-primary, #00f2ff);
        }

        .nex-upload-status-badge {
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          min-width: 50px;
          text-align: right;
        }

        .nex-upload-status-badge.pending { color: rgba(255, 255, 255, 0.4); }
        .nex-upload-status-badge.uploading { color: var(--nex-primary, #00f2ff); }
        .nex-upload-status-badge.success { color: #39ff14; }
        .nex-upload-status-badge.error { color: var(--nex-accent, #ff007f); }

        .nex-upload-remove-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nex-upload-remove-btn:hover {
          color: var(--nex-accent, #ff007f);
        }

        .nex-upload-remove-btn svg {
          width: 12px;
          height: 12px;
        }

        /* Action Trigger Area */
        .nex-upload-action-area {
          display: flex;
          justify-content: flex-end;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 12px;
        }

        .nex-upload-action-btn {
          background: var(--nex-glow, rgba(0, 242, 255, 0.3));
          border: 1px solid var(--nex-primary, #00f2ff);
          color: var(--nex-primary, #00f2ff);
          font-family: inherit;
          font-size: 9px;
          font-weight: 900;
          padding: 8px 16px;
          cursor: pointer;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: all 0.2s ease;
        }

        .nex-upload-action-btn:hover {
          background: var(--nex-primary, #00f2ff);
          color: #050505;
          box-shadow: 0 0 12px var(--nex-glow, rgba(0, 242, 255, 0.3));
        }

        .hidden {
          display: none !important;
        }
      </style>

      <div class="nex-upload-container" style="position: relative;">
        <!-- Watermark badge -->
        <div class="nex-badge-inline" style="position: absolute; top: 6px; right: 10px; display: flex; align-items: center; gap: 4px; font-size: 5.5px; color: rgba(255, 255, 255, 0.45); font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; font-family: inherit; z-index: 10; pointer-events: none;">
          <img src="${logoSrc}" style="height: 5.5px; width: auto;" onerror="this.style.display='none'">
          <span>NEX_UPLOAD</span>
        </div>

        <!-- Input fields -->
        <input type="file" class="nex-upload-input" accept="${accept}" ${multiple}>

        <!-- Drop area -->
        <div class="nex-upload-dropzone">
          <svg class="nex-upload-icon" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            <polyline points="16 16 12 12 8 16" />
          </svg>
          <div class="nex-upload-prompt">DRAG_DROP // FILES_TO_UPLINK</div>
          <div class="nex-upload-subprompt">Accepts: ${accept.toUpperCase()}</div>
          <button class="nex-upload-select-btn" type="button">SELECT PAYLOAD</button>
        </div>

        <!-- Queue list -->
        <div class="nex-upload-list"></div>

        <!-- Bottom Action button (shown only if manual upload is required) -->
        <div class="nex-upload-action-area hidden">
          <button class="nex-upload-action-btn" type="button">UPLINK QUEUED PAYLOADS</button>
        </div>
      </div>
    `;
  }
}

customElements.define('nex-upload', NexUpload);
