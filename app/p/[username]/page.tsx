"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { UserCircle, ArrowRight, Loader2 } from "lucide-react";

export default function ProfileRedirectPage() {
  const params = useParams();
  const username = params.username as string;
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to care.spilltoai.com
          window.location.href = `https://care.spilltoai.com/p/${username}`;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [username]);

  const handleRedirectNow = () => {
    window.location.href = `https://care.spilltoai.com/p/${username}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-300 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/95 backdrop-blur-xl rounded-[32px] p-8 md:p-12 max-w-2xl w-full shadow-2xl"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
            <UserCircle className="w-12 h-12 text-white" strokeWidth={2} />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Mengarahkan ke Profil
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Anda akan dialihkan ke halaman profil dari{" "}
            <span className="font-bold text-blue-600">
              Dr. Psikolog {username}
            </span>{" "}
           di Platform Care SpilltoAI
          </p>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <span className="text-4xl font-bold text-blue-600">
                {countdown}
              </span>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <Loader2 className="w-20 h-20 text-blue-500" />
            </motion.div>
          </div>
        </motion.div>

        {/* Redirect Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRedirectNow}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30"
        >
          <span className="text-white font-semibold text-lg">
            Alihkan Sekarang
          </span>
          <ArrowRight className="w-5 h-5 text-white" />
        </motion.button>

        {/* Info Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-gray-500 mt-6"
        >
          Jika tidak dialihkan secara otomatis, klik tombol di atas.
        </motion.p>
      </motion.div>
    </div>
  );
}
