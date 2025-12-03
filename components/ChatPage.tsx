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
import { VoiceSelectionModal } from "./VoiceSelectionModal";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/context/AuthProvider";
import type { VoiceType } from "@/lib/realtime-api";

export function ChatPage() {
  const {
    messages,
    isTyping,
    sendMessage,
    isInitialized,
    hasInsufficientToken,
  } = useChat();
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

  const [selectedVoice, setSelectedVoice] = useState<VoiceType>("alloy");
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showTokenDepletedModal, setShowTokenDepletedModal] = useState(false);

  const handleCallClick = () => {
    setShowVoiceModal(true);
  };

  const handleVoiceSelect = (voice: VoiceType) => {
    setSelectedVoice(voice);
    setShowVoiceModal(false);
    setIsCallActive(true);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
  };

  // Listen for token depleted event
  useEffect(() => {
    const handleTokenDepleted = () => {
      setShowTokenDepletedModal(true);
    };

    window.addEventListener("tokenDepleted", handleTokenDepleted);

    return () => {
      window.removeEventListener("tokenDepleted", handleTokenDepleted);
    };
  }, []);

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
                <ChatBubble
                  key={message.id}
                  message={message}
                  onTopupClick={() => setShowTopupModal(true)}
                />
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

          <InputBar
            onSendMessage={sendMessage}
            disabled={hasInsufficientToken}
          />
        </div>
      )}

      {/* Call Interface */}
      <AnimatePresence>
        {isCallActive && (
          <CallPage
            onEndCall={handleEndCall}
            contactName="AI Assistant"
            selectedVoice={selectedVoice}
          />
        )}
      </AnimatePresence>

      {/* Voice Selection Modal */}
      <AnimatePresence>
        {showVoiceModal && (
          <VoiceSelectionModal
            onSelect={handleVoiceSelect}
            onClose={() => setShowVoiceModal(false)}
          />
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

      {/* Token Depleted Modal */}
      <AnimatePresence>
        {showTokenDepletedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex items-center justify-center p-6 z-[100]"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.2 }}
              className="bg-white/95 backdrop-blur-xl rounded-[32px] p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Token Kamu Udah Habis! 😅
                </h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  Token kamu udah habis nih. Yuk topup dulu biar bisa lanjut
                  ngobrol sama AI Buddy!
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowTokenDepletedModal(false);
                    setShowTopupModal(true);
                  }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-white font-semibold">
                    Oke, Topup Sekarang
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowTokenDepletedModal(false)}
                  className="w-full py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  <span className="text-gray-900 font-semibold">Nanti Deh</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
