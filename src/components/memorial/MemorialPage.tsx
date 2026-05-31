import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, Loader2, Plus } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import memorialService, { MemorialItem } from '@/api/service/memorial';
import { useUserStore } from '@/store/user';
import { message } from '@/utils/pure/message';
import MemorialHeroCard from './MemorialHeroCard';
import MemorialListCard from './MemorialListCard';
import MemorialDetailPanel from './MemorialDetailPanel';
import MemorialEditorPanel from './MemorialEditorPanel';
import MemorialTransparentHeader from './MemorialTransparentHeader';
import { toMemorialRow, type MemorialRow } from './memorialTypes';

interface MemorialPageProps {
  onBack: () => void;
}

export default function MemorialPage({ onBack }: MemorialPageProps) {
  const { bindingRelations } = useUserStore();
  const bindId = bindingRelations?.id;

  const [rawItems, setRawItems] = useState<MemorialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<MemorialRow | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<MemorialItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MemorialItem | null>(null);

  const loadList = useCallback(async () => {
    if (!bindId) return;
    setLoading(true);
    try {
      const res = await memorialService.list(bindId);
      if (res.success) {
        setRawItems(res.data || []);
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

  /** 与首页任务详情一致：系统/浏览器返回键走 history，先关编辑再关详情，最后才离开倒数日页 */
  useEffect(() => {
    if (!editorOpen && !selected) return;

    const overlayKind = editorOpen ? 'editor' : 'detail';
    const st = window.history.state as Record<string, unknown> | null;

    if (st?.memorialOverlay === 'detail' && overlayKind === 'editor') {
      window.history.replaceState(
        { ...st, view: st.view ?? 'memorial', memorialOverlay: 'editor' },
        '',
        window.location.href
      );
    } else if (st?.memorialOverlay !== overlayKind) {
      window.history.pushState(
        { ...(st || {}), view: (st?.view as string) || 'memorial', memorialOverlay: overlayKind },
        '',
        window.location.href
      );
    }

    const handlePopState = () => {
      if (editorOpen) {
        setEditorOpen(false);
        setEditing(null);
      } else if (selected) {
        setSelected(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [editorOpen, selected]);

  const rows = useMemo(() => rawItems.map(toMemorialRow), [rawItems]);

  const { hero, listEvents } = useMemo(() => {
    const sorted = [...rows].sort((a, b) => a.nextDays - b.nextDays);
    const pinned = sorted.find((e) => e.isPinned === 1);
    const heroEvent = pinned || sorted[0] || null;
    const rest = heroEvent ? sorted.filter((e) => e.id !== heroEvent.id) : [];
    return { hero: heroEvent, listEvents: rest };
  }, [rows]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await memorialService.remove(deleteTarget.id);
      if (res.success) {
        message.success('已删除');
        setDeleteTarget(null);
        if (selected) {
          window.history.back();
        } else {
          setSelected(null);
        }
        void loadList();
      } else {
        message.error(res.msg || '删除失败');
      }
    } catch {
      message.error('删除失败');
    }
  };

  const openEditor = (item: MemorialItem | null) => {
    setEditing(item);
    setEditorOpen(true);
    setSelected(null);
  };

  const noBinding = !bindId;

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-50/90 via-slate-50/90 to-teal-50/80 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 opacity-90" />
      <div className="pointer-events-none absolute top-0 left-0 w-full h-1/2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl" />

      <div className="relative z-10 flex flex-col flex-1 min-h-0">
        <MemorialTransparentHeader
          variant="title"
          title="倒数日"
          left={
            <button
              type="button"
              onClick={onBack}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white bg-white/60 shadow-sm backdrop-blur-md transition-colors hover:bg-white active:scale-95 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-5 w-5 text-slate-800 dark:text-white" />
            </button>
          }
          right={
            <button
              type="button"
              onClick={() => openEditor(null)}
              disabled={noBinding}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white bg-white/60 shadow-sm backdrop-blur-md transition-colors hover:bg-white active:scale-95 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:hover:bg-slate-800"
            >
              <Plus className="h-5 w-5 text-slate-800 dark:text-white" />
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-28 pt-1 relative">
          {noBinding ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500 text-sm">
              请先绑定另一半后再使用倒数日
            </div>
          ) : loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-slate-400 dark:text-slate-500 text-sm text-center px-4">
              暂无记录，点击右上角添加重要日子
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium -mt-0.5 mb-1">记录每一个重要的日子</p>

              {hero && (
                <MemorialHeroCard row={hero} onClick={() => setSelected(hero)} />
              )}

              {listEvents.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 pl-1 uppercase tracking-widest">
                    即将到来
                  </h3>
                  {listEvents.map((evt, idx) => (
                    <MemorialListCard
                      key={evt.id}
                      row={evt}
                      index={idx}
                      onClick={() => setSelected(evt)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selected && (
          <MemorialDetailPanel
            key={selected.id}
            row={selected}
            onBack={() => window.history.back()}
            onEdit={() => {
              const raw = rawItems.find((x) => x.id === selected.id);
              if (raw) openEditor(raw);
            }}
            onDelete={() => {
              const raw = rawItems.find((x) => x.id === selected.id);
              if (raw) setDeleteTarget(raw);
            }}
          />
        )}
      </AnimatePresence>

      <MemorialEditorPanel
        isOpen={editorOpen}
        editing={editing}
        onClose={() => window.history.back()}
        onSaved={() => {
          void loadList();
          window.history.back();
        }}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="删除记录"
        message={`确定要删除「${deleteTarget?.title || ''}」吗？`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmText="删除"
        confirmColor="bg-rose-500 hover:bg-rose-600"
      />
    </motion.div>
  );
}
