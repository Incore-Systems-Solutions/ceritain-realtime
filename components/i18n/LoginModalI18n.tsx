"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { authApi } from "@/lib/auth-api";
import { ChevronLeft, ChevronRight, Send, Loader2, Rocket, Mail } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthProvider";

interface LoginModalProps {
  onSuccess: (email: string) => void;
}

const SLIDER_IMAGES = ["/gambar/6.jpeg", "/gambar/7.jpeg", "/gambar/8.jpeg"];

export function LoginModalI18n({ onSuccess }: LoginModalProps) {
  const t = useTranslations("login");
  const { login } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const [step, setStep] = useState<'email' | 'otp' | 'emergency'>('email');
  const [messages, setMessages] = useState<Array<{sender: 'ai' | 'user', text: string}>>([
    { sender: 'ai', text: "Hallo perkenalkan saya adalah asisten AI anda, untuk menggunakan saya, silahkan informasikan email anda." }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDER_IMAGES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    if (step === 'email') {
      const currentEmail = inputValue.trim();
      setMessages(prev => [...prev, { sender: 'user', text: currentEmail }]);
      setInputValue("");
      
      // Email validation with strict regex
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
      if (!emailRegex.test(currentEmail)) {
        setTimeout(() => {
          setMessages(prev => [...prev, { sender: 'ai', text: "Mohon maaf kak, email anda tidak valid. biasanya email yang valid adalah seperti berikut xxx@gmail.com mohon untuk menginformasikan email yang valid ya kak" }]);
        }, 500);
        return;
      }

      setEmail(currentEmail);
      setLoading(true);
      
      try {
        await authApi.requestOTP(currentEmail);
        setMessages(prev => [...prev, { sender: 'ai', text: `baik terimakasih ${currentEmail} kami sudah mengirimkan kode verifikasi ke email mu, silahkan dicek dan informasikan di sini.` }]);
        setStep('otp');
      } catch (err) {
        setMessages(prev => [...prev, { sender: 'ai', text: err instanceof Error ? err.message : "Gagal mengirim kode OTP" }]);
      } finally {
        setLoading(false);
      }
    } else if (step === 'otp') {
      const currentOtp = inputValue.trim();
      setMessages(prev => [...prev, { sender: 'user', text: currentOtp }]);
      setInputValue("");
      
      if (currentOtp.length !== 6 || !/^\d+$/.test(currentOtp)) {
        setTimeout(() => {
          setMessages(prev => [...prev, { sender: 'ai', text: "Kode verifikasi tidak valid. Masukkan 6 digit angka." }]);
        }, 500);
        return;
      }

      setLoading(true);
      try {
        const response = await authApi.verifyOTP(email, currentOtp);
        if (response.errorCode === 0 && response.result) {
          const { token, user } = response.result;
          
          // Save token and user data temporarily
          setAuthToken(token);
          setUserData(user);
          
          // Ask for emergency contact
          setMessages(prev => [...prev, { 
            sender: 'ai', 
            text: "Oke sip! Btw, buat jaga-jaga aja nih, boleh kasih tau nomor kontak keluarga atau temen deket yang bisa dihubungin kalau ada apa-apa? Kalau ga mau juga gapapa kok, tinggal ketik 'tidak' aja 😊" 
          }]);
          setStep('emergency');
        } else {
           setMessages(prev => [...prev, { sender: 'ai', text: response.message || "Kode verifikasi yang anda masukkan salah." }]);
        }
      } catch (err) {
        setMessages(prev => [...prev, { sender: 'ai', text: err instanceof Error ? err.message : "Gagal verifikasi kode OTP" }]);
      } finally {
        setLoading(false);
      }
    } else if (step === 'emergency') {
      const currentInput = inputValue.trim();
      setMessages(prev => [...prev, { sender: 'user', text: currentInput }]);
      setInputValue("");

      // Check if user declined
      const declineWords = ['tidak', 'nggak', 'ngga', 'ga', 'gak', 'skip', 'lewat'];
      const isDeclined = declineWords.some(word => currentInput.toLowerCase().includes(word));

      if (isDeclined) {
        // User declined, proceed to login without saving emergency contact
        setMessages(prev => [...prev, { 
          sender: 'ai', 
          text: "Oke deh, no worries! Yuk langsung masuk aja 🚀" 
        }]);
        
        setTimeout(() => {
          login(authToken, {
            id: userData.email,
            email: userData.email,
            name: userData.name,
            avatar: userData.avatar,
          });
          onSuccess(email);
        }, 800);
      } else {
        // Validate phone number (basic validation for Indonesian phone numbers)
        const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
        if (!phoneRegex.test(currentInput.replace(/[\s-]/g, ''))) {
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              sender: 'ai', 
              text: "Hmm, nomor teleponnya kayaknya kurang lengkap deh. Coba cek lagi ya! Format yang bener contohnya: 081234567890 atau +6281234567890" 
            }]);
          }, 500);
          return;
        }

        // Save emergency contact
        setLoading(true);
        try {
          await fetch('https://apiceritain.indonesiacore.com/api/users/update-emergency-phone', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              phoneEmergency: currentInput,
            }),
          });

          setMessages(prev => [...prev, { 
            sender: 'ai', 
            text: "Makasih ya udah kasih tau! Semoga ga kepake sih, tapi at least udah aman. Yuk masuk sekarang! 🎉" 
          }]);

          setTimeout(() => {
            login(authToken, {
              id: userData.email,
              email: userData.email,
              name: userData.name,
              avatar: userData.avatar,
            });
            onSuccess(email);
          }, 800);
        } catch (err) {
          setMessages(prev => [...prev, { 
            sender: 'ai', 
            text: "Waduh, ada error nih pas nyimpen nomor. Tapi gapapa, kita lanjut aja ya!" 
          }]);
          
          setTimeout(() => {
            login(authToken, {
              id: userData.email,
              email: userData.email,
              name: userData.name,
              avatar: userData.avatar,
            });
            onSuccess(email);
          }, 800);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleChangeEmail = () => {
    setStep('email');
    setEmail("");
    setInputValue("");
    setMessages(prev => [...prev, { 
      sender: 'ai', 
      text: "Baik, silahkan masukkan email yang benar." 
    }]);
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
                className="object-cover"
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
                  className={`h-2.5 rounded-full transition-all ${index === currentSlide
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

        {/* Right Side - Chat Login Interface */}
        <div className="w-full md:w-[45%] flex flex-col h-[500px] md:h-full bg-slate-50 border-l border-gray-100">
          {/* Header */}
          <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center gap-3 shadow-sm z-10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center p-0.5">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                 <Rocket className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">AI Assistant</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-xs text-gray-500 font-medium">Online</span>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.sender === 'ai' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {m.sender === 'ai' && (
                      <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mt-auto">
                        <Rocket className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`px-4 py-3 shadow-sm ${
                        m.sender === 'ai'
                          ? 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-sm'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-sm'
                      }`}
                    >
                      <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{m.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-2 max-w-[85%] flex-row">
                    <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mt-auto">
                      <Rocket className="w-4 h-4 text-white" />
                    </div>
                    <div className="px-5 py-4 shadow-sm bg-white border border-gray-100 rounded-2xl rounded-bl-sm flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></span>
                       <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.2s'}}></span>
                       <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.4s'}}></span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-1" />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)] z-10">
            {step === 'otp' && (
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="font-medium">{email}</span>
                </div>
                <button
                  onClick={handleChangeEmail}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Ganti Email
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                type={step === 'email' ? "email" : "text"}
                inputMode={step === 'otp' ? "numeric" : step === 'emergency' ? "tel" : undefined}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  step === 'email' 
                    ? "Ketik email kamu..." 
                    : step === 'otp' 
                    ? "Ketik 6 digit OTP..." 
                    : "Ketik nomor HP atau 'tidak'..."
                }
                disabled={loading}
                className="w-full pl-5 pr-14 py-3.5 rounded-full border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || loading}
                className="absolute right-2 w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-all shadow-md transform hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:shadow-none"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 translate-x-[-2px] translate-y-[2px]" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
