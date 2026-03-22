import { LucideIcon } from 'lucide-react';

export type MessageType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface MessageOptions {
  duration?: number;
  color?: string;
  icon?: LucideIcon;
  closable?: boolean;
}

class MessageManager {
  private container: HTMLDivElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initContainer();
    }
  }

  private initContainer() {
    if (document.getElementById('message-container')) {
      this.container = document.getElementById('message-container') as HTMLDivElement;
      return;
    }
    this.container = document.createElement('div');
    this.container.id = 'message-container';
    this.container.className = 'fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 pointer-events-none font-sans';
    document.body.appendChild(this.container);
  }

  private createIcon(type: MessageType, customColor?: string) {
    const iconWrapper = document.createElement('span');
    const colorClass = {
      success: 'text-emerald-500',
      error: 'text-rose-500',
      info: 'text-blue-500',
      warning: 'text-amber-500',
      loading: 'text-slate-400'
    }[type];

    iconWrapper.className = `flex items-center justify-center shrink-0 ${colorClass}`;
    if (type === 'loading') {
      iconWrapper.classList.add('animate-spin');
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
    // Base classes for the message card
    messageEl.className = 'pointer-events-auto flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl rounded-2xl w-fit min-w-[50px] max-w-[90vw] transition-all duration-500 ease-out opacity-0 -translate-y-5 scale-95';

    const iconPart = this.createIcon(type, color);
    const textPart = document.createElement('span');
    textPart.className = 'flex-grow text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed';
    textPart.textContent = content || "message";

    messageEl.appendChild(iconPart);
    messageEl.appendChild(textPart);

    if (closable) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer';
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
      messageEl.classList.remove('opacity-0', '-translate-y-5', 'scale-95');
      messageEl.classList.add('opacity-100', 'translate-y-0', 'scale-100');
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
    el.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
    el.classList.add('opacity-0', '-translate-y-2', 'scale-95');
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
