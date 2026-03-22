create table achievement_categories
(
    id          varchar(36)   not null comment 'ID，全局唯一'
        primary key,
    title       varchar(50)   not null comment '分类标题',
    description varchar(255)  null comment '分类描述',
    cover_image varchar(255)  null comment '封面图',
    sort_order  int default 0 null comment '排序权重'
)
    comment '成就分类表' collate = utf8mb4_unicode_ci;

create table achievements
(
    id            varchar(36)   not null comment 'ID，全局唯一'
        primary key,
    category_id   varchar(36)   not null comment '所属分类ID',
    title         varchar(100)  not null comment '成就标题',
    description   varchar(255)  null comment '成就描述',
    icon          varchar(50)   null comment '图标',
    points_reward int default 0 null comment '完成奖励积分',
    sort_order    int default 0 null comment '排序权重',
    constraint achievements_ibfk_1
        foreign key (category_id) references achievement_categories (id)
            on delete cascade
)
    comment '成就表' collate = utf8mb4_unicode_ci;

create index category_id
    on achievements (category_id);

create table categories
(
    id                varchar(36)   not null comment 'ID，全局唯一'
        primary key,
    name              varchar(50)   not null comment '分类名称',
    sort_order        int default 0 null comment '排序权重',
    belong_binding_id varchar(36)   null comment '所属绑定ID',
    constraint uk_name_binding
        unique (name, belong_binding_id)
)
    comment '任务分类表' collate = utf8mb4_unicode_ci;

create index belong_binding_id
    on categories (belong_binding_id);

create table shop_items
(
    id                varchar(36)                           not null comment 'ID，全局唯一'
        primary key,
    name              varchar(50)                           not null comment '商品名称',
    description       text                                  null comment '商品描述',
    item_type         varchar(20) default 'prop'            null comment '道具类型 (prop, wildcard, other)',
    points_cost       int                                   not null comment '兑换所需积分',
    icon              varchar(512)                          null comment 'Lucide 图标 key 或图片 URL',
    color             varchar(50)                           null comment '颜色样式',
    status            varchar(20) default 'active'          null comment '状态 (active, inactive)',
    stock             int         default -1                null comment '库存数量，-1为不限量',
    version           int         default 0                 null comment '乐观锁版本号',
    created_at        datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    updated_at        datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted_at        datetime                              null comment '逻辑删除时间',
    belong_binding_id varchar(36)                           null comment '所属绑定ID',
    belong_user_id    varchar(36)                           null comment '所属用户ID',
    publish_user_id   varchar(36)                           null comment '发布者ID',
    sort_order        int         default 0                 null comment '排序权重'
)
    comment '商店商品表' collate = utf8mb4_unicode_ci;

create index shop_items_ibfk_1
    on shop_items (belong_binding_id);

create index shop_items_ibfk_2
    on shop_items (belong_user_id);

create index shop_items_ibfk_3
    on shop_items (publish_user_id);

create table system_config
(
    id           bigint auto_increment comment '主键ID'
        primary key,
    config_key   varchar(255)                                                                      not null comment '配置项的唯一标识符，例如：app.name, feature.toggle.new_ui, email.smtp.host',
    config_value text                                                                              not null comment '配置项的值。对于复杂类型（如JSON），可存储在此字段。',
    data_type    enum ('STRING', 'INTEGER', 'BOOLEAN', 'JSON', 'DOUBLE') default 'STRING'          null comment '配置值的数据类型，用于程序解析和校验。',
    category     varchar(100)                                            default 'DEFAULT'         null comment '配置项的分类，便于管理和查询，例如：APP_INFO, FEATURE_FLAGS, EMAIL_SETTINGS, CACHE_CONFIG',
    description  text                                                                              null comment '配置项的详细描述，说明其用途和可能的取值。',
    is_enabled   tinyint(1)                                              default 1                 null comment '是否启用该配置项。0-禁用，1-启用。可用于临时关闭某个功能而无需删除记录。',
    created_at   timestamp                                               default CURRENT_TIMESTAMP not null comment '记录创建时间',
    updated_at   timestamp                                               default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '记录最后更新时间',
    constraint config_key
        unique (config_key)
)
    comment '系统配置表' collate = utf8mb4_unicode_ci;

create index idx_category
    on system_config (category);

create index idx_config_key
    on system_config (config_key);

create table tags
(
    id                varchar(36) not null comment 'ID，全局唯一'
        primary key,
    name              varchar(30) not null comment '标签名称',
    belong_binding_id varchar(36) null comment '所属绑定ID',
    constraint uk_name_binding
        unique (name, belong_binding_id)
)
    comment '标签表' collate = utf8mb4_unicode_ci;

create index belong_binding_id
    on tags (belong_binding_id);

create table task_levels
(
    id                varchar(36)   not null comment 'ID，全局唯一'
        primary key,
    name              varchar(20)   not null comment '等级名称',
    max_rewards       int default 1 null comment '最大奖励数量',
    sort_order        int default 0 null comment '排序权重',
    belong_binding_id varchar(36)   null comment '关联绑定关系的id'
)
    comment '任务等级表' collate = utf8mb4_unicode_ci;

create table users
(
    id            varchar(36)                                not null comment 'ID，全局唯一'
        primary key,
    username      varchar(50)                                not null comment '用户名',
    nickname      varchar(50)                                null comment '昵称',
    gender        varchar(10) default 'other'                null comment '性别 (male, female, other)',
    avatar        varchar(255)                               null comment '头像URL',
    level         int         default 1                      null comment '用户等级',
    title         varchar(50)                                null comment '称号',
    birthday      date                                       null comment '生日',
    anniversary   date                                       null comment '纪念日',
    location      varchar(100)                               null comment '位置',
    phone         varchar(20)                                null comment '手机号',
    email         varchar(100)                               null comment '邮箱',
    password      varchar(255)                               null comment '密码',
    login_method  varchar(20) default 'email,phone,username' null comment '登录方式 (email, phone, username)',
    last_login_at datetime                                   null comment '最后登录时间',
    last_login_ip varchar(50)                                null comment '最后登录IP',
    points        int         default 0                      null comment '积分余额',
    cards         int         default 0                      null comment '万能卡余额',
    version       int         default 0                      null comment '乐观锁版本号（用于并发扣除积分/卡片防超卖）',
    created_at    datetime    default CURRENT_TIMESTAMP      null comment '创建时间',
    updated_at    datetime    default CURRENT_TIMESTAMP      null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted_at    datetime                                   null comment '逻辑删除时间',
    status        varchar(20) default 'active'               null comment '用户账号状态',
    block_end_at  datetime                                   null comment '用户账号封禁结束时间',
    invite_code   varchar(18)                                not null comment '邀请码（唯一）',
    constraint idx_code
        unique (invite_code) comment '邀请码索引'
)
    comment '用户表' collate = utf8mb4_unicode_ci;

create table binding_relations
(
    id         varchar(36)                        not null comment 'ID，全局唯一'
        primary key,
    user_id    varchar(36)                        not null comment '用户ID',
    target_id  varchar(36)                        not null comment '目标ID',
    status     varchar(20)                        not null comment '状态申请中、已接受、已拒绝、已解除(pending, accepted, rejected, broken)',
    created_at datetime default CURRENT_TIMESTAMP null comment '创建时间',
    updated_at datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint binding_relations_ibfk_1
        foreign key (user_id) references users (id)
            on delete cascade,
    constraint binding_relations_ibfk_2
        foreign key (target_id) references users (id)
            on delete cascade
)
    comment '绑定关系表' collate = utf8mb4_unicode_ci;

create index target_id
    on binding_relations (target_id);

create index user_id
    on binding_relations (user_id);

create table card_transactions
(
    id               int auto_increment comment 'ID，自增'
        primary key,
    user_id          varchar(36)                        not null comment '用户ID',
    amount           int                                not null comment '变动数量（正数为增加，负数为扣除）',
    transaction_type varchar(50)                        not null comment '交易类型 (task_reward, special_redeem)',
    reference_id     varchar(36)                        null comment '关联的业务ID',
    description      varchar(255)                       null comment '流水描述',
    created_at       datetime default CURRENT_TIMESTAMP null comment '发生时间',
    constraint card_transactions_ibfk_1
        foreign key (user_id) references users (id)
            on delete cascade
)
    comment '万能卡流水表' collate = utf8mb4_unicode_ci;

create index idx_user_id
    on card_transactions (user_id);

create table conversations
(
    id              varchar(36)                           not null comment 'ID，全局唯一'
        primary key,
    user1_id        varchar(36)                           not null comment '用户1 ID',
    user2_id        varchar(36)                           not null comment '用户2 ID',
    type            varchar(20) default 'direct'          null comment '会话类型 (direct, system)',
    last_message_id varchar(36)                           null comment '最后一条消息ID',
    created_at      datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    updated_at      datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint conversations_ibfk_1
        foreign key (user1_id) references users (id)
            on delete cascade,
    constraint conversations_ibfk_2
        foreign key (user2_id) references users (id)
            on delete cascade
)
    comment '会话表' collate = utf8mb4_unicode_ci;

create index idx_user1
    on conversations (user1_id);

create index idx_user2
    on conversations (user2_id);

create table feedbacks
(
    id           varchar(36)                           not null comment 'ID，全局唯一'
        primary key,
    user_id      varchar(36)                           not null comment '用户ID',
    content      text                                  not null comment '反馈内容',
    images       json                                  null comment '反馈图片URL数组',
    contact_info varchar(100)                          null comment '联系方式',
    status       varchar(20) default 'pending'         null comment '状态 (pending, processing, resolved, closed)',
    reply        text                                  null comment '客服回复',
    created_at   datetime    default CURRENT_TIMESTAMP null comment '提交时间',
    updated_at   datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint feedbacks_ibfk_1
        foreign key (user_id) references users (id)
            on delete cascade
)
    comment '用户反馈表' collate = utf8mb4_unicode_ci;

create index idx_user_id
    on feedbacks (user_id);

create table item_redemption_records
(
    id          varchar(36)                        not null comment 'ID，全局唯一'
        primary key,
    item_type   varchar(20)                        not null comment '核销物品类型 (normal_item, special_item)',
    instance_id varchar(36)                        not null comment '用户道具实例ID (user_items.id 或 user_special_items.id)',
    owner_id    varchar(36)                        not null comment '道具所有者ID',
    redeemer_id varchar(36)                        not null comment '核销者ID',
    code        varchar(50)                        not null comment '核销码',
    remark      varchar(255)                       null comment '核销备注',
    created_at  datetime default CURRENT_TIMESTAMP null comment '核销时间',
    constraint item_redemption_records_ibfk_1
        foreign key (owner_id) references users (id)
            on delete cascade,
    constraint item_redemption_records_ibfk_2
        foreign key (redeemer_id) references users (id)
            on delete cascade
)
    comment '道具核销记录表' collate = utf8mb4_unicode_ci;

create index idx_instance_id
    on item_redemption_records (instance_id);

create index idx_owner_id
    on item_redemption_records (owner_id);

create index idx_redeemer_id
    on item_redemption_records (redeemer_id);

create table item_transactions
(
    id               int auto_increment comment 'ID，自增'
        primary key,
    user_id          varchar(36)                        not null comment '用户ID',
    item_id          varchar(36)                        not null comment '商品ID',
    quantity         int                                not null comment '变动数量（正数为获得，负数为消耗）',
    transaction_type varchar(50)                        not null comment '交易类型',
    reference_id     varchar(36)                        null comment '关联的业务ID',
    description      varchar(255)                       null comment '流水描述',
    created_at       datetime default CURRENT_TIMESTAMP null comment '发生时间',
    constraint item_transactions_ibfk_1
        foreign key (user_id) references users (id)
            on delete cascade,
    constraint item_transactions_ibfk_2
        foreign key (item_id) references shop_items (id)
            on delete cascade
)
    comment '道具流水表' collate = utf8mb4_unicode_ci;

create index idx_item_id
    on item_transactions (item_id);

create index idx_user_id
    on item_transactions (user_id);

create table messages
(
    id              varchar(36)                           not null comment 'ID，全局唯一'
        primary key,
    conversation_id varchar(36)                           not null comment '所属会话ID',
    sender_id       varchar(36)                           not null comment '发送者ID (系统消息可为system)',
    content         text                                  not null comment '消息内容',
    type            varchar(20) default 'text'            null comment '消息类型 (text, image, task_invite)',
    is_read         tinyint(1)  default 0                 null comment '是否已读',
    created_at      datetime    default CURRENT_TIMESTAMP null comment '发送时间',
    constraint messages_ibfk_1
        foreign key (conversation_id) references conversations (id)
            on delete cascade
)
    comment '消息表' collate = utf8mb4_unicode_ci;

create index idx_conversation
    on messages (conversation_id);

create index idx_sender
    on messages (sender_id);

create table notifications
(
    id           varchar(36)                          not null comment 'ID，全局唯一'
        primary key,
    user_id      varchar(36)                          not null comment '接收用户ID',
    title        varchar(100)                         not null comment '通知标题',
    content      text                                 not null comment '通知内容',
    type         varchar(50)                          not null comment '通知类型 (task_update, system, reward)',
    reference_id varchar(36)                          null comment '关联业务ID',
    is_read      tinyint(1) default 0                 null comment '是否已读',
    created_at   datetime   default CURRENT_TIMESTAMP null comment '创建时间',
    constraint notifications_ibfk_1
        foreign key (user_id) references users (id)
            on delete cascade
)
    comment '系统通知表' collate = utf8mb4_unicode_ci;

create index idx_user_id
    on notifications (user_id);

create table point_transactions
(
    id               int auto_increment comment 'ID，自增'
        primary key,
    user_id          varchar(36)                        not null comment '用户ID',
    amount           int                                not null comment '变动数量（正数为增加，负数为扣除）',
    transaction_type varchar(50)                        not null comment '交易类型',
    reference_id     varchar(36)                        null comment '关联的业务ID',
    description      varchar(255)                       null comment '流水描述',
    created_at       datetime default CURRENT_TIMESTAMP null comment '发生时间',
    constraint point_transactions_ibfk_1
        foreign key (user_id) references users (id)
            on delete cascade
)
    comment '积分流水表' collate = utf8mb4_unicode_ci;

create index idx_created_at
    on point_transactions (created_at);

create index idx_user_id
    on point_transactions (user_id);

create table reward_codes
(
    id           varchar(36)                           not null comment 'ID，全局唯一'
        primary key,
    code         varchar(20)                           not null comment '兑换码',
    reward_type  varchar(20)                           not null comment '奖励类型 (prop, points, wild_card)',
    reward_name  varchar(50)                           not null comment '奖励名称',
    description  text                                  null comment '描述',
    reward_count int         default 1                 null comment '奖励数量',
    icon         varchar(50)                           null comment '图标',
    color        varchar(50)                           null comment '颜色样式',
    image_url    varchar(255)                          null comment '自定义图片',
    creator_id   varchar(36)                           not null comment '创建者ID',
    status       varchar(20) default 'unused'          null comment '状态 (unused, used, voided)',
    redeemer_id  varchar(36)                           null comment '兑换者ID',
    redeemed_at  datetime                              null comment '兑换时间',
    created_at   datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    constraint uk_code
        unique (code),
    constraint reward_codes_ibfk_1
        foreign key (creator_id) references users (id)
            on delete cascade,
    constraint reward_codes_ibfk_2
        foreign key (redeemer_id) references users (id)
            on delete set null
)
    comment '奖励兑换码表' collate = utf8mb4_unicode_ci;

create index idx_creator_id
    on reward_codes (creator_id);

create index redeemer_id
    on reward_codes (redeemer_id);

create table special_items
(
    id                varchar(36)                           not null comment 'ID，全局唯一'
        primary key,
    name              varchar(50)                           not null comment '奖励名称',
    description       varchar(255)                          null comment '奖励描述',
    cards_cost        int                                   not null comment '兑换所需万能卡数量',
    icon              varchar(50)                           null comment '图标',
    color             varchar(50)                           null comment '颜色样式',
    image_url         varchar(255)                          null comment '自定义图片',
    status            varchar(20) default 'active'          null comment '状态 (active, inactive)',
    stock             int         default -1                null comment '库存数量，-1为不限量',
    version           int         default 0                 null comment '乐观锁版本号',
    belong_binding_id varchar(36)                           null comment '所属绑定ID',
    publish_user_id   varchar(36)                           null comment '发布者ID',
    created_at        datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    updated_at        datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted_at        datetime                              null comment '逻辑删除时间',
    constraint special_items_ibfk_1
        foreign key (belong_binding_id) references binding_relations (id)
            on delete cascade,
    constraint special_items_ibfk_2
        foreign key (publish_user_id) references users (id)
            on delete cascade
)
    comment '特别奖励表' collate = utf8mb4_unicode_ci;

create index belong_binding_id
    on special_items (belong_binding_id);

create index publish_user_id
    on special_items (publish_user_id);

create table task_templates
(
    id            varchar(36)                           not null comment 'ID，全局唯一'
        primary key,
    title         varchar(100)                          not null comment '模板标题',
    description   text                                  null comment '模板描述',
    category_id   varchar(36)                           null comment '推荐分类ID',
    level_id      varchar(36)                           null comment '推荐等级ID',
    cover_image   varchar(255)                          null comment '封面图URL',
    reward_type   varchar(20) default 'normal'          null comment '推荐奖励类型 (normal, wildcard, points)',
    reward_amount int         default 0                 null comment '推荐奖励数量',
    source        varchar(20) default 'system'          null comment '来源 (system, user)',
    author_id     varchar(36)                           null comment '投稿用户ID（系统模板为空）',
    status        varchar(20) default 'pending'         null comment '状态 (pending, approved, rejected)',
    usage_count   int         default 0                 null comment '被使用/拉取次数',
    created_at    datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    updated_at    datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted_at    datetime                              null comment '逻辑删除时间',
    constraint task_templates_ibfk_1
        foreign key (category_id) references categories (id)
            on delete set null,
    constraint task_templates_ibfk_2
        foreign key (level_id) references task_levels (id)
            on delete set null,
    constraint task_templates_ibfk_3
        foreign key (author_id) references users (id)
            on delete set null
)
    comment '任务模板库表' collate = utf8mb4_unicode_ci;

create index author_id
    on task_templates (author_id);

create index category_id
    on task_templates (category_id);

create index idx_source
    on task_templates (source);

create index idx_status
    on task_templates (status);

create index level_id
    on task_templates (level_id);

create table tasks
(
    id                varchar(36)                           not null comment 'ID，全局唯一'
        primary key,
    author_id         varchar(36)                           not null comment '发布者ID',
    receiver_id       varchar(36)                           null comment '接收者ID',
    category_id       varchar(36)                           null comment '分类ID',
    level_id          varchar(36)                           null comment '等级ID',
    title             varchar(100)                          not null comment '任务标题',
    description       text                                  null comment '任务详细描述',
    cover_image       varchar(255)                          null comment '封面图URL',
    deadline          date                                  null comment '截止日期',
    location          varchar(100)                          null comment '任务地点',
    status            varchar(20) default 'pending'         null comment '任务状态 (pending, accepted, completed, cancelled)',
    is_private        tinyint(1)  default 0                 null comment '是否为私密任务',
    is_privileged     tinyint(1)  default 0                 null comment '是否使用了特权卡加急',
    repeat_type       varchar(20) default 'none'            null comment '重复类型 (none, daily, weekly, monthly)',
    repeat_config     json                                  null comment '重复规则配置（如周一、周三）',
    created_at        datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    updated_at        datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted_at        datetime                              null comment '逻辑删除时间',
    belong_binding_id varchar(36)                           null comment '所属绑定ID',
    tags              json                                  null comment '标签',
    constraint tasks_ibfk_1
        foreign key (author_id) references users (id)
            on delete cascade,
    constraint tasks_ibfk_2
        foreign key (receiver_id) references users (id)
            on delete set null,
    constraint tasks_ibfk_3
        foreign key (category_id) references categories (id)
            on delete set null,
    constraint tasks_ibfk_4
        foreign key (level_id) references task_levels (id)
            on delete set null
)
    comment '任务表' collate = utf8mb4_unicode_ci;

create table task_bookmarks
(
    id         varchar(36)                        not null comment 'ID，全局唯一'
        primary key,
    user_id    varchar(36)                        not null comment '用户ID',
    task_id    varchar(36)                        not null comment '任务ID',
    created_at datetime default CURRENT_TIMESTAMP null comment '收藏时间',
    constraint uk_user_task
        unique (user_id, task_id),
    constraint task_bookmarks_ibfk_1
        foreign key (user_id) references users (id)
            on delete cascade,
    constraint task_bookmarks_ibfk_2
        foreign key (task_id) references tasks (id)
            on delete cascade
)
    comment '任务收藏表' collate = utf8mb4_unicode_ci;

create index idx_task_id
    on task_bookmarks (task_id);

create index idx_user_id
    on task_bookmarks (user_id);

create table task_comments
(
    id          varchar(36)                        not null comment 'ID，全局唯一'
        primary key,
    task_id     varchar(36)                        not null comment '任务ID',
    user_id     varchar(36)                        not null comment '评论者ID',
    content     text                               not null comment '评论内容',
    reply_to_id varchar(36)                        null comment '回复的评论ID',
    created_at  datetime default CURRENT_TIMESTAMP null comment '评论时间',
    deleted_at  datetime                           null comment '逻辑删除时间',
    constraint task_comments_ibfk_1
        foreign key (task_id) references tasks (id)
            on delete cascade,
    constraint task_comments_ibfk_2
        foreign key (user_id) references users (id)
            on delete cascade,
    constraint task_comments_ibfk_3
        foreign key (reply_to_id) references task_comments (id)
            on delete set null
)
    comment '任务评论表' collate = utf8mb4_unicode_ci;

create index idx_task_id
    on task_comments (task_id);

create index reply_to_id
    on task_comments (reply_to_id);

create index user_id
    on task_comments (user_id);

create table task_images
(
    id         varchar(36)   not null comment 'ID，全局唯一'
        primary key,
    task_id    varchar(36)   not null comment '关联任务ID',
    image_url  varchar(255)  not null comment '图片URL',
    sort_order int default 0 null comment '排序权重',
    constraint task_images_ibfk_1
        foreign key (task_id) references tasks (id)
            on delete cascade
)
    comment '任务图片表' collate = utf8mb4_unicode_ci;

create index idx_task_id
    on task_images (task_id);

create table task_logs
(
    id              int auto_increment comment 'ID，自增'
        primary key,
    task_id         varchar(36)                        not null comment '任务ID',
    user_id         varchar(36)                        not null comment '触发操作的用户ID',
    action          varchar(20)                        not null comment '操作类型',
    previous_status varchar(20)                        null comment '变更前的状态',
    new_status      varchar(20)                        null comment '变更后的状态',
    remark          varchar(255)                       null comment '备注说明',
    created_at      datetime default CURRENT_TIMESTAMP null comment '发生时间',
    constraint task_logs_ibfk_1
        foreign key (task_id) references tasks (id)
            on delete cascade,
    constraint task_logs_ibfk_2
        foreign key (user_id) references users (id)
            on delete cascade
)
    comment '任务状态变更日志表' collate = utf8mb4_unicode_ci;

create index idx_task_id
    on task_logs (task_id);

create index idx_user_id
    on task_logs (user_id);

create table task_rewards
(
    id         varchar(36)                  not null comment 'ID，全局唯一'
        primary key,
    task_id    varchar(36)                  not null comment '关联任务ID',
    type       varchar(20) default 'normal' null comment '奖励类型 (normal, wildcard, points)',
    content    varchar(255)                 not null comment '奖励内容文本',
    icon       varchar(50)                  null comment '奖励图标标识符',
    color      varchar(50)                  null comment '奖励颜色标识符',
    amount     int         default 0        null comment '数量（积分或万能卡）',
    sort_order int         default 0        null comment '排序权重',
    constraint task_rewards_ibfk_1
        foreign key (task_id) references tasks (id)
            on delete cascade
)
    comment '任务奖励表' collate = utf8mb4_unicode_ci;

create index idx_task_id
    on task_rewards (task_id);

create table task_tags
(
    task_id varchar(36) not null,
    tag_id  varchar(36) not null,
    id      int auto_increment comment '主键'
        primary key,
    constraint task_tags_ibfk_1
        foreign key (task_id) references tasks (id)
            on delete cascade,
    constraint task_tags_ibfk_2
        foreign key (tag_id) references tags (id)
            on delete cascade
)
    comment '任务-标签关联表' collate = utf8mb4_unicode_ci;

create index idx_tag_id
    on task_tags (tag_id);

create index idx_task_id
    on task_tags (task_id);

create index category_id
    on tasks (category_id);

create index idx_author_id
    on tasks (author_id);

create index idx_receiver_id
    on tasks (receiver_id);

create index idx_status
    on tasks (status);

create index level_id
    on tasks (level_id);

create table user_achievements
(
    id             varchar(36)                        not null comment 'ID，全局唯一'
        primary key,
    user_id        varchar(36)                        not null comment '用户ID',
    achievement_id varchar(36)                        not null comment '成就ID',
    image_url      varchar(255)                       null comment '留念图片',
    note           text                               null comment '心得笔记',
    completed_at   datetime default CURRENT_TIMESTAMP null comment '解锁时间',
    constraint uk_user_achievement
        unique (user_id, achievement_id),
    constraint user_achievements_ibfk_1
        foreign key (user_id) references users (id)
            on delete cascade,
    constraint user_achievements_ibfk_2
        foreign key (achievement_id) references achievements (id)
            on delete cascade
)
    comment '用户成就解锁表' collate = utf8mb4_unicode_ci;

create index achievement_id
    on user_achievements (achievement_id);

create table user_devices
(
    id             varchar(36)                        not null comment 'ID，全局唯一'
        primary key,
    user_id        varchar(36)                        not null comment '用户ID',
    device_type    varchar(20)                        not null comment '设备类型 (ios, android, web)',
    device_token   varchar(255)                       not null comment '推送Token',
    device_name    varchar(100)                       null comment '设备名称',
    last_active_at datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '最后活跃时间',
    created_at     datetime default CURRENT_TIMESTAMP null comment '绑定时间',
    constraint uk_device_token
        unique (device_token),
    constraint user_devices_ibfk_1
        foreign key (user_id) references users (id)
            on delete cascade
)
    comment '用户设备表' collate = utf8mb4_unicode_ci;

create index idx_user_id
    on user_devices (user_id);

create table user_items
(
    id          varchar(36)                           not null comment 'ID，全局唯一'
        primary key,
    user_id     varchar(36)                           not null comment '用户ID',
    item_id     varchar(36)                           not null comment '关联ID：商城 shop_items.id 或特别奖励 special_items.id（无外键，避免混用冲突）',
    status      varchar(20) default 'usable'          null comment '状态 (usable, used)',
    code        varchar(50)                           null comment '核销码',
    acquired_at datetime    default CURRENT_TIMESTAMP null comment '获得时间',
    used_at     datetime                              null comment '核销时间',
    name        varchar(255)                          null comment '展示名称',
    description varchar(1024)                         null comment '描述',
    icon        varchar(512)                          null comment 'Lucide 图标 key 或图片 URL',
    type        varchar(32)                           null comment '类型 normal/wildcard/special 等',
    color       varchar(32)                           null comment '颜色',
    is_special  tinyint(1)    default 0             not null comment '是否来自特别奖励兑换',
    constraint uk_code
        unique (code),
    constraint user_items_ibfk_1
        foreign key (user_id) references users (id)
            on delete cascade
)
    comment '用户道具/背包表' collate = utf8mb4_unicode_ci;

create index idx_item_id
    on user_items (item_id);

create index idx_user_id
    on user_items (user_id);

create table user_settings
(
    user_id               varchar(36)                           not null comment '用户ID'
        primary key,
    theme                 varchar(20) default 'system'          null comment '主题 (light, dark, system)',
    notifications_enabled tinyint(1)  default 1                 null comment '是否开启通知',
    sound_enabled         tinyint(1)  default 1                 null comment '是否开启声音',
    vibration_enabled     tinyint(1)  default 1                 null comment '是否开启震动',
    privacy_mode          tinyint(1)  default 0                 null comment '是否开启隐私模式',
    updated_at            datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint user_settings_ibfk_1
        foreign key (user_id) references users (id)
            on delete cascade
)
    comment '用户设置表' collate = utf8mb4_unicode_ci;

create table user_special_items
(
    id              varchar(36)                           not null comment 'ID，全局唯一'
        primary key,
    user_id         varchar(36)                           not null comment '用户ID',
    special_item_id varchar(36)                           not null comment '特别奖励ID',
    status          varchar(20) default 'usable'          null comment '状态 (usable, used)',
    code            varchar(50)                           null comment '核销码',
    acquired_at     datetime    default CURRENT_TIMESTAMP null comment '获得时间',
    used_at         datetime                              null comment '核销时间',
    constraint uk_code
        unique (code),
    constraint user_special_items_ibfk_1
        foreign key (user_id) references users (id)
            on delete cascade,
    constraint user_special_items_ibfk_2
        foreign key (special_item_id) references special_items (id)
            on delete cascade
)
    comment '用户特别奖励表' collate = utf8mb4_unicode_ci;

create index idx_special_item_id
    on user_special_items (special_item_id);

create index idx_user_id
    on user_special_items (user_id);

