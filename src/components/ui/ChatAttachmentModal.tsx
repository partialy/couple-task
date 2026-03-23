import React, { useRef, useState, useEffect, useCallback } from "react";
import { Upload, X, FileText } from "lucide-react";
import Modal from "./Modal";
import { createLocalPreview, revokeLocalPreview } from "@/utils/qiniu";
import { message } from "@/utils/pure/message";

export type ChatAttachmentKind = "image" | "video" | "file";

const MAX_IMAGE_COUNT = 20;
const MAX_IMAGE_BYTES = 50 * 1024 * 1024;
const MAX_MEDIA_BYTES = 1024 * 1024 * 1024;

function formatSize(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function titleForKind(kind: ChatAttachmentKind): string {
  switch (kind) {
    case "image":
      return "选择图片";
    case "video":
      return "选择视频";
    default:
      return "选择文件";
  }
}

function acceptForKind(kind: ChatAttachmentKind): string {
  switch (kind) {
    case "image":
      return "image/*";
    case "video":
      return "video/*";
    default:
      return "*/*";
  }
}

export interface ChatAttachmentModalProps {
  isOpen: boolean;
  kind: ChatAttachmentKind;
  onClose: () => void;
  /** 校验通过后返回本地文件列表，由上层上传并发送 */
  onConfirm: (files: File[]) => void;
}

export default function ChatAttachmentModal({
  isOpen,
  kind,
  onClose,
  onConfirm,
}: ChatAttachmentModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setFiles([]);
      setImagePreviewUrls((prev) => {
        prev.forEach(revokeLocalPreview);
        return [];
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (kind !== "image") {
      setImagePreviewUrls((prev) => {
        prev.forEach(revokeLocalPreview);
        return [];
      });
      return;
    }
    const urls = files.map((f) => createLocalPreview(f));
    setImagePreviewUrls((prev) => {
      prev.forEach(revokeLocalPreview);
      return urls;
    });
    return () => {
      urls.forEach(revokeLocalPreview);
    };
  }, [files, kind]);

  const validateAndSetFiles = useCallback(
    (incoming: File[]) => {
      if (kind === "image") {
        setFiles((prev) => {
          const next = [...prev, ...incoming];
          if (next.length > MAX_IMAGE_COUNT) {
            message.error(`图片最多选择 ${MAX_IMAGE_COUNT} 张`);
            return prev;
          }
          for (const f of incoming) {
            if (f.size > MAX_IMAGE_BYTES) {
              message.error(`单张图片不能超过 ${formatSize(MAX_IMAGE_BYTES)}`);
              return prev;
            }
          }
          return next;
        });
        return;
      }
      for (const f of incoming) {
        if (f.size > MAX_MEDIA_BYTES) {
          message.error(`${kind === "video" ? "视频" : "文件"}不能超过 ${formatSize(MAX_MEDIA_BYTES)}`);
          return;
        }
      }
      setFiles((prev) => [...prev, ...incoming]);
    },
    [kind],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list?.length) return;
    validateAndSetFiles(Array.from(list));
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer.files?.length) return;
    validateAndSetFiles(Array.from(e.dataTransfer.files));
  };

  const removeAt = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setFiles([]);
    onClose();
  };

  const handleConfirm = () => {
    if (files.length === 0) {
      message.error("请先选择文件");
      return;
    }
    if (kind === "image") {
      if (files.length > MAX_IMAGE_COUNT) {
        message.error(`图片最多 ${MAX_IMAGE_COUNT} 张`);
        return;
      }
      for (const f of files) {
        if (f.size > MAX_IMAGE_BYTES) {
          message.error(`单张图片不能超过 ${formatSize(MAX_IMAGE_BYTES)}`);
          return;
        }
      }
    } else {
      for (const f of files) {
        if (f.size > MAX_MEDIA_BYTES) {
          message.error(`单个${kind === "video" ? "视频" : "文件"}不能超过 ${formatSize(MAX_MEDIA_BYTES)}`);
          return;
        }
      }
    }
    onConfirm(files);
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={titleForKind(kind)}>
      <div className="flex flex-col gap-4">
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={acceptForKind(kind)}
          multiple
          onChange={handleInputChange}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500 transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:border-indigo-500 dark:hover:bg-slate-800"
        >
          <Upload className="h-8 w-8 text-slate-400" />
          <span>点击或拖拽文件到此处</span>
          <span className="text-xs text-slate-400">
            {kind === "image" && `最多 ${MAX_IMAGE_COUNT} 张，单张 ≤ ${formatSize(MAX_IMAGE_BYTES)}`}
            {kind === "video" && `单个视频 ≤ ${formatSize(MAX_MEDIA_BYTES)}`}
            {kind === "file" && `单个文件 ≤ ${formatSize(MAX_MEDIA_BYTES)}`}
          </span>
        </button>

        {files.length > 0 && (
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {kind === "image" &&
              files.map((f, i) => (
                <div
                  key={`${f.name}-${i}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/80"
                >
                  <img
                    src={imagePreviewUrls[i] || ""}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{f.name}</p>
                    <p className="text-xs text-slate-400">{formatSize(f.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                    aria-label="移除"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            {kind === "video" &&
              files.map((f, i) => (
                <div
                  key={`${f.name}-${i}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/80"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                    <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{f.name}</p>
                    <p className="text-xs text-slate-400">{formatSize(f.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="移除"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            {kind === "file" &&
              files.map((f, i) => (
                <div
                  key={`${f.name}-${i}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/80"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                    <FileText className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{f.name}</p>
                    <p className="text-xs text-slate-400">{formatSize(f.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="移除"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
          >
            确定
          </button>
        </div>
      </div>
    </Modal>
  );
}
