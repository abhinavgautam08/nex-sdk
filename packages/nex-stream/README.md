# `<nex-stream>` Cyberpunk Video Player Web Component

`nex-stream` is a lightweight, framework-independent, Shadow-DOM isolated custom HTML5 video player styled with a gorgeous cyberpunk neo-dark aesthetic.

It natively supports standard video files (`.mp4`, `.webm`) and dynamically handles HTTP Live Streaming (HLS `.m3u8` playlists) using **HLS.js**.

---

## Features

*   **Shadow DOM Encapsulation**: Complete isolation of styles. Will not pollute or clash with your existing website's CSS.
*   **Dynamic HLS Streaming**: Detects `.m3u8` streams and auto-loads `hls.js` from CDN (on-demand), maintaining a zero-dependency footprint for standard MP4s.
*   **Cyberpunk UI Theme**: Beautiful glowing neon controls, a futuristic custom seek track, overlay states, and clean transitions.
*   **Fully Responsive**: Aspect ratio responsive, layout-adaptive, and fully optimized for mobile devices.
*   **Custom Control Suite**:
    *   Play / Pause (Single-click / Toggle)
    *   Progress Seek bar (Click or drag tracking)
    *   Volume Mute Toggle & Range Slider
    *   Futuristic Time counter (`00:00 / 00:00`)
    *   Interactive Picture-in-Picture (PiP)
    *   Double-click to toggle Fullscreen (Requests full screen on player container to preserve controls)
    *   Fast-forward / Rewind 10 seconds controls
*   **Offline SVG Design**: No external font icons or CSS styling sheets required; completely self-contained vector graphics.

---

## Structure

```text
nex-sdk/
 └── packages/
      └── nex-stream/
           ├── nex-stream.js       # Developer Version (Readable Source)
           ├── nex-stream.min.js   # Minified Production Bundle
           └── README.md           # Documentation
```

---

## Installation & Setup

### 1. Load the Script

Include the script tag on your HTML page (either the dev version or the minified distribution):

```html
<!-- Self-hosted local link -->
<script src="packages/nex-stream/nex-stream.min.js"></script>

<!-- Or via jsDelivr CDN -->
<script src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/nex-sdk@v1.0.0/packages/nex-stream/nex-stream.min.js"></script>
```

### 2. Add the custom element

Place the `<nex-stream>` tag anywhere in your markup:

```html
<nex-stream 
  src="https://example.com/stream.m3u8"
  poster="https://example.com/thumbnail.webp"
  autoplay
  muted
  playsinline>
</nex-stream>
```

---

## Attributes Configuration

The component observes the following standard HTML attributes:

| Attribute | Type | Description |
| :--- | :--- | :--- |
| `src` | `String` | Source URL of the video (MP4, WebM, or HLS `.m3u8` stream). |
| `poster` | `String` | URL of the thumbnail preview image shown before playback starts. |
| `autoplay` | `Boolean` | If present, the video plays automatically as soon as it can (subject to browser permissions). |
| `muted` | `Boolean` | If present, initializes the video in muted state. |
| `playsinline`| `Boolean` | If present, handles inline playback on mobile devices (prevents opening native fullscreen player on iOS). |
| `volume` | `Number` | A float value between `0.0` and `1.0` representing default volume state. |

---

## Javascript API

You can query the element and trigger methods or register listeners just like a standard `<video>` node:

```javascript
const player = document.querySelector('nex-stream');

// Methods
player.togglePlay();      // Toggles play/pause state
player.toggleMute();      // Toggles muted/unmuted state
player.toggleFullscreen();// Toggles fullscreen mode
player.loadSource(url);   // Programmatically loads a new media URL

// Access internal elements (if needed)
const videoNode = player.video; // Access underlying HTMLVideoElement
```

---

## Styling Customization

To constrain the height or width of the player, simply style the outer `<nex-stream>` host element:

```css
nex-stream {
  max-width: 800px;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
}
```
