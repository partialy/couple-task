-- 纪念日与倒数日表（绑定维度）

CREATE TABLE IF NOT EXISTS `memorial_days` (
  `id` VARCHAR(36) NOT NULL COMMENT '主键，UUID',
  `bind_id` VARCHAR(36) NOT NULL COMMENT '所属绑定关系ID，与 schedules.bind_id 含义一致',
  `user_id` VARCHAR(36) NOT NULL COMMENT '创建者用户ID',
  `title` VARCHAR(60) NOT NULL COMMENT '展示标题，如生日、恋爱纪念日',
  `kind` TINYINT NOT NULL COMMENT '类型：1=倒数日（目标日或每年重复） 2=纪念日（起点日，计算距今与周年）',
  `anchor_date` DATE NOT NULL COMMENT '锚点日期：倒数日为目标日或每年重复的月日参考；纪念日为起点日',
  `repeat_yearly` TINYINT NOT NULL DEFAULT 0 COMMENT '是否每年重复：仅 kind=1 时有效，1=每年同一月日重复，0=仅一次',
  `note` TEXT NULL COMMENT '备注，可空',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '列表排序权重',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME NULL COMMENT '软删除时间，非空表示已删除',
  PRIMARY KEY (`id`),
  INDEX `idx_bind_id` (`bind_id`),
  INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='纪念日与倒数日表';
