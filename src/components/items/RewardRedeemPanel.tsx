import React, { useEffect, useState } from 'react';
import rewardCodesService from '@/api/service/rewardCodes';
import { message } from '@/utils/pure/message';
import * as Icons from 'lucide-react';
import { getUserItemIconShellClass } from './userItemIconColor';

interface RewardRedeemPanelProps {
  /** 面板重置键（弹窗每次打开时变化） */
  panelKey?: number | string;
  /** 兑换成功后触发外部刷新逻辑 */
  onRedeemSuccess: () => Promise<void>;
}

export default function RewardRedeemPanel({ panelKey, onRedeemSuccess }: RewardRedeemPanelProps) {
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [rewardInfo, setRewardInfo] = useState<{
    rewardType?: string;
    rewardName?: string;
    rewardCount?: number;
    icon?: string;
    color?: string;
    imageUrl?: string;
    description?: string | null;
  } | null>(null);

  useEffect(() => {
    setRedeemCode('');
    setRedeemLoading(false);
    setRewardInfo(null);
  }, [panelKey]);

  const isLikelyImageUrl = (value?: string | null): boolean => {
    if (!value || typeof value !== 'string') return false;
    const t = value.trim();
    return t.startsWith('http://') || t.startsWith('https://') || t.startsWith('//');
  };

  const handleRewardRedeem = async () => {
    const c = redeemCode.trim();
    if (!c || redeemLoading) return;
    setRedeemLoading(true);
    try {
      const res = await rewardCodesService.redeem(c);
      if (res.success) {
        const msg = typeof res.msg === 'string' && res.msg ? res.msg : '兑换成功';
        message.success(msg);
        setRewardInfo(res.data || null);
        await onRedeemSuccess();
      } else {
        setRewardInfo(null);
        message.error(res.msg || '兑换失败');
      }
    } catch (e) {
      console.error(e);
      setRewardInfo(null);
      message.error('兑换失败');
    } finally {
      setRedeemLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
        输入他人分享的兑换码，可领取积分、万能卡或道具（与奖励中心发布的码对应）。
      </p>
      <input
        type="text"
        value={redeemCode}
        onChange={(e) => setRedeemCode(e.target.value)}
        placeholder="请输入兑换码"
        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 mb-4 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-mono tracking-wider"
      />
      <button
        type="button"
        onClick={handleRewardRedeem}
        disabled={!redeemCode.trim() || redeemLoading}
        className="w-full py-3.5 bg-linear-to-r from-indigo-500 to-violet-600 dark:from-indigo-600 dark:to-violet-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-300/30 dark:shadow-indigo-900/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
      >
        {redeemLoading ? '兑换中...' : '确认兑换'}
      </button>

      {rewardInfo && (
        <div className="mt-4">
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            本次兑换获得的奖励
          </p>
          <div className="flex items-center space-x-3 w-full bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div
              className={`w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center shrink-0 ${getUserItemIconShellClass(
                rewardInfo.color,
              )}`}
            >
              {isLikelyImageUrl(rewardInfo.imageUrl) ? (
                <img src={rewardInfo.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (() => {
                const rawIcon = rewardInfo.icon || (rewardInfo.rewardType === 'points' ? 'Coins' : rewardInfo.rewardType === 'wild_card' ? 'Badge' : 'Gift');
                const pascalIcon = rawIcon.charAt(0).toUpperCase() + rawIcon.slice(1);
                const IconComponent = (Icons as any)[rawIcon] || (Icons as any)[pascalIcon] || Icons.Gift;
                return <IconComponent className="w-5 h-5" />;
              })()}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                {rewardInfo.rewardName || '奖励'} x{rewardInfo.rewardCount || 1}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {rewardInfo.description || '兑换成功，可在对应页面查看详情'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

