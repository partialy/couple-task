import type { MemorialItem } from '@/api/service/memorial';
import {
  calculateMemorialDays,
  type MemorialComputed,
  type MemorialEventType,
} from '@/utils/pure/calculateMemorialDays';

/** 单条展示用：接口数据 + 本地推算字段 */
export type MemorialRow = MemorialItem &
  MemorialComputed & {
    anchorYmd: string;
    eventType: MemorialEventType;
  };

export function normalizeMemorialItem(raw: MemorialItem): MemorialItem {
  const et =
    raw.eventType === 'birthday' || String(raw.eventType || '').toLowerCase() === 'birthday'
      ? 'birthday'
      : 'anniversary';
  return {
    ...raw,
    eventType: et,
    iconKey: raw.iconKey || 'love',
    colorThemeId: raw.colorThemeId || 'rose',
    customCategory: raw.customCategory || (raw.kind === 2 ? '纪念日' : '倒数日'),
    isPinned: raw.isPinned ?? 0,
  };
}

export function toMemorialRow(raw: MemorialItem): MemorialRow {
  const row = normalizeMemorialItem(raw);
  const anchorYmd = row.anchorDate.slice(0, 10);
  const eventType: MemorialEventType = row.eventType === 'birthday' ? 'birthday' : 'anniversary';
  const calc = calculateMemorialDays(anchorYmd, eventType);
  return { ...row, ...calc, anchorYmd, eventType };
}
