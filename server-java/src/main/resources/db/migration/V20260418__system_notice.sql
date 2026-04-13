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
