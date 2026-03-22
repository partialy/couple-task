import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Copy, MessageCircle, History } from 'lucide-react';
import Modal from './ui/Modal';
import ReceivedInvitesList from './binding/ReceivedInvitesList';
import SentInvitesList from './binding/SentInvitesList';
import { bindingService, InviteDTO } from '@/api/service/binding';
import { useUserStore } from '@/store';
import { message } from '@/utils/pure/message';

interface BindingPageProps {
  key?: string;
  onClose: () => void;
  currentUser: any;
}

export default function BindingPage({ onClose, currentUser }: BindingPageProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const myCode = currentUser?.inviteCode || '';
  
  const [sentInvites, setSentInvites] = useState<InviteDTO[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<InviteDTO[]>([]);
  const [showPendingList, setShowPendingList] = useState(false);
  const [showHistoryList, setShowHistoryList] = useState(false);
  const { fetchUserDetail } = useUserStore();

  const pendingReceivedCount = receivedInvites.filter(i => i.invite.status === 'PENDING').length;

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    const [receivedRes, sentRes] = await Promise.all([
      bindingService.getReceivedInvites(),
      bindingService.getSentInvites()
    ]);
    if (receivedRes.success) {
      setReceivedInvites(receivedRes.data);
    }
    if (sentRes.success) {
      setSentInvites(sentRes.data);
    }
  };

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await Promise.all([fetchUserDetail(), fetchInvites()]);
      message.success('已更新为最新数据');
    } catch {
      message.error('刷新失败，请稍后重试');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCopy = () => {
    if (!myCode) return;
    navigator.clipboard.writeText(myCode);
    message.success('邀请码已复制');
  };

  const handleSendInvite = async () => {
    if (!inviteCode.trim()) {
      message.warning('请输入邀请码');
      return;
    }
    
    const res = await bindingService.invite(inviteCode);
    if (res.success) {
      message.success('已发送邀请，快去通知TA吧');
      setInviteCode('');
      fetchInvites();
    } else {
      message.error(res.msg || '发送邀请失败');
    }
  };

  const handleAccept = async (id: string) => {
    const res = await bindingService.accept(id);
    if (res.success) {
      message.success('已接受邀请，绑定成功！');
      await fetchUserDetail();
      setTimeout(() => {
        setShowPendingList(false);
        onClose();
      }, 1500);
    } else {
      message.error(res.msg || '接受邀请失败');
    }
  };

  const handleReject = async (id: string) => {
    const res = await bindingService.reject(id);
    if (res.success) {
      message.success('已拒绝邀请');
      fetchInvites();
    } else {
      message.error(res.msg || '拒绝邀请失败');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-100 bg-white dark:bg-slate-900 flex flex-col items-center p-6 overflow-y-auto"
    >
      {/* 拉取服务器最新用户与邀请列表 */}
      <button
        type="button"
        onClick={() => void handleRefresh()}
        disabled={refreshing}
        className="absolute top-6 left-6 p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors z-10 disabled:opacity-50 disabled:pointer-events-none"
        title="刷新数据"
      >
        <RefreshCw className={`w-6 h-6 ${refreshing ? 'animate-spin' : ''}`} />
      </button>

      {/* 历史记录按钮 */}
      <button
        onClick={() => setShowHistoryList(true)}
        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors z-10"
        title="发送记录"
      >
        <History className="w-6 h-6" />
      </button>

      {/* 待处理列表弹窗 */}
      <Modal
        isOpen={showPendingList}
        onClose={() => setShowPendingList(false)}
        title="收到的邀请"
      >
        <ReceivedInvitesList 
          invites={receivedInvites}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      </Modal>

      {/* 发送记录弹窗 */}
      <Modal
        isOpen={showHistoryList}
        onClose={() => setShowHistoryList(false)}
        title="邀请发送记录"
      >
        <SentInvitesList invites={sentInvites} />
      </Modal>

      <div className="w-full max-w-sm flex flex-col items-center mt-12 pb-20">
        {/* 顶部图标与消息角标 */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg bg-slate-100 flex items-center justify-center">
            <img src="/icon_128.png" alt="App Icon" className="w-full h-full object-cover" onError={(e) => {
              // Fallback if icon.png is missing
              (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/shapes/svg?seed=love';
            }}/>
          </div>
          
          {pendingReceivedCount > 0 && (
            <div 
              className="absolute -bottom-2 -right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg cursor-pointer animate-bounce"
              onClick={() => setShowPendingList(true)}
            >
              <MessageCircle className="w-4 h-4 absolute opacity-50" />
              <span className="relative z-10 text-xs font-bold">{pendingReceivedCount}</span>
              {/* 心动动画层 */}
              <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-75"></div>
            </div>
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          你还没有绑定另一半哦
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-10">
          绑定后即可开启情侣专属空间，一起完成任务、兑换奖励、记录点滴。
        </p>

        <div className="w-full space-y-8">
          {/* 我的邀请码 */}
          <div className="flex items-center justify-center space-x-2 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-800">
            <span className="text-xl font-mono font-bold text-indigo-500 tracking-widest">
              {myCode}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors"
              title="复制邀请码"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          {/* 输入邀请码 */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              输入 TA 的邀请码
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="请输入 xxxx-xxxx-xxxx 邀请码"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all uppercase text-center tracking-widest"
              maxLength={14}
            />
            <button
              onClick={handleSendInvite}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-colors shadow-sm shadow-indigo-500/20"
            >
              发送邀请
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
