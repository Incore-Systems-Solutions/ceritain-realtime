"use client";

import { Phone } from "lucide-react";
import { UserProfile } from "./UserProfile";
import { useAuth } from "@/context/AuthProvider";

interface HeaderBarProps {
  onCallClick: () => void;
  onTopupClick: () => void;
}

export function HeaderBar({ onCallClick, onTopupClick }: HeaderBarProps) {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-transparent">
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Header Layout - 3 Columns */}
        <div className="flex items-center gap-4">
          {/* Left - Avatar */}
          <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-lg shrink-0">
            <span className="text-3xl">😊</span>
          </div>

          {/* Center - Title Section */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-0.5 drop-shadow-lg">
              AI Friendly💙
            </h1>
            <p className="text-white/90 text-sm font-medium drop-shadow">
              You&apos;re safe here ✨
            </p>
          </div>

          {/* Right - Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated && (
              <button
                onClick={onCallClick}
                className="relative w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl animate-pulse hover:animate-none"
                aria-label="Start call"
              >
                <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
                <Phone
                  className="w-6 h-6 text-white relative z-10"
                  strokeWidth={2.5}
                  fill="white"
                />
              </button>
            )}
            <UserProfile onTopupClick={onTopupClick} />
          </div>
        </div>
      </div>
    </header>
  );
}
