/*! nex-payment v1.3.0 | (c) 2026 NEX SDK | MIT License */
class NexPayment extends HTMLElement {
  static get observedAttributes() {
    return ['logo'];
  }

  constructor() {
    super();
    this.price = 100.00;
    this.discount = 0.00;
    this.couponCode = '';
    this.activeMethod = 'card';
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.attachEvents();
  }

  disconnectedCallback() {}

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'logo' && this.shadowRoot) {
      const img = this.shadowRoot.querySelector('.nex-badge-logo');
      if (img) img.src = newVal || '../logo/logo.webp';
    }
  }

  applyCoupon(code) {
    this.couponCode = code.toUpperCase();
    if (this.couponCode === 'CYBER') {
      this.discount = 20.00;
      this.dispatchEvent(new CustomEvent('coupon-applied', { detail: { code: 'CYBER', discount: 20 } }));
    } else {
      this.discount = 0.00;
      this.dispatchEvent(new CustomEvent('coupon-error', { detail: { code } }));
    }
    this.render();
    this.attachEvents();
  }

  setMethod(method) {
    this.activeMethod = method;
    this.render();
    this.attachEvents();
  }

  attachEvents() {
    const shadow = this.shadowRoot;
    
    // Method tabs
    shadow.querySelectorAll('.method-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.setMethod(tab.dataset.method);
      });
    });

    // Coupon
    const couponInput = shadow.querySelector('#coupon');
    const couponBtn = shadow.querySelector('.coupon-btn');
    if (couponBtn && couponInput) {
      couponBtn.addEventListener('click', () => {
        this.applyCoupon(couponInput.value.trim());
      });
    }

    // Card Input Bindings
    if (this.activeMethod === 'card') {
      const cardNum = shadow.querySelector('#cardNum');
      const cardName = shadow.querySelector('#cardName');
      const cardExpiry = shadow.querySelector('#cardExpiry');
      
      const vNum = shadow.querySelector('.v-card-number');
      const vName = shadow.querySelector('.v-card-name');
      const vExpiry = shadow.querySelector('.v-card-expiry');

      if (cardNum && vNum) {
        cardNum.addEventListener('input', () => {
          vNum.textContent = cardNum.value || '•••• •••• •••• ••••';
        });
      }
      if (cardName && vName) {
        cardName.addEventListener('input', () => {
          vName.textContent = cardName.value.toUpperCase() || 'CARDHOLDER NAME';
        });
      }
      if (cardExpiry && vExpiry) {
        cardExpiry.addEventListener('input', () => {
          vExpiry.textContent = cardExpiry.value || 'MM/YY';
        });
      }
    }

    // Form submit
    const submitBtn = shadow.querySelector('.submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }
  }

  handleSubmit() {
    const shadow = this.shadowRoot;
    const inputs = shadow.querySelectorAll('input');
    const data = {
      method: this.activeMethod,
      amount: this.price - this.discount
    };
    inputs.forEach(input => {
      if (input.id) data[input.id] = input.value;
    });

    this.dispatchEvent(new CustomEvent('payment-submit', { detail: { data } }));
    
    // standalone toast simulation
    if (window.showNexToast) {
      window.showNexToast('TRANSACTION AUTHORIZED // SECURE UPLINK SUCCESSFUL', 'success', 3000);
    }
  }

  render() {
    const logoSrc = this.getAttribute('logo') || '../logo/logo.webp';
    const total = this.price - this.discount;

    let formContent = '';
    if (this.activeMethod === 'card') {
      formContent = `
        <div class="virtual-card">
          <div class="v-card-logo">NEX // NET</div>
          <div class="v-card-number">•••• •••• •••• ••••</div>
          <div style="display: flex; justify-content: space-between; align-items: flex-end;">
            <div class="v-card-name">CARDHOLDER NAME</div>
            <div class="v-card-expiry">MM/YY</div>
          </div>
        </div>
        <div class="card-form">
          <div class="input-group">
            <label for="cardNum">CARD NUMBER</label>
            <input type="text" id="cardNum" placeholder="4111 2222 3333 4444" required>
          </div>
          <div style="display: flex; gap: 10px;">
            <div class="input-group" style="flex: 2;">
              <label for="cardName">CARDHOLDER</label>
              <input type="text" id="cardName" placeholder="JOHN DOE" required>
            </div>
            <div class="input-group" style="flex: 1;">
              <label for="cardExpiry">EXPIRY</label>
              <input type="text" id="cardExpiry" placeholder="MM/YY" required>
            </div>
            <div class="input-group" style="flex: 1;">
              <label for="cardCvv">CVV</label>
              <input type="password" id="cardCvv" placeholder="•••" required maxlength="4">
            </div>
          </div>
        </div>
      `;
    } else if (this.activeMethod === 'upi') {
      formContent = `
        <div class="upi-form">
          <div class="input-group">
            <label for="upiId">VIRTUAL PAYMENT ADDRESS (VPA)</label>
            <input type="text" id="upiId" placeholder="user@okaxis" required>
          </div>
          <div style="font-size: 8px; color: rgba(255, 255, 255, 0.3); line-height: 1.4;">
            Send a payment request to your linked UPI mobile client app (e.g. Google Pay, BHIM).
          </div>
        </div>
      `;
    } else if (this.activeMethod === 'wallet') {
      formContent = `
        <div class="wallet-form">
          <div class="wallet-option">
            <input type="radio" name="wallet" id="w1" checked><label for="w1">NEX_PAY_CORES</label>
          </div>
          <div class="wallet-option">
            <input type="radio" name="wallet" id="w2"><label for="w2">LINKED_SAVINGS_NODE</label>
          </div>
        </div>
      `;
    } else if (this.activeMethod === 'qr') {
      formContent = `
        <div class="qr-form">
          <div class="qr-placeholder">
            <!-- Simulated QR code blocks -->
            <div class="qr-block"></div>
            <span style="font-size: 8px; font-weight: bold; color: var(--nex-primary); z-index: 10;">SCAN CODE VIA MOBILE GATEWAY</span>
          </div>
        </div>
      `;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          font-family: 'Orbitron', 'JetBrains Mono', monospace, sans-serif;
          --nex-primary: var(--nex-primary, #00f2ff);
          --nex-accent: var(--nex-accent, #ff007f);
          --nex-bg: var(--nex-bg, #070707);
          --nex-glow: var(--nex-glow, rgba(0, 242, 255, 0.3));
          box-sizing: border-box;
        }

        .payment-wrapper {
          position: relative;
          background: var(--nex-bg, #070707);
          border: 1px solid var(--nex-glow, rgba(0, 242, 255, 0.3));
          box-shadow: 0 0 15px var(--nex-glow, rgba(0, 242, 255, 0.3));
          padding: 20px;
          box-sizing: border-box;
          clip-path: polygon(0 0, 95% 0, 100% 15px, 100% 100%, 0 100%);
        }

        .payment-header {
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.15em;
          color: var(--nex-primary, #00f2ff);
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 8px;
        }

        /* Order Summary */
        .summary-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 12px;
          margin-bottom: 20px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          font-weight: bold;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 6px;
        }

        .row-total {
          font-size: 11px;
          color: var(--nex-primary, #00f2ff);
          border-top: 1px dashed rgba(255, 255, 255, 0.1);
          padding-top: 6px;
          margin-bottom: 0;
        }

        /* Coupon Box */
        .coupon-box {
          display: flex;
          gap: 6px;
          margin-bottom: 20px;
        }

        .coupon-box input {
          flex: 1;
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 8px 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          outline: none;
        }

        .coupon-box input:focus {
          border-color: var(--nex-primary, #00f2ff);
        }

        .coupon-btn {
          background: transparent;
          border: 1px solid var(--nex-primary, #00f2ff);
          color: var(--nex-primary, #00f2ff);
          padding: 8px 12px;
          font-family: inherit;
          font-size: 9px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .coupon-btn:hover {
          background: var(--nex-primary, #00f2ff);
          color: #000;
        }

        /* Payment Tabs */
        .method-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 20px;
          gap: 4px;
        }

        .method-tab {
          flex: 1;
          padding: 8px;
          font-size: 8px;
          font-weight: 900;
          text-align: center;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.4);
          border-bottom: 2px solid transparent;
          letter-spacing: 0.1em;
          transition: all 0.2s ease;
        }

        .method-tab.active {
          color: var(--nex-primary, #00f2ff);
          border-bottom-color: var(--nex-primary, #00f2ff);
        }

        /* Virtual Card UI */
        .virtual-card {
          width: 100%;
          height: 140px;
          background: linear-gradient(135deg, #0d0d0d 0%, #151c20 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 16px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          margin-bottom: 16px;
          position: relative;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
          clip-path: polygon(0 0, 95% 0, 100% 12px, 100% 100%, 0 100%);
        }

        .v-card-logo {
          font-size: 10px;
          font-weight: 900;
          color: var(--nex-accent, #ff007f);
          letter-spacing: 0.15em;
        }

        .v-card-number {
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          color: var(--nex-primary, #00f2ff);
          letter-spacing: 0.15em;
          text-shadow: 0 0 5px var(--nex-glow, rgba(0, 242, 255, 0.3));
        }

        .v-card-name, .v-card-expiry {
          font-size: 7px;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.1em;
        }

        /* Forms inputs */
        .input-group {
          margin-bottom: 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .input-group label {
          font-size: 7px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.1em;
        }

        .input-group input {
          background: #030303;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 8px 10px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          outline: none;
          box-sizing: border-box;
        }

        .input-group input:focus {
          border-color: var(--nex-primary, #00f2ff);
        }

        /* Wallets */
        .wallet-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 8px;
          font-size: 9px;
          font-weight: bold;
          letter-spacing: 0.1em;
        }

        .wallet-option input {
          accent-color: var(--nex-primary, #00f2ff);
        }

        /* QR Code Scanner simulation */
        .qr-placeholder {
          width: 130px;
          height: 130px;
          margin: 0 auto;
          border: 1px dashed var(--nex-primary, #00f2ff);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: #030303;
          padding: 10px;
          box-sizing: border-box;
        }

        .qr-block {
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(45deg, #000, #000 4px, var(--nex-primary, #00f2ff) 4px, var(--nex-primary, #00f2ff) 6px);
          opacity: 0.25;
          position: absolute;
          inset: 0;
        }

        .submit-btn {
          width: 100%;
          background: transparent;
          border: 1px solid var(--nex-accent, #ff007f);
          color: var(--nex-accent, #ff007f);
          padding: 12px;
          font-family: inherit;
          font-size: 10px;
          font-weight: bold;
          letter-spacing: 0.15em;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 14px;
          clip-path: polygon(0 0, 95% 0, 100% 12px, 100% 100%, 0 100%);
        }

        .submit-btn:hover {
          background: var(--nex-accent, #ff007f);
          color: #000;
          box-shadow: 0 0 10px var(--nex-glow, rgba(255, 0, 127, 0.3));
        }

        /* Watermark */
        .nex-badge-inline {
          position: absolute;
          top: 8px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 5px;
          color: rgba(255, 255, 255, 0.3);
          font-weight: 900;
          letter-spacing: 0.1em;
          z-index: 10;
          pointer-events: none;
        }
      </style>

      <div class="payment-wrapper">
        <div class="nex-badge-inline">
          <img class="nex-badge-logo" src="${logoSrc}" style="height: 5px; width: auto;" onerror="this.style.display='none'">
          <span>NEX_PAYMENT</span>
        </div>
        <div class="payment-header">PAYMENT_TERMINAL</div>
        
        <div class="summary-box">
          <div class="summary-row"><span>UPLINK_BANDWIDTH_LICENSE</span><span>$${this.price.toFixed(2)}</span></div>
          ${this.discount > 0 ? `<div class="summary-row" style="color:#ff007f;"><span>DISCOUNT (CODE: CYBER)</span><span>-$${this.discount.toFixed(2)}</span></div>` : ''}
          <div class="summary-row row-total"><span>TOTAL AMOUNT DUE</span><span>$${total.toFixed(2)}</span></div>
        </div>

        <div class="coupon-box">
          <input type="text" id="coupon" placeholder="ENTER COUPON CODE..." value="${this.couponCode}">
          <button class="coupon-btn">APPLY</button>
        </div>

        <div class="method-tabs">
          <div class="method-tab ${this.activeMethod === 'card' ? 'active' : ''}" data-method="card">CREDIT_CARD</div>
          <div class="method-tab ${this.activeMethod === 'upi' ? 'active' : ''}" data-method="upi">UPI_NODE</div>
          <div class="method-tab ${this.activeMethod === 'wallet' ? 'active' : ''}" data-method="wallet">WALLETS</div>
          <div class="method-tab ${this.activeMethod === 'qr' ? 'active' : ''}" data-method="qr">QR_SCAN</div>
        </div>

        <div class="method-fields">
          ${formContent}
        </div>

        <button type="button" class="submit-btn">AUTHORIZE PAYMENT</button>
      </div>
    `;
  }
}

customElements.define('nex-payment', NexPayment);
