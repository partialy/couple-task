-- 绑定维度「我们的动态」：正文、多图、点赞、评论

CREATE TABLE IF NOT EXISTS `bind_moments` (
  `id` VARCHAR(36) NOT NULL COMMENT '主键 UUID',
  `bind_id` VARCHAR(36) NOT NULL COMMENT '绑定关系ID',
  `author_user_id` VARCHAR(36) NOT NULL COMMENT '发布者用户ID',
  `content` TEXT NOT NULL COMMENT '动态正文',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  INDEX `idx_bind_created` (`bind_id`, `created_at`),
  INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='绑定动态主表';

CREATE TABLE IF NOT EXISTS `bind_moment_images` (
  `id` VARCHAR(36) NOT NULL COMMENT '主键 UUID',
  `moment_id` VARCHAR(36) NOT NULL COMMENT '动态ID',
  `url` VARCHAR(512) NOT NULL COMMENT '图片URL',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  PRIMARY KEY (`id`),
  INDEX `idx_moment_id` (`moment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='动态配图';

CREATE TABLE IF NOT EXISTS `bind_moment_likes` (
  `id` VARCHAR(36) NOT NULL COMMENT '主键 UUID',
  `moment_id` VARCHAR(36) NOT NULL COMMENT '动态ID',
  `user_id` VARCHAR(36) NOT NULL COMMENT '点赞用户ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_moment_user` (`moment_id`, `user_id`),
  INDEX `idx_moment_id` (`moment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='动态点赞';

CREATE TABLE IF NOT EXISTS `bind_moment_comments` (
  `id` VARCHAR(36) NOT NULL COMMENT '主键 UUID',
  `moment_id` VARCHAR(36) NOT NULL COMMENT '动态ID',
  `author_user_id` VARCHAR(36) NOT NULL COMMENT '评论者用户ID',
  `content` VARCHAR(1000) NOT NULL COMMENT '评论内容',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `deleted_at` DATETIME NULL COMMENT '软删除',
  PRIMARY KEY (`id`),
  INDEX `idx_moment_created` (`moment_id`, `created_at`),
  INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='动态评论';
