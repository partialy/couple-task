import React from 'react';
import type { MomentListItem } from './momentsTypes';
import { ChatIcon, HeartIcon } from './momentIcons';
import { formatMomentTime } from './momentDisplay';
import VirtualItem from './VirtualItem';

interface MomentTimelineItemProps {
  moment: MomentListItem;
  isMe: boolean;
  onToggleLike: (momentId: string) => void;
  onOpenComments: (momentId: string) => void;
}

export default function MomentTimelineItem({
  moment,
  isMe,
  onToggleLike,
  onOpenComments,
}: MomentTimelineItemProps) {
  const partnerTint = !isMe;
  const bubbleBg = partnerTint
    ? 'border-rose-100 bg-linear-to-br from-rose-50/90 to-pink-100/90 shadow-rose-200/30 dark:border-rose-800/40 dark:from-rose-900/30 dark:to-pink-900/20 dark:shadow-none'
    : 'border-sky-100 bg-linear-to-br from-sky-50/90 to-blue-100/90 shadow-sky-200/30 dark:border-sky-800/40 dark:from-sky-900/30 dark:to-blue-900/20 dark:shadow-none';
  const nameColor = partnerTint ? 'text-rose-500 dark:text-rose-400' : 'text-sky-500 dark:text-sky-400';
  const actionColor = partnerTint
    ? 'text-rose-400 hover:bg-rose-100/50 dark:hover:bg-rose-800/30'
    : 'text-sky-400 hover:bg-sky-100/50 dark:hover:bg-sky-800/30';
  const avatarRing = partnerTint ? 'bg-rose-100' : 'bg-sky-100';

  const avatarSrc =
    moment.avatar?.trim() ||
    `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(moment.userName || moment.authorUserId)}&backgroundColor=${partnerTint ? 'fecdd3' : 'bae6fd'}`;

  return (
    <VirtualItem>
      <div className={`mb-8 flex w-full animate-moment-fade-in-up ${isMe ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex w-[90%] items-start gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="relative shrink-0">
            <img
              src={avatarSrc}
              alt=""
              className={`h-10 w-10 rounded-full border-2 border-white shadow-sm dark:border-slate-800 ${avatarRing}`}
              loading="lazy"
            />
          </div>

          <div className={`flex min-w-0 flex-1 flex-col ${isMe ? 'items-end' : 'items-start'}`}>
            <div className={`mb-1.5 flex items-baseline gap-2 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className={`text-xs font-extrabold ${nameColor}`}>{moment.userName}</span>
              <span className="text-[10px] font-medium text-slate-400">{formatMomentTime(moment.createdAt)}</span>
            </div>

            <div
              className={`relative rounded-[1.5rem] border p-4 shadow-md backdrop-blur-xl transition-colors duration-500 ${bubbleBg} ${
                isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'
              }`}
            >
              {moment.remark ? (
                <p className="mb-2 text-[10px] font-medium text-slate-400 dark:text-slate-500">{moment.remark}</p>
              ) : null}
              <p className="text-[14px] leading-relaxed font-medium whitespace-pre-wrap text-slate-800 dark:text-slate-100">
                {moment.content}
              </p>

              {moment.images && moment.images.length > 0 && (
                <div className={`mt-3 grid gap-2 ${moment.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {moment.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className="h-auto max-h-48 w-full rounded-xl border border-white/50 object-cover shadow-sm dark:border-slate-700/50"
                      loading="lazy"
                    />
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center gap-4 border-t border-white/40 pt-3 dark:border-slate-700/30">
                <button
                  type="button"
                  onClick={() => onToggleLike(moment.id)}
                  className={`flex items-center gap-1.5 rounded-lg p-1 transition-colors ${
                    moment.likedByMe ? 'text-red-500' : actionColor
                  }`}
                >
                  <HeartIcon solid={moment.likedByMe} />
                  <span className="text-xs font-bold">{moment.likes > 0 ? moment.likes : '赞'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenComments(moment.id)}
                  className={`flex items-center gap-1.5 rounded-lg p-1 transition-colors ${actionColor}`}
                >
                  <ChatIcon />
                  <span className="text-xs font-bold">
                    {moment.commentCount > 0 ? moment.commentCount : '评论'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VirtualItem>
  );
}
