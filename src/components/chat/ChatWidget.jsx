import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { getQuickSuggestions } from '../../services/chatService';
import ChatMessage from './ChatMessage';

const ChatWidget = () => {
  const {
    isOpen,
    toggleChat,
    messages,
    sendChatMessage,
    isLoading,
    error,
    setError,
    hasApiKey,
    remainingMessages,
    maxMessages,
    clearHistory
  } = useChat();

  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current && hasApiKey) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, hasApiKey]);

  // Hide suggestions after first message
  useEffect(() => {
    if (messages.length > 0) {
      setShowSuggestions(false);
    }
  }, [messages.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendChatMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendChatMessage(suggestion);
    setShowSuggestions(false);
  };

  const suggestions = getQuickSuggestions();

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #1976d2 0%, #2d6a4f 100%)',
          color: 'white',
          fontSize: '28px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(25, 118, 210, 0.4)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen ? 'scale(0.9) rotate(180deg)' : 'scale(1)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = isOpen ? 'scale(0.95) rotate(180deg)' : 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(25, 118, 210, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isOpen ? 'scale(0.9) rotate(180deg)' : 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(25, 118, 210, 0.4)';
        }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? '✕' : '🐟'}
      </button>

      {/* Chat Panel */}
      <div
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          width: '380px',
          maxWidth: 'calc(100vw - 48px)',
          height: '520px',
          maxHeight: 'calc(100vh - 140px)',
          background: 'linear-gradient(135deg, rgba(13, 79, 139, 0.95) 0%, rgba(45, 106, 79, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 999,
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #40916c, #2d6a4f)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
              🎣
            </div>
            <div>
              <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: '600' }}>
                Fishing Assistant
              </h3>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                {hasApiKey ? 'Online • Ask me anything!' : 'API key required'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                title="Clear chat history"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 100%)'
        }}>
          {/* Welcome message if no messages */}
          {messages.length === 0 && hasApiKey && (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: 'rgba(255,255,255,0.9)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🐟</div>
              <h4 style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                Hey there, angler!
              </h4>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, lineHeight: '1.5' }}>
                I'm your Louisiana fishing expert. Ask me about bait, spots, conditions, or how to use this app!
              </p>
            </div>
          )}

          {/* No API Key Message */}
          {!hasApiKey && (
            <div style={{
              textAlign: 'center',
              padding: '24px',
              color: 'rgba(255,255,255,0.9)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔑</div>
              <h4 style={{ margin: '0 0 12px 0', fontWeight: '600' }}>
                API Key Required
              </h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '14px', opacity: 0.8, lineHeight: '1.5' }}>
                To use the fishing assistant, add your OpenAI API key in the Preferences page.
              </p>
              <a
                href="/preferences"
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              >
                Go to Preferences →
              </a>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '18px 18px 18px 4px',
              maxWidth: '120px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#2d6a4f',
                      animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite`
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(229, 57, 53, 0.15)',
              border: '1px solid rgba(229, 57, 53, 0.3)',
              borderRadius: '12px',
              color: '#ffcdd2',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <div style={{ flex: 1 }}>
                {error}
                <button
                  onClick={() => setError(null)}
                  style={{
                    display: 'block',
                    marginTop: '8px',
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {hasApiKey && showSuggestions && messages.length === 0 && (
          <div style={{
            padding: '0 16px 12px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {suggestions.slice(0, 4).map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
                style={{
                  padding: '8px 14px',
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '20px',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        {hasApiKey && (
          <form onSubmit={handleSubmit} style={{
            padding: '12px 16px 16px',
            background: 'rgba(0, 0, 0, 0.15)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-end'
            }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about fishing..."
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingRight: '50px',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.15)';
                    e.target.style.borderColor = 'rgba(255,255,255,0.4)';
                  }}
                  onBlur={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.1)';
                    e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  border: 'none',
                  background: inputValue.trim() && !isLoading
                    ? 'linear-gradient(135deg, #40916c, #2d6a4f)'
                    : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '18px',
                  cursor: inputValue.trim() && !isLoading ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {isLoading ? '⏳' : '➤'}
              </button>
            </div>
            <div style={{
              marginTop: '8px',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.5)',
              textAlign: 'center'
            }}>
              {remainingMessages}/{maxMessages} messages remaining today
            </div>
          </form>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </>
  );
};

export default ChatWidget;






