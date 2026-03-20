import React, { useState, useRef, useEffect } from 'react';
import { Gift, Copy, CheckCircle, ImagePlus, Heart, Star, Coffee, Plane, Music, ShoppingBag, Sparkles, Package, X } from 'lucide-react';
import { createLocalPreview, revokeLocalPreview, uploadToQiniu } from '@/utils/qiniu';
import { message } from '@/utils/pure/message';
import rewardCodesService from '@/api/service/rewardCodes';

const icons: Record<string, React.ElementType> = {
  Gift, Heart, Star, Coffee, Plane, Music, ShoppingBag, Sparkles, Package
};
const rewardIcons = Object.keys(icons);

const colorStyles: Record<string, { bg: string, text: string, ring: string }> = {
  indigo: { bg: 'bg-indigo-100 dark:bg-indigo-500/20', text: 'text-indigo-500', ring: 'ring-indigo-300 dark:ring-indigo-600' },
  pink: { bg: 'bg-pink-100 dark:bg-pink-500/20', text: 'text-pink-500', ring: 'ring-pink-300 dark:ring-pink-600' },
  cyan: { bg: 'bg-cyan-100 dark:bg-cyan-500/20', text: 'text-cyan-500', ring: 'ring-cyan-300 dark:ring-cyan-600' },
  amber: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-500', ring: 'ring-amber-300 dark:ring-amber-600' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-500', ring: 'ring-emerald-300 dark:ring-emerald-600' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-500', ring: 'ring-purple-300 dark:ring-purple-600' },
  rose: { bg: 'bg-rose-100 dark:bg-rose-500/20', text: 'text-rose-500', ring: 'ring-rose-300 dark:ring-rose-600' },
};
const rewardColors = Object.keys(colorStyles);

export default function PublishTab() {
  const [rewardType, setRewardType] = useState<'prop' | 'points' | 'wild_card'>('prop');
  const [rewardName, setRewardName] = useState('');
  const [rewardDescription, setRewardDescription] = useState('');
  const [rewardCount, setRewardCount] = useState(1);
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [selectedIcon, setSelectedIcon] = useState('Gift');
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isAutoPresetType = rewardType === 'points' || rewardType === 'wild_card';

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (uploadedImage?.startsWith('blob:')) {
        revokeLocalPreview(uploadedImage);
      }
    };
  }, [uploadedImage]);

  useEffect(() => {
    if(rewardType == 'points') {
      setRewardCount(100)
    } else {
      setRewardCount(1)
    }
  },[rewardType])

  const handleGenerate = async () => {
    const safeCount = Math.max(1, Math.floor(rewardCount) || 1);
    const finalRewardName =
      rewardType === 'points'
        ? '积分'
        : rewardType === 'wild_card'
          ? '万能卡'
          : rewardName.trim();
    const finalRewardDescription =
      rewardType === 'points'
        ? `${safeCount}积分`
        : rewardType === 'wild_card'
          ? `${safeCount}张万能卡`
          : rewardDescription.trim();

    if (!finalRewardName) return;
    setIsGenerating(true);

    try {
      let imageUrlForPayload: string | undefined;
      if (imageFile) {
        try {
          const uploaded = await uploadToQiniu(imageFile, 'reward');
          imageUrlForPayload = uploaded;
          setUploadedImage(uploaded);
          setImageFile(null);
        } catch (error) {
          message.error('图片上传失败');
          setIsGenerating(false);
          return;
        }
      } else if (uploadedImage && !uploadedImage.startsWith('blob:')) {
        imageUrlForPayload = uploadedImage;
      }

      const res = await rewardCodesService.publish({
        rewardName: finalRewardName,
        rewardType,
        rewardCount: safeCount,
        icon: imageUrlForPayload ? undefined : selectedIcon || 'Gift',
        color: selectedColor,
        imageUrl: imageUrlForPayload,
        description: finalRewardDescription || undefined,
      });

      if (!res.success || !res.data) {
        message.error(res.msg || '发布失败');
        return;
      }

      setGeneratedCode(res.data.code);
      setCopied(false);
      setShowResultModal(true);
    } catch (error) {
      console.error('Failed to generate reward', error);
      message.error('操作失败，请稍后再试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (uploadedImage?.startsWith('blob:')) {
        revokeLocalPreview(uploadedImage);
      }
      const preview = createLocalPreview(file);
      setUploadedImage(preview);
      setImageFile(file);
      setSelectedIcon('');
    }
  };

  const handleIconSelect = (iconName: string) => {
    setSelectedIcon(iconName);
    setUploadedImage(null);
  };

  const getRewardColorStyle = (color: string) => {
    if (colorStyles[color]) {
      return {
        className: `${colorStyles[color].bg} ${colorStyles[color].text}`,
        ringClass: colorStyles[color].ring,
        style: {}
      };
    }
    return {
      className: '',
      ringClass: 'ring-slate-300 dark:ring-slate-600',
      style: {
        backgroundColor: `${color}33`,
        color: color
      }
    };
  };

  const activeColorStyle = getRewardColorStyle(selectedColor);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">发布新奖励</h3>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              奖励类型
            </label>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl">
              <button
                onClick={() => setRewardType('prop')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  rewardType === 'prop' 
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                道具
              </button>
              <button
                onClick={() => setRewardType('points')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  rewardType === 'points' 
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                积分
              </button>
              <button
                onClick={() => setRewardType('wild_card')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  rewardType === 'wild_card' 
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                万能卡
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              奖励图标
            </label>
            <div className="flex flex-wrap gap-3 items-center">
              {rewardIcons.map(iconName => {
                const Icon = icons[iconName];
                const isSelected = selectedIcon === iconName;
                return (
                  <button
                    key={iconName}
                    onClick={() => handleIconSelect(iconName)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform hover:scale-110 ${
                      isSelected 
                        ? `${activeColorStyle.className} ring-2 ring-offset-1 ${activeColorStyle.ringClass}` 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                    style={isSelected ? activeColorStyle.style : {}}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
              
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>
              
              <div 
                onClick={() => imageInputRef.current?.click()}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform hover:scale-110 cursor-pointer overflow-hidden ${
                  uploadedImage 
                    ? `ring-2 ring-offset-1 ${activeColorStyle.ringClass}` 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-600'
                }`}
              >
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus className="w-5 h-5" />
                )}
                <input 
                  type="file" 
                  ref={imageInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>

            {!uploadedImage && (
              <div className="mt-4 flex flex-wrap gap-2 items-center">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">图标颜色:</span>
                {rewardColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${colorStyles[color].bg} ${colorStyles[color].text} ${selectedColor === color ? 'ring-2 ring-offset-1 ' + colorStyles[color].ring : ''}`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
                  </button>
                ))}
                
                <div className={`relative w-6 h-6 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-transform hover:scale-110 ${!colorStyles[selectedColor] ? 'ring-2 ring-offset-1 ring-slate-300 dark:ring-slate-600' : ''}`}>
                  <div className="w-full h-full bg-linear-to-br from-red-500 via-green-500 to-blue-500 absolute inset-0"></div>
                  <input 
                    type="color" 
                    value={selectedColor.startsWith('#') ? selectedColor : '#6366f1'}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {!isAutoPresetType && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  奖励名称
                </label>
                <input 
                  type="text"
                  value={rewardName}
                  onChange={(e) => setRewardName(e.target.value)}
                  placeholder="例如：免做家务卡"
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  描述（可选）
                </label>
                <textarea
                  value={rewardDescription}
                  onChange={(e) => setRewardDescription(e.target.value)}
                  placeholder="补充说明，将保存到兑换码记录中"
                  rows={3}
                  className="w-full resize-none bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              数量/额度
            </label>
            <input 
              type="number"
              value={rewardCount}
              onChange={(e) => setRewardCount(Number(e.target.value))}
              min="1"
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={(!isAutoPresetType && !rewardName.trim()) || isGenerating}
            className="w-full py-3.5 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isGenerating ? '生成中...' : '生成兑换码'}
          </button>
        </div>
      </div>

      {/* Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowResultModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mt-2">
              <div 
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden ${!uploadedImage ? activeColorStyle.className : ''}`}
                style={!uploadedImage ? activeColorStyle.style : {}}
              >
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Reward Icon" className="w-full h-full object-cover" />
                ) : (
                  React.createElement(icons[selectedIcon] || Gift, { className: "w-8 h-8" })
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">生成成功！</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">请将此兑换码发送给TA</p>
              
              <div className="flex items-center justify-center space-x-3">
                <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-2xl font-bold tracking-widest text-indigo-600 dark:text-indigo-400 select-all">
                  {generatedCode}
                </div>
                <button 
                  onClick={handleCopy}
                  className="p-3.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                >
                  {copied ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <Copy className="w-6 h-6" />}
                </button>
              </div>
              
              <button 
                onClick={() => setShowResultModal(false)}
                className="w-full mt-6 py-3.5 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
