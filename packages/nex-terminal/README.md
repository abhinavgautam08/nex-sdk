# `<nex-terminal>` Cyberpunk Terminal Simulator Web Component

`nex-terminal` is a framework-independent, monospaced terminal shell simulator styled with a gorgeous scanning green neon CRT theme. It supports interactive mock directives, history traversal, custom styling, and custom event dispatches on command executions.

---

## Features
*   **Shadow DOM Encapsulated**: Restricts layout and styles internally. Will not clash with parent document templates.
*   **Interactive Command Shell**: Processes input directives with blinking terminal cursors.
*   **Command History**: Traverses previously run commands using standard `ArrowUp` and `ArrowDown` navigation.
*   **Mock Commands Suite**: Supports built-in client directives (`help`, `clear`, `sysinfo`, `ping`, `status`).
*   **Watermark Logo Branding**: Encapsulates a subtle inline brand logo watermark.

---

## Attributes Configuration

The component observes the following standard HTML attributes:

| Attribute | Type | Description |
| :--- | :--- | :--- |
| `title` | `String` | Header title displayed in top-left bar (e.g. `NEX_OS_TERMINAL`). |
| `placeholder` | `String` | Placeholder text inside input prompt. |
| `logo` | `String` | Path to custom brand logo overlay. |

---

## Example Usage

### 1. Basic Interactive Terminal
```html
<nex-terminal title="UPLINK_SHELL_V1" placeholder="Enter cyber command..."></nex-terminal>
```

### 2. CDN jsDelivr Link Loading
```html
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.1.0/packages/nex-terminal/nex-terminal.min.js"></script>
```

---

## Javascript API

### `terminal.writeLine(message: string, [type: string])`
Appends a line to the terminal viewport. `type` options: `info`, `success`, `warning`, `error`, `input`.
```javascript
const term = document.querySelector('nex-terminal');
term.writeLine('OVERRIDE SEQUENCE TERMINATED', 'error');
```

### `terminal.clear()`
Wipes all history logs from the terminal viewport.

---

## Custom Events

| Event Name | Detail | Description |
| :--- | :--- | :--- |
| `command` | `{ command: String, response: String }` | Dispatched immediately after a user executes a directive line. |
