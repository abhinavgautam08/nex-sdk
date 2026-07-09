# NEX SDK (v1.0.0)

A lightweight, framework-independent, performance-optimized Web Component developer toolkit designed with a gorgeous neon cyberpunk aesthetic. Natively encapsulated using Shadow DOM, compatible with any HTML website, and fully ready for GitHub and jsDelivr CDN delivery.

---

## 1. Project Overview & Core Features

NEX SDK provides modern, high-performance UI blocks and telemetry capabilities without the weight of modern framework runtimes. Key highlights:
*   **Shadow DOM Isolated**: Restricts styles internally. Zero clashing or pollution of your parent document stylesheets.
*   **Zero Dependencies**: Written in pure ES6 Javascript; requires no build tools or package managers.
*   **Lightweight Footprint**: The entire minified SDK totals less than 79 KB (~23 KB Gzipped).
*   **High Performance**: Utilizes lazy initialization, lazy loading, asynchronous CDN loading for heavy libraries, and active memory leak cleanup.

---

## 2. Component Reference Table

| Component Name | Description / Purpose | Key Attributes | Main Events / JS API | Browser Support |
|:---|:---|:---|:---|:---|
| **`<nex-stream>`** | HLS/MP4 cyberpunk media player | `src`, `poster`, `logo`, `autoplay`, `muted`, `playsinline` | `play()`, `pause()`, `togglePlay()`, `toggleMute()` | Chrome 67+, Firefox 63+, Safari 10.1+, Edge 79+ |
| **`<nex-image>`** | Lazy-loading responsive image element | `src`, `srcset`, `sizes`, `alt`, `loading`, `fallback` | Events: `load`, `error` | Chrome 67+, Firefox 63+, Safari 10.1+, Edge 79+ |
| **`<nex-file>`** | Video/Image/PDF/Generic metadata card | `src`, `name`, `size`, `type` | Event: `download` | Chrome 67+, Firefox 63+, Safari 10.1+, Edge 79+ |
| **`<nex-upload>`** | Drag & drop uploader with validation | `endpoint`, `multiple`, `accept`, `max-size`, `auto-upload` | Events: `file-added`, `upload-start`, `upload-progress`, `upload-success`, `upload-error` | Chrome 67+, Firefox 63+, Safari 10.1+, Edge 79+ |
| **`<nex-ui>`** *(bundle)* | Buttons, Cards, Loaders, Toasts & Modals | `<nex-button>`, `<nex-card>`, `<nex-loader>`, `<nex-modal>`, `<nex-toast>` | `modal.openModal()`, `modal.close()`, `window.showNexToast()` | Chrome 67+, Firefox 63+, Safari 10.1+, Edge 79+ |
| **`NexAnalytics`** | Telemetry and event tracking engine | Config options: `endpoint`, `app`, `debug` | `track()`, `trackPageView()`, `destroy()` | Chrome 67+, Firefox 63+, Safari 10.1+, Edge 79+ |

---

## 3. CDN Installation & Version Pinning

Load any component directly on your website using a `<script>` tag from the jsDelivr CDN:

```html
<!-- Video Player -->
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.0.0/packages/nex-stream/nex-stream.min.js"></script>

<!-- Lazy Image -->
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.0.0/packages/nex-image/nex-image.min.js"></script>

<!-- File Card Previewer -->
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.0.0/packages/nex-file/nex-file.min.js"></script>

<!-- Drag & Drop Uploader -->
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.0.0/packages/nex-upload/nex-upload.min.js"></script>

<!-- UI Elements Bundle -->
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.0.0/packages/nex-ui/nex-ui.min.js"></script>

<!-- Telemetry Analytics -->
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.0.0/packages/nex-analytics/nex-analytics.min.js"></script>
```

### Version Pinning Strategies (Production Best Practice)
Always pin versions in production to avoid unexpected breaking changes:
*   **Exact Patch Pin (Safest for Production)**: `abhinavgautam08/nex-sdk@v1.0.0`
*   **Minor Version Pin (Auto Patch Updates)**: `abhinavgautam08/nex-sdk@v1.0`
*   **Major Version Pin (Auto Minor & Patch Updates)**: `abhinavgautam08/nex-sdk@v1`
*   **Latest (Unstable, Staging Only)**: `abhinavgautam08/nex-sdk@latest`

---

## 4. AI-Friendly API Reference & Copy-Paste Snippets

*This section provides complete specifications for developers and AI code assistants to write functional code integrations.*

### A. `<nex-stream>` (Video Player)
**HTML Attributes:**
*   `src` (String): Source path (MP4, WebM, or HLS `.m3u8` streams).
*   `poster` (String): Thumbnail preview image URL.
*   `logo` (String): Top-left watermark overlay logo. Defaults to a standard relative logo path.
*   `autoplay` (Boolean): Plays automatically. *Requires element to be muted in most browsers.*
*   `muted` (Boolean): Mutes audio output.
*   `playsinline` (Boolean): Plays inline on mobile layouts (prevents iOS native player takeoff).

**JavaScript Methods:**
*   `play()`: Programmatic play.
*   `pause()`: Programmatic pause.
*   `togglePlay()`: Toggles playback state.
*   `toggleMute()`: Toggles muted/unmuted state.
*   `toggleFullscreen()`: Toggles fullscreen player overlay.
*   `loadSource(url: string)`: Dynamic media URL source swap.

**Copy-Paste Template:**
```html
<nex-stream 
  id="myPlayer"
  src="https://upload.wikimedia.org/wikipedia/commons/3/37/Crossing_the_Line.webm"
  poster="https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Crossing_the_Line.webm/640px--Crossing_the_Line.webm.jpg"
  autoplay muted playsinline>
</nex-stream>
<script>
  const player = document.getElementById('myPlayer');
  // Example call
  player.addEventListener('click', () => player.togglePlay());
</script>
```

### B. `<nex-image>` (Responsive Lazy Image)
**HTML Attributes:**
*   `src` (String): Path to primary image file.
*   `srcset` (String): Responsive source mappings (e.g. `small.jpg 400w, large.jpg 800w`).
*   `sizes` (String): Layout breakpoints (e.g. `(max-width: 600px) 100vw, 800px`).
*   `alt` (String): Image description for accessibility.
*   `loading` (String): Set to `lazy` to activate IntersectionObserver deferred loading.
*   `fallback` (String): Alternative image path loaded if primary `src` fails (HTTP 4xx/5xx).

**Custom Events:**
*   `load`: Detail: `{ src }` — Fired on successful load.
*   `error`: Detail: `{ src }` — Fired on loading error.

**Copy-Paste Template:**
```html
<nex-image 
  src="https://example.com/neon-artwork.png" 
  srcset="https://example.com/neon-320.png 320w, https://example.com/neon-800.png 800w"
  sizes="(max-width: 600px) 100vw, 800px"
  alt="Cyber Grid Landscape"
  loading="lazy"
  fallback="https://example.com/fallback-placeholder.png">
</nex-image>
```

### C. `<nex-file>` (File Preview Card)
**HTML Attributes:**
*   `src` (String): File path.
*   `name` (String): Filename override (defaults to parsing path suffix).
*   `size` (Number): File size in bytes. Component formats this value automatically.
*   `type` (String): Preview formatting. Options: `image`, `video`, `pdf`, `generic`. Auto-detected on omission.

**Custom Events:**
*   `download`: Detail: `{ src, name }` — Dispatched when clicking the download trigger.

**Copy-Paste Template:**
```html
<nex-file 
  src="https://example.com/clearance-credentials.pdf" 
  name="SECURITY_CLEARANCE.PDF"
  size="2097152" 
  type="pdf">
</nex-file>
```

### D. `<nex-upload>` (File Uploader Portal)
**HTML Attributes:**
*   `endpoint` (String): Target POST upload endpoint URL. *Omit to run in Mock Sandbox mode.*
*   `multiple` (Boolean): If present, users can queue multiple files.
*   `accept` (String): Permitted file types (e.g. `image/*,application/pdf`).
*   `max-size` (Number): Max allowed size limit in bytes.
*   `auto-upload` (Boolean): Automatically starts uploads on file drop/select.

**Custom Events:**
*   `file-added`: Detail: `{ file, error }` — File enters selection list.
*   `upload-start`: Detail: `{ file }` — File upload handoff initiates.
*   `upload-progress`: Detail: `{ file, progress }` — Progress value (0-100).
*   `upload-success`: Detail: `{ file, response }` — HTTP status 2xx success.
*   `upload-error`: Detail: `{ file, error }` — Handoff failed.

**Copy-Paste Template:**
```html
<nex-upload 
  id="myUploader"
  endpoint="https://api.example.com/upload"
  accept="image/*"
  max-size="5242880"
  multiple>
</nex-upload>
<script>
  const uploader = document.getElementById('myUploader');
  uploader.addEventListener('upload-success', (e) => {
    console.log('Upload complete for file:', e.detail.file.name);
  });
</script>
```

### E. `<nex-ui>` (Cyber UI Elements Bundle)
This bundle registers 5 individual components:
1.  **`<nex-button>`**: Custom click trigger.
    *   Attributes: `type` (`primary`, `secondary`, `outline`, `fuchsia`, `lime`), `size` (`sm`, `md`, `lg`), `disabled`, `loading`.
2.  **`<nex-card>`**: Panel container.
    *   Attributes: `title` (header string).
3.  **`<nex-loader>`**: Spinner/Progress loaders.
    *   Attributes: `type` (`spinner`, `progress`), `text` (status label).
4.  **`<nex-modal>`**: Overlays with glass blurs.
    *   Attributes: `title`, `open`.
    *   JS API: `modal.openModal()`, `modal.close()`.
    *   Events: `open`, `close`.
5.  **`<nex-toast>`**: central overlay system manager.
    *   JS API: `window.showNexToast(message, type, duration)`.

**Copy-Paste Template:**
```html
<nex-card title="DATABASE_UPLINK">
  <nex-loader type="progress" text="SYNCHRONIZING..."></nex-loader>
  <div style="margin-top: 15px;">
    <nex-button id="triggerModal" type="fuchsia">Emergency Override</nex-button>
  </div>
</nex-card>

<nex-modal id="overrideModal" title="WARNING_PROTOCOL_V4">
  <p>Trigger system purge sequence?</p>
  <nex-button id="confirmBtn" type="lime">Execute</nex-button>
  <nex-button id="cancelBtn" type="outline">Abort</nex-button>
</nex-modal>

<script>
  const modal = document.getElementById('overrideModal');
  document.getElementById('triggerModal').addEventListener('click', () => modal.openModal());
  document.getElementById('cancelBtn').addEventListener('click', () => modal.close());
  document.getElementById('confirmBtn').addEventListener('click', () => {
    modal.close();
    window.showNexToast('Override activated!', 'success', 3000);
  });
</script>
```

### F. `NexAnalytics` (Telemetry Client)
**Initialization Options:**
```javascript
new NexAnalytics({
  endpoint: string,  // Telemetry collector POST endpoint. Omit for console debug.
  app: string,       // Application signature string.
  debug: boolean     // Logs event payloads to developer console.
});
```

**JavaScript API Methods:**
*   `track(category: string, action: string, label?: string, value?: number, extra?: object)`: Log custom events.
*   `trackPageView()`: Trigger dynamic route logging (automatically binds on popstate).
*   `destroy()`: Safe teardown. Unbinds all global window/document routing and shadow event listeners.

**Copy-Paste Template:**
```html
<script>
  const tracker = new NexAnalytics({
    endpoint: 'https://api.example.com/collect',
    app: 'CLIENT_PORTAL',
    debug: true
  });

  // Track button click
  document.getElementById('myButton').addEventListener('click', () => {
    tracker.track('interactive', 'click', 'myButton_signature');
  });
</script>
```

---

## 5. Integration Best Practices

### Performance Optimization
*   **Use `loading="lazy"`**: Always apply the `loading="lazy"` attribute on `<nex-image>` elements that appear off-screen to improve core web vitals score.
*   **Unmount Elements Safely**: Components are engineered to automatically tear down active tasks (XHR queues, timers, observers) upon removal. If you dynamically remove elements, trust browser garbage collection to clean up.
*   **Initialize Telemetry Early**: Load the `nex-analytics` script in the `<head>` of your document before elements are registered. This ensures automatic scan detectors can capture the initial component inventory correctly.

### Accessibility (a11y)
*   **Keyboard Operations**: When focusing on the `<nex-stream>` player container, keyboard operations are active automatically. Maintain the default `tabindex="0"` focus outline to ensure visible focus states.
*   **Focus Restoration**: Modal dialogs automatically remember the triggering element and restore focus on close. Do not manually focus external elements during modal transitions.

### Security
*   **CORS Settings**: Telemetry beacons and upload portals rely on XMLHttpRequests and standard fetches. Ensure that your remote API endpoints publish robust `Access-Control-Allow-Origin` CORS headers.
*   **Safe HTML Insertion**: In `<nex-modal>` and `<nex-card>` title attributes, avoid passing unescaped HTML characters to prevent rendering truncations. Use clean text titles.

---

## 6. Versioning & Migration Guidance

NEX SDK adheres strictly to Semantic Versioning (`MAJOR.MINOR.PATCH`):
*   **Patch updates (`1.0.x`)**: Contain minor bug fixes or compatibility updates. Safely upgrade by pinning to `@v1.0` or `@v1`.
*   **Minor updates (`1.x.0`)**: Bring new attributes or components without modifying existing attributes. No code refactoring required.
*   **Major updates (`x.0.0`)**: Introduce breaking changes. Check the migration changelogs if upgrading between major releases (e.g. migrating from `v1` to `v2`).

---

## License

MIT © 2026 NEX SDK Contributors
