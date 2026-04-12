/** 渐变与图标容器样式（与参考 UI 一致） */
export const MEMORIAL_THEME_COLORS = [
  {
    id: 'rose',
    bg: 'from-rose-400 to-pink-500',
    iconBg: 'bg-rose-100 dark:bg-rose-500/20 text-rose-500 dark:text-rose-400',
    ring: 'ring-rose-400',
  },
  {
    id: 'amber',
    bg: 'from-amber-400 to-orange-500',
    iconBg: 'bg-amber-100 dark:bg-amber-500/20 text-amber-500 dark:text-amber-400',
    ring: 'ring-amber-400',
  },
  {
    id: 'emerald',
    bg: 'from-emerald-400 to-teal-500',
    iconBg: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 dark:text-emerald-400',
    ring: 'ring-emerald-400',
  },
  {
    id: 'blue',
    bg: 'from-blue-400 to-indigo-500',
    iconBg: 'bg-blue-100 dark:bg-blue-500/20 text-blue-500 dark:text-blue-400',
    ring: 'ring-blue-400',
  },
  {
    id: 'purple',
    bg: 'from-violet-400 to-purple-500',
    iconBg: 'bg-purple-100 dark:bg-purple-500/20 text-purple-500 dark:text-purple-400',
    ring: 'ring-purple-400',
  },
  {
    id: 'slate',
    bg: 'from-slate-600 to-slate-800',
    iconBg: 'bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300',
    ring: 'ring-slate-600',
  },
] as const;

export type MemorialThemeId = (typeof MEMORIAL_THEME_COLORS)[number]['id'];

export function getMemorialTheme(themeId: string | undefined) {
  return MEMORIAL_THEME_COLORS.find((t) => t.id === themeId) || MEMORIAL_THEME_COLORS[0];
}
