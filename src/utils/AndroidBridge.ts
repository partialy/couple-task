import { message } from "./pure/message";

declare global {
    interface Window {
        AndroidBridge: {
            download(url: string): void;
            clearCache(): void;
            toast(msg: string): void;
        };
    }
}

export class AndroidBridge { 
    static instance: AndroidBridge;
    private constructor() {
    }

    static getInstance(): AndroidBridge {
        if (!AndroidBridge.instance) {
            AndroidBridge.instance = new AndroidBridge();
        }
        return AndroidBridge.instance;
    }

    public isAndroid(): boolean {
        return window.AndroidBridge !== undefined;
    }

    public download(url: string) {
        window.AndroidBridge?.download(url);
    }

    public clearCache() {
        window.AndroidBridge?.clearCache();
    }

    public toast(msg: string) {
        if(this.isAndroid()) {
            window.AndroidBridge?.toast(msg);
        } else {
            message.info(msg);
        }
    }
 }

 export const androidBridge = AndroidBridge.getInstance();