-- 若已有库缺少 description 列，执行本脚本一次
ALTER TABLE reward_codes
    ADD COLUMN description text NULL COMMENT '描述' AFTER reward_name;
