import React from 'react';
import { Check, X } from 'lucide-react';
import { InviteDTO } from '@/api/service/binding';

interface ReceivedInvitesListProps {
  invites: InviteDTO[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export default function ReceivedInvitesList({ invites, onAccept, onReject }: ReceivedInvitesListProps) {
  if (invites.length === 0) {
    return <p className="text-center text-slate-500 py-10">暂无收到的邀请</p>;
  }

  return (
    <div className="space-y-4">
      {invites.map(item => (
        <div key={item.invite.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-4">
            <img 
              src={item.otherUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.otherUser?.username}`} 
              alt="avatar" 
              className="w-12 h-12 rounded-full bg-slate-200" 
            />
            <div>
              <p className="font-medium text-slate-800 dark:text-white">
                {item.otherUser?.nickname || item.otherUser?.username}
              </p>
              <p className="text-xs text-slate-500">
                {new Date(item.invite.createdAt || '').toLocaleString()}
              </p>
            </div>
          </div>
          
          {item.invite.status === 'PENDING' ? (
            <div className="flex space-x-2">
              <button 
                onClick={() => onReject(item.invite.id)}
                className="p-2 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                title="拒绝"
              >
                <X className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onAccept(item.invite.id)}
                className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                title="接受"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <span className="text-sm text-slate-400 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
              {item.invite.status === 'REJECTED' ? '已拒绝' : item.invite.status}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
