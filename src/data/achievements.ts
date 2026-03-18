const img100 = 'https://picsum.photos/seed/100/400/300';
const imgLcb = 'https://picsum.photos/seed/milestone/400/300';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isCompleted: boolean;
  completedAt?: string;
  category: string;
  points: number;
  image?: string;
  note?: string;
}

export interface AchievementCategory {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  achievements: Achievement[];
}

export const mockCategories: AchievementCategory[] = [
  {
    id: 'must-do-100',
    title: '情侣必做100件事',
    description: '记录我们一起走过的点点滴滴',
    coverImage: img100,
    achievements: [
      { id: '1', title: '一起看一次日出', description: '在海边或者山顶，迎接第一缕阳光', icon: 'Sunrise', isCompleted: true, completedAt: '2023-10-01', category: 'must-do-100', points: 50 },
      { id: '2', title: '穿一次情侣装', description: '走在大街上，向世界宣告我们的关系', icon: 'Shirt', isCompleted: true, completedAt: '2023-11-11', category: 'must-do-100', points: 20 },
      { id: '3', title: '一起做一顿饭', description: '你洗菜我切肉，享受平凡的烟火气', icon: 'Utensils', isCompleted: false, category: 'must-do-100', points: 30 },
      { id: '4', title: '去游乐园坐过山车', description: '在最高点大声喊出对方的名字', icon: 'Ticket', isCompleted: false, category: 'must-do-100', points: 40 },
      { id: '5', title: '一起养一只宠物', description: '给它起个可爱的名字，一起照顾它', icon: 'Cat', isCompleted: false, category: 'must-do-100', points: 100 },
      { id: '6', title: '给对方写一封信', description: '用最原始的方式，表达最真挚的情感', icon: 'Mail', isCompleted: false, category: 'must-do-100', points: 20 },
      { id: '7', title: '一起去一次海边', description: '光着脚丫踩在沙滩上，听海浪的声音', icon: 'Waves', isCompleted: false, category: 'must-do-100', points: 50 },
      { id: '8', title: '一起看一场演唱会', description: '在喜欢的歌手面前，挥舞荧光棒', icon: 'Music', isCompleted: false, category: 'must-do-100', points: 80 },
      { id: '9', title: '一起跨年', description: '在倒数声中拥吻，迎接新的一年', icon: 'Calendar', isCompleted: false, category: 'must-do-100', points: 50 },
      { id: '10', title: '为对方准备一次惊喜', description: '不需要多贵重，只要用心就好', icon: 'Gift', isCompleted: false, category: 'must-do-100', points: 40 },
    ]
  },
  {
    id: 'milestones',
    title: '恋爱里程碑',
    description: '每一个重要的时刻，都值得被铭记',
    coverImage: imgLcb,
    achievements: [
      { id: 'm1', title: '相识100天', description: '从陌生到熟悉，感谢有你', icon: 'Heart', isCompleted: true, completedAt: '2023-08-15', category: 'milestones', points: 100 },
      { id: 'm2', title: '相恋一周年', description: '一年的陪伴，未来的路还很长', icon: 'Award', isCompleted: false, category: 'milestones', points: 500 },
      { id: 'm3', title: '第一次旅行', description: '去一个陌生的城市，留下我们的足迹', icon: 'Plane', isCompleted: true, completedAt: '2023-12-25', category: 'milestones', points: 200 },
    ]
  }
];
