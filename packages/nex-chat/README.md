# `<nex-chat>` Cyber Message Terminal

`<nex-chat>` encapsulates a terminal-styled secure chatting UI featuring bubble messages, emoji picking, read checkmark indicators, file sharing previews, and simulated voice playback nodes.

## CDN Installation
```html
<script src="https://cdn.jsdelivr.net/gh/abhinavgautam08/nex-sdk@v1.3.0/packages/nex-chat/nex-chat.min.js"></script>
```

## HTML Usage
```html
<nex-chat></nex-chat>
```

## API Reference
*   **Attributes**:
    *   `logo`: Custom logo image source path.
*   **Methods**:
    *   `addMessage(messageObject)`: Appends a message payload to the scrolling feed.
        *   Format: `{ sender: 'USER' | 'REMOTE', text: 'string', timestamp: 'string', read: boolean, image: 'url', file: { name, size }, voice: boolean }`
    *   `clearChat()`: Wipes messages history in the active console.
*   **Events**:
    *   `send-message`: Dispatched when the user presses Enter or clicks Send.
    *   `message-added`: Dispatched when a message enters the viewport registry.
