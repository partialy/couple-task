import React from "react";
import { UiTaskDetail } from "@/types/task";

interface TaskCoverProps {
  task: UiTaskDetail;
  isRevealed: boolean;
}

export default function TaskCover({ task, isRevealed }: TaskCoverProps) {
  return (
    <div className="relative w-full h-[45vh] shrink-0 overflow-hidden">
      <img
        src={task.img}
        alt={task.title}
        className={`w-full h-full object-cover transition-all duration-700 ${task.isPrivate && !isRevealed ? "blur-2xl scale-110" : ""}`}
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-slate-900"></div>
    </div>
  );
}
