-- 日记作者信息JSON：用于前端直接展示头像、昵称、性别等
ALTER TABLE `diary_entries`
  ADD COLUMN `author_json` JSON NULL COMMENT '作者信息JSON' AFTER `liked_by_partner`;
