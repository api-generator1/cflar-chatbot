import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Minimize2, Maximize2, Sparkles, User } from 'lucide-react';
// Import knowledge base directly as a module (more reliable than fetching)
import knowledgeBaseData from '../src/knowledge-base';

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
  const [knowledgeBase, setKnowledgeBase] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🚨 ASTERISK CLEANUP FUNCTION
  // Removes all asterisks from AI responses since the AI keeps using them despite instructions
  const removeAsterisks = (text: string): string => {
    return text.replace(/\*/g, '');
  };

  // Load knowledge base on mount
  useEffect(() => {
    setKnowledgeBase(knowledgeBaseData);
  }, []);

  // Get API endpoint - use absolute URL when embedded, relative when in preview
  const isEmbedded =
    !window.location.hostname.includes('vercel.app') &&
    !window.location.hostname.includes('localhost');
  const API_ENDPOINT = isEmbedded ? 'https://cflar-chatbot.vercel.app/api/chat' : '/api/chat';

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
          content:
            "Hi! 🐾 Welcome to CFAR - the Central Florida Animal Reserve. I'm an AI helper, here to answer questions about our big cat reserve, visiting, tours, residents, and more. How can I help you today?",
        },
      ]);
    }
  }, [isOpen, messages.length]);

  // Convert markdown links [text](url) to clickable HTML links
  const renderMessageContent = (content: string) => {
    const htmlContent = content.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="cflar-chat-link">$1</a>'
    );

    return { __html: htmlContent };
  };

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
      // Call the SECURE server-side API with streaming
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          knowledgeBase: JSON.stringify(knowledgeBase),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      // Add empty assistant message that we'll update as content streams in
      const messageIndex = messages.length + 1; // +1 because we already added user message
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;

            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);

              if (parsed.content) {
                accumulatedContent += parsed.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[messageIndex] = {
                    role: 'assistant',
                    content: removeAsterisks(accumulatedContent),
                  };
                  return updated;
                });
              }

              if (parsed.error) throw new Error(parsed.error);
            } catch {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);

      // Fallback mock response for preview environment
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          knowledgeBase: JSON.stringify(knowledgeBase),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      const messageIndex = messages.length + 1;
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;

            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);

              if (parsed.content) {
                accumulatedContent += parsed.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[messageIndex] = {
                    role: 'assistant',
                    content: removeAsterisks(accumulatedContent),
                  };
                  return updated;
                });
              }

              if (parsed.error) throw new Error(parsed.error);
            } catch {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);

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
    <div id="cflar-chatbot-root">
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
            className="fixed bottom-6 right-6 !bg-cflar-brown text-white rounded-full p-4 shadow-lg hover:!bg-cflar-brown-hover transition-colors z-50"
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
              height: isMinimized ? '60px' : '650px',
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[400px] bg-cflar-cream rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="cflar-header bg-cflar-brown text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={20} />
                <div className="cflar-title font-semibold text-lg text-white leading-none tracking-wide">
  CFAR Assistant
</div>

              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="cflar-iconbtn !bg-transparent hover:!bg-cflar-brown-hover rounded transition-colors"

                >
                  {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="cflar-iconbtn !bg-transparent hover:!bg-cflar-brown-hover rounded transition-colors"

                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Action Buttons */}
                <div className="cflar-subheader">

                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => sendQuickAction('What are your hours?')}
                      className="cflar-quick !border-2 !border-cflar-brown !text-cflar-brown !bg-cflar-cream hover:!bg-cflar-brown hover:!text-white !rounded-full font-semibold transition-colors uppercase"

                    >
                      HOURS
                    </button>
                    <button
                      onClick={() => sendQuickAction('How can I volunteer?')}
                      className="cflar-quick !border-2 !border-cflar-brown !text-cflar-brown !bg-cflar-cream hover:!bg-cflar-brown hover:!text-white !rounded-full font-semibold transition-colors uppercase"

                    >
                      VOLUNTEER
                    </button>
                    <button
                      onClick={() => sendQuickAction('Tell me about upcoming events')}
                      className="cflar-quick !border-2 !border-cflar-brown !text-cflar-brown !bg-cflar-cream hover:!bg-cflar-brown hover:!text-white !rounded-full font-semibold transition-colors uppercase"

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
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cflar-cream flex items-center justify-center text-lg mt-1">
                          🐾
                        </div>
                      )}

                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-cflar-brown text-white'
                            : 'bg-cflar-bubble text-black shadow-sm'
                        }`}
                      >
                        <div
                          className="text-base whitespace-pre-wrap leading-relaxed"
                          style={{ margin: 0, padding: 0 }}
                          dangerouslySetInnerHTML={renderMessageContent(message.content)}
                        />
                        {message.role === 'assistant' && message.content && (
                          <p className="text-xs text-gray-500 mt-2" style={{ margin: '8px 0 0 0', padding: 0 }}>
                            {new Date().toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>

                      {message.role === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cflar-brown flex items-center justify-center text-white mt-1">
                          <User size={18} />
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cflar-cream flex items-center justify-center text-lg">
                        🐾
                      </div>
                      <div className="bg-cflar-bubble shadow-sm rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div
                            className="w-2 h-2 bg-cflar-brown-hover rounded-full animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          />
                          <div
                            className="w-2 h-2 bg-cflar-brown-hover rounded-full animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          />
                          <div
                            className="w-2 h-2 bg-cflar-brown-hover rounded-full animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="px-4 py-4 bg-gray-100">
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="What are your hours?"
                      className="flex-1 bg-white border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-cflar-brown text-black placeholder-gray-400 px-4 py-2.5 rounded-[10px]"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputValue.trim()}
                      className="!bg-cflar-send text-white px-4 py-2.5 rounded-[10px] hover:!bg-cflar-send-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
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
    </div>
  );
}

// Mock response function for preview environment
function getMockResponse(question: string): string {
  const mockResponses: { [key: string]: string } = {
    'What are your hours?':
      'Visit the [Tours page](https://cflar.dream.press/visit/tours) to see our hours and book a tour!',
    'How can I volunteer?':
      'Check out our [Volunteer page](https://cflar.dream.press/get-involved/volunteer) to learn about opportunities.',
    'Tell me about upcoming events':
      'See all upcoming events on our [Events page](https://cflar.dream.press/events). We have exciting activities planned!',
  };

  return (
    mockResponses[question] ||
    "I'm sorry, I don't have a specific answer for that. Please visit the [CFLAR website](https://cflar.dream.press) for more information."
  );
}
