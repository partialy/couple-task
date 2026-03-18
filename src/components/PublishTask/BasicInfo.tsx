import React from 'react';

interface BasicInfoProps {
  title: string;
  setTitle: (title: string) => void;
  desc: string;
  setDesc: (desc: string) => void;
}

export default function BasicInfo({ title, setTitle, desc, setDesc }: BasicInfoProps) {
  return (
    <div className="space-y-4 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="填写任务标题..."
        className="w-full text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
      />
      <div className="h-px w-full bg-slate-100 dark:bg-slate-700"></div>
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="描述一下这个任务的细节吧，比如想去哪里，想吃什么..."
        className="w-full h-32 resize-none bg-transparent border-none focus:outline-none focus:ring-0 text-slate-600 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm leading-relaxed"
      />
    </div>
  );
}
