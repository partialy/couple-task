import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Gift,
  Heart,
  Star,
  Coffee,
  Plane,
  Music,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { TaskReward, useTaskStore, useUserStore } from "../../store";
import { message } from "@/utils/pure/message";
import { uploadToQiniu, revokeLocalPreview } from "@/utils/qiniu";

import Header from "./Header";
import ImageUpload from "./ImageUpload";
import BasicInfo from "./BasicInfo";
import TaskSettings from "./TaskSettings";
import TaskRewards, { RewardDraft } from "./TaskRewards";
import ExtraSettings from "./ExtraSettings";


interface PublishTaskProps {
  onBack: () => void;
  onPublish: () => void;
  initialData?: any;
  key?: string;
}

export default function PublishTask({
  onBack,
  onPublish,
  initialData,
}: PublishTaskProps) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [rewardType, setRewardType] = useState<"wild_card" | "points">("wild_card");
  const [wildcardAmount, setWildcardAmount] = useState<number>(1);
  const [pointsAmount, setPointsAmount] = useState<number>(100);

  const [rewards, setRewards] = useState<RewardDraft[]>([
    { text: "", color: "pink", icon: "Gift", type: 'normal',description: "", amount: 1 },
  ]);
  const [activeIconPicker, setActiveIconPicker] = useState<number | null>(null);
  const [usePrivilegeCard, setUsePrivilegeCard] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [otherImages, setOtherImages] = useState<string[]>([]);
  const [otherFiles, setOtherFiles] = useState<File[]>([]);
  const [deadline, setDeadline] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);

  const createTask = useTaskStore((state) => state.createTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const fetchPublishConfig = useTaskStore((state) => state.fetchPublishConfig);
  const storeCategories = useTaskStore((state) => state.categories);
  const storeTaskLevels = useTaskStore((state) => state.taskLevels);
  const storeAllTags = useTaskStore((state) => state.allTags);
  const normalizedAllTags = Array.isArray(storeAllTags)
    ? storeAllTags
        .map((tag) =>
          typeof tag === "string"
            ? tag
            : typeof tag === "object" && tag && "name" in tag
              ? String((tag as { name?: unknown }).name ?? "")
              : ""
        )
        .filter((tag) => tag.trim().length > 0)
    : [];

  const currentUser = useUserStore((state) => state.currentUser);
  const bindingRelations = useUserStore((state) => state.bindingRelations);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      if (coverImage?.startsWith("blob:")) {
        revokeLocalPreview(coverImage);
      }
      otherImages.forEach((img) => {
        if (img.startsWith("blob:")) {
          revokeLocalPreview(img);
        }
      });
    };
  }, []);

  const handleCoverChange = (file: File | null, previewUrl: string | null) => {
    if (coverImage?.startsWith("blob:")) {
      revokeLocalPreview(coverImage);
    }
    setCoverFile(file);
    setCoverImage(previewUrl);
  };

  const handleOtherImagesChange = (files: File[], previewUrls: string[]) => {
    setOtherFiles(files);
    setOtherImages(previewUrls);
  };

  const categories = storeCategories.map((c) => ({ id: c.id, name: c.name }));
  const taskLevels = storeTaskLevels.map((l) => ({
    id: l.id,
    name: l.name,
    maxRewards: l.maxRewards || 1,
  }));

  const [taskLevelId, setTaskLevelId] = useState<string>("");

  // Fetch config on mount
  useEffect(() => {
    if (bindingRelations?.id) {
      fetchPublishConfig(bindingRelations.id);
    }
  }, [bindingRelations?.id]);

  // Update taskLevel when taskLevels change (e.g. after fetch)
  useEffect(() => {
    if (categories.length > 0 && !categoryId && !initialData) setCategoryId(categories[0].id);
    if (taskLevels.length > 0 && !taskLevelId && !initialData) setTaskLevelId(taskLevels[0].id);
  }, [storeTaskLevels]);
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const taskTypes = [
    { label: "一次性", value: "one-time" as const },
    { label: "每日任务", value: "daily" as const },
    { label: "每周任务", value: "weekly" as const },
    { label: "每月任务", value: "monthly" as const },
  ];
  const [taskType, setTaskType] = useState<(typeof taskTypes)[number]>(taskTypes[0]);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const isEditMode = Boolean(initialData?.taskId);

  // Pre-fill from initialData（新建模板 / 编辑任务）
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDesc(initialData.desc || "");
      if (initialData.categoryId) setCategoryId(initialData.categoryId);
      setTags(initialData.tags || []);

      if (initialData.levelId) setTaskLevelId(initialData.levelId);

      if (initialData.taskType) {
        const type = taskTypes.find((t) => t.value === initialData.taskType);
        if (type) setTaskType(type);
      }

      if (initialData.repeatConfig) {
        try {
          const raw =
            typeof initialData.repeatConfig === "string"
              ? initialData.repeatConfig
              : JSON.stringify(initialData.repeatConfig);
          const config = JSON.parse(raw);
          if (config.days) setSelectedDays(config.days);
        } catch (e) {
          console.error("Failed to parse repeatConfig", e);
        }
      }

      if (initialData.rewards && initialData.rewards.length > 0) {
        const formattedRewards = initialData.rewards.map(
          (r: any, idx: number) => ({
            text:
              typeof r === "string"
                ? r
                : String(r?.content ?? r?.text ?? ""),
            color:
              (typeof r === "object" && r?.color) ||
              ["pink", "cyan", "amber", "emerald", "purple", "rose"][idx % 6],
            icon:
              (typeof r === "object" && r?.icon) ||
              [
                "Gift",
                "Heart",
                "Star",
                "Coffee",
                "Plane",
                "Music",
                "ShoppingBag",
                "Sparkles",
              ][idx % 8],
            description:
              typeof r === "string" ? "" : String(r?.description ?? ""),
            type: "normal",
            amount: 1,
          }),
        );
        setRewards(formattedRewards);
      }

      if (initialData.img) {
        setCoverImage(initialData.img);
      }

      if (Array.isArray(initialData.otherImages) && initialData.otherImages.length > 0) {
        setOtherImages(initialData.otherImages);
        setOtherFiles([]);
      }

      if (typeof initialData.isPrivate === "boolean") {
        setIsPrivate(initialData.isPrivate);
      }
      if (typeof initialData.isPrivileged === "boolean") {
        setUsePrivilegeCard(initialData.isPrivileged);
      }
      if (initialData.rewardType === "wild_card" || initialData.rewardType === "points") {
        setRewardType(initialData.rewardType);
      }
      if (typeof initialData.wildcardAmount === "number") {
        setWildcardAmount(initialData.wildcardAmount);
      }
      if (typeof initialData.pointsAmount === "number") {
        setPointsAmount(initialData.pointsAmount);
      }
    }
  }, [initialData]);

  const remainingCards = 3; // 模拟剩余特权卡数量

  const colorStyles: Record<string, { bg: string; text: string }> = {
    pink: { bg: "bg-pink-100 dark:bg-pink-500/20", text: "text-pink-500" },
    cyan: { bg: "bg-cyan-100 dark:bg-cyan-500/20", text: "text-cyan-500" },
    amber: { bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-500" },
    emerald: {
      bg: "bg-emerald-100 dark:bg-emerald-500/20",
      text: "text-emerald-500",
    },
    purple: {
      bg: "bg-purple-100 dark:bg-purple-500/20",
      text: "text-purple-500",
    },
    rose: { bg: "bg-rose-100 dark:bg-rose-500/20", text: "text-rose-500" },
  };
  const rewardColors = Object.keys(colorStyles);

  const getRewardColorStyle = (color: string) => {
    if (colorStyles[color]) {
      return {
        className: colorStyles[color].bg + " " + colorStyles[color].text,
        style: {},
      };
    }
    return {
      className: "",
      style: {
        backgroundColor: `${color}33`, // 20% opacity for background
        color: color,
      },
    };
  };

  const icons: Record<string, React.ElementType> = {
    Gift,
    Heart,
    Star,
    Coffee,
    Plane,
    Music,
    ShoppingBag,
    Sparkles,
  };
  const rewardIcons = Object.keys(icons);

  const handlePublish = async () => {
    if (!title.trim()) return;
    if (isPublishing) return;

    setIsPublishing(true);

    try {
      // 1. 上传图片到七牛云
      let finalCoverImage = coverImage;
      if (coverFile) {
        try {
          finalCoverImage = await uploadToQiniu(coverFile, "task/cover");
        } catch (error) {
          message.error("封面图片上传失败");
          setIsPublishing(false);
          return;
        }
      }

      const finalOtherImages: string[] = [];
      for (let i = 0; i < otherImages.length; i++) {
        const img = otherImages[i];
        if (img.startsWith("blob:")) {
          // 找到对应的 File 对象
          const fileIndex = otherImages
            .slice(0, i)
            .filter((url) => url.startsWith("blob:")).length;
          const file = otherFiles[fileIndex];
          if (file) {
            try {
              const uploadedUrl = await uploadToQiniu(file, "task/other");
              finalOtherImages.push(uploadedUrl);
            } catch (error) {
              message.error("任务图片上传失败");
              setIsPublishing(false);
              return;
            }
          }
        } else {
          finalOtherImages.push(img);
        }
      }

      const safeWildcardAmount = Math.max(1, Math.min(10, Math.floor(wildcardAmount || 1)));
      const safePointsAmount = Math.max(1, Math.min(1000, Math.floor(pointsAmount || 100)));
      const normalRewards = rewards
        .filter((r) => r.text.trim() !== "")
        .map((r) => ({
          text: r.text.trim(),
          color: r.color,
          icon: r.icon,
          type: "normal" as const,
          amount: 1,
          description: r.description,
        }));
      const extraReward =
        rewardType === "wild_card"
          ? {
              text: `${safeWildcardAmount} 张万能卡`,
              color: "purple",
              icon: "Sparkles",
              type: "wild_card" as const,
              amount: safeWildcardAmount,
              description: `${safeWildcardAmount} 张万能卡`,
            }
          : {
              text: `${safePointsAmount} 积分`,
              color: "amber",
              icon: "Star",
              type: "points" as const,
              amount: safePointsAmount,
              description: `${safePointsAmount} 积分`,
            };
      const finalRewards = [...normalRewards, extraReward];

      const taskData = {
        title,
        description: desc,
        categoryId,
        levelId: taskLevelId,
        ...(deadline ? { deadline } : {}),
        coverImage: finalCoverImage || "https://picsum.photos/seed/new/400/600",
        otherImages: finalOtherImages,
        tags: tags,
        rewards: finalRewards,
        isPrivate: isPrivate,
        isPrivileged: usePrivilegeCard,
        taskType: taskType.value,
        repeatConfig:
          (taskType.value === "weekly" || taskType.value === "monthly") &&
          selectedDays.length > 0
            ? JSON.stringify({ days: selectedDays })
            : undefined,
      };

      const result = isEditMode && initialData?.taskId
        ? await updateTask(initialData.taskId, taskData)
        : await createTask(taskData);
      if (result.success) {
        message.success(isEditMode ? "任务已保存" : "任务发布成功");
        onPublish();
      } else {
        message.error(result.msg || (isEditMode ? "保存失败" : "发布失败"));
      }
    } catch (error) {
      console.error("Failed to publish task", error);
      message.error("网络错误，请稍后再试");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute inset-0 bg-slate-50 dark:bg-slate-900 z-50 flex flex-col h-full overflow-hidden"
    >
      <Header
        onBack={onBack}
        onPublish={handlePublish}
        canPublish={!!title.trim()}
        isPublishing={isPublishing}
        isEditMode={isEditMode}
      />

      {/* 表单内容 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6 no-scrollbar">
        <ImageUpload
          coverImage={coverImage}
          onCoverChange={handleCoverChange}
          otherImages={otherImages}
          otherFiles={otherFiles}
          onOtherImagesChange={handleOtherImagesChange}
        />

        <BasicInfo
          title={title}
          setTitle={setTitle}
          desc={desc}
          setDesc={setDesc}
        />

        <TaskSettings
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          showCategoryPicker={showCategoryPicker}
          setShowCategoryPicker={setShowCategoryPicker}
          categories={categories}
          taskLevelId={taskLevelId}
          setTaskLevelId={setTaskLevelId}
          showLevelPicker={showLevelPicker}
          setShowLevelPicker={setShowLevelPicker}
          taskLevels={taskLevels}
          rewards={rewards}
          setRewards={setRewards}
          taskType={taskType}
          setTaskType={setTaskType}
          showTypePicker={showTypePicker}
          setShowTypePicker={setShowTypePicker}
          taskTypes={taskTypes}
          selectedDays={selectedDays}
          setSelectedDays={setSelectedDays}
          deadline={deadline}
          setDeadline={setDeadline}
          tags={tags}
          setTags={setTags}
          tagInput={tagInput}
          setTagInput={setTagInput}
          allTags={normalizedAllTags}
        />

        <TaskRewards
          rewardType={rewardType}
          setRewardType={setRewardType}
          taskLevel={(() => {
            const level = taskLevels.find((l) => l.id === taskLevelId) || taskLevels[0];
            return { label: level?.name || "默认", maxRewards: level?.maxRewards || 1 };
          })()}
          rewards={rewards}
          setRewards={setRewards}
          wildcardAmount={wildcardAmount}
          setWildcardAmount={setWildcardAmount}
          pointsAmount={pointsAmount}
          setPointsAmount={setPointsAmount}
          activeIconPicker={activeIconPicker}
          setActiveIconPicker={setActiveIconPicker}
          colorStyles={colorStyles}
          rewardColors={rewardColors}
          icons={icons}
          rewardIcons={rewardIcons}
          getRewardColorStyle={getRewardColorStyle}
        />

        <ExtraSettings
          usePrivilegeCard={usePrivilegeCard}
          setUsePrivilegeCard={setUsePrivilegeCard}
          remainingCards={remainingCards}
          isPrivate={isPrivate}
          setIsPrivate={setIsPrivate}
        />

        {/* 底部留白 */}
        <div className="h-12"></div>
      </div>
    </motion.div>
  );
}
