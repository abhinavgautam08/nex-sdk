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
