import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import diaryService, { DiaryItem } from '@/api/service/diary';
import { DIARY_MOODS } from './diaryMood';
import { message } from '@/utils/pure/message';
import DiaryTransparentHeader from './DiaryTransparentHeader';
import { uploadToQiniu } from '@/utils/qiniu';

interface DiaryEditorPanelProps {
  isOpen: boolean;
  date: string;
  editing: DiaryItem | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function DiaryEditorPanel({ isOpen, date, editing, onClose, onSaved }: DiaryEditorPanelProps) {
  const [mood, setMood] = useState<string>('happy');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setMood(editing?.mood || 'happy');
    setContent(editing?.content || '');
    setImageUrl(editing?.imageUrl || '');
  }, [isOpen, editing]);

  const handleSave = async () => {
    if (!mood) {
      message.warning('请选择心情');
      return;
    }
    if (!content.trim() && !imageUrl.trim()) {
      message.warning('正文和图片不能同时为空');
      return;
    }
    setSaving(true);
    try {
      const payload = { entryDate: date, mood, content: content.trim(), imageUrl: imageUrl.trim() || undefined };
      const res = editing
        ? await diaryService.update(editing.id, payload)
        : await diaryService.add(payload);
      if (res.success) {
        message.success(editing ? '已更新' : '已添加');
        onSaved();
      } else {
        message.error(res.msg || '保存失败');
      }
    } catch {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImage = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToQiniu(file, 'diary');
      setImageUrl(url);
      message.success('图片上传成功');
    } catch {
      message.error('图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="absolute inset-0 z-70 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950"
        >
          <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/60 to-transparent dark:from-slate-900/60" />
          <div className="relative z-10 flex min-h-0 flex-1 flex-col">
            <DiaryTransparentHeader
              title={editing ? '编辑日记' : '写日记'}
              left={<button onClick={onClose} className="px-2 py-1.5 text-sm font-bold text-slate-600 dark:text-slate-300">取消</button>}
              right={<button onClick={handleSave} className="px-2 py-1.5 text-sm font-extrabold text-sky-600 dark:text-sky-400">保存</button>}
            />
            <div className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-4 pt-2 pb-24">
              <div className="rounded-2xl border border-white/60 bg-white/70 p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
                <div className="no-scrollbar flex gap-3 overflow-x-auto py-1">
                  {DIARY_MOODS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setMood(item.id)}
                      className={`shrink-0 h-16 w-14 rounded-[1.25rem] border flex flex-col items-center justify-center ${
                        mood === item.id
                          ? 'border-sky-300 bg-white dark:bg-slate-700'
                          : 'border-transparent bg-slate-100/80 dark:bg-slate-700/60'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className={`text-[10px] font-bold ${item.color}`}>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-[1.8rem] border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-800/55">
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="记录下今天的点点滴滴..."
                  className="w-full resize-none bg-transparent text-sm leading-relaxed text-slate-800 outline-none dark:text-slate-100"
                />
                <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-700/60">
                  <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50 text-slate-400 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700/40 dark:text-slate-300 dark:hover:bg-slate-700/60">
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                    <span className="mt-1 text-[10px] font-bold">{uploading ? '上传中...' : '添加照片'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        void handleUploadImage(e.target.files?.[0]);
                        e.currentTarget.value = '';
                      }}
                    />
                  </label>
                  {imageUrl && (
                    <div className="relative mt-3 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-600">
                      <img src={imageUrl} alt="diary" className="h-40 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute right-2 top-2 rounded-full bg-black/55 p-1.5 text-white"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 py-3.5 text-sm font-extrabold text-white disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                保存日记
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
