export type AlertType = 'success' | 'error' | 'info' | 'warning';

export interface AlertOptions {
  title?: string;
  content: string;
  type?: AlertType;
  confirmText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
  cancelText?: string;
  onCancel?: () => void;
  showClose?: boolean;
  compact?: boolean;
}

const ALERT_STYLES = `
  .alert-backdrop {
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

  .alert-backdrop.alert-show {
    opacity: 1;
  }

  .alert-modal {
    position: relative;
    background: var(--dp-bg);
    width: 420px;
    max-width: 90vw;
    border-radius: 40px;
    padding: 40px;
    box-shadow: 0 40px 80px -15px var(--dp-shadow);
    transform: scale(0.95) translateY(30px);
    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    text-align: center;
    border: 1px solid var(--dp-border);
  }

  .alert-modal.alert-compact {
    padding: 32px;
    border-radius: 32px;
    width: 360px;
  }

  .alert-backdrop.alert-show .alert-modal {
    transform: scale(1) translateY(0);
  }

  .alert-close-x {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--dp-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    opacity: 0.6;
  }

  .alert-close-x:hover {
    background: var(--dp-secondary-bg);
    color: var(--dp-text);
    opacity: 1;
  }

  .alert-icon-wrapper {
    width: 64px;
    height: 64px;
    border-radius: 24px;
    margin: 0 auto 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .alert-modal:hover .alert-icon-wrapper {
    transform: scale(1.1) rotate(5deg);
  }

  .alert-compact .alert-icon-wrapper {
    width: 56px;
    height: 56px;
    margin-bottom: 20px;
  }

  .alert-title {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 700;
    color: var(--dp-text);
    margin-bottom: 12px;
    letter-spacing: -0.02em;
  }

  .alert-content {
    font-size: 15px;
    color: var(--dp-text-secondary);
    line-height: 1.6;
    margin-bottom: 32px;
    font-weight: 400;
  }

  .alert-footer {
    display: flex;
    gap: 12px;
  }

  .alert-btn {
    flex: 1;
    padding: 16px;
    border-radius: 20px;
    border: none;
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .alert-btn-confirm {
    background: var(--dp-accent);
    color: var(--dp-accent-text);
  }

  .alert-btn-cancel {
    background: var(--dp-secondary-bg);
    color: var(--dp-text-secondary);
    border: 1px solid var(--dp-border);
  }

  .alert-btn:hover {
    transform: translateY(-2px);
  }

  .alert-btn-confirm:hover {
    box-shadow: 0 12px 24px -6px var(--dp-shadow);
    opacity: 0.9;
  }

  .alert-btn-cancel:hover {
    background: var(--dp-border);
    color: var(--dp-text);
  }

  /* Type Specific Styles */
  .alert-success .alert-icon-wrapper { background: rgba(16, 185, 129, 0.1); color: #10b981; }
  .alert-error .alert-icon-wrapper { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
  .alert-info .alert-icon-wrapper { background: rgba(var(--dp-accent-rgb), 0.1); color: var(--dp-accent); }
  .alert-warning .alert-icon-wrapper { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

  .alert-success .alert-btn-confirm { background: #10b981; }
  .alert-error .alert-btn-confirm { background: #ef4444; }
  .alert-warning .alert-btn-confirm { background: #f59e0b; }
`;

class AlertManager {
  constructor() {
    if (typeof window !== 'undefined') {
      this.injectStyles();
    }
  }

  private injectStyles() {
    if (document.getElementById('alert-utility-styles')) return;
    const styleTag = document.createElement('style');
    styleTag.id = 'alert-utility-styles';
    styleTag.textContent = ALERT_STYLES;
    document.head.appendChild(styleTag);
  }

  private createIcon(type: AlertType) {
    const paths = {
      success: 'm9 12 2 2 4-4',
      error: 'm15 9-6 6m0-6 6 6',
      warning: 'M12 8v4m0 4h.01',
      info: 'M12 16V12m0-4h.01'
    };

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="${paths[type]}"/>
      </svg>
    `;
  }

  show(options: AlertOptions) {
    const { 
      title = 'Notification', 
      content, 
      type = 'info', 
      confirmText = 'Confirm', 
      onConfirm,
      showCancel = false,
      cancelText = 'Cancel',
      onCancel,
      showClose = false,
      compact = false
    } = options;

    const backdrop = document.createElement('div');
    backdrop.className = `alert-backdrop alert-${type}`;

    backdrop.innerHTML = `
      <div class="alert-modal ${compact ? 'alert-compact' : ''}">
        ${showClose ? `
          <button class="alert-close-x">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        ` : ''}
        <div class="alert-icon-wrapper">
          ${this.createIcon(type)}
        </div>
        <h3 class="alert-title">${title}</h3>
        <p class="alert-content">${content}</p>
        <div class="alert-footer">
          ${showCancel ? `<button class="alert-btn alert-btn-cancel">${cancelText}</button>` : ''}
          <button class="alert-btn alert-btn-confirm">${confirmText}</button>
        </div>
      </div>
    `;

    if (showClose) {
      const closeX = backdrop.querySelector('.alert-close-x') as HTMLButtonElement;
      closeX.onclick = () => this.close(backdrop);
    }

    if (showCancel) {
      const cancelBtn = backdrop.querySelector('.alert-btn-cancel') as HTMLButtonElement;
      cancelBtn.onclick = () => {
        this.close(backdrop);
        if (onCancel) onCancel();
      };
    }

    const confirmBtn = backdrop.querySelector('.alert-btn-confirm') as HTMLButtonElement;
    confirmBtn.onclick = () => {
      this.close(backdrop);
      if (onConfirm) onConfirm();
    };

    document.body.appendChild(backdrop);

    // Trigger animation
    requestAnimationFrame(() => {
      backdrop.classList.add('alert-show');
    });

    return backdrop;
  }

  private close(el: HTMLElement) {
    el.classList.remove('alert-show');
    setTimeout(() => {
      if (el.parentNode === document.body) {
        document.body.removeChild(el);
      }
    }, 500);
  }

  success(content: string, title?: string) {
    return this.show({ content, title: title || 'Success', type: 'success' });
  }

  error(content: string, title?: string) {
    return this.show({ content, title: title || 'Error', type: 'error' });
  }

  info(content: string, title?: string) {
    return this.show({ content, title: title || 'Information', type: 'info' });
  }

  warning(content: string, title?: string) {
    return this.show({ content, title: title || 'Warning', type: 'warning' });
  }
}

export const alert = new AlertManager();
