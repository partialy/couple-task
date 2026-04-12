export type MemorialEventType = 'anniversary' | 'birthday';

export interface MemorialComputed {
  isPast: boolean;
  passedDays: number;
  nextDays: number;
  nth: number;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseYmd(s: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s));
  if (m) {
    return startOfDay(new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10)));
  }
  return startOfDay(new Date(s));
}

/**
 * 与参考实现一致的倒数/已过天数、下一次周年序数等（按日历日差计算）
 */
export function calculateMemorialDays(
  targetDateStr: string,
  _eventType: MemorialEventType,
  todayInput = new Date()
): MemorialComputed {
  const today = startOfDay(todayInput);
  const target = parseYmd(targetDateStr);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isPast = diffDays < 0;
  const passedDays = isPast ? Math.abs(diffDays) : 0;

  const currentYear = today.getFullYear();
  const targetYear = target.getFullYear();
  let nth = currentYear - targetYear;

  const nextDate = new Date(target);
  nextDate.setFullYear(currentYear);
  if (nextDate.getTime() < today.getTime()) {
    nextDate.setFullYear(currentYear + 1);
    nth += 1;
  }

  const nextDiff = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return {
    isPast,
    passedDays,
    nextDays: isPast ? nextDiff : diffDays,
    nth: nth > 0 ? nth : 1,
  };
}

export function getMemorialSubtitle(
  anchorYmd: string,
  eventType: MemorialEventType,
  personName: string | null | undefined,
  calc: MemorialComputed
): string {
  const dateStr = anchorYmd.slice(0, 10);
  const who = personName?.trim() || 'Ta';
  if (eventType === 'birthday') {
    return `距 ${who} 的 ${calc.nth} 岁生日`;
  }
  if (eventType === 'anniversary') {
    if (calc.isPast && calc.nth > 0 && calc.passedDays > 365) {
      return `距 ${calc.nth} 周年还有 ${calc.nextDays} 天`;
    }
    return `目标日: ${dateStr}`;
  }
  return `目标日: ${dateStr}`;
}
