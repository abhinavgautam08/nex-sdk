/*! nex-clipboard v1.0.0 | (c) 2026 NEX SDK | MIT License */
/**
 * NEX-CLIPBOARD | Paste Sanitizer & Clipboard Guard
 * Intercepts paste events on protected inputs and sanitizes content
 * through NexSanitizer before it reaches the field.
 * Also supports blocking copy from sensitive elements.
 *
 * Usage:
 *   <nex-clipboard guard="#terminal-input, #chat-input"></nex-clipboard>
 *   <nex-clipboard guard="input, textarea" block-copy=".api-key-display"></nex-clipboard>
 *
 * Attributes:
 *   guard       - CSS selector for inputs to protect (default: input, textarea)
 *   max-len     - max characters allowed from a single paste (default: 10000)
 *   block-copy  - CSS selector of elements to prevent copy from
 *
 * Events: nex-paste-sanitized, nex-paste-blocked, nex-copy-blocked (bubbles, composed)
 */
class NexClipboard extends HTMLElement {
  static get observedAttributes() { return ['guard', 'max-len', 'block-copy']; }

  constructor() {
    super();
    this._handlers = new Map(); // element → paste handler
  }

  connectedCallback() {
    this.style.display = 'none';
    this._applyGuards();
    this._applyBlockCopy();
  }

  disconnectedCallback() {
    this._handlers.forEach((handler, el) => el.removeEventListener('paste', handler));
    this._handlers.clear();
  }

  // ── Guard Setup ──────────────────────────────────────────────────────────

  _applyGuards() {
    const selector = this.getAttribute('guard') || 'input, textarea';
    document.querySelectorAll(selector).forEach(el => {
      if (this._handlers.has(el)) return;
      const handler = (e) => this._handlePaste(e, el);
      el.addEventListener('paste', handler);
      this._handlers.set(el, handler);
    });
  }

  _applyBlockCopy() {
    const selector = this.getAttribute('block-copy');
    if (!selector) return;
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('copy', (e) => {
        e.preventDefault();
        this._emit('nex-copy-blocked', { tag: el.tagName, id: el.id });
      });
    });
  }

  // ── Paste Handler ────────────────────────────────────────────────────────

  _handlePaste(e, el) {
    e.preventDefault();

    const maxLen = parseInt(this.getAttribute('max-len')) || 10000;
    let text = (e.clipboardData || window.clipboardData).getData('text/plain') || '';

    // Truncate if over limit
    if (text.length > maxLen) {
      const original = text;
      text = text.slice(0, maxLen);
      this._emit('nex-paste-blocked', {
        reason: 'MAX_LENGTH_EXCEEDED',
        originalLength: original.length,
        truncatedAt: maxLen
      });
    }

    const rawText = text;

    // Sanitize via NexSanitizer if available, else use fallback stripping
    if (window.NexSanitizer) {
      text = window.NexSanitizer.sanitize(text);
    } else {
      text = this._fallbackSanitize(text);
    }

    // Insert sanitized text at cursor position
    this._insertText(el, text);

    this._emit('nex-paste-sanitized', {
      sanitized:  text,
      changed:    rawText !== text,
      length:     text.length
    });
  }

  _fallbackSanitize(text) {
    return text
      .replace(/<[^>]*>/g,    '')   // strip HTML tags
      .replace(/javascript:/gi, '')  // strip JS protocol
      .replace(/on\w+\s*=/gi,  '')   // strip inline event handlers
      .replace(/data:\w+\/\w+/gi, ''); // strip data URIs
  }

  _insertText(el, text) {
    // Try execCommand (wide support)
    try {
      el.focus();
      if (document.execCommand('insertText', false, text)) return;
    } catch { /* fallback */ }

    // Direct value manipulation fallback
    const start = el.selectionStart ?? el.value.length;
    const end   = el.selectionEnd   ?? el.value.length;
    const val   = el.value || '';
    el.value = val.slice(0, start) + text + val.slice(end);
    el.setSelectionRange(start + text.length, start + text.length);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  _emit(name, detail = {}) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
}

customElements.define('nex-clipboard', NexClipboard);
