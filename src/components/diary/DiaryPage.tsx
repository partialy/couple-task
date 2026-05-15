import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Plus } from 'lucide-react';
import { useUserStore } from '@/store/user';
import { message } from '@/utils/pure/message';
import diaryService, { DiaryItem } from '@/api/service/diary';
import DiaryTransparentHeader from './DiaryTransparentHeader';
import DiaryCalendarStrip from './DiaryCalendarStrip';
import DiaryCard from './DiaryCard';
import DiaryDetailPanel from './DiaryDetailPanel';
import DiaryEditorPanel from './DiaryEditorPanel';
import { toDiaryRow } from './diaryTypes';

interface DiaryPageProps {
  onBack: () => void;
}

function todayYmd() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function DiaryPage({ onBack }: DiaryPageProps) {
  const { bindingRelations, currentUser } = useUserStore();
  const bindId = bindingRelations?.id;
  const today = todayYmd();

  const [currentDate, setCurrentDate] = useState(today);
  const [items, setItems] = useState<DiaryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<DiaryItem | null>(null);

  const loadList = useCallback(async () => {
    if (!bindId) return;
    setLoading(true);
    try {
      const res = await diaryService.list(bindId);
      if (res.success) {
        setItems(res.data || []);
      } else {
        message.error(res.msg || '加载失败');
      }
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  }, [bindId]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (!editorOpen && !selectedId) return;
    const overlayKind = editorOpen ? 'editor' : 'detail';
    const st = (window.history.state || {}) as Record<string, unknown>;
    if (st.diaryOverlay !== overlayKind) {
      window.history.pushState({ ...st, view: 'diary', diaryOverlay: overlayKind }, '', window.location.href);
    }
    const handlePopState = () => {
      if (editorOpen) {
        setEditorOpen(false);
        setEditing(null);
      } else if (selectedId) {
        setSelectedId(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [editorOpen, selectedId]);

  useEffect(() => {
    const shouldOpen = sessionStorage.getItem('open_diary_editor_once');
    if (shouldOpen === '1') {
      sessionStorage.removeItem('open_diary_editor_once');
      setCurrentDate(today);
      setEditing(null);
      setEditorOpen(true);
    }
  }, [today]);

  const rows = useMemo(() => items.map(toDiaryRow), [items]);
  const dayStatusMap = useMemo(() => {
    const map: Record<string, 'none' | 'half' | 'full'> = {};
    const userId = currentUser?.id;
    const grouped: Record<string, { mine: boolean; partner: boolean }> = {};
    rows.forEach((row) => {
      const key = row.entryDate?.slice(0, 10);
      if (!key) return;
      if (!grouped[key]) grouped[key] = { mine: false, partner: false };
      if (userId && row.userId === userId) grouped[key].mine = true;
      else grouped[key].partner = true;
    });
    Object.keys(grouped).forEach((key) => {
      map[key] = grouped[key].mine && grouped[key].partner ? 'full' : 'half';
    });
    return map;
  }, [rows, currentUser?.id]);
  const dayRows = useMemo(
    () => rows.filter((x) => x.entryDate?.slice(0, 10) === currentDate),
    [rows, currentDate],
  );
  const selected = useMemo(() => rows.find((x) => x.id === selectedId) || null, [rows, selectedId]);
  const myTodayDiary = useMemo(() => {
    if (!currentUser?.id) return null;
    return items.find(
      (x) => x.userId === currentUser.id && x.entryDate?.slice(0, 10) === today,
    ) || null;
  }, [items, currentUser?.id, today]);

  const noBinding = !bindId;

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 flex h-full flex-col overflow-hidden bg-slate-50 dark:bg-slate-950"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden transition-colors duration-500">
        <div className="absolute inset-0 z-0 bg-linear-to-b from-white/60 to-transparent dark:from-slate-900/60" />
        <div className="absolute -top-20 -left-20 h-80 w-80 animate-pulse rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-900/30 [animation-duration:6s]" />
        <div className="absolute top-1/4 -right-20 h-80 w-80 animate-pulse rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-900/30 [animation-duration:8s] [animation-direction:reverse]" />
      </div>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <DiaryTransparentHeader
          title="日记"
          left={
            <button
              type="button"
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white bg-white/60 shadow-sm backdrop-blur-md dark:border-slate-700 dark:bg-slate-800/60"
            >
              <ChevronLeft className="h-5 w-5 text-slate-800 dark:text-white" />
            </button>
          }
          right={<div className="h-10 w-10" />}
        />

        <DiaryCalendarStrip currentDate={currentDate} dayStatusMap={dayStatusMap} onChange={setCurrentDate} />
        <div className="no-scrollbar relative z-10 flex-1 space-y-4 overflow-y-auto px-4 pt-4 pb-28">
          {noBinding ? (
            <div className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">请先绑定另一半后再使用日记</div>
          ) : loading ? (
            <div className="py-16 text-center text-sm text-slate-400">加载中…</div>
          ) : dayRows.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">今天还没有日记</div>
          ) : (
            dayRows.map((row) => (
              <DiaryCard
                key={row.id}
                row={row}
                currentUserId={currentUser?.id}
                currentUserGender={currentUser?.gender}
                onClick={() => setSelectedId(row.id)}
              />
            ))
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          if (noBinding) return;
          if (myTodayDiary) {
            setCurrentDate(today);
            setEditing(myTodayDiary);
            setEditorOpen(true);
            return;
          }
          if (currentDate !== today) setCurrentDate(today);
          setEditing(null);
          setEditorOpen(true);
        }}
        disabled={noBinding}
        className="absolute bottom-8 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-500 text-white shadow-2xl shadow-sky-500/30 transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
      >
        <Plus className="h-6 w-6" />
      </button>

      <DiaryDetailPanel
        row={selected}
        currentUserId={currentUser?.id}
        currentUserGender={currentUser?.gender}
        onClose={() => window.history.back()}
        onEdit={(id) => {
          const target = items.find((x) => x.id === id) || null;
          setEditing(target);
          setSelectedId(null);
          setEditorOpen(true);
        }}
        onToggleLike={async (id) => {
          const res = await diaryService.toggleLike(id);
          if (res.success) {
            void loadList();
          } else {
            message.error(res.msg || '操作失败');
          }
        }}
        onComment={async (id, content) => {
          const res = await diaryService.addComment(id, content);
          if (res.success) {
            void loadList();
          } else {
            message.error(res.msg || '评论失败');
          }
        }}
        onDeleteComment={async (id, commentId) => {
          const res = await diaryService.deleteComment(id, commentId);
          if (res.success) {
            void loadList();
          } else {
            message.error(res.msg || '删除评论失败');
          }
        }}
      />

      <DiaryEditorPanel
        isOpen={editorOpen}
        date={editing ? currentDate : today}
        editing={editing}
        onClose={() => window.history.back()}
        onSaved={() => {
          setEditorOpen(false);
          setEditing(null);
          void loadList();
        }}
      />
    </motion.div>
  );
}
