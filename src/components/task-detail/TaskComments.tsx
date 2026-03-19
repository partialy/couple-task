import React, { useEffect, useState } from 'react';
import { MessageCircle, Trash2, Send } from 'lucide-react';
import { formatRelativeTime } from '@/utils/date';
import taskService from '@/api/service/task';
import { TaskCommentVO } from '@/api/types';

interface TaskCommentsProps {
  taskId: string;
  currentUser: string | null;
}

export default function TaskComments({ taskId, currentUser }: TaskCommentsProps) {
  const [comments, setComments] = useState<TaskCommentVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);

  const fetchComments = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const res = await taskService.listComments(taskId);
      if (res.success && Array.isArray(res.data)) {
        setComments(res.data);
      } else {
        setComments([]);
      }
    } catch (error) {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const handleSend = async () => {
    const content = newComment.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const res = await taskService.createComment({ taskId, content });
      if (res.success && res.data) {
        setComments(prev => [...prev, res.data]);
        setNewComment('');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center">
        <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
        评论区 <span className="ml-2 text-sm font-normal text-slate-400">({comments.length})</span>
      </h3>

      {/* Comment List */}
      <div className="space-y-4 mb-6">
        {comments.map(comment => (
          <div key={comment.id} className="flex space-x-3">
            <img
              src={comment.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userName || comment.userId}`}
              alt={comment.userName || '用户'}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{comment.userName || '匿名用户'}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">{formatRelativeTime(comment.createdAt)}</span>
                  {(comment.userId === currentUser || comment.userName === currentUser) && (
                    <button disabled className="text-slate-300 dark:text-slate-600 transition-colors p-1 cursor-not-allowed" title="删除功能稍后开放">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{comment.content}</p>
            </div>
          </div>
        ))}
        {!loading && comments.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-4">暂无评论，来说两句吧~</p>
        )}
        {loading && (
          <p className="text-center text-sm text-slate-400 py-4">评论加载中...</p>
        )}
      </div>

      {/* Input Area */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="写下你的评论..."
          className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={!newComment.trim() || sending}
          className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-colors flex-shrink-0"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
