type ConfirmPayload = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
};

type ConfirmHandler = (payload: ConfirmPayload) => Promise<boolean>;

let handler: ConfirmHandler | null = null;

export function registerConfirmHandler(nextHandler: ConfirmHandler): () => void {
  handler = nextHandler;
  return () => {
    if (handler === nextHandler) {
      handler = null;
    }
  };
}

export async function confirmAction(message: string): Promise<boolean> {
  if (!handler) {
    return window.confirm(message);
  }
  return handler({ message, title: "请确认操作", confirmText: "确认", cancelText: "取消" });
}
