import React from 'react';
import { Package, Zap, Ticket, Coffee, Gift, Sparkles } from 'lucide-react';

export interface ShopItem {
  id: string;
  name: string;
  desc: string;
  points: number;
  icon: string;
  color: string;
  image?: string;
  status?: 'active' | 'inactive';
}

export const iconMap: Record<string, React.ElementType> = {
  package: Package,
  zap: Zap,
  ticket: Ticket,
  coffee: Coffee,
  gift: Gift,
  sparkles: Sparkles,
};

export const colorStyles: Record<string, { bg: string, text: string }> = {
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-500' },
  amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-500' },
  rose: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-500' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-500' },
  pink: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-500' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-500' },
};
