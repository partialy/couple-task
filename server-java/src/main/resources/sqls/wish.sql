-- 与 db/migration/V20260414__wish_module.sql 同步，便于总库执行

CREATE TABLE IF NOT EXISTS `wish_pick_quota` (
  `id` VARCHAR(36) NOT NULL COMMENT '主键 UUID',
  `bind_id` VARCHAR(36) NOT NULL COMMENT '绑定关系ID',
  `user_id` VARCHAR(36) NOT NULL COMMENT '拥有摘取次数的用户（摘对方心愿池）',
  `pick_chances` INT NOT NULL DEFAULT 0 COMMENT '当前剩余摘取次数',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_bind_user` (`bind_id`, `user_id`),
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='心愿摘取次数（每人每绑定一行）';

CREATE TABLE IF NOT EXISTS `wish_items` (
  `id` VARCHAR(36) NOT NULL COMMENT '主键 UUID',
  `bind_id` VARCHAR(36) NOT NULL COMMENT '绑定关系ID',
  `publisher_user_id` VARCHAR(36) NOT NULL COMMENT '发布者',
  `pickable_by_user_id` VARCHAR(36) NOT NULL COMMENT '可摘取者（对方）',
  `content` VARCHAR(500) NOT NULL COMMENT '心愿正文',
  `color_key` VARCHAR(32) NOT NULL COMMENT '星星颜色键，如 rose400',
  `bottle_side` TINYINT NOT NULL DEFAULT 1 COMMENT '1=暖色瓶 2=冷色瓶',
  `picked_times` INT NOT NULL DEFAULT 0 COMMENT '累计被摘取次数（放回不减少）',
  `status` VARCHAR(32) NOT NULL DEFAULT 'pending' COMMENT 'pending/picked/done/deleted 等，库内不枚举',
  `last_picked_by_user_id` VARCHAR(36) NULL COMMENT '最近一次摘取人',
  `last_picked_at` DATETIME NULL COMMENT '最近一次摘出时间',
  `fulfilled_at` DATETIME NULL COMMENT '对方收下时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME NULL COMMENT '软删除时间',
  `record_hidden_at` DATETIME NULL COMMENT '发布者在记录页隐藏',
  PRIMARY KEY (`id`),
  INDEX `idx_bind_publisher` (`bind_id`, `publisher_user_id`),
  INDEX `idx_bind_pickable_status` (`bind_id`, `pickable_by_user_id`, `status`),
  INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='心愿条目';
