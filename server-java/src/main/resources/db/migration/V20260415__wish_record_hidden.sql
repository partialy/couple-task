-- 我的心愿记录页：发布者可在记录列表中隐藏条目（不影响对方瓶中摘取）

ALTER TABLE wish_items
    ADD COLUMN record_hidden_at DATETIME NULL COMMENT '发布者在记录页隐藏' AFTER deleted_at;
