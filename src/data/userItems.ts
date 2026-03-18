export interface UserItem {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name or emoji
  type: 'prop' | 'wildcard' | 'other';
  status: 'usable' | 'used';
  code?: string; // Redemption code
  acquiredAt: string;
  usedAt?: string;
  color: string; // Tailwind color class for the icon background
}

export const mockUserItems: UserItem[] = [
  {
    id: 'item-1',
    name: '特权卡',
    description: '享有更高优先级和特权',
    icon: 'Shield',
    type: 'prop',
    status: 'usable',
    code: 'PRIV-8X92-K1M4',
    acquiredAt: '2026-03-10T10:00:00Z',
    color: 'purple'
  },
  {
    id: 'item-2',
    name: '延期卡',
    description: '延长任务的截止时间',
    icon: 'Clock',
    type: 'prop',
    status: 'usable',
    code: 'EXT-4B7C-9P2L',
    acquiredAt: '2026-03-12T14:30:00Z',
    color: 'amber'
  },
  {
    id: 'item-3',
    name: '免做金牌',
    description: '可以免除一次指定的任务',
    icon: 'Award',
    type: 'prop',
    status: 'used',
    code: 'FREE-1A2B-3C4D',
    acquiredAt: '2026-03-01T09:15:00Z',
    usedAt: '2026-03-05T18:20:00Z',
    color: 'emerald'
  },
  {
    id: 'item-4',
    name: '万能卡',
    description: '可以兑换任意等值道具',
    icon: 'Star',
    type: 'wildcard',
    status: 'usable',
    code: 'WILD-X7Y8-Z9W0',
    acquiredAt: '2026-03-14T11:45:00Z',
    color: 'cyan'
  },
  {
    id: 'item-5',
    name: '双倍积分卡',
    description: '下一次完成任务获得双倍积分',
    icon: 'Zap',
    type: 'prop',
    status: 'usable',
    code: 'DBL-5F6G-7H8J',
    acquiredAt: '2026-03-15T08:00:00Z',
    color: 'rose'
  }
];
