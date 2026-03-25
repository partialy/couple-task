-- 日程/行程表
CREATE TABLE IF NOT EXISTS `schedules` (
  `id` VARCHAR(36) NOT NULL COMMENT '主键，UUID',
  `bind_id` VARCHAR(36) NOT NULL COMMENT '所属绑定关系ID',
  `user_id` VARCHAR(36) NOT NULL COMMENT '创建者用户ID',
  `type` VARCHAR(60) NOT NULL DEFAULT '未命名日程' COMMENT '日程类型名称，最大20汉字',
  `description` TEXT NULL COMMENT '描述',
  `location` VARCHAR(255) NULL COMMENT '位置',
  `images` TEXT NULL COMMENT '图片列表，JSON数组格式如["url1","url2"]，最多3个',
  `event_time` DATETIME NOT NULL COMMENT '具体事件日期时间',
  `event_relation_id` VARCHAR(36) NULL COMMENT '关联业务ID，例如关联某个任务',
  `popup_remind` TINYINT NOT NULL DEFAULT 1 COMMENT '当天是否弹窗提示（1=是，0=否）',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME NULL COMMENT '软删除时间戳',
  PRIMARY KEY (`id`),
  INDEX `idx_bind_id` (`bind_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_event_time` (`event_time`),
  INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日程/行程表';
