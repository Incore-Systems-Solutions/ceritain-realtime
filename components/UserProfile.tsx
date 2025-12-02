"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthProvider";
import { authApi } from "@/lib/auth-api";
import { User, Coins, LogOut, Loader2 } from "lucide-react";

export function UserProfile() {
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

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          backgroundColor: "var(--surface-elevated)",
        }}
        aria-label="User menu"
      >
        <User className="w-5 h-5" style={{ color: "var(--accent)" }} />
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
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 z-20 overflow-hidden"
            >
              {/* User Info */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Token Balance */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Token Balance
                    </span>
                  </div>
                  <div className="text-right">
                    {loadingToken ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : (
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {tokenBalance !== null
                          ? tokenBalance.toLocaleString()
                          : "-"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  logout();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-3"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Keluar</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
