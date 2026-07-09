/*! nex-jwt v1.0.0 | (c) 2026 NEX SDK | MIT License */
/**
 * NEX-JWT | JSON Web Token Expiry & Tamper Guard
 * A non-visual utility Web Component that securely stores JWT access tokens,
 * parses their payload, monitors expiration, and fires a `nex-session-expired`
 * event to alert other components when the session is stale.
 *
 * Usage:
 *   <nex-jwt id="jwt" storage="session" check-interval="30"></nex-jwt>
 *
 *   const jwt = document.getElementById('jwt');
 *   jwt.setToken(accessToken);
 *
 *   jwt.addEventListener('nex-session-expired', () => {
 *     // Redirect to login, clear UI state, etc.
 *   });
 *
 * Attributes:
 *   storage         - "session" (default) or "local"
 *   check-interval  - how often to check expiry in seconds (default: 30)
 *
 * Public API:
 *   setToken(jwt)   - store a JWT string
 *   getToken()      - retrieve the raw JWT string (or null)
 *   getPayload()    - decode & return the JWT payload object (or null)
 *   isExpired()     - returns true if the token's `exp` claim has passed
 *   clearToken()    - wipe token & fire nex-session-expired
 *   getRemainingSeconds() - seconds until expiry (or 0 if expired/missing)
 *
 * Events (bubble + composed so they cross Shadow DOM boundaries):
 *   nex-session-expired - fired when token expires or clearToken() is called
 *   nex-token-set       - fired when a new token is stored
 *   nex-token-invalid   - fired when a malformed token is detected
 */
class NexJWT extends HTMLElement {
  static get observedAttributes() {
    return ['storage', 'check-interval'];
  }

  constructor() {
    super();
    this._checkTimer = null;
    this._STORAGE_KEY = '__nex_jwt__';
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  connectedCallback() {
    this.style.display = 'none'; // non-visual utility component
    this._startAutoCheck();
  }

  disconnectedCallback() {
    this._stopAutoCheck();
  }

  attributeChangedCallback(name) {
    if (name === 'check-interval' && this.isConnected) {
      this._stopAutoCheck();
      this._startAutoCheck();
    }
  }

  // ── Storage Backend ──────────────────────────────────────────────────────

  get _store() {
    const type = this.getAttribute('storage') || 'session';
    return type === 'local' ? window.localStorage : window.sessionStorage;
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Store a JWT. Validates basic structure before storing.
   * @param {string} token - a valid JWT string (header.payload.signature)
   */
  setToken(token) {
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      this._emit('nex-token-invalid', { reason: 'MALFORMED_TOKEN' });
      console.warn('[NexJWT] Invalid token format. Expected: header.payload.signature');
      return;
    }

    this._store.setItem(this._STORAGE_KEY, token);
    this._emit('nex-token-set', { payload: this.getPayload() });

    // Immediately schedule expiry if the token is already near/past expiry
    if (this.isExpired()) {
      this._handleExpiry();
    }
  }

  /**
   * Returns the raw JWT string, or null if none is stored.
   * @returns {string|null}
   */
  getToken() {
    return this._store.getItem(this._STORAGE_KEY) || null;
  }

  /**
   * Decodes and returns the JWT payload object.
   * NOTE: This does NOT verify the signature — signature verification is server-side.
   * @returns {object|null}
   */
  getPayload() {
    const token = this.getToken();
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      // Base64url → Base64 → JSON
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  }

  /**
   * Returns true if the stored token is missing, malformed, or past its `exp` claim.
   * @returns {boolean}
   */
  isExpired() {
    const payload = this.getPayload();
    if (!payload) return true;
    if (!payload.exp) return false; // No exp claim = never expires (treat as valid)
    return Date.now() >= payload.exp * 1000; // JWT exp is in seconds
  }

  /**
   * Returns the number of seconds remaining until the token expires.
   * Returns 0 if already expired or no token.
   * @returns {number}
   */
  getRemainingSeconds() {
    const payload = this.getPayload();
    if (!payload || !payload.exp) return 0;
    const remaining = Math.floor((payload.exp * 1000 - Date.now()) / 1000);
    return Math.max(0, remaining);
  }

  /**
   * Wipes the stored token and fires the nex-session-expired event.
   */
  clearToken() {
    this._store.removeItem(this._STORAGE_KEY);
    this._handleExpiry();
  }

  // ── Internal ─────────────────────────────────────────────────────────────

  _startAutoCheck() {
    const intervalSeconds = parseInt(this.getAttribute('check-interval')) || 30;
    this._stopAutoCheck();
    this._checkTimer = setInterval(() => {
      const token = this.getToken();
      if (token && this.isExpired()) {
        this._handleExpiry();
      }
    }, intervalSeconds * 1000);
  }

  _stopAutoCheck() {
    if (this._checkTimer) {
      clearInterval(this._checkTimer);
      this._checkTimer = null;
    }
  }

  _handleExpiry() {
    this._store.removeItem(this._STORAGE_KEY);
    this._emit('nex-session-expired', {
      expiredAt: new Date().toISOString(),
      message: 'JWT token has expired. Session terminated.'
    });
  }

  /**
   * Dispatches a custom event that bubbles across Shadow DOM boundaries.
   * @param {string} name - event name
   * @param {object} detail - event detail payload
   */
  _emit(name, detail = {}) {
    this.dispatchEvent(new CustomEvent(name, {
      detail,
      bubbles: true,
      composed: true // crosses Shadow DOM boundaries
    }));
  }
}

customElements.define('nex-jwt', NexJWT);
