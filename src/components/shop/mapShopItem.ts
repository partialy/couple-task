import { ShopItem, colorStyles } from './types';
import type { ShopItemRecord } from '@/api/service/shopItems';

function isLikelyImageUrl(s: string): boolean {
  const t = s.trim();
  return t.startsWith('http://') || t.startsWith('https://') || t.startsWith('//');
}

export function mapRecordToShopItem(item: ShopItemRecord): ShopItem {
  const colorKey = item.color || 'pink';
  const bg = colorStyles[colorKey]?.bg || 'bg-pink-100 dark:bg-pink-900/30';
  const raw = (item.icon || 'gift').trim();
  const isUrl = isLikelyImageUrl(raw);
  return {
    id: item.id,
    name: item.name,
    desc: item.description || '',
    points: item.pointsCost,
    icon: isUrl ? 'gift' : raw.toLowerCase(),
    color: bg,
    image: isUrl ? raw : undefined,
    status: item.status as 'active' | 'inactive',
  };
}
