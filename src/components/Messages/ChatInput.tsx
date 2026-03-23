import React, { useState } from 'react';
import { Send, Smile, Paperclip, Mic } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (disabled) return;
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-3">
      <div className="flex items-end space-x-2">
        <button
          type="button"
          disabled={disabled}
          className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex-shrink-0 disabled:opacity-40"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <div className="flex-1 bg-slate-100 dark:bg-slate-900/50 rounded-2xl flex items-end border border-transparent transition-colors">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="输入消息..."
            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none outline-none resize-none max-h-32 min-h-[44px] py-3 px-4 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 disabled:opacity-50"
            rows={1}
            style={{ height: 'auto', WebkitTapHighlightColor: 'transparent' }}
          />
          <button
            type="button"
            disabled={disabled}
            className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex-shrink-0 disabled:opacity-40"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {text.trim() ? (
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled}
            className="p-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors flex-shrink-0 shadow-sm shadow-indigo-200 dark:shadow-indigo-900/50 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            disabled={disabled}
            className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex-shrink-0 disabled:opacity-40"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
