/*! nex-chat v1.3.0 | (c) 2026 NEX SDK | MIT License */
class NexChat extends HTMLElement {
  static get observedAttributes() {
    return ['logo'];
  }

  constructor() {
    super();
    this.messages = [];
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.attachEvents();
    this.scrollToBottom();
  }

  disconnectedCallback() {}

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'logo' && this.shadowRoot) {
      const img = this.shadowRoot.querySelector('.nex-badge-logo');
      if (img) img.src = newVal || '../logo/logo.webp';
    }
  }

  addMessage(message) {
    this.messages.push(message);
    this.renderMessages();
    this.scrollToBottom();
    this.dispatchEvent(new CustomEvent('message-added', { detail: { message } }));
  }

  clearChat() {
    this.messages = [];
    this.renderMessages();
  }

  attachEvents() {
    const shadow = this.shadowRoot;
    const sendBtn = shadow.querySelector('.send-btn');
    const input = shadow.querySelector('.chat-input');
    const emojiBtn = shadow.querySelector('.emoji-btn');
    const emojiPanel = shadow.querySelector('.emoji-panel');

    const handleSend = () => {
      const text = input.value.trim();
      if (!text) return;
      
      const newMsg = {
        id: Date.now(),
        sender: 'USER',
        text: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      };
      
      this.addMessage(newMsg);
      input.value = '';
      this.dispatchEvent(new CustomEvent('send-message', { detail: { message: newMsg } }));
    };

    if (sendBtn) sendBtn.addEventListener('click', handleSend);
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSend();
      });
    }

    if (emojiBtn && emojiPanel) {
      emojiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiPanel.classList.toggle('hidden');
      });

      shadow.querySelectorAll('.emoji-item').forEach(item => {
        item.addEventListener('click', () => {
          input.value += item.textContent;
          emojiPanel.classList.add('hidden');
          input.focus();
        });
      });

      shadow.addEventListener('click', () => {
        emojiPanel.classList.add('hidden');
      });
    }
  }

  renderMessages() {
    const feed = this.shadowRoot.querySelector('.chat-feed');
    if (!feed) return;

    if (this.messages.length === 0) {
      feed.innerHTML = `
        <div class="empty-state">
          <span>NO_ACTIVE_TRANSMISSION</span>
        </div>
      `;
      return;
    }

    feed.innerHTML = this.messages.map(msg => {
      const isUser = msg.sender === 'USER';
      const bubbleClass = isUser ? 'msg-user' : 'msg-remote';
      const readTick = isUser ? `<span class="read-status">${msg.read ? '✓✓' : '✓'}</span>` : '';
      
      let attachmentHtml = '';
      if (msg.image) {
        attachmentHtml = `<img class="msg-img" src="${msg.image}" alt="Attachment">`;
      } else if (msg.file) {
        attachmentHtml = `
          <div class="msg-file">
            <span class="material-symbols-outlined">description</span>
            <div class="file-info">
              <span class="file-name">${msg.file.name}</span>
              <span class="file-size">${msg.file.size}</span>
            </div>
          </div>
        `;
      } else if (msg.voice) {
        attachmentHtml = `
          <div class="msg-voice">
            <button class="voice-play-btn">▶</button>
            <div class="voice-waves">
              <span class="wave-bar"></span>
              <span class="wave-bar"></span>
              <span class="wave-bar"></span>
              <span class="wave-bar"></span>
            </div>
          </div>
        `;
      }

      return `
        <div class="msg-row ${isUser ? 'row-user' : 'row-remote'}">
          <div class="msg-bubble ${bubbleClass}">
            ${attachmentHtml}
            ${msg.text ? `<div class="msg-text">${msg.text}</div>` : ''}
            <div class="msg-meta">
              <span>${msg.timestamp}</span>
              ${readTick}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  scrollToBottom() {
    const feed = this.shadowRoot.querySelector('.chat-feed');
    if (feed) {
      feed.scrollTop = feed.scrollHeight;
    }
  }

  render() {
    const logoSrc = this.getAttribute('logo') || '../logo/logo.webp';
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 450px;
          height: 480px;
          font-family: 'Orbitron', 'JetBrains Mono', monospace, sans-serif;
          --nex-primary: var(--nex-primary, #00f2ff);
          --nex-accent: var(--nex-accent, #ff007f);
          --nex-bg: var(--nex-bg, #070707);
          --nex-glow: var(--nex-glow, rgba(0, 242, 255, 0.3));
          box-sizing: border-box;
        }

        .chat-container {
          position: relative;
          width: 100%;
          height: 100%;
          background: var(--nex-bg, #070707);
          border: 1px solid var(--nex-glow, rgba(0, 242, 255, 0.3));
          box-shadow: 0 0 15px var(--nex-glow, rgba(0, 242, 255, 0.3));
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          clip-path: polygon(0 0, 95% 0, 100% 5%, 100% 100%, 0 100%);
        }

        .chat-header {
          padding: 14px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.15em;
          color: var(--nex-primary, #00f2ff);
          text-shadow: 0 0 5px var(--nex-glow, rgba(0, 242, 255, 0.3));
          text-transform: uppercase;
        }

        .chat-feed {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background-image: linear-gradient(rgba(0, 242, 255, 0.01) 1px, transparent 0), linear-gradient(90deg, rgba(255, 0, 127, 0.01) 1px, transparent 0);
          background-size: 20px 20px;
        }

        .empty-state {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          font-weight: bold;
          color: rgba(255, 255, 255, 0.25);
          letter-spacing: 0.15em;
        }

        .msg-row {
          display: flex;
          width: 100%;
        }

        .row-user {
          justify-content: flex-end;
        }

        .row-remote {
          justify-content: flex-start;
        }

        .msg-bubble {
          max-width: 75%;
          padding: 10px 12px;
          box-sizing: border-box;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          line-height: 1.5;
          position: relative;
        }

        .msg-user {
          background: rgba(0, 242, 255, 0.05);
          border: 1px solid var(--nex-primary, #00f2ff);
          color: #ffffff;
          clip-path: polygon(0 0, 100% 0, 100% 90%, 94% 100%, 0 100%);
        }

        .msg-remote {
          background: rgba(255, 0, 127, 0.05);
          border: 1px solid var(--nex-accent, #ff007f);
          color: #ffffff;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 6% 100%, 0 90%);
        }

        .msg-text {
          word-break: break-word;
        }

        .msg-meta {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 4px;
          font-size: 7px;
          color: rgba(255, 255, 255, 0.35);
          margin-top: 4px;
        }

        .read-status {
          color: var(--nex-primary, #00f2ff);
        }

        /* Input Controls */
        .chat-input-bar {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding: 12px;
          display: flex;
          gap: 8px;
          background: #030303;
          align-items: center;
          position: relative;
        }

        .chat-input {
          flex: 1;
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 10px 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          outline: none;
          box-sizing: border-box;
        }

        .chat-input:focus {
          border-color: var(--nex-primary, #00f2ff);
        }

        .bar-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          width: 34px;
          height: 34px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }

        .bar-btn:hover {
          border-color: var(--nex-primary, #00f2ff);
          color: var(--nex-primary, #00f2ff);
        }

        .send-btn {
          border-color: var(--nex-accent, #ff007f);
          color: var(--nex-accent, #ff007f);
        }

        .send-btn:hover {
          background: var(--nex-accent, #ff007f);
          color: #000;
        }

        /* Emoji Panel */
        .emoji-panel {
          position: absolute;
          bottom: 56px;
          left: 12px;
          background: #080808;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px;
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 4px;
          z-index: 100;
        }

        .emoji-item {
          font-size: 14px;
          cursor: pointer;
          padding: 4px;
          text-align: center;
        }

        .emoji-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        /* Attachments Styling */
        .msg-img {
          max-width: 100%;
          max-height: 150px;
          display: block;
          margin-bottom: 6px;
        }

        .msg-file {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 6px 10px;
          margin-bottom: 6px;
        }

        .file-info {
          display: flex;
          flex-direction: column;
        }

        .file-name {
          font-size: 9px;
          font-weight: bold;
          color: #fff;
        }

        .file-size {
          font-size: 7px;
          color: rgba(255, 255, 255, 0.4);
        }

        .msg-voice {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.03);
          padding: 6px 10px;
          margin-bottom: 6px;
        }

        .voice-play-btn {
          background: transparent;
          border: none;
          color: var(--nex-primary, #00f2ff);
          cursor: pointer;
          font-size: 10px;
        }

        .voice-waves {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .wave-bar {
          width: 2px;
          height: 10px;
          background: var(--nex-primary, #00f2ff);
          display: inline-block;
        }

        .wave-bar:nth-child(2) { height: 16px; }
        .wave-bar:nth-child(3) { height: 12px; }
        .wave-bar:nth-child(4) { height: 8px; }

        /* Watermark */
        .nex-badge-inline {
          position: absolute;
          top: 14px;
          right: 18px;
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

        .hidden { display: none !important; }
      </style>

      <div class="chat-container">
        <div class="nex-badge-inline">
          <img class="nex-badge-logo" src="${logoSrc}" style="height: 5px; width: auto;" onerror="this.style.display='none'">
          <span>NEX_CHAT</span>
        </div>
        <div class="chat-header">TRANSMISSION_GATEWAY</div>
        <div class="chat-feed"></div>
        <div class="chat-input-bar">
          <div class="emoji-panel hidden">
            <span class="emoji-item">📡</span>
            <span class="emoji-item">🤖</span>
            <span class="emoji-item">☣️</span>
            <span class="emoji-item">⚡</span>
            <span class="emoji-item">💾</span>
            <span class="emoji-item">💻</span>
          </div>
          <button class="bar-btn emoji-btn">📡</button>
          <input type="text" class="chat-input" placeholder="INPUT TRANSMISSION_LOG...">
          <button class="bar-btn send-btn">▶</button>
        </div>
      </div>
    `;
  }
}

customElements.define('nex-chat', NexChat);
