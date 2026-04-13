import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, Send } from 'lucide-react';
import type { DiaryRow } from './diaryTypes';
import { getMoodMeta } from './diaryMood';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface DiaryDetailPanelProps {
  row: DiaryRow | null;
  currentUserId?: string;
  currentUserGender?: string;
  onClose: () => void;
  onEdit: (id: string) => void;
  onToggleLike: (id: string) => void;
  onComment: (id: string, content: string) => Promise<void>;
  onDeleteComment: (diaryId: string, commentId: string) => Promise<void>;
}

export default function DiaryDetailPanel({
  row,
  currentUserId,
  currentUserGender,
  onClose,
  onEdit,
  onToggleLike,
  onComment,
  onDeleteComment,
}: DiaryDetailPanelProps) {
  const [text, setText] = useState('');
  const [pendingDeleteCommentId, setPendingDeleteCommentId] = useState<string | null>(null);
  const mood = getMoodMeta(row?.mood);
  const isMine = !!row && row.userId === currentUserId;
  const selfTone = currentUserGender === 'female' ? 'rose' : 'sky';
  const partnerTone = selfTone === 'rose' ? 'sky' : 'rose';
  const diaryTone = isMine ? selfTone : partnerTone;
  const headerDate = formatHeaderDate(row?.entryDate);
  const updateTime = formatTimeOnly(row?.updatedAt || row?.createdAt);

  return (
    <AnimatePresence>
      {row && (
        <div className="fixed inset-0 z-60 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="relative mx-auto flex h-[85vh] w-full max-w-[420px] flex-col overflow-hidden rounded-t-[2.2rem] border border-slate-200/50 bg-white/95 dark:border-slate-700/50 dark:bg-slate-900/95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div className="text-sm font-extrabold text-slate-700 dark:text-slate-100">{headerDate}</div>
              <div className="flex items-center gap-3">
                {isMine && <button onClick={() => onEdit(row.id)} className="text-sm font-bold text-sky-500">编辑</button>}
                <button onClick={onClose} className="text-sm text-slate-500">关闭</button>
              </div>
            </div>
            <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 overflow-hidden rounded-full ${diaryTone === 'rose' ? 'bg-rose-100' : 'bg-sky-100'}`}>
                    {row.author?.avatar ? (
                      <img src={row.author.avatar} alt={row.author.nickname || row.author.userName || 'avatar'} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div>
                    <div className={`text-sm font-extrabold ${diaryTone === 'rose' ? 'text-rose-500 dark:text-rose-400' : 'text-sky-500 dark:text-sky-400'}`}>
                      {row.author?.nickname || row.author?.userName || '匿名'}
                    </div>
                    <div className="text-[11px] font-medium text-slate-400">{row.author?.time || updateTime}</div>
                  </div>
                </div>
                <div className="text-4xl">{mood.icon}</div>
              </div>
              {row.content && (
                <p className="mb-4 whitespace-pre-wrap text-[15px] leading-loose text-slate-800 dark:text-slate-100">
                  {row.content}
                </p>
              )}
              {row.imageUrl && (
                <div className="mb-4 overflow-hidden rounded-2xl">
                  <img src={row.imageUrl} alt="diary" className="w-full object-cover" />
                </div>
              )}
              <div className="mb-2 text-right text-xs font-bold text-slate-400">
                编辑于 {updateTime}
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                <h3 className="mb-3 text-xs font-extrabold tracking-widest text-slate-400">评论 ({row.comments.length})</h3>
                <div className="space-y-3">
                  {row.comments.map((c) => {
                    const ownComment = c.userId === currentUserId;
                    const tone = ownComment ? selfTone : partnerTone;
                    return (
                    <div key={c.id} className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-7 w-7 overflow-hidden rounded-full ${tone === 'rose' ? 'bg-rose-100' : 'bg-sky-100'}`}>
                            {c.avatar ? <img src={c.avatar} alt={c.nickname || c.userName} className="h-full w-full object-cover" /> : null}
                          </div>
                          <div className={`text-[11px] font-bold ${tone === 'rose' ? 'text-rose-500 dark:text-rose-400' : 'text-sky-500 dark:text-sky-400'}`}>
                            {c.nickname || c.userName}
                          </div>
                          <div className="text-[10px] font-medium text-slate-400">{formatTimeOnly(c.time)}</div>
                        </div>
                        {ownComment && (
                          <button
                            type="button"
                            onClick={() => setPendingDeleteCommentId(c.id)}
                            className="text-[11px] font-bold text-slate-400 hover:text-rose-500"
                          >
                            删除
                          </button>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">{c.content}</div>
                    </div>
                  )})}
                </div>
              </div>
            </div>
            <div className="flex items-end gap-2 border-t border-slate-100 px-4 pb-6 pt-3 dark:border-slate-800">
              {!isMine && (
                <button
                  onClick={() => onToggleLike(row.id)}
                  className={`flex h-11 items-center gap-1.5 rounded-full border px-4 ${
                    row.likedByPartner === 1
                      ? 'border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-500/30 dark:bg-rose-500/10'
                      : 'border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800'
                  }`}
                >
                  <Heart className="h-4 w-4" />
                  <span className="text-xs font-bold">{row.likedByPartner === 1 ? '已赞' : '点赞'}</span>
                </button>
              )}
              <div className="flex flex-1 items-center rounded-full border border-slate-200 bg-slate-100 px-3 dark:border-slate-700 dark:bg-slate-800">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="写评论..."
                  className="w-full bg-transparent py-3 text-sm outline-none"
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && text.trim()) {
                      await onComment(row.id, text.trim());
                      setText('');
                    }
                  }}
                />
                <button
                  onClick={async () => {
                    if (!text.trim()) return;
                    await onComment(row.id, text.trim());
                    setText('');
                  }}
                  className="p-1 text-sky-500"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
          <ConfirmModal
            isOpen={!!pendingDeleteCommentId}
            title="删除评论"
            message="确定要删除这条评论吗？删除后无法恢复。"
            onCancel={() => setPendingDeleteCommentId(null)}
            onConfirm={() => {
              if (!pendingDeleteCommentId) return;
              void onDeleteComment(row.id, pendingDeleteCommentId);
              setPendingDeleteCommentId(null);
            }}
            confirmText="删除"
            confirmColor="bg-rose-500 hover:bg-rose-600"
          />
        </div>
      )}
    </AnimatePresence>
  );
}

function formatHeaderDate(input?: string | null): string {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) {
    const raw = input.slice(0, 10);
    const [y, m, day] = raw.split('-');
    if (!y || !m || !day) return input;
    return `${Number(y)}-${Number(m)}-${Number(day)}`;
  }
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function formatTimeOnly(input?: string | null): string {
  if (!input) return '';
  const d = new Date(input);
  if (!Number.isNaN(d.getTime())) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  const timePart = input.includes(' ') ? input.split(' ')[1] : input.split('T')[1];
  if (!timePart) return '';
  return timePart.slice(0, 5);
}
