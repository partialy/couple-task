/**
 * 带类型提示的事件触发器
 * @template T - 事件名称的联合类型（如 'login' | 'error'）
 */
declare class EventEmitter<T extends string> {
    private listeners;
    constructor(events: T[]);
    /**
     * 监听事件
     * @param event - 事件名（仅允许初始化时指定的类型）
     * @param callback - 回调函数，支持接收自定义参数
     */
    on(event: T, callback: (...args: any[]) => void): void;
    /**
     * 触发事件
     * @param event - 事件名（仅允许初始化时指定的类型）
     * @param args - 传递给回调函数的参数
     */
    emit(event: T, ...args: any[]): void;
    /**
     * 移除指定事件的指定回调（可选扩展）
     */
    off(event: T, callback: (...args: any[]) => void): void;
}

export { EventEmitter as default };
