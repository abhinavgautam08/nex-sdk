# NEX UI Cyberpunk Layout & Interaction Components Bundle

This package includes a collection of lightweight, responsive, accessible, and framework-independent UI Web Components designed with a unified neon cyberpunk theme.

---

## Bundled Custom Elements

### 1. `<nex-button>`
Action triggers styled with glowing borders and diagonal polygon cuts.
*   **Attributes**:
    *   `type`: Color schemes. Options: `primary` (cyan), `secondary` (white), `outline` (transparent-cyan), `fuchsia` (magenta), `lime` (green).
    *   `size`: Sizing profiles. Options: `sm`, `md`, `lg`.
    *   `disabled`: Disables button interaction, opacity, and removes active glows.
    *   `loading`: Shows an inline loading spinner and disables click actions.
*   **Example**:
    ```html
    <nex-button type="primary" size="md">EXECUTE UPLINK</nex-button>
    ```

### 2. `<nex-modal>`
Modal overlay popup dialogs with glassmorphic blurs and slide-in animations.
*   **Attributes**:
    *   `title`: Header title text.
    *   `open`: Boolean state attribute toggling the modal open.
*   **APIs**:
    *   `modal.openModal()`: Javascript call to launch overlay.
    *   `modal.close()`: Javascript call to close overlay.
*   **Events**:
    *   `open`: Dispatched when modal opens.
    *   `close`: Dispatched when modal closes.
*   **Example**:
    ```html
    <nex-modal id="termsModal" title="CORP_REGULATIONS_V2" open>
      <p>Consent to terminal telemetry uplink protocols...</p>
    </nex-modal>
    ```

### 3. `<nex-toast>`
Popup notification system managed via a centralized overlay manager.
*   **Helper API**:
    *   `window.showNexToast(message, [type], [duration])`: Launches toast popup. `type` options: `success`, `error`, `info`. `duration` in ms.
*   **Example**:
    ```javascript
    window.showNexToast('UPLINK_ESTABLISHED_SUCCESS', 'success', 3000);
    ```

### 4. `<nex-loader>`
Styled loading indicators showing ongoing data transfers.
*   **Attributes**:
    *   `type`: Display configuration. Options: `spinner`, `progress` (a sliding neon bar).
    *   `text`: Text status displayed under loader. Defaults to `SYNCING_DATA_GATEWAY...`.
*   **Example**:
    ```html
    <nex-loader type="progress" text="DECRYPTING_SECTOR_7..."></nex-loader>
    ```

### 5. `<nex-card>`
Container panels with glowing brackets, diagonal cuts, and header layout blocks.
*   **Attributes**:
    *   `title`: Card header title text.
*   **Example**:
    ```html
    <nex-card title="SYSTEM_NODE_01">
      <p>Status: ONLINE</p>
      <p>Host: localhost:8080</p>
    </nex-card>
    ```
