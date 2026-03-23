import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Smile, Mic, Plus } from "lucide-react";
import EmojiPicker, { Theme, type EmojiClickData } from "emoji-picker-react";
import { message } from "@/utils/pure/message";
import MoreActionsPanel, { type AttachmentPickType } from "./MoreActionsPanel";
import ChatAttachmentModal, { type ChatAttachmentKind } from "@/components/ui/ChatAttachmentModal";

interface ChatInputProps {
  onSend: (text: string) => void;
  /** 选择附件并确认后：上传与发送由上层处理 */
  onSendAttachments?: (type: ChatAttachmentKind, files: File[]) => void | Promise<void>;
  disabled?: boolean;
}

export default function ChatInput({ onSend, onSendAttachments, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [attachmentKind, setAttachmentKind] = useState<ChatAttachmentKind>("image");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiWrapRef = useRef<HTMLDivElement>(null);
  const plusPanelRef = useRef<HTMLDivElement>(null);
  const plusButtonRef = useRef<HTMLButtonElement>(null);

  const insertAtCursor = useCallback((insert: string) => {
    setText((prev) => {
      const ta = textareaRef.current;
      if (!ta) return prev + insert;
      const start = Math.min(ta.selectionStart ?? prev.length, prev.length);
      const end = Math.min(ta.selectionEnd ?? prev.length, prev.length);
      const newText = prev.slice(0, start) + insert + prev.slice(end);
      queueMicrotask(() => {
        ta.focus();
        const pos = start + insert.length;
        ta.setSelectionRange(pos, pos);
      });
      return newText;
    });
  }, []);

  const handleEmojiSelect = useCallback(
    (emojiData: EmojiClickData) => {
      insertAtCursor(emojiData.emoji);
    },
    [insertAtCursor],
  );

  useEffect(() => {
    if (!showEmoji && !showPlusMenu) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (emojiWrapRef.current?.contains(t)) return;
      if (plusPanelRef.current?.contains(t)) return;
      if (plusButtonRef.current?.contains(t)) return;
      setShowEmoji(false);
      setShowPlusMenu(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showEmoji, showPlusMenu]);

  const handlePickType = (type: AttachmentPickType) => {
    setShowPlusMenu(false);
    setAttachmentKind(type);
    setAttachmentOpen(true);
  };

  const handleAttachmentConfirm = (files: File[]) => {
    void onSendAttachments?.(attachmentKind, files);
  };

  const handleSend = () => {
    if (disabled) return;
    if (text.trim()) {
      onSend(text.trim());
      setText("");
      setShowEmoji(false);
      setShowPlusMenu(false);
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
    <div className="flex flex-col bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
      <div className="p-3">
        <div className="flex items-end gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              message.info("语音功能敬请期待");
              setShowEmoji(false);
              setShowPlusMenu(false);
            }}
            className="shrink-0 rounded-full p-2.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            aria-label="语音"
          >
            <Mic className="h-5 w-5" />
          </button>

          <div className="relative min-w-0 flex-1" ref={emojiWrapRef}>
            <div className="flex items-end rounded-2xl border border-transparent bg-slate-100 transition-colors dark:bg-slate-900/50">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                placeholder="输入消息..."
                className="min-h-[44px] max-h-32 w-full min-w-0 resize-none border-none bg-transparent py-3 pl-4 pr-2 text-sm text-slate-800 outline-none focus:ring-0 placeholder:text-slate-400 disabled:opacity-50 dark:text-slate-200"
                rows={1}
                style={{ height: "auto", WebkitTapHighlightColor: "transparent" }}
              />
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  setShowEmoji((v) => !v);
                  setShowPlusMenu(false);
                }}
                aria-expanded={showEmoji}
                aria-haspopup="dialog"
                aria-label="表情"
                className="shrink-0 p-3 text-slate-400 transition-colors hover:text-slate-600 disabled:opacity-40 dark:hover:text-slate-300"
              >
                <Smile className="h-5 w-5" />
              </button>
            </div>
            {showEmoji && (
              <div
                className="absolute bottom-full left-1/2 z-50 mb-2 w-[min(100vw-1.5rem,320px)] max-w-[calc(100vw-1.5rem)] -translate-x-1/2"
                role="dialog"
                aria-label="表情选择"
              >
                <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-200/80 dark:ring-slate-600">
                  <EmojiPicker
                    onEmojiClick={handleEmojiSelect}
                    theme={Theme.AUTO}
                    width={typeof window !== "undefined" ? Math.min(320, window.innerWidth - 24) : 320}
                    height={380}
                    searchPlaceholder="搜索表情"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0">
            <button
              ref={plusButtonRef}
              type="button"
              disabled={disabled}
              onClick={() => {
                setShowPlusMenu((v) => !v);
                setShowEmoji(false);
              }}
              aria-expanded={showPlusMenu}
              aria-haspopup="menu"
              aria-label="更多"
              className={`rounded-full p-3 transition-colors ${
                showPlusMenu
                  ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600"
              } disabled:opacity-40`}
            >
              <Plus className={`h-5 w-5 transition-transform ${showPlusMenu ? "rotate-45" : ""}`} />
            </button>
          </div>

          {text.trim() ? (
            <button
              type="button"
              onClick={handleSend}
              disabled={disabled}
              className="shrink-0 rounded-full bg-indigo-500 p-3 text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-600 disabled:opacity-50 dark:shadow-indigo-900/50"
              aria-label="发送"
            >
              <Send className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>

      <MoreActionsPanel
        open={showPlusMenu}
        panelRef={plusPanelRef}
        onPickType={handlePickType}
      />

      <ChatAttachmentModal
        isOpen={attachmentOpen}
        kind={attachmentKind}
        onClose={() => setAttachmentOpen(false)}
        onConfirm={handleAttachmentConfirm}
      />
    </div>
  );
}
