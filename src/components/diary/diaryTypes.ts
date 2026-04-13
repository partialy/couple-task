import { DiaryAuthorMeta, DiaryCommentItem, DiaryItem } from '@/api/service/diary';

export interface DiaryRow extends DiaryItem {
  author: DiaryAuthorMeta | null;
  comments: DiaryCommentItem[];
}

export function parseDiaryAuthor(authorJson?: string | null): DiaryAuthorMeta | null {
  if (!authorJson) return null;
  try {
    const x = JSON.parse(authorJson);
    if (!x || typeof x !== 'object') return null;
    return {
      userId: String(x.userId || ''),
      userName: String(x.userName || ''),
      nickname: x.nickname ? String(x.nickname) : undefined,
      avatar: x.avatar ? String(x.avatar) : undefined,
      gender: x.gender ? String(x.gender) : undefined,
      time: x.time ? String(x.time) : undefined,
    };
  } catch {
    return null;
  }
}

export function parseDiaryComments(commentsJson?: string | null): DiaryCommentItem[] {
  if (!commentsJson) return [];
  try {
    const parsed = JSON.parse(commentsJson);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x === 'object')
      .map((x) => ({
        id: String(x.id || ''),
        userId: String(x.userId || ''),
        userName: String(x.userName || '匿名'),
        nickname: x.nickname ? String(x.nickname) : undefined,
        avatar: x.avatar ? String(x.avatar) : undefined,
        gender: x.gender ? String(x.gender) : undefined,
        content: String(x.content || ''),
        time: String(x.time || ''),
      }));
  } catch {
    return [];
  }
}

export function toDiaryRow(item: DiaryItem): DiaryRow {
  return {
    ...item,
    author: parseDiaryAuthor(item.authorJson),
    comments: parseDiaryComments(item.commentsJson),
  };
}
