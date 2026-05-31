import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Eye, EyeOff, Loader2, Trash2 } from 'lucide-react';
import wishService, { type WishItem } from '@/api/service/wish';
import { useUserStore } from '@/store/user';
import { message } from '@/utils/pure/message';
import MemorialTransparentHeader from '@/components/memorial/MemorialTransparentHeader';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { colorKeyToBgBlur, colorKeyToClass } from './wishDisplay';

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

type GenderTone = 'rose' | 'sky' | 'slate';

function genderTone(gender: string | undefined): GenderTone {
  const g = (gender || '').toLowerCase();
  if (g === 'male') return 'sky';
  if (g === 'female') return 'rose';
  return 'slate';
}

function pageBgClass(tone: GenderTone): string {
  switch (tone) {
    case 'sky':
      return 'bg-sky-100 dark:bg-sky-950';
    case 'rose':
      return 'bg-rose-100 dark:bg-rose-950';
    default:
      return 'bg-slate-100 dark:bg-slate-950';
  }
}

function filterToggleActiveClass(tone: GenderTone): string {
  switch (tone) {
    case 'sky':
      return 'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-950/50 dark:text-sky-300';
    case 'rose':
      return 'border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300';
    default:
      return 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300';
  }
}

function filterToggleIdleClass(tone: GenderTone): string {
  switch (tone) {
    case 'sky':
      return 'border-white/80 bg-white/70 text-slate-600 backdrop-blur-md dark:border-sky-800/50 dark:bg-sky-900/40 dark:text-sky-200/80';
    case 'rose':
      return 'border-white/80 bg-white/70 text-slate-500 backdrop-blur-md dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200/80';
    default:
      return 'border-white/80 bg-white/70 text-slate-500 backdrop-blur-md dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-400';
  }
}

function loaderClass(tone: GenderTone): string {
  switch (tone) {
    case 'sky':
      return 'text-sky-500 dark:text-sky-400';
    case 'rose':
      return 'text-rose-400 dark:text-rose-400';
    default:
      return 'text-slate-400 dark:text-slate-500';
  }
}

function statusLabel(status: string): string {
  if (status === 'picked') return '被摘取中';
  if (status === 'done') return '对方已收下';
  return '在瓶中';
}

function formatWhen(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function isRecordHidden(w: WishItem): boolean {
  const v = w.recordHiddenAt;
  if (v == null || v === '') return false;
  if (typeof v === 'number') return true;
  return String(v).trim().length > 0;
}

/** 盖在心愿瓶主界面上，交互同 memorial 详情层 */
interface WishMyRecordsPanelProps {
  onClose: () => void;
}

export default function WishMyRecordsPanel({ onClose }: WishMyRecordsPanelProps) {
  const { bindingRelations, currentUser } = useUserStore();
  const bindId = bindingRelations?.id;
  const tone = genderTone(currentUser?.gender);
  const bgClass = pageBgClass(tone);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<WishItem[]>([]);
  const [showHidden, setShowHidden] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WishItem | null>(null);

  const load = useCallback(async () => {
    if (!bindId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await wishService.listMine(bindId, showHidden);
    if (res.success && res.data) {
      setItems(res.data);
    } else {
      message.error(res.msg || '加载失败');
      setItems([]);
    }
    setLoading(false);
  }, [bindId, showHidden]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleHide = async (w: WishItem) => {
    const res = await wishService.hideRecord(w.id);
    if (res.success) {
      message.success(typeof res.msg === 'string' ? res.msg : '已隐藏');
      void load();
    } else {
      message.error(res.msg || '操作失败');
    }
  };

  const handleUnhide = async (w: WishItem) => {
    const res = await wishService.unhideRecord(w.id);
    if (res.success) {
      message.success(typeof res.msg === 'string' ? res.msg : '已恢复显示');
      void load();
    } else {
      message.error(res.msg || '操作失败');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const res = await wishService.remove(deleteTarget.id);
    if (res.success) {
      message.success(typeof res.msg === 'string' ? res.msg : '已删除');
      setDeleteTarget(null);
      void load();
    } else {
      message.error(res.msg || '删除失败');
    }
  };

  const noBinding = !bindId;

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className={`absolute inset-0 z-[60] flex flex-col overflow-hidden transition-colors duration-300 ${bgClass}`}
    >
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <MemorialTransparentHeader
          variant="title"
          title="我的心愿"
          left={
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white bg-white/60 shadow-sm backdrop-blur-md transition-colors hover:bg-white active:scale-95 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-5 w-5 text-slate-800 dark:text-white" />
            </button>
          }
          right={<div className="h-10 w-10 shrink-0" aria-hidden />}
        />

        <div className="mt-3 flex shrink-0 items-center justify-between px-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500/90 dark:text-slate-400/90">仅自己可见</p>
          <button
            type="button"
            onClick={() => setShowHidden((v) => !v)}
            className={`flex items-center rounded-full border px-3 py-1.5 text-[11px] font-extrabold transition-colors ${
              showHidden ? filterToggleActiveClass(tone) : filterToggleIdleClass(tone)
            }`}
          >
            {showHidden ? <EyeOff className="mr-1 h-3.5 w-3.5" /> : <Eye className="mr-1 h-3.5 w-3.5" />}
            {showHidden ? '只看未隐藏' : '显示已隐藏'}
          </button>
        </div>

        <div className="mt-2 min-h-0 flex-1 overflow-y-auto px-6 pb-10">
          {noBinding ? (
            <p className="mt-16 text-center text-sm text-slate-500 dark:text-slate-400">请先绑定另一半</p>
          ) : loading ? (
            <div className="mt-24 flex justify-center">
              <Loader2 className={`h-8 w-8 animate-spin ${loaderClass(tone)}`} />
            </div>
          ) : items.length === 0 ? (
            <p className="mt-16 text-center text-sm text-slate-500 dark:text-slate-400">
              {showHidden ? '没有已隐藏的心愿' : '还没有许下心愿哦'}
            </p>
          ) : (
            <ul className="flex flex-col space-y-4 pt-2">
              {items.map((w) => (
                <li
                  key={w.id}
                  className={`relative overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/85 p-5 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/85 dark:shadow-none ${
                    isRecordHidden(w) ? 'opacity-75' : ''
                  }`}
                >
                  <div
                    className={`pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl ${colorKeyToBgBlur(w.colorKey)}`}
                  />
                  <div className="relative flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/80">
                      <StarIcon className={`h-9 w-9 drop-shadow-sm ${colorKeyToClass(w.colorKey)}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {statusLabel(w.status)}
                        </span>
                        {isRecordHidden(w) && (
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                            记录中已隐藏
                          </span>
                        )}
                        {formatWhen(w.createdAt) ? (
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{formatWhen(w.createdAt)}</span>
                        ) : null}
                      </div>
                      <p className="text-[15px] font-bold leading-relaxed text-slate-800 dark:text-slate-100">「{w.content}」</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {isRecordHidden(w) ? (
                          <button
                            type="button"
                            onClick={() => void handleUnhide(w)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            取消隐藏
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleHide(w)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            隐藏
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(w)}
                          className="flex items-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-extrabold text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-950/60"
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteTarget != null}
        title="删除这条心愿？"
        message="软删除后不再出现在你的记录中；若仍在对方流程中，以服务端状态为准。"
        confirmText="删除"
        cancelText="取消"
        confirmColor="bg-rose-500 hover:bg-rose-600"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </motion.div>
  );
}
