'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Loader2 } from 'lucide-react';
import { HeaderBar } from './HeaderBar';
import { ChatBubble } from './ChatBubble';
import { InputBar } from './InputBar';
import { CallPage } from './CallPage';
import { useChat } from '@/hooks/useChat';

export function ChatPage() {
  const { messages, isTyping, sendMessage } = useChat();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isCallActive, setIsCallActive] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  const handleCallClick = () => {
    setIsCallActive(true);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
  };

  return (
    <>
      {/* Chat Interface */}
      {!isCallActive && (
        <div className="flex flex-col h-screen">
          <HeaderBar onCallClick={handleCallClick} />

          {/* Chat Area */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 py-6 pb-24"
            style={{
              background: 'linear-gradient(to bottom, var(--background), var(--surface))',
            }}
          >
            <div className="max-w-4xl mx-auto">
              {/* Empty State */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4"
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg"
                    style={{
                      backgroundColor: 'var(--surface-elevated)',
                    }}
                  >
                    <MessageCircle
                      className="w-10 h-10"
                      style={{ color: 'var(--accent)' }}
                    />
                  </div>
                  <h2
                    className="text-2xl font-semibold mb-2 tracking-tight"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Start a Conversation
                  </h2>
                  <p
                    className="text-sm max-w-md"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    Send a message to begin chatting with AI Assistant
                  </p>
                </motion.div>
              )}

              {/* Messages */}
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex justify-start mb-4"
                >
                  <div
                    className="max-w-[75%] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm flex items-center gap-2"
                    style={{
                      backgroundColor: 'var(--ai-bubble-bg)',
                      color: 'var(--ai-bubble-text)',
                    }}
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-[15px]">AI is typing...</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <InputBar onSendMessage={sendMessage} />
        </div>
      )}

      {/* Call Interface */}
      <AnimatePresence>
        {isCallActive && (
          <CallPage
            onEndCall={handleEndCall}
            contactName="AI Assistant"
          />
        )}
      </AnimatePresence>
    </>
  );
}
