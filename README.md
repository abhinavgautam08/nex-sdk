# NEX SDK (v1.7.0)

A lightweight, framework-independent, security-first Web Component developer toolkit with a neon cyberpunk aesthetic. Natively encapsulated using Shadow DOM — compatible with any HTML website, zero dependencies, and fully ready for GitHub + jsDelivr CDN delivery.

[![Version](https://img.shields.io/badge/version-v1.7.0-00f2ff?style=flat-square)](https://github.com/abhinavgautam08/nex-sdk/releases/tag/v1.7.0)
[![License](https://img.shields.io/badge/license-MIT-ff007f?style=flat-square)](LICENSE)
[![CDN](https://img.shields.io/badge/CDN-jsDelivr-orange?style=flat-square)](https://www.jsdelivr.com/package/gh/abhinavgautam08/nex-sdk)

---

## 1. Project Overview & Core Features

*   **Shadow DOM Isolated** — Zero style clashing. Every component is fully encapsulated.
*   **Zero Dependencies** — Pure ES6 JavaScript. No build tools, no package managers required.
*   **Security-First** — 18 dedicated security utility packages & guards (XSS, AES-256-GCM, TOTP 2FA, PoW Captcha, In-Memory Vaults, JWT, bot detection, clickjacking, prototype pollution, and more).
*   **Lightweight Footprint** — Entire minified SDK totals under 160 KB (~45 KB Gzipped).
*   **Global Theme Engine** — CSS variables (`--nex-primary`, `--nex-accent`, `--nex-bg`, `--nex-glow`) customize all components instantly.
*   **High Performance** — Lazy init, async CDN loading, active memory-leak cleanup on disconnect.

---

## 2. Component Reference Table

### UI & Media Components

| Component | Description | Key Attributes | Events / API |
|:---|:---|:---|:---|
| **`<nex-stream>`** | HLS/MP4 cyberpunk media player | `src`, `poster`, `logo`, `autoplay`, `muted` | `play()`, `pause()`, `togglePlay()`, `loadSource()` |
| **`<nex-image>`** | Lazy-loading responsive image | `src`, `srcset`, `sizes`, `alt`, `loading`, `fallback` | `load`, `error` |
| **`<nex-file>`** | Video/Image/PDF metadata card | `src`, `name`, `size`, `type` | `download` |
| **`<nex-upload>`** | Drag & drop uploader + magic verify | `endpoint`, `multiple`, `accept`, `max-size`, `magic-verify` | `file-added`, `file-spoofed`, `upload-success`, `upload-error` |
| **`<nex-search>`** | Cyberpunk search/fetch bar | `placeholder`, `button-text`, `icon`, `hint`, `loading`, `clearable` | `nex-search-submit`, `nex-search-change` |
| **`<nex-ui>`** *(bundle)* | Buttons, Cards, Loaders, Modals, Toasts | `<nex-button>`, `<nex-card>`, `<nex-loader>`, `<nex-modal>` | `modal.openModal()`, `window.showNexToast()` |
| **`NexAnalytics`** | Telemetry & event tracking engine | `endpoint`, `app`, `debug` | `track()`, `trackPageView()`, `destroy()` |
| **`<nex-terminal>`** | Interactive neon CLI shell (XSS-safe) | `title`, `placeholder`, `logo` | `writeLine()`, `clear()`, `command` event |
| **`<nex-chart>`** | Canvas telemetry visualizer | `type`, `glow-color`, `grid-color` | `setData()`, `addDataPoint()` |
| **`<nex-router>`** | Glitch-animated tab navigation | `tabs`, `active-tab`, `logo` | `tab-change` |
| **`<nex-auth>`** | Auth portal + rate limiter + strength | `endpoint`, `session-timeout`, `min-strength`, `logo` | `auth-submit`, `auth-success`, `auth-locked`, `triggerFailure()` |
| **`<nex-chat>`** | Message terminal (XSS-safe) | `logo` | `addMessage()`, `clearChat()` |
| **`<nex-notification>`** | Global toast alerts | `position`, `max-notifications` | `window.showNexNotification()` |
| **`<nex-payment>`** | Mock billing checkout | `logo` | `applyCoupon()` |
| **`<nex-editor>`** | WYSIWYG rich text editor (XSS-safe) | `logo` | `getHtml()`, `getMarkdown()`, `setMarkdown()` |
| **`<nex-qr>`** | Canvas QR code generator | `value`, `size`, `color`, `bg-color` | — |
| **`<nex-camera>`** | getUserMedia hardware viewport | `audio` | `start()`, `stop()`, `capture()` |
| **`<nex-scanner>`** | Laser tracking overlay | `logo` | — |
| **`<nex-share>`** | Link sharing portal | `url`, `title` | — |
| **`<nex-theme>`** | localStorage theme persister | `storage-key` | — |
| **`<nex-network>`** | Live connection latency monitor | `ping-interval` | — |

### 🔐 Security & Cryptography Components (v1.4.0 – v1.7.0)

| Component | Description | Key Attributes | Events |
|:---|:---|:---|:---|
| **`NexCrypto`** | Web Crypto API wrapper (SHA-2, AES-GCM, ECDSA) | — | — |
| **`<nex-totp>`** | Offline TOTP / 2FA code generator (RFC 6238) | `secret`, `digits`, `period`, `display` | `nex-totp-refresh`, `nex-totp-verified` |
| **`<nex-pow>`** | Proof-of-Work CAPTCHA (privacy-first challenge) | `difficulty`, `challenge`, `auto` | `pow-solving`, `pow-solved`, `pow-progress` |
| **`<nex-audit>`** | Client-side security event audit logger | `endpoint`, `auto-flush`, `max-log` | `nex-audit-flushed` |
| **`<nex-vault>`** | RAM-only secret storage vault (zero-disk) | `wipe-on-hide`, `wipe-on-unload`, `max-keys` | `nex-vault-set`, `nex-vault-wipe` |
| **`<nex-password>`** | Crypto-random password generator UI | `length`, `numbers`, `symbols`, `target` | `nex-password-generated`, `nex-password-copied` |
| **`<nex-url-guard>`** | Open redirect & malicious navigation prevention | `allow`, `action` | `nex-redirect-blocked`, `nex-redirect-allowed` |
| **`<nex-timing-guard>`**| Constant-time comparison & timing attack shield | — | — |
| **`NexSanitizer`** | Client-side XSS HTML sanitizer (static util) | — | — |
| **`<nex-storage>`** | AES-256-GCM encrypted browser storage | `type`, `encryption` | `storage-set`, `storage-get`, `storage-expire` |
| **`<nex-jwt>`** | JWT expiry guard + auto-check | `storage`, `check-interval` | `nex-session-expired`, `nex-token-set` |
| **`<nex-honeypot>`** | Bot & spam trap (invisible fields + UA check) | `min-time` | `nex-bot-detected` |
| **`<nex-idle>`** | Idle session timeout guard | `timeout`, `warn-at` | `nex-idle-warning`, `nex-idle`, `nex-active` |
| **`<nex-frame-guard>`** | Clickjacking / iframe detection shield | `action` | `nex-frame-attack` |
| **`<nex-mask>`** | Sensitive data auto-masker with timed reveal | `type`, `reveal-timeout`, `mask-char` | `nex-mask-revealed`, `nex-mask-hidden` |
| **`<nex-proto-guard>`** | Prototype pollution detector + JSON guard | `freeze`, `warn` | `nex-proto-violation` |
| **`<nex-integrity>`** | Subresource Integrity (SRI) monitor | `monitor`, `warn`, `strict` | `nex-integrity-violation` |
| **`<nex-https>`** | Protocol enforcer + mixed-content scanner | `action`, `banner`, `mixed` | `nex-http-detected`, `nex-mixed-content` |
| **`<nex-clipboard>`** | Paste sanitizer + copy blocker | `guard`, `max-len`, `block-copy` | `nex-paste-sanitized`, `nex-copy-blocked` |

---

## 3. CDN Installation & Version Pinning

Load any component directly from jsDelivr:

```html
<!-- ── UI & Media ─────────────────────────────────────── -->
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-stream/nex-stream.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-image/nex-image.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-file/nex-file.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-upload/nex-upload.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-search/nex-search.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-ui/nex-ui.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-analytics/nex-analytics.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-terminal/nex-terminal.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-chart/nex-chart.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-router/nex-router.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-auth/nex-auth.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-chat/nex-chat.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-notification/nex-notification.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-payment/nex-payment.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-editor/nex-editor.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-qr/nex-qr.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-camera/nex-camera.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-scanner/nex-scanner.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-share/nex-share.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-theme/nex-theme.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-network/nex-network.min.js"></script>

<!-- ── Security Stack ─────────────────────────────────── -->
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-crypto/nex-crypto.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-totp/nex-totp.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-pow/nex-pow.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-audit/nex-audit.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-vault/nex-vault.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-password/nex-password.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-url-guard/nex-url-guard.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-timing-guard/nex-timing-guard.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-sanitizer/nex-sanitizer.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-storage/nex-storage.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-jwt/nex-jwt.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-honeypot/nex-honeypot.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-idle/nex-idle.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-frame-guard/nex-frame-guard.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-mask/nex-mask.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-proto-guard/nex-proto-guard.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-integrity/nex-integrity.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-https/nex-https.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.7.0/packages/nex-clipboard/nex-clipboard.min.js"></script>
```

### Version Pinning Strategies

| Strategy | CDN Tag | Use Case |
|:---|:---|:---|
| Exact pin | `@v1.7.0` | ✅ Production (recommended) |
| Minor pin | `@v1.7` | Auto patch updates |
| Major pin | `@v1` | Auto minor + patch |
| Latest | `@latest` | 🚧 Staging/dev only |

---

## 4. 🔐 Security Stack — Full Configuration

Drop this block at the top of your `<body>` for complete protection:

```html
<!-- Runtime guards (load before any user content) -->
<nex-proto-guard freeze warn></nex-proto-guard>
<nex-frame-guard action="blur"></nex-frame-guard>
<nex-https action="warn" banner mixed></nex-https>
<nex-integrity monitor warn></nex-integrity>
<nex-url-guard allow="mytrusteddomain.com" action="block"></nex-url-guard>
<nex-timing-guard></nex-timing-guard>

<!-- Audit Logger (auto-captures all NEX security events) -->
<nex-audit id="logger" endpoint="/api/logs" auto-flush="60"></nex-audit>

<!-- Session guards -->
<nex-idle id="idleGuard" timeout="300" warn-at="30"></nex-idle>
<nex-jwt  id="jwtGuard"  storage="session" check-interval="30"></nex-jwt>
<nex-vault id="memVault" wipe-on-hide wipe-on-unload></nex-vault>

<!-- Input guards -->
<nex-honeypot  id="hp"></nex-honeypot>
<nex-clipboard guard="input, textarea"></nex-clipboard>
<nex-pow id="powChallenge" difficulty="20"></nex-pow>

<script>
  // Auto-logout on idle or JWT expiry
  document.addEventListener('nex-idle', () => jwtGuard.clearToken());
  document.addEventListener('nex-session-expired', () => location.href = '/login');

  // Bot protection on login form using PoW + Honeypot
  const form = document.querySelector('#login-form');
  hp.inject(form);
  
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!hp.isHuman(form)) return;
    
    // Solve proof-of-work challenge before posting credentials
    const proof = await powChallenge.solve();
    // Submit form data + proof.nonce to server
  });
</script>
```

---

## 5. API Reference

### A. `<nex-stream>` (Video Player)
**Attributes:** `src`, `poster`, `logo`, `autoplay`, `muted`, `playsinline`
**Methods:** `play()`, `pause()`, `togglePlay()`, `toggleMute()`, `toggleFullscreen()`, `loadSource(url)`

---

### B. `<nex-image>` (Responsive Lazy Image)
**Attributes:** `src`, `srcset`, `sizes`, `alt`, `loading`, `fallback`
**Events:** `load`, `error`

---

### C. `<nex-file>` (File Preview Card)
**Attributes:** `src`, `name`, `size`, `type` (`image` | `video` | `pdf` | `generic`)
**Events:** `download`

---

### D. `<nex-upload>` (Drag & Drop Uploader)
**Attributes:** `endpoint`, `multiple`, `accept`, `max-size`, `auto-upload`, `magic-verify`
**Events:** `file-added`, `file-spoofed`, `upload-start`, `upload-progress`, `upload-success`, `upload-error`

---

### E. `<nex-search>` (Cyberpunk Search / Fetch Bar)
**Attributes:** `placeholder`, `button-text`, `icon`, `hint`, `loading`, `value`, `clearable`
**Methods:** `getValue()`, `setValue(val)`, `clear()`, `focus()`, `setLoading(bool)`
**Events:** `nex-search-submit`, `nex-search-clear`, `nex-search-change`

```html
<nex-search id="sb" placeholder="PASTE URL..." button-text="FETCH" icon="bolt" clearable></nex-search>
```

---

### F. `<nex-ui>` (Cyber UI Bundle)
Registers 5 sub-components:
- **`<nex-button>`** — `type` (`primary`, `secondary`, `outline`, `fuchsia`, `lime`), `size`, `disabled`, `loading`
- **`<nex-card>`** — `title`
- **`<nex-loader>`** — `type` (`spinner` | `progress`), `text`
- **`<nex-modal>`** — `title`, `open` — API: `openModal()`, `close()` — Events: `open`, `close`
- **`<nex-toast>`** — `window.showNexToast(message, type, duration)`

---

### G. `NexAnalytics` (Telemetry Client)
**Methods:** `track(category, action, label, val, extra)`, `trackPageView()`, `destroy()`

---

### H. `<nex-terminal>` (CLI Shell)
**Attributes:** `title`, `placeholder`, `logo`
**Methods:** `writeLine(msg, type)`, `clear()`
**Events:** `command` — detail: `{ command }`

---

### I. `<nex-chart>` (Telemetry Visualizer)
**Attributes:** `type` (`line` | `bar`), `glow-color`, `grid-color`, `logo`
**Methods:** `setData(labels, values)`, `addDataPoint(label, value)`

---

### J. `<nex-router>` (Tab Router)
**Attributes:** `tabs` (semicolon-separated `Label:id`), `active-tab`, `logo`
**Events:** `tab-change`

---

### K. `<nex-auth>` (Secure Login Gateway)
**Attributes:** `endpoint`, `session-timeout`, `logo`, `min-strength` (1–5)
**Methods:** `logout()`, `showView(view)`, `triggerFailure()`
**Events:** `auth-submit`, `auth-success`, `auth-logout`, `auth-locked`, `auth-rate-limited`, `auth-weak-password`, `view-change`

---

### L. `<nex-chat>` (Message Terminal)
**Methods:** `addMessage(msg)`, `clearChat()`

---

### M. `<nex-notification>` (Global Toast)
**Attributes:** `position`, `max-notifications`
**Global:** `window.showNexNotification(type, text, duration)`

---

### N. `<nex-payment>` (Billing Checkout)
**Methods:** `applyCoupon(code)`

---

### O. `<nex-editor>` (WYSIWYG Editor)
**Methods:** `getHtml()`, `getMarkdown()`, `setMarkdown(md)`

---

### P. `<nex-qr>` (QR Generator)
**Attributes:** `value`, `size`, `color`, `bg-color`

---

### Q. `<nex-camera>` (Camera Viewport)
**Attributes:** `audio` — **Methods:** `start()`, `stop()`, `capture()`

---

### R. `NexCrypto` (Web Crypto Util) 🔐
Static helper methods exposed on `window.NexCrypto`:
- `await hash(text, algo)` - returns SHA-256/384/512 hex string
- `random(bytes)` - returns cryptographically secure random hex string
- `uuid()` - returns cryptographically secure UUID v4
- `await encrypt(plain, pass)` - returns AES-256-GCM Base64 ciphertext
- `await decrypt(cipher, pass)` - returns plaintext string
- `await generateKeyPair(algo, curve)` - returns keypair & PEM public key
- `await sign(data, privKey)` - returns Base64 ECDSA signature
- `await verify(data, sigB64, pubKey)` - returns true/false
- `await hmac(msg, secret)` - returns HMAC-SHA256 hex string

---

### S. `<nex-totp>` (Offline 2FA Code Generator) 🔐
**Attributes:** `secret` (Base32), `digits` (6 or 8), `period` (seconds, default: 30), `display` (flag)
**Methods:** `await generate()`, `await verify(code, drift)`, `getRemainingSeconds()`
**Events:** `nex-totp-refresh`, `nex-totp-verified`

---

### T. `<nex-pow>` (Proof-of-Work CAPTCHA) 🔐
**Attributes:** `difficulty` (leading zero bits, default: 20), `challenge`, `auto`
**Methods:** `await solve()`, `getProof()`, `isSolved()`
**Events:** `pow-solving`, `pow-solved`, `pow-progress`

---

### U. `<nex-audit>` (Security Event Audit Logger) 🔐
**Attributes:** `endpoint`, `auto-flush` (seconds), `max-log` (default: 500)
**Methods:** `getLog()`, `clear()`, `addEntry(type, detail)`, `await exportJSON()`, `getSummary()`
**Events:** `nex-audit-flushed`

---

### V. `<nex-vault>` (RAM-Only Secret Vault) 🔐
**Attributes:** `wipe-on-hide`, `wipe-on-unload`, `max-keys` (default: 100)
**Methods:** `set(key, val, ttl)`, `get(key)`, `has(key)`, `remove(key)`, `wipe(reason)`, `keys()`, `ttl(key)`
**Events:** `nex-vault-set`, `nex-vault-wipe`, `nex-vault-overflow`, `nex-vault-expire`

---

### W. `<nex-password>` (Secure Password Generator UI) 🔐
**Attributes:** `length`, `uppercase`, `lowercase`, `numbers`, `symbols`, `no-ambiguous`, `target` (CSS selector)
**Methods:** `generate()`, `getPassword()`, `copyToClipboard()`
**Events:** `nex-password-generated`, `nex-password-copied`

---

### X. `<nex-url-guard>` (Open Redirect Prevention) 🔐
**Attributes:** `allow` (comma-separated domains), `action` (`warn` | `block` | `none`)
**Methods:** `check(url)` - returns `{ safe, reason }`
**Events:** `nex-redirect-blocked`, `nex-redirect-allowed`

---

### Y. `<nex-timing-guard>` (Timing Attack Shield) 🔐
Static helper methods exposed on `window.NexTiming`:
- `equal(a, b)` - constant-time string comparison
- `equalBytes(a, b)` - constant-time Uint8Array comparison
- `await jitter(min, max)` - delays async process by random ms
- `await fixedDelay(ms)` - delays async process by fixed ms
- `rateLimit(fn, gapMs)` - returns rate-limited function wrapper
- `debounce(fn, delayMs)` - returns debounced function wrapper
- `startTimer(id)`, `elapsed(id)`, `isHumanSpeed(id, minMs)` - timing-based bot checks

---

### Z. `<nex-storage>` (AES-256-GCM Vault) 🔐
**Attributes:** `type` (`local` | `session`), `encryption`
**Methods:** `await set(key, value, ttlSeconds)`, `await get(key)`, `remove(key)`, `clear()`

---

### AA. `NexSanitizer` (XSS Shield) 🔐
Static utility: `NexSanitizer.sanitize(html)`

---

### AB. `<nex-jwt>` (JWT Guard) 🔐
**Attributes:** `storage`, `check-interval`
**Methods:** `setToken(jwt)`, `getToken()`, `getPayload()`, `isExpired()`, `clearToken()`, `getRemainingSeconds()`

---

### AC. `<nex-honeypot>` (Bot Trap) 🔐
**Attributes:** `min-time`
**Methods:** `inject(form)`, `isHuman(form)`, `reset()`

---

### AD. `<nex-idle>` (Idle Timeout) 🔐
**Attributes:** `timeout`, `warn-at`
**Methods:** `getIdleSeconds()`, `resetTimer()`, `isIdle()`

---

### AE. `<nex-frame-guard>` (Clickjacking Shield) 🔐
**Attributes:** `action` (`blur` | `breakout` | `none`)

---

### AF. `<nex-mask>` (Data Masker) 🔐
**Attributes:** `type` (`token` | `card` | `otp` | `key`), `reveal-timeout`, `mask-char`

---

### AG. `<nex-proto-guard>` (Prototype Pollution Guard) 🔐
**Attributes:** `freeze`, `warn`

---

### AH. `<nex-integrity>` (SRI Monitor) 🔐
**Attributes:** `monitor`, `warn`, `strict`

---

### AI. `<nex-https>` (Protocol Enforcer) 🔐
**Attributes:** `action` (`warn` | `redirect`), `banner`, `mixed`

---

### AJ. `<nex-clipboard>` (Paste Sanitizer) 🔐
**Attributes:** `guard`, `max-len`, `block-copy`

---

## 6. Integration Best Practices

### Global CSS Theme Engine
```css
body {
  --nex-primary: #00f2ff; /* Neon cyan */
  --nex-accent:  #ff007f; /* Fuchsia    */
  --nex-bg:      #070711; /* Dark void  */
  --nex-glow:    rgba(0, 242, 255, 0.2);
}
```

### Performance
*   Use `loading="lazy"` on off-screen `<nex-image>`.
*   Components auto-clean callbacks and event listeners on disconnected.

### Security
*   Load `<nex-proto-guard freeze>` before any third-party script.
*   Always use `integrity` and `crossorigin` on CDN scripts to protect against CDN hijacking.
*   Store highly sensitive short-lived tokens in `<nex-vault>` in-RAM rather than localStorage.
*   Prevent timing leaks on local validation using `NexTiming.equal()`.

---

## 7. Versioning & Migration

NEX SDK follows Semantic Versioning (`MAJOR.MINOR.PATCH`):

| Release | Highlights |
|:---|:---|
| **v1.7.0** | 8 new cryptographic & security components (`nex-crypto`, `nex-totp`, `nex-pow`, `nex-audit`, `nex-vault`, `nex-password`, `nex-url-guard`, `nex-timing-guard`) |
| **v1.6.2** | Cyberpunk corner clipped button update to `nex-search` |
| **v1.6.1** | Added `nex-search` (cyberpunk query input + bolt button) |
| **v1.6.0** | 8 runtime protection components (`nex-honeypot`, `nex-idle`, `nex-frame-guard`, `nex-mask`, etc.) |
| **v1.5.0** | AES-256-GCM storage, magic number file checks, auth strength rate limiter, JWT guard |
| **v1.4.0** | XSS sanitizer shield integration |
| **v1.0.0** | Initial release (15 UI components) |

---

## License

MIT © 2026 NEX SDK Contributors
