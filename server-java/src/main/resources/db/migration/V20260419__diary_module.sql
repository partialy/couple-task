create table diary_entries
(
    id               varchar(36)                        not null comment '主键，UUID'
        primary key,
    bind_id          varchar(36)                        not null comment '所属绑定关系ID',
    user_id          varchar(36)                        not null comment '创建者用户ID',
    entry_date       date                               not null comment '日记所属日期',
    mood             varchar(32)                        not null comment '心情标识',
    content          text                               null comment '日记正文',
    image_url        varchar(512)                       null comment '配图地址',
    liked_by_partner tinyint  default 0                 not null comment '对方是否点赞：1是0否',
    author_json      json                               null comment '作者信息JSON',
    comments_json    json                               null comment '评论数组JSON',
    created_at       datetime default CURRENT_TIMESTAMP null comment '创建时间',
    updated_at       datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted_at       datetime                           null comment '软删除时间'
)
    comment '日记表' collate = utf8mb4_unicode_ci;

create index idx_diary_bind_date
    on diary_entries (bind_id, entry_date);

create index idx_diary_bind_deleted_created
    on diary_entries (bind_id, deleted_at, created_at);

create index idx_diary_user_date
    on diary_entries (user_id, entry_date);

