-- 纪念日模块：绑定维度下的倒数日记录（含生日、纪念日等）
-- 与 schedules 表同属 bind_id 隔离的数据

CREATE TABLE IF NOT EXISTS `memorial_days` (
  `id` VARCHAR(36) NOT NULL COMMENT '主键，UUID',
  `bind_id` VARCHAR(36) NOT NULL COMMENT '所属绑定关系ID，与 schedules.bind_id 含义一致',
  `user_id` VARCHAR(36) NOT NULL COMMENT '创建者用户ID',
  `title` VARCHAR(60) NOT NULL COMMENT '展示标题，如生日、恋爱纪念日',
  `event_type` VARCHAR(20) NOT NULL DEFAULT 'anniversary' COMMENT '事件类型：anniversary=纪念日/倒数 birthday=生日',
  `icon_key` VARCHAR(32) NOT NULL DEFAULT 'love' COMMENT '预设图标标识',
  `custom_icon_url` VARCHAR(512) NULL COMMENT '自定义图标图片 URL',
  `color_theme_id` VARCHAR(32) NOT NULL DEFAULT 'rose' COMMENT '主题色标识',
  `custom_category` VARCHAR(60) NOT NULL DEFAULT '纪念日' COMMENT '用户自定义分类标签',
  `person_name` VARCHAR(60) NULL COMMENT '生日类型时：寿星姓名',
  `is_pinned` TINYINT NOT NULL DEFAULT 0 COMMENT '是否置顶大卡片：1=是 0=否',
  `kind` TINYINT NOT NULL COMMENT '兼容字段：1=倒数日 2=纪念日',
  `anchor_date` DATE NOT NULL COMMENT '锚点日期',
  `repeat_yearly` TINYINT NOT NULL DEFAULT 0 COMMENT '是否每年重复（兼容旧逻辑）',
  `note` TEXT NULL COMMENT '备注',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序权重',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` DATETIME NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  INDEX `idx_bind_id` (`bind_id`),
  INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='纪念日与倒数日表';
