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

create table bind_moment_comments
(
    id             varchar(36)                        not null comment '主键 UUID'
        primary key,
    moment_id      varchar(36)                        not null comment '动态ID',
    author_user_id varchar(36)                        not null comment '评论者用户ID',
    content        varchar(1000)                      not null comment '评论内容',
    created_at     datetime default CURRENT_TIMESTAMP null comment '创建时间',
    deleted_at     datetime                           null comment '软删除'
)
    comment '动态评论' collate = utf8mb4_unicode_ci;

create index idx_deleted_at
    on bind_moment_comments (deleted_at);

create index idx_moment_created
    on bind_moment_comments (moment_id, created_at);

create table bind_moment_images
(
    id         varchar(36)   not null comment '主键 UUID'
        primary key,
    moment_id  varchar(36)   not null comment '动态ID',
    url        varchar(512)  not null comment '图片URL',
    sort_order int default 0 not null comment '排序'
)
    comment '动态配图' collate = utf8mb4_unicode_ci;

create index idx_moment_id
    on bind_moment_images (moment_id);

create table bind_moment_likes
(
    id         varchar(36)                        not null comment '主键 UUID'
        primary key,
    moment_id  varchar(36)                        not null comment '动态ID',
    user_id    varchar(36)                        not null comment '点赞用户ID',
    created_at datetime default CURRENT_TIMESTAMP null comment '点赞时间',
    constraint uk_moment_user
        unique (moment_id, user_id)
)
    comment '动态点赞' collate = utf8mb4_unicode_ci;

create index idx_moment_id
    on bind_moment_likes (moment_id);

create table bind_moments
(
    id             varchar(36)                        not null comment '主键 UUID'
        primary key,
    bind_id        varchar(36)                        not null comment '绑定关系ID',
    author_user_id varchar(36)                        not null comment '发布者用户ID',
    content        text                               not null comment '动态正文',
    biz_uuid       varchar(36)                        null comment '关联业务主键，如任务 id',
    biz_scene      varchar(32)                        null comment '业务场景：task_publish / task_complete',
    remark         varchar(255)                       null comment '备注，如【系统自动发出】',
    created_at     datetime default CURRENT_TIMESTAMP null comment '创建时间',
    updated_at     datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted_at     datetime                           null comment '软删除时间',
    constraint uk_bind_moments_biz
        unique (bind_id, biz_uuid, biz_scene)
)
    comment '绑定动态主表' collate = utf8mb4_unicode_ci;

create index idx_bind_created
    on bind_moments (bind_id, created_at);

create index idx_deleted_at
    on bind_moments (deleted_at);

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

create table checkin_day_rewards
(
    id            varchar(36)   not null comment 'ID，全局唯一'
        primary key,
    plan_id       varchar(36)   not null comment '关联 checkin_plans.id',
    day_number    int           not null comment '第几天的奖励，1-7 或 1-30',
    reward_type   varchar(20)   not null comment '奖励类型：points | wild_card | prop',
    reward_name   varchar(100)  null comment '奖励名称；prop 自定义，points/wild_card 可为空',
    reward_amount int default 1 not null comment '奖励数量',
    description   varchar(200)  null comment '奖励描述',
    icon          varchar(500)  null comment 'Lucide 图标 key 或图片 URL',
    color         varchar(50)   null comment '颜色标识',
    sort_order    int default 0 null comment '排序权重'
)
    comment '签到每日奖励配置表';

create index idx_plan_day
    on checkin_day_rewards (plan_id, day_number);

create table checkin_plans
(
    id                varchar(36)                  not null comment 'ID，全局唯一'
        primary key,
    belong_binding_id varchar(36)                  not null comment '属于绑定id（关联绑定表的id）',
    creator_id        varchar(36)                  not null comment '配置者（给对方配签到的人）',
    target_user_id    varchar(36)                  not null comment '签到执行者（需要打卡的人）',
    name              varchar(100)                 not null comment '计划名称',
    description       varchar(500)                 null comment '计划描述',
    icon              varchar(500)                 null comment 'Lucide 图标 key 或图片 URL',
    color             varchar(50)                  null comment '颜色标识',
    cycle_type        varchar(20)                  not null comment '周期类型：weekly | monthly',
    cycle_days        int         default 7        not null comment '周期天数：7 或 30',
    is_consecutive    tinyint     default 0        not null comment '0=非连续，1=连续（断签重置）',
    time_windows      json                         null comment '可签到时段 JSON，如 [{"start":"08:00","end":"12:00"}]',
    status            varchar(20) default 'active' not null comment 'active | inactive',
    created_at        datetime                     null comment '创建时间',
    updated_at        datetime                     null comment '更新时间',
    deleted_at        datetime                     null comment '逻辑删除时间'
)
    comment '签到计划配置表';

create index idx_binding
    on checkin_plans (belong_binding_id);

create index idx_target
    on checkin_plans (target_user_id, status);

create table checkin_records
(
    id           int auto_increment comment 'ID，自增'
        primary key,
    plan_id      varchar(36)   not null comment '关联 checkin_plans.id',
    user_id      varchar(36)   not null comment '签到用户ID',
    checkin_date date          not null comment '签到日期（去重用）',
    day_number   int           not null comment '领取的是第几天奖励',
    cycle_number int default 1 not null comment '第几个周期轮次',
    streak_count int default 1 not null comment '本次签到时的连续天数',
    checkin_at   datetime      not null comment '实际签到时间',
    constraint uk_plan_user_date
        unique (plan_id, user_id, checkin_date)
)
    comment '签到打卡记录表';

create index idx_user_plan
    on checkin_records (user_id, plan_id, checkin_date);

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

create table memorial_days
(
    id              varchar(36)                           not null comment '主键，UUID'
        primary key,
    bind_id         varchar(36)                           not null comment '所属绑定关系ID，与 schedules.bind_id 含义一致',
    user_id         varchar(36)                           not null comment '创建者用户ID',
    title           varchar(60)                           not null comment '展示标题，如生日、恋爱纪念日',
    event_type      varchar(20) default 'anniversary'     not null comment '事件类型：anniversary=纪念日/倒数 birthday=生日',
    icon_key        varchar(32) default 'love'            not null comment '预设图标标识',
    custom_icon_url varchar(512)                          null comment '自定义图标图片 URL',
    color_theme_id  varchar(32) default 'rose'            not null comment '主题色标识',
    custom_category varchar(60) default '纪念日'          not null comment '用户自定义分类标签',
    person_name     varchar(60)                           null comment '生日类型时：寿星姓名',
    is_pinned       tinyint     default 0                 not null comment '是否置顶大卡片：1=是 0=否',
    kind            tinyint                               not null comment '兼容字段：1=倒数日 2=纪念日',
    anchor_date     date                                  not null comment '锚点日期',
    repeat_yearly   tinyint     default 0                 not null comment '是否每年重复（兼容旧逻辑）',
    note            text                                  null comment '备注',
    sort_order      int         default 0                 not null comment '排序权重',
    created_at      datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    updated_at      datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted_at      datetime                              null comment '软删除时间'
)
    comment '纪念日与倒数日表' collate = utf8mb4_unicode_ci;

create index idx_bind_id
    on memorial_days (bind_id);

create index idx_deleted_at
    on memorial_days (deleted_at);

create table schedules
(
    id                varchar(36)                           not null comment '主键，UUID'
        primary key,
    bind_id           varchar(36)                           not null comment '所属绑定关系ID',
    user_id           varchar(36)                           not null comment '创建者用户ID',
    type              varchar(60) default '未命名日程'      not null comment '日程类型名称，最大20汉字',
    description       text                                  null comment '描述',
    location          varchar(255)                          null comment '位置',
    images            text                                  null comment '图片列表，JSON数组格式如["url1","url2"]，最多3个',
    event_time        datetime                              not null comment '具体事件日期时间',
    event_relation_id varchar(36)                           null comment '关联业务ID，例如关联某个任务',
    popup_remind      tinyint     default 1                 not null comment '当天是否弹窗提示（1=是，0=否）',
    created_at        datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    updated_at        datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted_at        datetime                              null comment '软删除时间戳'
)
    comment '日程/行程表' collate = utf8mb4_unicode_ci;

create index idx_bind_id
    on schedules (bind_id);

create index idx_deleted_at
    on schedules (deleted_at);

create index idx_event_time
    on schedules (event_time);

create index idx_user_id
    on schedules (user_id);

create table shop_items
(
    id                varchar(36)                           not null comment 'ID，全局唯一'
        primary key,
    name              varchar(50)                           not null comment '商品名称',
    description       text                                  null comment '商品描述',
    item_type         varchar(20) default 'prop'            null comment '道具类型 (prop, wildcard, other)',
    points_cost       int                                   not null comment '兑换所需积分',
    icon              varchar(512)                          null comment '图标标识符',
    color             varchar(100)                          null comment '颜色样式',
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

create table system_notices
(
    id               varchar(36)                        not null comment '主键 UUID'
        primary key,
    receiver_user_id varchar(36)                        not null comment '接收人 user_id',
    sender_user_id   varchar(36)                        null comment '触发人 user_id',
    bind_id          varchar(36)                        null comment '绑定关系 id',
    notice_type      varchar(64)                        not null comment '通知类型',
    biz_id           varchar(64)                        null comment '业务 id，如 taskId/itemId',
    title            varchar(120)                       not null comment '通知标题',
    content          varchar(500)                       not null comment '通知正文',
    payload          text                               null comment '扩展 JSON',
    is_read          tinyint  default 0                 not null comment '0未读 1已读',
    read_at          datetime                           null comment '已读时间',
    created_at       datetime default CURRENT_TIMESTAMP null comment '创建时间',
    deleted_at       datetime                           null comment '软删除时间'
)
    comment '系统通知' collate = utf8mb4_unicode_ci;

create index idx_biz
    on system_notices (notice_type, biz_id);

create index idx_receiver_created
    on system_notices (receiver_user_id, created_at);

create index idx_receiver_read
    on system_notices (receiver_user_id, is_read);

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
    reward_type  varchar(20)                           not null comment '奖励类型 (prop, points, special)',
    reward_name  varchar(50)                           not null comment '奖励名称',
    reward_count int         default 1                 null comment '奖励数量',
    icon         varchar(512)                          null comment '图标',
    color        varchar(100)                          null comment '颜色样式',
    image_url    varchar(255)                          null comment '自定义图片',
    creator_id   varchar(36)                           not null comment '创建者ID',
    status       varchar(20) default 'unused'          null comment '状态 (unused, used, voided)',
    redeemer_id  varchar(36)                           null comment '兑换者ID',
    redeemed_at  datetime                              null comment '兑换时间',
    created_at   datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    description  text                                  null comment '描述',
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
    list_status       varchar(20) default 'published'       null comment '任务状态draft|published|unpublished',
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
    id          varchar(36)                  not null comment 'ID，全局唯一'
        primary key,
    task_id     varchar(36)                  not null comment '关联任务ID',
    type        varchar(20) default 'normal' null comment '奖励类型 (normal, wildcard, points)',
    content     varchar(255)                 not null comment '奖励内容文本',
    icon        varchar(50)                  null comment '奖励图标标识符',
    color       varchar(50)                  null comment '奖励颜色标识符',
    amount      int         default 0        null comment '数量（积分或万能卡）',
    sort_order  int         default 0        null comment '排序权重',
    description text                         null comment '奖励描述',
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

create table user_favorites
(
    id          varchar(36)                        not null comment '主键 UUID'
        primary key,
    user_id     varchar(36)                        not null comment '用户ID',
    target_type varchar(32)                        not null comment '收藏类型：task / shop_item / user_item / ...',
    target_id   varchar(36)                        not null comment '被收藏对象ID（对应各业务表主键）',
    created_at  datetime default CURRENT_TIMESTAMP not null comment '收藏时间',
    extra       json                               null comment '扩展信息（可选：标题快照、封面URL等）',
    constraint uk_user_favorite
        unique (user_id, target_type, target_id),
    constraint user_favorites_ibfk_user
        foreign key (user_id) references users (id)
            on delete cascade
)
    comment '用户收藏表' collate = utf8mb4_unicode_ci;

create index idx_user_favorites_created_at
    on user_favorites (user_id, created_at);

create index idx_user_favorites_target
    on user_favorites (target_type, target_id);

create index idx_user_favorites_user_id
    on user_favorites (user_id);

create table user_items
(
    id          varchar(36)                           not null comment 'ID，全局唯一'
        primary key,
    user_id     varchar(36)                           not null comment '用户ID',
    item_id     varchar(36)                           not null comment '商品ID',
    status      varchar(20) default 'usable'          null comment '状态 (usable, used)',
    code        varchar(50)                           null comment '核销码',
    acquired_at datetime    default CURRENT_TIMESTAMP null comment '获得时间',
    used_at     datetime                              null comment '核销时间',
    name        varchar(100)                          null comment '名称',
    description text                                  null comment '描述',
    icon        varchar(512)                          null comment '图标',
    type        varchar(30)                           null comment '类型',
    color       varchar(255)                          null comment '颜色',
    is_special  int         default 0                 not null,
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

create table wish_items
(
    id                     varchar(36)                           not null comment '主键 UUID'
        primary key,
    bind_id                varchar(36)                           not null comment '绑定关系ID',
    publisher_user_id      varchar(36)                           not null comment '发布者',
    pickable_by_user_id    varchar(36)                           not null comment '可摘取者（对方）',
    content                varchar(500)                          not null comment '心愿正文',
    color_key              varchar(32)                           not null comment '星星颜色键，如 rose400',
    bottle_side            tinyint     default 1                 not null comment '1=暖色瓶 2=冷色瓶',
    picked_times           int         default 0                 not null comment '累计被摘取次数（放回不减少）',
    status                 varchar(32) default 'pending'         not null comment 'pending/picked/done/deleted 等，库内不枚举',
    last_picked_by_user_id varchar(36)                           null comment '最近一次摘取人',
    last_picked_at         datetime                              null comment '最近一次摘出时间',
    fulfilled_at           datetime                              null comment '对方收下时间',
    created_at             datetime    default CURRENT_TIMESTAMP null comment '创建时间',
    updated_at             datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    deleted_at             datetime                              null comment '软删除时间',
    record_hidden_at       datetime                              null comment '发布者在记录页隐藏'
)
    comment '心愿条目' collate = utf8mb4_unicode_ci;

create index idx_bind_pickable_status
    on wish_items (bind_id, pickable_by_user_id, status);

create index idx_bind_publisher
    on wish_items (bind_id, publisher_user_id);

create index idx_deleted_at
    on wish_items (deleted_at);

create table wish_pick_quota
(
    id           varchar(36)                        not null comment '主键 UUID'
        primary key,
    bind_id      varchar(36)                        not null comment '绑定关系ID',
    user_id      varchar(36)                        not null comment '拥有摘取次数的用户（摘对方心愿池）',
    pick_chances int      default 0                 not null comment '当前剩余摘取次数',
    updated_at   datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint uk_bind_user
        unique (bind_id, user_id)
)
    comment '心愿摘取次数（每人每绑定一行）' collate = utf8mb4_unicode_ci;

create index idx_user_id
    on wish_pick_quota (user_id);

