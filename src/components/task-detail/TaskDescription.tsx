import React from "react";

interface TaskDescriptionProps {
  content: string;
  loading: boolean;
}

export default function TaskDescription({ content, loading }: TaskDescriptionProps) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px]">
        {loading ? "正在加载任务详情..." : content}
      </p>
    </div>
  );
}
