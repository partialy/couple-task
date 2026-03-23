/** localStorage 中持久化深色模式开关 */
export const DARK_MODE_STORAGE_KEY = 'yutask-dark-mode';

export function readStoredDarkMode(): boolean | null {
  try {
    const v = localStorage.getItem(DARK_MODE_STORAGE_KEY);
    if (v === 'true') return true;
    if (v === 'false') return false;
    return null;
  } catch {
    return null;
  }
}

export function writeStoredDarkMode(isDark: boolean): void {
  try {
    localStorage.setItem(DARK_MODE_STORAGE_KEY, isDark ? 'true' : 'false');
  } catch {
    /* ignore */
  }
}

/** 启动时：优先已保存值，否则与 URL ?darkMode= 兼容 */
export function getInitialDarkMode(): boolean {
  const stored = readStoredDarkMode();
  if (stored !== null) return stored;
  const params = new URLSearchParams(window.location.search);
  return params.get('darkMode') === 'true';
}
