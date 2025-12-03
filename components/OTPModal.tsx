"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authApi } from "@/lib/auth-api";
import { useAuth } from "@/context/AuthProvider";
import { ArrowLeft, Shield, Mail } from "lucide-react";

interface OTPModalProps {
  email: string;
  onBack: () => void;
}

export function OTPModal({ email, onBack }: OTPModalProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login } = useAuth();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Masukkan kode OTP 6 digit");
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.verifyOTP(email, otpCode);

      if (response.errorCode === 0 && response.result) {
        const { token, user } = response.result;
        login(token, {
          id: user.email,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        });
      } else {
        setError(response.message || "Login gagal. Silakan coba lagi.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kode OTP tidak valid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
        className="relative bg-white/95 backdrop-blur-sm rounded-[32px] shadow-2xl w-full max-w-md p-10"
      >
        <motion.button
          onClick={onBack}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
          className="text-gray-600 hover:text-gray-900 mb-6 flex items-center text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </motion.button>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", duration: 0.6 }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-[24px] flex items-center justify-center shadow-lg">
            <Shield className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Verifikasi Kode OTP
          </h2>
          <p className="text-gray-600 text-base leading-relaxed mb-2">
            Kode verifikasi udah dikirim ke
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-900 font-semibold text-sm bg-blue-50 py-2 px-4 rounded-xl inline-flex">
            <Mail className="w-4 h-4 text-blue-500" />
            {email}
          </div>
        </motion.div>

        <motion.form
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <motion.input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-2xl font-bold rounded-2xl border-2 border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-0 focus:border-blue-400 focus:bg-white transition-all"
                disabled={loading}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading || otp.some((d) => !d)}
            whileHover={{
              scale: loading || otp.some((d) => !d) ? 1 : 1.02,
            }}
            whileTap={{ scale: loading || otp.some((d) => !d) ? 1 : 0.98 }}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 px-4 rounded-2xl transition-all flex items-center justify-center shadow-lg shadow-blue-500/30"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Memverifikasi...
              </>
            ) : (
              "Verifikasi & Masuk"
            )}
          </motion.button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-600 leading-relaxed">
            Cek inbox atau folder spam email kamu
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
