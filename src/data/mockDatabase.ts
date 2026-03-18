// 模拟数据库表结构和数据
// 方便后续建立真实的数据库表

/**
 * 1. 用户表 (users)
 * 存储用户的基本信息
 */
export const users = [
  {
    id: 1, // 用户ID，主键
    username: '兔兔', // 昵称
    gender: 'female', // 性别: 'male' | 'female' | 'other'
    avatar: 'https://picsum.photos/seed/user1/100/100', // 头像URL
    level: 5, // 用户等级
    title: '任务达人', // 称号
    birthday: '1999-05-20', // 生日
    anniversary: '2024-02-14', // 纪念日
    phone: '13800138000', // 手机号
    email: 'tutu@example.com', // 邮箱
    points: 1250, // 积分余额
    created_at: '2026-01-01T00:00:00Z', // 创建时间
    updated_at: '2026-03-09T00:00:00Z', // 更新时间
  },
  {
    id: 2,
    username: '小熊',
    gender: 'male',
    avatar: 'https://picsum.photos/seed/user2/100/100',
    level: 4,
    title: '新手上路',
    birthday: '1998-11-11',
    anniversary: '2024-02-14',
    phone: '13900139000',
    email: 'bear@example.com',
    points: 800,
    created_at: '2026-01-02T00:00:00Z',
    updated_at: '2026-03-09T00:00:00Z',
  }
];

/**
 * 2. 任务分类表 (categories)
 * 存储任务的分类信息
 */
export const categories = [
  { id: 1, name: '旅行', sort_order: 1 }, // 分类ID(主键), 分类名称, 排序权重
  { id: 2, name: '美食', sort_order: 2 },
  { id: 3, name: '日常', sort_order: 3 },
  { id: 4, name: '心愿单', sort_order: 4 },
  { id: 5, name: '纪念日', sort_order: 5 },
];

/**
 * 3. 任务等级表 (task_levels)
 * 存储任务的难度等级和对应的最大奖励数
 */
export const task_levels = [
  { id: 1, name: '小事', max_rewards: 1, sort_order: 1 }, // 等级ID(主键), 等级名称, 最大奖励数量, 排序权重
  { id: 2, name: '简单', max_rewards: 1, sort_order: 2 },
  { id: 3, name: '中等', max_rewards: 2, sort_order: 3 },
  { id: 4, name: '高级', max_rewards: 3, sort_order: 4 },
  { id: 5, name: '困难', max_rewards: 3, sort_order: 5 },
  { id: 6, name: '极难', max_rewards: 4, sort_order: 6 },
];

/**
 * 4. 标签表 (tags)
 * 存储所有可用的标签
 */
export const tags = [
  { id: 1, name: '浪漫' }, // 标签ID(主键), 标签名称
  { id: 2, name: '宅家' },
  { id: 3, name: '音乐' },
  { id: 4, name: '游乐园' },
  { id: 5, name: '宠物' },
];

/**
 * 5. 任务表 (tasks)
 * 存储任务的核心信息
 */
export const tasks = [
  {
    id: 1, // 任务ID，主键
    author_id: 2, // 发布者ID，关联 users.id
    category_id: 1, // 分类ID，关联 categories.id
    level_id: 4, // 等级ID，关联 task_levels.id
    title: '一起去看海', // 任务标题
    description: '周末去阿那亚看日出', // 任务详细描述
    cover_image: 'https://picsum.photos/seed/sea/400/600', // 封面图URL
    deadline: '2026-05-01', // 截止日期 (YYYY-MM-DD 或 null)
    location: '阿那亚', // 任务地点
    status: 'pending', // 任务状态: 'pending'(待接受) | 'accepted'(进行中) | 'completed'(已完成) | 'cancelled'(已取消)
    is_private: false, // 是否为私密任务 (布尔值)
    is_privileged: true, // 是否使用了特权卡加急 (布尔值)
    created_at: '2026-03-01T10:00:00Z', // 创建时间
    updated_at: '2026-03-01T10:00:00Z', // 更新时间
  },
  {
    id: 2,
    author_id: 1,
    category_id: 2,
    level_id: 2,
    title: '做一顿晚餐',
    description: '尝试新买的牛排煎锅，做一次烛光晚餐',
    cover_image: 'https://picsum.photos/seed/food/400/300',
    deadline: '2026-03-15',
    location: '家里',
    status: 'pending',
    is_private: false,
    is_privileged: false,
    created_at: '2026-03-05T14:30:00Z',
    updated_at: '2026-03-05T14:30:00Z',
  }
];

/**
 * 6. 任务-标签关联表 (task_tags)
 * 多对多关系表，关联任务和标签
 */
export const task_tags = [
  { task_id: 1, tag_id: 1 }, // 关联 tasks.id 和 tags.id
  { task_id: 2, tag_id: 2 },
];

/**
 * 7. 任务图片表 (task_images)
 * 存储任务的补充图片（一对多关系）
 */
export const task_images = [
  {
    id: 1, // 图片ID，主键
    task_id: 1, // 关联 tasks.id
    image_url: 'https://picsum.photos/seed/sea1/400/400', // 图片URL
    sort_order: 1, // 排序权重
  },
  {
    id: 2,
    task_id: 1,
    image_url: 'https://picsum.photos/seed/sea2/400/400',
    sort_order: 2,
  },
  {
    id: 3,
    task_id: 2,
    image_url: 'https://picsum.photos/seed/food1/400/400',
    sort_order: 1,
  }
];

/**
 * 8. 任务奖励表 (task_rewards)
 * 存储任务完成后的奖励内容（一对多关系）
 */
export const task_rewards = [
  {
    id: 1, // 奖励ID，主键
    task_id: 1, // 关联 tasks.id
    type: 'normal', // 奖励类型: 'normal'(普通文字奖励) | 'wildcard'(万能卡) | 'points'(积分)
    content: '100 积分', // 奖励内容文本
    icon: 'Gift', // 奖励图标标识符
    color: 'pink', // 奖励颜色标识符
    amount: 100, // 数量（如果是积分或万能卡）
    sort_order: 1, // 排序权重
  },
  {
    id: 2,
    task_id: 1,
    type: 'normal',
    content: '神秘礼物',
    icon: 'Heart',
    color: 'rose',
    amount: 1,
    sort_order: 2,
  },
  {
    id: 3,
    task_id: 2,
    type: 'wildcard',
    content: '1 张万能卡',
    icon: 'Sparkles',
    color: 'purple',
    amount: 1,
    sort_order: 1,
  }
];

/**
 * 9. 商店商品表 (shop_items)
 * 存储商店中可兑换的商品或特权
 */
export const shop_items = [
  {
    id: 1, // 商品ID，主键
    name: '特权卡', // 商品名称
    description: '享有更高优先级和特权', // 商品描述
    points_cost: 200, // 兑换所需积分
    icon: 'package', // 图标标识符
    color: 'bg-purple-100 dark:bg-purple-900/30', // 颜色样式
    status: 'active', // 状态: 'active'(上架) | 'inactive'(下架)
    created_at: '2026-01-01T00:00:00Z', // 创建时间
  },
  {
    id: 2,
    name: '延期卡',
    description: '延长任务的截止时间24小时',
    points_cost: 150,
    icon: 'zap',
    color: 'bg-amber-100 dark:bg-amber-900/30',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 3,
    name: '双人电影票',
    description: '兑换任意场次双人电影票',
    points_cost: 2000,
    icon: 'ticket',
    color: 'bg-rose-100 dark:bg-rose-900/30',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
  }
];

/**
 * 10. 用户道具/背包表 (user_items)
 * 存储用户已兑换或获得的道具（多对多关系带数量）
 */
export const user_items = [
  {
    id: 1, // 记录ID，主键
    user_id: 1, // 关联 users.id
    item_id: 1, // 关联 shop_items.id
    quantity: 3, // 拥有数量
    acquired_at: '2026-03-08T12:00:00Z', // 最近获得时间
  },
  {
    id: 2,
    user_id: 1,
    item_id: 2,
    quantity: 1,
    acquired_at: '2026-03-09T08:00:00Z',
  }
];

/**
 * ==========================================
 * 流水与日志表设计 (Logs & Transactions)
 * ==========================================
 * 建议：将流水拆分为多张表（积分流水、道具流水、任务日志），而不是用一张大表靠字段区分。
 * 原因：
 * 1. 字段差异大：积分流水只关心金额（amount），道具流水关心道具ID（item_id）和数量，任务日志关心状态变更（status）。
 * 2. 外键约束：拆分后可以建立清晰的外键约束（如 item_transactions.item_id 关联 shop_items.id），保证数据完整性。
 * 3. 查询性能：拆分后单表数据量更小，索引更精确，查询（如“查询某人的积分收支明细”）速度更快。
 */

/**
 * 11. 积分流水表 (point_transactions)
 * 记录用户积分的增加和扣除明细
 */
export const point_transactions = [
  {
    id: 1, // 流水ID，主键
    user_id: 1, // 关联 users.id
    amount: -200, // 变动数量（正数为增加，负数为扣除）
    transaction_type: 'shop_purchase', // 交易类型: 'task_reward'(任务奖励) | 'shop_purchase'(商店消费) | 'system_gift'(系统赠送) | 'code'(激活码兑换)
    reference_id: 1, // 关联的业务ID（如果是商店消费，则关联 shop_items.id；如果是任务奖励，则关联 tasks.id）
    description: '在商店兑换了【特权卡】', // 流水描述
    created_at: '2026-03-08T12:00:00Z', // 发生时间
  },
  {
    id: 2,
    user_id: 1,
    amount: 50,
    transaction_type: 'task_reward',
    reference_id: 2, 
    description: '完成了任务【做一顿晚餐】',
    created_at: '2026-03-09T18:30:00Z',
  }
];

/**
 * 12. 道具流水表 (item_transactions)
 * 记录用户道具（特权卡、延期卡等）的获取和消耗明细
 */
export const item_transactions = [
  {
    id: 1, // 流水ID，主键
    user_id: 1, // 关联 users.id
    item_id: 1, // 关联 shop_items.id (特权卡)
    quantity: 1, // 变动数量（正数为获得，负数为消耗）
    transaction_type: 'shop_purchase', // 交易类型: 'shop_purchase'(商店购买) | 'task_use'(任务使用) | 'system_gift'(系统赠送)
    reference_id: null, // 关联的业务ID（如果是任务使用，则关联 tasks.id）
    description: '在商店兑换获得', // 流水描述
    created_at: '2026-03-08T12:00:00Z', // 发生时间
  },
  {
    id: 2,
    user_id: 1,
    item_id: 1,
    quantity: -1,
    transaction_type: 'task_use',
    reference_id: 1, // 关联 tasks.id = 1 (一起去看海)
    description: '发布任务【一起去看海】时使用了特权卡加急',
    created_at: '2026-03-09T10:00:00Z',
  }
];

/**
 * 13. 任务状态变更日志表 (task_logs)
 * 记录任务从发布、接受、完成到取消的整个生命周期
 */
export const task_logs = [
  {
    id: 1, // 日志ID，主键
    task_id: 1, // 关联 tasks.id
    user_id: 2, // 触发此操作的用户ID (关联 users.id)
    action: 'create', // 操作类型: 'create'(发布) | 'accept'(接受) | 'complete'(完成) | 'cancel'(取消)
    previous_status: null, // 变更前的状态
    new_status: 'pending', // 变更后的状态
    remark: '用户发布了任务', // 备注说明
    created_at: '2026-03-01T10:00:00Z', // 发生时间
  },
  {
    id: 2,
    task_id: 1,
    user_id: 1, // 兔兔接受了小熊的任务
    action: 'accept',
    previous_status: 'pending',
    new_status: 'accepted',
    remark: '用户接受了任务',
    created_at: '2026-03-02T09:00:00Z',
  }
];
