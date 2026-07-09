/*! nex-timing-guard v1.0.0 | (c) 2026 NEX SDK | MIT License */
/**
 * NEX-TIMING-GUARD | Timing Attack Shield
 * Provides constant-time string comparison and timing-safe utilities.
 * Prevents side-channel attacks where attackers deduce token/hash values
 * by measuring how long a comparison takes.
 *
 * Exposes window.NexTiming static utility + registers <nex-timing-guard> element.
 *
 * Usage:
 *   <nex-timing-guard></nex-timing-guard>
 *
 *   // Constant-time string comparison (always takes same time regardless of match)
 *   NexTiming.equal('user_token_123', 'stored_token_456'); // → false (safe)
 *   NexTiming.equal('abc', 'abc');                         // → true  (safe)
 *
 *   // Add deliberate random jitter to a response (defeats timing measurements)
 *   await NexTiming.jitter(100, 300);   // waits 100–300ms randomly
 *   await NexTiming.fixedDelay(200);    // always waits exactly 200ms
 *
 *   // Rate-limited function execution (min gap between calls)
 *   const safeFn = NexTiming.rateLimit(myFn, 1000);  // max once per second
 *
 *   // Debounce (cancel previous call, run after delay)
 *   const debouncedFn = NexTiming.debounce(myFn, 300);
 *
 *   // Time an operation and warn if it's too fast (bot detection)
 *   NexTiming.startTimer('form-fill');
 *   ...
 *   const elapsed = NexTiming.elapsed('form-fill');  // ms since startTimer
 *   const human   = NexTiming.isHumanSpeed('form-fill', 3000); // false if < 3s
 */
class NexTimingUtil {
  // ── Constant-Time Comparison ─────────────────────────────────────────────

  /**
   * Compares two strings in constant time (safe against timing attacks).
   * Always processes every character even after a mismatch.
   * @param {string} a
   * @param {string} b
   * @returns {boolean}
   */
  static equal(a, b) {
    const aStr = String(a);
    const bStr = String(b);
    // Pad to equal length so timing doesn't reveal length difference
    const maxLen = Math.max(aStr.length, bStr.length);
    const aPad   = aStr.padEnd(maxLen, '\0');
    const bPad   = bStr.padEnd(maxLen, '\0');

    let diff = aStr.length ^ bStr.length; // length mismatch flag
    for (let i = 0; i < maxLen; i++) {
      diff |= aPad.charCodeAt(i) ^ bPad.charCodeAt(i);
    }
    return diff === 0;
  }

  /**
   * Compares two Uint8Array buffers in constant time.
   * @param {Uint8Array} a
   * @param {Uint8Array} b
   * @returns {boolean}
   */
  static equalBytes(a, b) {
    if (!(a instanceof Uint8Array) || !(b instanceof Uint8Array)) return false;
    const maxLen = Math.max(a.length, b.length);
    let diff = a.length ^ b.length;
    for (let i = 0; i < maxLen; i++) {
      diff |= (a[i] || 0) ^ (b[i] || 0);
    }
    return diff === 0;
  }

  // ── Timing Utilities ─────────────────────────────────────────────────────

  /**
   * Waits a random amount of time within [minMs, maxMs].
   * Defeats timing-based side channel measurements on async operations.
   * @param {number} minMs
   * @param {number} maxMs
   * @returns {Promise<void>}
   */
  static jitter(minMs = 50, maxMs = 300) {
    const delay = minMs + Math.random() * (maxMs - minMs);
    return new Promise(r => setTimeout(r, delay));
  }

  /**
   * Waits exactly the specified number of milliseconds.
   * @param {number} ms
   * @returns {Promise<void>}
   */
  static fixedDelay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ── Rate Limiting ─────────────────────────────────────────────────────────

  /**
   * Returns a rate-limited version of a function.
   * @param {Function} fn
   * @param {number} minGapMs - minimum ms between calls
   * @returns {Function}
   */
  static rateLimit(fn, minGapMs) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall < minGapMs) return;
      lastCall = now;
      return fn.apply(this, args);
    };
  }

  /**
   * Returns a debounced version of a function.
   * @param {Function} fn
   * @param {number} delayMs
   * @returns {Function}
   */
  static debounce(fn, delayMs) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delayMs);
    };
  }

  // ── Human Speed Detection ─────────────────────────────────────────────────

  /**
   * Starts a named timer.
   * @param {string} id
   */
  static startTimer(id) {
    NexTimingUtil._timers = NexTimingUtil._timers || {};
    NexTimingUtil._timers[id] = performance.now();
  }

  /**
   * Returns milliseconds elapsed since startTimer(id).
   * @param {string} id
   * @returns {number}
   */
  static elapsed(id) {
    const start = NexTimingUtil._timers?.[id];
    if (!start) return -1;
    return Math.round(performance.now() - start);
  }

  /**
   * Returns true if at least minMs has elapsed since startTimer(id).
   * Useful for detecting bots that fill forms too quickly.
   * @param {string} id
   * @param {number} minMs - minimum human interaction time
   * @returns {boolean}
   */
  static isHumanSpeed(id, minMs = 3000) {
    return NexTimingUtil.elapsed(id) >= minMs;
  }

  /**
   * Clears a named timer.
   * @param {string} id
   */
  static clearTimer(id) {
    if (NexTimingUtil._timers) delete NexTimingUtil._timers[id];
  }
}

// Expose globally
window.NexTiming = NexTimingUtil;

// Web Component wrapper
class NexTimingGuard extends HTMLElement {
  connectedCallback() {
    this.style.display = 'none';
    // Expose API on element
    this.equal       = NexTimingUtil.equal.bind(NexTimingUtil);
    this.equalBytes  = NexTimingUtil.equalBytes.bind(NexTimingUtil);
    this.jitter      = NexTimingUtil.jitter.bind(NexTimingUtil);
    this.fixedDelay  = NexTimingUtil.fixedDelay.bind(NexTimingUtil);
    this.rateLimit   = NexTimingUtil.rateLimit.bind(NexTimingUtil);
    this.debounce    = NexTimingUtil.debounce.bind(NexTimingUtil);
    this.startTimer  = NexTimingUtil.startTimer.bind(NexTimingUtil);
    this.elapsed     = NexTimingUtil.elapsed.bind(NexTimingUtil);
    this.isHumanSpeed = NexTimingUtil.isHumanSpeed.bind(NexTimingUtil);
    this.clearTimer  = NexTimingUtil.clearTimer.bind(NexTimingUtil);
  }
}

customElements.define('nex-timing-guard', NexTimingGuard);
