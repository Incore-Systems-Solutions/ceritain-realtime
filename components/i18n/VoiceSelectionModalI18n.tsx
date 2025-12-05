"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  X,
  Mic,
  Music,
  Sparkles,
  Flame,
  Waves,
  Leaf,
  Radio,
  Volume2,
  Play,
  Pause,
} from "lucide-react";
import type { VoiceType } from "@/lib/realtime-api";

interface VoiceSelectionModalProps {
  onSelect: (voice: VoiceType) => void;
  onClose: () => void;
}

interface VoiceOption {
  value: VoiceType;
  icon: React.ReactNode;
  color: string;
}

export function VoiceSelectionModalI18n({
  onSelect,
  onClose,
}: VoiceSelectionModalProps) {
  const t = useTranslations("voice");
  const tCommon = useTranslations("common");
  const [selectedVoice, setSelectedVoice] = useState<VoiceType>("alloy");
  const [playingVoice, setPlayingVoice] = useState<VoiceType | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const VOICE_OPTIONS: VoiceOption[] = [
    {
      value: "alloy",
      icon: <Music className="w-5 h-5" strokeWidth={2.5} />,
      color: "from-blue-400 to-blue-500",
    },
    {
      value: "verse",
      icon: <Sparkles className="w-5 h-5" strokeWidth={2.5} />,
      color: "from-purple-400 to-purple-500",
    },
    {
      value: "ash",
      icon: <Flame className="w-5 h-5" strokeWidth={2.5} />,
      color: "from-orange-400 to-red-500",
    },
    {
      value: "coral",
      icon: <Waves className="w-5 h-5" strokeWidth={2.5} />,
      color: "from-pink-400 to-rose-500",
    },
    {
      value: "sage",
      icon: <Leaf className="w-5 h-5" strokeWidth={2.5} />,
      color: "from-green-400 to-emerald-500",
    },
    {
      value: "ballad",
      icon: <Radio className="w-5 h-5" strokeWidth={2.5} />,
      color: "from-indigo-400 to-violet-500",
    },
    {
      value: "echo",
      icon: <Volume2 className="w-5 h-5" strokeWidth={2.5} />,
      color: "from-cyan-400 to-teal-500",
    },
  ];

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayVoice = (voice: VoiceType, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the voice when clicking play

    // If already playing this voice, pause it
    if (playingVoice === voice && audioRef.current) {
      audioRef.current.pause();
      setPlayingVoice(null);
      return;
    }

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Create new audio element
    const audio = new Audio(`/voices/${voice}.wav`);
    audioRef.current = audio;

    // Play the audio
    audio.play().catch((error) => {
      console.error("Failed to play audio:", error);
      setPlayingVoice(null);
    });

    setPlayingVoice(voice);

    // Reset playing state when audio ends
    audio.onended = () => {
      setPlayingVoice(null);
    };
  };

  const handleSelect = () => {
    // Stop audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingVoice(null);
    }
    onSelect(selectedVoice);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex items-center justify-center p-6 z-[100]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.2 }}
        className="bg-white/95 backdrop-blur-xl rounded-[32px] p-5 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
              <Mic className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{t("title")}</h2>
              <p className="text-xs text-gray-600">{t("description")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-all hover:scale-105 active:scale-95"
          >
            <X className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Voice Options Grid - 2 Columns */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {VOICE_OPTIONS.map((voice) => (
            <motion.button
              key={voice.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedVoice(voice.value)}
              className={`relative p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                selectedVoice === voice.value
                  ? `bg-gradient-to-br ${voice.color} text-white shadow-lg`
                  : "bg-white/80 hover:bg-white text-gray-700 border-2 border-gray-200"
              }`}
            >
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedVoice === voice.value
                    ? "bg-white/20 backdrop-blur-sm text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {voice.icon}
              </div>

              {/* Info */}
              <div className="text-center">
                <p
                  className={`text-sm font-bold mb-0.5 ${
                    selectedVoice === voice.value
                      ? "text-white"
                      : "text-gray-900"
                  }`}
                >
                  {t(`voices.${voice.value}.label`)}
                </p>
                <p
                  className={`text-[10px] leading-tight ${
                    selectedVoice === voice.value
                      ? "text-white/90"
                      : "text-gray-600"
                  }`}
                >
                  {t(`voices.${voice.value}.description`)}
                </p>
              </div>

              {/* Play Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => handlePlayVoice(voice.value, e)}
                className={`absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all ${
                  playingVoice === voice.value
                    ? "bg-red-500"
                    : selectedVoice === voice.value
                    ? "bg-white/30 backdrop-blur-sm"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {playingVoice === voice.value ? (
                  <Pause
                    className={`w-3 h-3 ${
                      selectedVoice === voice.value
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                    strokeWidth={2.5}
                  />
                ) : (
                  <Play
                    className={`w-3 h-3 ${
                      selectedVoice === voice.value
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                    strokeWidth={2.5}
                  />
                )}
              </motion.button>

              {/* Selected Indicator */}
              {selectedVoice === voice.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-md"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500"></div>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all"
          >
            <span className="text-gray-900 font-semibold text-sm">
              {tCommon("cancel")}
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSelect}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
          >
            <Mic className="w-4 h-4 text-white" strokeWidth={2.5} />
            <span className="text-white font-semibold text-sm">
              {t("startCallButton")}
            </span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
