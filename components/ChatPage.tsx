"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Loader2 } from "lucide-react";
import { HeaderBar } from "./HeaderBar";
import { ChatBubble } from "./ChatBubble";
import { InputBar } from "./InputBar";
import { CallPage } from "./CallPage";
import { LoginModal } from "./LoginModal";
import { OTPModal } from "./OTPModal";
import { TopupModal } from "./TopupModal";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/context/AuthProvider";

export function ChatPage() {
  const { messages, isTyping, sendMessage, isInitialized } = useChat();
  const { isAuthenticated } = useAuth();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [showTopupModal, setShowTopupModal] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
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
      {/* Login Modals */}
      {!isAuthenticated && !showOTPModal && (
        <LoginModal
          onSuccess={(email) => {
            setLoginEmail(email);
            setShowOTPModal(true);
          }}
        />
      )}

      {!isAuthenticated && showOTPModal && (
        <OTPModal
          email={loginEmail}
          onBack={() => {
            setShowOTPModal(false);
            setLoginEmail("");
          }}
        />
      )}

      {/* Chat Interface */}
      {!isCallActive && isAuthenticated && (
        <div className="flex flex-col h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-300">
          <HeaderBar
            onCallClick={handleCallClick}
            onTopupClick={() => setShowTopupModal(true)}
          />

          {/* Chat Area */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 py-6 pb-32"
          >
            <div className="max-w-4xl mx-auto">
              {/* Loading State */}
              {isAuthenticated && !isInitialized && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4"
                >
                  <div className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-[24px] flex items-center justify-center shadow-lg mb-6">
                    <Loader2 className="w-10 h-10 animate-spin text-white" />
                  </div>
                  <p className="text-base font-semibold text-white drop-shadow">
                    Mempersiapkan percakapan...
                  </p>
                </motion.div>
              )}

              {/* Empty State */}
              {messages.length === 0 && isInitialized && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4"
                >
                  <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl mb-6">
                    <MessageCircle
                      className="w-8 h-8 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                  <h2 className="text-2xl font-bold mb-3 text-white drop-shadow-lg">
                    Mulai Percakapan 💬
                  </h2>
                  <p className="text-base text-white/90 max-w-md leading-relaxed drop-shadow">
                    Kirim pesan untuk mulai ngobrol dengan AI Buddy yang siap
                    dengerin kamu
                  </p>
                </motion.div>
              )}

              {/* Messages */}
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}

              {/* Supportive Message */}
              {messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center my-4"
                >
                  {/* <p className="text-white/80 text-sm font-medium drop-shadow">
                    ✨ You&apos;re doing great
                  </p> */}
                </motion.div>
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex justify-start mb-4"
                >
                  <div className="max-w-[75%] rounded-3xl rounded-tl-lg px-5 py-3 bg-white/95 backdrop-blur-sm shadow-lg flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-[15px] text-gray-700 font-medium">
                      AI is typing...
                    </span>
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
          <CallPage onEndCall={handleEndCall} contactName="AI Assistant" />
        )}
      </AnimatePresence>

      {/* Topup Modal */}
      <AnimatePresence>
        {showTopupModal && (
          <TopupModal
            onClose={() => setShowTopupModal(false)}
            onSuccess={() => {
              setShowTopupModal(false);
              // Trigger token balance refresh in UserProfile
              window.dispatchEvent(new Event("refreshTokenBalance"));
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
