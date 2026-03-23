import React, { useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import { Message } from "../../data/messages";
import ImagePreview from "@/components/ui/ImagePreview";
import Modal from "@/components/ui/Modal";

interface ChatMessageProps {
  message: Message;
  isMe: boolean;
  avatar: string;
}

export default function ChatMessage({ message, isMe, avatar }: ChatMessageProps) {
  const type = message.type || "text";
  const isMediaUrl =
    type === "image" || type === "video" || type === "file";
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [videoPreviewOpen, setVideoPreviewOpen] = useState(false);
  const [filePreviewOpen, setFilePreviewOpen] = useState(false);

  const attachmentName = useMemo(() => {
    if (type !== "file") return "";
    try {
      const url = new URL(message.text);
      const rawName = url.pathname.split("/").pop() || "附件";
      return decodeURIComponent(rawName) || "附件";
    } catch {
      const rawName = message.text.split("/").pop() || "附件";
      try {
        return decodeURIComponent(rawName) || "附件";
      } catch {
        return rawName || "附件";
      }
    }
  }, [type, message.text]);

  const attachmentSizeText = useMemo(() => {
    if (type !== "file") return "";
    try {
      const url = new URL(message.text);
      const raw =
        url.searchParams.get("size") ||
        url.searchParams.get("fileSize") ||
        url.searchParams.get("bytes");
      if (!raw) return "";
      const size = Number(raw);
      if (!Number.isFinite(size) || size <= 0) return "";
      if (size < 1024) return `${size} B`;
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
      if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
      return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    } catch {
      return "";
    }
  }, [type, message.text]);

  const bubble = (
    <div
      className={`px-4 py-2.5 rounded-2xl ${
        isMe
          ? "bg-indigo-500 text-white rounded-br-sm"
          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700"
      }`}
    >
      {type === "image" && isMediaUrl ? (
        <button
          type="button"
          onClick={() => setImagePreviewOpen(true)}
          className="block cursor-zoom-in overflow-hidden rounded-lg"
          aria-label="预览图片"
        >
          <img
            src={message.text}
            alt=""
            className="max-w-[220px] max-h-48 rounded-lg object-cover"
            referrerPolicy="no-referrer"
          />
        </button>
      ) : type === "video" && isMediaUrl ? (
        <button
          type="button"
          onClick={() => setVideoPreviewOpen(true)}
          className="block cursor-pointer overflow-hidden rounded-lg"
          aria-label="预览视频"
        >
          <video
            src={message.text}
            controls={false}
            muted
            className="pointer-events-none max-w-[240px] max-h-48 rounded-lg"
          />
        </button>
      ) : type === "file" && isMediaUrl ? (
        <button
          type="button"
          onClick={() => setFilePreviewOpen(true)}
          className={`w-full rounded-xl border p-3 text-left transition-colors ${
            isMe
              ? "border-indigo-300/40 bg-indigo-400/20 hover:bg-indigo-400/30"
              : "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700/50 dark:hover:bg-slate-700"
          }`}
          aria-label="查看文件详情"
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                isMe ? "bg-white/25 text-white" : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300"
              }`}
            >
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className={`text-xs ${isMe ? "text-indigo-100" : "text-slate-500 dark:text-slate-400"}`}>
                {isMe ? "我发了一个文件" : "对方发来一个文件"}
              </p>
              <p className={`truncate text-sm font-medium ${isMe ? "text-white" : "text-slate-800 dark:text-slate-100"}`}>
                {attachmentName || "附件"}
              </p>
              {attachmentSizeText ? (
                <p className={`text-xs ${isMe ? "text-indigo-100/90" : "text-slate-400"}`}>{attachmentSizeText}</p>
              ) : null}
            </div>
          </div>
        </button>
      ) : (
        <p className="text-sm leading-relaxed wrap-break-word">{message.text}</p>
      )}
    </div>
  );

  return (
    <div className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[75%] ${isMe ? "flex-row-reverse" : "flex-row"} items-end space-x-2`}
      >
        <img
          src={avatar || "https://picsum.photos/seed/u/100/100"}
          alt=""
          className={`w-8 h-8 rounded-full object-cover shrink-0 ${isMe ? "ml-2" : "mr-2"}`}
          referrerPolicy="no-referrer"
        />
        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
          {bubble}
          <div
            className={`mt-1 flex items-center gap-1.5 px-1 ${isMe ? "justify-end" : "justify-start"}`}
          >
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {message.timestamp}
            </span>
            {isMe && (
              <span
                className={`text-[10px] font-medium ${
                  message.isRead
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {message.isRead ? "已读" : "未读"}
              </span>
            )}
          </div>
        </div>
      </div>
      <ImagePreview
        src={type === "image" ? message.text : ""}
        isOpen={imagePreviewOpen}
        onClose={() => setImagePreviewOpen(false)}
        alt="聊天图片"
      />
      <Modal
        isOpen={videoPreviewOpen}
        onClose={() => setVideoPreviewOpen(false)}
        title="视频预览"
      >
        <div className="w-full">
          <video
            src={message.text}
            controls
            autoPlay
            className="max-h-[70vh] w-full rounded-xl bg-black"
          />
        </div>
      </Modal>
      <Modal
        isOpen={filePreviewOpen}
        onClose={() => setFilePreviewOpen(false)}
        title="附件详情"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
              <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {attachmentName}
              </p>
              <p className="text-xs text-slate-400 break-all">{message.text}</p>
            </div>
          </div>
          <a
            href={message.text}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-600"
          >
            <Download className="h-4 w-4" />
            下载附件
          </a>
        </div>
      </Modal>
    </div>
  );
}
