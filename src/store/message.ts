import { create } from 'zustand';

interface MessageState {
  conversations: any[];
  setConversations: (conversations: any[]) => void;
  clearUnreadCount: (conversationId: string) => void;
}

export const useMessageStore = create<MessageState>()(
    (set) => ({
      conversations: [],
      setConversations: (conversations) => set({ conversations }),
      clearUnreadCount: (conversationId) => set((state) => ({
        conversations: state.conversations.map(c => 
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        )
      })),
    })
);
