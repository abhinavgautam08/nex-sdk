# `<nex-theme>` Cyber Theme Selector

`<nex-theme>` is a global theme manager element that enables switching between Light, Dark, and Auto system states, persisting selections automatically to local storage and updates root CSS variable sheets.

## CDN Installation
```html
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.3.0/packages/nex-theme/nex-theme.min.js"></script>
```

## HTML Usage
```html
<nex-theme storage-key="custom-theme-key"></nex-theme>
```

## API Reference
*   **Attributes**:
    *   `storage-key`: LocalStorage key (default: `'nex-theme-preference'`).
    *   `logo`: Custom logo image source path.
*   **Methods**:
    *   `setTheme(themeName)`: Activates the target state (`'light'`, `'dark'`, `'auto'`).
*   **Events**:
    *   `theme-change`: Contains `{ theme, resolved }` representing active selections.
