import { LucideIcon } from 'lucide-react';

export type MessageType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface MessageOptions {
  duration?: number;
  color?: string;
  icon?: LucideIcon;
  closable?: boolean;
}

const STYLES = `
  #message-container {
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    pointer-events: none;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  .msg-card {
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--dp-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--dp-border);
    box-shadow: 0 8px 32px var(--dp-shadow);
    border-radius: 16px;
    min-width: 300px;
    max-width: 90vw;
    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }

  .msg-card.msg-show {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .msg-card.msg-hide {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }

  .msg-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .msg-content {
    flex-grow: 1;
    font-size: 14px;
    font-weight: 500;
    color: var(--dp-text);
    line-height: 1.5;
  }

  .msg-close {
    padding: 4px;
    border-radius: 50%;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .msg-close:hover {
    background: var(--dp-secondary-bg);
    color: var(--dp-text);
  }

  .msg-spinner {
    animation: msg-rotate 1s linear infinite;
  }

  @keyframes msg-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Type Colors */
  .msg-icon-success { color: #10b981; }
  .msg-icon-error { color: #f43f5e; }
  .msg-icon-info { color: #3b82f6; }
  .msg-icon-warning { color: #f59e0b; }
  .msg-icon-loading { color: #64748b; }
`;

class MessageManager {
  private container: HTMLDivElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.injectStyles();
      this.initContainer();
    }
  }

  private injectStyles() {
    if (document.getElementById('message-utility-styles')) return;
    const styleTag = document.createElement('style');
    styleTag.id = 'message-utility-styles';
    styleTag.textContent = STYLES;
    document.head.appendChild(styleTag);
  }

  private initContainer() {
    if (document.getElementById('message-container')) {
      this.container = document.getElementById('message-container') as HTMLDivElement;
      return;
    }
    this.container = document.createElement('div');
    this.container.id = 'message-container';
    document.body.appendChild(this.container);
  }

  private createIcon(type: MessageType, customColor?: string) {
    const iconWrapper = document.createElement('span');
    iconWrapper.className = `msg-icon msg-icon-${type}`;
    if (type === 'loading') {
      iconWrapper.classList.add('msg-spinner');
    }
    if (customColor) {
      iconWrapper.style.color = customColor;
    }
    
    const paths = {
      success: 'm9 12 2 2 4-4',
      error: 'm15 9-6 6m0-6 6 6',
      warning: 'M12 8v4m0 4h.01',
      info: 'M12 16V12m0-4h.01',
      loading: 'M21 12a9 9 0 1 1-6.219-8.56'
    };

    iconWrapper.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${type !== 'loading' ? '<circle cx="12" cy="12" r="10"/>' : ''}
        <path d="${paths[type]}"/>
      </svg>
    `;
    
    return iconWrapper;
  }

  show(content: string, type: MessageType = 'info', options: MessageOptions = {}) {
    if (!this.container) this.initContainer();

    const { duration = 3000, color, closable = false } = options;

    const messageEl = document.createElement('div');
    messageEl.className = 'msg-card';

    const iconPart = this.createIcon(type, color);
    const textPart = document.createElement('span');
    textPart.className = 'msg-content';
    textPart.textContent = content;

    messageEl.appendChild(iconPart);
    messageEl.appendChild(textPart);

    if (closable) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'msg-close';
      closeBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      `;
      closeBtn.onclick = () => this.remove(messageEl);
      messageEl.appendChild(closeBtn);
    }

    this.container!.appendChild(messageEl);
    
    // Trigger entrance animation
    requestAnimationFrame(() => {
      messageEl.classList.add('msg-show');
    });

    if (duration > 0) {
      setTimeout(() => this.remove(messageEl), duration);
    }

    return {
      el: messageEl,
      close: () => this.remove(messageEl)
    };
  }

  private remove(el: HTMLElement) {
    el.classList.remove('msg-show');
    el.classList.add('msg-hide');
    setTimeout(() => {
      if (el.parentNode === this.container) {
        this.container!.removeChild(el);
      }
    }, 500);
  }

  success(content: string, options?: MessageOptions) {
    return this.show(content, 'success', options);
  }

  error(content: string, options?: MessageOptions) {
    return this.show(content, 'error', options);
  }

  info(content: string, options?: MessageOptions) {
    return this.show(content, 'info', options);
  }

  warning(content: string, options?: MessageOptions) {
    return this.show(content, 'warning', options);
  }

  loading(content: string, options?: MessageOptions) {
    return this.show(content, 'loading', { duration: 0, ...options });
  }
}

export const message = new MessageManager();
