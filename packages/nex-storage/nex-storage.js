/*! nex-storage v1.5.0 | (c) 2026 NEX SDK | MIT License */
/**
 * NEX-STORAGE | AES-256-GCM Encrypted Browser Storage Vault
 * Uses the native Web Crypto API (PBKDF2 + AES-GCM) for true encryption.
 * Falls back to plain JSON when the `encryption` attribute is absent.
 *
 * Usage:
 *   <nex-storage id="vault" type="local" encryption></nex-storage>
 *
 *   const vault = document.getElementById('vault');
 *   await vault.set('token', 'abc123', 3600);   // stored encrypted, expires in 1h
 *   const token = await vault.get('token');      // returns 'abc123'
 *
 * Events: storage-set | storage-get | storage-expire | storage-remove | storage-clear
 */
class NexStorage extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'encryption'];
  }

  constructor() {
    super();
    this.storage = window.localStorage;
    this._cryptoKey = null; // cached derived AES-GCM key
  }

  connectedCallback() {
    this.updateStorageType();
    this.style.display = 'none'; // non-visual utility component
  }

  disconnectedCallback() {}

  attributeChangedCallback(name) {
    if (name === 'type') {
      this.updateStorageType();
    }
    if (name === 'encryption') {
      this._cryptoKey = null; // reset cached key on attribute change
    }
  }

  updateStorageType() {
    const type = this.getAttribute('type') || 'local';
    this.storage = type === 'session' ? window.sessionStorage : window.localStorage;
  }

  // ── AES-256-GCM Web Crypto Helpers ──────────────────────────────────────

  /**
   * Derives or returns the cached AES-256-GCM key.
   * Key = PBKDF2(passphrase + hostname, salt, 100000 iterations, SHA-256)
   * Salt is auto-generated once per session and stored in sessionStorage.
   */
  async _getKey() {
    if (this._cryptoKey) return this._cryptoKey;

    // Generate or retrieve the per-session salt
    const SALT_KEY = '__nex_vault_salt__';
    let saltB64 = sessionStorage.getItem(SALT_KEY);
    let salt;
    if (saltB64) {
      salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
    } else {
      salt = crypto.getRandomValues(new Uint8Array(16));
      sessionStorage.setItem(SALT_KEY, btoa(String.fromCharCode(...salt)));
    }

    // Domain-bound passphrase (different key per origin)
    const passphrase = 'nex-vault-aes256-gcm:' + (location.hostname || 'localhost');
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(passphrase),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    this._cryptoKey = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    return this._cryptoKey;
  }

  /**
   * Encrypts plaintext → base64( IV[12B] + Ciphertext )
   */
  async _encrypt(text) {
    const key = await this._getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit random IV (GCM standard)
    const encoded = new TextEncoder().encode(text);
    const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
    // Pack: [12 bytes IV][ciphertext]
    const combined = new Uint8Array(12 + cipherBuf.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(cipherBuf), 12);
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypts base64( IV[12B] + Ciphertext ) → plaintext
   */
  async _decrypt(b64) {
    const key = await this._getKey();
    const combined = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const cipherBuf = combined.slice(12);
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBuf);
    return new TextDecoder().decode(plainBuf);
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Stores a value. Returns a Promise when encryption is active.
   * @param {string} key
   * @param {*} val - any JSON-serializable value
   * @param {number|null} ttlSeconds - optional TTL in seconds
   */
  async set(key, val, ttlSeconds = null) {
    const expires = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    let payload = JSON.stringify({ value: val, expires });

    if (this.hasAttribute('encryption')) {
      payload = await this._encrypt(payload);
    }

    this.storage.setItem(key, payload);
    this.dispatchEvent(new CustomEvent('storage-set', { detail: { key, value: val, expires } }));
  }

  /**
   * Retrieves a value. Returns a Promise when encryption is active.
   * Returns null if the key is missing or the TTL has expired.
   * @param {string} key
   */
  async get(key) {
    const raw = this.storage.getItem(key);
    if (raw === null) return null;

    let parsedStr = raw;

    if (this.hasAttribute('encryption')) {
      try {
        parsedStr = await this._decrypt(raw);
      } catch {
        // Decryption failed (key rotated or data corrupted) — purge stale entry
        this.remove(key);
        return null;
      }
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
    } catch {
      return parsedStr;
    }
  }

  /**
   * Removes a single key from storage.
   * @param {string} key
   */
  remove(key) {
    this.storage.removeItem(key);
    this.dispatchEvent(new CustomEvent('storage-remove', { detail: { key } }));
  }

  /**
   * Clears all keys from the active storage.
   */
  clear() {
    this.storage.clear();
    this.dispatchEvent(new CustomEvent('storage-clear'));
  }
}

customElements.define('nex-storage', NexStorage);
