import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Image, Video, File } from "lucide-react";

export type AttachmentPickType = "image" | "video" | "file";

export interface MoreActionsPanelProps {
  open: boolean;
  panelRef: React.RefObject<HTMLDivElement | null>;
  onPickType: (type: AttachmentPickType) => void;
}

const panelTransition = { duration: 0.22, ease: "linear" as const };

/**
 * 聊天输入区：加号下方展开面板（图片 / 视频 / 文件入口）
 */
export default function MoreActionsPanel({
  open,
  panelRef,
  onPickType,
}: MoreActionsPanelProps) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          ref={panelRef}
          key="plus-panel"
          role="region"
          aria-label="更多功能"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={panelTransition}
          className="shrink-0 overflow-hidden border-t border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/80"
        >
          <div className="px-4 py-6">
            <div className="mx-auto grid max-w-md grid-cols-4 gap-6">
              <button
                type="button"
                className="flex flex-col items-center gap-2 text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
                onClick={() => onPickType("image")}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800 dark:ring-slate-600">
                  <Image className="h-7 w-7 text-green-500" />
                </span>
                <span className="text-xs font-medium">图片</span>
              </button>
              <button
                type="button"
                className="flex flex-col items-center gap-2 text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
                onClick={() => onPickType("video")}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800 dark:ring-slate-600">
                  <Video className="h-7 w-7 text-indigo-500" />
                </span>
                <span className="text-xs font-medium">视频</span>
              </button>
              <button
                type="button"
                className="flex flex-col items-center gap-2 text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
                onClick={() => onPickType("file")}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800 dark:ring-slate-600">
                  <File className="h-7 w-7 text-orange-500" />
                </span>
                <span className="text-xs font-medium">文件</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
