import React from 'react';
import { Star, Heart, Trophy, Crown, Gem, Sparkles } from 'lucide-react';

export interface SpecialItem {
  /** 后端 UUID */
  id: string;
  name: string;
  desc: string;
  cards: number;
  icon: string;
  /** 预设色键，与 specialColorStyles 的 key 对应 */
  color: string;
  image?: string;
  status?: 'active' | 'inactive';
  /** 发布者用户 id */
  publishUserId?: string;
  /** 库存，-1 或 undefined 表示不限 */
  stock?: number;
}

/** 将后端记录转为前端展示结构 */
export function mapSpecialItemFromApi(row: {
  id: string;
  name: string;
  description?: string | null;
  cardsCost: number;
  icon?: string | null;
  color?: string | null;
  imageUrl?: string | null;
  status?: string | null;
  publishUserId?: string | null;
  stock?: number | null;
}): SpecialItem {
  return {
    id: row.id,
    name: row.name,
    desc: row.description ?? '',
    cards: row.cardsCost,
    icon: row.icon?.trim() || 'crown',
    color: row.color?.trim() || 'indigo',
    image: row.imageUrl || undefined,
    status: row.status === 'inactive' ? 'inactive' : 'active',
    publishUserId: row.publishUserId ?? undefined,
    stock: row.stock === undefined || row.stock === null ? -1 : row.stock,
  };
}

/** 列表卡片背景 class：兼容历史存完整 Tailwind 类名的数据 */
export function getSpecialItemBgClass(colorKeyOrClass: string): string {
  if (specialColorStyles[colorKeyOrClass]) {
    return specialColorStyles[colorKeyOrClass].bg;
  }
  if (colorKeyOrClass?.startsWith('bg-')) {
    return colorKeyOrClass;
  }
  return specialColorStyles.indigo.bg;
}

export const specialIconMap: Record<string, React.ElementType> = {
  star: Star,
  heart: Heart,
  trophy: Trophy,
  crown: Crown,
  gem: Gem,
  sparkles: Sparkles,
};

export const specialColorStyles: Record<string, { bg: string, text: string }> = {
  indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-500' },
  violet: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-500' },
  fuchsia: { bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/30', text: 'text-fuchsia-500' },
  rose: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-500' },
  amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-500' },
  cyan: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-500' },
};
