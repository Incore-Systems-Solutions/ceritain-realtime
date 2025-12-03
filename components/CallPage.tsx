"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  AlertCircle,
  RefreshCw,
  Coins,
} from "lucide-react";
import { useRealtimeWebRTC } from "@/hooks/useRealtimeWebRTC";
import { createRealtimeSession } from "@/lib/realtime-api";
import { authApi } from "@/lib/auth-api";
import { useAuth } from "@/context/AuthProvider";

interface CallPageProps {
  onEndCall: () => void;
  contactName?: string;
  contactAvatar?: string;
}

export function CallPage({
  onEndCall,
  contactName = "Psikolog AI",
  contactAvatar,
}: CallPageProps) {
  const { token } = useAuth();
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showError, setShowError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [micPermission, setMicPermission] = useState<
    "prompt" | "granted" | "denied"
  >("prompt");
  const [showMicPrompt, setShowMicPrompt] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);

  const [webrtcState, webrtcActions] = useRealtimeWebRTC();

  /**
   * Handle user stopped speaking - send token usage to API
   */
  const handleUserSpeakingStop = async (duration: number) => {
    if (!token || duration <= 0) return;

    try {
      console.log(`📊 Sending user token usage: ${duration}s`);
      const response = await authApi.postTokenUsageUser(
        token as string,
        duration
      );

      // Check if token is depleted (400 Bad Request)
      if (response.errorCode === 400) {
        console.warn("⚠️ Token depleted (user speaking)");
        setShowTokenModal(true);
        // Disconnect call
        webrtcActions.disconnect();
      }
    } catch (error) {
      console.error("Failed to post user token usage:", error);
    }
  };

  /**
   * Handle AI stopped speaking - send token usage to API
   */
  const handleAISpeakingStop = async (duration: number) => {
    if (!token || duration <= 0) return;

    try {
      console.log(`📊 Sending AI token usage: ${duration}s`);
      const response = await authApi.postTokenUsageAI(
        token as string,
        duration
      );

      // Check if token is depleted (400 Bad Request)
      if (response.errorCode === 400) {
        console.warn("⚠️ Token depleted (AI speaking)");
        setShowTokenModal(true);
        // Disconnect call
        webrtcActions.disconnect();
      }
    } catch (error) {
      console.error("Failed to post AI token usage:", error);
    }
  };

  // Check microphone permission first
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        const result = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });

        if (result.state === "granted") {
          setMicPermission("granted");
        } else if (result.state === "denied") {
          setMicPermission("denied");
          setShowError(true);
        } else {
          setMicPermission("prompt");
          setShowMicPrompt(true);
        }
      } catch (error) {
        // Fallback: just show prompt
        setShowMicPrompt(true);
      }
    };

    checkMicPermission();
  }, []);

  // Initialize session and connect
  useEffect(() => {
    let mounted = true;

    const initializeCall = async () => {
      // Wait for mic permission
      if (micPermission !== "granted") return;

      try {
        // Create session and get token
        const sessionToken = await createRealtimeSession(
          {
            prompt:
              "jadi seorang psikolog yang membantu menyelesaikan masalah user",
            voice: "alloy",
          },
          token || undefined // Pass auth token for authorization
        );

        if (!mounted) return;

        console.log("Token received:", sessionToken);
        console.log("Connecting WebRTC...");

        // Connect WebRTC with token and speaking callbacks
        await webrtcActions.connect(sessionToken, {
          onUserSpeakingStart: () => {
            console.log("🎤 User speaking started");
          },
          onUserSpeakingStop: handleUserSpeakingStop,
          onAISpeakingStart: () => {
            console.log("🤖 AI speaking started");
          },
          onAISpeakingStop: handleAISpeakingStop,
        });
      } catch (error) {
        console.error("Failed to initialize call:", error);
        if (mounted) {
          setShowError(true);
        }
      }
    };

    initializeCall();

    return () => {
      mounted = false;
      webrtcActions.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [micPermission]);

  // Call duration timer
  useEffect(() => {
    if (webrtcState.status === "connected") {
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [webrtcState.status]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    webrtcActions.disconnect();
    onEndCall();
  };

  const handleAllowMicrophone = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop()); // Stop immediately

      setMicPermission("granted");
      setShowMicPrompt(false);
    } catch (error) {
      console.error("Microphone permission denied:", error);
      setMicPermission("denied");
      setShowMicPrompt(false);
      setShowError(true);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setShowError(false);

    try {
      // Disconnect first
      webrtcActions.disconnect();

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 500));

      const sessionToken = await createRealtimeSession(
        {
          prompt:
            "jadi seorang psikolog yang membantu menyelesaikan masalah user",
          voice: "alloy",
        },
        token || undefined // Pass auth token for authorization
      );

      await webrtcActions.connect(sessionToken, {
        onUserSpeakingStop: handleUserSpeakingStop,
        onAISpeakingStop: handleAISpeakingStop,
      });
    } catch (error) {
      console.error("Retry failed:", error);
      setShowError(true);
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusText = () => {
    switch (webrtcState.status) {
      case "connecting":
        return "Menghubungkan...";
      case "connected":
        return webrtcState.isMuted
          ? "Terhubung • Mic Mati"
          : "Terhubung • Mic Aktif";
      case "error":
        return "Koneksi Gagal";
      case "disconnected":
        return "Terputus";
      default:
        return "Memulai...";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-300"
    >
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.5),transparent_50%)]" />
      </div>

      {/* Main Content */}
      <div className="relative h-full flex flex-col items-center justify-between py-16 px-8">
        {/* Top Section - Avatar & Status */}
        <div className="flex flex-col items-center gap-8 mt-16">
          {/* Avatar with pulse animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="w-32 h-32 rounded-[32px] bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-2xl">
              <span className="text-6xl">{contactAvatar || "😊"}</span>
            </div>

            {/* Pulse rings for connecting state */}
            {(webrtcState.status === "connecting" ||
              webrtcState.status === "idle") && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-[32px] border-4 border-white/40"
                  animate={{ scale: [1, 1.3, 1.3], opacity: [0.6, 0, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-[32px] border-4 border-white/40"
                  animate={{ scale: [1, 1.5, 1.5], opacity: [0.6, 0, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
              </>
            )}

            {/* Active indicator for connected state */}
            {webrtcState.status === "connected" && (
              <motion.div
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}

            {/* User speaking indicator */}
            {webrtcState.isUserSpeaking && (
              <motion.div
                className="absolute -top-2 -left-2 w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Mic className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </motion.div>

          {/* Contact Name & Status */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight drop-shadow-lg">
              {contactName}
            </h1>
            <AnimatePresence mode="wait">
              <motion.p
                key={webrtcState.status}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg text-white/90 font-medium drop-shadow"
              >
                {getStatusText()}
              </motion.p>
            </AnimatePresence>

            {webrtcState.status === "connected" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg text-white/80 font-mono mt-1 drop-shadow"
              >
                {formatDuration(callDuration)}
              </motion.p>
            )}
          </motion.div>
        </div>

        {/* Bottom Section - Controls */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-md mb-12"
        >
          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-8 mb-12">
            {/* Mute Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={webrtcActions.toggleMute}
              disabled={webrtcState.status !== "connected"}
              className={`w-16 h-16 rounded-2xl transition-all shadow-xl ${
                webrtcState.isMuted
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-white/30 hover:bg-white/40 backdrop-blur-md"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={webrtcState.isMuted ? "Unmute" : "Mute"}
            >
              {webrtcState.isMuted ? (
                <MicOff className="w-6 h-6 text-white mx-auto" />
              ) : (
                <Mic className="w-6 h-6 text-white mx-auto" />
              )}
            </motion.button>

            {/* Speaker Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`w-16 h-16 rounded-2xl transition-all shadow-xl ${
                !isSpeakerOn
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-white/30 hover:bg-white/40 backdrop-blur-md"
              }`}
              aria-label={isSpeakerOn ? "Turn off speaker" : "Turn on speaker"}
            >
              {isSpeakerOn ? (
                <Volume2 className="w-6 h-6 text-white mx-auto" />
              ) : (
                <VolumeX className="w-6 h-6 text-white mx-auto" />
              )}
            </motion.button>
          </div>

          {/* End Call Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEndCall}
            className="w-full py-5 rounded-3xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all shadow-2xl flex items-center justify-center gap-3"
            aria-label="End call"
          >
            <PhoneOff className="w-6 h-6 text-white" strokeWidth={2.5} />
            <span className="text-white font-bold text-lg">
              Akhiri Panggilan
            </span>
          </motion.button>
        </motion.div>
      </div>

      {/* Audio wave visualization (based on actual audio level) */}
      {webrtcState.status === "connected" && !webrtcState.isMuted && (
        <div className="absolute bottom-64 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {[...Array(7)].map((_, i) => {
            const baseHeight = 8;
            const maxHeight = 32;
            const height =
              baseHeight + webrtcState.audioLevel * (maxHeight - baseHeight);

            return (
              <motion.div
                key={i}
                className="w-1.5 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full shadow-lg"
                animate={{
                  height: [height * 0.5, height, height * 0.5],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.08,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </div>
      )}

      {/* Microphone Permission Prompt */}
      <AnimatePresence>
        {showMicPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex items-center justify-center p-6 z-10"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.2 }}
              className="bg-white/95 backdrop-blur-xl rounded-[32px] p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
                  <Mic className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Butuh Akses Mikrofon Nih!
                </h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  Biar kamu bisa ngobrol langsung sama AI Buddy, kita butuh izin
                  akses mikrofon ya. Tenang, privasi kamu aman kok!
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAllowMicrophone}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                >
                  <Mic className="w-5 h-5 text-white" strokeWidth={2.5} />
                  <span className="text-white font-semibold">
                    Oke, Izinkan Mikrofon
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEndCall}
                  className="w-full py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  <span className="text-gray-900 font-semibold">Nanti Deh</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Token Depleted Modal */}
      <AnimatePresence>
        {showTokenModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex items-center justify-center p-6 z-10"
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
                  <Coins className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Token Kamu Udah Habis!
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
                  onClick={handleEndCall}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                >
                  <Coins className="w-5 h-5 text-white" strokeWidth={2.5} />
                  <span className="text-white font-semibold">
                    Oke, Topup Sekarang
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Modal */}
      <AnimatePresence>
        {(showError || webrtcState.error) && !showTokenModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex items-center justify-center p-6 z-10"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.2 }}
              className="bg-white/95 backdrop-blur-xl rounded-[32px] p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center shadow-lg">
                  <AlertCircle
                    className="w-10 h-10 text-white"
                    strokeWidth={2.5}
                  />
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Oops, Ada Kendala Nih! 😅
                </h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  {micPermission === "denied"
                    ? "Akses mikrofon ditolak. Coba aktifkan dulu izin mikrofon di pengaturan browser kamu ya!"
                    : webrtcState.error ||
                      "Koneksi ke server lagi bermasalah. Tenang, coba lagi aja yuk!"}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw
                        className="w-5 h-5 text-white animate-spin"
                        strokeWidth={2.5}
                      />
                      <span className="text-white font-semibold">
                        Nyoba Lagi...
                      </span>
                    </>
                  ) : (
                    <>
                      <RefreshCw
                        className="w-5 h-5 text-white"
                        strokeWidth={2.5}
                      />
                      <span className="text-white font-semibold">
                        Coba Lagi
                      </span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEndCall}
                  className="w-full py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  <span className="text-gray-900 font-semibold">Tutup</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
