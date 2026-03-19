export interface TimePickerOptions {
  onSelect?: (time: { hour: number; minute: number }) => void;
  onCancel?: () => void;
  initialTime?: { hour: number; minute: number };
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

const TP_STYLES = `
  .tp-backdrop {
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

  .tp-backdrop.tp-show {
    opacity: 1;
  }

  .tp-modal {
    background: var(--dp-bg);
    width: 320px;
    border-radius: 40px;
    padding: 32px;
    box-shadow: 0 40px 80px -15px var(--dp-shadow);
    transform: scale(0.95) translateY(30px);
    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    border: 1px solid var(--dp-border);
    user-select: none;
  }

  .tp-backdrop.tp-show .tp-modal {
    transform: scale(1) translateY(0);
  }

  .tp-header {
    text-align: center;
    margin-bottom: 24px;
  }

  .tp-title {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
    color: var(--dp-text);
    margin: 0;
    letter-spacing: -0.02em;
  }

  .tp-body {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-bottom: 32px;
  }

  .tp-column {
    flex: 1;
    height: 200px;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px;
    background: var(--dp-secondary-bg);
    border-radius: 20px;
    border: 1px solid var(--dp-border);
  }

  .tp-column::-webkit-scrollbar {
    display: none;
  }

  .tp-item {
    padding: 12px 0;
    text-align: center;
    font-family: var(--font-mono);
    font-size: 16px;
    font-weight: 600;
    color: var(--dp-text-secondary);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1);
    border: 1px solid transparent;
  }

  .tp-item:hover:not(.tp-item-selected) {
    background: var(--dp-bg);
    color: var(--dp-text);
    border-color: var(--dp-border);
  }

  .tp-item-selected {
    color: white !important;
    box-shadow: 0 8px 16px -4px var(--dp-shadow);
    font-weight: 700;
  }

  .tp-footer {
    display: flex;
    gap: 12px;
  }

  .tp-btn {
    flex: 1;
    padding: 14px;
    border-radius: 18px;
    border: none;
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .tp-btn-confirm {
    background: var(--dp-accent);
    color: var(--dp-accent-text);
  }

  .tp-btn-cancel {
    background: var(--dp-secondary-bg);
    color: var(--dp-text-secondary);
    border: 1px solid var(--dp-border);
  }

  .tp-btn:hover {
    transform: translateY(-2px);
  }

  .tp-btn-confirm:hover {
    box-shadow: 0 12px 24px -6px var(--dp-shadow);
    opacity: 0.9;
  }

  .tp-btn-cancel:hover {
    background: var(--dp-border);
    color: var(--dp-text);
  }
`;

class TimePickerManager {
  private accentColor: string = '#e0f2fe';
  private accentTextColor: string = '#0369a1';

  constructor() {
    if (typeof window !== 'undefined') {
      this.injectStyles();
    }
  }

  private injectStyles() {
    if (document.getElementById('tp-utility-styles')) return;
    const styleTag = document.createElement('style');
    styleTag.id = 'tp-utility-styles';
    styleTag.textContent = TP_STYLES;
    document.head.appendChild(styleTag);
  }

  show(options: TimePickerOptions) {
    const { 
      onSelect, 
      onCancel,
      initialTime = { hour: new Date().getHours(), minute: new Date().getMinutes() },
      accentColor = '#e0f2fe',
      lang = 'zh'
    } = options;

    const t = I18N[lang];
    this.accentColor = accentColor;
    this.accentTextColor = accentColor === '#e0f2fe' ? '#0369a1' : '#ffffff';

    let selectedHour = initialTime.hour;
    let selectedMinute = initialTime.minute;

    const backdrop = document.createElement('div');
    backdrop.className = 'tp-backdrop';
    document.body.appendChild(backdrop);

    const render = () => {
      backdrop.innerHTML = `
        <div class="tp-modal">
          <div class="tp-header">
            <h3 class="tp-title">${t.title}</h3>
          </div>
          <div class="tp-body">
            <div class="tp-column tp-hour-col">
              ${Array.from({ length: 24 }).map((_, i) => {
                const isSelected = i === selectedHour;
                const style = isSelected ? `background-color: ${this.accentColor}; color: ${this.accentTextColor} !important;` : '';
                return `<div class="tp-item ${isSelected ? 'tp-item-selected' : ''}" data-hour="${i}" style="${style}">${i < 10 ? '0' + i : i}</div>`;
              }).join('')}
            </div>
            <div class="tp-column tp-min-col">
              ${Array.from({ length: 60 }).map((_, i) => {
                const isSelected = i === selectedMinute;
                const style = isSelected ? `background-color: ${this.accentColor}; color: ${this.accentTextColor} !important;` : '';
                return `<div class="tp-item ${isSelected ? 'tp-item-selected' : ''}" data-min="${i}" style="${style}">${i < 10 ? '0' + i : i}</div>`;
              }).join('')}
            </div>
          </div>
          <div class="tp-footer">
            <button class="tp-btn tp-btn-cancel">${t.cancel}</button>
            <button class="tp-btn tp-btn-confirm">${t.confirm}</button>
          </div>
        </div>
      `;

      // Scroll to selected items
      const hourCol = backdrop.querySelector('.tp-hour-col') as HTMLElement;
      const minCol = backdrop.querySelector('.tp-min-col') as HTMLElement;
      
      const selectedHourEl = hourCol.querySelector('.tp-item-selected') as HTMLElement;
      const selectedMinEl = minCol.querySelector('.tp-item-selected') as HTMLElement;

      if (selectedHourEl) hourCol.scrollTop = selectedHourEl.offsetTop - 60;
      if (selectedMinEl) minCol.scrollTop = selectedMinEl.offsetTop - 60;

      // Event Listeners
      hourCol.querySelectorAll('.tp-item').forEach(el => {
        el.addEventListener('click', () => {
          selectedHour = parseInt((el as HTMLElement).dataset.hour!);
          render();
        });
      });

      minCol.querySelectorAll('.tp-item').forEach(el => {
        el.addEventListener('click', () => {
          selectedMinute = parseInt((el as HTMLElement).dataset.min!);
          render();
        });
      });

      backdrop.querySelector('.tp-btn-confirm')!.addEventListener('click', () => {
        this.close(backdrop);
        if (onSelect) onSelect({ hour: selectedHour, minute: selectedMinute });
      });

      backdrop.querySelector('.tp-btn-cancel')!.addEventListener('click', () => {
        this.close(backdrop);
        if (onCancel) onCancel();
      });

      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          this.close(backdrop);
          if (onCancel) onCancel();
        }
      });
    };

    render();
    requestAnimationFrame(() => backdrop.classList.add('tp-show'));

    return backdrop;
  }

  private close(el: HTMLElement) {
    el.classList.remove('tp-show');
    setTimeout(() => {
      if (el.parentNode === document.body) {
        document.body.removeChild(el);
      }
    }, 300);
  }
}

export const timePicker = new TimePickerManager();
