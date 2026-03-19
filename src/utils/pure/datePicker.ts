export interface DatePickerOptions {
  onSelect?: (date: Date) => void;
  onCancel?: () => void;
  initialDate?: Date;
  accentColor?: string; // Default light blue
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
  }
};

const DP_STYLES = `
  .dp-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--dp-backdrop);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: var(--font-sans);
  }

  .dp-backdrop.dp-show {
    opacity: 1;
  }

  .dp-modal {
    background: var(--dp-bg);
    width: 360px;
    border-radius: 40px;
    padding: 32px;
    box-shadow: 0 40px 80px -15px var(--dp-shadow);
    transform: scale(0.95) translateY(30px);
    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    border: 1px solid var(--dp-border);
    user-select: none;
  }

  .dp-backdrop.dp-show .dp-modal {
    transform: scale(1) translateY(0);
  }

  .dp-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .dp-nav-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--dp-text-secondary);
    transition: all 0.2s;
  }

  .dp-nav-btn:hover {
    background: var(--dp-secondary-bg);
    color: var(--dp-text);
    transform: scale(1.1);
  }

  .dp-current-view {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    color: var(--dp-text);
    display: flex;
    gap: 8px;
    letter-spacing: -0.02em;
  }

  .dp-view-trigger {
    padding: 4px 10px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
  }

  .dp-view-trigger:hover {
    background: var(--dp-secondary-bg);
    border-color: var(--dp-border);
    color: var(--dp-accent);
  }

  .dp-grid-months, .dp-grid-years {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding: 16px 0;
  }

  .dp-item-quick {
    padding: 16px 0;
    text-align: center;
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 600;
    color: var(--dp-text);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    border: 1px solid transparent;
  }

  .dp-item-quick:hover {
    background: var(--dp-secondary-bg);
    border-color: var(--dp-border);
    transform: translateY(-2px);
  }

  .dp-item-active {
    color: white !important;
    box-shadow: 0 8px 16px -4px var(--dp-shadow);
  }

  .dp-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
  }

  .dp-weekday {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 700;
    color: var(--dp-text-secondary);
    text-align: center;
    padding: 12px 0;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    opacity: 0.5;
  }

  .dp-day {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 500;
    color: var(--dp-text);
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    border: 1px solid transparent;
  }

  .dp-day:hover:not(.dp-day-empty):not(.dp-day-selected) {
    background: var(--dp-secondary-bg);
    border-color: var(--dp-border);
    transform: scale(1.1);
  }

  .dp-day-empty {
    cursor: default;
  }

  .dp-day-selected {
    color: white !important;
    box-shadow: 0 8px 16px -4px var(--dp-shadow);
    font-weight: 700;
  }

  .dp-day-today:not(.dp-day-selected) {
    color: var(--dp-accent);
    font-weight: 800;
    position: relative;
  }

  .dp-day-today:not(.dp-day-selected)::after {
    content: '';
    position: absolute;
    bottom: 6px;
    width: 4px;
    height: 4px;
    background: var(--dp-accent);
    border-radius: 50%;
  }
`;

class DatePickerManager {
  private viewDate: Date = new Date();
  private selectedDate: Date | null = null;
  private accentColor: string = '#e0f2fe'; // Default light blue background
  private accentTextColor: string = '#0369a1'; // Default dark blue text
  private viewMode: 'days' | 'months' | 'years' = 'days';
  private yearRangeStart: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.injectStyles();
    }
  }

  private injectStyles() {
    if (document.getElementById('dp-utility-styles')) return;
    const styleTag = document.createElement('style');
    styleTag.id = 'dp-utility-styles';
    styleTag.textContent = DP_STYLES;
    document.head.appendChild(styleTag);
  }

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
      lang = 'zh'
    } = options;

    const t = I18N[lang];
    this.selectedDate = initialDate;
    this.viewDate = new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
    this.accentColor = accentColor;
    this.viewMode = 'days';
    
    this.accentTextColor = accentColor === '#e0f2fe' ? '#0369a1' : '#ffffff';

    const backdrop = document.createElement('div');
    backdrop.className = 'dp-backdrop';
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
          <div class="dp-header">
            <div style="display: flex; gap: 4px;">
              <button class="dp-nav-btn dp-prev-year" title="${t.prevYear}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17-5-5 5-5m7 10-5-5 5-5"/></svg>
              </button>
              <button class="dp-nav-btn dp-prev-month" title="${t.prevMonth}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
            </div>
            <div class="dp-current-view">
              <span class="dp-view-trigger dp-trigger-year">${year}${t.yearSuffix}</span>
              <span class="dp-view-trigger dp-trigger-month">${monthNames[month]}</span>
            </div>
            <div style="display: flex; gap: 4px;">
              <button class="dp-nav-btn dp-next-month" title="${t.nextMonth}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
              <button class="dp-nav-btn dp-next-year" title="${t.nextYear}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m13 17 5-5-5-5M6 17l5-5-5-5"/></svg>
              </button>
            </div>
          </div>
          <div class="dp-grid">
            ${weekdays.map(w => `<div class="dp-weekday">${w}</div>`).join('')}
            ${Array(firstDay).fill(0).map(() => `<div class="dp-day dp-day-empty"></div>`).join('')}
            ${Array(daysInMonth).fill(0).map((_, i) => {
              const day = i + 1;
              const isSelected = this.selectedDate && 
                               this.selectedDate.getDate() === day && 
                               this.selectedDate.getMonth() === month && 
                               this.selectedDate.getFullYear() === year;
              const isToday = new Date().getDate() === day && 
                            new Date().getMonth() === month && 
                            new Date().getFullYear() === year;
              
              const style = isSelected ? `background-color: ${this.accentColor}; color: ${this.accentTextColor} !important;` : '';
              return `<div class="dp-day ${isSelected ? 'dp-day-selected' : ''} ${isToday ? 'dp-day-today' : ''}" data-day="${day}" style="${style}">${day}</div>`;
            }).join('')}
          </div>
        `;
      } else if (this.viewMode === 'months') {
        content = `
          <div class="dp-header">
            <button class="dp-nav-btn dp-prev-year">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17-5-5 5-5m7 10-5-5 5-5"/></svg>
            </button>
            <div class="dp-current-view">
              <span class="dp-view-trigger dp-trigger-year">${year}${t.yearSuffix}</span>
            </div>
            <button class="dp-nav-btn dp-next-year">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m13 17 5-5-5-5M6 17l5-5-5-5"/></svg>
            </button>
          </div>
          <div class="dp-grid-months">
            ${monthNames.map((name, i) => {
              const isActive = this.selectedDate && this.selectedDate.getMonth() === i && this.selectedDate.getFullYear() === year;
              const style = isActive ? `background-color: ${this.accentColor}; color: ${this.accentTextColor} !important;` : '';
              return `<div class="dp-item-quick ${isActive ? 'dp-item-active' : ''}" data-month="${i}" style="${style}">${name}</div>`;
            }).join('')}
          </div>
        `;
      } else if (this.viewMode === 'years') {
        if (this.yearRangeStart === 0) this.yearRangeStart = year - 4;
        const start = this.yearRangeStart;
        const years = Array.from({ length: 12 }, (_, i) => start + i);
        
        content = `
          <div class="dp-header">
            <button class="dp-nav-btn dp-prev-range">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div class="dp-current-view">${start} - ${start + 11}</div>
            <button class="dp-nav-btn dp-next-range">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6"/></svg>
            </button>
          </div>
          <div class="dp-grid-years">
            ${years.map(y => {
              const isActive = this.selectedDate && this.selectedDate.getFullYear() === y;
              const style = isActive ? `background-color: ${this.accentColor}; color: ${this.accentTextColor} !important;` : '';
              return `<div class="dp-item-quick ${isActive ? 'dp-item-active' : ''}" data-year="${y}" style="${style}">${y}</div>`;
            }).join('')}
          </div>
        `;
      }

      backdrop.innerHTML = `<div class="dp-modal">${content}</div>`;

      // Event Listeners
      if (this.viewMode === 'days') {
        backdrop.querySelector('.dp-prev-year')!.addEventListener('click', (e) => { e.stopPropagation(); this.viewDate.setFullYear(year - 1); render(); });
        backdrop.querySelector('.dp-prev-month')!.addEventListener('click', (e) => { e.stopPropagation(); this.viewDate.setMonth(month - 1); render(); });
        backdrop.querySelector('.dp-next-month')!.addEventListener('click', (e) => { e.stopPropagation(); this.viewDate.setMonth(month + 1); render(); });
        backdrop.querySelector('.dp-next-year')!.addEventListener('click', (e) => { e.stopPropagation(); this.viewDate.setFullYear(year + 1); render(); });
        
        backdrop.querySelector('.dp-trigger-year')!.addEventListener('click', (e) => { e.stopPropagation(); this.viewMode = 'years'; this.yearRangeStart = year - 4; render(); });
        backdrop.querySelector('.dp-trigger-month')!.addEventListener('click', (e) => { e.stopPropagation(); this.viewMode = 'months'; render(); });

        backdrop.querySelectorAll('.dp-day:not(.dp-day-empty)').forEach(el => {
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            const day = parseInt((el as HTMLElement).dataset.day!);
            const finalDate = new Date(year, month, day);
            this.close(backdrop);
            if (onSelect) onSelect(finalDate);
          });
        });
      } else if (this.viewMode === 'months') {
        backdrop.querySelector('.dp-prev-year')!.addEventListener('click', (e) => { e.stopPropagation(); this.viewDate.setFullYear(year - 1); render(); });
        backdrop.querySelector('.dp-next-year')!.addEventListener('click', (e) => { e.stopPropagation(); this.viewDate.setFullYear(year + 1); render(); });
        backdrop.querySelector('.dp-trigger-year')!.addEventListener('click', (e) => { e.stopPropagation(); this.viewMode = 'years'; this.yearRangeStart = year - 4; render(); });

        backdrop.querySelectorAll('[data-month]').forEach(el => {
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            this.viewDate.setMonth(parseInt((el as HTMLElement).dataset.month!));
            this.viewMode = 'days';
            render();
          });
        });
      } else if (this.viewMode === 'years') {
        backdrop.querySelector('.dp-prev-range')!.addEventListener('click', (e) => { e.stopPropagation(); this.yearRangeStart -= 12; render(); });
        backdrop.querySelector('.dp-next-range')!.addEventListener('click', (e) => { e.stopPropagation(); this.yearRangeStart += 12; render(); });

        backdrop.querySelectorAll('[data-year]').forEach(el => {
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            this.viewDate.setFullYear(parseInt((el as HTMLElement).dataset.year!));
            this.viewMode = 'months';
            render();
          });
        });
      }

      backdrop.addEventListener('click', () => {
        this.close(backdrop);
        if (onCancel) onCancel();
      });

      backdrop.querySelector('.dp-modal')!.addEventListener('click', (e) => e.stopPropagation());
    };

    render();
    requestAnimationFrame(() => backdrop.classList.add('dp-show'));

    return backdrop;
  }

  private close(el: HTMLElement) {
    el.classList.remove('dp-show');
    setTimeout(() => {
      if (el.parentNode === document.body) {
        document.body.removeChild(el);
      }
    }, 300);
  }
}

export const datePicker = new DatePickerManager();
