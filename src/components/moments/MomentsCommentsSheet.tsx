import React, { useEffect, useRef } from 'react';
import type { MomentComment, MomentListItem } from './momentsTypes';
import { ChatIcon, CloseIcon, SendIcon } from './momentIcons';
import { formatMomentTime } from './momentDisplay';

interface MomentsCommentsSheetProps {
  activeMoment: MomentListItem | undefined;
  comments: MomentComment[];
  commentsLoading: boolean;
  commentText: string;
  setCommentText: (v: string) => void;
  currentUserId: string;
  onClose: () => void;
  onSendComment: () => void;
}

export default function MomentsCommentsSheet({
  activeMoment,
  comments,
  commentsLoading,
  commentText,
  setCommentText,
  currentUserId,
  onClose,
  onSendComment,
}: MomentsCommentsSheetProps) {
  const commentsScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeMoment && commentsScrollRef.current) {
      const id = window.setTimeout(() => {
        const el = commentsScrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      }, 50);
      return () => window.clearTimeout(id);
    }
  }, [activeMoment, comments]);

  if (!activeMoment) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="关闭"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity dark:bg-black/60"
        onClick={onClose}
      />

      <div className="relative flex h-[75vh] w-full animate-moment-slide-up flex-col overflow-hidden rounded-t-[2.5rem] border-t border-transparent bg-white/95 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] backdrop-blur-2xl dark:border-slate-700/50 dark:bg-slate-900/95 sm:mx-auto sm:max-w-lg">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 pt-5 pb-3 dark:border-slate-800/60">
          <div className="w-8" />
          <h2 className="text-base font-extrabold text-slate-800 dark:text-white">
            共 {comments.length} 条评论
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-1.5 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <CloseIcon />
          </button>
        </div>

        <div ref={commentsScrollRef} className="no-scrollbar flex-1 space-y-6 overflow-y-auto p-6">
          {commentsLoading ? (
            <div className="py-12 text-center text-sm text-slate-400">加载中…</div>
          ) : comments.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center opacity-60">
              <ChatIcon />
              <p className="mt-2 text-sm font-medium text-slate-400">快来抢个沙发吧~</p>
            </div>
          ) : (
            comments.map((comment) => {
              const partnerTint = comment.authorUserId !== currentUserId;
              const nameColor = partnerTint ? 'text-rose-500 dark:text-rose-400' : 'text-sky-500 dark:text-sky-400';
              const avatarSrc =
                comment.avatar?.trim() ||
                `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(comment.userName || comment.authorUserId)}&backgroundColor=${partnerTint ? 'fecdd3' : 'bae6fd'}`;
              return (
                <div key={comment.id} className="flex animate-moment-fade-in-up items-start gap-3">
                  <img
                    src={avatarSrc}
                    alt=""
                    className={`h-9 w-9 shrink-0 rounded-full border border-white/50 shadow-sm dark:border-slate-700 ${
                      partnerTint ? 'bg-rose-100' : 'bg-sky-100'
                    }`}
                  />
                  <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-slate-100 bg-slate-50 p-3.5 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50">
                    <div className="mb-1 flex items-baseline gap-2">
                      <span className={`text-xs font-extrabold ${nameColor}`}>{comment.userName}</span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {formatMomentTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-[13px] leading-relaxed font-medium text-slate-700 dark:text-slate-200">
                      {comment.content}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-white/80 px-4 pt-3 pb-6 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-end gap-3">
            <div className="relative flex-1 overflow-hidden rounded-3xl border border-transparent bg-slate-100 transition-colors dark:border-slate-700 dark:bg-slate-800">
              <textarea
                rows={1}
                placeholder="写下你的评论..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="no-scrollbar block max-h-24 min-h-[44px] w-full resize-none overflow-y-auto bg-transparent px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-100"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSendComment();
                  }
                }}
              />
            </div>
            <button
              type="button"
              onClick={onSendComment}
              disabled={!commentText.trim()}
              className="shrink-0 rounded-full bg-slate-900 p-3 text-white shadow-md transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-sky-500"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
