"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthProvider";
import { authApi } from "@/lib/auth-api";
import { User, Coins, LogOut, Loader2, Plus } from "lucide-react";

interface UserProfileProps {
  onTopupClick: () => void;
}

export function UserProfile({ onTopupClick }: UserProfileProps) {
  const t = useTranslations("profile");
  const { user, token, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [loadingToken, setLoadingToken] = useState(false);

  const fetchToken = async () => {
    if (!token) return;

    setLoadingToken(true);
    try {
      const response = await authApi.getToken(token);
      if (response.errorCode === 0 && response.result !== undefined) {
        setTokenBalance(response.result);
      }
    } catch (error) {
      console.error("Failed to fetch token:", error);
    } finally {
      setLoadingToken(false);
    }
  };

  useEffect(() => {
    if (showMenu && token && tokenBalance === null) {
      fetchToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMenu, token, tokenBalance]);

  // Listen for token balance refresh event
  useEffect(() => {
    const handleRefresh = () => {
      setTokenBalance(null);
      if (token) {
        fetchToken();
      }
    };

    window.addEventListener("refreshTokenBalance", handleRefresh);
    return () => {
      window.removeEventListener("refreshTokenBalance", handleRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
        aria-label="User menu"
      >
        <User className="w-5 h-5 text-white" strokeWidth={2.5} />
      </button>

      <AnimatePresence>
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, type: "spring" }}
              className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-[24px] shadow-2xl border border-white/50 z-20 overflow-hidden"
            >
              {/* User Info */}
              <div className="p-5 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
                    <User className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate text-base">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-gray-600 truncate font-medium">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Token Balance */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                        <Coins className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {t("tokenBalance")}
                      </span>
                    </div>
                    <div className="text-right">
                      {loadingToken ? (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                      ) : (
                        <span className="text-xl font-bold text-gray-900">
                          {tokenBalance !== null
                            ? tokenBalance.toLocaleString()
                            : "-"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Topup Button */}
                  <button
                    onClick={() => {
                      onTopupClick();
                      setShowMenu(false);
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                    {t("topupButton")}
                  </button>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  logout();
                  setShowMenu(false);
                }}
                className="w-full px-5 py-4 text-left text-red-600 hover:bg-red-50 transition-all flex items-center gap-3 font-semibold"
              >
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-red-600" strokeWidth={2.5} />
                </div>
                <span>{t("logoutButton")}</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
