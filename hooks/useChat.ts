import { useState, useEffect } from "react";
import { storyApi } from "@/lib/story-api";
import { useAuth } from "@/context/AuthProvider";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [initId, setInitId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
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
      }
    } catch (error) {
      console.error("Failed to initialize story:", error);
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
  };
}
