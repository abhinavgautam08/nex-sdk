# `<nex-qr>` Matrix Code Generator

`<nex-qr>` is a lightweight QR Code generator element rendering matrix blocks dynamically on canvas with downloading support.

## CDN Installation
```html
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.3.0/packages/nex-qr/nex-qr.min.js"></script>
```

## HTML Usage
```html
<nex-qr value="https://nex.net" size="180" color="#00f2ff" bg-color="#070707"></nex-qr>
```

## API Reference
*   **Attributes**:
    *   `value`: Data content payload string.
    *   `size`: Grid width/height.
    *   `color`: Block color code.
    *   `bg-color`: Canvas backdrop color code.
    *   `logo`: Custom logo image source path.
*   **Methods**:
    *   `downloadPng()`: Triggers PNG file downloads.
    *   `downloadSvg()`: Triggers vector SVG file downloads.
*   **Events**:
    *   `qr-generated`: Dispatched on grid calculations completion.
    *   `qr-download`: Dispatched on download actions.
