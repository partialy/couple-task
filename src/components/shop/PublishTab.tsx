import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Gift, Image as ImageIcon, X, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { ShopItem, iconMap, colorStyles } from './types';
import { createLocalPreview, revokeLocalPreview, uploadToQiniu } from '@/utils/qiniu';
import message from '@/utils/message/message';

interface PublishTabProps {
  shopItems: ShopItem[];
  setShopItems: (items: ShopItem[]) => void;
  showToast?: (message: string) => void;
}

export default function PublishTab({ shopItems, setShopItems, showToast, key }: PublishTabProps & { key?: string }) {
  const [publishForm, setPublishForm] = useState({
    id: null as number | null,
    name: '',
    desc: '',
    points: '',
    icon: 'gift',
    color: 'pink',
    image: null as string | null
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activePicker, setActivePicker] = useState<'icon' | 'color' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (publishForm.image?.startsWith('blob:')) {
        revokeLocalPreview(publishForm.image);
      }
    };
  }, [publishForm.image]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (publishForm.image?.startsWith('blob:')) {
        revokeLocalPreview(publishForm.image);
      }
      const preview = createLocalPreview(file);
      setPublishForm({ ...publishForm, image: preview });
      setImageFile(file);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPublishing) return;
    setIsPublishing(true);

    try {
      let finalImageUrl = publishForm.image;
      if (imageFile) {
        try {
          finalImageUrl = await uploadToQiniu(imageFile, 'shop');
        } catch (error) {
          message.error('图片上传失败');
          setIsPublishing(false);
          return;
        }
      }

      if (publishForm.id) {
        // Edit existing
        const updatedItems = shopItems.map(item => 
          item.id === publishForm.id 
            ? {
                ...item,
                name: publishForm.name,
                desc: publishForm.desc,
                points: Number(publishForm.points),
                icon: publishForm.icon,
                color: colorStyles[publishForm.color]?.bg || item.color,
                image: finalImageUrl || undefined
              }
            : item
        );
        setShopItems(updatedItems);
        message.success('修改成功！');
      } else {
        // Create new
        const newItem: ShopItem = {
          id: Date.now(),
          name: publishForm.name,
          desc: publishForm.desc,
          points: Number(publishForm.points),
          icon: publishForm.icon,
          color: colorStyles[publishForm.color]?.bg || 'bg-pink-100 dark:bg-pink-900/30',
          image: finalImageUrl || undefined,
          status: 'active'
        };
        setShopItems([...shopItems, newItem]);
        message.success('发布成功！TA 的商城已更新。');
      }
      resetForm();
    } catch (error) {
      console.error('Failed to publish shop item', error);
      message.error('操作失败，请稍后再试');
    } finally {
      setIsPublishing(false);
    }
  };

  const resetForm = () => {
    setPublishForm({ id: null, name: '', desc: '', points: '', icon: 'gift', color: 'pink', image: null });
    setActivePicker(null);
  };

  const handleEdit = (item: ShopItem) => {
    // Find color key from bg string
    const colorKey = Object.keys(colorStyles).find(k => colorStyles[k].bg === item.color) || 'pink';
    setPublishForm({
      id: item.id,
      name: item.name,
      desc: item.desc,
      points: item.points.toString(),
      icon: item.icon,
      color: colorKey,
      image: item.image || null
    });
    // Scroll to top of the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: number) => {
    if (confirm('确定要删除这个奖励吗？')) {
      setShopItems(shopItems.filter(item => item.id !== id));
      alert('删除成功');
    }
  };

  const toggleStatus = (id: number) => {
    setShopItems(shopItems.map(item => 
      item.id === id 
        ? { ...item, status: item.status === 'inactive' ? 'active' : 'inactive' } 
        : item
    ));
  };

  return (
    <motion.div
      key="publish-tab"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="px-3 py-6 space-y-8"
    >
      {/* Publish Form */}
      <div className="bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {publishForm.id ? '编辑奖励' : '发布新奖励'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">为 TA 的商城添加一个惊喜</p>
            </div>
          </div>
          {publishForm.id && (
            <button 
              onClick={resetForm}
              className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handlePublish} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1">奖励名称</label>
            <input 
              type="text" 
              required
              placeholder="例如：清空购物车"
              value={publishForm.name}
              onChange={e => setPublishForm({...publishForm, name: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-800 dark:text-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1">奖励描述</label>
            <textarea 
              required
              placeholder="详细描述这个奖励的内容..."
              rows={3}
              value={publishForm.desc}
              onChange={e => setPublishForm({...publishForm, desc: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-800 dark:text-white transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1">所需积分</label>
              <input 
                type="number" 
                required
                placeholder="500"
                value={publishForm.points}
                onChange={e => setPublishForm({...publishForm, points: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-800 dark:text-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1">奖励图标/图片</label>
              <div className="flex items-center space-x-2 h-[54px]">
                {publishForm.image ? (
                  <div className="relative w-[54px] h-full">
                    <img src={publishForm.image} alt="Preview" className="w-full h-full object-cover rounded-2xl border border-slate-200 dark:border-slate-700" />
                    <button 
                      type="button"
                      onClick={() => setPublishForm({ ...publishForm, image: null })}
                      className="absolute -top-1 -right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 w-full h-full">
                    <button 
                      type="button" 
                      onClick={() => setActivePicker(activePicker === 'icon' ? null : 'icon')}
                      className={`flex-1 h-full rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all ${activePicker === 'icon' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500' : 'bg-slate-50 dark:bg-slate-900/50'}`}
                    >
                      {React.createElement(iconMap[publishForm.icon] || Gift, { className: `w-5 h-5 ${colorStyles[publishForm.color]?.text}` })}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-[54px] h-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center text-slate-400 hover:text-amber-500 transition-colors"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Icon & Color Pickers */}
          <AnimatePresence>
            {activePicker === 'icon' && !publishForm.image && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">选择图标</p>
                    <div className="flex flex-wrap gap-3">
                      {Object.keys(iconMap).map(iconName => {
                        const Icon = iconMap[iconName];
                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setPublishForm({ ...publishForm, icon: iconName })}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${publishForm.icon === iconName ? 'bg-white dark:bg-slate-800 shadow-sm ring-2 ring-amber-500/50' : 'hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
                          >
                            <Icon className={`w-5 h-5 ${publishForm.icon === iconName ? colorStyles[publishForm.color]?.text : 'text-slate-400'}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">选择颜色</p>
                    <div className="flex flex-wrap gap-3">
                      {Object.keys(colorStyles).map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setPublishForm({ ...publishForm, color: color })}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${publishForm.color === color ? 'bg-white dark:bg-slate-800 shadow-sm ring-2 ring-amber-500/50' : 'hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
                        >
                          <div className={`w-5 h-5 rounded-full ${colorStyles[color].bg} border border-white/20`}></div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={isPublishing}
            className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-300/40 dark:shadow-orange-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 mt-4 disabled:opacity-50"
          >
            {isPublishing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span>{isPublishing ? '发布中...' : (publishForm.id ? '保存修改' : '立即发布奖励')}</span>
          </button>
        </form>
      </div>

      {/* Published Items List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white px-1">已发布的商品</h3>
        <div className="space-y-3">
          {shopItems.map(item => {
            const IconComponent = iconMap[item.icon] || Gift;
            const colorKey = Object.keys(colorStyles).find(k => colorStyles[k].bg === item.color) || 'pink';
            const isInactive = item.status === 'inactive';

            return (
              <div 
                key={item.id} 
                className={`bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex space-x-4 relative transition-opacity ${isInactive ? 'opacity-60' : ''}`}
              >
                {/* Left: Image/Icon */}
                <div className={`w-20 h-20 rounded-2xl ${item.color} flex-shrink-0 flex items-center justify-center overflow-hidden`}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <IconComponent className={`w-10 h-10 ${colorStyles[colorKey]?.text || 'text-pink-500'}`} />
                  )}
                </div>

                {/* Right: Content */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 dark:text-white truncate pr-2">{item.name}</h4>
                      <span className="text-xs font-black text-amber-500 flex-shrink-0">{item.points} 积分</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-1 mt-2">
                    <button 
                      onClick={() => toggleStatus(item.id)}
                      className={`p-2 rounded-xl transition-colors ${isInactive ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-400 bg-slate-50 dark:bg-slate-700/50 hover:text-amber-500'}`}
                      title={isInactive ? "上架" : "下架"}
                    >
                      {isInactive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => handleEdit(item)}
                      className="p-2 text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:text-blue-500 transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:text-rose-500 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {shopItems.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-700">
              <Gift className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-400">暂无发布的商品</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-[32px] border border-amber-100 dark:border-amber-900/20">
        <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center space-x-2">
          <Sparkles className="w-4 h-4" />
          <span>温馨提示</span>
        </h4>
        <p className="text-xs text-amber-700/70 dark:text-amber-500/70 leading-relaxed">
          发布的奖励将直接出现在对方的积分商城中。你可以设置一些有趣的、浪漫的或者实用的奖励，让对方更有动力去完成任务哦！
        </p>
      </div>
    </motion.div>
  );
}
