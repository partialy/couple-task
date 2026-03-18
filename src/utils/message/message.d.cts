/**
 * 通用消息提示工具
 * 提供简洁易用的消息提示功能
 */
type MessageType = 'success' | 'warning' | 'error' | 'info' | 'loading';
interface MessageOptions {
    /** 消息内容 */
    content: string;
    /** 消息类型 */
    type?: MessageType;
    /** 显示时长（毫秒），为 0 时不自动关闭 */
    duration?: number;
    /** 是否显示关闭按钮 */
    closable?: boolean;
    /** 自定义图标 SVG */
    icon?: string;
    /** 关闭回调函数 */
    onClose?: () => void;
}
/**
 * 显示消息
 */
declare function show(options: string | MessageOptions): {
    close: () => void;
};
/**
 * 快捷方法
 */
declare function success(content: string, options?: Omit<MessageOptions, 'content' | 'type'>): {
    close: () => void;
};
declare function warning(content: string, options?: Omit<MessageOptions, 'content' | 'type'>): {
    close: () => void;
};
declare function error(content: string, options?: Omit<MessageOptions, 'content' | 'type'>): {
    close: () => void;
};
declare function info(content: string, options?: Omit<MessageOptions, 'content' | 'type'>): {
    close: () => void;
};
declare function loading(content: string, options?: Omit<MessageOptions, 'content' | 'type'>): {
    close: () => void;
};
declare const message: {
    show: typeof show;
    success: typeof success;
    warning: typeof warning;
    error: typeof error;
    info: typeof info;
    loading: typeof loading;
};
declare global {
    interface Window {
        message: typeof message;
    }
}

export { type MessageOptions, type MessageType, message as default };
