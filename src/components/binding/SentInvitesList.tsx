import React from 'react';
import { Clock, Check, X } from 'lucide-react';
import { InviteDTO } from '@/api/service/binding';

interface SentInvitesListProps {
  invites: InviteDTO[];
}

export default function SentInvitesList({ invites }: SentInvitesListProps) {
  if (invites.length === 0) {
    return <p className="text-center text-slate-500 py-10">暂无发送记录</p>;
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="text-xs font-medium text-amber-500 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            待回应
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="text-xs font-medium text-emerald-500 flex items-center">
            <Check className="w-3 h-3 mr-1" />
            已接受
          </span>
        );
      case 'REJECTED':
        return (
          <span className="text-xs font-medium text-red-500 flex items-center">
            <X className="w-3 h-3 mr-1" />
            已拒绝
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-3">
      {invites.map(item => (
        <div key={item.invite.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <img 
              src={item.otherUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.otherUser?.username}`} 
              alt="avatar" 
              className="w-10 h-10 rounded-full bg-slate-200" 
            />
            <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
              {item.otherUser?.nickname || item.otherUser?.username}
            </span>
          </div>
          <div className="flex flex-col items-end">
            {getStatusDisplay(item.invite.status)}
            <span className="text-[10px] text-slate-400 mt-1">
              {new Date(item.invite.createdAt || '').toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
