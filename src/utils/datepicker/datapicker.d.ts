/**
 * 原生日期选择器（支持快速切换年/月）
 * 用法: 仅 import 即可，样式会自动注入；datePicker.bind(inputEl) 或 datePicker.pick() / datePicker.pickAsync()
 */
declare function closePicker(): void;
declare const datePicker: {
    bind(input: HTMLInputElement | string): () => void;
    open(options: {
        anchor: HTMLElement;
        value?: Date | string | null;
        onChange?: (date: Date) => void;
    }): void;
    /** 不绑定元素，直接传默认 value 和回调；无 value 时用当前日期 */
    pick(options?: {
        value?: Date | string | null;
        onChange?: (date: Date) => void;
    }): void;
    /** Promise 形式：选择后 resolve(Date)，取消或点遮罩 resolve(null) */
    pickAsync(options?: {
        value?: Date | string | null;
    }): Promise<Date | null>;
    close: typeof closePicker;
};
declare global {
    interface Window {
        datePicker: typeof datePicker;
    }
}

export { datePicker, datePicker as default };
