# `<nex-network>` Cyber Connection Monitor

`<nex-network>` is a status indicator component that dynamically displays connection states, fires status change callbacks, triggers latency tests, and spawns warnings when connectivity is broken.

## CDN Installation
```html
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.3.0/packages/nex-network/nex-network.min.js"></script>
```

## HTML Usage
```html
<nex-network ping-interval="12"></nex-network>
```

## API Reference
*   **Attributes**:
    *   `ping-interval`: Latency check loop frequency in seconds.
    *   `logo`: Custom logo image source path.
*   **Methods**:
    *   `checkConnection()`: Initiates a probe to calculate round-trip times.
*   **Events**:
    *   `connection-change`: Emits `{ online }` status changes.
    *   `ping-result`: Emits `{ latency }` measurement results.
