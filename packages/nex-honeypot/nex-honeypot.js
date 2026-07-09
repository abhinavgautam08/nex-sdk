/*! nex-honeypot v1.0.0 | (c) 2026 NEX SDK | MIT License */
/**
 * NEX-HONEYPOT | Bot & Spam Detection Trap
 * Injects invisible fields bots fill but humans ignore.
 * Also detects: too-fast submissions, no mouse movement, headless UAs.
 *
 * Usage:
 *   <nex-honeypot id="hp" min-time="1500"></nex-honeypot>
 *   hp.inject(document.querySelector('form'));
 *   form.addEventListener('submit', e => { if (!hp.isHuman(form)) e.preventDefault(); });
 *
 * Events: nex-bot-detected (bubbles, composed)
 */
class NexHoneypot extends HTMLElement {
  static get observedAttributes() { return ['min-time']; }

  constructor() {
    super();
    this._loadTime = Date.now();
    this._mouseMoved = false;
    this._injectedForms = new WeakSet();
    this._handleMouseMove = () => { this._mouseMoved = true; };
  }

  connectedCallback() {
    this.style.display = 'none';
    document.addEventListener('mousemove', this._handleMouseMove, { once: true });
  }

  disconnectedCallback() {
    document.removeEventListener('mousemove', this._handleMouseMove);
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Injects invisible honeypot fields into a given form.
   * @param {HTMLFormElement} form
   */
  inject(form) {
    if (!form || this._injectedForms.has(form)) return;
    this._injectedForms.add(form);

    const trap = document.createElement('div');
    trap.setAttribute('aria-hidden', 'true');
    trap.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;';
    trap.innerHTML = `
      <label>Leave this blank</label>
      <input type="email" name="__nex_hp_email__" tabindex="-1" autocomplete="off" value="">
      <input type="text"  name="__nex_hp_name__"  tabindex="-1" autocomplete="off" value="">
    `;
    form.appendChild(trap);
  }

  /**
   * Returns true if the submission appears to be from a human.
   * @param {HTMLFormElement} form
   * @returns {boolean}
   */
  isHuman(form) {
    const minTime = parseInt(this.getAttribute('min-time')) || 1500;
    const elapsed = Date.now() - this._loadTime;
    const reasons = [];

    // Check 1: Honeypot fields should be empty
    if (form) {
      const hp1 = form.querySelector('[name="__nex_hp_email__"]');
      const hp2 = form.querySelector('[name="__nex_hp_name__"]');
      if ((hp1 && hp1.value !== '') || (hp2 && hp2.value !== '')) {
        reasons.push('HONEYPOT_FILLED');
      }
    }

    // Check 2: Submitted too fast (bots don't wait)
    if (elapsed < minTime) reasons.push(`SUBMISSION_TOO_FAST (${elapsed}ms)`);

    // Check 3: No mouse movement (headless browser)
    if (!this._mouseMoved) reasons.push('NO_MOUSE_MOVEMENT');

    // Check 4: Known bot/headless user agents
    const ua = navigator.userAgent.toLowerCase();
    if (['headless', 'phantomjs', 'selenium', 'webdriver', 'puppeteer', 'playwright']
        .some(p => ua.includes(p))) {
      reasons.push('BOT_USER_AGENT');
    }

    if (reasons.length > 0) {
      this._emit('nex-bot-detected', { reasons, elapsed, userAgent: navigator.userAgent });
      return false;
    }
    return true;
  }

  /** Resets the timer (call when the user navigates to a new form view). */
  reset() {
    this._loadTime = Date.now();
    this._mouseMoved = false;
    document.addEventListener('mousemove', this._handleMouseMove, { once: true });
  }

  _emit(name, detail = {}) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
}

customElements.define('nex-honeypot', NexHoneypot);
