import React, { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import TaskDetail from "./TaskDetail";
import { useTaskStore } from "@/store/task";
import { message } from "@/utils/pure/message";
import { UiTask } from "@/types/task";
import type { PublishTaskInitialData } from "@/mappers/task";
import RoleSwitch from "./in-progress/RoleSwitch";
import StatsCards from "./in-progress/StatsCards";
import WeekCalendar from "./in-progress/WeekCalendar";
import StatusTabs from "./in-progress/StatusTabs";
import TimelineList from "./in-progress/TimelineList";
import { useUserStore } from "@/store";

export default function InProgress({
  tasks,
  setTasks,
  onEditTask,
}: {
  tasks: UiTask[];
  setTasks: (tasks: UiTask[]) => void;
  onEditTask?: (initialData: PublishTaskInitialData) => void;
}) {
  const [selectedTask, setSelectedTask] = useState<UiTask | null>(null);
  const [activeStatusTab, setActiveStatusTab] = useState<
    "in-progress" | "completed"
  >("in-progress");
  const [roleTab, setRoleTab] = useState<"my" | "ta">("my");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const {
    completeTask,
    abandonTask,
    fetchTasks,
    toggleBookmark,
    unpublishTask,
    publishListingTask,
    deleteTask,
  } = useTaskStore();
  const currentUser = useUserStore((s) => s.currentUser);


  // Handle back button for modal
  React.useEffect(() => {
    if (selectedTask) {
      if (
        !window.history.state ||
        window.history.state.modal !== "taskDetail"
      ) {
        window.history.pushState({ modal: "taskDetail" }, "", "#taskDetail");
      }

      const handlePopState = () => {
        setSelectedTask(null);
      };

      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [selectedTask?.id]);

  useEffect(()=> {
    fetchTasks()
  },[currentUser.id])

  const handleCloseTaskDetail = () => {
    if (selectedTask) {
      window.history.back();
    }
  };

  const inProgressTasks = tasks.filter((t) => t.status === "in-progress");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const myInProgressTasks =
    inProgressTasks.filter((t) => t.receiverId === currentUser.id) || [];
  const taInProgressTasks =
    inProgressTasks.filter(
      (t) => t.receiverId && t.receiverId !== currentUser.id,
    ) || [];

  const myCompletedTasks =
    completedTasks.filter((t) => t.receiverId === currentUser.id) || [];
  const taCompletedTasks =
    completedTasks.filter(
      (t) => t.receiverId && t.receiverId !== currentUser.id,
    ) || [];

  const displayTasks =
    activeStatusTab === "in-progress"
      ? roleTab === "my"
        ? myInProgressTasks
        : taInProgressTasks
      : roleTab === "my"
        ? myCompletedTasks
        : taCompletedTasks;

  const totalCount =
    roleTab === "my"
      ? myInProgressTasks.length + myCompletedTasks.length
      : taInProgressTasks.length + taCompletedTasks.length;
  const inProgressCount =
    roleTab === "my" ? myInProgressTasks.length : taInProgressTasks.length;
  const completedCount =
    roleTab === "my" ? myCompletedTasks.length : taCompletedTasks.length;

  return (
    <div className="flex-1 h-full bg-slate-50 dark:bg-slate-900 flex flex-col overflow-hidden">
      <div className="shrink-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 z-10">
        <RoleSwitch value={roleTab} onChange={setRoleTab} />
      </div>

      <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        <StatsCards
          total={totalCount}
          inProgress={inProgressCount}
          completed={completedCount}
        />
        <WeekCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
        <StatusTabs value={activeStatusTab} onChange={setActiveStatusTab} />
        <TimelineList
          tasks={displayTasks}
          activeStatusTab={activeStatusTab}
          roleTab={roleTab}
          onSelectTask={setSelectedTask}
        />
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetail
            task={selectedTask}
            onClose={handleCloseTaskDetail}
            onDeleteTask={async (taskId) => {
              const r = await deleteTask(String(taskId));
              if (r.success) {
                message.success(r.msg || '已删除');
                handleCloseTaskDetail();
              } else {
                message.error(r.msg || '删除失败');
              }
            }}
            onUnpublishTask={async (taskId) => {
              const r = await unpublishTask(String(taskId));
              if (r.success) {
                message.success(r.msg || "已下架");
                handleCloseTaskDetail();
              } else {
                message.error(r.msg || "下架失败");
              }
            }}
            onPublishListingTask={async (taskId) => {
              const r = await publishListingTask(String(taskId));
              if (r.success) {
                message.success(r.msg || "已上架");
                handleCloseTaskDetail();
              } else {
                message.error(r.msg || "上架失败");
              }
            }}
            onUpdateTask={async (taskId, newStatus) => {
              if (newStatus === "completed") {
                const res = await completeTask(taskId.toString());
                if (res.success) {
                  setTasks(
                    tasks.map((t) =>
                      t.id === taskId ? { ...t, status: newStatus } : t,
                    ),
                  );
                  return true;
                }
                return false;
              } else if (newStatus === "pending") {
                const res = await abandonTask(taskId.toString());
                if (res.success) {
                  setTasks(
                    tasks.map((t) => {
                      if (t.id === taskId) {
                        const updatedTask = { ...t, status: newStatus };
                        return updatedTask;
                      }
                      return t;
                    }),
                  );
                  return true;
                }
                return false;
              } else {
                setTasks(
                  tasks.map((t) => {
                    if (t.id === taskId) {
                      const updatedTask = { ...t, status: newStatus };
                      return updatedTask;
                    }
                    return t;
                  }),
                );
                return true;
              }
            }}
            onToggleBookmark={async (taskId) => {
              await toggleBookmark(taskId);
              const next =
                useTaskStore.getState().tasks.find((t) => t.id === taskId) ?? null;
              setSelectedTask(next);
            }}
            onEditTask={(initialData) => {
              setSelectedTask(null);
              if (window.history.state?.modal === 'taskDetail') {
                window.history.replaceState({ view: 'home' }, '', '#home');
              }
              onEditTask?.(initialData);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
