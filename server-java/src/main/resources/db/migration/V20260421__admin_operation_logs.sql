create table if not exists admin_users
(
    id            bigint auto_increment comment '主键'
        primary key,
    username      varchar(64)                        not null comment '用户名',
    name          varchar(64)                        not null comment '姓名',
    password      varchar(64)                        not null comment '密码',
    status        varchar(32)                        not null comment '状态',
    created_at    datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    updated_at    datetime default CURRENT_TIMESTAMP not null comment '更新时间',
    deleted_at    datetime                           null comment '删除时间',
    is_super      tinyint(1) default 0              not null comment '是否超级管理员'
)
    comment '管理员用户表' collate = utf8mb4_unicode_ci;

insert into admin_users (username, name, password, status, created_at, updated_at, deleted_at, is_super) values ('admin', '管理员', '123456', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, null, 1);

create table if not exists admin_operation_logs
(
    id            bigint auto_increment comment '主键'
        primary key,
    admin_user_id varchar(36)                        null comment '管理员ID',
    module        varchar(64)                        not null comment '模块',
    action        varchar(64)                        not null comment '动作',
    target_type   varchar(64)                        null comment '目标类型',
    target_id     varchar(64)                        null comment '目标ID',
    request_json  text                               null comment '请求快照',
    response_json text                               null comment '响应快照',
    result        varchar(32)                        not null comment '结果',
    created_at    datetime default CURRENT_TIMESTAMP not null comment '创建时间'
)
    comment '管理后台操作日志' collate = utf8mb4_unicode_ci;

create index idx_admin_operation_logs_module_created
    on admin_operation_logs (module, created_at);

create index idx_admin_operation_logs_admin_created
    on admin_operation_logs (admin_user_id, created_at);
