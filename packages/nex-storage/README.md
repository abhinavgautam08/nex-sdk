# `<nex-storage>` Web Storage Helper

`<nex-storage>` is a non-visual utility Web Component encapsulating local/session storage interactions with built-in time-to-live expiration, base64 encryption options, and custom callbacks.

## CDN Installation
```html
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.3.0/packages/nex-storage/nex-storage.min.js"></script>
```

## HTML Usage
```html
<nex-storage id="cache" type="local" encryption></nex-storage>
```

## API Reference
*   **Attributes**:
    *   `type`: Storage provider type (`'local'` | `'session'`).
    *   `encryption`: If declared, values are scrambled via Base64.
*   **Methods**:
    *   `set(key, value, ttlSeconds)`: Sets key item with optional TTL.
    *   `get(key)`: Returns value or null if expired/non-existent.
    *   `remove(key)`: Discards storage item.
    *   `clear()`: Flushes all entries.
*   **Events**:
    *   `storage-set`: Dispatched on writes.
    *   `storage-get`: Dispatched on reads.
    *   `storage-expire`: Dispatched on fetching expired values.
