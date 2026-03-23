-- 任务上架状态：与 status（pending/in-progress/...）独立
ALTER TABLE tasks
    ADD COLUMN list_status VARCHAR(20) NOT NULL DEFAULT 'published'
        COMMENT 'draft=草稿 unpublished=已下架 published=已上架' AFTER status;
