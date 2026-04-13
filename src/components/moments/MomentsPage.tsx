import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import MemorialTransparentHeader from '@/components/memorial/MemorialTransparentHeader';
import { useUserStore } from '@/store/user';
import { message } from '@/utils/pure/message';
import momentsService from '@/api/service/moments';
import type { MomentComment, MomentListItem } from '@/api/service/moments';
import MomentTimelineItem from './MomentTimelineItem';
import MomentsComposer from './MomentsComposer';
import MomentsCommentsSheet from './MomentsCommentsSheet';

function displayName(u: { nickname?: string; username: string } | null | undefined) {
  if (!u) return '…';
  return u.nickname?.trim() || u.username;
}

interface MomentsPageProps {
  onBack: () => void;
}

export default function MomentsPage({ onBack }: MomentsPageProps) {
  const { currentUser, bindUser, bindingRelations } = useUserStore();
  const bindId = bindingRelations?.id;

  const [moments, setMoments] = useState<MomentListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [activeMomentId, setActiveMomentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<MomentComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const currentUserId = currentUser?.id ?? '';

  const loadList = useCallback(async () => {
    if (!bindId) return;
    setLoading(true);
    try {
      const res = await momentsService.list(bindId);
      if (res.success && res.data) {
        setMoments(res.data);
      } else {
        message.error(res.msg || '加载失败');
      }
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  }, [bindId]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    window.setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
  };

  useEffect(() => {
    if (!activeMomentId) scrollToBottom();
  }, [moments, activeMomentId]);

  useEffect(() => {
    if (!activeMomentId || !bindId) {
      setComments([]);
      return;
    }
    setCommentsLoading(true);
    void (async () => {
      try {
        const res = await momentsService.listComments(bindId, activeMomentId);
        if (res.success && res.data) {
          setComments(res.data);
        } else {
          message.error(res.msg || '评论加载失败');
          setComments([]);
        }
      } catch {
        message.error('评论加载失败');
        setComments([]);
      } finally {
        setCommentsLoading(false);
      }
    })();
  }, [activeMomentId, bindId]);

  /** 评论层 history：与倒数日叠层一致 */
  useEffect(() => {
    if (!activeMomentId) return;

    const st = window.history.state as Record<string, unknown> | null;
    if (st?.momentsOverlay !== 'comments' || st?.momentId !== activeMomentId) {
      window.history.pushState(
        { ...(st || {}), view: 'moments', momentsOverlay: 'comments', momentId: activeMomentId },
        '',
        window.location.href
      );
    }

    const handlePopState = () => {
      setActiveMomentId(null);
      setCommentText('');
      setComments([]);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeMomentId]);

  const handleCloseComments = () => {
    window.history.back();
  };

  const handleHeaderBack = () => {
    if (activeMomentId) {
      window.history.back();
      return;
    }
    onBack();
  };

  const handleSend = async (text: string, imageUrls: string[]) => {
    if (!bindId) return;
    const content = text.trim();
    if (!content && imageUrls.length === 0) return;
    try {
      const res = await momentsService.add({ bindId, content, imageUrls });
      if (res.success && res.data) {
        setMoments((prev) => [...prev, res.data!]);
        message.success(res.msg || '已发布');
      } else {
        message.error(res.msg || '发布失败');
      }
    } catch {
      message.error('发布失败');
    }
  };

  const handleToggleLike = async (momentId: string) => {
    if (!bindId) return;
    try {
      const res = await momentsService.toggleLike(bindId, momentId);
      if (res.success && res.data) {
        const { likes, likedByMe } = res.data;
        setMoments((prev) =>
          prev.map((m) => (m.id === momentId ? { ...m, likes, likedByMe } : m))
        );
      } else {
        message.error(res.msg || '操作失败');
      }
    } catch {
      message.error('操作失败');
    }
  };

  const handleOpenComments = (momentId: string) => {
    setActiveMomentId(momentId);
    setCommentText('');
  };

  const handleSendComment = async () => {
    const t = commentText.trim();
    if (!t || !activeMomentId || !bindId) return;
    try {
      const res = await momentsService.addComment({
        bindId,
        momentId: activeMomentId,
        content: t,
      });
      if (res.success && res.data) {
        setComments((c) => [...c, res.data!]);
        setCommentText('');
        setMoments((prev) =>
          prev.map((m) =>
            m.id === activeMomentId ? { ...m, commentCount: m.commentCount + 1 } : m
          )
        );
      } else {
        message.error(res.msg || '发送失败');
      }
    } catch {
      message.error('发送失败');
    }
  };

  const activeMoment = moments.find((m) => m.id === activeMomentId);
  const noBinding = !bindId;

  const subTitle =
    currentUser && bindUser
      ? `${displayName(currentUser)} & ${displayName(bindUser)}（共 ${moments.length} 条）`
      : `共 ${moments.length} 条`;

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 flex h-full flex-col overflow-hidden bg-slate-50 dark:bg-slate-950"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden transition-colors duration-500">
        <div className="absolute inset-0 z-0 bg-linear-to-b from-white/60 to-transparent dark:from-slate-900/60" />
        <div className="absolute -top-20 -left-20 h-80 w-80 animate-pulse rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-900/30 [animation-duration:6s]" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 animate-pulse rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-900/30 [animation-duration:8s] [animation-direction:reverse]" />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <MemorialTransparentHeader
          variant="title"
          title="动态"
          left={
            <button
              type="button"
              onClick={handleHeaderBack}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white bg-white/60 shadow-sm backdrop-blur-md transition-colors hover:bg-white active:scale-95 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-5 w-5 text-slate-800 dark:text-white" />
            </button>
          }
          right={<div className="w-10 shrink-0" aria-hidden />}
        />

        <p className="relative z-10 -mt-1 px-4 pb-2 text-center text-[10px] font-bold tracking-widest text-slate-400">
          {subTitle}
        </p>

        <div
          ref={scrollRef}
          className="no-scrollbar relative z-10 min-h-0 flex-1 scroll-smooth overflow-y-auto px-4 pt-2 pb-32"
        >
          {noBinding ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-sm text-slate-400 dark:text-slate-500">
              请先绑定另一半后再使用动态
            </div>
          ) : loading ? (
            <div className="py-16 text-center text-sm text-slate-400">加载中…</div>
          ) : moments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-sm text-slate-400 dark:text-slate-500">
              还没有动态，在下方记录第一条吧
            </div>
          ) : (
            moments.map((moment) => (
              <MomentTimelineItem
                key={moment.id}
                moment={moment}
                isMe={moment.authorUserId === currentUserId}
                onToggleLike={handleToggleLike}
                onOpenComments={handleOpenComments}
              />
            ))
          )}
        </div>

        {!activeMomentId && !noBinding && <MomentsComposer onSend={handleSend} disabled={loading} />}
      </div>

      {activeMomentId && (
        <MomentsCommentsSheet
          activeMoment={activeMoment}
          comments={comments}
          commentsLoading={commentsLoading}
          commentText={commentText}
          setCommentText={setCommentText}
          currentUserId={currentUserId}
          onClose={handleCloseComments}
          onSendComment={handleSendComment}
        />
      )}
    </motion.div>
  );
}
