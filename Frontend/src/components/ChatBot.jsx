import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles } from 'lucide-react';
import { askDatabase } from '../api/aiApi';
import './ChatBot.css';

const SUGGESTIONS = [
  'How many patents are granted?',
  'Show patents by year',
  'Top countries by patents',
  'List utility vs design count',
];

const TypingIndicator = () => (
  <div className="chat-message bot typing">
    <div className="chat-avatar">
      <Bot size={14} />
    </div>
    <div className="chat-bubble">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  </div>
);

const ChatMessage = ({ message }) => (
  <div className={`chat-message ${message.role}`}>
    <div className="chat-avatar">
      {message.role === 'user' ? 'You' : <Bot size={14} />}
    </div>
    <div className={`chat-bubble ${message.isError ? 'error' : ''}`}>
      {message.text}
    </div>
  </div>
);

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const question = (text || input).trim();
    if (!question || isLoading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setIsLoading(true);

    try {
      const data = await askDatabase(question);
      const answer = data?.data?.answer || 'No answer returned.';
      setMessages((prev) => [...prev, { role: 'bot', text: answer }]);
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || 'Something went wrong. Please try again.';
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: errMsg, isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestion = (suggestion) => {
    sendMessage(suggestion);
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const isEmpty = messages.length === 0;

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window" role="dialog" aria-label="IPR AI Assistant">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-header-icon">
                <Sparkles size={16} />
              </div>
              <div>
                <h3>IPR AI Assistant</h3>
                <p>Ask anything about patents</p>
              </div>
            </div>
            <button
              className="chatbot-close-btn"
              onClick={handleToggle}
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {isEmpty ? (
              <div className="chatbot-empty">
                <div className="chatbot-empty-icon">
                  <Bot size={22} />
                </div>
                <h4>Hello! I'm your IPR Assistant</h4>
                <p>Ask me anything about the patents database — counts, trends, inventors, and more.</p>
                <div className="chatbot-suggestions">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      className="chatbot-suggestion-chip"
                      onClick={() => handleSuggestion(s)}
                      disabled={isLoading}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <ChatMessage key={i} message={msg} />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Bar */}
          <div className="chatbot-input-bar">
            <input
              ref={inputRef}
              id="chatbot-input"
              className="chatbot-input"
              type="text"
              placeholder="Ask about patents..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              autoComplete="off"
            />
            <button
              id="chatbot-send-btn"
              className="chatbot-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        id="chatbot-toggle-btn"
        className={`chatbot-toggle ${isOpen ? 'open' : 'closed'}`}
        onClick={handleToggle}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        title="IPR AI Assistant"
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
    </>
  );
};

export default ChatBot;
