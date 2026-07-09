# `<nex-camera>` Cyber Media Capture Viewport

`<nex-camera>` wraps the standard HTML5 MediaDevices API in a custom cyberpunk interface, enabling previewing, photo capture flashes, mirror settings, and scaling zoom levels.

## CDN Installation
```html
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.3.0/packages/nex-camera/nex-camera.min.js"></script>
```

## HTML Usage
```html
<nex-camera audio></nex-camera>
```

## API Reference
*   **Attributes**:
    *   `audio`: Enables hardware microphone stream capture (boolean).
    *   `logo`: Custom logo image source path.
*   **Methods**:
    *   `start()`: Launches active device camera stream.
    *   `stop()`: Shuts active hardware channel.
    *   `capture()`: Saves canvas frame image, returning a PNG dataURL.
    *   `switchCamera()`: Cycles between front and rear cameras.
    *   `toggleFlash()`: Simulates hardware lighting flash toggles.
    *   `toggleMirror()`: Switches left/right horizontal flips.
*   **Events**:
    *   `camera-start`: Dispatched when active streams render.
    *   `photo-captured`: Contains `{ dataUrl }` base64 data.
