/*! nex-idle v1.0.0 | (c) 2026 NEX SDK | MIT License */
/**
 * NEX-IDLE | Idle Session Timeout Guard
 * Fires `nex-idle` after N seconds of user inactivity across
 * mouse, keyboard, scroll, touch, and wheel events.
 *
 * Usage:
 *   <nex-idle timeout="300" warn-at="30"></nex-idle>
 *
 *   document.addEventListener('nex-idle-warning', e => {
 *     showDialog(`Session expires in ${e.detail.remaining}s`);
 *   });
 *   document.addEventListener('nex-idle', () => {
 *     jwtEl.clearToken();       // works with <nex-jwt>
 *     location.href = '/login';
 *   });
 *
 * Attributes:
 *   timeout  - inactivity seconds before nex-idle fires (default: 300)
 *   warn-at  - seconds before timeout to fire nex-idle-warning (default: 30)
 *
 * Events (bubbles + composed):
 *   nex-idle-warning  - approaching idle, detail.remaining = seconds left
 *   nex-idle          - idle threshold reached
 *   nex-active        - user returned from idle
 */
class NexIdle extends HTMLElement {
  static get observedAttributes() { return ['timeout', 'warn-at']; }

  constructor() {
    super();
    this._idleTimer  = null;
    this._warnTimer  = null;
    this._isIdle     = false;
    this._lastActivity = Date.now();
    this._EVENTS     = ['mousemove','keydown','click','scroll','touchstart','wheel','pointerdown'];
    this._handleActivity = this._onActivity.bind(this);
  }

  connectedCallback() {
    this.style.display = 'none';
    this._startWatching();
  }

  disconnectedCallback() { this._stopWatching(); }

  attributeChangedCallback() {
    if (this.isConnected) { this._stopWatching(); this._startWatching(); }
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /** Seconds the user has been idle. */
  getIdleSeconds() { return Math.floor((Date.now() - this._lastActivity) / 1000); }

  /** Force-reset the idle timer (marks user as active). */
  resetTimer() { this._onActivity(); }

  /** True if user is currently considered idle. */
  isIdle() { return this._isIdle; }

  // ── Internal ─────────────────────────────────────────────────────────────

  _startWatching() {
    this._EVENTS.forEach(evt =>
      document.addEventListener(evt, this._handleActivity, { passive: true })
    );
    this._scheduleTimers();
  }

  _stopWatching() {
    this._EVENTS.forEach(evt =>
      document.removeEventListener(evt, this._handleActivity)
    );
    clearTimeout(this._idleTimer);
    clearTimeout(this._warnTimer);
  }

  _onActivity() {
    this._lastActivity = Date.now();
    if (this._isIdle) {
      this._isIdle = false;
      this._emit('nex-active', { idleSeconds: this.getIdleSeconds() });
    }
    this._scheduleTimers();
  }

  _scheduleTimers() {
    clearTimeout(this._idleTimer);
    clearTimeout(this._warnTimer);

    const timeout = (parseInt(this.getAttribute('timeout')) || 300) * 1000;
    const warnAt  = (parseInt(this.getAttribute('warn-at'))  || 30)  * 1000;

    if (warnAt < timeout) {
      this._warnTimer = setTimeout(() => {
        this._emit('nex-idle-warning', {
          remaining:   Math.floor(warnAt / 1000),
          idleSeconds: this.getIdleSeconds()
        });
      }, timeout - warnAt);
    }

    this._idleTimer = setTimeout(() => {
      this._isIdle = true;
      this._emit('nex-idle', { idleSeconds: this.getIdleSeconds() });
    }, timeout);
  }

  _emit(name, detail = {}) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
}

customElements.define('nex-idle', NexIdle);
