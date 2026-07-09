/*! nex-image v1.0.0 | (c) 2026 NEX SDK | MIT License | https://github.com/user/nex-sdk */
/**
 * NEX-IMAGE | Cyberpunk Performance-Optimized Image Component
 * Supports lazy-loading, responsive srcsets, skeleton shimmers, and custom error fallbacks.
 */

class NexImage extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'srcset', 'sizes', 'alt', 'loading', 'fallback', 'logo'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isLoaded = false;
    this.hasError = false;
  }

  connectedCallback() {
    this.render();
    this.imgElement = this.shadowRoot.querySelector('.nex-img');
    this.container = this.shadowRoot.querySelector('.nex-image-container');
    
    // Set up intersection observer for lazy loading if requested
    const isLazy = this.getAttribute('loading') === 'lazy';
    if (isLazy && 'IntersectionObserver' in window) {
      this.initLazyLoading();
    } else {
      this.loadImage();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.imgElement) return;

    if (name === 'src') {
      if (this.getAttribute('loading') !== 'lazy' || this.isLoaded) {
        this.loadImage();
      }
    } else if (name === 'alt') {
      this.imgElement.alt = newValue || '';
    } else if (name === 'srcset') {
      this.imgElement.srcset = newValue || '';
    } else if (name === 'sizes') {
      this.imgElement.sizes = newValue || '';
    } else if (name === 'logo') {
      const logoImg = this.shadowRoot.querySelector('.nex-badge-inline img');
      if (logoImg) logoImg.src = newValue || '../logo/logo.webp';
    }
  }

  initLazyLoading() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage();
          if (this.observer) {
            this.observer.unobserve(this.container);
          }
        }
      });
    }, { rootMargin: '50px' });
    
    this.observer.observe(this.container);
  }

  disconnectedCallback() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  loadImage() {
    const src = this.getAttribute('src');
    if (!src) return;

    this.hasError = false;
    this.isLoaded = false;
    this.container.classList.remove('loaded', 'error');
    this.container.classList.add('loading');

    const tempImg = new Image();
    
    if (this.getAttribute('srcset')) {
      tempImg.srcset = this.getAttribute('srcset');
    }
    if (this.getAttribute('sizes')) {
      tempImg.sizes = this.getAttribute('sizes');
    }
    
    tempImg.src = src;

    tempImg.onload = () => {
      this.isLoaded = true;
      this.imgElement.src = tempImg.src;
      if (tempImg.srcset) this.imgElement.srcset = tempImg.srcset;
      if (tempImg.sizes) this.imgElement.sizes = tempImg.sizes;
      
      this.container.classList.remove('loading');
      this.container.classList.add('loaded');
      
      this.dispatchEvent(new CustomEvent('load', { detail: { src: tempImg.src } }));
      if (window.dispatchNexAnalytics) {
        window.dispatchNexAnalytics(this, 'image', 'load', tempImg.src);
      }
    };

    tempImg.onerror = () => {
      this.hasError = true;
      this.container.classList.remove('loading');
      this.container.classList.add('error');

      const fallback = this.getAttribute('fallback');
      if (fallback) {
        this.imgElement.src = fallback;
        this.container.classList.add('loaded'); // treat fallback as loaded to display it
      }

      this.dispatchEvent(new CustomEvent('error', { detail: { src: src } }));
      if (window.dispatchNexAnalytics) {
        window.dispatchNexAnalytics(this, 'image', 'error', src);
      }
    };
  }

  render() {
    const alt = this.getAttribute('alt') || '';
    const logoSrc = this.getAttribute('logo') || '../logo/logo.webp';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --nex-primary: var(--nex-primary, #00f2ff);
          --nex-accent: var(--nex-accent, #ff007f);
          --nex-bg: #070707;
          --nex-glow: var(--nex-glow, rgba(0, 242, 255, 0.3));
          display: inline-block;
          width: 100%;
          font-family: 'Orbitron', 'JetBrains Mono', monospace, sans-serif;
          box-sizing: border-box;
        }

        .nex-image-container {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 150px;
          background-color: var(--nex-bg, #070707);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--nex-glow, var(--nex-glow, rgba(0, 242, 255, 0.3)));
          box-sizing: border-box;
          transition: border-color 0.3s ease;
          clip-path: polygon(0% 0%, 96% 0%, 100% 8%, 100% 100%, 0% 100%);
        }

        .nex-image-container.loaded {
          border-color: var(--nex-glow, rgba(0, 242, 255, 0.3));
        }

        .nex-image-container.error {
          border-color: rgba(255, 0, 127, 0.4);
        }

        .nex-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 0;
          transition: opacity 0.5s ease-in-out;
        }

        .loaded .nex-img {
          opacity: 1;
        }

        /* Shimmer loading state */
        .nex-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            var(--nex-bg, #070707) 25%,
            #151c20 50%,
            var(--nex-bg, #070707) 75%
          );
          background-size: 200% 100%;
          animation: loading-pulse 1.5s infinite;
          display: none;
          z-index: 2;
        }

        .loading .nex-shimmer {
          display: block;
        }

        /* Error state overlay */
        .nex-error-overlay {
          position: absolute;
          inset: 0;
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--nex-accent, #ff007f);
          background: var(--nex-bg, #070707);
          z-index: 3;
          padding: 10px;
          text-align: center;
          box-sizing: border-box;
        }

        .error .nex-error-overlay {
          display: flex;
        }

        .error-icon {
          width: 24px;
          height: 24px;
          margin-bottom: 8px;
          filter: drop-shadow(0 0 4px var(--nex-accent, #ff007f));
        }

        .error-text {
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        @keyframes loading-pulse {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      </style>

      <div class="nex-image-container loading">
        <!-- Shimmer Placeholder -->
        <div class="nex-shimmer"></div>

        <!-- The Image -->
        <img class="nex-img" alt="${alt}">

        <!-- Error fallback display -->
        <div class="nex-error-overlay">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <div class="error-text">ERROR // LOAD_FAILED</div>
        </div>

        <!-- Watermark badge -->
        <div class="nex-badge-inline" style="position: absolute; bottom: 8px; right: 8px; display: flex; align-items: center; gap: 4px; font-size: 5.5px; color: rgba(255, 255, 255, 0.45); font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; font-family: inherit; z-index: 10; pointer-events: none; background: rgba(5, 5, 5, 0.6); backdrop-filter: blur(4px); padding: 2px 5px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1px;">
          <img src="${logoSrc}" style="height: 5.5px; width: auto;" onerror="this.style.display='none'">
          <span>NEX_IMAGE</span>
        </div>
      </div>
    `;
  }
}

customElements.define('nex-image', NexImage);
