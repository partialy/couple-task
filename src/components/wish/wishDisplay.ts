import type { WishItem } from '@/api/service/wish';

/** 后端 color_key → Tailwind 类名（与示例一致） */
export const COLOR_KEY_TO_CLASS: Record<string, string> = {
  rose400: 'text-rose-400',
  pink400: 'text-pink-400',
  amber400: 'text-amber-400',
  sky400: 'text-sky-400',
  indigo400: 'text-indigo-400',
  purple400: 'text-purple-400',
};

export const STAR_COLOR_KEYS = ['rose400', 'pink400', 'amber400', 'sky400', 'indigo400', 'purple400'] as const;

export function colorKeyToClass(key: string): string {
  return COLOR_KEY_TO_CLASS[key] || 'text-rose-400';
}

/** 摘取弹窗背景光晕 */
export const COLOR_KEY_TO_BG_BLUR: Record<string, string> = {
  rose400: 'bg-rose-400/30',
  pink400: 'bg-pink-400/30',
  amber400: 'bg-amber-400/30',
  sky400: 'bg-sky-400/30',
  indigo400: 'bg-indigo-400/30',
  purple400: 'bg-purple-400/30',
};

export function colorKeyToBgBlur(key: string): string {
  return COLOR_KEY_TO_BG_BLUR[key] || 'bg-rose-400/30';
}

/** Canvas / 列表展示用 */
export type StarDisplay = { id: string; color: string; content: string };

export function wishToStarDisplay(w: WishItem): StarDisplay {
  return {
    id: w.id,
    color: colorKeyToClass(w.colorKey),
    content: w.content,
  };
}
