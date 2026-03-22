-- 特别奖励兑换落库 user_items：item_id 可能为 special_items.id，需解除对 shop_items 的外键
-- 若库中外键名不同，请手动调整 DROP 语句
ALTER TABLE user_items DROP FOREIGN KEY user_items_ibfk_2;

-- 是否来自特别奖励兑换（0 否，1 是）
ALTER TABLE user_items
    ADD COLUMN is_special TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否来自特别奖励兑换' AFTER color;
