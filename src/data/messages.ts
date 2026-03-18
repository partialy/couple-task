export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const mockConversations: Conversation[] = [
  {
    id: '1',
    userId: 'partner_1',
    userName: '兔兔',
    userAvatar: 'https://picsum.photos/seed/tutu/100/100',
    lastMessage: '今天晚上吃什么呀？',
    lastMessageTime: '10:30',
    unreadCount: 2,
  },
  {
    id: '2',
    userId: 'system',
    userName: '系统通知',
    userAvatar: 'https://picsum.photos/seed/system/100/100',
    lastMessage: '您的任务已完成！',
    lastMessageTime: '昨天',
    unreadCount: 0,
  }
];

export const mockMessages: Record<string, Message[]> = {
  '1': [
    { id: 'm1', senderId: 'partner_1', text: '早安！', timestamp: '09:00', isRead: true },
    { id: 'm2', senderId: 'me', text: '早安~ 记得吃早饭哦', timestamp: '09:05', isRead: true },
    { id: 'm3', senderId: 'partner_1', text: '知道啦', timestamp: '09:10', isRead: true },
    { id: 'm4', senderId: 'partner_1', text: '今天晚上吃什么呀？', timestamp: '10:30', isRead: false },
  ],
  '2': [
    { id: 's1', senderId: 'system', text: '欢迎来到心愿任务！', timestamp: '2023-10-01', isRead: true },
    { id: 's2', senderId: 'system', text: '您的任务已完成！', timestamp: '昨天', isRead: true },
  ]
};
