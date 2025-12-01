import { useState } from 'react';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI typing
    setIsTyping(true);

    // Simulate AI response with delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: `Terima kasih atas pesan Anda: "${text}". Saya adalah AI Assistant dan siap membantu Anda!`,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500); // 1.5 second delay for realistic feel
  };

  return {
    messages,
    isTyping,
    sendMessage,
  };
}
