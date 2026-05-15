import React from 'react';
import AndroidPadding from '@/components/ui/AndroidPadding';

/**
 * 倒数日模块共用顶区：透明安全区占位 + 无底色工具栏，与页面渐变背景一致（同详情页思路）。
 */

interface TitleVariant {
  variant: 'title';
  title: string;
  left: React.ReactNode;
  right: React.ReactNode;
}

interface SidesVariant {
  variant: 'sides';
  left: React.ReactNode;
  right: React.ReactNode;
}

export type MemorialTransparentHeaderProps = TitleVariant | SidesVariant;

export default function MemorialTransparentHeader(props: MemorialTransparentHeaderProps) {
  return (
    <>
      <AndroidPadding className="bg-transparent dark:bg-transparent" />
      {props.variant === 'title' ? (
        <header className="relative z-20 grid shrink-0 grid-cols-3 items-center px-4 pb-3 pt-1">
          <div className="min-w-0 justify-self-start">{props.left}</div>
          <h2 className="min-w-0 truncate px-1 text-center text-lg font-bold text-slate-800 dark:text-white">
            {props.title}
          </h2>
          <div className="min-w-0 justify-self-end">{props.right}</div>
        </header>
      ) : (
        <header className="relative z-20 flex shrink-0 items-center justify-between px-4 pb-3 pt-1">
          {props.left}
          {props.right}
        </header>
      )}
    </>
  );
}
