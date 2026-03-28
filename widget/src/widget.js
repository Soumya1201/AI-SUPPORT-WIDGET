/**
 * widget/src/widget.js — The Embeddable Chat Widget
 *
 * This entire file gets compiled into a single widget.js file.
 * When included via <script> tag on any site, it:
 *   1. Reads data-bot-id from the script tag
 *   2. Fetches bot configuration from the API
 *   3. Injects a floating chat bubble + expandable chat window into the page
 *   4. Handles messaging with the AI backend
 *
 * Zero dependencies — pure vanilla JavaScript + injected CSS.
 */

(function () {
  "use strict";

  // ─── Configuration ───────────────────────────────────────────────────────────
  const API_BASE = "https://yourdomain.com/api"; // ← Change this to your backend URL

  // Find the script tag that loaded this file to read data attributes
  const scriptTag = document.currentScript ||
    document.querySelector('script[data-bot-id]');

  const BOT_ID = scriptTag?.getAttribute("data-bot-id");

  if (!BOT_ID) {
    console.warn("[BotDesk] No data-bot-id attribute found on the script tag.");
    return;
  }

  // ─── Session Management ───────────────────────────────────────────────────────
  // Generate or retrieve a unique session ID for this visitor
  const SESSION_KEY = `botdesk_session_${BOT_ID}`;
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }

  // ─── State ───────────────────────────────────────────────────────────────────
  let botConfig = null;       // Loaded from API
  let isOpen = false;         // Is the chat window visible?
  let isTyping = false;       // Is AI generating a response?
  let messages = [];          // In-memory message list for the current session

  // ─── Inject Styles ────────────────────────────────────────────────────────────
  function injectStyles(primaryColor) {
    const style = document.createElement("style");
    style.id = "botdesk-styles";
    style.textContent = `
      #botdesk-container * {
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0;
        padding: 0;
      }

      #botdesk-container {
        position: fixed;
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 12px;
      }

      #botdesk-container.bottom-right {
        bottom: 24px;
        right: 24px;
      }

      #botdesk-container.bottom-left {
        bottom: 24px;
        left: 24px;
        align-items: flex-start;
      }

      /* ── Chat Window ── */
      #botdesk-window {
        width: 360px;
        height: 520px;
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transform-origin: bottom right;
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
        transform: scale(0.85) translateY(16px);
        opacity: 0;
        pointer-events: none;
      }

      #botdesk-container.bottom-left #botdesk-window {
        transform-origin: bottom left;
      }

      #botdesk-window.open {
        transform: scale(1) translateY(0);
        opacity: 1;
        pointer-events: all;
      }

      @media (max-width: 420px) {
        #botdesk-window {
          width: calc(100vw - 32px);
          height: calc(100vh - 100px);
          max-height: 580px;
        }
      }

      /* ── Header ── */
      #botdesk-header {
        padding: 14px 16px;
        background: ${primaryColor};
        color: white;
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
      }

      #botdesk-avatar {
        font-size: 22px;
        line-height: 1;
      }

      #botdesk-header-info { flex: 1; min-width: 0; }

      #botdesk-header-name {
        font-size: 15px;
        font-weight: 600;
        color: white;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      #botdesk-header-status {
        font-size: 12px;
        color: rgba(255,255,255,0.8);
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 1px;
      }

      #botdesk-header-status::before {
        content: '';
        display: inline-block;
        width: 7px;
        height: 7px;
        background: #4ade80;
        border-radius: 50%;
      }

      #botdesk-close-btn {
        background: rgba(255,255,255,0.15);
        border: none;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
        flex-shrink: 0;
      }

      #botdesk-close-btn:hover { background: rgba(255,255,255,0.25); }

      /* ── Messages area ── */
      #botdesk-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: #f8fafc;
        scroll-behavior: smooth;
      }

      #botdesk-messages::-webkit-scrollbar { width: 4px; }
      #botdesk-messages::-webkit-scrollbar-track { background: transparent; }
      #botdesk-messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }

      /* ── Bubble ── */
      .botdesk-bubble {
        max-width: 82%;
        padding: 9px 13px;
        border-radius: 14px;
        font-size: 14px;
        line-height: 1.5;
        word-break: break-word;
        animation: botdesk-fadein 0.2s ease;
      }

      @keyframes botdesk-fadein {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .botdesk-bubble.user {
        align-self: flex-end;
        background: ${primaryColor};
        color: white;
        border-bottom-right-radius: 4px;
      }

      .botdesk-bubble.bot {
        align-self: flex-start;
        background: #ffffff;
        color: #1e293b;
        border-bottom-left-radius: 4px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.07);
      }

      /* ── Markdown-like styles inside bot bubbles ── */
      .botdesk-bubble.bot strong { font-weight: 600; }
      .botdesk-bubble.bot em { font-style: italic; }
      .botdesk-bubble.bot ul { padding-left: 16px; margin: 4px 0; }
      .botdesk-bubble.bot ol { padding-left: 16px; margin: 4px 0; }
      .botdesk-bubble.bot li { margin: 2px 0; }
      .botdesk-bubble.bot code {
        font-family: monospace;
        font-size: 12px;
        background: #f1f5f9;
        padding: 1px 5px;
        border-radius: 4px;
      }
      .botdesk-bubble.bot p { margin: 0 0 6px; }
      .botdesk-bubble.bot p:last-child { margin-bottom: 0; }

      /* ── Typing indicator ── */
      #botdesk-typing {
        display: none;
        align-self: flex-start;
        background: white;
        border-radius: 14px;
        border-bottom-left-radius: 4px;
        padding: 10px 14px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.07);
        animation: botdesk-fadein 0.2s ease;
      }

      #botdesk-typing.visible { display: flex; gap: 4px; align-items: center; }

      .botdesk-typing-dot {
        width: 7px;
        height: 7px;
        background: #94a3b8;
        border-radius: 50%;
        animation: botdesk-bounce 1.4s infinite ease-in-out;
      }

      .botdesk-typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .botdesk-typing-dot:nth-child(3) { animation-delay: 0.4s; }

      @keyframes botdesk-bounce {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
        40% { transform: scale(1); opacity: 1; }
      }

      /* ── Input area ── */
      #botdesk-input-area {
        padding: 12px;
        background: white;
        border-top: 1px solid #e2e8f0;
        display: flex;
        gap: 8px;
        align-items: flex-end;
        flex-shrink: 0;
      }

      #botdesk-input {
        flex: 1;
        border: 1.5px solid #e2e8f0;
        border-radius: 10px;
        padding: 9px 12px;
        font-size: 14px;
        color: #1e293b;
        resize: none;
        max-height: 100px;
        min-height: 40px;
        outline: none;
        transition: border-color 0.2s;
        font-family: inherit;
        background: #f8fafc;
        line-height: 1.4;
      }

      #botdesk-input:focus { border-color: ${primaryColor}; background: white; }
      #botdesk-input::placeholder { color: #94a3b8; }

      #botdesk-send-btn {
        width: 38px;
        height: 38px;
        background: ${primaryColor};
        border: none;
        border-radius: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.2s, transform 0.15s;
        flex-shrink: 0;
      }

      #botdesk-send-btn:hover { opacity: 0.88; transform: scale(1.04); }
      #botdesk-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

      #botdesk-send-btn svg { width: 16px; height: 16px; }

      /* ── Floating Bubble Button ── */
      #botdesk-bubble-btn {
        width: 58px;
        height: 58px;
        background: ${primaryColor};
        border-radius: 50%;
        border: none;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(0,0,0,0.18);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
        position: relative;
        flex-shrink: 0;
      }

      #botdesk-bubble-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 12px 32px rgba(0,0,0,0.22);
      }

      #botdesk-bubble-btn svg { width: 26px; height: 26px; transition: all 0.25s; }

      /* Unread badge */
      #botdesk-unread-badge {
        display: none;
        position: absolute;
        top: -2px;
        right: -2px;
        background: #ef4444;
        color: white;
        font-size: 11px;
        font-weight: 700;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid white;
        align-items: center;
        justify-content: center;
      }

      #botdesk-unread-badge.visible { display: flex; }

      /* ── Powered by ── */
      #botdesk-footer {
        text-align: center;
        padding: 5px;
        font-size: 10px;
        color: #94a3b8;
        letter-spacing: 0.3px;
        background: white;
        border-top: 1px solid #f1f5f9;
      }

      #botdesk-footer a { color: #94a3b8; text-decoration: none; }
      #botdesk-footer a:hover { color: ${primaryColor}; }
    `;
    document.head.appendChild(style);
  }

  // ─── Build Widget HTML ────────────────────────────────────────────────────────
  function buildWidget(config) {
    const container = document.createElement("div");
    container.id = "botdesk-container";
    container.className = config.settings?.position || "bottom-right";

    container.innerHTML = `
      <!-- Chat Window -->
      <div id="botdesk-window">
        <!-- Header -->
        <div id="botdesk-header">
          <div id="botdesk-avatar">${config.settings?.botAvatar || "🤖"}</div>
          <div id="botdesk-header-info">
            <div id="botdesk-header-name">${escapeHtml(config.name)}</div>
            <div id="botdesk-header-status">Online · AI Support</div>
          </div>
          <button id="botdesk-close-btn" aria-label="Close chat">✕</button>
        </div>

        <!-- Messages -->
        <div id="botdesk-messages">
          <!-- Typing indicator -->
          <div id="botdesk-typing">
            <div class="botdesk-typing-dot"></div>
            <div class="botdesk-typing-dot"></div>
            <div class="botdesk-typing-dot"></div>
          </div>
        </div>

        <!-- Input -->
        <div id="botdesk-input-area">
          <textarea
            id="botdesk-input"
            placeholder="Type your message..."
            rows="1"
            aria-label="Chat message"
          ></textarea>
          <button id="botdesk-send-btn" aria-label="Send message" disabled>
            <svg fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2.2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </div>

        <!-- Footer -->
        <div id="botdesk-footer">
          Powered by <a href="https://botdesk.ai" target="_blank">BotDesk</a>
        </div>
      </div>

      <!-- Floating Bubble Button -->
      <button id="botdesk-bubble-btn" aria-label="Open chat">
        <svg id="botdesk-chat-icon" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
        </svg>
        <div id="botdesk-unread-badge">1</div>
      </button>
    `;

    document.body.appendChild(container);
  }

  // ─── Render a message bubble ──────────────────────────────────────────────────
  function renderMessage(role, text) {
    const messagesEl = document.getElementById("botdesk-messages");
    const typingEl = document.getElementById("botdesk-typing");

    const bubble = document.createElement("div");
    bubble.className = `botdesk-bubble ${role === "user" ? "user" : "bot"}`;

    if (role === "assistant") {
      bubble.innerHTML = parseMarkdown(text);
    } else {
      bubble.textContent = text;
    }

    // Insert before the typing indicator (which is always last)
    messagesEl.insertBefore(bubble, typingEl);
    scrollToBottom();
  }

  // ─── Scroll messages to bottom ────────────────────────────────────────────────
  function scrollToBottom() {
    const el = document.getElementById("botdesk-messages");
    if (el) el.scrollTop = el.scrollHeight;
  }

  // ─── Show/hide typing indicator ───────────────────────────────────────────────
  function setTyping(show) {
    isTyping = show;
    const el = document.getElementById("botdesk-typing");
    if (el) {
      el.classList.toggle("visible", show);
      if (show) scrollToBottom();
    }
    const sendBtn = document.getElementById("botdesk-send-btn");
    if (sendBtn) sendBtn.disabled = show;
  }

  // ─── Send message to API ──────────────────────────────────────────────────────
  async function sendMessage(text) {
    if (!text.trim() || isTyping) return;

    // Render user message immediately
    renderMessage("user", text);
    messages.push({ role: "user", content: text });

    // Clear input
    const input = document.getElementById("botdesk-input");
    if (input) { input.value = ""; input.style.height = "auto"; }

    setTyping(true);

    try {
      const res = await fetch(`${API_BASE}/chat/${BOT_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to get response.");

      const reply = data.response;
      messages.push({ role: "assistant", content: reply });
      setTyping(false);
      renderMessage("assistant", reply);
    } catch (err) {
      setTyping(false);
      renderMessage("assistant", "Sorry, I'm having trouble right now. Please try again in a moment.");
      console.error("[BotDesk]", err.message);
    }
  }

  // ─── Open/close chat window ───────────────────────────────────────────────────
  function openChat() {
    isOpen = true;
    const win = document.getElementById("botdesk-window");
    const badge = document.getElementById("botdesk-unread-badge");
    if (win) win.classList.add("open");
    if (badge) badge.classList.remove("visible");
    scrollToBottom();
    // Focus input
    setTimeout(() => {
      const input = document.getElementById("botdesk-input");
      if (input) input.focus();
    }, 300);
  }

  function closeChat() {
    isOpen = false;
    const win = document.getElementById("botdesk-window");
    if (win) win.classList.remove("open");
  }

  // ─── Load conversation history ────────────────────────────────────────────────
  async function loadHistory() {
    try {
      const res = await fetch(`${API_BASE}/chat/${BOT_ID}/history/${sessionId}`);
      const data = await res.json();
      if (data.success && data.messages?.length) {
        data.messages.forEach((msg) => {
          renderMessage(msg.role, msg.content);
          messages.push({ role: msg.role, content: msg.content });
        });
      } else {
        // Show welcome message for new sessions
        renderMessage("assistant", botConfig.welcomeMessage || "Hi! How can I help you?");
      }
    } catch {
      renderMessage("assistant", botConfig.welcomeMessage || "Hi! How can I help you?");
    }
  }

  // ─── Wire up event listeners ──────────────────────────────────────────────────
  function attachEvents() {
    const bubbleBtn = document.getElementById("botdesk-bubble-btn");
    const closeBtn = document.getElementById("botdesk-close-btn");
    const sendBtn = document.getElementById("botdesk-send-btn");
    const input = document.getElementById("botdesk-input");

    bubbleBtn?.addEventListener("click", () => isOpen ? closeChat() : openChat());
    closeBtn?.addEventListener("click", closeChat);

    sendBtn?.addEventListener("click", () => {
      const val = input?.value?.trim();
      if (val) sendMessage(val);
    });

    // Send on Enter (Shift+Enter for newline)
    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const val = input.value?.trim();
        if (val) sendMessage(val);
      }
    });

    // Enable send button only when there's text
    input?.addEventListener("input", () => {
      const sendBtn = document.getElementById("botdesk-send-btn");
      if (sendBtn) sendBtn.disabled = !input.value.trim() || isTyping;
      // Auto-resize textarea
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 100) + "px";
    });
  }

  // ─── Simple Markdown Parser ───────────────────────────────────────────────────
  function parseMarkdown(text) {
    return text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/^### (.*$)/gm, "<strong>$1</strong>")
      .replace(/^## (.*$)/gm, "<strong>$1</strong>")
      .replace(/^- (.*$)/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br/>")
      .replace(/^(.+)$/gm, (m) => m.startsWith("<") ? m : `<p>${m}</p>`);
  }

  // ─── Sanitize HTML ────────────────────────────────────────────────────────────
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ─── Initialize ───────────────────────────────────────────────────────────────
  async function init() {
    try {
      // Fetch bot public config
      const res = await fetch(`${API_BASE}/bots/public/${BOT_ID}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        console.warn("[BotDesk] Bot not found or inactive:", BOT_ID);
        return;
      }

      botConfig = data.bot;
      const primaryColor = botConfig.settings?.primaryColor || "#6366f1";

      // Inject CSS
      injectStyles(primaryColor);

      // Build and mount widget
      buildWidget(botConfig);

      // Attach event listeners
      attachEvents();

      // Load previous conversation or welcome message
      await loadHistory();

      // Show unread badge after 3 seconds (for new sessions only)
      const isNewSession = messages.length === 0 ||
        (messages.length === 1 && messages[0].role === "assistant");

      if (isNewSession && !isOpen) {
        setTimeout(() => {
          const badge = document.getElementById("botdesk-unread-badge");
          if (badge && !isOpen) badge.classList.add("visible");
        }, 3000);
      }

      console.log(`[BotDesk] Widget loaded for bot: ${botConfig.name}`);
    } catch (err) {
      console.error("[BotDesk] Failed to initialize widget:", err.message);
    }
  }

  // ─── Boot ─────────────────────────────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
