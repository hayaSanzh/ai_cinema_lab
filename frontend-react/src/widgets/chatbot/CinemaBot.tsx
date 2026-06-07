import { Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../shared/api/http';

type ChatbotRole = 'user' | 'assistant';

type ChatbotMessage = {
  id: string;
  role: ChatbotRole;
  content: string;
  pending?: boolean;
  error?: boolean;
};

type ChatbotResponse = {
  message: string;
  model: string;
};

export function CinemaBot() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatbotMessage[]>(() => [
    {
      id: 'intro',
      role: 'assistant',
      content: t('chatbot.intro'),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const hasPendingMessage = messages.some((message) => message.pending);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const messageText = input.trim();

    if (!messageText || hasPendingMessage) {
      return;
    }

    const userMessage: ChatbotMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText,
    };
    const pendingMessage: ChatbotMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      pending: true,
    };

    setInput('');
    setMessages((currentMessages) => [...currentMessages, userMessage, pendingMessage]);

    try {
      const response = await apiRequest<ChatbotResponse>('/chatbot/messages', {
        method: 'POST',
        body: JSON.stringify({
          message: messageText,
          history: messages
            .filter((message) => !message.pending)
            .slice(-10)
            .map((message) => ({
              role: message.role,
              content: getMessageContent(message, t),
            })),
          page: collectPageContext(),
          language: i18n.language,
        }),
      });

      replaceMessage(pendingMessage.id, {
        role: 'assistant',
        content: response.message,
      });
    } catch (error) {
      replaceMessage(pendingMessage.id, {
        role: 'assistant',
        content: error instanceof Error ? error.message : t('chatbot.unavailable'),
        error: true,
      });
    }
  }

  function replaceMessage(id: string, nextMessage: Omit<ChatbotMessage, 'id'>) {
    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === id
          ? {
              id,
              ...nextMessage,
            }
          : message,
      ),
    );
  }

  if (!isOpen) {
    return (
      <div className="aiforge-chatbot-root">
        <button type="button" className="cinema-bot-toggle" aria-label={t('chatbot.open')} onClick={() => setIsOpen(true)}>
          <span className="cinema-bot-toggle-icon">
            <span />
            <span />
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="aiforge-chatbot-root is-open">
      <section className="cinema-bot-panel" aria-label="Cinema Bot chat">
        <header className="cinema-bot-header">
          <div className="cinema-bot-brand">
            <span className="cinema-bot-brand-icon">
              <img src="/assets/img/logo/cinema-bot-icon.png" alt="" />
            </span>
            <strong>{t('chatbot.title')}</strong>
          </div>
          <button type="button" className="cinema-bot-close" aria-label={t('chatbot.close')} onClick={() => setIsOpen(false)}>
            <X size={22} aria-hidden="true" />
          </button>
        </header>

        <div className="cinema-bot-messages" ref={messagesRef}>
          {messages.map((message) => (
            <article
              key={message.id}
              className={`cinema-bot-message is-${message.role}${message.error ? ' is-error' : ''}`}
            >
              {message.role === 'assistant' ? (
                <span className="cinema-bot-avatar">
                  <img src="/assets/img/logo/cinema-bot-icon.png" alt="" />
                </span>
              ) : null}
              <p className="cinema-bot-bubble">
                {message.pending ? (
                  <span className="cinema-bot-typing" aria-label={t('chatbot.typing')}>
                    <span />
                    <span />
                    <span />
                  </span>
                ) : (
                  getMessageContent(message, t)
                )}
              </p>
            </article>
          ))}
        </div>

        <form className="cinema-bot-form" onSubmit={handleSubmit}>
          <input
            className="cinema-bot-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t('chatbot.placeholder')}
            maxLength={800}
            spellCheck={false}
          />
          <button type="submit" className="cinema-bot-send" aria-label={t('chatbot.send')} disabled={hasPendingMessage}>
            <Send size={19} aria-hidden="true" />
          </button>
        </form>
      </section>
    </div>
  );
}

function getMessageContent(message: ChatbotMessage, t: (key: string) => string) {
  return message.id === 'intro' ? t('chatbot.intro') : message.content;
}

function collectPageContext() {
  const main = document.querySelector('main');

  return {
    title: document.title,
    path: window.location.pathname,
    text: (main?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 2500),
  };
}
