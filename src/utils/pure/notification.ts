export interface NotificationOptions {
  title: string;
  content: string;
  image?: string;
  time?: string;
  duration?: number; // ms, default 5000
  onClick?: () => void;
  lang?: 'zh' | 'en';
  position?: 'right' | 'center';
  accentColor?: string;
}

class NotificationManager {
  private rightContainer: HTMLDivElement | null = null;
  private centerContainer: HTMLDivElement | null = null;
  private rightNotifications: HTMLElement[] = [];
  private centerNotification: HTMLElement | null = null;

  constructor() {}

  private getContainer(position: 'right' | 'center') {
    let extraClass = '';
    if(window.AndroidBridge) {
      extraClass = 'top-[48px]';
    } else {
      extraClass = 'top-6';
    }
    if (position === 'center') {
      if (!this.centerContainer) {
        this.centerContainer = document.createElement('div');

        this.centerContainer.className = extraClass + 'fixed left-1/2 -translate-x-1/2 z-[11000] flex flex-col items-center gap-3 pointer-events-none w-full max-w-[400px] px-4 sm:px-0';
        document.body.appendChild(this.centerContainer);
      }
      return this.centerContainer;
    } else {
      if (!this.rightContainer) {
        this.rightContainer = document.createElement('div');
        this.rightContainer.className = extraClass + 'fixed right-6 z-[11000] flex flex-col gap-3 pointer-events-none w-full max-w-[400px] px-4 sm:px-0';
        document.body.appendChild(this.rightContainer);
      }
      return this.rightContainer;
    }
  }

  show(options: NotificationOptions) {
    const {
      title,
      content,
      image = 'https://picsum.photos/seed/user/100/100',
      time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration = 5000,
      onClick,
      position = 'right',
      accentColor = '#3b82f6'
    } = options;

    const container = this.getContainer(position);

    // Handle center position: destroy previous
    if (position === 'center' && this.centerNotification) {
      this.remove(this.centerNotification, 'center', true);
    }

    const notification = document.createElement('div');
    const initialTransform = position === 'center' ? 'translate-y-[-20px] scale-95' : 'translate-x-full';
    const activeTransform = position === 'center' ? 'translate-y-0 scale-100' : 'translate-x-0';
    
    notification.className = `group pointer-events-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[28px] p-4 shadow-2xl border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-4 transition-all duration-500 transform ${initialTransform} opacity-0 cursor-pointer hover:scale-[1.02] hover:bg-white dark:hover:bg-slate-900 active:scale-[0.98] select-none w-full`;
    
    notification.innerHTML = `
      <div class="relative flex-shrink-0">
        <div class="w-12 h-12 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
          <img src="${image}" class="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div class="absolute -top-1 -right-1 w-4 h-4 border-2 border-white dark:border-slate-900 rounded-full" style="background-color: ${accentColor}"></div>
      </div>
      
      <div class="flex-1 min-w-0">
        <div class="flex flex-col">
          <h4 class="font-display font-bold text-sm text-slate-900 dark:text-slate-100 truncate leading-tight mb-0.5">${title}</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">${content}</p>
        </div>
      </div>
      
      <div class="flex flex-col items-end self-start pt-0.5">
        <span class="text-[10px] font-mono font-medium text-slate-400 dark:text-slate-600 uppercase tracking-wider">${time}</span>
        <div class="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color: ${accentColor}"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      </div>
    `;

    const handleAction = () => {
      if (onClick) onClick();
      this.remove(notification, position);
    };

    notification.onclick = handleAction;

    container.appendChild(notification);
    
    if (position === 'center') {
      this.centerNotification = notification;
    } else {
      this.rightNotifications.push(notification);
    }

    // Animate in
    requestAnimationFrame(() => {
      notification.classList.remove('opacity-0');
      if (position === 'center') {
        notification.classList.remove('translate-y-[-20px]', 'scale-95');
        notification.classList.add('translate-y-0', 'scale-100');
      } else {
        notification.classList.remove('translate-x-full');
        notification.classList.add('translate-x-0');
      }
    });

    // Auto remove
    if (duration > 0) {
      setTimeout(() => this.remove(notification, position), duration);
    }

    return notification;
  }

  private remove(el: HTMLElement, position: 'right' | 'center', immediate = false) {
    if (!el.parentNode) return;
    
    if (immediate) {
      el.parentNode.removeChild(el);
      if (position === 'center') this.centerNotification = null;
      else this.rightNotifications = this.rightNotifications.filter(n => n !== el);
      return;
    }

    const exitTransform = position === 'center' ? 'translate-y-[-10px] scale-95 opacity-0' : 'translate-x-full opacity-0 scale-95';
    
    if (position === 'center') {
      el.classList.add('translate-y-[-10px]', 'scale-95', 'opacity-0');
    } else {
      el.classList.add('translate-x-full', 'opacity-0', 'scale-95');
    }
    
    setTimeout(() => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
      if (position === 'center') {
        if (this.centerNotification === el) this.centerNotification = null;
      } else {
        this.rightNotifications = this.rightNotifications.filter(n => n !== el);
      }
    }, 500);
  }
}

export const notification = new NotificationManager();
