/**
 * @license
 * NEX SDK - nex-chart.js
 * Cyberpunk HTML5 Canvas-based telemetry data visualizer component.
 * License: MIT
 */

class NexChart extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'logo', 'glow-color', 'grid-color'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.labels = [];
    this.values = [];
    this.animationProgress = 0;
    this.animationId = null;
  }

  connectedCallback() {
    this.render();
    this.initCanvas();
    this.setupResizeObserver();
    
    // Default initial data if none provided
    if (this.labels.length === 0) {
      this.setData(
        ['NODE_A', 'NODE_B', 'NODE_C', 'NODE_D', 'NODE_E'],
        [30, 75, 45, 90, 60]
      );
    }
  }

  disconnectedCallback() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.shadowRoot.innerHTML !== '') {
      if (name === 'logo') {
        const logoImg = this.shadowRoot.querySelector('.nex-badge-inline img');
        if (logoImg) logoImg.src = newValue || '../logo/logo.webp';
      } else {
        this.drawChart();
      }
    }
  }

  setData(labels, values) {
    this.labels = labels;
    this.values = values;
    this.triggerAnimation();
  }

  addDataPoint(label, value) {
    this.labels.push(label);
    this.values.push(value);
    
    // Limit to last 10 points for safety
    if (this.labels.length > 10) {
      this.labels.shift();
      this.values.shift();
    }
    
    this.triggerAnimation();
  }

  initCanvas() {
    this.canvas = this.shadowRoot.querySelector('.nex-chart-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
  }

  setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
      this.drawChart();
    });
    this.resizeObserver.observe(this.canvas);
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  triggerAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    this.animationProgress = 0;
    const startTime = performance.now();
    const duration = 800; // ms

    const animate = (time) => {
      const elapsed = time - startTime;
      this.animationProgress = Math.min(elapsed / duration, 1);
      
      // Easing curve (easeOutCubic)
      const ease = 1 - Math.pow(1 - this.animationProgress, 3);
      this.drawChart(ease);

      if (this.animationProgress < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.animationId = null;
      }
    };

    this.animationId = requestAnimationFrame(animate);
  }

  drawChart(progress = 1) {
    if (!this.ctx || !this.canvas || this.labels.length === 0) return;

    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;
    const ctx = this.ctx;

    // Colors Setup
    const type = this.getAttribute('type') || 'line';
    const computedStyle = getComputedStyle(this);
    const cssPrimary = computedStyle.getPropertyValue('--nex-primary').trim();
    const cssAccent = computedStyle.getPropertyValue('--nex-accent').trim();
    
    const glowColor = this.getAttribute('glow-color') || cssPrimary || '#00f2ff';
    const gridColor = this.getAttribute('grid-color') || 'rgba(255, 255, 255, 0.05)';

    ctx.clearRect(0, 0, width, height);

    // Padding parameters
    const padding = { top: 30, right: 20, bottom: 40, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Draw Grid Coordinates
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
    }
    ctx.stroke();

    // Max data computation
    const maxValue = Math.max(...this.values, 10) * 1.15;
    const dataPointsCount = this.labels.length;

    if (type === 'line') {
      this.drawLineChart(ctx, padding, chartWidth, chartHeight, maxValue, dataPointsCount, glowColor, progress);
    } else if (type === 'bar') {
      this.drawBarChart(ctx, padding, chartWidth, chartHeight, maxValue, dataPointsCount, glowColor, progress);
    }

    // Draw Axis Metadata labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '7px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= 4; i++) {
      const val = Math.round((maxValue / 4) * (4 - i));
      const y = padding.top + (chartHeight / 4) * i;
      ctx.fillText(val.toString(), padding.left - 8, y);
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const stepX = chartWidth / Math.max(dataPointsCount - 1, 1);
    this.labels.forEach((label, idx) => {
      const x = padding.left + stepX * idx;
      ctx.fillText(label, x, height - padding.bottom + 10);
    });
  }

  drawLineChart(ctx, padding, chartWidth, chartHeight, maxValue, count, glowColor, progress) {
    const stepX = chartWidth / Math.max(count - 1, 1);
    const points = [];

    this.values.forEach((val, idx) => {
      const x = padding.left + stepX * idx;
      const targetY = padding.top + chartHeight - (val / maxValue) * chartHeight;
      // Animate from base layout upwards
      const y = padding.top + chartHeight - ((val * progress) / maxValue) * chartHeight;
      points.push({ x, y });
    });

    // Draw Area Gradient Fill under curve
    const areaGrad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    areaGrad.addColorStop(0, this.hexToRgba(glowColor, 0.2));
    areaGrad.addColorStop(1, this.hexToRgba(glowColor, 0.0));

    ctx.fillStyle = areaGrad;
    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + chartHeight);
    points.forEach(pt => ctx.lineTo(pt.x, pt.y));
    ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
    ctx.closePath();
    ctx.fill();

    // Draw Neon Line Path
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = glowColor;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(pt => ctx.lineTo(pt.x, pt.y));
    ctx.stroke();
    
    // Clear shadow state for dots
    ctx.shadowBlur = 0;

    // Draw active dots
    points.forEach(pt => {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  drawBarChart(ctx, padding, chartWidth, chartHeight, maxValue, count, glowColor, progress) {
    const barWidth = (chartWidth / count) * 0.6;
    const gap = (chartWidth / count) * 0.4;
    const stepX = chartWidth / count;

    this.values.forEach((val, idx) => {
      const x = padding.left + stepX * idx + gap / 2;
      const targetHeight = (val / maxValue) * chartHeight * progress;
      const y = padding.top + chartHeight - targetHeight;

      // Create Bar neon gradient
      const barGrad = ctx.createLinearGradient(x, y, x, padding.top + chartHeight);
      barGrad.addColorStop(0, glowColor);
      barGrad.addColorStop(1, this.hexToRgba(glowColor, 0.05));

      ctx.fillStyle = barGrad;
      ctx.fillRect(x, y, barWidth, targetHeight);

      // Top glowing indicator line on each bar
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + barWidth, y);
      ctx.stroke();
    });
  }

  hexToRgba(hex, alpha) {
    let c = hex.substring(1);
    if (c.length === 3) {
      c = c.split('').map(x => x + x).join('');
    }
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  render() {
    const logoSrc = this.getAttribute('logo') || '../logo/logo.webp';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 500px;
          font-family: 'Orbitron', 'JetBrains Mono', monospace, sans-serif;
          box-sizing: border-box;
          --nex-primary: #00f2ff;
          --nex-accent: #ff007f;
          --nex-bg: #070707;
          --nex-glow: rgba(0, 242, 255, 0.3);
        }

        .nex-chart-container {
          background-color: #070707;
          border: 1px solid rgba(0, 242, 255, 0.15);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
          clip-path: polygon(0 0, 95% 0, 100% 12px, 100% 100%, 5% 100%, 0 92%);
          position: relative;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          height: 240px;
        }

        .nex-chart-header {
          border-bottom: 1px solid rgba(0, 242, 255, 0.1);
          padding: 10px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-sizing: border-box;
        }

        .nex-chart-title {
          font-size: 9px;
          font-weight: 900;
          color: #00f2ff;
          letter-spacing: 0.15em;
          text-shadow: 0 0 6px rgba(0, 242, 255, 0.3);
          text-transform: uppercase;
        }

        .nex-chart-canvas-area {
          flex: 1;
          position: relative;
          padding: 8px;
          box-sizing: border-box;
        }

        .nex-chart-canvas {
          display: block;
          width: 100%;
          height: 100%;
        }

        /* Ambient glowing corners */
        .nex-chart-corner {
          position: absolute;
          width: 10px;
          height: 10px;
          pointer-events: none;
        }

        .corner-tl {
          top: 0;
          left: 0;
          border-top: 1.5px solid #ff007f;
          border-left: 1.5px solid #ff007f;
        }

        .corner-br {
          bottom: 0;
          right: 0;
          border-bottom: 1.5px solid #00f2ff;
          border-right: 1.5px solid #00f2ff;
        }
      </style>

      <div class="nex-chart-container">
        <!-- Highlights -->
        <div class="nex-chart-corner corner-tl"></div>
        <div class="nex-chart-corner corner-br"></div>

        <div class="nex-chart-header">
          <span class="nex-chart-title">TELEMETRY_LOG // STREAM</span>
          <div class="nex-badge-inline" style="display: flex; align-items: center; gap: 4px; font-size: 5.5px; color: rgba(255, 255, 255, 0.45); font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase;">
            <img src="${logoSrc}" style="height: 5.5px; width: auto;" onerror="this.style.display='none'">
            <span>NEX_CHART</span>
          </div>
        </div>

        <div class="nex-chart-canvas-area">
          <canvas class="nex-chart-canvas"></canvas>
        </div>
      </div>
    `;
  }
}

customElements.define('nex-chart', NexChart);
