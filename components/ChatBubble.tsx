"use client";

import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { Message } from "@/hooks/useChat";

interface ChatBubbleProps {
  message: Message;
  onTopupClick?: () => void;
}

export function ChatBubble({ message, onTopupClick }: ChatBubbleProps) {
  const isUser = message.sender === "user";

  // Format timestamp
  const time = message.timestamp.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Debug log
  console.log("ChatBubble message:", {
    id: message.id,
    isTokenEmpty: message.isTokenEmpty,
    hasOnTopupClick: !!onTopupClick,
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

        {/* Topup Button for Token Empty */}
        {message.isTokenEmpty && onTopupClick && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onTopupClick}
            className="mt-3 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
          >
            <Wallet className="w-5 h-5" strokeWidth={2.5} />
            Topup Sekarang
          </motion.button>
        )}

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
