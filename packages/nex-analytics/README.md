# `nex-analytics` Cyberpunk Telemetry SDK

`nex-analytics` is a lightweight, non-blocking telemetry tracker utility designed to log page views, dynamic route transitions, custom elements usage, and media player events.

---

## Features
*   **Automatic Page View Tracking**: Tracks standard landing entry and SPA route changes (`popstate`, `hashchange`) automatically.
*   **Decoupled Component Telemetry**: Intercepts bubbled and composed `nex-analytics-event` Custom Events dispatched across Shadow DOM boundaries by other components.
*   **Initialization Scan**: Automatically detects and counts `<nex-stream>`, `<nex-image>`, `<nex-file>`, and `<nex-upload>` elements present on load.
*   **Non-Blocking Beacon Delivery**: Transmits JSON telemetry payloads using the high-performance `navigator.sendBeacon` API, falling back to a resilient keepalive fetch request on older browsers.

---

## Setup & Initialization

Include the script inside your HTML body and instantiate the global tracker object:

```html
<!-- Self-hosted local link -->
<script src="packages/nex-analytics/nex-analytics.min.js"></script>

<!-- Or via jsDelivr CDN -->
<script src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/nex-sdk@v1.0.0/packages/nex-analytics/nex-analytics.min.js"></script>
<script>
  // Instantiate the analytics client
  const tracker = new NexAnalytics({
    endpoint: 'https://api.example.com/telemetry', // Remote telemetry logger URL
    app: 'NEX_PORTAL_SANDBOX',                     // Identifier for your project
    debug: true                                    // Logs telemetry in developer console
  });
</script>
```

*Note: If no `endpoint` is provided, the tracker logs events to the browser console (if `debug: true`) without dispatching network calls, which is ideal for offline staging/testing.*

---

## JS API

### `tracker.track(category, action, [label], [value], [extra])`
Manually logs custom actions:
```javascript
tracker.track('user-action', 'click-pricing', 'pricing-plan-pro');
```

---

## Standard Logged Data Payload

Every tracking payload automatically records local client metadata:

```json
{
  "app": "NEX_PORTAL_SANDBOX",
  "session": "sess-r82nz9q1n-178358485203",
  "category": "video",
  "action": "play",
  "label": "https://example.com/stream.m3u8",
  "value": null,
  "timestamp": "2026-07-09T09:50:31.902Z",
  "screen": "1920x1080",
  "language": "en-US"
}
```
