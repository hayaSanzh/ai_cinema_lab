(function () {
  "use strict";

  if (window.AIForgeChatbot) {
    return;
  }

  const API_BASE_URL = window.AIFORGE_API_URL || "http://localhost:3000/api";
  const STORAGE_KEY = "aiforge.chatbot.messages";
  const LOGO_SRC = "assets/img/logo/cinema-bot-icon.png";
  const MAX_STORED_MESSAGES = 20;

  const root = getRoot();
  let isOpen = false;
  let messages = loadMessages();

  if (!messages.length) {
    messages = [
      {
        id: createMessageId(),
        role: "assistant",
        content:
          "Hi, I am Cinema Bot. Ask me about AI Cinema Lab, the AI/Real Quiz, cases, the documentary film, or your profile.",
      },
    ];
  }

  window.AIForgeChatbot = {
    open,
    close,
    reset,
  };

  render();

  function getRoot() {
    if (window.AIForgeLayout && typeof window.AIForgeLayout.mountChatbot === "function") {
      return window.AIForgeLayout.mountChatbot();
    }

    let existingRoot = document.getElementById("aiforge-chatbot-root");

    if (!existingRoot) {
      document.body.insertAdjacentHTML(
        "beforeend",
        '<div id="aiforge-chatbot-root" class="aiforge-chatbot-root"></div>',
      );
      existingRoot = document.getElementById("aiforge-chatbot-root");
    }

    return existingRoot;
  }

  function open() {
    isOpen = true;
    render();
  }

  function close() {
    isOpen = false;
    render();
  }

  function reset() {
    messages = [];
    localStorage.removeItem(STORAGE_KEY);
    render();
  }

  function render() {
    if (!root) {
      return;
    }

    root.classList.toggle("is-open", isOpen);
    root.innerHTML = isOpen ? renderPanel() : renderToggle();
    bindEvents();

    if (isOpen) {
      scrollMessagesToBottom();
      const input = root.querySelector(".cinema-bot-input");

      if (input) {
        input.focus();
      }
    }
  }

  function renderToggle() {
    return `
      <button type="button" class="cinema-bot-toggle" aria-label="Open Cinema Bot">
        <span class="cinema-bot-toggle-icon" aria-hidden="true">
          <span></span>
          <span></span>
        </span>
      </button>
    `;
  }

  function renderPanel() {
    return `
      <section class="cinema-bot-panel" aria-label="Cinema Bot chat">
        <header class="cinema-bot-header">
          <div class="cinema-bot-brand">
            <span class="cinema-bot-brand-icon">${renderLogo()}</span>
            <span>Cinema Bot</span>
          </div>
          <button type="button" class="cinema-bot-close" aria-label="Close Cinema Bot">&times;</button>
        </header>

        <div class="cinema-bot-messages" role="log" aria-live="polite">
          ${messages.map(renderMessage).join("")}
        </div>

        <form class="cinema-bot-form">
          <input class="cinema-bot-input" type="text" name="message" maxlength="800" autocomplete="off" spellcheck="false" placeholder="Ask about the project...">
          <button class="cinema-bot-send" type="submit" aria-label="Send message">
            ${renderSendIcon()}
          </button>
        </form>
      </section>
    `;
  }

  function bindEvents() {
    const toggle = root.querySelector(".cinema-bot-toggle");
    const closeButton = root.querySelector(".cinema-bot-close");
    const form = root.querySelector(".cinema-bot-form");

    if (toggle) {
      toggle.addEventListener("click", open);
    }

    if (closeButton) {
      closeButton.addEventListener("click", close);
    }

    if (form) {
      form.addEventListener("submit", handleSubmit);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const input = root.querySelector(".cinema-bot-input");
    const text = input ? input.value.trim() : "";

    if (!text || hasPendingMessage()) {
      return;
    }

    const userMessage = {
      id: createMessageId(),
      role: "user",
      content: text,
    };
    const pendingMessage = {
      id: createMessageId(),
      role: "assistant",
      content: "",
      pending: true,
    };

    messages.push(userMessage, pendingMessage);
    persistMessages();
    render();

    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history: getHistoryForApi(userMessage.id),
          page: collectPageContext(),
        }),
      });
      const data = await parseJson(response);

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      replaceMessage(pendingMessage.id, {
        role: "assistant",
        content: data.message || "I could not find an answer about the project.",
      });
    } catch (error) {
      replaceMessage(pendingMessage.id, {
        role: "assistant",
        content:
          error.message ||
          "Cinema Bot is not available yet. Please check the backend and Gemini API key.",
        error: true,
      });
    }
  }

  function renderMessage(message) {
    const roleClass = message.role === "user" ? "is-user" : "is-assistant";
    const errorClass = message.error ? " is-error" : "";

    return `
      <article class="cinema-bot-message ${roleClass}${errorClass}">
        ${message.role === "assistant" ? `<span class="cinema-bot-avatar">${renderLogo()}</span>` : ""}
        <div class="cinema-bot-bubble">
          ${message.pending ? renderTyping() : formatMessage(message.content)}
        </div>
      </article>
    `;
  }

  function renderLogo() {
    return `<img src="${LOGO_SRC}" alt="">`;
  }

  function renderTyping() {
    return '<span class="cinema-bot-typing"><span></span><span></span><span></span></span>';
  }

  function renderSendIcon() {
    return `
      <svg width="17" height="17" viewBox="0 0 17 17" aria-hidden="true" focusable="false">
        <path d="M2 2.2 15 8.5 2 14.8l2-5.1 5.4-1.2L4 7.3 2 2.2Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
      </svg>
    `;
  }

  function formatMessage(content) {
    return escapeHtml(content).replace(/\n/g, "<br>");
  }

  function replaceMessage(id, nextMessage) {
    messages = messages.map((message) =>
      message.id === id
        ? {
            id,
            ...nextMessage,
          }
        : message,
    );
    persistMessages();
    render();
  }

  function getHistoryForApi(currentMessageId) {
    return messages
      .filter((message) => message.id !== currentMessageId && !message.pending && message.content)
      .slice(-10)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));
  }

  function collectPageContext() {
    const main = document.querySelector("main");
    const rawText = main ? main.innerText : document.body.innerText;
    const text = normalizeText(rawText).slice(0, 2500);

    return {
      title: document.title,
      path: window.location.pathname,
      text,
    };
  }

  function hasPendingMessage() {
    return messages.some((message) => message.pending);
  }

  function persistMessages() {
    const storedMessages = messages
      .filter((message) => !message.pending)
      .slice(-MAX_STORED_MESSAGES)
      .map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        error: Boolean(message.error),
      }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedMessages));
  }

  function loadMessages() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

      return Array.isArray(parsed)
        ? parsed.filter(
            (message) =>
              (message.role === "user" || message.role === "assistant") &&
              typeof message.content === "string",
          )
        : [];
    } catch (error) {
      return [];
    }
  }

  function scrollMessagesToBottom() {
    requestAnimationFrame(() => {
      const list = root.querySelector(".cinema-bot-messages");

      if (list) {
        list.scrollTop = list.scrollHeight;
      }
    });
  }

  async function parseJson(response) {
    try {
      return await response.json();
    } catch (error) {
      return {};
    }
  }

  function getErrorMessage(data) {
    if (Array.isArray(data.message)) {
      return data.message[0] || "Cinema Bot request failed.";
    }

    return data.message || "Cinema Bot request failed.";
  }

  function normalizeText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function createMessageId() {
    return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
})();
