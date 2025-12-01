'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { Mic, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InputBarProps {
  onSendMessage: (text: string) => void;
}

export function InputBar({ onSendMessage }: InputBarProps) {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputText]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleMicClick = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      console.log('Start recording voice note...');
      // TODO: Implement voice recording
    } else {
      console.log('Stop recording voice note...');
      // TODO: Stop recording and send
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 border-t backdrop-blur-xl"
      style={{
        backgroundColor: 'var(--input-bg)',
        borderColor: 'var(--header-border)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto p-4"
      >
        <div
          className="flex items-end gap-2 rounded-full px-4 py-2 shadow-sm"
          style={{
            backgroundColor: 'var(--input-field-bg)',
          }}
        >
          {/* Microphone Button */}
          <button
            type="button"
            onClick={handleMicClick}
            className={`p-2 rounded-full transition-all flex-shrink-0 ${isRecording
                ? 'bg-red-500 text-white'
                : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            aria-label="Voice note"
          >
            <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
          </button>

          {/* Textarea Field */}
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan..."
            rows={1}
            className="flex-1 bg-transparent outline-none text-[15px] placeholder:opacity-50 resize-none max-h-[120px] overflow-y-auto py-2"
            style={{
              minHeight: '24px',
            }}
          />

          {/* Send Button - Only show when there's text */}
          <AnimatePresence>
            {inputText.trim() && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                type="submit"
                className="p-2 rounded-full transition-all flex-shrink-0 shadow-md hover:shadow-lg active:scale-95"
                style={{
                  backgroundColor: 'var(--accent)',
                }}
                aria-label="Send message"
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
