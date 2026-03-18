import React, { useState } from 'react';
import { MessageCircle, Trash2, Send } from 'lucide-react';
import { formatRelativeTime } from '@/utils/date';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

interface TaskCommentsProps {
  taskId: string;
  currentUser: string | null;
}

export default function TaskComments({ taskId, currentUser }: TaskCommentsProps) {
  // Mock comments data
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      userId: 'user1',
      userName: '小明',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=小明',
      content: '今天太累了，明天再做可以吗？',
      createdAt: '2026-02-03 17:55:23'
    },
    {
      id: '2',
      userId: currentUser || 'user2',
      userName: currentUser || '我',
      userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser || '我'}`,
      content: '没问题，好好休息！',
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19) // 1 hour ago
    }
  ]);
  const [newComment, setNewComment] = useState('');

  const handleSend = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now().toString(),
      userId: currentUser || 'anonymous',
      userName: currentUser || '我',
      userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser || '我'}`,
      content: newComment.trim(),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setComments([...comments, comment]);
    setNewComment('');
  };

  const handleDelete = (id: string) => {
    setComments(comments.filter(c => c.id !== id));
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
            <img src={comment.userAvatar} alt={comment.userName} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{comment.userName}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">{formatRelativeTime(comment.createdAt)}</span>
                  {comment.userId === currentUser && (
                    <button onClick={() => handleDelete(comment.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-4">暂无评论，来说两句吧~</p>
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
          disabled={!newComment.trim()}
          className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-colors flex-shrink-0"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
