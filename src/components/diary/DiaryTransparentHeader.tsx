import React from 'react';
import AndroidPadding from '@/components/ui/AndroidPadding';

interface DiaryTransparentHeaderProps {
  title: string;
  left: React.ReactNode;
  right?: React.ReactNode;
}

export default function DiaryTransparentHeader({ title, left, right }: DiaryTransparentHeaderProps) {
  return (
    <>
      <AndroidPadding className="bg-transparent dark:bg-transparent" />
      <header className="relative z-20 grid shrink-0 grid-cols-3 items-center px-4 pb-3 pt-1">
        <div className="min-w-0 justify-self-start">{left}</div>
        <h2 className="min-w-0 truncate px-1 text-center text-lg font-bold text-slate-800 dark:text-white">
          {title}
        </h2>
        <div className="min-w-0 justify-self-end">{right}</div>
      </header>
    </>
  );
}
