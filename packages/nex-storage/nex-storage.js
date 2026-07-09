/*! nex-storage v1.3.0 | (c) 2026 NEX SDK | MIT License */
class NexStorage extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'encryption'];
  }

  constructor() {
    super();
    this.storage = window.localStorage;
  }

  connectedCallback() {
    this.updateStorageType();
    this.style.display = 'none'; // non-visual utility component
  }

  disconnectedCallback() {}

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'type') {
      this.updateStorageType();
    }
  }

  updateStorageType() {
    const type = this.getAttribute('type') || 'local';
    this.storage = type === 'session' ? window.sessionStorage : window.localStorage;
  }

  // Base64 simple encryption wrapper for safety
  encrypt(text) {
    try {
      return btoa(encodeURIComponent(text));
    } catch (e) {
      return text;
    }
  }

  decrypt(text) {
    try {
      return decodeURIComponent(atob(text));
    } catch (e) {
      return text;
    }
  }

  set(key, val, ttlSeconds = null) {
    const expires = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null;
    let payload = JSON.stringify({ value: val, expires });

    const encryptActive = this.hasAttribute('encryption');
    if (encryptActive) {
      payload = this.encrypt(payload);
    }

    this.storage.setItem(key, payload);
    this.dispatchEvent(new CustomEvent('storage-set', { detail: { key, value: val, expires } }));
  }

  get(key) {
    const raw = this.storage.getItem(key);
    if (!raw) return null;

    let parsedStr = raw;
    const encryptActive = this.hasAttribute('encryption');
    if (encryptActive) {
      parsedStr = this.decrypt(raw);
    }

    try {
      const data = JSON.parse(parsedStr);
      if (data.expires && Date.now() > data.expires) {
        this.remove(key);
        this.dispatchEvent(new CustomEvent('storage-expire', { detail: { key } }));
        return null;
      }
      this.dispatchEvent(new CustomEvent('storage-get', { detail: { key, value: data.value } }));
      return data.value;
    } catch (e) {
      return parsedStr;
    }
  }

  remove(key) {
    this.storage.removeItem(key);
    this.dispatchEvent(new CustomEvent('storage-remove', { detail: { key } }));
  }

  clear() {
    this.storage.clear();
    this.dispatchEvent(new CustomEvent('storage-clear'));
  }
}

customElements.define('nex-storage', NexStorage);
