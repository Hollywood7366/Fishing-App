import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sendMessage } from '../services/chatService';

const ChatContext = createContext();

// Rate limiting constants
const MAX_MESSAGES_PER_DAY = 20;
const RATE_LIMIT_KEY = 'fishing_chat_rate_limit';
const API_KEY_STORAGE_KEY = 'fishing_chat_api_key';
const CHAT_HISTORY_KEY = 'fishing_chat_history';

export const ChatProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [messageCount, setMessageCount] = useState(0);

  // Load API key and chat history on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }

    const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        // Only load last 20 messages to keep context manageable
        setMessages(parsed.slice(-20));
      } catch (e) {
        console.error('Failed to parse chat history:', e);
      }
    }

    // Load rate limit data
    const rateLimitData = localStorage.getItem(RATE_LIMIT_KEY);
    if (rateLimitData) {
      try {
        const { count, date } = JSON.parse(rateLimitData);
        const today = new Date().toDateString();
        if (date === today) {
          setMessageCount(count);
        } else {
          // Reset for new day
          localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: 0, date: today }));
        }
      } catch (e) {
        console.error('Failed to parse rate limit data:', e);
      }
    }
  }, []);

  // Save chat history when messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages.slice(-50)));
    }
  }, [messages]);

  // Save API key when it changes
  const updateApiKey = useCallback((newKey) => {
    setApiKey(newKey);
    if (newKey) {
      localStorage.setItem(API_KEY_STORAGE_KEY, newKey);
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
    setError(null);
  }, []);

  // Check rate limit
  const checkRateLimit = useCallback(() => {
    if (messageCount >= MAX_MESSAGES_PER_DAY) {
      return false;
    }
    return true;
  }, [messageCount]);

  // Increment rate limit counter
  const incrementRateLimit = useCallback(() => {
    const newCount = messageCount + 1;
    setMessageCount(newCount);
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
      count: newCount,
      date: new Date().toDateString()
    }));
  }, [messageCount]);

  // Send a message
  const sendChatMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim()) return;

    // Check for API key
    if (!apiKey) {
      setError('Please add your OpenAI API key in Preferences to use the chat assistant.');
      return;
    }

    // Check rate limit
    if (!checkRateLimit()) {
      setError(`Daily limit reached (${MAX_MESSAGES_PER_DAY} messages). Try again tomorrow!`);
      return;
    }

    setError(null);
    setIsLoading(true);

    // Add user message to chat
    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Prepare messages for API (last 10 messages for context)
      const contextMessages = [...messages.slice(-10), newUserMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await sendMessage(contextMessages, apiKey);

      // Add assistant response
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      incrementRateLimit();
    } catch (err) {
      setError(err.message);
      // Remove the user message if there was an error
      setMessages(prev => prev.filter(msg => msg.id !== newUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, messages, checkRateLimit, incrementRateLimit]);

  // Toggle chat open/closed
  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
    setError(null);
  }, []);

  // Clear chat history
  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
  }, []);

  // Get remaining messages for today
  const remainingMessages = MAX_MESSAGES_PER_DAY - messageCount;

  const value = {
    isOpen,
    setIsOpen,
    toggleChat,
    messages,
    sendChatMessage,
    isLoading,
    error,
    setError,
    apiKey,
    updateApiKey,
    hasApiKey: !!apiKey,
    remainingMessages,
    maxMessages: MAX_MESSAGES_PER_DAY,
    clearHistory
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    // Fallback that actually works with localStorage during HMR
    const savedKey = typeof window !== 'undefined' ? localStorage.getItem(API_KEY_STORAGE_KEY) || '' : '';
    return {
      isOpen: false,
      setIsOpen: () => {},
      toggleChat: () => {},
      messages: [],
      sendChatMessage: () => {},
      isLoading: false,
      error: null,
      setError: () => {},
      apiKey: savedKey,
      updateApiKey: (newKey) => {
        if (typeof window !== 'undefined') {
          if (newKey) {
            localStorage.setItem(API_KEY_STORAGE_KEY, newKey);
          } else {
            localStorage.removeItem(API_KEY_STORAGE_KEY);
          }
          // Force a page reload to reinitialize context
          window.location.reload();
        }
      },
      hasApiKey: !!savedKey,
      remainingMessages: 20,
      maxMessages: 20,
      clearHistory: () => {}
    };
  }
  return context;
};

