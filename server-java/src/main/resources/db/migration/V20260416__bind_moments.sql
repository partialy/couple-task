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

ALTER TABLE `bind_moments`
    ADD COLUMN `biz_uuid` VARCHAR(36) NULL COMMENT '关联业务主键，如任务 id' AFTER `content`,
    ADD COLUMN `biz_scene` VARCHAR(32) NULL COMMENT '业务场景：task_publish / task_complete' AFTER `biz_uuid`,
    ADD COLUMN `remark` VARCHAR(255) NULL COMMENT '备注，如【系统自动发出】' AFTER `biz_scene`;

ALTER TABLE `bind_moments`
    ADD UNIQUE KEY `uk_bind_moments_biz` (`bind_id`, `biz_uuid`, `biz_scene`);

-- 系统通知：在线推送 + 离线入库
CREATE TABLE IF NOT EXISTS `system_notices` (
                                                `id` VARCHAR(36) NOT NULL COMMENT '主键 UUID',
                                                `receiver_user_id` VARCHAR(36) NOT NULL COMMENT '接收人 user_id',
                                                `sender_user_id` VARCHAR(36) NULL COMMENT '触发人 user_id',
                                                `bind_id` VARCHAR(36) NULL COMMENT '绑定关系 id',
                                                `notice_type` VARCHAR(64) NOT NULL COMMENT '通知类型',
                                                `biz_id` VARCHAR(64) NULL COMMENT '业务 id，如 taskId/itemId',
                                                `title` VARCHAR(120) NOT NULL COMMENT '通知标题',
                                                `content` VARCHAR(500) NOT NULL COMMENT '通知正文',
                                                `payload` TEXT NULL COMMENT '扩展 JSON',
                                                `is_read` TINYINT NOT NULL DEFAULT 0 COMMENT '0未读 1已读',
                                                `read_at` DATETIME NULL COMMENT '已读时间',
                                                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                                `deleted_at` DATETIME NULL COMMENT '软删除时间',
                                                PRIMARY KEY (`id`),
                                                INDEX `idx_receiver_created` (`receiver_user_id`, `created_at`),
                                                INDEX `idx_receiver_read` (`receiver_user_id`, `is_read`),
                                                INDEX `idx_biz` (`notice_type`, `biz_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统通知';
