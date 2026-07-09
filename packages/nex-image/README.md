# `<nex-image>` Cyberpunk Image Web Component

`nex-image` is a framework-independent, performance-optimized custom HTML5 image element. It encapsulates responsive assets, skeleton loading shimmers, lazy-loading thresholds, and automatic error fallbacks inside a clean Shadow DOM container.

---

## Features
*   **Shadow DOM Encapsulated**: Restricts styles internally. Will not clash with parent document templates.
*   **Responsive Assets**: Supports standard `srcset` and `sizes` mappings for high-density displays.
*   **Skeleton Shimmer**: Displays a cyberpunk theme dark loading gradient block during retrieval.
*   **Intersection Observer Lazy Loading**: Delays fetching until the viewport distance threshold is met (`loading="lazy"`).
*   **Error Fallbacks**: Gracefully displays an offline broken image vector overlay or falls back to a custom URI if the `fallback` attribute is provided.

---

## Attributes Configuration

The component observes the following standard HTML attributes:

| Attribute | Type | Description |
| :--- | :--- | :--- |
| `src` | `String` | Source URL of the image. |
| `srcset` | `String` | Responsive image source URLs mapping (e.g. `image-320w.jpg 320w, ...`). |
| `sizes` | `String` | Layout breakpoints for responsive sources (e.g. `(max-width: 480px) 100vw, ...`). |
| `alt` | `String` | Alternative text description for accessibility. |
| `loading` | `String` | Loading style. Set to `lazy` to activate dynamic Intersection Observer triggers. |
| `fallback` | `String` | Fallback image URL used if the primary `src` returns an error status. |

---

## Example Usage

### 1. Basic Image
```html
<nex-image src="https://example.com/cyberpunk-city.webp" alt="Neo Tokyo City Grid"></nex-image>
```

### 2. Lazy Responsive Image with Custom Error Fallback
```html
<nex-image 
  src="https://example.com/hero.webp" 
  srcset="https://example.com/hero-400.webp 400w, https://example.com/hero-800.webp 800w"
  sizes="(max-width: 600px) 100vw, 800px"
  alt="Cyberpunk Mech Unit"
  loading="lazy"
  fallback="https://example.com/placeholder-offline.png">
</nex-image>
```

---

## Custom Events

| Event Name | Detail | Description |
| :--- | :--- | :--- |
| `load` | `{ src: String }` | Dispatched immediately after the image source resolves and renders successfully. |
| `error` | `{ src: String }` | Dispatched when the image asset fails to load. |
