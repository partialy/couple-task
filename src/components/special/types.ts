import React from 'react';
import { Star, Heart, Trophy, Crown, Gem, Sparkles } from 'lucide-react';

export interface SpecialItem {
  id: number;
  name: string;
  desc: string;
  cards: number; // Number of Universal Redemption Cards required
  icon: string;
  color: string;
  image?: string;
  status?: 'active' | 'inactive';
}

export const specialIconMap: Record<string, React.ElementType> = {
  star: Star,
  heart: Heart,
  trophy: Trophy,
  crown: Crown,
  gem: Gem,
  sparkles: Sparkles,
};

export const specialColorStyles: Record<string, { bg: string, text: string }> = {
  indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-500' },
  violet: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-500' },
  fuchsia: { bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/30', text: 'text-fuchsia-500' },
  rose: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-500' },
  amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-500' },
  cyan: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-500' },
};
