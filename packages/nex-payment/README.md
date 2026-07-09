# `<nex-payment>` Checkout Portal

`<nex-payment>` displays a secure mockup payment interface supporting multiple modes (Credit Card with updating interactive graphics, UPI VPA inputs, Wallet options, QR checkout scanning layouts), order summaries, and mock coupon entries.

## CDN Installation
```html
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.3.0/packages/nex-payment/nex-payment.min.js"></script>
```

## HTML Usage
```html
<nex-payment></nex-payment>
```

## API Reference
*   **Attributes**:
    *   `logo`: Custom logo image source path.
*   **Methods**:
    *   `applyCoupon(couponCode)`: Applies discount logic. Inputting `'CYBER'` grants a 20% discount.
    *   `setMethod(methodName)`: Switches active checkout view (`'card'`, `'upi'`, `'wallet'`, `'qr'`).
*   **Events**:
    *   `payment-submit`: Dispatched on payment confirmation clicks.
    *   `coupon-applied`: Dispatched on successful coupon entries.
