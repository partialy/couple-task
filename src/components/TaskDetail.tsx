import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  Trophy,
} from "lucide-react";
import ConfirmModal from "./ui/ConfirmModal";
import confetti from "canvas-confetti";
import TaskHeader from "./task-detail/TaskHeader";
import TaskBottomBar from "./task-detail/TaskBottomBar";
import TaskComments from "./task-detail/TaskComments";
import taskService from "@/api/service/task";
import { TaskDetailVO } from "@/api/types";
import { UiTask, UiTaskDetail } from "@/types/task";
import {
  mergeTaskDetailVOIntoUiTask,
  PublishTaskInitialData,
  taskDetailVOToPublishInitial,
} from "@/mappers/task";
import { useUserStore } from "@/store/user";
import { message } from "@/utils/pure/message";
import TaskCover from "./task-detail/TaskCover";
import TaskMeta from "./task-detail/TaskMeta";
import TaskDescription from "./task-detail/TaskDescription";
import TaskGallery from "./task-detail/TaskGallery";
import TaskInfoCard from "./task-detail/TaskInfoCard";
import TaskRewardsBlock from "./task-detail/TaskRewardsBlock";
import ImagePreview from "./ui/ImagePreview";

export default function TaskDetail({
  task,
  onClose,
  onUpdateTask,
  onToggleBookmark,
  onDeleteTask,
  onUnpublishTask,
  onPublishListingTask,
  onEditTask,
}: {
  task: UiTask;
  onClose: () => void;
  onUpdateTask?: (
    taskId: string,
    newStatus: string,
  ) => Promise<boolean> | boolean;
  onToggleBookmark?: (taskId: string) => void | Promise<void>;
  onDeleteTask?: (taskId: string) => void;
  onUnpublishTask?: (taskId: string) => void | Promise<void>;
  onPublishListingTask?: (taskId: string) => void | Promise<void>;
  /** 进入发布页编辑：由 App 设置 templateData 并打开 publish */
  onEditTask?: (initialData: PublishTaskInitialData) => void;
  key?: string;
}) {
  const currentUser = useUserStore((state) => state.currentUser);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [detail, setDetail] = useState<TaskDetailVO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "accept" | "complete" | "abandon" | null;
  }>({ isOpen: false, type: null });
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null);

  const handleAction = (type: "accept" | "complete" | "abandon") => {
    setConfirmModal({ isOpen: true, type });
  };

  const confirmAction = async () => {
    if (confirmModal.type && onUpdateTask) {
      let newStatus = "";
      let success = true;
      if (confirmModal.type === "accept") newStatus = "in-progress";
      else if (confirmModal.type === "complete") {
        newStatus = "completed";
        success = (await onUpdateTask(task.id, newStatus)) ?? true;

        if (success) {
          // 触发礼花动画
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"],
          });

          // 显示成功界面
          setShowSuccess(true);
          setConfirmModal({ isOpen: false, type: null });

          // 延迟关闭详情页，让用户看一眼成功动画
          setTimeout(() => {
            onClose();
          }, 2000);
        } else {
          setConfirmModal({ isOpen: false, type: null });
        }
        return;
      } else if (confirmModal.type === "abandon") newStatus = "pending"; // 放弃后回到广场

      success = (await onUpdateTask(task.id, newStatus)) ?? true;
      if (success) {
        setConfirmModal({ isOpen: false, type: null });
        onClose();
      } else {
        setConfirmModal({ isOpen: false, type: null });
      }
    } else {
      setConfirmModal({ isOpen: false, type: null });
      onClose();
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!task?.id) return;
      setDetailLoading(true);
      try {
        const res = await taskService.detail(task.id);
        if (res.success && res.data) {
          setDetail(res.data);
        } else {
          setDetail(null);
        }
      } catch (error) {
        setDetail(null);
      } finally {
        setDetailLoading(false);
      }
    };
    fetchDetail();
  }, [task?.id]);

  const displayTask = useMemo<UiTaskDetail>(() => {
    if (!detail) {
      return {
        ...task,
        authorAvatar: null,
      };
    }
    return mergeTaskDetailVOIntoUiTask(task, detail);
  }, [detail, task]);

  const isMyTask = currentUser?.id === displayTask.authorId;
  const isAuthorTask = isMyTask;
  const isReceiverTask =
    !!displayTask.receiverId && currentUser?.id === displayTask.receiverId;

  const handleEditTask = () => {
    if (detailLoading) {
      message.warning("正在加载任务详情，请稍候");
      return;
    }
    if (!detail) {
      message.warning("任务详情未加载完成，请稍后重试");
      return;
    }
    if (!onEditTask) return;
    // 不要在此调用 onClose()：父级通常用 history.back() 关详情，会抵消 App 里 navigateTo('publish') 的入栈
    onEditTask(taskDetailVOToPublishInitial(detail));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden"
    >
      <ImagePreview
        src={previewImageSrc}
        isOpen={previewImageSrc != null}
        onClose={() => setPreviewImageSrc(null)}
        alt={displayTask.title}
      />
      <TaskHeader
        taskId={displayTask.id}
        isBookmarked={displayTask.isBookmarked}
        isMyTask={isMyTask}
        taskStatus={displayTask.status}
        listStatus={displayTask.listStatus ?? "published"}
        onClose={onClose}
        onToggleBookmark={onToggleBookmark}
        onUnpublishTask={onUnpublishTask}
        onPublishListingTask={onPublishListingTask}
        onDeleteTask={onDeleteTask}
        onEditTask={onEditTask ? handleEditTask : undefined}
      />

      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        <TaskCover
          task={displayTask}
          isRevealed={isRevealed}
          onCoverPreview={() => setPreviewImageSrc(displayTask.img)}
        />

        {/* 内容区 */}
        <div className="px-3 -mt-6 pt-8 relative z-10 bg-white dark:bg-slate-900 rounded-t-3xl min-h-[50vh]">
          <TaskMeta task={displayTask} isRevealed={isRevealed} />

          {/* 隐私遮罩 */}
          {displayTask.isPrivate && !isRevealed ? (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 border border-slate-100 dark:border-slate-700/50 my-4">
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-500">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  这是一个隐私任务
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  内容已加密，确认后方可查看详情
                </p>
              </div>
              <button
                onClick={() => setIsRevealed(true)}
                className="px-8 py-3 bg-indigo-500 text-white rounded-full font-bold shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
              >
                点击解密查看
              </button>
            </div>
          ) : (
            <>
              <TaskDescription content={displayTask.desc} loading={detailLoading} />
              <TaskGallery
                images={displayTask.otherImages}
                onImageClick={(src) => setPreviewImageSrc(src)}
              />
            </>
          )}

          <TaskInfoCard deadline={displayTask.deadline} />
          <TaskRewardsBlock
            rewards={displayTask.rewards}
            isPrivate={displayTask.isPrivate}
            isRevealed={isRevealed}
          />

          {/* 评论区 */}
          <TaskComments taskId={displayTask.id} />
        </div>
      </div>

      <TaskBottomBar
        status={displayTask.status}
        isAuthorTask={isAuthorTask}
        isReceiverTask={isReceiverTask}
        onAction={handleAction}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={
          confirmModal.type === "accept"
            ? "确认接受任务？"
            : confirmModal.type === "complete"
              ? "确认对方完成任务？"
              : isAuthorTask
                ? "确认撤回任务？"
                : "确认放弃任务？"
        }
        message={
          confirmModal.type === "accept"
            ? '接受后任务将进入你的"进行中"列表，要开始这个心愿吗？'
            : confirmModal.type === "complete"
              ? "确认对方已完成该任务后，将发放任务奖励给接取人。"
              : isAuthorTask
                ? "撤回后任务将回到待处理状态，等待对方重新接取。"
                : "放弃后任务将重新回到广场，确定要放弃吗？"
        }
        confirmText={
          confirmModal.type === "accept"
            ? "接受"
            : confirmModal.type === "complete"
              ? "已完成"
              : isAuthorTask
                ? "撤回"
                : "放弃"
        }
        confirmColor={
          confirmModal.type === "accept"
            ? "bg-cyan-500 hover:bg-cyan-600"
            : confirmModal.type === "complete"
              ? "bg-emerald-500 hover:bg-emerald-600"
              : "bg-rose-500 hover:bg-rose-600"
        }
        onConfirm={confirmAction}
        onCancel={() => setConfirmModal({ isOpen: false, type: null })}
      />

      {/* 成功完成动画层 */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-100 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6"
            >
              <Trophy className="w-12 h-12" />
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-black text-slate-800 dark:text-white mb-2"
            >
              恭喜完成！
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-500 dark:text-slate-400"
            >
              又完成了一个心愿，你真棒！
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
