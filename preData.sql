-- 预制数据：分类
INSERT INTO `categories` (`id`, `name`, `sort_order`, `belong_binding_id`) VALUES
(UUID(), '旅行', 1, ''),
(UUID(), '美食', 2, ''),
(UUID(), '日常', 3, ''),
(UUID(), '心愿单', 4, ''),
(UUID(), '纪念日', 5, '');

-- 预制数据：任务等级
INSERT INTO `task_levels` (`id`, `name`, `max_rewards`, `sort_order`, `belong_binding_id`) VALUES
(UUID(), '小事', 1, 1, ''),
(UUID(), '简单', 1, 2, ''),
(UUID(), '中等', 2, 3, ''),
(UUID(), '高级', 3, 4, ''),
(UUID(), '困难', 3, 5, ''),
(UUID(), '极难', 4, 6, '');

-- 预制数据：标签
INSERT INTO `tags` (`id`, `name`, `belong_binding_id`) VALUES
(UUID(), '浪漫', ''),
(UUID(), '宅家', ''),
(UUID(), '音乐', ''),
(UUID(), '游乐园', ''),
(UUID(), '宠物', '');

-- 预制数据：商店道具
INSERT INTO `shop_items` (`id`, `name`, `description`, `points_cost`, `icon`, `color`, `status`, `created_at`, `belong_binding_id`) VALUES
(UUID(), '特权卡', '享有更高优先级和特权', 200, 'package', 'bg-purple-100 dark:bg-purple-900/30', 'active', NOW(), ''),
(UUID(), '小要求卡', '满足小要求，获得额外奖励', 150, 'zap', 'bg-amber-100 dark:bg-amber-900/30', 'active', NOW(), ''),
(UUID(), '中要求卡', '满足中要求，获得额外奖励', 1000, 'sparkles', 'bg-amber-100 dark:bg-amber-900/30', 'active', NOW(), ''),
(UUID(), '大要求卡', '满足大要求，获得额外奖励', 2000, 'gift', 'bg-rose-100 dark:bg-rose-900/30', 'active', NOW(), '');
