import React from 'react';
import { motion } from 'motion/react';
import { Gift, Sparkles, X, Plus } from 'lucide-react';

type RewardDraft = {
  text: string;
  color: string;
  icon: string;
  /** 普通奖励时固定为 false（万能卡由 rewardType==='wildcard' 统一处理） */
  isWildcard: false;
  /** 非万能卡默认数量为 1（后端 DTO 字段为 amount） */
  amount: number;
};

type TaskLevel = {
  label: string;
  maxRewards: number;
};

interface TaskRewardsProps {
  rewardType: 'normal' | 'wildcard';
  setRewardType: (t: 'normal' | 'wildcard') => void;
  taskLevel: TaskLevel;
  rewards: RewardDraft[];
  setRewards: (r: RewardDraft[]) => void;
  wildcardAmount: number;
  setWildcardAmount: (a: number) => void;
  activeIconPicker: number | null;
  setActiveIconPicker: (i: number | null) => void;
  colorStyles: Record<string, { bg: string, text: string }>;
  rewardColors: string[];
  icons: Record<string, React.ElementType>;
  rewardIcons: string[];
  getRewardColorStyle: (color: string) => { className: string, style: any };
}

export default function TaskRewards({
  rewardType, setRewardType, taskLevel, rewards, setRewards,
  wildcardAmount, setWildcardAmount, activeIconPicker, setActiveIconPicker,
  colorStyles, rewardColors, icons, rewardIcons, getRewardColorStyle
}: TaskRewardsProps) {

  const handleAddReward = () => {
    if (rewards.length < taskLevel.maxRewards) {
      const nextColor = rewardColors[rewards.length % rewardColors.length];
      const nextIcon = rewardIcons[rewards.length % rewardIcons.length];
      // 普通奖励：默认数量 1，且不是万能卡
      setRewards([...rewards, { text: '', color: nextColor, icon: nextIcon, isWildcard: false, amount: 1 }]);
    }
  };

  const handleRemoveReward = (index: number) => {
    setRewards(rewards.filter((_, i) => i !== index));
  };

  const handleRewardChange = (index: number, value: string) => {
    const newRewards = [...rewards];
    newRewards[index].text = value;
    setRewards(newRewards);
  };

  const handleColorSelect = (index: number, color: string) => {
    const newRewards = [...rewards];
    newRewards[index].color = color;
    setRewards(newRewards);
  };

  const handleIconSelect = (index: number, icon: string) => {
    const newRewards = [...rewards];
    newRewards[index].icon = icon;
    setRewards(newRewards);
    setActiveIconPicker(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">任务奖励</h3>
        {rewardType === 'normal' && (
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{rewards.length}/{taskLevel.maxRewards}</span>
        )}
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-3 space-y-4">
        {/* 奖励类型选择 */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl">
          <button
            onClick={() => setRewardType('normal')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              rewardType === 'normal' 
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            普通奖励
          </button>
          <button
            onClick={() => setRewardType('wildcard')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              rewardType === 'wildcard' 
                ? 'bg-purple-500 text-white shadow-sm shadow-purple-500/30' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            万能卡奖励
          </button>
        </div>

        {rewardType === 'normal' ? (
          <div className="space-y-2">
            {rewards.map((reward, index) => {
              const IconComponent = icons[reward.icon] || Gift;
              const colorStyle = getRewardColorStyle(reward.color);
              
              return (
                <div key={index} className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 relative">
                  <button
                    onClick={() => setActiveIconPicker(activeIconPicker === index ? null : index)}
                    className={`p-2 rounded-lg shrink-0 transition-colors ${colorStyle.className}`}
                    style={colorStyle.style}
                  >
                    <IconComponent className="w-4 h-4" />
                  </button>
                  
                  {/* 图标和颜色选择气泡 */}
                  {activeIconPicker === index && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setActiveIconPicker(null)}
                      ></div>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute left-0 bottom-full mb-2 z-20 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-700 flex flex-col space-y-3 w-64 origin-bottom-left"
                      >
                        {/* 图标选择 */}
                        <div>
                          <p className="text-xs font-bold text-slate-400 mb-2 px-1">选择图标</p>
                          <div className="flex flex-wrap gap-2">
                            {rewardIcons.map(iconName => {
                              const Icon = icons[iconName];
                              const isSelected = reward.icon === iconName;
                              return (
                                <button
                                  key={iconName}
                                  onClick={() => handleIconSelect(index, iconName)}
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110 ${isSelected ? colorStyle.className : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                                  style={isSelected ? colorStyle.style : {}}
                                >
                                  <Icon className="w-4 h-4" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        
                        <div className="h-px w-full bg-slate-100 dark:bg-slate-700"></div>
                        
                        {/* 颜色选择 */}
                        <div>
                          <p className="text-xs font-bold text-slate-400 mb-2 px-1">选择颜色</p>
                          <div className="flex flex-wrap gap-2">
                            {rewardColors.map(color => (
                              <button
                                key={color}
                                onClick={() => handleColorSelect(index, color)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110 ${colorStyles[color].bg} ${colorStyles[color].text} ${reward.color === color ? 'ring-2 ring-offset-1 ring-slate-300 dark:ring-slate-600' : ''}`}
                              >
                                <div className={`w-3 h-3 rounded-full bg-current`}></div>
                              </button>
                            ))}
                            
                            {/* 自定义颜色选择器 */}
                            <div className={`relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-transform hover:scale-110 ${!colorStyles[reward.color] ? 'ring-2 ring-offset-1 ring-slate-300 dark:ring-slate-600' : ''}`}>
                              <div className="w-full h-full bg-linear-to-br from-red-500 via-green-500 to-blue-500 absolute inset-0"></div>
                              <input 
                                type="color" 
                                value={reward.color.startsWith('#') ? reward.color : '#ff0000'}
                                onChange={(e) => handleColorSelect(index, e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}

                  <input
                    type="text"
                    value={reward.text}
                    onChange={(e) => handleRewardChange(index, e.target.value)}
                    placeholder={`奖励 ${index + 1} (例如: 请吃大餐)`}
                    className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                  />
                  {rewards.length > 1 && (
                    <button
                      onClick={() => handleRemoveReward(index)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )})}
            
            {rewards.length < taskLevel.maxRewards && (
              <button
                onClick={handleAddReward}
                className="w-full py-3 mt-1 flex items-center justify-center space-x-2 text-sm font-bold text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-500/10 rounded-xl transition-colors border border-dashed border-pink-200 dark:border-pink-500/30"
              >
                <Plus className="w-4 h-4" />
                <span>添加奖励</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-500/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-purple-500" />
            </div>
            <div className="text-center">
              <h4 className="text-slate-800 dark:text-white font-bold mb-1">奖励万能卡</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500">对方完成任务后将获得万能卡</p>
            </div>
            <div className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setWildcardAmount(Math.max(1, wildcardAmount - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                -
              </button>
              <span className="text-lg font-bold text-purple-500 w-8 text-center">{wildcardAmount}</span>
              <button 
                onClick={() => setWildcardAmount(Math.min(10, wildcardAmount + 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
