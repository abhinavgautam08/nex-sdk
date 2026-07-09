# `<nex-router>` Cyberpunk Glitch Tab Navigation Web Component

`nex-router` is a framework-independent digital tab navigation header component. Features digital glitch flash click animations, glowing borders, active element indicator overlays, and automated view panel toggle handlers.

---

## Features
*   **Shadow DOM Encapsulated**: Restricts layout and styles internally. Will not clash with parent document templates.
*   **Digital Glitch Transitions**: Triggers animated digital glitch effects on tab selection transitions.
*   **Automated Pane Toggles**: Looks up elements in the document matching active tab IDs and displays them while hiding the others (using `.hidden` classes).
*   **Watermark Logo Branding**: Encapsulates a subtle inline brand logo watermark.

---

## Attributes Configuration

The component observes the following standard HTML attributes:

| Attribute | Type | Description |
| :--- | :--- | :--- |
| `tabs` | `String` | Semicolon-separated tab pairs (`Label:id;Label:id`). Defaults to `PORTAL:portal;DATA:data;SHELL:shell`. |
| `active-tab` | `String` | Currently active tab ID. |
| `logo` | `String` | Path to custom brand logo overlay. |

---

## Example Usage

### 1. Basic Glitch Router Navigation
```html
<nex-router tabs="HOME:homeTab;UPLINKS:uplinksTab;TELEMETRY:telemetryTab" active-tab="homeTab"></nex-router>

<div id="homeTab">Home Content...</div>
<div id="uplinksTab" class="hidden">Uplink logs...</div>
<div id="telemetryTab" class="hidden">Telemetry stats...</div>
```

### 2. CDN jsDelivr Link Loading
```html
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.1.0/packages/nex-router/nex-router.min.js"></script>
```

---

## Custom Events

| Event Name | Detail | Description |
| :--- | :--- | :--- |
| `tab-change` | `{ tabId: String, label: String }` | Dispatched immediately after a user selects a tab. |
