/**
 * 命令式日期选择器（Tailwind：玻璃态模糊 + 半透明卡片，风格对齐底部导航栏）
 */
export interface DatePickerOptions {
  onSelect?: (date: Date) => void;
  onCancel?: () => void;
  initialDate?: Date;
  accentColor?: string;
  lang?: 'zh' | 'en';
}

const I18N = {
  zh: {
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    yearSuffix: '年',
    prevYear: '上一年',
    prevMonth: '上个月',
    nextMonth: '下个月',
    nextYear: '下一年',
  },
  en: {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    yearSuffix: '',
    prevYear: 'Prev Year',
    prevMonth: 'Prev Month',
    nextMonth: 'Next Month',
    nextYear: 'Next Year',
  },
};

/** 导航箭头：无底色，与日期格子一致（仅选中项才有彩色底） */
const NAV_BTN =
  'dp-nav-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-0 bg-transparent text-slate-500 shadow-none transition-colors hover:text-slate-900 active:scale-95 dark:text-slate-400 dark:hover:text-slate-100';

const MODAL_SHELL =
  'dp-datepicker-modal relative z-10 w-[min(360px,92vw)] max-h-[90vh] overflow-y-auto rounded-3xl border border-white/60 bg-white/80 p-5 text-slate-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100 dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.45)]';

/** 日视图顶栏：仅左右「上月/下月」，中间年月并排（无内层卡片） */
const DAY_HEADER_ROW =
  'flex items-center justify-between gap-2';

/** 与日历网格的分隔（单层卡片内用细线，不套第二层卡片） */
const CAL_SECTION_TOP =
  'mt-4 border-t border-slate-200/60 pt-4 dark:border-white/10';

/** 月/年选择顶栏（无内层卡片） */
const PICKER_HEADER_ROW = 'mb-4 flex items-center justify-between gap-2';

/** 年月标题：无底色，可点进年/月选择 */
const TRIGGER_YEAR =
  'dp-trigger-year rounded-lg border-0 bg-transparent px-1.5 py-0.5 text-lg font-bold leading-tight text-slate-800 transition-opacity hover:opacity-80 active:opacity-70 dark:text-slate-100';
const TRIGGER_MONTH =
  'dp-trigger-month rounded-lg border-0 bg-transparent px-1.5 py-0.5 text-lg font-bold leading-tight text-slate-800 transition-opacity hover:opacity-80 active:opacity-70 dark:text-slate-100';

/** 月/年宫格：默认无底色，仅选中项用 accent 内联样式（与日期一致） */
const ITEM_QUICK_BASE =
  'dp-item-quick rounded-2xl border border-transparent bg-transparent py-3 text-center text-sm font-semibold text-slate-800 transition-opacity hover:opacity-85 active:scale-[0.98] dark:text-slate-100';

/** 根据背景色选可读的前景色（避免浅底白字） */
function accentForegroundForBackground(bg: string): string {
  const h = bg.trim().toLowerCase();
  if (h === '#e0f2fe') return '#0369a1';
  if (h === '#d1fae5' || h.includes('d1fae')) return '#065f46';
  if (h.startsWith('#')) {
    const n = parseInt(h.slice(1), 16);
    if (!Number.isNaN(n)) {
      const r = (n >> 16) & 255;
      const g = (n >> 8) & 255;
      const b = n & 255;
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.65 ? '#0f172a' : '#ffffff';
    }
  }
  return '#ffffff';
}

class DatePickerManager {
  private viewDate: Date = new Date();
  private selectedDate: Date | null = null;
  private accentColor: string = '#e0f2fe';
  private accentTextColor: string = '#0369a1';
  private viewMode: 'days' | 'months' | 'years' = 'days';
  private yearRangeStart: number = 0;

  private getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  private getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
  }

  show(options: DatePickerOptions) {
    const {
      onSelect,
      onCancel,
      initialDate = new Date(),
      accentColor = '#e0f2fe',
      lang = 'zh',
    } = options;

    const t = I18N[lang];
    this.selectedDate = initialDate;
    this.viewDate = new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
    this.accentColor = accentColor;
    this.viewMode = 'days';
    this.accentTextColor = accentForegroundForBackground(accentColor);

    const backdrop = document.createElement('div');
    backdrop.className =
      'dp-datepicker-backdrop fixed inset-0 z-[10000] flex items-center justify-center bg-black/35 font-sans opacity-0 backdrop-blur-md transition-opacity duration-300 dark:bg-black/50';
    document.body.appendChild(backdrop);

    const render = () => {
      const year = this.viewDate.getFullYear();
      const month = this.viewDate.getMonth();
      const monthNames = t.months;
      const weekdays = t.weekdays;

      let content = '';

      if (this.viewMode === 'days') {
        const firstDay = this.getFirstDayOfMonth(year, month);
        const daysInMonth = this.getDaysInMonth(year, month);

        content = `
          <div class="${DAY_HEADER_ROW}">
            <button type="button" class="${NAV_BTN} dp-prev-month shrink-0" title="${t.prevMonth}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div class="flex min-w-0 flex-1 items-center justify-center gap-1.5 sm:gap-2">
              <button type="button" class="${TRIGGER_YEAR}">${year}${t.yearSuffix}</button>
              <button type="button" class="${TRIGGER_MONTH}">${monthNames[month]}</button>
            </div>
            <button type="button" class="${NAV_BTN} dp-next-month shrink-0" title="${t.nextMonth}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          <div class="${CAL_SECTION_TOP}">
            <div class="grid grid-cols-7 gap-1">
            ${weekdays
              .map(
                (w) =>
                  `<div class="py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">${w}</div>`,
              )
              .join('')}
            ${Array(firstDay)
              .fill(0)
              .map(() => `<div class="dp-day-empty"></div>`)
              .join('')}
            ${Array(daysInMonth)
              .fill(0)
              .map((_, i) => {
                const day = i + 1;
                const isSelected =
                  this.selectedDate &&
                  this.selectedDate.getDate() === day &&
                  this.selectedDate.getMonth() === month &&
                  this.selectedDate.getFullYear() === year;
                const isToday =
                  new Date().getDate() === day &&
                  new Date().getMonth() === month &&
                  new Date().getFullYear() === year;
                const selStyle = isSelected
                  ? `background-color:${this.accentColor};color:${this.accentTextColor};`
                  : '';
                const base =
                  'dp-day flex aspect-square cursor-pointer items-center justify-center rounded-xl border border-transparent bg-transparent text-sm font-medium text-slate-800 transition-transform hover:bg-slate-900/[0.06] active:scale-95 dark:text-slate-100 dark:hover:bg-white/[0.08]';
                const todayCls =
                  isToday && !isSelected
                    ? ' relative font-bold text-cyan-600 dark:text-cyan-400 after:absolute after:bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-cyan-500'
                    : '';
                return `<button type="button" class="${base} ${isSelected ? 'dp-day-selected shadow-sm' : ''} ${todayCls}" data-day="${day}" style="${selStyle}">${day}</button>`;
              })
              .join('')}
            </div>
          </div>
        `;
      } else if (this.viewMode === 'months') {
        content = `
          <div class="${PICKER_HEADER_ROW}">
            <button type="button" class="${NAV_BTN} dp-prev-year" title="${t.prevYear}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17-5-5 5-5m7 10-5-5 5-5"/></svg>
            </button>
            <button type="button" class="${TRIGGER_YEAR} px-2">${year}${t.yearSuffix}</button>
            <button type="button" class="${NAV_BTN} dp-next-year" title="${t.nextYear}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m13 17 5-5-5-5M6 17l5-5-5-5"/></svg>
            </button>
          </div>
          <div class="grid grid-cols-3 gap-2">
            ${monthNames
              .map((name, i) => {
                const isActive =
                  this.selectedDate &&
                  this.selectedDate.getMonth() === i &&
                  this.selectedDate.getFullYear() === year;
                const style = isActive
                  ? `background-color:${this.accentColor};color:${this.accentTextColor};`
                  : '';
                return `<button type="button" class="${ITEM_QUICK_BASE}" data-month="${i}" style="${style}">${name}</button>`;
              })
              .join('')}
          </div>
        `;
      } else if (this.viewMode === 'years') {
        if (this.yearRangeStart === 0) this.yearRangeStart = year - 4;
        const start = this.yearRangeStart;
        const years = Array.from({ length: 12 }, (_, i) => start + i);

        content = `
          <div class="${PICKER_HEADER_ROW}">
            <button type="button" class="${NAV_BTN} dp-prev-range" title="${t.prevYear}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span class="min-w-32 text-center text-base font-bold text-slate-900 dark:text-white">${start} – ${start + 11}</span>
            <button type="button" class="${NAV_BTN} dp-next-range" title="${t.nextYear}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6"/></svg>
            </button>
          </div>
          <div class="grid grid-cols-3 gap-2">
            ${years
              .map((y) => {
                const isActive = this.selectedDate && this.selectedDate.getFullYear() === y;
                const style = isActive
                  ? `background-color:${this.accentColor};color:${this.accentTextColor};`
                  : '';
                return `<button type="button" class="${ITEM_QUICK_BASE}" data-year="${y}" style="${style}">${y}</button>`;
              })
              .join('')}
          </div>
        `;
      }

      backdrop.innerHTML = `
        <div class="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div class="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-cyan-400/25 blur-3xl dark:bg-cyan-500/20"></div>
          <div class="absolute -right-8 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-pink-400/20 blur-3xl dark:bg-pink-500/15"></div>
          <div class="absolute bottom-8 left-1/4 h-48 w-48 rounded-full bg-amber-300/20 blur-3xl dark:bg-amber-500/15"></div>
        </div>
        <div class="${MODAL_SHELL}">${content}</div>`;

      if (this.viewMode === 'days') {
        backdrop.querySelector('.dp-prev-month')!.addEventListener('click', (e) => {
          e.stopPropagation();
          this.viewDate.setMonth(month - 1);
          render();
        });
        backdrop.querySelector('.dp-next-month')!.addEventListener('click', (e) => {
          e.stopPropagation();
          this.viewDate.setMonth(month + 1);
          render();
        });

        backdrop.querySelector('.dp-trigger-year')!.addEventListener('click', (e) => {
          e.stopPropagation();
          this.viewMode = 'years';
          this.yearRangeStart = year - 4;
          render();
        });
        backdrop.querySelector('.dp-trigger-month')!.addEventListener('click', (e) => {
          e.stopPropagation();
          this.viewMode = 'months';
          render();
        });

        backdrop.querySelectorAll('.dp-day:not(.dp-day-empty)').forEach((el) => {
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            const day = parseInt((el as HTMLElement).dataset.day!, 10);
            const finalDate = new Date(year, month, day);
            this.close(backdrop);
            if (onSelect) onSelect(finalDate);
          });
        });
      } else if (this.viewMode === 'months') {
        backdrop.querySelector('.dp-prev-year')!.addEventListener('click', (e) => {
          e.stopPropagation();
          this.viewDate.setFullYear(year - 1);
          render();
        });
        backdrop.querySelector('.dp-next-year')!.addEventListener('click', (e) => {
          e.stopPropagation();
          this.viewDate.setFullYear(year + 1);
          render();
        });
        const yBtn = backdrop.querySelector('.dp-trigger-year');
        if (yBtn) {
          yBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.viewMode = 'years';
            this.yearRangeStart = year - 4;
            render();
          });
        }

        backdrop.querySelectorAll('[data-month]').forEach((el) => {
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            this.viewDate.setMonth(parseInt((el as HTMLElement).dataset.month!, 10));
            this.viewMode = 'days';
            render();
          });
        });
      } else if (this.viewMode === 'years') {
        backdrop.querySelector('.dp-prev-range')!.addEventListener('click', (e) => {
          e.stopPropagation();
          this.yearRangeStart -= 12;
          render();
        });
        backdrop.querySelector('.dp-next-range')!.addEventListener('click', (e) => {
          e.stopPropagation();
          this.yearRangeStart += 12;
          render();
        });

        backdrop.querySelectorAll('[data-year]').forEach((el) => {
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            this.viewDate.setFullYear(parseInt((el as HTMLElement).dataset.year!, 10));
            this.viewMode = 'months';
            render();
          });
        });
      }

      backdrop.onclick = () => {
        this.close(backdrop);
        if (onCancel) onCancel();
      };
      const modalEl = backdrop.querySelector('.dp-datepicker-modal');
      if (modalEl) {
        (modalEl as HTMLElement).onclick = (e) => e.stopPropagation();
      }
    };

    render();
    requestAnimationFrame(() => {
      backdrop.classList.remove('opacity-0');
      backdrop.classList.add('opacity-100');
    });

    return backdrop;
  }

  private close(el: HTMLElement) {
    el.classList.remove('opacity-100');
    el.classList.add('opacity-0');
    setTimeout(() => {
      if (el.parentNode === document.body) {
        document.body.removeChild(el);
      }
    }, 300);
  }
}

export const datePicker = new DatePickerManager();
