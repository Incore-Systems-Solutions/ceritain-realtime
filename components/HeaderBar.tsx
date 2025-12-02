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
    <header
      className="sticky top-0 z-50 backdrop-blur-xl border-b"
      style={{
        backgroundColor: "var(--header-bg)",
        borderColor: "var(--header-border)",
      }}
    >
      <div className="max-w-4xl mx-auto px-6 h-[70px] flex items-center justify-between">
        {/* Left: Avatar + Name */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
            <span className="text-white font-semibold text-sm">AI</span>
          </div>

          {/* Name & Status */}
          <div>
            <h1 className="font-semibold text-[15px] tracking-tight">
              AI Friendly
            </h1>
            <p className="text-xs opacity-60">Online</p>
          </div>
        </div>

        {/* Right: Call Button & User Profile */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={onCallClick}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: "var(--surface-elevated)",
              }}
              aria-label="Start call"
            >
              <Phone className="w-5 h-5" style={{ color: "var(--accent)" }} />
            </button>
          )}
          <UserProfile onTopupClick={onTopupClick} />
        </div>
      </div>
    </header>
  );
}
