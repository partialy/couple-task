export interface TimePickerOptions {
  onSelect?: (time: { hour: number; minute: number; second: number }) => void;
  onCancel?: () => void;
  initialTime?: { hour: number; minute: number; second: number };
  accentColor?: string;
  lang?: 'zh' | 'en';
}

const I18N = {
  zh: {
    title: '选择时间',
    confirm: '确定',
    cancel: '取消'
  },
  en: {
    title: 'Select Time',
    confirm: 'Confirm',
    cancel: 'Cancel'
  }
};

class TimePickerManager {
  private accentColor: string = '#e0f2fe';
  private accentTextColor: string = '#0369a1';

  constructor() {}

  show(options: TimePickerOptions) {
    const { 
      onSelect, 
      onCancel,
      initialTime = { 
        hour: new Date().getHours(), 
        minute: new Date().getMinutes(),
        second: new Date().getSeconds()
      },
      accentColor = '#e0f2fe',
      lang = 'zh'
    } = options;

    const t = I18N[lang];
    this.accentColor = accentColor;
    this.accentTextColor = accentColor === '#e0f2fe' ? '#0369a1' : '#ffffff';

    let selectedHour = initialTime.hour;
    let selectedMinute = initialTime.minute;
    let selectedSecond = initialTime.second;

    const backdrop = document.createElement('div');
    backdrop.className = 'fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 opacity-0 font-sans';
    backdrop.innerHTML = `
      <div class="tp-modal bg-white dark:bg-slate-900 w-[340px] rounded-[40px] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 transition-all duration-500 transform scale-95 opacity-0 select-none">
        <div class="text-center mb-6">
          <h3 class="font-display text-xl font-bold text-slate-900 dark:text-slate-100 m-0 tracking-tight">${t.title}</h3>
        </div>
        
        <div class="relative flex justify-center gap-2 mb-8 h-[210px] bg-slate-50 dark:bg-slate-800/50 rounded-[24px] border border-slate-200 dark:border-slate-700 overflow-hidden">
          <!-- Selection Overlay -->
          <div class="absolute top-1/2 left-2 right-2 h-12 -translate-y-1/2 bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 pointer-events-none z-10 rounded-xl shadow-sm"></div>
          
          <!-- Hour Column -->
          <div class="tp-hour-col no-scrollbar flex-1 overflow-y-auto overflow-x-hidden scrollbar-none relative z-20 snap-y snap-mandatory scroll-smooth">
            <div class="h-[81px]"></div> <!-- Spacer -->
            ${Array.from({ length: 24 }).map((_, i) => `
              <div class="tp-item h-12 flex items-center justify-center font-mono text-lg font-bold transition-all duration-300 snap-center cursor-pointer" data-hour="${i}">${i < 10 ? '0' + i : i}</div>
            `).join('')}
            <div class="h-[81px]"></div> <!-- Spacer -->
          </div>

          <div class="flex items-center text-slate-300 dark:text-slate-600 font-bold z-20">:</div>

          <!-- Minute Column -->
          <div class="tp-min-col no-scrollbar flex-1 overflow-y-auto overflow-x-hidden scrollbar-none relative z-20 snap-y snap-mandatory scroll-smooth">
            <div class="h-[81px]"></div> <!-- Spacer -->
            ${Array.from({ length: 60 }).map((_, i) => `
              <div class="tp-item h-12 flex items-center justify-center font-mono text-lg font-bold transition-all duration-300 snap-center cursor-pointer" data-min="${i}">${i < 10 ? '0' + i : i}</div>
            `).join('')}
            <div class="h-[81px]"></div> <!-- Spacer -->
          </div>

          <div class="flex items-center text-slate-300 dark:text-slate-600 font-bold z-20">:</div>

          <!-- Second Column -->
          <div class="tp-sec-col no-scrollbar flex-1 overflow-y-auto overflow-x-hidden scrollbar-none relative z-20 snap-y snap-mandatory scroll-smooth">
            <div class="h-[81px]"></div> <!-- Spacer -->
            ${Array.from({ length: 60 }).map((_, i) => `
              <div class="tp-item h-12 flex items-center justify-center font-mono text-lg font-bold transition-all duration-300 snap-center cursor-pointer" data-sec="${i}">${i < 10 ? '0' + i : i}</div>
            `).join('')}
            <div class="h-[81px]"></div> <!-- Spacer -->
          </div>
        </div>

        <div class="flex gap-3">
          <button class="tp-btn-cancel flex-1 py-3.5 rounded-[18px] border-none font-display text-sm font-bold cursor-pointer transition-all duration-300 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:translate-y-[-2px] hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100">${t.cancel}</button>
          <button class="tp-btn-confirm flex-1 py-3.5 rounded-[18px] border-none font-display text-sm font-bold cursor-pointer transition-all duration-300 bg-blue-600 text-white hover:translate-y-[-2px] hover:shadow-xl hover:opacity-90" style="background-color: ${this.accentColor === '#e0f2fe' ? '#2563eb' : this.accentColor}; color: ${this.accentTextColor === '#0369a1' ? '#ffffff' : this.accentTextColor}">${t.confirm}</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);

    const modal = backdrop.querySelector('.tp-modal') as HTMLElement;
    const hourCol = modal.querySelector('.tp-hour-col') as HTMLElement;
    const minCol = modal.querySelector('.tp-min-col') as HTMLElement;
    const secCol = modal.querySelector('.tp-sec-col') as HTMLElement;

    const updateUI = (skipScroll: boolean = false) => {
      const updateCol = (col: HTMLElement, value: number, type: 'hour' | 'min' | 'sec') => {
        col.querySelectorAll('.tp-item').forEach(item => {
          const itemVal = parseInt((item as HTMLElement).dataset[type]!);
          const isSelected = itemVal === value;
          item.className = `tp-item h-12 flex items-center justify-center font-mono text-lg font-bold transition-all duration-300 snap-center cursor-pointer ${isSelected ? 'text-blue-600 dark:text-blue-400 scale-110' : 'text-slate-400 dark:text-slate-500 opacity-40'}`;
        });

        if (!skipScroll) {
          const selectedItem = col.querySelector(`[data-${type}="${value}"]`) as HTMLElement;
          if (selectedItem) {
            col.scrollTop = selectedItem.offsetTop - (col.clientHeight / 2) + (selectedItem.clientHeight / 2);
          }
        }
      };

      updateCol(hourCol, selectedHour, 'hour');
      updateCol(minCol, selectedMinute, 'min');
      updateCol(secCol, selectedSecond, 'sec');
    };

    // Add scroll listeners to update selection
    const setupScrollListener = (col: HTMLElement, type: 'hour' | 'min' | 'sec') => {
      let scrollTimeout: any;
      col.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          const center = col.scrollTop + col.clientHeight / 2;
          const items = col.querySelectorAll('.tp-item');
          let closestItem: HTMLElement | null = null;
          let minDiff = Infinity;

          items.forEach(item => {
            const itemCenter = (item as HTMLElement).offsetTop + (item as HTMLElement).clientHeight / 2;
            const diff = Math.abs(center - itemCenter);
            if (diff < minDiff) {
              minDiff = diff;
              closestItem = item as HTMLElement;
            }
          });

          if (closestItem) {
            const newVal = parseInt((closestItem as HTMLElement).dataset[type]!);
            let changed = false;
            if (type === 'hour' && selectedHour !== newVal) { selectedHour = newVal; changed = true; }
            else if (type === 'min' && selectedMinute !== newVal) { selectedMinute = newVal; changed = true; }
            else if (type === 'sec' && selectedSecond !== newVal) { selectedSecond = newVal; changed = true; }
            
            if (changed) updateUI(true);
          }
        }, 100);
      });
    };

    setupScrollListener(hourCol, 'hour');
    setupScrollListener(minCol, 'min');
    setupScrollListener(secCol, 'sec');

    // Click listeners
    const setupClickListeners = (col: HTMLElement, type: 'hour' | 'min' | 'sec') => {
      col.querySelectorAll('.tp-item').forEach(el => {
        el.addEventListener('click', () => {
          const newVal = parseInt((el as HTMLElement).dataset[type]!);
          if (type === 'hour') selectedHour = newVal;
          else if (type === 'min') selectedMinute = newVal;
          else if (type === 'sec') selectedSecond = newVal;
          updateUI();
        });
      });
    };

    setupClickListeners(hourCol, 'hour');
    setupClickListeners(minCol, 'min');
    setupClickListeners(secCol, 'sec');

    modal.querySelector('.tp-btn-confirm')!.addEventListener('click', () => {
      this.close(backdrop);
      if (onSelect) onSelect({ hour: selectedHour, minute: selectedMinute, second: selectedSecond });
    });

    modal.querySelector('.tp-btn-cancel')!.addEventListener('click', () => {
      this.close(backdrop);
      if (onCancel) onCancel();
    });

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        this.close(backdrop);
        if (onCancel) onCancel();
      }
    });

    updateUI();
    requestAnimationFrame(() => {
      backdrop.classList.remove('opacity-0');
      modal.classList.remove('scale-95', 'opacity-0');
      modal.classList.add('scale-100', 'opacity-100');
    });

    return backdrop;
  }

  private close(el: HTMLElement) {
    const modal = el.querySelector('div') as HTMLElement;
    modal.classList.add('scale-95', 'opacity-0');
    el.classList.add('opacity-0');
    setTimeout(() => {
      if (el.parentNode === document.body) {
        document.body.removeChild(el);
      }
    }, 300);
  }
}

export const timePicker = new TimePickerManager();
