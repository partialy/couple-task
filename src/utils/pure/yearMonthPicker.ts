/**
 * 命令式年月选择器（老虎机 / 滚筒风格，风格对齐 timePicker）
 * 支持滚动、点击、上下箭头三种交互方式
 */
export interface YearMonthPickerOptions {
  onSelect?: (result: { year: number; month: number }) => void;
  onCancel?: () => void;
  initialYear?: number;
  initialMonth?: number;
  /** 可选年份范围起始，默认当前年-20 */
  minYear?: number;
  /** 可选年份范围结束，默认当前年+20 */
  maxYear?: number;
  accentColor?: string;
  lang?: 'zh' | 'en';
}

const I18N = {
  zh: {
    title: '选择年月',
    confirm: '确定',
    cancel: '取消',
    year: '年',
    month: '月',
  },
  en: {
    title: 'Select Year & Month',
    confirm: 'Confirm',
    cancel: 'Cancel',
    year: '',
    month: '',
  },
};

class YearMonthPickerManager {
  private accentColor: string = '#e0f2fe';
  private accentTextColor: string = '#0369a1';

  show(options: YearMonthPickerOptions) {
    const now = new Date();
    const {
      onSelect,
      onCancel,
      initialYear = now.getFullYear(),
      initialMonth = now.getMonth() + 1,
      minYear = now.getFullYear() - 20,
      maxYear = now.getFullYear() + 20,
      accentColor = '#e0f2fe',
      lang = 'zh',
    } = options;

    const t = I18N[lang];
    this.accentColor = accentColor;
    this.accentTextColor = accentColor === '#e0f2fe' ? '#0369a1' : '#ffffff';
    const confirmBg = accentColor === '#e0f2fe' ? '#2563eb' : accentColor;
    const confirmText = this.accentTextColor === '#0369a1' ? '#ffffff' : this.accentTextColor;

    const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
    let selectedYear = initialYear;
    let selectedMonth = initialMonth;

    const backdrop = document.createElement('div');
    backdrop.className =
      'fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 opacity-0 font-sans';

    backdrop.innerHTML = `
      <div class="ymp-modal bg-white dark:bg-slate-900 w-[340px] rounded-[40px] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 transition-all duration-500 transform scale-95 opacity-0 select-none">
        <div class="text-center mb-6">
          <h3 class="font-display text-xl font-bold text-slate-900 dark:text-slate-100 m-0 tracking-tight">${t.title}</h3>
        </div>

        <div class="relative flex justify-center gap-2 mb-8 h-[210px] bg-slate-50 dark:bg-slate-800/50 rounded-[24px] border border-slate-200 dark:border-slate-700 overflow-hidden">
          <!-- 居中选中行高亮条 -->
          <div class="absolute top-1/2 left-2 right-2 h-12 -translate-y-1/2 bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 pointer-events-none z-10 rounded-xl shadow-sm"></div>

          <!-- 年份列 -->
          <div class="ymp-year-col no-scrollbar flex-1 overflow-y-auto overflow-x-hidden scrollbar-none relative z-20 snap-y snap-mandatory scroll-smooth">
            <div class="h-[81px]"></div>
            ${years
              .map(
                (y) =>
                  `<div class="ymp-item h-12 flex items-center justify-center font-mono text-lg font-bold transition-all duration-300 snap-center cursor-pointer" data-year="${y}">${y}${t.year}</div>`,
              )
              .join('')}
            <div class="h-[81px]"></div>
          </div>

          <!-- 分隔 -->
          <div class="flex items-center text-slate-300 dark:text-slate-600 font-bold z-20">/</div>

          <!-- 月份列 -->
          <div class="ymp-month-col no-scrollbar flex-1 overflow-y-auto overflow-x-hidden scrollbar-none relative z-20 snap-y snap-mandatory scroll-smooth">
            <div class="h-[81px]"></div>
            ${Array.from({ length: 12 }, (_, i) => i + 1)
              .map(
                (m) =>
                  `<div class="ymp-item h-12 flex items-center justify-center font-mono text-lg font-bold transition-all duration-300 snap-center cursor-pointer" data-month="${m}">${m < 10 ? '0' + m : m}${t.month}</div>`,
              )
              .join('')}
            <div class="h-[81px]"></div>
          </div>
        </div>

        <div class="flex gap-3">
          <button class="ymp-btn-cancel flex-1 py-3.5 rounded-[18px] border-none font-display text-sm font-bold cursor-pointer transition-all duration-300 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:translate-y-[-2px] hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100">${t.cancel}</button>
          <button class="ymp-btn-confirm flex-1 py-3.5 rounded-[18px] border-none font-display text-sm font-bold cursor-pointer transition-all duration-300 text-white hover:translate-y-[-2px] hover:shadow-xl hover:opacity-90" style="background-color:${confirmBg};color:${confirmText}">${t.confirm}</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const modal = backdrop.querySelector('.ymp-modal') as HTMLElement;
    const yearCol = modal.querySelector('.ymp-year-col') as HTMLElement;
    const monthCol = modal.querySelector('.ymp-month-col') as HTMLElement;

    // 更新选中态样式 + 可选滚动
    const updateUI = (skipScroll = false) => {
      const updateCol = (
        col: HTMLElement,
        value: number,
        attr: string,
      ) => {
        col.querySelectorAll('.ymp-item').forEach((el) => {
          const v = parseInt((el as HTMLElement).dataset[attr]!);
          const isSel = v === value;
          el.className = `ymp-item h-12 flex items-center justify-center font-mono text-lg font-bold transition-all duration-300 snap-center cursor-pointer ${
            isSel
              ? 'text-blue-600 dark:text-blue-400 scale-110'
              : 'text-slate-400 dark:text-slate-500 opacity-40'
          }`;
        });

        if (!skipScroll) {
          const selEl = col.querySelector(`[data-${attr}="${value}"]`) as HTMLElement | null;
          if (selEl) {
            col.scrollTop = selEl.offsetTop - col.clientHeight / 2 + selEl.clientHeight / 2;
          }
        }
      };

      updateCol(yearCol, selectedYear, 'year');
      updateCol(monthCol, selectedMonth, 'month');
    };

    // 滚动吸附监听
    const setupScrollSnap = (col: HTMLElement, attr: string) => {
      let timer: ReturnType<typeof setTimeout>;
      col.addEventListener('scroll', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          const center = col.scrollTop + col.clientHeight / 2;
          let closest: HTMLElement | null = null;
          let minDiff = Infinity;
          col.querySelectorAll('.ymp-item').forEach((el) => {
            const mid = (el as HTMLElement).offsetTop + (el as HTMLElement).clientHeight / 2;
            const diff = Math.abs(center - mid);
            if (diff < minDiff) {
              minDiff = diff;
              closest = el as HTMLElement;
            }
          });
          if (closest) {
            const val = parseInt((closest as HTMLElement).dataset[attr]!);
            let changed = false;
            if (attr === 'year' && selectedYear !== val) { selectedYear = val; changed = true; }
            if (attr === 'month' && selectedMonth !== val) { selectedMonth = val; changed = true; }
            if (changed) updateUI(true);
          }
        }, 100);
      });
    };

    setupScrollSnap(yearCol, 'year');
    setupScrollSnap(monthCol, 'month');

    // 点击直接选中
    const setupClick = (col: HTMLElement, attr: string) => {
      col.querySelectorAll('.ymp-item').forEach((el) => {
        el.addEventListener('click', () => {
          const val = parseInt((el as HTMLElement).dataset[attr]!);
          if (attr === 'year') selectedYear = val;
          if (attr === 'month') selectedMonth = val;
          updateUI();
        });
      });
    };

    setupClick(yearCol, 'year');
    setupClick(monthCol, 'month');

    // 确定 / 取消
    modal.querySelector('.ymp-btn-confirm')!.addEventListener('click', () => {
      this.close(backdrop);
      if (onSelect) onSelect({ year: selectedYear, month: selectedMonth });
    });

    modal.querySelector('.ymp-btn-cancel')!.addEventListener('click', () => {
      this.close(backdrop);
      if (onCancel) onCancel();
    });

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        this.close(backdrop);
        if (onCancel) onCancel();
      }
    });

    // 初始渲染 + 入场动画
    updateUI();
    requestAnimationFrame(() => {
      backdrop.classList.remove('opacity-0');
      modal.classList.remove('scale-95', 'opacity-0');
      modal.classList.add('scale-100', 'opacity-100');
    });

    return backdrop;
  }

  private close(el: HTMLElement) {
    const modal = el.querySelector('.ymp-modal') as HTMLElement;
    if (modal) {
      modal.classList.add('scale-95', 'opacity-0');
    }
    el.classList.add('opacity-0');
    setTimeout(() => {
      if (el.parentNode === document.body) {
        document.body.removeChild(el);
      }
    }, 300);
  }
}

export const yearMonthPicker = new YearMonthPickerManager();
