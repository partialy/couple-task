import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MessageState {
  conversations: any[];
  setConversations: (conversations: any[]) => void;
  clearUnreadCount: (conversationId: string) => void;
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set) => ({
      conversations: [],
      setConversations: (conversations) => set({ conversations }),
      clearUnreadCount: (conversationId) => set((state) => ({
        conversations: state.conversations.map(c => 
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        )
      })),
    }),
    {
      name: 'yutask-message-storage',
    }
  )
);
