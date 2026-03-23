import React, { useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";

const SCALE_STEP = 10;
const SCALE_MIN = 10;
const SCALE_MAX = 400;

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
  const [scalePercent, setScalePercent] = useState(100);
  const [rotationDeg, setRotationDeg] = useState(0);

  useEffect(() => {
    if (!isOpen || !src?.trim()) return;
    setScalePercent(100);
    setRotationDeg(0);
  }, [isOpen, src]);

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

  const zoomIn = () => {
    setScalePercent((p) => Math.min(SCALE_MAX, p + SCALE_STEP));
  };

  const zoomOut = () => {
    setScalePercent((p) => Math.max(SCALE_MIN, p - SCALE_STEP));
  };

  const rotateCw = () => {
    setRotationDeg((d) => (d + 90) % 360);
  };

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
          <div
            className="relative z-10 flex max-h-[min(92vh,100%)] w-full max-w-6xl flex-col items-center justify-center"
            onClick={onClose}
          >
            <button
              type="button"
              onClick={onClose}
              className="fixed top-4 right-2 z-20 rounded-full bg-white/50 p-2.5 text-white transition-colors hover:bg-white/20"
              aria-label="关闭"
            >
              <X className="h-6 w-6" />
            </button>
            <div
              className="flex max-h-[min(88vh,100%)] w-full max-w-full flex-1 items-center justify-center overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                className="inline-flex max-h-[min(88vh,100%)] max-w-full items-center justify-center"
              >
                <div
                  className="inline-flex max-h-[min(88vh,100%)] max-w-full items-center justify-center"
                  style={{
                    transform: `rotate(${rotationDeg}deg) scale(${scalePercent / 100})`,
                    transformOrigin: "center center",
                  }}
                >
                  <img
                    src={src!}
                    alt={alt}
                    className="max-h-[min(88vh,100%)] w-auto max-w-full rounded-lg object-contain shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </motion.div>
            </div>
            <div
              className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/15 bg-black/55 px-2 py-1.5 text-white shadow-lg backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={zoomOut}
                disabled={scalePercent <= SCALE_MIN}
                className="rounded-full p-2.5 transition-colors hover:bg-white/15 disabled:pointer-events-none disabled:opacity-35"
                aria-label="缩小"
                title="缩小 10%"
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <span className="min-w-[3.25rem] select-none text-center text-sm tabular-nums text-white/90">
                {scalePercent}%
              </span>
              <button
                type="button"
                onClick={zoomIn}
                disabled={scalePercent >= SCALE_MAX}
                className="rounded-full p-2.5 transition-colors hover:bg-white/15 disabled:pointer-events-none disabled:opacity-35"
                aria-label="放大"
                title="放大 10%"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <div className="mx-1 h-6 w-px bg-white/25" aria-hidden />
              <button
                type="button"
                onClick={rotateCw}
                className="rounded-full p-2.5 transition-colors hover:bg-white/15"
                aria-label="顺时针旋转 90 度"
                title="旋转 90°"
              >
                <RotateCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
