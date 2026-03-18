import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Tag, ChevronLeft, Star, Calendar, X, Hash } from 'lucide-react';
import DatePicker from './DatePicker';

interface TaskSettingsProps {
  category: string;
  setCategory: (c: string) => void;
  showCategoryPicker: boolean;
  setShowCategoryPicker: (s: boolean) => void;
  categories: string[];
  
  taskLevel: any;
  setTaskLevel: (l: any) => void;
  showLevelPicker: boolean;
  setShowLevelPicker: (s: boolean) => void;
  taskLevels: any[];
  rewards: any[];
  setRewards: (r: any[]) => void;
  
  taskType: any;
  setTaskType: (t: any) => void;
  showTypePicker: boolean;
  setShowTypePicker: (s: boolean) => void;
  taskTypes: any[];
  
  selectedDays: number[];
  setSelectedDays: (d: number[]) => void;
  
  deadline: string;
  setDeadline: (d: string) => void;
  
  tags: string[];
  setTags: (t: string[]) => void;
  tagInput: string;
  setTagInput: (t: string) => void;
  allTags: string[];
}

export default function TaskSettings({
  category, setCategory, showCategoryPicker, setShowCategoryPicker, categories,
  taskLevel, setTaskLevel, showLevelPicker, setShowLevelPicker, taskLevels, rewards, setRewards,
  taskType, setTaskType, showTypePicker, setShowTypePicker, taskTypes,
  selectedDays, setSelectedDays,
  deadline, setDeadline,
  tags, setTags, tagInput, setTagInput, allTags
}: TaskSettingsProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-800 dark:text-white px-1">任务设置</h3>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
        
        {/* 分类选择 */}
        <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50 relative">
          <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-200">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-500">
              <Tag className="w-5 h-5" />
            </div>
            <span className="font-medium">分类</span>
          </div>
          <button 
            onClick={() => setShowCategoryPicker(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full text-sm font-bold text-slate-700 dark:text-slate-200"
          >
            <span>{category}</span>
            <ChevronLeft className={`w-4 h-4 transition-transform ${showCategoryPicker ? 'rotate-90' : '-rotate-90'}`} />
          </button>

          {/* 气泡选择器 */}
          {showCategoryPicker && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowCategoryPicker(false)}
              ></div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-4 bottom-full mb-2 z-20 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-700 flex flex-col w-32 origin-bottom-right"
              >
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setShowCategoryPicker(false);
                    }}
                    className={`px-3 py-2 rounded-xl text-sm font-medium text-left transition-colors ${
                      category === cat
                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                {/* 小箭头 */}
                <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-slate-800 border-b border-r border-slate-100 dark:border-slate-700 rotate-45"></div>
              </motion.div>
            </>
          )}
        </div>

        {/* 任务等级 */}
        <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50 relative">
          <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-200">
            <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-xl text-rose-500">
              <Star className="w-5 h-5" />
            </div>
            <span className="font-medium">任务等级</span>
          </div>
          <button 
            onClick={() => setShowLevelPicker(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full text-sm font-bold text-slate-700 dark:text-slate-200"
          >
            <span>{taskLevel.label} ({taskLevel.maxRewards})</span>
            <ChevronLeft className={`w-4 h-4 transition-transform ${showLevelPicker ? 'rotate-90' : '-rotate-90'}`} />
          </button>

          {/* 气泡选择器 */}
          {showLevelPicker && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowLevelPicker(false)}
              ></div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-4 bottom-full mb-2 z-20 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-700 flex flex-col w-32 origin-bottom-right"
              >
                {taskLevels.map(level => (
                  <button
                    key={level.label}
                    onClick={() => {
                      setTaskLevel(level);
                      setShowLevelPicker(false);
                      if (rewards.length > level.maxRewards) {
                        setRewards(rewards.slice(0, level.maxRewards));
                      }
                    }}
                    className={`px-3 py-2 rounded-xl text-sm font-medium text-left transition-colors ${
                      taskLevel.label === level.label
                        ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {level.label} ({level.maxRewards})
                  </button>
                ))}
                {/* 小箭头 */}
                <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-slate-800 border-b border-r border-slate-100 dark:border-slate-700 rotate-45"></div>
              </motion.div>
            </>
          )}
        </div>

        {/* 任务频率/类型 */}
        <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50 relative">
          <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-200">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-500">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="font-medium">任务频率</span>
          </div>
          <button 
            onClick={() => setShowTypePicker(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full text-sm font-bold text-slate-700 dark:text-slate-200"
          >
            <span>{taskType.label}</span>
            <ChevronLeft className={`w-4 h-4 transition-transform ${showTypePicker ? 'rotate-90' : '-rotate-90'}`} />
          </button>

          {/* 气泡选择器 */}
          {showTypePicker && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowTypePicker(false)}
              ></div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-4 bottom-full mb-2 z-20 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-700 flex flex-col w-32 origin-bottom-right"
              >
                {taskTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => {
                      setTaskType(type);
                      setShowTypePicker(false);
                      if (taskType.value !== type.value) {
                        setSelectedDays([]);
                      }
                    }}
                    className={`px-3 py-2 rounded-xl text-sm font-medium text-left transition-colors ${
                      taskType.value === type.value
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
                {/* 小箭头 */}
                <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-slate-800 border-b border-r border-slate-100 dark:border-slate-700 rotate-45"></div>
              </motion.div>
            </>
          )}
        </div>

        {/* 具体日期选择 */}
        {taskType.value === 'weekly' && (
          <div className="p-4 border-b border-slate-50 dark:border-slate-700/50">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">选择每周重复的日期</div>
            <div className="flex justify-between">
              {['一', '二', '三', '四', '五', '六', '日'].map((day, index) => {
                const dayValue = index + 1;
                const isSelected = selectedDays.includes(dayValue);
                return (
                  <button
                    key={dayValue}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDays(selectedDays.filter(d => d !== dayValue));
                      } else {
                        setSelectedDays([...selectedDays, dayValue].sort((a, b) => a - b));
                      }
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      isSelected 
                        ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/30' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {taskType.value === 'monthly' && (
          <div className="p-4 border-b border-slate-50 dark:border-slate-700/50">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">选择每月重复的日期</div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 28 }, (_, i) => i + 1).map(day => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDays(selectedDays.filter(d => d !== day));
                      } else {
                        setSelectedDays([...selectedDays, day].sort((a, b) => a - b));
                      }
                    }}
                    className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-colors ${
                      isSelected 
                        ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/30' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 截止日期 */}
        <div 
          className="relative p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors overflow-visible"
          onClick={() => setShowDatePicker(true)}
        >
          <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-200">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-500">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="font-medium">截止日期</span>
          </div>
          <div className="flex items-center text-slate-400 text-sm">
            <span>{deadline ? deadline : '不限时间'}</span>
            {deadline ? (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeadline('');
                }}
                className="ml-2 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full z-20 relative"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <ChevronLeft className="w-4 h-4 ml-1 rotate-180" />
            )}
          </div>
          
          {showDatePicker && (
            <DatePicker 
              value={deadline} 
              onChange={setDeadline} 
              onClose={() => setShowDatePicker(false)} 
            />
          )}
        </div>

        {/* 标签设置 */}
        <div className="p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-200">
              <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-500">
                <Hash className="w-5 h-5" />
              </div>
              <span className="font-medium">标签</span>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{tags.length}/3</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <div key={index} className="flex items-center bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-full text-xs font-medium border border-purple-100 dark:border-purple-500/20">
                <span>{tag}</span>
                <button 
                  onClick={() => setTags(tags.filter((_, i) => i !== index))}
                  className="ml-1.5 p-0.5 hover:bg-purple-200 dark:hover:bg-purple-500/30 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          
          {tags.length < 3 && (
            <div className="flex flex-col space-y-3">
              {/* 快捷标签 */}
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {allTags.filter(t => !tags.includes(t)).map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => setTags([...tags, tag])}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-medium hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 transition-colors border border-transparent hover:border-purple-100 dark:hover:border-purple-500/20"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tagInput.trim() && tags.length < 3) {
                      e.preventDefault();
                      if (!tags.includes(tagInput.trim())) {
                        setTags([...tags, tagInput.trim()]);
                      }
                      setTagInput('');
                    }
                  }}
                  placeholder="输入标签后按回车添加"
                  className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                  maxLength={10}
                />
                <button
                  onClick={() => {
                    if (tagInput.trim() && tags.length < 3 && !tags.includes(tagInput.trim())) {
                      setTags([...tags, tagInput.trim()]);
                      setTagInput('');
                    }
                  }}
                  disabled={!tagInput.trim()}
                  className="px-3 py-2 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors"
                >
                  添加
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
