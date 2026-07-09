# `<nex-sanitizer>` — Client-Side XSS Protection Shield

A lightweight, performance-optimized client-side HTML sanitization module designed to neutralize Cross-Site Scripting (XSS) injection vectors natively inside the browser. Exposes a global utility `NexSanitizer` to recursively clean HTML templates.

---

## Installation & CDN Reference

```html
<!-- Load the Sanitizer in your document head -->
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.4.0/packages/nex-sanitizer/nex-sanitizer.min.js"></script>
```

---

## API Reference

### `NexSanitizer.sanitize(html)`
*   **Parameters:** `html` (String): Raw HTML input to sanitize.
*   **Returns:** (String): A clean HTML string with all unsafe tags, event attributes, and dangerous protocols stripped out.

#### Allowed Tags
`p`, `br`, `strong`, `em`, `u`, `code`, `pre`, `span`, `div`, `a`, `img`, `ul`, `ol`, `li`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `blockquote`, `hr`, `table`, `thead`, `tbody`, `tr`, `th`, `td`

#### Allowed Attributes
*   `a`: `href`, `target`, `rel`, `title`
*   `img`: `src`, `alt`, `width`, `height`, `title`
*   Global: `class`, `id`

*Note: All inline style configurations, `on*` events (like `onload`, `onerror`), and `javascript:` / `data:` protocols are neutralized.*

---

## Simple Integration Example

```javascript
// Clean a raw input before rendering
const rawPayload = '<img src="x" onerror="alert(1)"> <p>Hello <strong>World</strong></p>';
const cleanHtml = NexSanitizer.sanitize(rawPayload);

console.log(cleanHtml); 
// Output: '<img src="x"> <p>Hello <strong>World</strong></p>'
```
