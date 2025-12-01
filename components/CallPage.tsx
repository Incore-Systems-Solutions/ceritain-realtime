'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
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
      className="fixed inset-0 z-50"
      style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      }}
    >
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3),transparent_50%)]" />
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
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl ring-4 ring-white/10">
              <span className="text-white text-5xl font-bold">
                {contactAvatar || 'AI'}
              </span>
            </div>

            {/* Pulse rings for connecting state */}
            {callStatus === 'connecting' && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-blue-400/30"
                  animate={{ scale: [1, 1.4, 1.4], opacity: [0.6, 0, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-blue-400/30"
                  animate={{ scale: [1, 1.6, 1.6], opacity: [0.6, 0, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
              </>
            )}
          </motion.div>

          {/* Contact Name & Status */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-4xl font-semibold text-white mb-3 tracking-tight">
              {contactName}
            </h1>
            <AnimatePresence mode="wait">
              {callStatus === 'connecting' ? (
                <motion.p
                  key="connecting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-lg text-white/70"
                >
                  Connecting...
                </motion.p>
              ) : (
                <motion.p
                  key="duration"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-lg text-white/70 font-mono"
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
          className="w-full max-w-md mb-12"
        >
          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-8 mb-12">
            {/* Mute Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMuted(!isMuted)}
              className={`w-14 h-14 rounded-full transition-all shadow-lg ${isMuted
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-white/10 hover:bg-white/20 backdrop-blur-md'
                }`}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
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
              className={`w-14 h-14 rounded-full transition-all shadow-lg ${!isSpeakerOn
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-white/10 hover:bg-white/20 backdrop-blur-md'
                }`}
              aria-label={isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'}
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
            onClick={onEndCall}
            className="w-full py-4 rounded-full bg-red-500 hover:bg-red-600 transition-all shadow-2xl flex items-center justify-center gap-3"
            aria-label="End call"
          >
            <PhoneOff className="w-6 h-6 text-white" />
            <span className="text-white font-semibold text-lg">End Call</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Audio wave visualization (decorative) */}
      {callStatus === 'connected' && !isMuted && (
        <div className="absolute bottom-64 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-blue-400/40 rounded-full"
              animate={{
                height: [8, 28, 8],
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
