import { create } from 'zustand';
import type { SystemNotice } from '@/api/service/systemNotice';

interface SystemNoticeState {
  notices: SystemNotice[];
  unreadCount: number;
  setNotices: (items: SystemNotice[]) => void;
  prependNotice: (item: SystemNotice) => void;
  setUnreadCount: (n: number) => void;
}

export const useSystemNoticeStore = create<SystemNoticeState>()((set) => ({
  notices: [],
  unreadCount: 0,
  setNotices: (items) => set({ notices: items }),
  prependNotice: (item) =>
    set((state) => ({
      notices: [item, ...state.notices],
      unreadCount: state.unreadCount + (item.isRead === 0 ? 1 : 0),
    })),
  setUnreadCount: (n) => set({ unreadCount: n }),
}));
