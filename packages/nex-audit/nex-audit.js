/*! nex-audit v1.0.0 | (c) 2026 NEX SDK | MIT License */
/**
 * NEX-AUDIT | Client-Side Security Event Audit Logger
 * Auto-subscribes to all NEX SDK security events and builds a structured
 * in-memory audit log. Optionally flushes logs to a security endpoint.
 *
 * Usage:
 *   <nex-audit id="audit" endpoint="https://api.example.com/security-log" auto-flush="30"></nex-audit>
 *
 *   const audit = document.getElementById('audit');
 *   audit.getLog();         // returns array of all events
 *   audit.exportJSON();     // POSTs log to endpoint and returns JSON string
 *   audit.clear();          // clears in-memory log
 *   audit.addEntry(type, detail); // manually log a custom security event
 *
 * Attributes:
 *   endpoint   - URL to POST log batches to
 *   auto-flush - interval in seconds to auto-POST log (optional)
 *   max-log    - max entries to keep in memory (default: 500)
 *
 * Auto-captured NEX SDK events:
 *   nex-proto-violation, nex-frame-attack, nex-integrity-violation,
 *   nex-http-detected, nex-mixed-content, nex-bot-detected, nex-idle,
 *   nex-session-expired, nex-paste-sanitized, nex-paste-blocked,
 *   nex-copy-blocked, nex-mask-revealed, auth-locked, auth-rate-limited,
 *   file-spoofed, pow-solved, nex-redirect-blocked, nex-permission-request
 */
class NexAudit extends HTMLElement {
  static get observedAttributes() { return ['endpoint', 'auto-flush', 'max-log']; }

  constructor() {
    super();
    this._log      = [];
    this._handlers = [];
    this._timer    = null;
  }

  connectedCallback() {
    this.style.display = 'none';
    this._bindEvents();
    const interval = parseInt(this.getAttribute('auto-flush'));
    if (interval > 0) {
      this._timer = setInterval(() => this.exportJSON(), interval * 1000);
    }
    // Log session start
    this._addEntry('SESSION_START', {
      url: location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  }

  disconnectedCallback() {
    this._handlers.forEach(({ event, fn }) =>
      document.removeEventListener(event, fn)
    );
    if (this._timer) clearInterval(this._timer);
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /** Returns a copy of the full audit log array. */
  getLog() { return [...this._log]; }

  /** Clears the in-memory log. */
  clear() { this._log = []; }

  /** Manually adds a custom security entry. */
  addEntry(type, detail = {}) { this._addEntry(type, detail); }

  /**
   * Exports log as JSON string and optionally POSTs to endpoint.
   * @returns {string} JSON string of log entries
   */
  async exportJSON() {
    const payload = JSON.stringify({
      session: this._sessionId,
      url: location.href,
      exported: new Date().toISOString(),
      count: this._log.length,
      events: this._log
    });

    const endpoint = this.getAttribute('endpoint');
    if (endpoint && this._log.length > 0) {
      try {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        });
        this.dispatchEvent(new CustomEvent('nex-audit-flushed', {
          detail: { count: this._log.length },
          bubbles: true, composed: true
        }));
      } catch (_) {}
    }
    return payload;
  }

  /** Returns count of logged events by type. */
  getSummary() {
    return this._log.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {});
  }

  // ── Internals ─────────────────────────────────────────────────────────────

  _addEntry(type, detail = {}) {
    const maxLog = parseInt(this.getAttribute('max-log')) || 500;
    const entry  = {
      id:        this._log.length + 1,
      type,
      timestamp: new Date().toISOString(),
      page:      location.pathname,
      detail
    };
    this._log.push(entry);
    if (this._log.length > maxLog) this._log.shift(); // trim oldest
    console.debug(`[NEX-AUDIT] ${type}`, detail);
  }

  _bindEvents() {
    this._sessionId = crypto.randomUUID?.() || Date.now().toString(36);

    const events = [
      // Security violations
      'nex-proto-violation',
      'nex-frame-attack',
      'nex-integrity-violation',
      'nex-http-detected',
      'nex-mixed-content',
      // Bot / user behaviour
      'nex-bot-detected',
      'nex-idle',
      'nex-idle-warning',
      'nex-active',
      // Session
      'nex-session-expired',
      'nex-token-set',
      // Clipboard
      'nex-paste-sanitized',
      'nex-paste-blocked',
      'nex-copy-blocked',
      // Data masking
      'nex-mask-revealed',
      'nex-mask-hidden',
      // Auth
      'auth-locked',
      'auth-rate-limited',
      'auth-weak-password',
      'auth-submit',
      'auth-success',
      // Upload
      'file-spoofed',
      // Proof of Work
      'pow-solved',
      // URL guard
      'nex-redirect-blocked',
      // Permission guard
      'nex-permission-request',
      // TOTP
      'nex-totp-verified',
    ];

    events.forEach(event => {
      const fn = (e) => this._addEntry(event.toUpperCase().replace(/-/g, '_'), e.detail || {});
      document.addEventListener(event, fn, { passive: true });
      this._handlers.push({ event, fn });
    });

    // Capture uncaught errors as security signal
    const onError = (e) => this._addEntry('UNCAUGHT_ERROR', {
      message: e.message, filename: e.filename, line: e.lineno
    });
    window.addEventListener('error', onError, { passive: true });
    this._handlers.push({ event: 'error', fn: onError });
  }
}

customElements.define('nex-audit', NexAudit);
