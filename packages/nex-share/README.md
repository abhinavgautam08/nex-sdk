# `<nex-share>` Web Share Portal

`<nex-share>` integrates the browser Web Share API, falling back to an elegant clipboard copy link button and custom modal QR code sharing.

## CDN Installation
```html
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.3.0/packages/nex-share/nex-share.min.js"></script>
```

## HTML Usage
```html
<nex-share url="https://nex.net" title="NEX Ecosystem" text="Access the cyber portal!"></nex-share>
```

## API Reference
*   **Attributes**:
    *   `url`: URL link to share (defaults to `window.location.href`).
    *   `title`: Text caption for native triggers.
    *   `text`: Body description.
    *   `logo`: Custom logo image source path.
*   **Methods**:
    *   `share()`: Executes the native Web Share actions or shows fallbacks.
    *   `copyLink()`: Copies the active URL to the clipboard.
*   **Events**:
    *   `share-success`: Dispatched on copy or share success. Contains `{ method }`.
    *   `share-error`: Dispatched on failure.
