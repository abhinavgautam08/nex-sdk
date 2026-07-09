# NEX SDK (v1.6.0)

A lightweight, framework-independent, security-first Web Component developer toolkit with a neon cyberpunk aesthetic. Natively encapsulated using Shadow DOM — compatible with any HTML website, zero dependencies, and fully ready for GitHub + jsDelivr CDN delivery.

[![Version](https://img.shields.io/badge/version-v1.6.0-00f2ff?style=flat-square)](https://github.com/abhinavgautam08/nex-sdk/releases/tag/v1.6.0)
[![License](https://img.shields.io/badge/license-MIT-ff007f?style=flat-square)](LICENSE)
[![CDN](https://img.shields.io/badge/CDN-jsDelivr-orange?style=flat-square)](https://www.jsdelivr.com/package/gh/abhinavgautam08/nex-sdk)

---

## 1. Project Overview & Core Features

*   **Shadow DOM Isolated** — Zero style clashing. Every component is fully encapsulated.
*   **Zero Dependencies** — Pure ES6 JavaScript. No build tools, no package managers required.
*   **Security-First** — 10 dedicated security packages (XSS, AES-256-GCM, JWT, bot detection, clickjacking, prototype pollution, and more).
*   **Lightweight Footprint** — Entire minified SDK totals under 130 KB (~38 KB Gzipped).
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

### 🔐 Security Components (v1.4.0 – v1.6.0)

| Component | Description | Key Attributes | Events |
|:---|:---|:---|:---|
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
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-stream/nex-stream.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-image/nex-image.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-file/nex-file.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-upload/nex-upload.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-ui/nex-ui.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-analytics/nex-analytics.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-terminal/nex-terminal.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-chart/nex-chart.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-router/nex-router.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-auth/nex-auth.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-chat/nex-chat.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-notification/nex-notification.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-payment/nex-payment.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-editor/nex-editor.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-qr/nex-qr.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-camera/nex-camera.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-scanner/nex-scanner.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-share/nex-share.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-theme/nex-theme.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-network/nex-network.min.js"></script>

<!-- ── Security Stack ─────────────────────────────────── -->
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-sanitizer/nex-sanitizer.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-storage/nex-storage.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-jwt/nex-jwt.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-honeypot/nex-honeypot.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-idle/nex-idle.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-frame-guard/nex-frame-guard.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-mask/nex-mask.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-proto-guard/nex-proto-guard.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-integrity/nex-integrity.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-https/nex-https.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.6.0/packages/nex-clipboard/nex-clipboard.min.js"></script>
```

### Version Pinning Strategies

| Strategy | CDN Tag | Use Case |
|:---|:---|:---|
| Exact pin | `@v1.6.0` | ✅ Production (recommended) |
| Minor pin | `@v1.6` | Auto patch updates |
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

<!-- Session guards -->
<nex-idle id="idleGuard" timeout="300" warn-at="30"></nex-idle>
<nex-jwt  id="jwtGuard"  storage="session" check-interval="30"></nex-jwt>

<!-- Input guards -->
<nex-honeypot  id="hp"></nex-honeypot>
<nex-clipboard guard="input, textarea"></nex-clipboard>

<script>
  // Auto-logout on idle or JWT expiry
  document.addEventListener('nex-idle', () => jwtGuard.clearToken());
  document.addEventListener('nex-session-expired', () => location.href = '/login');

  // Bot protection on login form
  const form = document.querySelector('#login-form');
  hp.inject(form);
  form.addEventListener('submit', e => {
    if (!hp.isHuman(form)) { e.preventDefault(); return; }
  });

  // Hook auth failure into rate limiter
  authEl.addEventListener('auth-submit', async (e) => {
    const ok = await verifyWithServer(e.detail.data);
    if (ok) {
      jwtGuard.setToken(ok.access_token);
    } else {
      authEl.triggerFailure(); // triggers exponential lockout
    }
  });
</script>
```

---

## 5. API Reference

### A. `<nex-stream>` (Video Player)
**Attributes:** `src`, `poster`, `logo`, `autoplay`, `muted`, `playsinline`
**Methods:** `play()`, `pause()`, `togglePlay()`, `toggleMute()`, `toggleFullscreen()`, `loadSource(url)`

```html
<nex-stream src="video.mp4" poster="thumb.jpg" autoplay muted playsinline></nex-stream>
```

---

### B. `<nex-image>` (Responsive Lazy Image)
**Attributes:** `src`, `srcset`, `sizes`, `alt`, `loading`, `fallback`
**Events:** `load`, `error`

```html
<nex-image src="photo.jpg" alt="Cyber Grid" loading="lazy" fallback="placeholder.png"></nex-image>
```

---

### C. `<nex-file>` (File Preview Card)
**Attributes:** `src`, `name`, `size`, `type` (`image` | `video` | `pdf` | `generic`)
**Events:** `download`

```html
<nex-file src="report.pdf" name="REPORT.PDF" size="2097152" type="pdf"></nex-file>
```

---

### D. `<nex-upload>` (Drag & Drop Uploader)
**Attributes:** `endpoint`, `multiple`, `accept`, `max-size`, `auto-upload`, `magic-verify`
**Events:** `file-added`, `file-spoofed`, `upload-start`, `upload-progress`, `upload-success`, `upload-error`

```html
<nex-upload
  id="uploader"
  endpoint="https://api.example.com/upload"
  accept="image/*,application/pdf"
  max-size="5242880"
  multiple magic-verify>
</nex-upload>
<script>
  uploader.addEventListener('file-spoofed', e => {
    console.warn('Spoofed file blocked:', e.detail.reason); // MAGIC_MISMATCH or BLOCKED_EXECUTABLE
  });
</script>
```

---

### E. `<nex-ui>` (Cyber UI Bundle)
Registers 5 sub-components:
- **`<nex-button>`** — `type` (`primary`, `secondary`, `outline`, `fuchsia`, `lime`), `size`, `disabled`, `loading`
- **`<nex-card>`** — `title`
- **`<nex-loader>`** — `type` (`spinner` | `progress`), `text`
- **`<nex-modal>`** — `title`, `open` — API: `openModal()`, `close()` — Events: `open`, `close`
- **`<nex-toast>`** — `window.showNexToast(message, type, duration)`

```html
<nex-modal id="m" title="CONFIRM_ACTION">
  <nex-button id="ok" type="lime">Execute</nex-button>
</nex-modal>
<script>
  document.getElementById('ok').addEventListener('click', () => {
    document.getElementById('m').close();
    window.showNexToast('Action confirmed', 'success', 3000);
  });
</script>
```

---

### F. `NexAnalytics` (Telemetry Client)
```javascript
const tracker = new NexAnalytics({
  endpoint: 'https://api.example.com/collect',
  app: 'MY_APP',
  debug: true
});
tracker.track('ui', 'click', 'button-id');
tracker.trackPageView();
tracker.destroy();
```

---

### G. `<nex-terminal>` (CLI Shell)
**Attributes:** `title`, `placeholder`, `logo`
**Methods:** `writeLine(msg, type)` — types: `info`, `success`, `warning`, `error`, `input`
**Methods:** `clear()`
**Events:** `command` — detail: `{ command }`

```html
<nex-terminal id="term" title="SYS_SHELL" placeholder="Enter command..."></nex-terminal>
<script>
  term.addEventListener('command', e => term.writeLine(`> ${e.detail.command}`, 'input'));
</script>
```

---

### H. `<nex-chart>` (Telemetry Visualizer)
**Attributes:** `type` (`line` | `bar`), `glow-color`, `grid-color`, `logo`
**Methods:** `setData(labels, values)`, `addDataPoint(label, value)`

```html
<nex-chart id="c" type="line" glow-color="#ff007f"></nex-chart>
<script>document.getElementById('c').setData(['T1','T2','T3'], [40, 90, 65]);</script>
```

---

### I. `<nex-router>` (Tab Router)
**Attributes:** `tabs` (semicolon-separated `Label:id`), `active-tab`, `logo`
**Events:** `tab-change` — detail: `{ tabId, label }`

```html
<nex-router tabs="OVERVIEW:pane1;LOGS:pane2" active-tab="pane1"></nex-router>
```

---

### J. `<nex-auth>` (Secure Login Gateway)
**Attributes:** `endpoint`, `session-timeout`, `logo`, `min-strength` (1–5)
**Methods:** `logout()`, `showView(view)`, `triggerFailure()`
**Events:** `auth-submit`, `auth-success`, `auth-logout`, `auth-locked`, `auth-rate-limited`, `auth-weak-password`, `view-change`

**Rate Limiter thresholds:** 3 fails → 15s lock · 5 fails → 60s · 7+ fails → 300s

```html
<nex-auth id="authEl" session-timeout="600" min-strength="3"></nex-auth>
<script>
  authEl.addEventListener('auth-submit', async (e) => {
    const res = await fetch('/api/login', {
      method: 'POST', body: JSON.stringify(e.detail.data)
    });
    if (!res.ok) authEl.triggerFailure();
  });
  authEl.addEventListener('auth-locked', e => {
    console.log(`Locked for ${e.detail.duration}s after ${e.detail.attempts} attempts`);
  });
</script>
```

---

### K. `<nex-chat>` (Message Terminal)
**Methods:** `addMessage(msg)`, `clearChat()`

---

### L. `<nex-notification>` (Global Toast)
**Attributes:** `position`, `max-notifications`
**Global:** `window.showNexNotification(type, text, duration)`

---

### M. `<nex-payment>` (Billing Checkout)
**Methods:** `applyCoupon(code)`

---

### N. `<nex-editor>` (WYSIWYG Editor)
**Methods:** `getHtml()`, `getMarkdown()`, `setMarkdown(md)`

---

### O. `<nex-qr>` (QR Generator)
**Attributes:** `value`, `size`, `color`, `bg-color`

---

### P. `<nex-camera>` (Camera Viewport)
**Attributes:** `audio` — **Methods:** `start()`, `stop()`, `capture()`

---

### Q–S. `<nex-scanner>` · `<nex-share>` · `<nex-theme>`
Standard utility components. See source files for full attribute docs.

---

### T. `<nex-storage>` (AES-256-GCM Vault) 🔐
**Attributes:** `type` (`local` | `session`), `encryption`
**Methods (async when encrypted):** `await set(key, value, ttlSeconds)`, `await get(key)`, `remove(key)`, `clear()`
**Events:** `storage-set`, `storage-get`, `storage-expire`, `storage-remove`, `storage-clear`

> When `encryption` attribute is present, data is encrypted using **AES-256-GCM** via the Web Crypto API. Key is PBKDF2-derived (100k iterations, SHA-256) with a domain-bound passphrase and a random per-session salt.

```html
<nex-storage id="vault" type="local" encryption></nex-storage>
<script>
  const vault = document.getElementById('vault');
  await vault.set('token', 'abc123', 3600);  // encrypted, expires in 1h
  const token = await vault.get('token');    // decrypted automatically
</script>
```

---

### U. `<nex-network>` (Latency Monitor)
**Attributes:** `ping-interval`

---

### V. `NexSanitizer` (XSS Shield) 🔐
Static utility used internally by `nex-chat`, `nex-terminal`, and `nex-editor`.

```javascript
const clean = NexSanitizer.sanitize('<img src=x onerror=alert(1)>'); // returns safe text
```

---

### W. `<nex-jwt>` (JWT Guard) 🔐
**Attributes:** `storage` (`session` | `local`), `check-interval` (seconds, default: 30)
**Methods:** `setToken(jwt)`, `getToken()`, `getPayload()`, `isExpired()`, `clearToken()`, `getRemainingSeconds()`
**Events (bubbles+composed):** `nex-session-expired`, `nex-token-set`, `nex-token-invalid`

```html
<nex-jwt id="jwt" storage="session" check-interval="60"></nex-jwt>
<script>
  jwt.setToken(accessToken);
  document.addEventListener('nex-session-expired', () => location.href = '/login');

  console.log(jwt.getPayload());          // { sub: "user123", exp: 1720000000, ... }
  console.log(jwt.getRemainingSeconds()); // 3542
</script>
```

---

### X. `<nex-honeypot>` (Bot Trap) 🔐
**Attributes:** `min-time` (ms, default: 1500)
**Methods:** `inject(form)`, `isHuman(form)`, `reset()`
**Events:** `nex-bot-detected` — detail: `{ reasons, elapsed, userAgent }`

```html
<nex-honeypot id="hp" min-time="1500"></nex-honeypot>
<script>
  hp.inject(document.querySelector('form'));
  form.addEventListener('submit', e => {
    if (!hp.isHuman(form)) {
      e.preventDefault(); // silently reject bot
    }
  });
</script>
```

Detection checks:
- Honeypot fields filled by bots
- Form submitted in < 1.5s (configurable)
- No mouse movement detected (headless browser)
- Known bot user agents (Puppeteer, Selenium, PhantomJS, etc.)

---

### Y. `<nex-idle>` (Idle Timeout) 🔐
**Attributes:** `timeout` (seconds, default: 300), `warn-at` (seconds before timeout, default: 30)
**Methods:** `getIdleSeconds()`, `resetTimer()`, `isIdle()`
**Events (bubbles+composed):** `nex-idle-warning`, `nex-idle`, `nex-active`

```html
<nex-idle id="idleGuard" timeout="300" warn-at="30"></nex-idle>
<script>
  document.addEventListener('nex-idle-warning', e =>
    showAlert(`Session expires in ${e.detail.remaining}s`)
  );
  document.addEventListener('nex-idle', () => {
    jwtGuard.clearToken(); // chain with nex-jwt
    location.href = '/login';
  });
</script>
```

---

### Z. `<nex-frame-guard>` (Clickjacking Shield) 🔐
**Attributes:** `action` — `"blur"` (default overlay) | `"breakout"` (force top navigation) | `"none"` (event only)
**Events:** `nex-frame-attack` — detail: `{ action, parentOrigin, url }`

```html
<nex-frame-guard action="blur"></nex-frame-guard>
```

---

### AA. `<nex-mask>` (Data Masker) 🔐
**Attributes:** `type` (`token` | `card` | `otp` | `key` | `password`), `reveal-timeout` (seconds), `mask-char`
**Events:** `nex-mask-revealed`, `nex-mask-hidden`

```html
<!-- API key: shows sk-abc•••••••xyz -->
<nex-mask type="token" reveal-timeout="5">sk-abc123xyz789</nex-mask>

<!-- Card: shows •••• •••• •••• 1111 -->
<nex-mask type="card">4111 1111 1111 1111</nex-mask>

<!-- OTP: shows ••••••, auto-hides after 3s -->
<nex-mask type="otp" reveal-timeout="3">483920</nex-mask>
```

---

### AB. `<nex-proto-guard>` (Prototype Pollution Guard) 🔐
**Attributes:** `freeze` (locks `Object.prototype`), `warn` (console warnings)
**Events:** `nex-proto-violation` — detail: `{ key, depth, value }`

```html
<!-- Load this FIRST, before any third-party scripts -->
<nex-proto-guard freeze warn></nex-proto-guard>
```

Intercepts `JSON.parse` to detect `__proto__`, `constructor`, `prototype` injection.

---

### AC. `<nex-integrity>` (SRI Monitor) 🔐
**Attributes:** `monitor` (enable observer), `warn` (console log), `strict` (remove offending assets)
**Events:** `nex-integrity-violation` — detail: `{ tag, url, action }`

```html
<nex-integrity monitor warn></nex-integrity>
<!-- In strict mode, removes external scripts loaded without integrity hashes -->
<nex-integrity monitor warn strict></nex-integrity>
```

---

### AD. `<nex-https>` (Protocol Enforcer) 🔐
**Attributes:** `action` (`warn` | `redirect`), `banner`, `mixed`
**Events:** `nex-http-detected`, `nex-mixed-content`

```html
<nex-https action="warn" banner mixed></nex-https>
<!-- On HTTP pages: shows sticky red banner + fires event -->
<!-- mixed: scans for HTTP resources on HTTPS pages -->
```

---

### AE. `<nex-clipboard>` (Paste Sanitizer) 🔐
**Attributes:** `guard` (CSS selector, default: `input, textarea`), `max-len`, `block-copy`
**Events:** `nex-paste-sanitized`, `nex-paste-blocked`, `nex-copy-blocked`

```html
<nex-clipboard guard="#chat-input, #terminal-input" max-len="2000"></nex-clipboard>

<!-- Block copying API keys from display elements -->
<nex-clipboard block-copy=".api-key-display"></nex-clipboard>
```

---

## 6. Integration Best Practices

### Global CSS Theme Engine
All visual components read CSS variables at `:host` level:

```css
body {
  --nex-primary: #00f2ff; /* Neon cyan */
  --nex-accent:  #ff007f; /* Fuchsia    */
  --nex-bg:      #070711; /* Dark void  */
  --nex-glow:    rgba(0, 242, 255, 0.2);
}
```

### Performance
*   Use `loading="lazy"` on all off-screen `<nex-image>` elements.
*   Components auto-teardown (XHR, timers, observers) on `disconnectedCallback`.
*   Load `nex-analytics` in `<head>` before other components.

### Security
*   Load `<nex-proto-guard freeze>` **before** any third-party scripts.
*   Always use `encryption` on `<nex-storage>` for sensitive session data.
*   Pair `<nex-jwt>` + `<nex-idle>` for complete auto-logout coverage.
*   Use `magic-verify` on `<nex-upload>` whenever file types matter.
*   Add `<nex-honeypot>` to every public-facing form.
*   Prefer `@v1.6.0` pin over `@latest` in production.

### Accessibility
*   `<nex-stream>` player supports keyboard operations when focused (`tabindex="0"`).
*   Modal dialogs restore focus to the triggering element on close.

---

## 7. Versioning & Migration

NEX SDK follows Semantic Versioning (`MAJOR.MINOR.PATCH`):

| Release | Highlights |
|:---|:---|
| **v1.6.0** | 8 new security packages (honeypot, idle, frame-guard, mask, proto-guard, integrity, https, clipboard) |
| **v1.5.0** | AES-256-GCM storage, magic number upload verify, 5-level auth strength, rate limiter, nex-jwt |
| **v1.4.0** | NexSanitizer XSS shield, nex-chat/terminal/editor hardened |
| **v1.3.0** | nex-auth, nex-storage, nex-network |
| **v1.0.0** | Initial release (15 UI components) |

*   **Patch `1.x.y`**: Bug fixes only. Safe to auto-update.
*   **Minor `1.x.0`**: New components/attributes. No breaking changes.
*   **Major `x.0.0`**: Breaking changes. Check migration notes.

---

## License

MIT © 2026 NEX SDK Contributors
