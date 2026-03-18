import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Gift, Heart, Star, Coffee, Plane, Music, ShoppingBag, Sparkles } from 'lucide-react';
import { useTaskStore, useUserStore } from '../../store';
import message from '../../utils/message/message';
import { uploadToQiniu, revokeLocalPreview } from '@/utils/qiniu';

import Header from './Header';
import ImageUpload from './ImageUpload';
import BasicInfo from './BasicInfo';
import TaskSettings from './TaskSettings';
import TaskRewards from './TaskRewards';
import ExtraSettings from './ExtraSettings';

interface PublishTaskProps {
  onBack: () => void;
  onPublish: () => void;
  initialData?: any;
  key?: string;
}

export default function PublishTask({ onBack, onPublish, initialData }: PublishTaskProps) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('日常');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [rewardType, setRewardType] = useState<'normal' | 'wildcard'>('normal');
  const [wildcardAmount, setWildcardAmount] = useState<number>(1);
  const [rewards, setRewards] = useState<{text: string, color: string, icon: string}[]>([{ text: '', color: 'pink', icon: 'Gift' }]);
  const [activeIconPicker, setActiveIconPicker] = useState<number | null>(null);
  const [usePrivilegeCard, setUsePrivilegeCard] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [otherImages, setOtherImages] = useState<string[]>([]);
  const [otherFiles, setOtherFiles] = useState<File[]>([]);
  const [deadline, setDeadline] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState(false);
  
  const createTask = useTaskStore(state => state.createTask);
  const fetchPublishConfig = useTaskStore(state => state.fetchPublishConfig);
  const storeCategories = useTaskStore(state => state.categories);
  const storeTaskLevels = useTaskStore(state => state.taskLevels);
  const storeAllTags = useTaskStore(state => state.allTags);
  
  const currentUser = useUserStore(state => state.currentUser);
  const bindingRelations = useUserStore(state => state.bindingRelations);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      if (coverImage?.startsWith('blob:')) {
        revokeLocalPreview(coverImage);
      }
      otherImages.forEach(img => {
        if (img.startsWith('blob:')) {
          revokeLocalPreview(img);
        }
      });
    };
  }, []);

  const handleCoverChange = (file: File | null, previewUrl: string | null) => {
    if (coverImage?.startsWith('blob:')) {
      revokeLocalPreview(coverImage);
    }
    setCoverFile(file);
    setCoverImage(previewUrl);
  };

  const handleOtherImagesChange = (files: File[], previewUrls: string[]) => {
    setOtherFiles(files);
    setOtherImages(previewUrls);
  };

  // Map store data to local format
  const categories = storeCategories.length > 0 
    ? storeCategories.map(c => c.name)
    : ['旅行', '美食', '日常', '心愿单', '纪念日'];

  const taskLevels = storeTaskLevels.length > 0
    ? storeTaskLevels.map(l => ({ label: l.name, maxRewards: l.maxRewards }))
    : [
        { label: '小事', maxRewards: 1 },
        { label: '简单', maxRewards: 1 },
        { label: '中等', maxRewards: 2 },
        { label: '高级', maxRewards: 3 },
        { label: '困难', maxRewards: 3 },
        { label: '极难', maxRewards: 4 },
      ];

  const [taskLevel, setTaskLevel] = useState(taskLevels[0]);

  // Fetch config on mount
  useEffect(() => {
    if (bindingRelations?.id) {
      fetchPublishConfig(bindingRelations.id);
    }
  }, [bindingRelations?.id]);

  // Update taskLevel when taskLevels change (e.g. after fetch)
  useEffect(() => {
    if (taskLevels.length > 0 && !initialData) {
      setTaskLevel(taskLevels[0]);
    }
  }, [storeTaskLevels]);
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const taskTypes = [
    { label: '一次性', value: 'one-time' },
    { label: '每日任务', value: 'daily' },
    { label: '每周任务', value: 'weekly' },
    { label: '每月任务', value: 'monthly' },
  ];
  const [taskType, setTaskType] = useState(taskTypes[0]);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  // Pre-fill from initialData
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDesc(initialData.desc || '');
      setCategory(initialData.category || '日常');
      setTags(initialData.tags || []);
      
      if (initialData.level) {
        const level = taskLevels.find(l => l.label === initialData.level);
        if (level) setTaskLevel(level);
      }
      
      if (initialData.taskType) {
        const type = taskTypes.find(t => t.value === initialData.taskType);
        if (type) setTaskType(type);
      }
      
      if (initialData.repeatConfig) {
        try {
          const config = JSON.parse(initialData.repeatConfig);
          if (config.days) setSelectedDays(config.days);
        } catch (e) {
          console.error('Failed to parse repeatConfig', e);
        }
      }
      
      if (initialData.rewards && initialData.rewards.length > 0) {
        const formattedRewards = initialData.rewards.map((r: string, idx: number) => ({
          text: r,
          color: ['pink', 'cyan', 'amber', 'emerald', 'purple', 'rose'][idx % 6],
          icon: ['Gift', 'Heart', 'Star', 'Coffee', 'Plane', 'Music', 'ShoppingBag', 'Sparkles'][idx % 8]
        }));
        setRewards(formattedRewards);
      }
      
      if (initialData.img) {
        setCoverImage(initialData.img);
      }
    }
  }, [initialData]);
  
  const remainingCards = 3; // 模拟剩余特权卡数量

  const colorStyles: Record<string, { bg: string, text: string }> = {
    pink: { bg: 'bg-pink-100 dark:bg-pink-500/20', text: 'text-pink-500' },
    cyan: { bg: 'bg-cyan-100 dark:bg-cyan-500/20', text: 'text-cyan-500' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-500' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-500' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-500' },
    rose: { bg: 'bg-rose-100 dark:bg-rose-500/20', text: 'text-rose-500' },
  };
  const rewardColors = Object.keys(colorStyles);

  const getRewardColorStyle = (color: string) => {
    if (colorStyles[color]) {
      return {
        className: colorStyles[color].bg + ' ' + colorStyles[color].text,
        style: {}
      };
    }
    return {
      className: '',
      style: {
        backgroundColor: `${color}33`, // 20% opacity for background
        color: color
      }
    };
  };

  const icons: Record<string, React.ElementType> = {
    Gift, Heart, Star, Coffee, Plane, Music, ShoppingBag, Sparkles
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
          finalCoverImage = await uploadToQiniu(coverFile, 'task/cover');
        } catch (error) {
          message.error('封面图片上传失败');
          setIsPublishing(false);
          return;
        }
      }

      const finalOtherImages: string[] = [];
      for (let i = 0; i < otherImages.length; i++) {
        const img = otherImages[i];
        if (img.startsWith('blob:')) {
          // 找到对应的 File 对象
          const fileIndex = otherImages.slice(0, i).filter(url => url.startsWith('blob:')).length;
          const file = otherFiles[fileIndex];
          if (file) {
            try {
              const uploadedUrl = await uploadToQiniu(file, 'task/other');
              finalOtherImages.push(uploadedUrl);
            } catch (error) {
              message.error('任务图片上传失败');
              setIsPublishing(false);
              return;
            }
          }
        } else {
          finalOtherImages.push(img);
        }
      }

      // 2. 准备任务数据
      const finalRewards = rewardType === 'wildcard' 
        ? [{ text: `${wildcardAmount} 张万能卡`, color: 'purple', icon: 'Sparkles', isWildcard: true, amount: wildcardAmount }]
        : rewards.filter(r => r.text.trim() !== '');

      const taskData = {
        title,
        description: desc,
        category,
        level: taskLevel.label,
        deadline: deadline || '不限时间',
        coverImage: finalCoverImage || 'https://picsum.photos/seed/new/400/600',
        otherImages: finalOtherImages,
        tags: tags,
        rewards: finalRewards,
        isPrivate: isPrivate,
        isPrivileged: usePrivilegeCard,
        taskType: taskType.value,
        repeatConfig: (taskType.value === 'weekly' || taskType.value === 'monthly') && selectedDays.length > 0
          ? JSON.stringify({ days: selectedDays })
          : undefined
      };
      
      const result = await createTask(taskData);
      if (result.success) {
        message.success('任务发布成功');
        onPublish();
      } else {
        message.error(result.msg || '发布失败');
      }
    } catch (error) {
      console.error('Failed to publish task', error);
      message.error('网络错误，请稍后再试');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 bg-slate-50 dark:bg-slate-900 z-50 flex flex-col h-full overflow-hidden"
    >
      <Header 
        onBack={onBack} 
        onPublish={handlePublish} 
        canPublish={!!title.trim()} 
        isPublishing={isPublishing}
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
          category={category}
          setCategory={setCategory}
          showCategoryPicker={showCategoryPicker}
          setShowCategoryPicker={setShowCategoryPicker}
          categories={categories}
          taskLevel={taskLevel}
          setTaskLevel={setTaskLevel}
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
          allTags={storeAllTags.map(t => t.name)}
        />

        <TaskRewards 
          rewardType={rewardType}
          setRewardType={setRewardType}
          taskLevel={taskLevel}
          rewards={rewards}
          setRewards={setRewards}
          wildcardAmount={wildcardAmount}
          setWildcardAmount={setWildcardAmount}
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
