/**
 * 用户道具列表/弹窗：根据后端 color 字段生成图标外圈 class。
 * 支持：语义 key（pink / purple）、后端默认 slate、以及预制数据里的整段 bg-* Tailwind。
 */

const SHELL_BY_HUE: Record<string, string> = {
  pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-500',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-500',
  violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-500',
  indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500',
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-500',
  sky: 'bg-sky-100 dark:bg-sky-900/30 text-sky-500',
  cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-500',
  teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-500',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500',
  green: 'bg-green-100 dark:bg-green-900/30 text-green-500',
  lime: 'bg-lime-100 dark:bg-lime-900/30 text-lime-600',
  amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-500',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
  orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-500',
  red: 'bg-red-100 dark:bg-red-900/30 text-red-500',
  rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-500',
  fuchsia: 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-500',
  slate: 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300',
  gray: 'bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300',
  zinc: 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300',
  neutral: 'bg-neutral-100 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-300',
  stone: 'bg-stone-100 dark:bg-stone-800/50 text-stone-600 dark:text-stone-300',
};

const DEFAULT_HUE = 'cyan';

function hueFromLegacyBgString(raw: string): string | null {
  const lower = raw.toLowerCase();
  if (!lower.startsWith('bg-')) return null;
  const m = lower.match(/bg-([a-z]+)-/);
  return m?.[1] ?? null;
}

/**
 * @param color 后端 user_items.color：语义 key、或历史数据中的 `bg-*-100 dark:...` 整段
 */
export function getUserItemIconShellClass(color?: string | null): string {
  const raw = (color ?? '').trim();
  if (!raw) {
    return SHELL_BY_HUE[DEFAULT_HUE];
  }
  const lower = raw.toLowerCase();
  // 预制数据：整段以 bg- 开头，从中解析色相，再套完整 bg + text（Lucide 才有彩色）
  if (lower.startsWith('bg-')) {
    const hue = hueFromLegacyBgString(lower);
    if (hue && SHELL_BY_HUE[hue]) {
      return SHELL_BY_HUE[hue];
    }
  }
  const key = lower.replace(/[^a-z]/g, '') || DEFAULT_HUE;
  return SHELL_BY_HUE[key] ?? SHELL_BY_HUE[DEFAULT_HUE];
}
