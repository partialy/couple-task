-- 倒数日界面扩展：事件类型、图标、主题、分类、置顶等

ALTER TABLE `memorial_days`
  ADD COLUMN `event_type` VARCHAR(20) NOT NULL DEFAULT 'anniversary' COMMENT '事件类型：anniversary=纪念日/倒数 birthday=生日' AFTER `title`,
  ADD COLUMN `icon_key` VARCHAR(32) NOT NULL DEFAULT 'love' COMMENT '预设图标标识，如 love、birthday、plane',
  ADD COLUMN `custom_icon_url` VARCHAR(512) NULL COMMENT '自定义图标图片 URL',
  ADD COLUMN `color_theme_id` VARCHAR(32) NOT NULL DEFAULT 'rose' COMMENT '主题色标识：rose、amber 等',
  ADD COLUMN `custom_category` VARCHAR(60) NOT NULL DEFAULT '纪念日' COMMENT '用户自定义分类标签',
  ADD COLUMN `person_name` VARCHAR(60) NULL COMMENT '生日类型时：寿星姓名',
  ADD COLUMN `is_pinned` TINYINT NOT NULL DEFAULT 0 COMMENT '是否置顶展示大卡片：1=是 0=否';

UPDATE `memorial_days`
SET `custom_category` = CASE WHEN `kind` = 2 THEN '纪念日' ELSE '倒数日' END;
