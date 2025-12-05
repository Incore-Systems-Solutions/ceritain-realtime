"use client";

import { useTranslations } from "next-intl";
import { useState, FormEvent, useRef, useEffect } from "react";
import { ArrowUp, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import type { EmojiClickData } from "emoji-picker-react";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface InputBarProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export function InputBarI18n({
  onSendMessage,
  disabled = false,
}: InputBarProps) {
  const t = useTranslations("chat");
  const [inputText, setInputText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputText]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !disabled) {
      onSendMessage(inputText);
      setInputText("");
      setShowEmojiPicker(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const textarea = textareaRef.current;

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText =
        inputText.substring(0, start) + emoji + inputText.substring(end);

      setInputText(newText);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    } else {
      setInputText(inputText + emoji);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 backdrop-blur-md bg-gradient-to-t from-white/40 to-transparent">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4">
        <div
          className={`flex items-center gap-3 rounded-full px-5 py-3 bg-white/95 backdrop-blur-sm shadow-xl border border-white/50 ${
            disabled ? "opacity-50" : ""
          }`}
        >
          <div className="relative" ref={emojiPickerRef}>
            <button
              type="button"
              onClick={() => !disabled && setShowEmojiPicker(!showEmojiPicker)}
              disabled={disabled}
              className="shrink-0 transition-all hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100"
              aria-label="Emoji picker"
            >
              <Smile
                className={`w-6 h-6 ${
                  disabled ? "text-gray-400" : "text-blue-500"
                }`}
              />
            </button>

            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-0 mb-2 z-50"
                >
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    width={350}
                    height={400}
                    searchPlaceHolder="Cari emoji..."
                    previewConfig={{ showPreview: false }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled ? t("inputPlaceholderDisabled") : t("inputPlaceholder")
            }
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent outline-none text-[15px] text-gray-700 placeholder:text-gray-400 resize-none max-h-[120px] overflow-y-auto py-1 font-medium disabled:cursor-not-allowed"
            style={{
              minHeight: "24px",
            }}
          />

          <AnimatePresence>
            {inputText.trim() && !disabled && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                type="submit"
                className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 transition-all"
                aria-label={t("sendButton")}
              >
                <ArrowUp className="w-5 h-5 text-white" strokeWidth={2.5} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
}
