import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Calendar as CalendarIcon, CheckCircle, Clock } from "lucide-react";
import TaskCard from "../TaskCard";
import { UiTask } from "@/types/task";

interface TimelineListProps {
  tasks: UiTask[];
  activeStatusTab: "in-progress" | "completed";
  roleTab: "my" | "ta";
  onSelectTask: (task: UiTask) => void;
}

export default function TimelineList({
  tasks,
  activeStatusTab,
  roleTab,
  onSelectTask,
}: TimelineListProps) {
  return (
    <div className="px-4 mt-6 pb-8">
      {tasks.length > 0 ? (
        <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-8">
          <AnimatePresence mode="popLayout">
            {tasks.map((task, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  delay: index * 0.05,
                }}
                key={task.id}
                className="relative pl-6"
              >
                <div
                  className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-slate-50 dark:border-slate-900 ${
                    activeStatusTab === "in-progress"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                />

                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-3 flex items-center">
                  <CalendarIcon className="w-3 h-3 mr-1" />
                  {task.deadline || "INFINITE"}
                </div>

                <div className="relative">
                  <TaskCard task={task} onClick={() => onSelectTask(task)} />
                  {activeStatusTab === "in-progress" ? (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="flex items-center space-x-1 px-2.5 py-1 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg shadow-sm border border-amber-400/50">
                        <Clock className="w-3 h-3" />
                        <span>进行中</span>
                      </span>
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 z-10 pointer-events-none">
                      <span className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg shadow-sm border border-emerald-400/50">
                        <CheckCircle className="w-3 h-3" />
                        <span>已完成</span>
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="w-24 h-24 mb-4 opacity-50 text-slate-300 dark:text-slate-700">
            <CheckCircle className="w-full h-full" />
          </div>
          <p className="text-slate-400 dark:text-slate-500 font-bold">
            暂无
            {activeStatusTab === "in-progress"
              ? roleTab === "my"
                ? "我的进行中"
                : "对方进行中"
              : "已完成"}
            的任务
          </p>
        </motion.div>
      )}
    </div>
  );
}
