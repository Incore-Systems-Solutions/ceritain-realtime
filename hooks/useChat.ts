import { useState, useEffect } from "react";
import { storyApi } from "@/lib/story-api";
import { authApi } from "@/lib/auth-api";
import { useAuth } from "@/context/AuthProvider";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  isTokenEmpty?: boolean;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [initId, setInitId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasInsufficientToken, setHasInsufficientToken] = useState(false);
  const { token, isAuthenticated } = useAuth();

  // Load initId from localStorage on mount
  useEffect(() => {
    const storedInitId = localStorage.getItem("story_init_id");
    if (storedInitId) {
      setInitId(storedInitId);
    }
  }, []);

  const initializeStory = async () => {
    if (!token) return;

    try {
      // Check token balance first
      const tokenResponse = await authApi.getToken(token);

      if (tokenResponse.errorCode === 0 && tokenResponse.result !== undefined) {
        const tokenBalance = tokenResponse.result;

        // If token is 0 or less, show token empty message
        if (tokenBalance <= 0) {
          const tokenEmptyMessage: Message = {
            id: `token-empty-${Date.now()}`,
            text: "Token kamu udah habis nih. Yuk topup dulu biar bisa lanjut ngobrol sama AI Friendly!",
            sender: "ai",
            timestamp: new Date(),
            isTokenEmpty: true,
          };

          setMessages([tokenEmptyMessage]);
          setIsInitialized(true);
          setHasInsufficientToken(true);
          return;
        }
      }

      // Proceed with story initialization if token is sufficient
      const response = await storyApi.initStory(token);

      if (response.errorCode === 0 && response.result) {
        const { initId: newInitId, response: aiResponse } = response.result;

        // Save initId to state and localStorage
        setInitId(newInitId);
        localStorage.setItem("story_init_id", newInitId);

        // Add AI's initial message
        const aiMessage: Message = {
          id: `ai-${response.result.id}`,
          text: aiResponse,
          sender: "ai",
          timestamp: new Date(response.result.createdAt),
        };

        setMessages([aiMessage]);
        setIsInitialized(true);

        // Refresh token balance after initialization
        window.dispatchEvent(new Event("refreshTokenBalance"));
      } else if (response.errorCode === 1476) {
        // Token habis saat init (fallback)
        const tokenEmptyMessage: Message = {
          id: `token-empty-${Date.now()}`,
          text: "Token kamu udah habis nih. Yuk topup dulu biar bisa lanjut ngobrol sama AI Friendly!🤗",
          sender: "ai",
          timestamp: new Date(),
          isTokenEmpty: true,
        };

        setMessages([tokenEmptyMessage]);
        setIsInitialized(true);
        setHasInsufficientToken(true);
      }
    } catch (error) {
      console.error("Failed to initialize story:", error);
      setIsInitialized(true);
    }
  };

  // Initialize story when user is authenticated
  useEffect(() => {
    if (isAuthenticated && token && !isInitialized) {
      initializeStory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token, isInitialized]);

  const sendMessage = async (text: string) => {
    if (!token || !initId) {
      console.error("Not authenticated or story not initialized");
      return;
    }

    // Check token balance first before sending message
    try {
      const tokenResponse = await authApi.getToken(token);

      if (tokenResponse.errorCode === 0 && tokenResponse.result !== undefined) {
        const tokenBalance = tokenResponse.result;

        // If token is 0 or less, show token empty message and disable input
        if (tokenBalance <= 0) {
          const tokenEmptyMessage: Message = {
            id: `token-empty-${Date.now()}`,
            text: "Token kamu udah habis nih. Yuk topup dulu biar bisa lanjut ngobrol sama AI Friendly!",
            sender: "ai",
            timestamp: new Date(),
            isTokenEmpty: true,
          };

          setMessages((prev) => [...prev, tokenEmptyMessage]);
          setHasInsufficientToken(true);
          return;
        }
      }
    } catch (error) {
      console.error("Failed to check token balance:", error);
    }

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await storyApi.sendMessage(token, initId, text);

      if (response.errorCode === 0 && response.result) {
        const aiMessage: Message = {
          id: `ai-${response.result.id}`,
          text: response.result.response,
          sender: "ai",
          timestamp: new Date(response.result.createdAt),
        };

        setMessages((prev) => [...prev, aiMessage]);

        // Refresh token balance after successful message
        window.dispatchEvent(new Event("refreshTokenBalance"));
      } else if (response.errorCode === 1476) {
        // Token habis saat send message (fallback)
        const tokenEmptyMessage: Message = {
          id: `token-empty-${Date.now()}`,
          text: "Token kamu udah habis nih. Yuk topup dulu biar bisa lanjut ngobrol sama AI Friendly!",
          sender: "ai",
          timestamp: new Date(),
          isTokenEmpty: true,
        };

        setMessages((prev) => [...prev, tokenEmptyMessage]);
        setHasInsufficientToken(true);
      }
    } catch (error) {
      console.error("Failed to send message:", error);

      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: "Maaf, terjadi kesalahan. Silakan coba lagi.",
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return {
    messages,
    isTyping,
    sendMessage,
    isInitialized,
    hasInsufficientToken,
  };
}
