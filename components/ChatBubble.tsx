"use client";

import { motion } from "framer-motion";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.sender === "user";

  // Format timestamp
  const time = message.timestamp.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-3xl px-5 py-3.5 shadow-lg ${
          isUser
            ? "rounded-br-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white"
            : "rounded-tl-lg bg-white/95 backdrop-blur-sm text-gray-800"
        }`}
      >
        {/* Message Text */}
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words font-medium">
          {message.text}
        </p>

        {/* Timestamp */}
        <p
          className={`text-[11px] mt-1.5 ${
            isUser ? "text-right text-white/70" : "text-left text-gray-500"
          }`}
        >
          {time}
        </p>
      </div>
    </motion.div>
  );
}
