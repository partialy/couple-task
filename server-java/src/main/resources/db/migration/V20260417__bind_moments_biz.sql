-- 动态业务关联：任务 id + 场景去重；备注（系统自动等）

ALTER TABLE `bind_moments`
  ADD COLUMN `biz_uuid` VARCHAR(36) NULL COMMENT '关联业务主键，如任务 id' AFTER `content`,
  ADD COLUMN `biz_scene` VARCHAR(32) NULL COMMENT '业务场景：task_publish / task_complete' AFTER `biz_uuid`,
  ADD COLUMN `remark` VARCHAR(255) NULL COMMENT '备注，如【系统自动发出】' AFTER `biz_scene`;

ALTER TABLE `bind_moments`
  ADD UNIQUE KEY `uk_bind_moments_biz` (`bind_id`, `biz_uuid`, `biz_scene`);
