-- 日记模块（单表方案：内容 + 对方点赞 + 评论JSON）

CREATE TABLE IF NOT EXISTS `diary_entries` (
  `id` VARCHAR(36) NOT NULL COMMENT '主键，UUID',
  `bind_id` VARCHAR(36) NOT NULL COMMENT '所属绑定关系ID',
  `user_id` VARCHAR(36) NOT NULL COMMENT '创建者用户ID',
  `entry_date` DATE NOT NULL COMMENT '日记所属日期',
  `mood` VARCHAR(32) NOT NULL COMMENT '心情标识',
  `content` TEXT NULL COMMENT '日记正文',
  `image_url` VARCHAR(512) NULL COMMENT '配图地址',
  `liked_by_partner` TINYINT NOT NULL DEFAULT 0 COMMENT '对方是否点赞：1是0否',
  `comments_json` JSON NULL COMMENT '评论数组JSON',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  INDEX `idx_diary_bind_date` (`bind_id`, `entry_date`),
  INDEX `idx_diary_bind_deleted_created` (`bind_id`, `deleted_at`, `created_at`),
  INDEX `idx_diary_user_date` (`user_id`, `entry_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日记表';
