import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, CheckCircle, Lock, Star, Heart, Award, Plane, Music, Calendar, Gift, Shirt, Utensils, Ticket, Cat, Mail, Waves, Sunrise, Camera, Image as ImageIcon, X } from 'lucide-react';
import { AchievementCategory, Achievement } from '../../data/achievements';
import { createLocalPreview, revokeLocalPreview, uploadToQiniu } from '@/utils/qiniu';
import { message } from '@/utils/pure/message';

const icons: Record<string, React.ElementType> = {
  Heart, Award, Plane, Music, Calendar, Gift, Shirt, Utensils, Ticket, Cat, Mail, Waves, Sunrise
};

interface AchievementDetailProps {
  key?: string;
  category: AchievementCategory;
  onClose: () => void;
  onComplete: (categoryId: string, achievementId: string, image: string, note: string) => void;
}

export default function AchievementDetail({ category, onClose, onComplete }: AchievementDetailProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Reset state when selected achievement changes
  useEffect(() => {
    setIsCompleting(false);
    if (uploadedImage.startsWith('blob:')) {
      revokeLocalPreview(uploadedImage);
    }
    setUploadedImage('');
    setImageFile(null);
    setNote('');
  }, [selectedAchievement?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (uploadedImage.startsWith('blob:')) {
        revokeLocalPreview(uploadedImage);
      }
    };
  }, [uploadedImage]);

  // Update local selected achievement when category changes (e.g. after completion)
  useEffect(() => {
    if (selectedAchievement) {
      const updated = category.achievements.find(a => a.id === selectedAchievement.id);
      if (updated && updated.isCompleted !== selectedAchievement.isCompleted) {
        setSelectedAchievement(updated);
      }
    }
  }, [category, selectedAchievement]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (uploadedImage.startsWith('blob:')) {
        revokeLocalPreview(uploadedImage);
      }
      const preview = createLocalPreview(file);
      setUploadedImage(preview);
      setImageFile(file);
    }
  };

  const handleComplete = async () => {
    if (selectedAchievement) {
      setIsUploading(true);
      let finalImageUrl = uploadedImage;
      
      if (imageFile) {
        try {
          finalImageUrl = await uploadToQiniu(imageFile, 'achievement');
        } catch (error) {
          message.error('图片上传失败');
          setIsUploading(false);
          return;
        }
      }
      
      onComplete(category.id, selectedAchievement.id, finalImageUrl, note);
      setIsCompleting(false);
      setIsUploading(false);
    }
  };

  const completed = category.achievements.filter(a => a.isCompleted).length;
  const total = category.achievements.length;
  const progress = Math.round((completed / total) * 100) || 0;

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[60] bg-slate-50 dark:bg-slate-900 flex flex-col overflow-hidden"
    >
      {/* Header Image & Nav */}
      <div className="relative h-64 flex-shrink-0">
        <img 
          src={category.coverImage} 
          alt={category.title} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-slate-50 dark:to-slate-900"></div>
        
        <div className="absolute top-0 left-0 right-0 p-4 pt-12 flex justify-between items-center z-10">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="absolute bottom-6 left-6 right-6 z-10">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                  <span>完成进度</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{completed} / {total}</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  />
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/50 shadow-inner">
                <span className="text-indigo-600 dark:text-indigo-400 font-black text-sm">{progress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="flex-1 overflow-y-auto p-4 pt-6 no-scrollbar">
        <div className="grid grid-cols-2 gap-4 pb-12">
          {category.achievements.map((achievement, index) => {
            const IconComponent = icons[achievement.icon] || Star;
            const isCompleted = achievement.isCompleted;

            return (
              <motion.button
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedAchievement(achievement)}
                className={`relative aspect-square rounded-3xl p-4 flex flex-col items-center justify-center text-center transition-all border ${
                  isCompleted 
                    ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-100 dark:border-indigo-800/30 shadow-sm hover:shadow-md' 
                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md opacity-70 grayscale-[0.5]'
                }`}
              >
                {/* 特色编号角标 */}
                <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-slate-800 z-10 transform -rotate-12 ${
                  isCompleted 
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  <span className="text-xs font-black font-mono">{index + 1}</span>
                </div>

                {isCompleted && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-900/30" />
                  </div>
                )}
                
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-inner ${
                  isCompleted 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/30' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                }`}>
                  {isCompleted ? <IconComponent className="w-7 h-7" /> : <Lock className="w-6 h-6" />}
                </div>
                
                <h4 className={`font-bold text-sm line-clamp-2 leading-tight ${
                  isCompleted ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {achievement.title}
                </h4>
                
                {isCompleted && achievement.completedAt && (
                  <span className="text-[10px] text-indigo-500/70 dark:text-indigo-400/70 font-medium mt-2">
                    {achievement.completedAt}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAchievement(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <button 
                onClick={() => setSelectedAchievement(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {selectedAchievement.isCompleted && (
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-10 dark:opacity-20 pointer-events-none"></div>
              )}
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-4 shadow-lg flex-shrink-0 ${
                  selectedAchievement.isCompleted 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/30' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                }`}>
                  {React.createElement(icons[selectedAchievement.icon] || Star, { className: "w-10 h-10" })}
                </div>
                
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">
                  {selectedAchievement.title}
                </h3>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                  {selectedAchievement.description}
                </p>
                
                <div className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 flex items-center justify-between border border-slate-100 dark:border-slate-700/50 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">成就点数</span>
                  </div>
                  <span className="text-lg font-black text-amber-500">+{selectedAchievement.points}</span>
                </div>
                
                {selectedAchievement.isCompleted ? (
                  <div className="w-full space-y-4">
                    {selectedAchievement.image && (
                      <div className="w-full h-40 rounded-xl overflow-hidden relative shadow-sm">
                        <img src={selectedAchievement.image} alt="Achievement" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {selectedAchievement.note && (
                      <div className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-sm text-slate-600 dark:text-slate-300 text-left italic border border-slate-100 dark:border-slate-700/50">
                        "{selectedAchievement.note}"
                      </div>
                    )}
                    <div className="w-full py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 border border-emerald-200 dark:border-emerald-800/30">
                      <CheckCircle className="w-5 h-5" />
                      <span>已于 {selectedAchievement.completedAt} 解锁</span>
                    </div>
                  </div>
                ) : isCompleting ? (
                  <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Image Upload */}
                    <div className="w-full">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 text-left">上传照片 (可选)</label>
                      <div className="relative w-full h-32 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center group cursor-pointer">
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleImageUpload} />
                        {uploadedImage ? (
                          <>
                            <img src={uploadedImage} alt="Upload preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Camera className="w-6 h-6 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center text-slate-400">
                            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-xs font-medium">点击上传照片</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Note Input */}
                    <div className="w-full">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 text-left">记录心情 (可选)</label>
                      <textarea 
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="写下这一刻的感受吧..."
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none h-20 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                      />
                    </div>
                    
                    <div className="flex space-x-3 pt-2">
                      <button 
                        onClick={() => setIsCompleting(false)}
                        className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        取消
                      </button>
                      <button 
                        onClick={handleComplete}
                        disabled={isUploading}
                        className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-md shadow-indigo-500/20 disabled:opacity-50"
                      >
                        {isUploading ? '上传中...' : '确认完成'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsCompleting(true)}
                    className="w-full py-3.5 bg-slate-800 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors shadow-md"
                  >
                    点亮成就
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
