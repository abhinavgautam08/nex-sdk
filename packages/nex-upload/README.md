# `<nex-upload>` Cyberpunk File Uploader Web Component

`nex-upload` is a reusable, responsive drag-and-drop file uploader custom element encapsulated inside a Shadow DOM wrapper. Features file validations, selection queues, multi-file uploads, and real-time progress bars.

---

## Features
*   **Shadow DOM Encapsulated**: Restricts layout and styles internally. Will not clash with parent document templates.
*   **Interactive Drag & Drop**: Hover state transitions turn the border fuchsia and slide up the upload vector logo on drop actions.
*   **Queue Panel**: Lists selected files with their status badge (Pending, Uploading, Success, Error) and file sizes.
*   **File Validations**:
    *   **Type**: Omit or define explicit extensions (e.g. `.zip,.png`) or generic groups (e.g. `image/*`).
    *   **Size**: Set a maximum file size in bytes. Files exceeding this size are blocked in a validation error state.
*   **Flexible Upload Flow**:
    *   **Auto Upload**: Starts uploading files as soon as they are added to the queue.
    *   **Manual Trigger**: Queues files, allowing users to verify their selections before clicking "UPLINK QUEUED PAYLOADS".
*   **Dynamic Custom Events**: Emits detailed Custom Events on state transitions (added, started, progress, success, failed) allowing javascript to capture and process uploads.

---

## Attributes Configuration

The component observes the following standard HTML attributes:

| Attribute | Type | Description |
| :--- | :--- | :--- |
| `endpoint` | `String` | URL of the POST upload API. If omitted, the component enters a mock upload mode (simulating progress and success via intervals), useful for sandbox testing and customized upload pipelines. |
| `multiple` | `Boolean` | If present, allows selecting and queuing multiple files at once. |
| `accept` | `String` | Permitted file extension filters (e.g. `.png,.jpg` or `image/*,application/pdf`). |
| `max-size` | `Number` | Max allowed file size in bytes (e.g. `5242880` -> 5MB limit). |
| `auto-upload`| `Boolean` | If present, files upload automatically upon addition. If absent, renders a manual upload trigger. |

---

## Example Usage

### 1. Simple Single File Auto-Uploader
```html
<nex-upload 
  endpoint="https://api.example.com/upload" 
  accept="image/*" 
  auto-upload>
</nex-upload>
```

### 2. Multi-File Zip Uploader with 10MB Limit
```html
<nex-upload 
  endpoint="https://api.example.com/upload-zip" 
  accept=".zip" 
  max-size="10485760" 
  multiple>
</nex-upload>
```

### 3. Mock Sandbox Mode (No Endpoint Configured)
If no `endpoint` is declared, the component enters mock mode, generating progress intervals and success events automatically. 
```html
<nex-upload multiple accept="image/*,application/pdf" max-size="5242880"></nex-upload>
```

---

## Custom Events

All events provide details on the associated native `File` object:

| Event Name | Detail | Description |
| :--- | :--- | :--- |
| `file-added` | `{ file: File, error: String\|null }` | Dispatched when a file enters the queue. `error` contains validation failures. |
| `upload-start` | `{ file: File }` | Dispatched when XHR / Mock transmission begins. |
| `upload-progress` | `{ file: File, progress: Number }` | Dispatched on upload progress updates. `progress` is an integer between 0 and 100. |
| `upload-success` | `{ file: File, response: String }` | Dispatched on successful POST request (HTTP 2xx). |
| `upload-error` | `{ file: File, error: String }` | Dispatched when the upload fails or returns an HTTP error code. |
