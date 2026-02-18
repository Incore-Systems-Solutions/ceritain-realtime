"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { authApi } from "@/lib/auth-api";
import { Mail, Rocket, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface LoginModalProps {
  onSuccess: (email: string) => void;
}

const SLIDER_IMAGES = [
  "/gambar/1.jpeg",
  "/gambar/2.jpeg",
  "/gambar/3.jpeg",
  "/gambar/4.jpeg",
  "/gambar/5.jpeg",
  "/gambar/6.jpeg",
  "/gambar/7.jpeg",
];

export function LoginModalI18n({ onSuccess }: LoginModalProps) {
  const t = useTranslations("login");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDER_IMAGES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError(t("errorInvalidEmail"));
      return;
    }

    setLoading(true);

    try {
      await authApi.requestOTP(email);
      onSuccess(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim kode OTP");
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDER_IMAGES.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + SLIDER_IMAGES.length) % SLIDER_IMAGES.length,
    );
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center z-50 p-4 md:p-8">
      <div className="w-full max-w-7xl h-full max-h-[900px] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Image Slider (Desktop/Tablet) */}
        <div className="relative w-full md:w-[55%] h-64 md:h-full overflow-hidden rounded-t-[32px] md:rounded-l-[32px] md:rounded-tr-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={SLIDER_IMAGES[currentSlide]}
                alt={`Slide ${currentSlide + 1}`}
                fill
                className="object-contain"
                priority={currentSlide === 0}
                quality={100}
              />
            </motion.div>
          </AnimatePresence>

          {/* Slider Controls */}
          <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-4 z-10">
            <button
              onClick={prevSlide}
              className="w-11 h-11 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all shadow-lg"
              aria-label="Previous slide"
            >
              <ChevronLeft
                className="w-6 h-6 text-gray-700"
                strokeWidth={2.5}
              />
            </button>

            <div className="flex gap-2">
              {SLIDER_IMAGES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === currentSlide
                      ? "w-10 bg-blue-500 shadow-md"
                      : "w-2.5 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="w-11 h-11 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all shadow-lg"
              aria-label="Next slide"
            >
              <ChevronRight
                className="w-6 h-6 text-gray-700"
                strokeWidth={2.5}
              />
            </button>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-[45%] flex items-center justify-center p-6 md:p-12 bg-gradient-to-br from-gray-50 to-white overflow-y-auto">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", duration: 0.6 }}
              className="flex justify-center mb-6"
            >
              {/* <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-[24px] flex items-center justify-center shadow-lg">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M24 4C12.96 4 4 11.84 4 21.6C4 26.32 6.08 30.56 9.52 33.68C9.28 37.04 7.6 40.08 7.44 40.4C7.2 40.88 7.28 41.44 7.6 41.84C7.92 42.24 8.48 42.4 8.96 42.24C13.6 40.72 17.12 38.56 19.2 37.12C20.72 37.52 22.32 37.76 24 37.76C35.04 37.76 44 29.92 44 20.16C44 10.4 35.04 4 24 4Z"
                    fill="white"
                  />
                  <circle cx="16" cy="20" r="2.5" fill="#3B82F6" />
                  <circle cx="24" cy="20" r="2.5" fill="#3B82F6" />
                  <circle cx="32" cy="20" r="2.5" fill="#3B82F6" />
                  <path
                    d="M16 26C16 26 18.5 29 24 29C29.5 29 32 26 32 26"
                    stroke="#3B82F6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div> */}
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {t("title")}
              </h2>
              <p className="text-gray-600 text-base leading-relaxed">
                {t("description")}
              </p>
            </motion.div>

            <motion.form
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-3"
                >
                  {t("emailLabel")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("emailPlaceholder")}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-blue-400 transition-all"
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
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
                    {t("sendingOtp")}
                  </>
                ) : (
                  <>
                    {t("sendOtpButton")}
                    <Rocket className="w-5 h-5 ml-2" />
                  </>
                )}
              </motion.button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {t("footer")}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
