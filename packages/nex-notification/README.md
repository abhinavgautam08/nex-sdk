# `<nex-notification>` Global Toast Manager

`<nex-notification>` manages a fixed viewport toast overlay queue, supporting Success, Error, Warning, and Info dialogs with custom progress timers.

## CDN Installation
```html
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.3.0/packages/nex-notification/nex-notification.min.js"></script>
```

## HTML Usage
```html
<nex-notification position="top-right" max-notifications="5"></nex-notification>
```

## Global Javascript Helper
Once loaded, the helper is attached to the global scope:
```javascript
window.showNexNotification('success', 'CREDENTIALS_SYNCHRONIZED', 2500);
```

## API Reference
*   **Attributes**:
    *   `position`: Viewport placement (`'top-right'`, `'bottom-right'`, `'top-left'`, `'bottom-left'`).
    *   `max-notifications`: Max active concurrent toasts.
*   **Methods**:
    *   `show(type, text, duration)`: Spawns a notification.
    *   `clear()`: Wipes the toast overlay list.
*   **Events**:
    *   `notification-show`: Dispatched when an alert is queued.
