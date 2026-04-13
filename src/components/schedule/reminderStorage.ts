const NO_REMIND_STORAGE_KEY = 'schedule_no_remind_ids';

function parseStoredIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string' && id.length > 0);
  } catch {
    return [];
  }
}

export function getNoRemindScheduleIds(): Set<string> {
  return new Set(parseStoredIds(localStorage.getItem(NO_REMIND_STORAGE_KEY)));
}

export function markScheduleNoRemind(ids: string[]): void {
  if (ids.length === 0) return;
  const merged = new Set([...getNoRemindScheduleIds(), ...ids]);
  localStorage.setItem(NO_REMIND_STORAGE_KEY, JSON.stringify(Array.from(merged)));
}
