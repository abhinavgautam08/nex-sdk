/*! nex-crypto v1.0.0 | (c) 2026 NEX SDK | MIT License */
/**
 * NEX-CRYPTO | Web Crypto API Utility Belt
 * A non-visual component that exposes a static NexCrypto utility class
 * wrapping the browser's native Web Crypto API (window.crypto.subtle).
 *
 * Usage:
 *   <nex-crypto></nex-crypto>  <!-- registers the component + exposes window.NexCrypto -->
 *
 *   const hash = await NexCrypto.hash('hello', 'SHA-256');     // hex string
 *   const rand = await NexCrypto.random(32);                   // random hex string
 *   const { publicKey, privateKey } = await NexCrypto.generateKeyPair('ECDSA');
 *   const sig  = await NexCrypto.sign(data, privateKey);
 *   const ok   = await NexCrypto.verify(data, sig, publicKey);
 *   const enc  = await NexCrypto.encrypt('secret', passphrase);
 *   const dec  = await NexCrypto.decrypt(enc, passphrase);
 *
 * All methods are async and return Promises.
 * All operations use the browser's native SubtleCrypto API — no dependencies.
 */

class NexCryptoUtil {
  // ── Hashing ──────────────────────────────────────────────────────────────

  /**
   * Hashes a string using the specified algorithm.
   * @param {string} text
   * @param {'SHA-256'|'SHA-384'|'SHA-512'} algorithm
   * @returns {Promise<string>} lowercase hex digest
   */
  static async hash(text, algorithm = 'SHA-256') {
    const encoded = new TextEncoder().encode(text);
    const buffer  = await crypto.subtle.digest(algorithm, encoded);
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Generates a cryptographically secure random hex string.
   * @param {number} byteLength - number of random bytes (default: 32)
   * @returns {string} hex string of length byteLength * 2
   */
  static random(byteLength = 32) {
    const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generates a cryptographically random UUID v4.
   * @returns {string}
   */
  static uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    return [...bytes].map((b, i) =>
      ([4, 6, 8, 10].includes(i) ? '-' : '') + b.toString(16).padStart(2, '0')
    ).join('');
  }

  // ── Symmetric Encryption (AES-256-GCM) ──────────────────────────────────

  /**
   * Encrypts plaintext using AES-256-GCM with a passphrase-derived key (PBKDF2).
   * @param {string} plaintext
   * @param {string} passphrase
   * @returns {Promise<string>} base64 encoded ciphertext (includes salt + iv)
   */
  static async encrypt(plaintext, passphrase) {
    const salt    = crypto.getRandomValues(new Uint8Array(16));
    const iv      = crypto.getRandomValues(new Uint8Array(12));
    const key     = await NexCryptoUtil._deriveKey(passphrase, salt);
    const encoded = new TextEncoder().encode(plaintext);
    const cipher  = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
    // Pack: [salt(16)] + [iv(12)] + [ciphertext]
    const combined = new Uint8Array(salt.length + iv.length + cipher.byteLength);
    combined.set(salt, 0);
    combined.set(iv, 16);
    combined.set(new Uint8Array(cipher), 28);
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypts AES-256-GCM ciphertext produced by encrypt().
   * @param {string} cipherBase64
   * @param {string} passphrase
   * @returns {Promise<string>} plaintext
   */
  static async decrypt(cipherBase64, passphrase) {
    const combined = Uint8Array.from(atob(cipherBase64), c => c.charCodeAt(0));
    const salt     = combined.slice(0, 16);
    const iv       = combined.slice(16, 28);
    const cipher   = combined.slice(28);
    const key      = await NexCryptoUtil._deriveKey(passphrase, salt);
    const plain    = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
    return new TextDecoder().decode(plain);
  }

  // ── Asymmetric Keys (ECDSA) ──────────────────────────────────────────────

  /**
   * Generates an ECDSA or ECDH key pair.
   * @param {'ECDSA'|'ECDH'} algorithm
   * @param {'P-256'|'P-384'|'P-521'} curve
   * @returns {Promise<{publicKey: CryptoKey, privateKey: CryptoKey, publicKeyPem: string}>}
   */
  static async generateKeyPair(algorithm = 'ECDSA', curve = 'P-256') {
    const usage = algorithm === 'ECDSA' ? ['sign', 'verify'] : ['deriveKey', 'deriveBits'];
    const pair  = await crypto.subtle.generateKey(
      { name: algorithm, namedCurve: curve },
      true,
      usage
    );
    const exportedPub = await crypto.subtle.exportKey('spki', pair.publicKey);
    const pemPub = NexCryptoUtil._toPEM(exportedPub, 'PUBLIC KEY');
    return { publicKey: pair.publicKey, privateKey: pair.privateKey, publicKeyPem: pemPub };
  }

  /**
   * Signs data with an ECDSA private key.
   * @param {string|Uint8Array} data
   * @param {CryptoKey} privateKey
   * @returns {Promise<string>} base64 signature
   */
  static async sign(data, privateKey) {
    const encoded = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const sig = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      privateKey,
      encoded
    );
    return btoa(String.fromCharCode(...new Uint8Array(sig)));
  }

  /**
   * Verifies an ECDSA signature.
   * @param {string|Uint8Array} data
   * @param {string} signatureBase64
   * @param {CryptoKey} publicKey
   * @returns {Promise<boolean>}
   */
  static async verify(data, signatureBase64, publicKey) {
    const encoded = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const sig     = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0));
    return crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      publicKey,
      sig,
      encoded
    );
  }

  // ── HMAC ─────────────────────────────────────────────────────────────────

  /**
   * Computes HMAC-SHA256 of a message with a secret key.
   * @param {string} message
   * @param {string} secret
   * @returns {Promise<string>} hex string
   */
  static async hmac(message, secret) {
    const keyMat = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', keyMat, new TextEncoder().encode(message));
    return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  static async _deriveKey(passphrase, salt) {
    const raw = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      raw,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  static _toPEM(buffer, label) {
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const lines = b64.match(/.{1,64}/g).join('\n');
    return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
  }
}

// Expose globally
window.NexCrypto = NexCryptoUtil;

// Non-visual Web Component wrapper
class NexCryptoElement extends HTMLElement {
  connectedCallback() {
    this.style.display = 'none';
    // Expose on the element too for convenience
    this.hash            = NexCryptoUtil.hash.bind(NexCryptoUtil);
    this.random          = NexCryptoUtil.random.bind(NexCryptoUtil);
    this.uuid            = NexCryptoUtil.uuid.bind(NexCryptoUtil);
    this.encrypt         = NexCryptoUtil.encrypt.bind(NexCryptoUtil);
    this.decrypt         = NexCryptoUtil.decrypt.bind(NexCryptoUtil);
    this.generateKeyPair = NexCryptoUtil.generateKeyPair.bind(NexCryptoUtil);
    this.sign            = NexCryptoUtil.sign.bind(NexCryptoUtil);
    this.verify          = NexCryptoUtil.verify.bind(NexCryptoUtil);
    this.hmac            = NexCryptoUtil.hmac.bind(NexCryptoUtil);
  }
}

customElements.define('nex-crypto', NexCryptoElement);
