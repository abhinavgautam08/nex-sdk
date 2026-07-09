# Changelog

All notable changes to **NEX SDK** are documented in this file.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

_Planned for future releases:_
- `<nex-avatar>` — User identity badge with animated glitch frames
- `nex-crypto.js` — Client-side SHA-256 / base64 utility wrapper

---

## [1.6.0] — 2026-07-09

### Added (8 New Security Packages)
- **nex-honeypot** *(NEW)*: Bot & spam trap. Injects invisible decoy fields bots fill; detects fast-submissions (<1.5s), no mouse movement, and headless browser UAs. `inject(form)` + `isHuman(form)` API. Fires `nex-bot-detected`.
- **nex-idle** *(NEW)*: Idle session timeout guard. Tracks mouse/keyboard/scroll/touch inactivity across 7 event types. Fires `nex-idle-warning` (N seconds before timeout) and `nex-idle` at threshold. Attributes: `timeout`, `warn-at`.
- **nex-frame-guard** *(NEW)*: Clickjacking shield. Detects cross-origin iframe embedding via `window.self !== window.top`. Actions: `blur` (blocking overlay), `breakout` (force top navigation), `none` (event only). Fires `nex-frame-attack`.
- **nex-mask** *(NEW)*: Sensitive data auto-masker. Displays `••••••••` for tokens/cards/OTPs/keys. Reveals on click with configurable auto-hide timer. Types: `token`, `card`, `otp`, `key`, `password`. Fires `nex-mask-revealed`, `nex-mask-hidden`.
- **nex-proto-guard** *(NEW)*: Prototype pollution detector. Patches `JSON.parse` to scan for `__proto__`, `constructor`, `prototype` injection. Optional `freeze` attribute locks `Object.prototype`. Fires `nex-proto-violation`.
- **nex-integrity** *(NEW)*: SRI (Subresource Integrity) monitor. Watches DOM for external `<script>` / `<link>` tags loaded without `integrity` hashes via `MutationObserver`. `strict` attribute removes offending assets. Fires `nex-integrity-violation`.
- **nex-https** *(NEW)*: Protocol enforcer. Detects HTTP pages and mixed-content resources. Actions: `warn` | `redirect`. Optional sticky `banner` UI. Fires `nex-http-detected`, `nex-mixed-content`.
- **nex-clipboard** *(NEW)*: Paste sanitizer. Intercepts `paste` events on guarded inputs, sanitizes via `NexSanitizer` (or fallback), enforces `max-len`. Blocks copy from sensitive elements via `block-copy`. Fires `nex-paste-sanitized`, `nex-paste-blocked`, `nex-copy-blocked`.

---

## [1.5.0] — 2026-07-09

### Added
- **nex-storage**: Replaced weak `btoa/atob` base64 encoding with real **AES-256-GCM** encryption via `window.crypto.subtle`. Key derived via PBKDF2 (100,000 iterations, SHA-256), domain-bound passphrase, random IV per write.
- **nex-upload**: Added `magic-verify` attribute opt-in for **magic number file header verification**. Reads first 16 bytes of every file; blocks EXE/ELF/Mach-O/shell scripts unconditionally; detects extension spoofing on PNG/JPEG/GIF/PDF/ZIP/MP4/MP3/WEBP/BMP. Fires `file-spoofed` event on mismatch.
- **nex-auth**: Upgraded password strength meter to 5 levels (CRITICAL / WEAK / MODERATE / STRONG / FORTRESS). Added `min-strength` attribute to block weak passwords. Added exponential backoff **rate limiter** (3 fails=15s, 5 fails=60s, 7+=300s lockout) with visual countdown. New events: `auth-locked`, `auth-rate-limited`, `auth-weak-password`. New public method: `triggerFailure()`.
- **nex-jwt** *(NEW)*: Standalone `<nex-jwt>` Web Component for JWT token lifecycle management. API: `setToken()`, `getToken()`, `getPayload()`, `isExpired()`, `clearToken()`, `getRemainingSeconds()`. Auto-checks expiry every `check-interval` seconds (default 30). Fires `nex-session-expired` (bubbles + composed) on expiry.

### Changed
- `nex-storage.set()` and `nex-storage.get()` are now `async` when `encryption` attribute is present.
- `nex-upload.handleFiles()` is now `async` when `magic-verify` attribute is present.

---

## [1.4.0] — 2026-07-09

### Added
- **nex-sanitizer**: Standalone client-side HTML sanitization module to recursively remove unsafe tags (like `<script>`, `<iframe>`, `<object>`), event handlers (like `onerror`, `onload`), and suspicious URL schemes (like `javascript:`).
- **nex-chat Integration**: Integrated `NexSanitizer` to sanitize message bubble text values. Falls back to stripping HTML if sanitizer is not imported.
- **nex-terminal Integration**: Integrated `NexSanitizer` to sanitize printed terminal command logs.
- **nex-editor Integration**: Integrated `NexSanitizer` to sanitize content fetched via `.getHtml()` and loaded via `.setMarkdown()`.

---

## [1.3.2] — 2026-07-09

### Fixed
- **nex-loader Spinner**: Added the brand logo to the center of the loading spinner circle, keeping it upright while the outer border rotates.

---

## [1.3.1] — 2026-07-09

### Fixed
- **nex-upload Dropzone**: Styled the inner dropzone dashed container (`.nex-upload-dropzone`) to render with a matching top-right corner slanted cut (`clip-path`), aligning it parallel to the outer container frame cut.

---

## [1.3.0] — 2026-07-09

### Added
- **12 New Standalone Cyberpunk Web Components**:
  - `nex-auth` (`<nex-auth>`): Login/Register gate UI with password strength indicator and social login controls mockup.
  - `nex-chat` (`<nex-chat>`): Full chat bubble terminal featuring emoji select panels, typing status, file attachments previews, and waveform voice visualizer.
  - `nex-notification` (`<nex-notification>`): Global queue-managed toast alert system.
  - `nex-payment` (`<nex-payment>`): Billing checkout panel simulating credit card graphics updates, UPI, and wallets.
  - `nex-editor` (`<nex-editor>`): Rich text markdown WYSIWYG text editor.
  - `nex-qr` (`<nex-qr>`): Lightweight canvas QR code matrix generator.
  - `nex-camera` (`<nex-camera>`): getUserMedia media stream viewport helper.
  - `nex-scanner` (`<nex-scanner>`): Scan alignment laser grids.
  - `nex-share` (`<nex-share>`): Native sharing triggers & copy URL widget.
  - `nex-theme` (`<nex-theme>`): LocalStorage-backed light/dark theme switcher.
  - `nex-storage` (`<nex-storage>`): Utility component wrapping Web Storage.
  - `nex-network` (`<nex-network>`): Live network latency monitoring.

---

## [1.2.2] — 2026-07-09

### Added
- **nex-image Cyber Frame**: Styled the image element container to render with a matching top-right corner slanted cut (`clip-path`), aligning the static picture viewport style with the `<nex-stream>` video player viewport.

---

## [1.2.1] — 2026-07-09

### Fixed
- **nex-analytics**: Removed ES6 export statements from build outputs, correcting `Uncaught SyntaxError: Unexpected token 'export'` on pages loading the library via standard non-module script tags.

---

## [1.2.0] — 2026-07-09

### Added
- **Global Theme Engine (CSS Custom Properties)**: Refactored all 8 visual components to dynamically resolve color tokens (`--nex-primary`, `--nex-accent`, `--nex-bg`, and `--nex-glow`) with fallback defaults, enabling dynamic branding overrides.
- **Canvas Dynamic Rendering**: Configured `<nex-chart>` to dynamically lookup the computed style values of `--nex-primary` and `--nex-accent` on rendering cycles.

---

## [1.1.0] — 2026-07-09

### Added
- `<nex-terminal>` v1.1.0 — Monospaced green neon CLI shell simulator with mock actions command-line interface.
- `<nex-chart>` v1.1.0 — HTML5 Canvas neon-glowing telemetry visualizer plotting real-time line/bar data.
- `<nex-router>` v1.1.0 — Cyberpunk tab navigation controller displaying digital tab selections with glitch animations.

---

## [1.0.0] — 2026-07-09

### Added — Initial public release of the complete NEX SDK toolkit

**`nex-stream` v1.0.0**
- HLS/MP4/WebM video player as a Shadow DOM Web Component
- Custom controls: play/pause, seek, volume, fullscreen, PiP, skip ±10s
- Loading, error, and buffering overlay states
- HLS.js on-demand CDN loading for `.m3u8` streams
- Custom logo badge via `logo` attribute

**`nex-image` v1.0.0**
- Lazy-loading responsive image Web Component
- IntersectionObserver-based deferred loading
- Skeleton shimmer animation during fetch
- Error state with inline SVG fallback icon
- `srcset` / `sizes` / `fallback` attribute support

**`nex-file` v1.0.0**
- File preview card supporting images, video loops, PDFs, and generic files
- Formatted file metadata display (size, type, name)
- Direct download trigger button with Custom Event dispatch

**`nex-upload` v1.0.0**
- Drag-and-drop file uploader with queue panel
- File type and size validation with error state indicators
- XHR upload with real-time progress bars
- Mock sandbox upload mode (no endpoint required)
- 5 Custom Events for upload lifecycle integration

**`nex-analytics` v1.0.0**
- Lightweight page view and SPA route tracking
- Component presence scan on initialization
- `navigator.sendBeacon` delivery with `fetch` fallback
- Cross-Shadow DOM event interception

**`nex-ui` v1.0.0**
- `<nex-button>`: 5 color types, 3 sizes, disabled/loading states
- `<nex-modal>`: Glassmorphic overlay with JS API and Custom Events
- `<nex-toast>`: Global popup manager with `window.showNexToast()` helper
- `<nex-loader>`: Spinner and progress bar variants
- `<nex-card>`: Diagonal clip-path panels with glowing corners

---

[Unreleased]: https://github.com/user/nex-sdk/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/user/nex-sdk/releases/tag/v1.0.0
