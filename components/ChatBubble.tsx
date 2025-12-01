'use client';

import { motion } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.sender === 'user';

  // Format timestamp
  const time = message.timestamp.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${isUser ? 'rounded-br-md' : 'rounded-bl-md'
          }`}
        style={{
          backgroundColor: isUser ? 'var(--user-bubble-bg)' : 'var(--ai-bubble-bg)',
          color: isUser ? 'var(--user-bubble-text)' : 'var(--ai-bubble-text)',
        }}
      >
        {/* Message Text */}
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {message.text}
        </p>

        {/* Timestamp */}
        <p
          className={`text-[11px] mt-1 ${isUser ? 'text-right' : 'text-left'}`}
          style={{ opacity: 0.6 }}
        >
          {time}
        </p>
      </div>
    </motion.div>
  );
}
