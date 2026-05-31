import React, { useRef, useState } from 'react';
import { ImageIcon, SendIcon } from './momentIcons';
import { uploadToQiniu } from '@/utils/qiniu';
import { message } from '@/utils/pure/message';

interface MomentsComposerProps {
  /** 发送动态（含已上传图片 URL） */
  onSend: (text: string, imageUrls: string[]) => void;
  disabled?: boolean;
}

export default function MomentsComposer({ onSend, disabled }: MomentsComposerProps) {
  const [inputText, setInputText] = useState('');
  const [pendingUrls, setPendingUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const busy = disabled || uploading;

  const handlePickFile = () => {
    fileRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    if (pendingUrls.length >= 9) {
      message.warning('最多 9 张图片');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadToQiniu(file, 'moments');
      setPendingUrls((u) => [...u, url]);
    } catch {
      message.error('图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleSend = () => {
    const t = inputText.trim();
    if (!t && pendingUrls.length === 0) return;
    onSend(t, [...pendingUrls]);
    setInputText('');
    setPendingUrls([]);
  };

  return (
    <div className="absolute bottom-0 z-30 w-full animate-moment-slide-up border-t border-white/40 bg-white/70 px-4 pt-4 pb-6 backdrop-blur-2xl transition-colors duration-500 dark:border-slate-800/50 dark:bg-slate-900/70">
      {pendingUrls.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {pendingUrls.map((url, i) => (
            <div key={url + i} className="relative h-14 w-14 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-600">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-bold text-white opacity-0 transition-opacity hover:opacity-100"
                onClick={() => setPendingUrls((u) => u.filter((_, j) => j !== i))}
              >
                移除
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-3">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <button
          type="button"
          onClick={handlePickFile}
          disabled={busy}
          className="shrink-0 rounded-full bg-slate-100 p-3 text-slate-500 transition-colors hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
        >
          <ImageIcon />
        </button>

        <div className="relative flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-inner transition-colors duration-500 dark:border-slate-700 dark:bg-slate-800">
          <textarea
            rows={1}
            placeholder="记录这一刻..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={busy}
            className="no-scrollbar block max-h-24 min-h-[48px] w-full resize-none overflow-y-auto bg-transparent px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-60 dark:text-slate-100"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={busy || (!inputText.trim() && pendingUrls.length === 0)}
          className="shrink-0 rounded-full bg-linear-to-br from-sky-400 to-blue-500 p-3.5 text-white shadow-lg shadow-sky-400/30 transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
