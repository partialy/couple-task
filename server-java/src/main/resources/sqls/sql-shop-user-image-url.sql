-- 若曾执行过旧版「加 image_url 列」脚本，可先合并数据再删列（封面图统一存 icon）
-- UPDATE shop_items SET icon = image_url WHERE image_url IS NOT NULL AND TRIM(image_url) <> '';
-- UPDATE user_items SET icon = image_url WHERE image_url IS NOT NULL AND TRIM(image_url) <> '';
-- ALTER TABLE shop_items DROP COLUMN image_url;
-- ALTER TABLE user_items DROP COLUMN image_url;

ALTER TABLE shop_items MODIFY COLUMN icon varchar(512) NULL COMMENT 'Lucide 图标 key 或图片 URL';
ALTER TABLE user_items MODIFY COLUMN icon varchar(512) NULL COMMENT 'Lucide 图标 key 或图片 URL';
