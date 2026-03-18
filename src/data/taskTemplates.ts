export interface TaskTemplate {
  id: number;
  title: string;
  desc: string;
  category: string;
  level: string;
  rewardType: string;
  source: 'official' | 'user';
  img: string;
  rewards: string[];
  tags: string[];
  taskType: string;
  repeatConfig?: string;
}

export const taskTemplates: TaskTemplate[] = [
  {
    id: 1,
    title: '早起打卡',
    desc: '连续一周在早上 7:30 前起床并拍照打卡。',
    category: '日常',
    level: '简单',
    rewardType: '积分',
    source: 'official',
    img: 'https://picsum.photos/seed/morning/400/600',
    rewards: ['50 积分'],
    tags: ['健康', '自律'],
    taskType: 'daily'
  },
  {
    id: 2,
    title: '周末大扫除',
    desc: '彻底清理客厅和厨房，让家里焕然一新。',
    category: '日常',
    level: '中等',
    rewardType: '礼物',
    source: 'official',
    img: 'https://picsum.photos/seed/clean/400/600',
    rewards: ['神秘小礼物'],
    tags: ['家务', '舒适'],
    taskType: 'weekly',
    repeatConfig: '{"days":[6,7]}'
  },
  {
    id: 3,
    title: '学习一项新技能',
    desc: '本月学会制作一款复杂的甜点或掌握一个软件的小技巧。',
    category: '日常',
    level: '高级',
    rewardType: '徽章',
    source: 'official',
    img: 'https://picsum.photos/seed/learn/400/600',
    rewards: ['学霸徽章'],
    tags: ['成长', '有趣'],
    taskType: 'monthly',
    repeatConfig: '{"days":[1]}'
  },
  {
    id: 4,
    title: '浪漫晚餐',
    desc: '亲手准备一顿三道菜的晚餐，并布置好餐桌。',
    category: '美食',
    level: '中等',
    rewardType: '积分',
    source: 'user',
    img: 'https://picsum.photos/seed/dinner/400/600',
    rewards: ['100 积分'],
    tags: ['浪漫', '厨艺'],
    taskType: 'one-time'
  },
  {
    id: 5,
    title: '周边游',
    desc: '去城市周边的古镇或森林公园进行一次徒步。',
    category: '旅行',
    level: '高级',
    rewardType: '礼物',
    source: 'official',
    img: 'https://picsum.photos/seed/travel/400/600',
    rewards: ['户外装备'],
    tags: ['户外', '放松'],
    taskType: 'one-time'
  },
  {
    id: 6,
    title: '读完一本书',
    desc: '本月读完一本一直想看但没看的书。',
    category: '心愿单',
    level: '简单',
    rewardType: '积分',
    source: 'user',
    img: 'https://picsum.photos/seed/book/400/600',
    rewards: ['30 积分'],
    tags: ['阅读', '静心'],
    taskType: 'monthly',
    repeatConfig: '{"days":[28]}'
  }
];
