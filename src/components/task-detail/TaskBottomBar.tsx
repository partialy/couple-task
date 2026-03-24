import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface TaskBottomBarProps {
  status: string;
  isAuthorTask: boolean;
  isReceiverTask: boolean;
  finishTime: string;
  onAction: (type: "accept" | "complete" | "abandon" | "apply") => void;
}

export default function TaskBottomBar({
  status,
  isAuthorTask,
  finishTime,
  isReceiverTask,
  onAction,
}: TaskBottomBarProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 flex items-center space-x-4 z-20">
      {status === "pending" ? (
        <>
          {isAuthorTask ? (
            <button
              disabled
              className="flex-1 h-12 bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full font-bold flex items-center justify-center space-x-2 cursor-not-allowed"
            >
              <span>不能接取自己发布的任务</span>
            </button>
          ) : (
            <button
              onClick={() => onAction("accept")}
              className="flex-1 h-12 bg-linear-to-r from-cyan-400 to-blue-500 dark:from-cyan-500 dark:to-blue-600 text-white rounded-full font-bold shadow-lg shadow-cyan-300/40 dark:shadow-cyan-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
            >
              <span>接受任务</span>
            </button>
          )}
        </>
      ) : status === "in-progress" ? (
        <>
          {isReceiverTask && !isAuthorTask ? (
            <>
              <button
                onClick={() => onAction("abandon")}
                className="flex-1 h-12 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center space-x-2"
              >
                <XCircle className="w-5 h-5" />
                <span>放弃任务</span>
              </button>
              <button
                onClick={() => onAction("apply")}
                className="flex-1 h-12 bg-linear-to-r from-emerald-400 to-teal-500 dark:from-emerald-500 dark:to-teal-600 text-white rounded-full font-bold shadow-lg shadow-emerald-300/40 dark:shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>申请完成</span>
              </button>
            </>
          ) : isAuthorTask ? (
            <>
              <button
                onClick={() => onAction("abandon")}
                className="flex-1 h-12 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center space-x-2"
              >
                <XCircle className="w-5 h-5" />
                <span>撤回任务</span>
              </button>
              <button
                onClick={() => onAction("complete")}
                className="flex-1 h-12 bg-linear-to-r from-emerald-400 to-teal-500 dark:from-emerald-500 dark:to-teal-600 text-white rounded-full font-bold shadow-lg shadow-emerald-300/40 dark:shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>确认对方完成</span>
              </button>
            </>
          ) : (
            <div className="flex-1 h-12 bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full font-bold flex items-center justify-center">
              不可操作
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 flex-col h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full font-bold flex items-center justify-center space-x-2 border border-emerald-200 dark:border-emerald-500/20">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>任务已完成</span>
          </span>
          <span className="text-[10px]">{finishTime}</span>
        </div>
      )}
    </div>
  );
}
