export type DiaryMoodKey =
  | 'calm'
  | 'happy'
  | 'crush'
  | 'love'
  | 'satisfied'
  | 'excited'
  | 'angry'
  | 'annoyed'
  | 'sad'
  | 'sorrow'
  | 'speechless'
  | 'tired';

export const DIARY_MOODS: Array<{
  id: DiaryMoodKey;
  icon: string;
  label: string;
  color: string;
}> = [
  { id: 'calm', icon: '😐', label: '平静', color: 'text-emerald-500' },
  { id: 'happy', icon: '😊', label: '开心', color: 'text-amber-500' },
  { id: 'crush', icon: '💓', label: '心动', color: 'text-pink-500' },
  { id: 'love', icon: '😍', label: '超爱', color: 'text-rose-500' },
  { id: 'satisfied', icon: '😌', label: '满足', color: 'text-teal-500' },
  { id: 'excited', icon: '🤩', label: '兴奋', color: 'text-yellow-500' },
  { id: 'angry', icon: '😠', label: '生气', color: 'text-red-500' },
  { id: 'annoyed', icon: '😤', label: '烦躁', color: 'text-orange-500' },
  { id: 'sad', icon: '😢', label: '伤心', color: 'text-sky-500' },
  { id: 'sorrow', icon: '😭', label: '难过', color: 'text-blue-500' },
  { id: 'speechless', icon: '🙄', label: '无语', color: 'text-slate-500' },
  { id: 'tired', icon: '😴', label: '好累', color: 'text-indigo-500' },
];

export const getMoodMeta = (mood?: string | null) =>
  DIARY_MOODS.find((m) => m.id === mood) || DIARY_MOODS[0];
