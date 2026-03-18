/**
 * 横幅通知
 * 顶部固定条：左侧图标，右侧标题+内容（上下分布），标题与内容各最多一行省略
 */
type BannerType = 'success' | 'warning' | 'error' | 'info';
interface BannerOptions {
    /** 标题 */
    title: string;
    /** 内容 */
    content: string;
    /** 类型，用于默认图标 */
    type?: BannerType;
    /** 自定义图标 SVG，传入则忽略 type 的图标 */
    icon?: string;
    /** 点击整条横幅的回调 */
    onClick?: () => void;
    /** 显示时长（毫秒），0 表示不自动关闭 */
    duration?: number;
    /** 关闭回调 */
    onClose?: () => void;
}
/**
 * 显示横幅通知
 */
declare function showBanner(options: BannerOptions): {
    close: () => void;
};
declare const banner: {
    showBanner: typeof showBanner;
};

declare global {
    interface Window {
        banner: typeof banner;
    }
}

export { type BannerOptions, type BannerType, banner as default, showBanner };
