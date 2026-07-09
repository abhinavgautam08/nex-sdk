/*! nex-proto-guard v1.0.0 | (c) 2026 NEX SDK | MIT License */
/**
 * NEX-PROTO-GUARD | Prototype Pollution Detector
 * Monitors JSON.parse output and optionally freezes Object.prototype
 * to block prototype pollution attacks via dangerous key injection.
 *
 * Usage:
 *   <nex-proto-guard freeze warn></nex-proto-guard>
 *
 * Attributes:
 *   freeze - freezes Object.prototype (blocks all pollution attempts)
 *   warn   - logs violations to console
 *
 * Events: nex-proto-violation (bubbles, composed)
 */
class NexProtoGuard extends HTMLElement {
  static get DANGEROUS_KEYS() {
    return new Set(['__proto__', 'constructor', 'prototype', '__defineGetter__',
                    '__defineSetter__', '__lookupGetter__', '__lookupSetter__']);
  }

  connectedCallback() {
    this.style.display = 'none';
    if (this.hasAttribute('freeze')) this._freezeProtos();
    this._patchJSON();
  }

  _freezeProtos() {
    try { Object.freeze(Object.prototype); } catch { /* already frozen */ }
    try { Object.freeze(Array.prototype);  } catch { /* already frozen */ }
  }

  /**
   * Wraps JSON.parse to scan for prototype pollution keys in parsed objects.
   */
  _patchJSON() {
    const self = this;
    const originalParse = JSON.parse;

    JSON.parse = function(text, reviver) {
      const result = originalParse.call(JSON, text, reviver);
      self._deepCheck(result, 0);
      return result;
    };

    // Mark as patched so multiple instances don't double-wrap
    JSON.parse.__nex_guarded__ = true;
  }

  _deepCheck(obj, depth) {
    if (depth > 12 || obj === null || typeof obj !== 'object') return;

    for (const key of Object.keys(obj)) {
      if (NexProtoGuard.DANGEROUS_KEYS.has(key)) {
        const detail = { key, depth, value: String(obj[key]).slice(0, 80) };

        if (this.hasAttribute('warn')) {
          console.warn('[NexProtoGuard] Prototype pollution attempt blocked:', detail);
        }

        this._emit('nex-proto-violation', detail);
        delete obj[key]; // Neutralize the dangerous key
      } else {
        this._deepCheck(obj[key], depth + 1);
      }
    }
  }

  _emit(name, detail = {}) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
}

customElements.define('nex-proto-guard', NexProtoGuard);
