import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Minimize2, Maximize2, Sparkles, User } from 'lucide-react';
import { knowledgeBaseData } from '../lib/knowledge-base-data';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get API endpoint from environment variable or use default
  const API_ENDPOINT = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_ENDPOINT) || '/api/chat';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show welcome message when chat opens for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: "Hi! 🐾 Welcome to CFAR - the Central Florida Animal Reserve. I'm an AI helper, here to answer questions about our big cat reserve, visiting, tours, residents, and more. How can I help you today?",
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call the SECURE server-side API
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          knowledgeBase: JSON.stringify(knowledgeBaseData),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // Fallback mock response for preview environment (silently handle error)
      const mockResponse = getMockResponse(userMessage.content);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: mockResponse,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const sendQuickAction = async (question: string) => {
    if (isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          knowledgeBase: JSON.stringify(knowledgeBaseData),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // Fallback mock response for preview environment (silently handle error)
      const mockResponse = getMockResponse(userMessage.content);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: mockResponse,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 bg-[#7d401b] text-white rounded-full p-4 shadow-lg hover:bg-[#8F6A54] transition-colors z-50"
            style={{ fontFamily: 'Lato, sans-serif' }}
          >
            <MessageCircle size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '60px' : '650px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[400px] bg-[#fff2dc] rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
            style={{ fontFamily: 'Lato, sans-serif' }}
          >
            {/* Header */}
            <div className="bg-[#7d401b] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={20} />
                <h3 className="font-semibold text-lg leading-tight">CFAR Assistant</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="hover:bg-[#8F6A54] p-1 rounded transition-colors"
                >
                  {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-[#8F6A54] p-1 rounded transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Action Buttons */}
                <div className="px-4 pt-4 pb-3">
                  {/* Quick Action Buttons */}
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => sendQuickAction('What are your hours?')}
                      className="border-2 border-[#7d401b] text-[#7d401b] bg-[#fff2dc] hover:bg-[#7d401b] hover:text-white py-2 px-4 rounded-full text-sm font-semibold transition-colors uppercase"
                    >
                      HOURS
                    </button>
                    <button
                      onClick={() => sendQuickAction('How can I volunteer?')}
                      className="border-2 border-[#7d401b] text-[#7d401b] bg-[#fff2dc] hover:bg-[#7d401b] hover:text-white py-2 px-4 rounded-full text-sm font-semibold transition-colors uppercase"
                    >
                      VOLUNTEER
                    </button>
                    <button
                      onClick={() => sendQuickAction('Tell me about upcoming events')}
                      className="border-2 border-[#7d401b] text-[#7d401b] bg-[#fff2dc] hover:bg-[#7d401b] hover:text-white py-2 px-4 rounded-full text-sm font-semibold transition-colors uppercase"
                    >
                      EVENTS
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 space-y-3 bg-white">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-2 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#fff2dc] flex items-center justify-center text-lg mt-1">
                          🐾
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-[#7d401b] text-white'
                            : 'bg-[#f0f0f0] text-black shadow-sm'
                        }`}
                      >
                        <p className="text-base whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        {message.role === 'assistant' && (
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#7d401b] flex items-center justify-center text-white mt-1">
                          <User size={18} />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#fff2dc] flex items-center justify-center text-lg">
                        🐾
                      </div>
                      <div className="bg-[#f0f0f0] shadow-sm rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-[#8F6A54] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-[#8F6A54] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-[#8F6A54] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="px-4 py-4 bg-[#f5f5f5]">
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="What are your hours?"
                      className="flex-1 bg-white border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#7d401b] text-black placeholder-gray-400 px-4 py-2.5 rounded-[10px]"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputValue.trim()}
                      className="bg-[#D97642] text-white px-4 py-2.5 rounded-[10px] hover:bg-[#c96836] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Mock response function for preview environment
function getMockResponse(question: string): string {
  const mockResponses: { [key: string]: string } = {
    'What are your hours?': 'Our hours are 10 AM to 5 PM, Monday through Saturday.',
    'How can I volunteer?': 'You can volunteer by visiting our website and filling out the volunteer form.',
    'Tell me about upcoming events': 'We have a big cat adoption event next month. Check our events page for details.',
  };

  return mockResponses[question] || "I'm sorry, I don't have a specific answer for that. Please visit our website for more information.";
}