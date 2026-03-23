import React from "react";
import { Message } from "../../data/messages";

interface ChatMessageProps {
  message: Message;
  isMe: boolean;
  avatar: string;
}

export default function ChatMessage({ message, isMe, avatar }: ChatMessageProps) {
  const type = message.type || "text";
  const isMediaUrl =
    type === "image" || type === "video" || type === "file";

  const bubble = (
    <div
      className={`px-4 py-2.5 rounded-2xl ${
        isMe
          ? "bg-indigo-500 text-white rounded-br-sm"
          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700"
      }`}
    >
      {type === "image" && isMediaUrl ? (
        <img
          src={message.text}
          alt=""
          className="max-w-[220px] max-h-48 rounded-lg object-cover"
          referrerPolicy="no-referrer"
        />
      ) : type === "video" && isMediaUrl ? (
        <video src={message.text} controls className="max-w-[240px] max-h-48 rounded-lg" />
      ) : type === "file" && isMediaUrl ? (
        <a
          href={message.text}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm underline break-all ${isMe ? "text-indigo-100" : "text-indigo-600 dark:text-indigo-400"}`}
        >
          打开文件链接
        </a>
      ) : (
        <p className="text-sm leading-relaxed break-words">{message.text}</p>
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
          className={`w-8 h-8 rounded-full object-cover flex-shrink-0 ${isMe ? "ml-2" : "mr-2"}`}
          referrerPolicy="no-referrer"
        />
        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
          {bubble}
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
            {message.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
}
