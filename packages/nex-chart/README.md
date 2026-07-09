# `<nex-chart>` Cyberpunk Telemetry Chart Visualizer Web Component

`nex-chart` is a lightweight, responsive HTML5 Canvas-based telemetry visualizer component. Designed with glowing neon paths and area gradients to plot data streams in real-time.

---

## Features
*   **Shadow DOM Encapsulated**: Restricts layout and styles internally. Will not clash with parent document templates.
*   **Multiple Chart Styles**: Supports standard `line` and `bar` chart representations.
*   **Neon Glowing Canvas Graphics**: Renders neon glowing paths, area gradients, axis guidelines, and coordinate metadata.
*   **Animated Entry Sweeps**: Renders a smooth eased entrance curve transition upon data changes.
*   **Watermark Logo Branding**: Encapsulates a subtle inline brand logo watermark.

---

## Attributes Configuration

The component observes the following standard HTML attributes:

| Attribute | Type | Description |
| :--- | :--- | :--- |
| `type` | `String` | Chart rendering type. Options: `line`, `bar` (defaults to `line`). |
| `glow-color` | `String` | Glow hex color code (defaults to `#00f2ff`). |
| `grid-color` | `String` | Axis grid lines color code (defaults to `rgba(255, 255, 255, 0.05)`). |
| `logo` | `String` | Path to custom brand logo overlay. |

---

## Example Usage

### 1. Basic Line Chart
```html
<nex-chart type="line" glow-color="#39ff14"></nex-chart>
```

### 2. CDN jsDelivr Link Loading
```html
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.1.0/packages/nex-chart/nex-chart.min.js"></script>
```

---

## Javascript API

### `chart.setData(labels: Array<string>, values: Array<number>)`
Replaces the entire chart data array and triggers animation.
```javascript
const chart = document.querySelector('nex-chart');
chart.setData(['JAN', 'FEB', 'MAR'], [12, 45, 28]);
```

### `chart.addDataPoint(label: string, value: number)`
Appends a single data point to the end of the chart array, removing the oldest point to keep maximum 10 elements.
```javascript
chart.addDataPoint('APR', 60);
```
