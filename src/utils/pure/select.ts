export interface SelectOption {
  key: string | number;
  value: string;
}

export interface SelectOptions {
  options: SelectOption[];
  onSelect?: (option: SelectOption) => void;
  onCancel?: () => void;
  initialKey?: string | number;
  accentColor?: string;
  title?: string;
  lang?: 'zh' | 'en';
}

const I18N = {
  zh: {
    title: '请选择',
    cancel: '取消'
  },
  en: {
    title: 'Select Option',
    cancel: 'Cancel'
  }
};

const SELECT_STYLES = `
  .sel-backdrop {
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

  .sel-backdrop.sel-show {
    opacity: 1;
  }

  .sel-modal {
    background: var(--dp-bg);
    width: 360px;
    max-height: 80vh;
    border-radius: 40px;
    padding: 32px;
    box-shadow: 0 40px 80px -15px var(--dp-shadow);
    transform: scale(0.95) translateY(30px);
    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    border: 1px solid var(--dp-border);
    display: flex;
    flex-direction: column;
    user-select: none;
  }

  .sel-backdrop.sel-show .sel-modal {
    transform: scale(1) translateY(0);
  }

  .sel-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--dp-border);
  }

  .sel-title {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
    color: var(--dp-text);
    margin: 0;
    letter-spacing: -0.02em;
  }

  .sel-list {
    overflow-y: auto;
    flex: 1;
    margin-bottom: 24px;
    padding-right: 4px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sel-list::-webkit-scrollbar {
    width: 4px;
  }

  .sel-list::-webkit-scrollbar-thumb {
    background: var(--dp-border);
    border-radius: 10px;
  }

  .sel-item {
    padding: 16px 20px;
    font-size: 15px;
    font-weight: 600;
    color: var(--dp-text-secondary);
    border-radius: 18px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid transparent;
  }

  .sel-item:hover:not(.sel-item-selected) {
    background: var(--dp-secondary-bg);
    color: var(--dp-text);
    border-color: var(--dp-border);
    transform: scale(1.02);
  }

  .sel-item-selected {
    color: white !important;
    box-shadow: 0 8px 16px -4px var(--dp-shadow);
    font-weight: 700;
  }

  .sel-footer {
    display: flex;
  }

  .sel-btn-cancel {
    flex: 1;
    padding: 14px;
    border-radius: 18px;
    border: none;
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    background: var(--dp-secondary-bg);
    color: var(--dp-text-secondary);
    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    border: 1px solid var(--dp-border);
  }

  .sel-btn-cancel:hover {
    background: var(--dp-border);
    color: var(--dp-text);
    transform: translateY(-2px);
  }
`;

class SelectManager {
  private accentColor: string = '#e0f2fe';
  private accentTextColor: string = '#0369a1';

  constructor() {
    if (typeof window !== 'undefined') {
      this.injectStyles();
    }
  }

  private injectStyles() {
    if (document.getElementById('sel-utility-styles')) return;
    const styleTag = document.createElement('style');
    styleTag.id = 'sel-utility-styles';
    styleTag.textContent = SELECT_STYLES;
    document.head.appendChild(styleTag);
  }

  show(options: SelectOptions) {
    const { 
      options: items,
      onSelect, 
      onCancel,
      initialKey,
      accentColor = '#e0f2fe',
      title,
      lang = 'zh'
    } = options;

    const t = I18N[lang];
    this.accentColor = accentColor;
    this.accentTextColor = accentColor === '#e0f2fe' ? '#0369a1' : '#ffffff';

    const backdrop = document.createElement('div');
    backdrop.className = 'sel-backdrop';
    document.body.appendChild(backdrop);

    backdrop.innerHTML = `
      <div class="sel-modal">
        <div class="sel-header">
          <h3 class="sel-title">${title || t.title}</h3>
        </div>
        <div class="sel-list">
          ${items.map(item => {
            const isSelected = item.key === initialKey;
            const style = isSelected ? `background-color: ${this.accentColor}; color: ${this.accentTextColor} !important;` : '';
            return `
              <div class="sel-item ${isSelected ? 'sel-item-selected' : ''}" data-key="${item.key}" style="${style}">
                <span>${item.value}</span>
                ${isSelected ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' : ''}
              </div>
            `;
          }).join('')}
        </div>
        <div class="sel-footer">
          <button class="sel-btn-cancel">${t.cancel}</button>
        </div>
      </div>
    `;

    // Event Listeners
    backdrop.querySelectorAll('.sel-item').forEach(el => {
      el.addEventListener('click', () => {
        const key = (el as HTMLElement).dataset.key!;
        const selectedOption = items.find(i => String(i.key) === key);
        if (selectedOption) {
          this.close(backdrop);
          if (onSelect) onSelect(selectedOption);
        }
      });
    });

    backdrop.querySelector('.sel-btn-cancel')!.addEventListener('click', () => {
      this.close(backdrop);
      if (onCancel) onCancel();
    });

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        this.close(backdrop);
        if (onCancel) onCancel();
      }
    });

    requestAnimationFrame(() => backdrop.classList.add('sel-show'));

    return backdrop;
  }

  private close(el: HTMLElement) {
    el.classList.remove('sel-show');
    setTimeout(() => {
      if (el.parentNode === document.body) {
        document.body.removeChild(el);
      }
    }, 300);
  }
}

export const select = new SelectManager();
