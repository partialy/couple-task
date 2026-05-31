import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Calendar, Loader2, Upload } from 'lucide-react';
import { datePicker } from '@/utils/pure/datePicker';
import memorialService, { MemorialItem, MemorialPayload } from '@/api/service/memorial';
import type { MemorialEventType } from '@/utils/pure/calculateMemorialDays';
import { message } from '@/utils/pure/message';
import { uploadToQiniu } from '@/utils/qiniu';
import MemorialGlyph, { MEMORIAL_ICON_KEYS } from './MemorialGlyph';
import MemorialTransparentHeader from './MemorialTransparentHeader';
import { MEMORIAL_THEME_COLORS, getMemorialTheme } from './memorialTheme';
import { normalizeMemorialItem } from './memorialTypes';

interface MemorialEditorPanelProps {
  isOpen: boolean;
  editing: MemorialItem | null;
  onClose: () => void;
  onSaved: () => void;
}

const MAX_TITLE = 60;

function todayYmd(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function MemorialEditorPanel({ isOpen, editing, onClose, onSaved }: MemorialEditorPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [eventType, setEventType] = useState<MemorialEventType>('anniversary');
  const [title, setTitle] = useState('');
  const [customCategory, setCustomCategory] = useState('纪念日');
  const [iconKey, setIconKey] = useState('love');
  const [customIconUrl, setCustomIconUrl] = useState<string | null>(null);
  const [colorThemeId, setColorThemeId] = useState('rose');
  const [targetDate, setTargetDate] = useState('');
  const [personName, setPersonName] = useState('');
  const [memo, setMemo] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      const e = normalizeMemorialItem(editing);
      setEventType(e.eventType === 'birthday' ? 'birthday' : 'anniversary');
      setTitle(e.title);
      setCustomCategory(e.customCategory || '纪念日');
      setIconKey(e.iconKey || 'love');
      setCustomIconUrl(e.customIconUrl || null);
      setColorThemeId(e.colorThemeId || 'rose');
      setTargetDate(e.anchorDate?.slice(0, 10) || '');
      setPersonName(e.personName || '');
      setMemo(e.note || '');
      setIsPinned(e.isPinned === 1);
    } else {
      setEventType('anniversary');
      setTitle('');
      setCustomCategory('纪念日');
      setIconKey('love');
      setCustomIconUrl(null);
      setColorThemeId('rose');
      setTargetDate(todayYmd());
      setPersonName('');
      setMemo('');
      setIsPinned(false);
    }
  }, [isOpen, editing]);

  const activeTheme = getMemorialTheme(colorThemeId);

  const handlePickTargetDate = () => {
    const parts = targetDate.split('-');
    const initDate =
      parts.length === 3
        ? new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
        : new Date();
    datePicker.show({
      initialDate: initDate,
      onSelect: (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        setTargetDate(`${y}-${m}-${d}`);
      },
    });
  };

  const handleUpload = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToQiniu(file, 'memorial');
      setCustomIconUrl(url);
      setIconKey('love');
      message.success('图标已上传');
    } catch {
      message.error('上传失败');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = async () => {
    const t = title.trim();
    if (!t) {
      message.warning('请填写标题');
      return;
    }
    if (!targetDate) {
      message.warning('请选择目标日期');
      return;
    }

    const payload: MemorialPayload = {
      title: t,
      eventType,
      iconKey,
      customIconUrl: customIconUrl || undefined,
      colorThemeId,
      customCategory: customCategory.trim() || '纪念日',
      personName: eventType === 'birthday' ? personName.trim() || undefined : undefined,
      anchorDate: targetDate,
      pinned: isPinned,
      note: memo.trim() || undefined,
      kind: 1,
      repeatYearly: eventType === 'birthday',
    };

    setSubmitting(true);
    try {
      const res = editing
        ? await memorialService.update(editing.id, payload)
        : await memorialService.add(payload);
      if (res.success) {
        message.success(editing ? '已保存' : '已添加');
        onSaved();
      } else {
        message.error(res.msg || '保存失败');
      }
    } catch {
      message.error('保存失败');
    } finally {
      setSubmitting(false);
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
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-50/90 via-slate-50/90 to-teal-50/80 opacity-90 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900" />
          <div className="pointer-events-none absolute left-0 top-0 h-1/2 w-full bg-white/40 backdrop-blur-3xl dark:bg-slate-900/40" />
          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${activeTheme.bg} opacity-[0.06] dark:opacity-[0.12]`}
          />

          <div className="relative z-10 flex min-h-0 flex-1 flex-col">
            <MemorialTransparentHeader
              variant="title"
              title={editing ? '编辑日子' : '新建日子'}
              left={
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full px-2 py-1.5 text-sm font-bold text-slate-600 transition-colors hover:bg-white/40 dark:text-slate-300 dark:hover:bg-slate-800/60"
                >
                  取消
                </button>
              }
              right={
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-full px-2 py-1.5 text-sm font-extrabold text-cyan-600 transition-colors hover:bg-white/40 dark:text-cyan-400 dark:hover:bg-slate-800/60"
                >
                  保存
                </button>
              }
            />

            <div className="relative z-20 flex-1 space-y-4 overflow-y-auto px-4 pb-24 pt-2 no-scrollbar">
            <div className="relative z-20 bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 rounded-2xl p-1.5 flex shadow-sm">
              <button
                type="button"
                onClick={() => setEventType('anniversary')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  eventType === 'anniversary'
                    ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                纪念日 / 倒数日
              </button>
              <button
                type="button"
                onClick={() => setEventType('birthday')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  eventType === 'birthday'
                    ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                生日
              </button>
            </div>

            <div className="relative z-20 bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 rounded-[1.5rem] p-5 space-y-5 shadow-sm">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 pl-1">
                  图标与色彩
                </label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 px-1">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-12 h-12 shrink-0 rounded-2xl flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-400 border border-dashed border-slate-300 dark:border-slate-500"
                  >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    <span className="text-[8px] font-bold mt-0.5">上传</span>
                  </button>
                  {customIconUrl && (
                    <button
                      type="button"
                      onClick={() => setIconKey('love')}
                      className={`w-12 h-12 shrink-0 rounded-2xl overflow-hidden ring-2 ${activeTheme.ring}`}
                    >
                      <img src={customIconUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  )}
                  {MEMORIAL_ICON_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setIconKey(key);
                        setCustomIconUrl(null);
                      }}
                      className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-all ${
                        iconKey === key && !customIconUrl
                          ? `${activeTheme.iconBg} ring-2 ${activeTheme.ring} scale-105`
                          : 'bg-white/50 dark:bg-slate-700/50 text-slate-400'
                      }`}
                    >
                      <MemorialGlyph iconKey={key} />
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {MEMORIAL_THEME_COLORS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setColorThemeId(t.id)}
                      className={`w-7 h-7 rounded-full bg-gradient-to-br ${t.bg} transition-all ${
                        colorThemeId === t.id ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-white scale-110' : 'opacity-60'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-3">
                  <label className="block text-[11px] font-extrabold text-slate-400 mb-1 pl-1">标题</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
                    placeholder="例如：恋爱纪念日"
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-cyan-400/40"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-extrabold text-slate-400 mb-1 pl-1">分类</label>
                  <input
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="搞钱"
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold text-center text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-cyan-400/40"
                  />
                </div>
              </div>

              {eventType === 'birthday' && (
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 mb-1 pl-1">寿星姓名</label>
                  <input
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder="Alice"
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-400/40"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1 pl-1">目标日期</label>
                <button
                  type="button"
                  onClick={handlePickTargetDate}
                  className="w-full flex items-center gap-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400/40 text-left"
                >
                  <Calendar className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span className="truncate">{targetDate || '选择日期'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-400 pl-1">设为置顶卡片</span>
                <button
                  type="button"
                  onClick={() => setIsPinned(!isPinned)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${isPinned ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      isPinned ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1 pl-1">备忘录</label>
                <textarea
                  rows={3}
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="写点什么…"
                  className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 dark:text-white outline-none resize-none focus:ring-2 focus:ring-cyan-400/40"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={submitting}
              className={`relative z-20 w-full py-3.5 rounded-[1.25rem] bg-gradient-to-br ${activeTheme.bg} text-white font-extrabold text-sm shadow-lg disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              保存记录
            </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
