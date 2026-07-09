# `<nex-auth>` Cyber Authentication Portal

`<nex-auth>` is a standalone, lightweight Web Component encapsulating Login, Register, Forgot Password, and OTP verification flows within a sleek cyberpunk visual structure.

## CDN Installation
```html
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.3.0/packages/nex-auth/nex-auth.min.js"></script>
```

## HTML Usage
```html
<nex-auth session-timeout="300" endpoint="https://api.nex.net/auth"></nex-auth>
```

## API Reference
*   **Attributes**:
    *   `session-timeout`: Timeout in seconds (default: 300).
    *   `endpoint`: Destination URL for credential payloads.
    *   `logo`: Custom logo image source path.
*   **Methods**:
    *   `logout()`: Clears active session states.
    *   `showView(viewName)`: Toggles active panel (`'login'`, `'register'`, `'forgot'`, `'otp'`).
*   **Events**:
    *   `auth-submit`: Dispatched on form submissions containing inputs data payload.
    *   `auth-success`: Dispatched on successful logins.
