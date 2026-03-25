import React, { useState } from 'react';
import { Flame, Coins, CreditCard, Package } from 'lucide-react';
import type { TargetPlanItem } from '@/api/service/checkin';
import { mapPlanFromApi, mapDayRewardFromApi, getRewardDisplayText } from './types';
import type { DayReward } from './types';
import CheckinCalendar from './CheckinCalendar';

const MONTH_NAMES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const CAPSULE_STYLES: Record<string, string> = {
  points: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  wild_card: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  prop: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
};

const CAPSULE_ICONS: Record<string, React.ReactNode> = {
  points: <Coins className="w-3 h-3" />,
  wild_card: <CreditCard className="w-3 h-3" />,
  prop: <Package className="w-3 h-3" />,
};

interface PlanCheckinCardProps {
  item: TargetPlanItem;
  onCheckin: (planId: string) => void;
  checkingIn: boolean;
}

export default function PlanCheckinCard({ item, onCheckin, checkingIn }: PlanCheckinCardProps) {
  const now = new Date();
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());

  const plan = mapPlanFromApi(item.plan);
  const dayRewards: DayReward[] = item.dayRewards.map(mapDayRewardFromApi);
  const status = item.status;

  const checkedInToday = status?.checkedInToday ?? false;
  const currentDayNumber = status?.currentDayNumber ?? 1;
  const currentStreak = status?.currentStreak ?? 0;
  const isInTimeWindow = status?.isInTimeWindow ?? true;

  const checkedDates = new Set<string>();
  if (status?.todayRecord) {
    checkedDates.add(status.todayRecord.checkinDate);
  }

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  /**
   * Same dayNumber mapping used for reward preview when a date is selected.
   */
  const getDayNumberForDate = (dayOfMonth: number): number | null => {
    if (!plan.isConsecutive) {
      if (plan.cycleDays === 7) {
        const jsDay = new Date(year, month - 1, dayOfMonth).getDay();
        return jsDay === 0 ? 7 : jsDay;
      }
      return dayOfMonth <= plan.cycleDays ? dayOfMonth : null;
    }

    const target = new Date(year, month - 1, dayOfMonth);
    const daysFromToday = Math.round((target.getTime() - todayStart.getTime()) / 86400000);
    if (daysFromToday < 0) return null;

    return ((currentDayNumber - 1 + daysFromToday) % plan.cycleDays) + 1;
  };

  const getSelectedDayRewards = (): { rewards: DayReward[]; dayNumber: number | null } => {
    if (selectedDay === null) return { rewards: [], dayNumber: null };
    const dn = getDayNumberForDate(selectedDay);
    if (dn === null) return { rewards: [], dayNumber: null };
    return { rewards: dayRewards.filter((r) => r.dayNumber === dn), dayNumber: dn };
  };

  const { rewards: selectedRewards, dayNumber: selectedDayNumber } = getSelectedDayRewards();
  const isToday = selectedDay === now.getDate() && year === now.getFullYear() && month === now.getMonth() + 1;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="font-bold text-slate-800 dark:text-white text-base">
          {plan.name}
          <span className="text-slate-400 dark:text-slate-500 font-normal">·{MONTH_NAMES[month - 1]}月</span>
        </h3>
        {currentStreak > 0 && (
          <div className="flex items-center gap-1 text-orange-500">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-bold">连续 {currentStreak} 天</span>
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="px-3 pb-2">
        <CheckinCalendar
          year={year}
          month={month}
          cycleDays={plan.cycleDays}
          dayRewards={dayRewards}
          checkedDates={checkedDates}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          isConsecutive={plan.isConsecutive}
          currentDayNumber={currentDayNumber}
        />
      </div>

      {/* Selected day rewards preview */}
      {selectedRewards.length > 0 && (
        <div className="px-4 pb-2">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
            {isToday ? '今日奖励' : `第 ${selectedDayNumber} 天奖励`}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {selectedRewards.map((r, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium ${
                  CAPSULE_STYLES[r.rewardType] || CAPSULE_STYLES.prop
                }`}
              >
                {CAPSULE_ICONS[r.rewardType]}
                {getRewardDisplayText(r)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Check-in button */}
      <div className="px-4 pb-4 pt-2">
        {checkedInToday ? (
          <button
            disabled
            className="w-full py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 font-bold text-sm cursor-default"
          >
            今日已签到
          </button>
        ) : !isInTimeWindow ? (
          <button
            disabled
            className="w-full py-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-500 font-bold text-sm cursor-not-allowed"
          >
            不在签到时间内
          </button>
        ) : (
          <button
            onClick={() => onCheckin(item.plan.id)}
            disabled={checkingIn}
            className="w-full py-3 rounded-2xl bg-linear-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
          >
            {checkingIn ? '签到中...' : '立即签到'}
          </button>
        )}
      </div>
    </div>
  );
}
