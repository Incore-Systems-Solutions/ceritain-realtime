'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { HeaderBar } from './HeaderBar';
import { ChatBubble } from './ChatBubble';
import { InputBar } from './InputBar';
import { CallPage } from './CallPage';
import { useChat } from '@/hooks/useChat';

export function ChatPage() {
  const { messages, sendMessage } = useChat();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isCallActive, setIsCallActive] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
          >
            <div className="max-w-4xl mx-auto">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
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
