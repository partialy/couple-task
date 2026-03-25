import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, MapPin, FileText, Image, Bell, X, Plus, Loader2 } from 'lucide-react';
import { datePicker } from '@/utils/pure/datePicker';
import { timePicker } from '@/utils/pure/timePicker';
import { message } from '@/utils/pure/message';
import { uploadToQiniu } from '@/utils/qiniu';
import ImagePreview from '@/components/ui/ImagePreview';
import scheduleService, { SchedulePayload } from '@/api/service/schedule';

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultDate?: string;
}

const MAX_TYPE_LENGTH = 20;
const MAX_IMAGES = 3;

export default function AddScheduleModal({ isOpen, onClose, onSuccess, defaultDate }: AddScheduleModalProps) {
  const [type, setType] = useState('');
  const [eventDate, setEventDate] = useState(defaultDate || '');
  const [eventTime, setEventTime] = useState('09:00');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [popupRemind, setPopupRemind] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 每次打开重置默认日期
  React.useEffect(() => {
    if (isOpen) {
      setType('');
      setEventDate(defaultDate || '');
      setEventTime('09:00');
      setLocation('');
      setDescription('');
      setImages([]);
      setPopupRemind(true);
    }
  }, [isOpen, defaultDate]);

  const handlePickDate = () => {
    const parts = eventDate.split('-');
    const initDate = parts.length === 3
      ? new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
      : new Date();

    datePicker.show({
      initialDate: initDate,
      onSelect: (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        setEventDate(`${y}-${m}-${d}`);
      },
    });
  };

  const handlePickTime = () => {
    const parts = eventTime.split(':');
    timePicker.show({
      initialTime: { hour: parseInt(parts[0]) || 9, minute: parseInt(parts[1]) || 0 , second: 0},
      onSelect: ({ hour, minute }) => {
        setEventTime(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
      },
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      message.warning(`最多上传${MAX_IMAGES}张图片`);
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        const url = await uploadToQiniu(file, 'schedule');
        urls.push(url);
      }
      setImages(prev => [...prev, ...urls]);
    } catch {
      message.error('图片上传失败');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!eventDate) {
      message.warning('请选择事件日期');
      return;
    }
    const trimmedType = type.trim();
    if (trimmedType.length > MAX_TYPE_LENGTH) {
      message.warning(`类型名称不能超过${MAX_TYPE_LENGTH}个字`);
      return;
    }

    const payload: SchedulePayload = {
      type: trimmedType || undefined,
      eventTime: `${eventDate} ${eventTime}:00`,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      images: images.length > 0 ? images : undefined,
      popupRemind,
    };

    setSubmitting(true);
    try {
      const res = await scheduleService.add(payload);
      if (res.success) {
        message.success('日程已添加');
        onSuccess();
      } else {
        message.error(res.msg || '添加失败');
      }
    } catch {
      message.error('添加失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-2000 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm max-h-[85vh] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">新增日程</h3>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* 表单内容 */}
            <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4 no-scrollbar">
              {/* 类型名称 */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">类型名称</label>
                <input
                  type="text"
                  value={type}
                  onChange={e => setType(e.target.value.slice(0, MAX_TYPE_LENGTH))}
                  placeholder="未命名日程"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-colors"
                />
                <span className="text-[10px] text-slate-400 mt-1 block text-right">{type.length}/{MAX_TYPE_LENGTH}</span>
              </div>

              {/* 日期 + 时间 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">日期</label>
                  <button
                    onClick={handlePickDate}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-white transition-colors hover:border-cyan-400"
                  >
                    <Calendar className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span className="truncate">{eventDate || '选择日期'}</span>
                  </button>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">时间</label>
                  <button
                    onClick={handlePickTime}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-white transition-colors hover:border-cyan-400"
                  >
                    <Clock className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span>{eventTime}</span>
                  </button>
                </div>
              </div>

              {/* 位置 */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">位置（可选）</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="添加位置"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-colors"
                  />
                </div>
              </div>

              {/* 描述 */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">描述（可选）</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="添加描述"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-colors resize-none"
                />
              </div>

              {/* 图片上传 */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">图片（可选，最多{MAX_IMAGES}张）</label>
                <div className="flex gap-2 flex-wrap">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-16">
                      <button onClick={() => setPreviewImage(url)} className="w-full h-full">
                        <img src={url} alt="" className="w-full h-full rounded-xl object-cover border border-slate-200 dark:border-slate-600 hover:opacity-80 transition-opacity" />
                      </button>
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < MAX_IMAGES && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:text-cyan-500 hover:border-cyan-400 transition-colors"
                    >
                      {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* 弹窗提醒开关 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">当天弹窗提醒</span>
                </div>
                <button
                  onClick={() => setPopupRemind(!popupRemind)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${popupRemind ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${popupRemind ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="px-5 pb-5 pt-2 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 px-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                添加
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

      {/* 图片全屏预览 */}
      <ImagePreview
        src={previewImage}
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </>
  );
}
