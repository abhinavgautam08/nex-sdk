/*! nex-analytics v1.0.0 | (c) 2026 NEX SDK | MIT License | https://github.com/user/nex-sdk */
/**
 * NEX-ANALYTICS | Lightweight Cyberpunk Telemetry & Tracking SDK
 * Automatically tracks page views, SPA router history transitions, component lifecycles, and custom event dispatches.
 */

class NexAnalytics {
  constructor(config = {}) {
    this.endpoint = config.endpoint || '';
    this.appName = config.app || 'NEX_SDK_APPLICATION';
    this.debug = config.debug || false;
    this.sessionId = this.generateSessionId();
    
    this._pageViewCallback = () => this.trackPageView();
    this._eventCallback = (e) => {
      const { category, action, label, value } = e.detail || {};
      this.track(category, action, label, value);
    };

    this.init();
  }

  init() {
    this.log('Telemetry initialized.');
    
    // 1. Track initial page view
    this.trackPageView();

    // 2. Track Single Page Application (SPA) routing changes
    window.addEventListener('popstate', this._pageViewCallback);
    window.addEventListener('hashchange', this._pageViewCallback);

    // 3. Listen for global bubbled component events
    document.addEventListener('nex-analytics-event', this._eventCallback);

    // 4. Auto-detect components already present on the page
    this.scanForComponents();
  }

  generateSessionId() {
    return 'sess-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
  }

  log(msg, data = '') {
    if (this.debug) {
      console.log(`%c[NEX_TELEMETRY] ${msg}`, 'color: #39ff14; font-weight: bold;', data);
    }
  }

  scanForComponents() {
    const componentTypes = ['nex-stream', 'nex-image', 'nex-file', 'nex-upload'];
    componentTypes.forEach(tag => {
      const count = document.querySelectorAll(tag).length;
      if (count > 0) {
        this.track('component-scan', 'detect', tag, count);
      }
    });
  }

  trackPageView() {
    const payload = {
      title: document.title,
      url: window.location.href,
      referrer: document.referrer,
      path: window.location.pathname
    };
    this.track('page', 'view', payload.path, null, payload);
  }

  track(category, action, label = '', value = null, extra = {}) {
    const eventData = {
      app: this.appName,
      session: this.sessionId,
      category: category,
      action: action,
      label: label,
      value: value,
      timestamp: new Date().toISOString(),
      screen: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      ...extra
    };

    this.log(`EVENT_LOGGED: ${category} // ${action}`, eventData);

    if (!this.endpoint) {
      // Mock tracking if no endpoint is set
      return;
    }

    // Attempt navigator.sendBeacon if browser supports it, fallback to fetch
    const payloadStr = JSON.stringify(eventData);
    if (navigator.sendBeacon) {
      const beaconSent = navigator.sendBeacon(this.endpoint, new Blob([payloadStr], { type: 'application/json' }));
      if (beaconSent) return;
    }

    // Fallback Fetch
    fetch(this.endpoint, {
      method: 'POST',
      body: payloadStr,
      headers: {
        'Content-Type': 'application/json'
      },
      keepalive: true
    }).catch(err => {
      this.log('TELEMETRY_LINK_ERROR', err);
    });
  }

  destroy() {
    window.removeEventListener('popstate', this._pageViewCallback);
    window.removeEventListener('hashchange', this._pageViewCallback);
    document.removeEventListener('nex-analytics-event', this._eventCallback);
    this.log('Telemetry destroyed.');
  }
}

// Attach a helper to easily trigger component telemetry
window.dispatchNexAnalytics = (element, category, action, label = '', value = null) => {
  element.dispatchEvent(new CustomEvent('nex-analytics-event', {
    bubbles: true,
    composed: true,
    detail: { category, action, label, value }
  }));
};

window.NexAnalytics = NexAnalytics;
export default NexAnalytics;
export { NexAnalytics };
