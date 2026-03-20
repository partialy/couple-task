/** 与 Tailwind slate-50 / slate-900 及主界面背景一致 */
export const THEME_COLOR_LIGHT = '#f8fafc';
export const THEME_COLOR_DARK = '#0f172a';

const META_SELECTOR = 'meta[name="theme-color"]';

export function getThemeColorMeta(): HTMLMetaElement | null {
  return document.querySelector(META_SELECTOR);
}

/** 根据当前 <html> 是否含 `dark` 类更新 meta theme-color */
export function syncThemeColorMeta(): void {
  const meta = getThemeColorMeta();
  if (!meta) return;
  const isDark = document.documentElement.classList.contains('dark');
  meta.content = isDark ? THEME_COLOR_DARK : THEME_COLOR_LIGHT;
}

/**
 * 与 App 初始逻辑一致：从 URL 在首屏同步 dark 类，避免 theme-color 闪一下
 * （React 挂载后仍会再跑一次 effect，结果一致）
 */
export function syncDarkClassFromUrl(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const dark = params.get('darkMode') === 'true';
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch {
    /* ignore */
  }
}

/**
 * 监听 html class 变化（App / Profile 等处直接改 class 时也能更新 theme-color）
 */
export function initThemeColorObserver(): () => void {
  syncThemeColorMeta();
  const observer = new MutationObserver(() => {
    syncThemeColorMeta();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => observer.disconnect();
}
