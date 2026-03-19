import React from "react";
import {
  Gift,
  Heart,
  Star,
  Coffee,
  Plane,
  Music,
  ShoppingBag,
} from "lucide-react";

const icons: Record<string, React.ElementType> = {
  Gift,
  Heart,
  Star,
  Coffee,
  Plane,
  Music,
  ShoppingBag,
};

const colorStyles: Record<string, { bg: string; text: string; border: string }> = {
  pink: {
    bg: "from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20",
    text: "text-pink-600 dark:text-pink-400",
    border: "border-pink-100/50 dark:border-pink-800/30",
  },
  cyan: {
    bg: "from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-100/50 dark:border-cyan-800/30",
  },
  amber: {
    bg: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-100/50 dark:border-amber-800/30",
  },
  emerald: {
    bg: "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-100/50 dark:border-emerald-800/30",
  },
  purple: {
    bg: "from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-100/50 dark:border-purple-800/30",
  },
  rose: {
    bg: "from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-100/50 dark:border-rose-800/30",
  },
};

interface TaskRewardsBlockProps {
  rewards: any[];
  isPrivate: boolean;
  isRevealed: boolean;
}

export default function TaskRewardsBlock({
  rewards,
  isPrivate,
  isRevealed,
}: TaskRewardsBlockProps) {
  if (!rewards || rewards.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center">
        <Gift className="w-5 h-5 mr-2 text-amber-500" />
        任务奖励
      </h3>
      <div className={rewards.length > 2 ? "flex flex-col gap-3" : "flex flex-wrap gap-3"}>
        {rewards.map((reward: any, idx: number) => {
          const isObj = typeof reward === "object";
          const text = isObj ? reward.text || reward.content : reward;
          const color = isObj ? reward.color : "amber";
          const iconName = isObj ? reward.icon : "Gift";

          const IconComponent = icons[iconName] || Gift;
          const style = colorStyles[color] || colorStyles.amber;

          return (
            <div
              key={idx}
              className={`flex items-center space-x-2 bg-gradient-to-r ${style.bg} ${style.text} px-4 py-2.5 rounded-xl border ${style.border} shadow-sm`}
            >
              <IconComponent className="w-4 h-4" />
              <span className="font-bold text-sm">
                {isPrivate && !isRevealed ? "***" : text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

