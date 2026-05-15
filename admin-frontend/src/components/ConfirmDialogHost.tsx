import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { registerConfirmHandler } from "@/utils/confirm";

type ConfirmState = {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  resolve?: (value: boolean) => void;
};

export default function ConfirmDialogHost() {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    title: "",
    message: "",
    confirmText: "确认",
    cancelText: "取消",
  });

  useEffect(() => {
    return registerConfirmHandler((payload) => {
      return new Promise<boolean>((resolve) => {
        setState({
          open: true,
          title: payload.title || "请确认操作",
          message: payload.message,
          confirmText: payload.confirmText || "确认",
          cancelText: payload.cancelText || "取消",
          resolve,
        });
      });
    });
  }, []);

  const close = (result: boolean) => {
    state.resolve?.(result);
    setState((prev) => ({ ...prev, open: false, resolve: undefined }));
  };

  return (
    <Dialog open={state.open} onOpenChange={(open) => !open && close(false)}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{state.title}</DialogTitle>
          <DialogDescription>{state.message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => close(false)}>
            {state.cancelText}
          </Button>
          <Button type="button" variant="destructive" onClick={() => close(true)}>
            {state.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
