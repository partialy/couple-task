export interface PasswordInputOptions {
  length?: number; // 4-16, default 6
  onComplete?: (password: string) => void;
  onCancel?: () => void;
  title?: string;
  lang?: 'zh' | 'en';
  accentColor?: string;
  feedback?: boolean; // Whether to show visual feedback on click
}

const I18N = {
  zh: {
    title: '请输入密码',
    cancel: '取消'
  },
  en: {
    title: 'Enter Password',
    cancel: 'Cancel'
  }
};

const PI_STYLES = `
  .pi-backdrop {
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

  .pi-backdrop.pi-show {
    opacity: 1;
  }

  .pi-modal {
    background: var(--dp-bg);
    width: 360px;
    border-radius: 40px;
    padding: 40px 32px;
    box-shadow: 0 40px 80px -15px var(--dp-shadow);
    transform: scale(0.95) translateY(30px);
    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    border: 1px solid var(--dp-border);
    display: flex;
    flex-direction: column;
    align-items: center;
    user-select: none;
  }

  .pi-backdrop.pi-show .pi-modal {
    transform: scale(1) translateY(0);
  }

  .pi-header {
    margin-bottom: 32px;
    text-align: center;
  }

  .pi-title {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 700;
    color: var(--dp-text);
    margin: 0;
    letter-spacing: -0.02em;
  }

  .pi-dots-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
    margin-bottom: 40px;
    max-width: 100%;
  }

  .pi-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid var(--dp-border);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    background: transparent;
  }

  .pi-dot-filled {
    background: var(--dp-text);
    border-color: var(--dp-text);
    transform: scale(1.2);
    box-shadow: 0 0 15px var(--dp-shadow);
  }

  .pi-keypad {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    width: 100%;
  }

  .pi-key {
    aspect-ratio: 1.2;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 700;
    color: var(--dp-text);
    background: var(--dp-secondary-bg);
    border-radius: 24px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1);
    border: 1px solid var(--dp-border);
  }

  .pi-key:hover {
    background: var(--dp-bg);
    transform: translateY(-2px);
    box-shadow: 0 8px 16px -4px var(--dp-shadow);
    border-color: var(--dp-text);
  }

  .pi-key:active {
    transform: scale(0.92);
    background: var(--dp-border);
  }

  .pi-key-feedback:active {
    background: var(--pi-accent, var(--dp-border));
    border-color: rgba(0,0,0,0.05);
  }

  .pi-key-special {
    background: transparent;
    border: none;
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 600;
    color: var(--dp-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .pi-key-special:hover {
    background: var(--dp-secondary-bg);
    color: var(--dp-text);
    box-shadow: none;
    transform: none;
  }

  .pi-delete-icon {
    width: 24px;
    height: 24px;
    stroke-width: 2.5;
  }
`;

class PasswordInputManager {
  constructor() {
    if (typeof window !== 'undefined') {
      this.injectStyles();
    }
  }

  private injectStyles() {
    if (document.getElementById('pi-utility-styles')) return;
    const styleTag = document.createElement('style');
    styleTag.id = 'pi-utility-styles';
    styleTag.textContent = PI_STYLES;
    document.head.appendChild(styleTag);
  }

  show(options: PasswordInputOptions) {
    const {
      length = 6,
      onComplete,
      onCancel,
      title,
      lang = 'zh',
      accentColor = '#e2e8f0',
      feedback = true
    } = options;

    const safeLength = Math.min(16, Math.max(4, length));
    const t = I18N[lang];
    let currentPassword = '';

    const backdrop = document.createElement('div');
    backdrop.className = 'pi-backdrop';
    backdrop.style.setProperty('--pi-accent', accentColor);
    document.body.appendChild(backdrop);

    const render = () => {
      backdrop.innerHTML = `
        <div class="pi-modal">
          <div class="pi-header">
            <h3 class="pi-title">${title || t.title}</h3>
          </div>
          <div class="pi-dots-container">
            ${Array.from({ length: safeLength }).map((_, i) => `
              <div class="pi-dot ${i < currentPassword.length ? 'pi-dot-filled' : ''}" 
                   style="${i < currentPassword.length ? `background-color: ${accentColor === '#e2e8f0' ? '#1e293b' : accentColor}; border-color: ${accentColor === '#e2e8f0' ? '#1e293b' : accentColor};` : ''}">
              </div>
            `).join('')}
          </div>
          <div class="pi-keypad">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => `
              <div class="pi-key ${feedback ? 'pi-key-feedback' : ''}" data-val="${num}">${num}</div>
            `).join('')}
            <div class="pi-key pi-key-special pi-btn-cancel">${t.cancel}</div>
            <div class="pi-key ${feedback ? 'pi-key-feedback' : ''}" data-val="0">0</div>
            <div class="pi-key pi-key-special pi-btn-delete">
              <svg class="pi-delete-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                <line x1="18" y1="9" x2="12" y2="15"></line>
                <line x1="12" y1="9" x2="18" y2="15"></line>
              </svg>
            </div>
          </div>
        </div>
      `;

      // Keypad listeners
      backdrop.querySelectorAll('.pi-key[data-val]').forEach(el => {
        el.addEventListener('click', () => {
          if (currentPassword.length < safeLength) {
            currentPassword += (el as HTMLElement).dataset.val;
            render();
            
            if (currentPassword.length === safeLength) {
              setTimeout(() => {
                this.close(backdrop);
                if (onComplete) onComplete(currentPassword);
              }, 200);
            }
          }
        });
      });

      backdrop.querySelector('.pi-btn-delete')!.addEventListener('click', () => {
        if (currentPassword.length > 0) {
          currentPassword = currentPassword.slice(0, -1);
          render();
        }
      });

      backdrop.querySelector('.pi-btn-cancel')!.addEventListener('click', () => {
        this.close(backdrop);
        if (onCancel) onCancel();
      });
    };

    render();
    requestAnimationFrame(() => backdrop.classList.add('pi-show'));

    return backdrop;
  }

  private close(el: HTMLElement) {
    el.classList.remove('pi-show');
    setTimeout(() => {
      if (el.parentNode === document.body) {
        document.body.removeChild(el);
      }
    }, 300);
  }
}

export const passwordInput = new PasswordInputManager();
