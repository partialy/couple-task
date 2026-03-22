import React from "react";
import { UiTaskDetail } from "@/types/task";

interface TaskCoverProps {
  task: UiTaskDetail;
  isRevealed: boolean;
  /** 封面可点击放大预览（隐私未解密时不生效） */
  onCoverPreview?: () => void;
}

export default function TaskCover({ task, isRevealed, onCoverPreview }: TaskCoverProps) {
  const canPreview =
    !!onCoverPreview && task.img && (!task.isPrivate || isRevealed);

  return (
    <div className="relative h-[45vh] w-full shrink-0 overflow-hidden">
      {canPreview ? (
        <button
          type="button"
          aria-label={`放大查看封面：${task.title}`}
          onClick={onCoverPreview}
          className="block h-full w-full cursor-zoom-in p-0 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/50"
        >
          <img
            src={task.img}
            alt={task.title}
            className={`h-full w-full object-cover transition-all duration-700 ${task.isPrivate && !isRevealed ? "blur-2xl scale-110" : ""}`}
            referrerPolicy="no-referrer"
          />
        </button>
      ) : (
        <img
          src={task.img}
          alt={task.title}
          className={`h-full w-full object-cover transition-all duration-700 ${task.isPrivate && !isRevealed ? "blur-2xl scale-110" : ""}`}
          referrerPolicy="no-referrer"
        />
      )}
      {/* pointer-events-none：避免挡住封面点击预览 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-slate-900" />
    </div>
  );
}
