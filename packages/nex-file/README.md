# `<nex-file>` Cyberpunk File Preview Web Component

`nex-file` is a reusable, responsive file viewer custom element styled with a glowing cyberpunk card interface. Natively handles file previews for images, video loops, PDFs, and generic files, accompanied by download triggers and formatted metadata indicators.

---

## Features
*   **Shadow DOM Isolation**: Safe from outer styles and layout overrides.
*   **Dynamic Media Previews**:
    *   **Images**: Renders inline pixel-perfect previews.
    *   **Videos**: Mounts an inline HTML5 loop-ready video player.
    *   **PDFs**: Embeds inline document layouts via an encapsulated reader.
    *   **Generic Files**: Generates a custom vector document logo embedded with the file's extension suffix.
*   **Direct Download Trigger**: Embedded trigger to download the video/image/file payload immediately.
*   **Auto-Formatting Metadata**: Dynamically computes file size strings (`Bytes` -> `KB`/`MB`/`GB`) and extracts filenames from URIs if not explicitly defined.

---

## Attributes Configuration

The component observes the following standard HTML attributes:

| Attribute | Type | Description |
| :--- | :--- | :--- |
| `src` | `String` | URL of the file asset. |
| `name` | `String` | Optional overrides. If omitted, extracts the name from the `src` path. |
| `size` | `Number` | File size value in bytes (e.g. `2097152` -> dynamically formatted to `2.00 MB`). |
| `type` | `String` | File type identifier. Set explicitly (e.g. `image`, `video`, `pdf`) or omit to allow automatic extensions deduction. |

---

## Example Usage

### 1. Simple Image Preview Card
```html
<nex-file 
  src="https://example.com/network-diagram.png" 
  size="240391">
</nex-file>
```

### 2. PDF Document Preview Card
```html
<nex-file 
  src="https://example.com/security-manifesto.pdf" 
  name="CORP_FIREWALL_PROTOCOL.PDF"
  type="pdf">
</nex-file>
```

### 3. Loop Video Preview Card
```html
<nex-file 
  src="https://example.com/satellite-scan.webm" 
  size="15728640" 
  type="video">
</nex-file>
```

---

## Custom Events

| Event Name | Detail | Description |
| :--- | :--- | :--- |
| `download` | `{ src: String, name: String }` | Dispatched immediately after a user clicks the payload download button. |
