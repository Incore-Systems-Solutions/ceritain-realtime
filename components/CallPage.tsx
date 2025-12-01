'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';

interface CallPageProps {
  onEndCall: () => void;
  contactName?: string;
  contactAvatar?: string;
}

export function CallPage({
  onEndCall,
  contactName = 'AI Assistant',
  contactAvatar
}: CallPageProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected'>('connecting');

  // Simulate call connection
  useEffect(() => {
    const timer = setTimeout(() => {
      setCallStatus('connected');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Call duration timer
  useEffect(() => {
    if (callStatus === 'connected') {
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#0a0a0a]"
    >
      {/* Subtle Background Pattern - Behind everything */}
      <div className="absolute inset-0 opacity-5 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.3),transparent_50%)]" />
      </div>

      {/* Main Content */}
      <div className="relative h-full flex flex-col items-center justify-between py-20 px-8 z-0">

        {/* Top Section - Avatar & Status */}
        <div className="flex flex-col items-center gap-8 mt-8">
          {/* Avatar with pulse animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-5xl font-bold shadow-2xl ring-4 ring-white/5">
              {contactAvatar || 'AI'}
            </div>

            {/* Pulse rings for connecting state */}
            {callStatus === 'connecting' && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-purple-400/30"
                  animate={{ scale: [1, 1.3, 1.3], opacity: [0.5, 0, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-purple-400/30"
                  animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
              </>
            )}
          </motion.div>

          {/* Contact Name */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-4xl font-semibold text-white/95 mb-3">
              {contactName}
            </h1>
            <AnimatePresence mode="wait">
              {callStatus === 'connecting' ? (
                <motion.p
                  key="connecting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-lg text-white/60"
                >
                  Connecting...
                </motion.p>
              ) : (
                <motion.p
                  key="duration"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-lg text-white/60 font-mono"
                >
                  {formatDuration(callDuration)}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Bottom Section - Controls */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-md mb-8"
        >
          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-8 mb-10">
            {/* Mute Button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-6 rounded-full transition-all shadow-lg border ${isMuted
                ? 'bg-red-500 hover:bg-red-600 border-red-500'
                : 'bg-white/5 hover:bg-white/10 border-white/10'
                }`}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <MicOff className="w-7 h-7 text-white" />
              ) : (
                <Mic className="w-7 h-7 text-white/90" />
              )}
            </button>

            {/* Speaker Button */}
            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`p-6 rounded-full transition-all shadow-lg border ${!isSpeakerOn
                ? 'bg-red-500 hover:bg-red-600 border-red-500'
                : 'bg-white/5 hover:bg-white/10 border-white/10'
                }`}
              aria-label={isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'}
            >
              {isSpeakerOn ? (
                <Volume2 className="w-7 h-7 text-white/90" />
              ) : (
                <VolumeX className="w-7 h-7 text-white" />
              )}
            </button>
          </div>

          {/* End Call Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEndCall}
            className="w-full py-5 rounded-full bg-red-500 hover:bg-red-600 transition-all shadow-2xl flex items-center justify-center gap-3"
            aria-label="End call"
          >
            <PhoneOff className="w-7 h-7 text-white" />
            <span className="text-white font-semibold text-xl">End Call</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Audio wave visualization (decorative) */}
      {callStatus === 'connected' && !isMuted && (
        <div className="absolute bottom-56 left-1/2 -translate-x-1/2 flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-purple-400/40 rounded-full"
              animate={{
                height: [8, 24, 8],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
