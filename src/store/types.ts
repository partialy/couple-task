// User types
export interface User {
  id: number;
  username: string;
  gender: 'male' | 'female' | 'other';
  avatar: string;
  level: number;
  title: string;
  birthday: string;
  anniversary: string;
  phone: string;
  email: string;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  sort_order: number;
}

export interface TaskLevel {
  id: number;
  name: string;
  max_rewards: number;
  sort_order: number;
}

export interface Tag {
  id: number;
  name: string;
}

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface Task {
  id: number;
  author_id: number;
  category_id: number;
  level_id: number;
  title: string;
  description: string;
  cover_image: string;
  deadline: string;
  location: string;
  status: TaskStatus;
  is_private: boolean;
  is_privileged: boolean;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
  rewards?: TaskReward[];
  images?: TaskImage[];
  assignee?: string;
  isBookmarked?: boolean;
  authorAvatar?: string;
  author?: string;
  gender?: 'male' | 'female';
}

export interface TaskReward {
  id: number;
  task_id: number;
  type: 'normal' | 'wildcard' | 'points';
  content: string;
  icon: string;
  color: string;
  amount: number;
  sort_order: number;
}

export interface TaskImage {
  id: number;
  task_id: number;
  image_url: string;
  sort_order: number;
}

export interface ShopItem {
  id: number;
  name: string;
  description: string;
  points_cost: number;
  icon: string;
  color: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface UserItem {
  id: number;
  user_id: number;
  item_id: number;
  quantity: number;
  acquired_at: string;
}
