# `<nex-scanner>` Barcode & QR Scanner Overlay

`<nex-scanner>` renders a camera scanning viewport target frame overlay complete with glowing corner indicators and vertical laser scanlines.

## CDN Installation
```html
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.3.0/packages/nex-scanner/nex-scanner.min.js"></script>
```

## HTML Usage
```html
<nex-scanner></nex-scanner>
```

## API Reference
*   **Attributes**:
    *   `logo`: Custom logo image source path.
*   **Methods**:
    *   `startScanning()`: Enables laser sweep and checks barcodes.
    *   `stopScanning()`: Shuts down laser updates.
*   **Events**:
    *   `scan-success`: Dispatched on reading code values. Contains `{ format, result }`.
