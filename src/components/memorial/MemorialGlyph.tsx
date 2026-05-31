import React from 'react';
import {
  BookOpen,
  Briefcase,
  Cake,
  Calendar,
  Gamepad2,
  Gift,
  Heart,
  Music,
  Palmtree,
  Plane,
  Star,
} from 'lucide-react';

const GLYPHS: Record<string, React.FC<{ className?: string }>> = {
  love: (p) => <Heart className={p.className ?? 'w-6 h-6'} strokeWidth={2} />,
  birthday: (p) => <Cake className={p.className ?? 'w-6 h-6'} strokeWidth={2} />,
  work: (p) => <Briefcase className={p.className ?? 'w-6 h-6'} strokeWidth={2} />,
  holiday: (p) => <Palmtree className={p.className ?? 'w-6 h-6'} strokeWidth={2} />,
  event: (p) => <Calendar className={p.className ?? 'w-6 h-6'} strokeWidth={2} />,
  star: (p) => <Star className={p.className ?? 'w-6 h-6'} strokeWidth={2} />,
  gift: (p) => <Gift className={p.className ?? 'w-6 h-6'} strokeWidth={2} />,
  music: (p) => <Music className={p.className ?? 'w-6 h-6'} strokeWidth={2} />,
  game: (p) => <Gamepad2 className={p.className ?? 'w-6 h-6'} strokeWidth={2} />,
  plane: (p) => <Plane className={p.className ?? 'w-6 h-6'} strokeWidth={2} />,
  book: (p) => <BookOpen className={p.className ?? 'w-6 h-6'} strokeWidth={2} />,
};

export const MEMORIAL_ICON_KEYS = Object.keys(GLYPHS);

interface MemorialGlyphProps {
  iconKey: string;
  customUrl?: string | null;
  className?: string;
}

export default function MemorialGlyph({ iconKey, customUrl, className }: MemorialGlyphProps) {
  if (customUrl) {
    return (
      <img
        src={customUrl}
        alt=""
        className={`w-full h-full object-cover rounded-xl ${className ?? ''}`}
      />
    );
  }
  const Cmp = GLYPHS[iconKey] || GLYPHS.star;
  return <Cmp className={className ?? 'w-6 h-6'} />;
}
