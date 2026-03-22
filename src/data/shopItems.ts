import type { ShopItem } from '@/components/shop/types';

/** 无接口时的占位（开发预览）；线上以接口为准 */
export const initialShopItems: ShopItem[] = [
  { id: 'demo-1', name: '特权卡', desc: '享有更高优先级和特权', points: 200, icon: 'package', color: 'bg-purple-100 dark:bg-purple-900/30', status: 'active' },
  { id: 'demo-2', name: '延期卡', desc: '延长任务的截止时间24小时', points: 150, icon: 'zap', color: 'bg-amber-100 dark:bg-amber-900/30', status: 'active' },
  { id: 'demo-3', name: '双人电影票', desc: '兑换任意场次双人电影票', points: 2000, icon: 'ticket', color: 'bg-rose-100 dark:bg-rose-900/30', status: 'active' },
  { id: 'demo-4', name: '星巴克双杯', desc: '兑换星巴克指定饮品两杯', points: 1500, icon: 'coffee', color: 'bg-emerald-100 dark:bg-emerald-900/30', status: 'active' },
];
