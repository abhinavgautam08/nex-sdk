/*! nex-vault v1.0.0 | (c) 2026 NEX SDK | MIT License */
/**
 * NEX-VAULT | In-Memory Secret Vault
 * Stores sensitive values ONLY in RAM — never touches localStorage/sessionStorage/cookies.
 * Auto-wipes all secrets on tab hidden, page unload, or configurable timeout.
 * Zero forensic footprint after page close.
 *
 * Usage:
 *   <nex-vault id="vault" wipe-on-hide wipe-on-unload></nex-vault>
 *
 *   const vault = document.getElementById('vault');
 *   vault.set('api_token', 'sk-abc123', 3600);  // stores in RAM, ttl=3600s
 *   vault.get('api_token');                      // returns value or null if expired
 *   vault.has('api_token');                      // true/false
 *   vault.remove('api_token');                   // deletes specific key
 *   vault.wipe();                                // destroys ALL secrets immediately
 *   vault.keys();                                // returns array of stored keys
 *   vault.ttl('api_token');                      // remaining seconds for key
 *
 * Attributes:
 *   wipe-on-hide    - wipes vault when tab is hidden (visibilitychange)
 *   wipe-on-unload  - wipes vault before page unload
 *   max-keys        - maximum number of keys (default: 100)
 *
 * Events (bubbles + composed):
 *   nex-vault-set       - fired when a key is stored: { key }
 *   nex-vault-get       - fired on get: { key, found }
 *   nex-vault-expire    - fired when a key expires: { key }
 *   nex-vault-wipe      - fired when entire vault is wiped: { reason }
 *   nex-vault-overflow  - fired when max-keys is reached: { key }
 */
class NexVault extends HTMLElement {
  constructor() {
    super();
    this._store   = new Map();   // key → { value, expires, timer }
    this._onHide  = null;
    this._onUnload = null;
  }

  connectedCallback() {
    this.style.display = 'none';
    if (this.hasAttribute('wipe-on-hide')) {
      this._onHide = () => {
        if (document.visibilityState === 'hidden') this.wipe('TAB_HIDDEN');
      };
      document.addEventListener('visibilitychange', this._onHide);
    }

    if (this.hasAttribute('wipe-on-unload')) {
      this._onUnload = () => this.wipe('PAGE_UNLOAD');
      window.addEventListener('pagehide', this._onUnload);
      window.addEventListener('beforeunload', this._onUnload);
    }
  }

  disconnectedCallback() {
    if (this._onHide)   document.removeEventListener('visibilitychange', this._onHide);
    if (this._onUnload) {
      window.removeEventListener('pagehide', this._onUnload);
      window.removeEventListener('beforeunload', this._onUnload);
    }
    this.wipe('DISCONNECTED');
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Stores a secret in memory.
   * @param {string} key
   * @param {*}      value - any serializable value
   * @param {number} ttlSeconds - optional expiry in seconds
   */
  set(key, value, ttlSeconds = 0) {
    const maxKeys = parseInt(this.getAttribute('max-keys')) || 100;

    // Overflow guard
    if (!this._store.has(key) && this._store.size >= maxKeys) {
      this._emit('nex-vault-overflow', { key });
      return false;
    }

    // Clear existing timer if overwriting
    const existing = this._store.get(key);
    if (existing?.timer) clearTimeout(existing.timer);

    const expires = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    let timer = null;

    if (ttlSeconds > 0) {
      timer = setTimeout(() => {
        this._store.delete(key);
        this._emit('nex-vault-expire', { key });
      }, ttlSeconds * 1000);
    }

    this._store.set(key, { value, expires, timer });
    this._emit('nex-vault-set', { key });
    return true;
  }

  /**
   * Retrieves a secret from memory.
   * @param {string} key
   * @returns {*} value or null if not found / expired
   */
  get(key) {
    const entry = this._store.get(key);
    if (!entry) {
      this._emit('nex-vault-get', { key, found: false });
      return null;
    }
    // Manual expiry check
    if (entry.expires && Date.now() > entry.expires) {
      clearTimeout(entry.timer);
      this._store.delete(key);
      this._emit('nex-vault-expire', { key });
      this._emit('nex-vault-get', { key, found: false });
      return null;
    }
    this._emit('nex-vault-get', { key, found: true });
    return entry.value;
  }

  /** Returns true if key exists and is not expired. */
  has(key) { return this.get(key) !== null; }

  /** Removes a specific key from the vault. */
  remove(key) {
    const entry = this._store.get(key);
    if (entry?.timer) clearTimeout(entry.timer);
    this._store.delete(key);
  }

  /** Destroys all secrets in memory immediately. */
  wipe(reason = 'MANUAL') {
    for (const [, entry] of this._store) {
      if (entry.timer) clearTimeout(entry.timer);
    }
    this._store.clear();
    this._emit('nex-vault-wipe', { reason });
  }

  /** Returns array of stored key names. */
  keys() { return [...this._store.keys()]; }

  /** Returns remaining TTL in seconds for a key, or null. */
  ttl(key) {
    const entry = this._store.get(key);
    if (!entry || !entry.expires) return null;
    return Math.max(0, Math.round((entry.expires - Date.now()) / 1000));
  }

  /** Returns current count of stored entries. */
  size() { return this._store.size; }

  _emit(name, detail = {}) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
}

customElements.define('nex-vault', NexVault);
