"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Loader2, Coins, BookOpen } from "lucide-react";
import { HeaderBar } from "../HeaderBar";
import { ChatBubble } from "../ChatBubble";
import { InputBarI18n } from "./InputBarI18n";
import { CallPageI18n } from "./CallPageI18n";
import { LoginModalI18n } from "./LoginModalI18n";
import { OTPModalI18n } from "./OTPModalI18n";
import { TopupModalI18n } from "./TopupModalI18n";
import { VoiceSelectionModalI18n } from "./VoiceSelectionModalI18n";
import { useChatI18n } from "@/hooks/useChatI18n";
import { useAuth } from "@/context/AuthProvider";
import { authApi } from "@/lib/auth-api";
import type { VoiceType } from "@/lib/realtime-api";

export function ChatPageI18n() {
  const t = useTranslations("chat");
  const tToken = useTranslations("tokenDepleted");
  const {
    messages,
    isTyping,
    sendMessage,
    isInitialized,
    hasInsufficientToken,
  } = useChatI18n();
  const { isAuthenticated, token } = useAuth();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [loadingToken, setLoadingToken] = useState(false);

  const fetchToken = async () => {
    if (!token) return;

    setLoadingToken(true);
    try {
      const response = await authApi.getToken(token);
      if (response.errorCode === 0 && response.result !== undefined) {
        setTokenBalance(response.result);
      }
    } catch (error) {
      console.error("Failed to fetch token:", error);
    } finally {
      setLoadingToken(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  // Listen for token balance refresh event
  useEffect(() => {
    const handleRefresh = () => {
      if (token) {
        fetchToken();
      }
    };

    window.addEventListener("refreshTokenBalance", handleRefresh);
    return () => {
      window.removeEventListener("refreshTokenBalance", handleRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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
      {!isAuthenticated && !showOTPModal && (
        <LoginModalI18n
          onSuccess={(email) => {
            setLoginEmail(email);
            setShowOTPModal(true);
          }}
        />
      )}

      {!isAuthenticated && showOTPModal && (
        <OTPModalI18n
          email={loginEmail}
          onBack={() => {
            setShowOTPModal(false);
            setLoginEmail("");
          }}
        />
      )}

      {!isCallActive && isAuthenticated && (
        <div className="flex flex-col h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-300">
          <HeaderBar
            onCallClick={handleCallClick}
            onTopupClick={() => setShowTopupModal(true)}
          />

          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 py-6 pb-32"
          >
            <div className="max-w-4xl mx-auto">
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
                    {t("loadingMessage")}
                  </p>
                </motion.div>
              )}

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
                    {t("emptyTitle")}
                  </h2>
                  <p className="text-base text-white/90 max-w-md leading-relaxed drop-shadow">
                    {t("emptyDescription")}
                  </p>
                </motion.div>
              )}

              {messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  message={message}
                  onTopupClick={() => setShowTopupModal(true)}
                />
              ))}

              {messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center my-4"
                />
              )}

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
                      {t("typingIndicator")}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <InputBarI18n
            onSendMessage={sendMessage}
            disabled={hasInsufficientToken}
          />

          {/* Blog Button FAB */}
          {isAuthenticated && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                window.open(
                  "https://about.spilltoai.com",
                  "_blank",
                  "noopener,noreferrer",
                )
              }
              className="fixed bottom-28 left-6 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 z-40 backdrop-blur-sm"
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-bold text-base">Blog</span>
            </motion.button>
          )}

          {/* Token Balance FAB */}
          {isAuthenticated && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTopupModal(true)}
              className="fixed bottom-28 right-6 bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 z-40 backdrop-blur-sm"
            >
              <Coins className="w-5 h-5" />
              {loadingToken ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="font-bold text-base">
                  {tokenBalance !== null ? tokenBalance.toLocaleString() : "-"}
                </span>
              )}
            </motion.button>
          )}
        </div>
      )}

      <AnimatePresence>
        {isCallActive && (
          <CallPageI18n
            onEndCall={handleEndCall}
            contactName="AI Assistant"
            selectedVoice={selectedVoice}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVoiceModal && (
          <VoiceSelectionModalI18n
            onSelect={handleVoiceSelect}
            onClose={() => setShowVoiceModal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTopupModal && (
          <TopupModalI18n
            onClose={() => setShowTopupModal(false)}
            onSuccess={() => {
              setShowTopupModal(false);
              window.dispatchEvent(new Event("refreshTokenBalance"));
            }}
          />
        )}
      </AnimatePresence>

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
                  {tToken("title")}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  {tToken("description")}
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
                    {tToken("topupButton")}
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowTokenDepletedModal(false)}
                  className="w-full py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  <span className="text-gray-900 font-semibold">
                    {tToken("laterButton")}
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
