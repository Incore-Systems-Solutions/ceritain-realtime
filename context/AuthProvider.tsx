"use client";

import React, { createContext, useContext, useState } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  tokenBalance: number | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  refreshTokenBalance: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  // Load from localStorage after hydration
  React.useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Fetch token balance when token is available
  const refreshTokenBalance = React.useCallback(async () => {
    if (!token) return;

    try {
      const { authApi } = await import("@/lib/auth-api");
      const response = await authApi.getToken(token);
      if (response.result !== undefined) {
        setTokenBalance(response.result);
      }
    } catch (error) {
      console.error("Failed to fetch token balance:", error);
    }
  }, [token]);

  // Auto-fetch token balance when token changes
  React.useEffect(() => {
    if (token) {
      refreshTokenBalance();
    } else {
      setTokenBalance(null);
    }
  }, [token, refreshTokenBalance]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("story_init_id");
    localStorage.removeItem("epr_suggested");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        tokenBalance,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        refreshTokenBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
