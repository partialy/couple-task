import React from 'react';
import PageHeader from '../ui/PageHeader';

interface HeaderProps {
  onBack: () => void;
  onPublish: () => void;
  canPublish: boolean;
  isPublishing?: boolean;
  /** 编辑模式：标题与按钮文案 */
  isEditMode?: boolean;
  /** 新建时保存草稿 */
  onSaveDraft?: () => void;
  showSaveDraft?: boolean;
}

export default function Header({
  onBack,
  onPublish,
  canPublish,
  isPublishing,
  isEditMode,
  onSaveDraft,
  showSaveDraft,
}: HeaderProps) {
  return (
    <PageHeader
      title={isEditMode ? "编辑任务" : "发布任务"}
      onBack={onBack}
      rightSlot={
        <div className="flex items-center gap-2 shrink-0">
          {showSaveDraft && onSaveDraft && !isEditMode && (
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isPublishing}
              className="px-3 py-1.5 rounded-full text-sm font-bold transition-all border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              {isPublishing ? "…" : "保存草稿"}
            </button>
          )}
          <button
            onClick={onPublish}
            disabled={!canPublish || isPublishing}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
              canPublish && !isPublishing
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            {isPublishing
              ? isEditMode
                ? "保存中..."
                : "发布中..."
              : isEditMode
                ? "保存"
                : "发布"}
          </button>
        </div>
      }
    />
  );
}
