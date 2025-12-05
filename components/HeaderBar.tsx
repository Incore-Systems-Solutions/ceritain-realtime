"use client";

import { Phone, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState, useEffect } from "react";
import { UserProfile } from "./UserProfile";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useAuth } from "@/context/AuthProvider";

interface HeaderBarProps {
  onCallClick: () => void;
  onTopupClick: () => void;
}

export function HeaderBar({ onCallClick, onTopupClick }: HeaderBarProps) {
  const { isAuthenticated } = useAuth();
  const t = useTranslations("header");
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    // Check if user has seen the wizard before
    const hasSeenWizard = localStorage.getItem("hasSeenCallWizard");

    // Show wizard only if user is authenticated and hasn't seen it before
    if (isAuthenticated && !hasSeenWizard) {
      // Delay showing wizard for better UX
      const timer = setTimeout(() => {
        setShowWizard(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const handleCloseWizard = () => {
    setShowWizard(false);
    localStorage.setItem("hasSeenCallWizard", "true");
  };

  const handleCallWithWizard = () => {
    handleCloseWizard();
    onCallClick();
  };

  return (
    <header className="sticky top-0 z-50 bg-transparent">
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Header Layout - 3 Columns */}
        <div className="flex items-center gap-4">
          {/* Left - Avatar */}
          <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-lg shrink-0 overflow-hidden">
            <Image
              src="/ai-gif.gif"
              alt="AI Avatar"
              width={64}
              height={64}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>

          {/* Center - Title Section */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-0.5 drop-shadow-lg">
              {t("title")}
            </h1>
            <p className="text-white/90 text-sm font-medium drop-shadow">
              {t("subtitle")}
            </p>
          </div>

          {/* Right - Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <LanguageSwitcher />
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={handleCallWithWizard}
                  className="relative w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl animate-pulse hover:animate-none"
                  aria-label={t("callButton")}
                >
                  <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
                  <Phone
                    className="w-6 h-6 text-white relative z-10"
                    strokeWidth={2.5}
                    fill="white"
                  />
                </button>

                {/* Wizard Tooltip */}
                {showWizard && (
                  <div className="absolute top-full right-0 mt-3 z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 text-white px-6 py-4 rounded-2xl shadow-2xl min-w-[280px] max-w-[320px]">
                      {/* Close Button */}
                      <button
                        onClick={handleCloseWizard}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                        aria-label="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Arrow pointing to call button */}
                      <div className="absolute -top-2 right-4 w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rotate-45"></div>

                      {/* Content */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">👋</span>
                          <h3 className="font-bold text-lg">
                            {t("wizardTitle")}
                          </h3>
                        </div>
                        <p className="text-white/95 text-sm leading-relaxed">
                          {t("wizardDescription")}
                        </p>
                        <button
                          onClick={handleCallWithWizard}
                          className="w-full bg-white text-purple-600 font-semibold py-2.5 px-4 rounded-xl hover:bg-white/90 transition-colors shadow-lg"
                        >
                          {t("wizardButton")}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <UserProfile onTopupClick={onTopupClick} />
          </div>
        </div>
      </div>
    </header>
  );
}
