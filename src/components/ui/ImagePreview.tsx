import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

export interface ImagePreviewProps {
  /** 为 null 或空字符串时不展示 */
  src: string | null | undefined;
  isOpen: boolean;
  onClose: () => void;
  /** 无障碍说明 */
  alt?: string;
}

/**
 * 全屏图片预览（点击遮罩或关闭按钮退出，支持 Esc）
 */
export default function ImagePreview({
  src,
  isOpen,
  onClose,
  alt = "预览图片",
}: ImagePreviewProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const show = isOpen && !!src?.trim();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="图片预览"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4"
        >
          <motion.button
            type="button"
            aria-label="关闭预览"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="relative z-10 flex max-h-[min(92vh,100%)] w-full max-w-6xl flex-col items-center justify-center">
            <button
              type="button"
              onClick={onClose}
              className="absolute -top-1 right-0 z-20 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20 sm:-right-2 sm:top-0"
              aria-label="关闭"
            >
              <X className="h-6 w-6" />
            </button>
            <motion.img
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              src={src!}
              alt={alt}
              className="max-h-[min(88vh,100%)] w-auto max-w-full rounded-lg object-contain shadow-2xl"
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
