import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, Trash2, CalendarDays } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ImagePreview from '@/components/ui/ImagePreview';
import Modal from '@/components/ui/Modal';
import AddScheduleModal from './AddScheduleModal';
import scheduleService, { ScheduleItem } from '@/api/service/schedule';
import { useUserStore } from '@/store/user';
import { message } from '@/utils/pure/message';
import { yearMonthPicker } from '@/utils/pure/yearMonthPicker';

interface SchedulePageProps {
  onBack: () => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function SchedulePage({ onBack }: SchedulePageProps) {
  const { bindingRelations } = useUserStore();
  const bindId = bindingRelations?.id;

  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(today));

  const [eventDates, setEventDates] = useState<Set<string>>(new Set());
  const [dayEvents, setDayEvents] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ScheduleItem | null>(null);
  const [detailTarget, setDetailTarget] = useState<ScheduleItem | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 加载当月有事件的日期
  const loadMonthEvents = useCallback(async () => {
    if (!bindId) return;
    try {
      const res = await scheduleService.monthEvents(bindId, viewYear, viewMonth + 1);
      if (res.success) {
        setEventDates(new Set(res.data));
      }
    } catch (e) {
      console.error('加载月事件失败', e);
    }
  }, [bindId, viewYear, viewMonth]);

  // 加载选中日期的事件列表
  const loadDayEvents = useCallback(async () => {
    if (!bindId || !selectedDate) return;
    setLoading(true);
    try {
      const res = await scheduleService.list(bindId, selectedDate, selectedDate);
      if (res.success) {
        setDayEvents(res.data || []);
      }
    } catch (e) {
      console.error('加载日程失败', e);
    } finally {
      setLoading(false);
    }
  }, [bindId, selectedDate]);

  useEffect(() => { loadMonthEvents(); }, [loadMonthEvents]);
  useEffect(() => { loadDayEvents(); }, [loadDayEvents]);

  // 切换月份
  const goMonth = useCallback((delta: number) => {
    setViewMonth(prev => {
      let newMonth = prev + delta;
      let newYear = viewYear;
      if (newMonth < 0) { newMonth = 11; newYear--; }
      if (newMonth > 11) { newMonth = 0; newYear++; }
      setViewYear(newYear);
      return newMonth;
    });
  }, [viewYear]);

  // 点击年月标题，弹出老虎机选择器
  const handlePickYearMonth = useCallback(() => {
    yearMonthPicker.show({
      initialYear: viewYear,
      initialMonth: viewMonth + 1,
      minYear: viewYear - 10,
      maxYear: viewYear + 10,
      onSelect: ({ year, month }) => {
        setViewYear(year);
        setViewMonth(month - 1);
      },
    });
  }, [viewYear, viewMonth]);

  // 点击某天
  const handleDayClick = useCallback((day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    setSelectedDate(formatDate(d));
  }, [viewYear, viewMonth]);

  // 新增成功后刷新
  const handleAddSuccess = useCallback(() => {
    setShowAddModal(false);
    loadMonthEvents();
    loadDayEvents();
  }, [loadMonthEvents, loadDayEvents]);

  // 删除日程
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      const res = await scheduleService.remove(deleteTarget.id);
      if (res.success) {
        message.success('日程已删除');
        setDeleteTarget(null);
        loadMonthEvents();
        loadDayEvents();
      } else {
        message.error(res.msg || '删除失败');
      }
    } catch (e) {
      message.error('删除失败');
    }
  }, [deleteTarget, loadMonthEvents, loadDayEvents]);

  // 解析图片列表
  const parseImages = (images?: string | null): string[] => {
    if (!images) return [];
    try { return JSON.parse(images); } catch { return []; }
  };

  // 日历网格数据
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const todayStr = formatDate(today);

  const selectedDay = (() => {
    const parts = selectedDate.split('-');
    if (parseInt(parts[0]) === viewYear && parseInt(parts[1]) - 1 === viewMonth) {
      return parseInt(parts[2]);
    }
    return -1;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden"
    >
      <PageHeader title="日程" onBack={onBack} />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* 年月切换栏 */}
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => goMonth(-1)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handlePickYearMonth}
            className="text-lg font-bold text-slate-800 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors active:scale-95"
          >
            {viewYear}年 {viewMonth + 1}月
          </button>
          <button
            onClick={() => goMonth(1)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 日历网格 */}
        <div className="px-3 pb-2">
          <div className="grid grid-cols-7 gap-1">
            {/* 星期标题行 */}
            {WEEKDAYS.map(w => (
              <div key={w} className="py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {w}
              </div>
            ))}
            {/* 空白填充 */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {/* 日期格子 */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;
              const isSelected = day === selectedDay;
              const hasEvent = eventDates.has(dateStr);

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`
                    relative flex flex-col items-center justify-center aspect-square rounded-xl text-sm font-medium transition-all
                    ${isSelected
                      ? 'bg-cyan-500 text-white shadow-sm'
                      : isToday
                        ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }
                  `}
                >
                  <span>{day}</span>
                  {hasEvent && (
                    <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/80' : 'bg-cyan-400'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 分隔线 */}
        <div className="mx-4 border-t border-slate-100 dark:border-slate-800" />

        {/* 当日事件列表 */}
        <div className="px-4 py-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">
            {selectedDate} 的日程
          </h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-500" />
            </div>
          ) : dayEvents.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-slate-400 dark:text-slate-500">
              <CalendarDays className="w-10 h-10 mb-2 opacity-40" />
              <span className="text-sm">暂无日程</span>
            </div>
          ) : (
            <div className="space-y-3 pb-24">
              {dayEvents.map(ev => {
                const imgs = parseImages(ev.images);
                return (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setDetailTarget(ev)}
                    className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 cursor-pointer hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-slate-800 dark:text-white truncate">{ev.type}</h4>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(ev.eventTime)}
                          </span>
                          {ev.location && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3.5 h-3.5" />
                              {ev.location}
                            </span>
                          )}
                        </div>
                        {ev.description && (
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{ev.description}</p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(ev);
                        }}
                        className="ml-2 p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {/* 图片展示（点击可预览） */}
                    {imgs.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {imgs.map((url, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImage(url);
                            }}
                            className="shrink-0"
                          >
                            <img src={url} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-600 hover:opacity-80 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 右下角浮动添加按钮 */}
      <button
        onClick={() => setShowAddModal(true)}
        className="absolute bottom-6 right-5 z-10 w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/30 flex items-center justify-center transition-all active:scale-90"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* 新增日程弹窗 */}
      <AddScheduleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
        defaultDate={selectedDate}
      />

      {/* 删除确认弹窗 */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="删除日程"
        message={`确定要删除「${deleteTarget?.type || ''}」吗？`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmText="删除"
        confirmColor="bg-rose-500 hover:bg-rose-600"
      />

      {/* 日程详情弹窗 */}
      <Modal
        isOpen={!!detailTarget}
        onClose={() => setDetailTarget(null)}
        title={detailTarget?.type || '日程详情'}
      >
        {detailTarget && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
              <span className="font-semibold">时间：</span>
              {detailTarget.eventTime?.replace('T', ' ').slice(0, 16)}
            </div>
            {detailTarget.location && (
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 break-all">
                <span className="font-semibold">地点：</span>
                {detailTarget.location}
              </div>
            )}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
              <span className="font-semibold">提醒：</span>
              {detailTarget.popupRemind === 1 ? '当天弹窗提醒已开启' : '当天弹窗提醒已关闭'}
            </div>
            {detailTarget.description && (
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap wrap-break-word">
                <span className="font-semibold">描述：</span>
                {detailTarget.description}
              </div>
            )}
            {parseImages(detailTarget.images).length > 0 && (
              <div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">图片</div>
                <div className="flex gap-2 flex-wrap">
                  {parseImages(detailTarget.images).map((url, idx) => (
                    <button key={idx} onClick={() => {
                      setDetailTarget(null)
                      setShowAddModal(false)
                      setPreviewImage(url)
                    }} className="shrink-0">
                      <img
                        src={url}
                        alt=""
                        className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-600 hover:opacity-80 transition-opacity"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 图片全屏预览 */}
      <ImagePreview
        src={previewImage}
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </motion.div>
  );
}
