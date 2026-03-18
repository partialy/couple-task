-- MySQL Database Schema for yuTask
-- 1. 用户表 (users)
CREATE TABLE `users` (
                         `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                         `username` VARCHAR ( 50 ) NOT NULL COMMENT '用户名',
                         `nickname` VARCHAR ( 50 ) DEFAULT NULL COMMENT '昵称',
                         `gender` VARCHAR ( 10 ) DEFAULT 'other' COMMENT '性别 (male, female, other)',
                         `avatar` VARCHAR ( 255 ) DEFAULT NULL COMMENT '头像URL',
                         `level` INT DEFAULT 1 COMMENT '用户等级',
                         `title` VARCHAR ( 50 ) DEFAULT NULL COMMENT '称号',
                         `birthday` DATE DEFAULT NULL COMMENT '生日',
                         `anniversary` DATE DEFAULT NULL COMMENT '纪念日',
                         `location` VARCHAR ( 100 ) DEFAULT NULL COMMENT '位置',
                         `phone` VARCHAR ( 20 ) DEFAULT NULL COMMENT '手机号',
                         `email` VARCHAR ( 100 ) DEFAULT NULL COMMENT '邮箱',
                         `password` VARCHAR ( 255 ) DEFAULT NULL COMMENT '密码',
                         `login_method` VARCHAR ( 20 ) DEFAULT 'email,phone,username' COMMENT '登录方式 (email, phone, username)',
                         `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
                         `last_login_ip` VARCHAR ( 50 ) DEFAULT NULL COMMENT '最后登录IP',
                         `points` INT DEFAULT 0 COMMENT '积分余额',
                         `cards` INT DEFAULT 0 COMMENT '万能卡余额',
                         `version` INT DEFAULT 0 COMMENT '乐观锁版本号（用于并发扣除积分/卡片防超卖）',
                         `status` VARCHAR(20) DEFAULT 'active' COMMENT '用户账号状态',
                         `block_end_at` DATETIME DEFAULT NULL COMMENT '用户账号封禁结束时间',
                         `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                         `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                         `deleted_at` DATETIME DEFAULT NULL COMMENT '逻辑删除时间',
                         PRIMARY KEY ( `id` )
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户表';
-- 绑定关系表
CREATE TABLE `binding_relations` (
                                     `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                                     `user_id` VARCHAR ( 36 ) NOT NULL COMMENT '用户ID',
                                     `target_id` VARCHAR ( 36 ) NOT NULL COMMENT '目标ID',
                                     `status` VARCHAR ( 20 ) NOT NULL COMMENT '状态申请中、已接受、已拒绝、已解除(pending, accepted, rejected, broken)',
                                     `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                     `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                                     PRIMARY KEY ( `id` ),
                                     FOREIGN KEY ( `user_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE,
                                     FOREIGN KEY ( `target_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '绑定关系表';
-- 2. 任务分类表 (categories)
CREATE TABLE `categories` (
                              `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                              `name` VARCHAR ( 50 ) NOT NULL COMMENT '分类名称',
                              `sort_order` INT DEFAULT 0 COMMENT '排序权重',
                              `belong_binding_id` VARCHAR ( 36 ) DEFAULT NULL COMMENT '所属绑定ID',
                              PRIMARY KEY ( `id` ),
                              UNIQUE KEY `uk_name_binding` ( `name`, `belong_binding_id` ),
                              FOREIGN KEY ( `belong_binding_id` ) REFERENCES `binding_relations` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务分类表';
-- 3. 任务等级表 (task_levels)
CREATE TABLE `task_levels` (
                               `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                               `name` VARCHAR ( 20 ) NOT NULL COMMENT '等级名称',
                               `max_rewards` INT DEFAULT 1 COMMENT '最大奖励数量',
                               `sort_order` INT DEFAULT 0 COMMENT '排序权重',
                               PRIMARY KEY ( `id` )
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务等级表';
-- 4. 标签表 (tags)
CREATE TABLE `tags` (
                        `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                        `name` VARCHAR ( 30 ) NOT NULL COMMENT '标签名称',
                        `belong_binding_id` VARCHAR ( 36 ) DEFAULT NULL COMMENT '所属绑定ID',
                        PRIMARY KEY ( `id` ),
                        UNIQUE KEY `uk_name_binding` ( `name`, `belong_binding_id` ),
                        FOREIGN KEY ( `belong_binding_id` ) REFERENCES `binding_relations` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '标签表';
-- 5. 任务表 (tasks)
CREATE TABLE `tasks` (
                         `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                         `author_id` VARCHAR ( 36 ) NOT NULL COMMENT '发布者ID',
                         `receiver_id` VARCHAR ( 36 ) DEFAULT NULL COMMENT '接收者ID',
                         `category_id` VARCHAR ( 36 ) DEFAULT NULL COMMENT '分类ID',
                         `level_id` VARCHAR ( 36 ) DEFAULT NULL COMMENT '等级ID',
                         `title` VARCHAR ( 100 ) NOT NULL COMMENT '任务标题',
                         `description` TEXT DEFAULT NULL COMMENT '任务详细描述',
                         `cover_image` VARCHAR ( 255 ) DEFAULT NULL COMMENT '封面图URL',
                         `deadline` DATE DEFAULT NULL COMMENT '截止日期',
                         `location` VARCHAR ( 100 ) DEFAULT NULL COMMENT '任务地点',
                         `status` VARCHAR ( 20 ) DEFAULT 'pending' COMMENT '任务状态 (pending, accepted, completed, cancelled)',
                         `is_private` TINYINT ( 1 ) DEFAULT 0 COMMENT '是否为私密任务',
                         `is_privileged` TINYINT ( 1 ) DEFAULT 0 COMMENT '是否使用了特权卡加急',
                         `repeat_type` VARCHAR ( 20 ) DEFAULT 'none' COMMENT '重复类型 (none, daily, weekly, monthly)',
                         `repeat_config` JSON DEFAULT NULL COMMENT '重复规则配置（如周一、周三）',
                         `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                         `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                         `deleted_at` DATETIME DEFAULT NULL COMMENT '逻辑删除时间',
                         `belong_binding_id` VARCHAR ( 36 ) DEFAULT NULL COMMENT '所属绑定ID',
                         PRIMARY KEY ( `id` ),
                         INDEX `idx_author_id` ( `author_id` ),
                         INDEX `idx_status` ( `status` ),
                         INDEX `idx_receiver_id` ( `receiver_id` ),
                         FOREIGN KEY ( `author_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE,
                         FOREIGN KEY ( `receiver_id` ) REFERENCES `users` ( `id` ) ON DELETE
                             SET NULL,
                         FOREIGN KEY ( `category_id` ) REFERENCES `categories` ( `id` ) ON DELETE
                             SET NULL,
                         FOREIGN KEY ( `level_id` ) REFERENCES `task_levels` ( `id` ) ON DELETE
                             SET NULL
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务表';
-- 6. 任务-标签关联表 (task_tags)
CREATE TABLE `task_tags` (
                             `task_id` VARCHAR ( 36 ) NOT NULL,
                             `tag_id` VARCHAR ( 36 ) NOT NULL,
                             PRIMARY KEY ( `task_id`, `tag_id` ),
                             INDEX `idx_task_id` ( `task_id` ),
                             INDEX `idx_tag_id` ( `tag_id` ),
                             FOREIGN KEY ( `task_id` ) REFERENCES `tasks` ( `id` ) ON DELETE CASCADE,
                             FOREIGN KEY ( `tag_id` ) REFERENCES `tags` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务-标签关联表';
-- 7. 任务图片表 (task_images)
CREATE TABLE `task_images` (
                               `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                               `task_id` VARCHAR ( 36 ) NOT NULL COMMENT '关联任务ID',
                               `image_url` VARCHAR ( 255 ) NOT NULL COMMENT '图片URL',
                               `sort_order` INT DEFAULT 0 COMMENT '排序权重',
                               PRIMARY KEY ( `id` ),
                               INDEX `idx_task_id` ( `task_id` ),
                               FOREIGN KEY ( `task_id` ) REFERENCES `tasks` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务图片表';
-- 8. 任务奖励表 (task_rewards)
CREATE TABLE `task_rewards` (
                                `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                                `task_id` VARCHAR ( 36 ) NOT NULL COMMENT '关联任务ID',
                                `type` VARCHAR ( 20 ) DEFAULT 'normal' COMMENT '奖励类型 (normal, wildcard, points)',
                                `content` VARCHAR ( 255 ) NOT NULL COMMENT '奖励内容文本',
                                `icon` VARCHAR ( 50 ) DEFAULT NULL COMMENT '奖励图标标识符',
                                `color` VARCHAR ( 50 ) DEFAULT NULL COMMENT '奖励颜色标识符',
                                `amount` INT DEFAULT 0 COMMENT '数量（积分或万能卡）',
                                `sort_order` INT DEFAULT 0 COMMENT '排序权重',
                                PRIMARY KEY ( `id` ),
                                INDEX `idx_task_id` ( `task_id` ),
                                FOREIGN KEY ( `task_id` ) REFERENCES `tasks` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务奖励表';
-- 9. 商店商品表 (shop_items)
CREATE TABLE `shop_items` (
                              `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                              `name` VARCHAR ( 50 ) NOT NULL COMMENT '商品名称',
                              `description` TEXT DEFAULT NULL COMMENT '商品描述',
                              `item_type` VARCHAR ( 20 ) DEFAULT 'prop' COMMENT '道具类型 (prop, wildcard, other)',
                              `points_cost` INT NOT NULL COMMENT '兑换所需积分',
                              `icon` VARCHAR ( 50 ) DEFAULT NULL COMMENT '图标标识符',
                              `color` VARCHAR ( 50 ) DEFAULT NULL COMMENT '颜色样式',
                              `status` VARCHAR ( 20 ) DEFAULT 'active' COMMENT '状态 (active, inactive)',
                              `stock` INT DEFAULT - 1 COMMENT '库存数量，-1为不限量',
                              `version` INT DEFAULT 0 COMMENT '乐观锁版本号',
                              `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                              `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                              `deleted_at` DATETIME DEFAULT NULL COMMENT '逻辑删除时间',
                              `belong_binding_id` VARCHAR ( 36 ) DEFAULT NULL COMMENT '所属绑定ID',
                              `belong_user_id` VARCHAR ( 36 ) DEFAULT NULL COMMENT '所属用户ID',
                              `publish_user_id` VARCHAR ( 36 ) DEFAULT NULL COMMENT '发布者ID',
                              `sort_order` INT DEFAULT 0 COMMENT '排序权重',
                              PRIMARY KEY ( `id` ),
                              FOREIGN KEY ( `belong_binding_id` ) REFERENCES `binding_relations` ( `id` ) ON DELETE CASCADE,
                              FOREIGN KEY ( `belong_user_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE,
                              FOREIGN KEY ( `publish_user_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '商店商品表';
-- 10. 用户道具/背包表 (user_items)
CREATE TABLE `user_items` (
                              `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                              `user_id` VARCHAR ( 36 ) NOT NULL COMMENT '用户ID',
                              `item_id` VARCHAR ( 36 ) NOT NULL COMMENT '商品ID',
                              `status` VARCHAR ( 20 ) DEFAULT 'usable' COMMENT '状态 (usable, used)',
                              `code` VARCHAR ( 50 ) DEFAULT NULL COMMENT '核销码',
                              `acquired_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '获得时间',
                              `used_at` DATETIME DEFAULT NULL COMMENT '核销时间',
                              PRIMARY KEY ( `id` ),
                              UNIQUE KEY `uk_code` ( `code` ),
                              INDEX `idx_user_id` ( `user_id` ),
                              INDEX `idx_item_id` ( `item_id` ),
                              FOREIGN KEY ( `user_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE,
                              FOREIGN KEY ( `item_id` ) REFERENCES `shop_items` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户道具/背包表';
-- 11. 积分流水表 (point_transactions)
CREATE TABLE `point_transactions` (
                                      `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID，自增',
                                      `user_id` VARCHAR ( 36 ) NOT NULL COMMENT '用户ID',
                                      `amount` INT NOT NULL COMMENT '变动数量（正数为增加，负数为扣除）',
                                      `transaction_type` VARCHAR ( 50 ) NOT NULL COMMENT '交易类型',
                                      `reference_id` VARCHAR ( 36 ) DEFAULT NULL COMMENT '关联的业务ID',
                                      `description` VARCHAR ( 255 ) DEFAULT NULL COMMENT '流水描述',
                                      `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发生时间',
                                      PRIMARY KEY ( `id` ),
                                      INDEX `idx_user_id` ( `user_id` ),
                                      INDEX `idx_created_at` ( `created_at` ),
                                      FOREIGN KEY ( `user_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '积分流水表';
-- 12. 道具流水表 (item_transactions)
CREATE TABLE `item_transactions` (
                                     `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID，自增',
                                     `user_id` VARCHAR ( 36 ) NOT NULL COMMENT '用户ID',
                                     `item_id` VARCHAR ( 36 ) NOT NULL COMMENT '商品ID',
                                     `quantity` INT NOT NULL COMMENT '变动数量（正数为获得，负数为消耗）',
                                     `transaction_type` VARCHAR ( 50 ) NOT NULL COMMENT '交易类型',
                                     `reference_id` VARCHAR ( 36 ) DEFAULT NULL COMMENT '关联的业务ID',
                                     `description` VARCHAR ( 255 ) DEFAULT NULL COMMENT '流水描述',
                                     `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发生时间',
                                     PRIMARY KEY ( `id` ),
                                     INDEX `idx_user_id` ( `user_id` ),
                                     INDEX `idx_item_id` ( `item_id` ),
                                     FOREIGN KEY ( `user_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE,
                                     FOREIGN KEY ( `item_id` ) REFERENCES `shop_items` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '道具流水表';
-- 13. 任务状态变更日志表 (task_logs)
CREATE TABLE `task_logs` (
                             `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID，自增',
                             `task_id` VARCHAR ( 36 ) NOT NULL COMMENT '任务ID',
                             `user_id` VARCHAR ( 36 ) NOT NULL COMMENT '触发操作的用户ID',
                             `action` VARCHAR ( 20 ) NOT NULL COMMENT '操作类型',
                             `previous_status` VARCHAR ( 20 ) DEFAULT NULL COMMENT '变更前的状态',
                             `new_status` VARCHAR ( 20 ) DEFAULT NULL COMMENT '变更后的状态',
                             `remark` VARCHAR ( 255 ) DEFAULT NULL COMMENT '备注说明',
                             `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发生时间',
                             PRIMARY KEY ( `id` ),
                             INDEX `idx_task_id` ( `task_id` ),
                             INDEX `idx_user_id` ( `user_id` ),
                             FOREIGN KEY ( `task_id` ) REFERENCES `tasks` ( `id` ) ON DELETE CASCADE,
                             FOREIGN KEY ( `user_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务状态变更日志表';
-- 14. 会话表 (conversations)
CREATE TABLE `conversations` (
                                 `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                                 `user1_id` VARCHAR ( 36 ) NOT NULL COMMENT '用户1 ID',
                                 `user2_id` VARCHAR ( 36 ) NOT NULL COMMENT '用户2 ID',
                                 `type` VARCHAR ( 20 ) DEFAULT 'direct' COMMENT '会话类型 (direct, system)',
                                 `last_message_id` VARCHAR ( 36 ) DEFAULT NULL COMMENT '最后一条消息ID',
                                 `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                 `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                                 PRIMARY KEY ( `id` ),
                                 INDEX `idx_user1` ( `user1_id` ),
                                 INDEX `idx_user2` ( `user2_id` ),
                                 FOREIGN KEY ( `user1_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE,
                                 FOREIGN KEY ( `user2_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '会话表';
-- 15. 消息表 (messages)
CREATE TABLE `messages` (
                            `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                            `conversation_id` VARCHAR ( 36 ) NOT NULL COMMENT '所属会话ID',
                            `sender_id` VARCHAR ( 36 ) NOT NULL COMMENT '发送者ID (系统消息可为system)',
                            `content` TEXT NOT NULL COMMENT '消息内容',
                            `type` VARCHAR ( 20 ) DEFAULT 'text' COMMENT '消息类型 (text, image, task_invite)',
                            `is_read` TINYINT ( 1 ) DEFAULT 0 COMMENT '是否已读',
                            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
                            PRIMARY KEY ( `id` ),
                            INDEX `idx_conversation` ( `conversation_id` ),
                            INDEX `idx_sender` ( `sender_id` ),
                            FOREIGN KEY ( `conversation_id` ) REFERENCES `conversations` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '消息表';
-- 16. 成就分类表 (achievement_categories)
CREATE TABLE `achievement_categories` (
                                          `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                                          `title` VARCHAR ( 50 ) NOT NULL COMMENT '分类标题',
                                          `description` VARCHAR ( 255 ) DEFAULT NULL COMMENT '分类描述',
                                          `cover_image` VARCHAR ( 255 ) DEFAULT NULL COMMENT '封面图',
                                          `sort_order` INT DEFAULT 0 COMMENT '排序权重',
                                          PRIMARY KEY ( `id` )
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '成就分类表';
-- 17. 成就表 (achievements)
CREATE TABLE `achievements` (
                                `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                                `category_id` VARCHAR ( 36 ) NOT NULL COMMENT '所属分类ID',
                                `title` VARCHAR ( 100 ) NOT NULL COMMENT '成就标题',
                                `description` VARCHAR ( 255 ) DEFAULT NULL COMMENT '成就描述',
                                `icon` VARCHAR ( 50 ) DEFAULT NULL COMMENT '图标',
                                `points_reward` INT DEFAULT 0 COMMENT '完成奖励积分',
                                `sort_order` INT DEFAULT 0 COMMENT '排序权重',
                                PRIMARY KEY ( `id` ),
                                FOREIGN KEY ( `category_id` ) REFERENCES `achievement_categories` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '成就表';
-- 18. 用户成就解锁表 (user_achievements)
CREATE TABLE `user_achievements` (
                                     `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                                     `user_id` VARCHAR ( 36 ) NOT NULL COMMENT '用户ID',
                                     `achievement_id` VARCHAR ( 36 ) NOT NULL COMMENT '成就ID',
                                     `image_url` VARCHAR ( 255 ) DEFAULT NULL COMMENT '留念图片',
                                     `note` TEXT DEFAULT NULL COMMENT '心得笔记',
                                     `completed_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '解锁时间',
                                     PRIMARY KEY ( `id` ),
                                     UNIQUE KEY `uk_user_achievement` ( `user_id`, `achievement_id` ),
                                     FOREIGN KEY ( `user_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE,
                                     FOREIGN KEY ( `achievement_id` ) REFERENCES `achievements` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户成就解锁表';
-- 19. 特别奖励表 (special_items)
CREATE TABLE `special_items` (
                                 `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                                 `name` VARCHAR ( 50 ) NOT NULL COMMENT '奖励名称',
                                 `description` VARCHAR ( 255 ) DEFAULT NULL COMMENT '奖励描述',
                                 `cards_cost` INT NOT NULL COMMENT '兑换所需万能卡数量',
                                 `icon` VARCHAR ( 50 ) DEFAULT NULL COMMENT '图标',
                                 `color` VARCHAR ( 50 ) DEFAULT NULL COMMENT '颜色样式',
                                 `image_url` VARCHAR ( 255 ) DEFAULT NULL COMMENT '自定义图片',
                                 `status` VARCHAR ( 20 ) DEFAULT 'active' COMMENT '状态 (active, inactive)',
                                 `stock` INT DEFAULT - 1 COMMENT '库存数量，-1为不限量',
                                 `version` INT DEFAULT 0 COMMENT '乐观锁版本号',
                                 `belong_binding_id` VARCHAR ( 36 ) DEFAULT NULL COMMENT '所属绑定ID',
                                 `publish_user_id` VARCHAR ( 36 ) DEFAULT NULL COMMENT '发布者ID',
                                 `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                 `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                                 `deleted_at` DATETIME DEFAULT NULL COMMENT '逻辑删除时间',
                                 PRIMARY KEY ( `id` ),
                                 FOREIGN KEY ( `belong_binding_id` ) REFERENCES `binding_relations` ( `id` ) ON DELETE CASCADE,
                                 FOREIGN KEY ( `publish_user_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '特别奖励表';
-- 19.5 用户特别奖励表 (user_special_items)
CREATE TABLE `user_special_items` (
                                      `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                                      `user_id` VARCHAR ( 36 ) NOT NULL COMMENT '用户ID',
                                      `special_item_id` VARCHAR ( 36 ) NOT NULL COMMENT '特别奖励ID',
                                      `status` VARCHAR ( 20 ) DEFAULT 'usable' COMMENT '状态 (usable, used)',
                                      `code` VARCHAR ( 50 ) DEFAULT NULL COMMENT '核销码',
                                      `acquired_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '获得时间',
                                      `used_at` DATETIME DEFAULT NULL COMMENT '核销时间',
                                      PRIMARY KEY ( `id` ),
                                      UNIQUE KEY `uk_code` ( `code` ),
                                      INDEX `idx_user_id` ( `user_id` ),
                                      INDEX `idx_special_item_id` ( `special_item_id` ),
                                      FOREIGN KEY ( `user_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE,
                                      FOREIGN KEY ( `special_item_id` ) REFERENCES `special_items` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户特别奖励表';
-- 20. 系统通知表 (notifications)
CREATE TABLE `notifications` (
                                 `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                                 `user_id` VARCHAR ( 36 ) NOT NULL COMMENT '接收用户ID',
                                 `title` VARCHAR ( 100 ) NOT NULL COMMENT '通知标题',
                                 `content` TEXT NOT NULL COMMENT '通知内容',
                                 `type` VARCHAR ( 50 ) NOT NULL COMMENT '通知类型 (task_update, system, reward)',
                                 `reference_id` VARCHAR ( 36 ) DEFAULT NULL COMMENT '关联业务ID',
                                 `is_read` TINYINT ( 1 ) DEFAULT 0 COMMENT '是否已读',
                                 `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                 PRIMARY KEY ( `id` ),
                                 INDEX `idx_user_id` ( `user_id` ),
                                 FOREIGN KEY ( `user_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '系统通知表';
-- 21. 万能卡流水表 (card_transactions)
CREATE TABLE `card_transactions` (
                                     `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID，自增',
                                     `user_id` VARCHAR ( 36 ) NOT NULL COMMENT '用户ID',
                                     `amount` INT NOT NULL COMMENT '变动数量（正数为增加，负数为扣除）',
                                     `transaction_type` VARCHAR ( 50 ) NOT NULL COMMENT '交易类型 (task_reward, special_redeem)',
                                     `reference_id` VARCHAR ( 36 ) DEFAULT NULL COMMENT '关联的业务ID',
                                     `description` VARCHAR ( 255 ) DEFAULT NULL COMMENT '流水描述',
                                     `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发生时间',
                                     PRIMARY KEY ( `id` ),
                                     INDEX `idx_user_id` ( `user_id` ),
                                     FOREIGN KEY ( `user_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '万能卡流水表';
-- 22. 奖励兑换码表 (reward_codes)
CREATE TABLE `reward_codes` (
                                `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                                `code` VARCHAR ( 20 ) NOT NULL COMMENT '兑换码',
                                `reward_type` VARCHAR ( 20 ) NOT NULL COMMENT '奖励类型 (prop, points, special)',
                                `reward_name` VARCHAR ( 50 ) NOT NULL COMMENT '奖励名称',
                                `reward_count` INT DEFAULT 1 COMMENT '奖励数量',
                                `icon` VARCHAR ( 50 ) DEFAULT NULL COMMENT '图标',
                                `color` VARCHAR ( 50 ) DEFAULT NULL COMMENT '颜色样式',
                                `image_url` VARCHAR ( 255 ) DEFAULT NULL COMMENT '自定义图片',
                                `creator_id` VARCHAR ( 36 ) NOT NULL COMMENT '创建者ID',
                                `status` VARCHAR ( 20 ) DEFAULT 'unused' COMMENT '状态 (unused, used, voided)',
                                `redeemer_id` VARCHAR ( 36 ) DEFAULT NULL COMMENT '兑换者ID',
                                `redeemed_at` DATETIME DEFAULT NULL COMMENT '兑换时间',
                                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                PRIMARY KEY ( `id` ),
                                UNIQUE KEY `uk_code` ( `code` ),
                                INDEX `idx_creator_id` ( `creator_id` ),
                                FOREIGN KEY ( `creator_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE,
                                FOREIGN KEY ( `redeemer_id` ) REFERENCES `users` ( `id` ) ON DELETE
                                    SET NULL
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '奖励兑换码表';

-- 23. 用户设置表 (user_settings)
CREATE TABLE `user_settings` (
                                 `user_id` VARCHAR ( 36 ) NOT NULL COMMENT '用户ID',
                                 `theme` VARCHAR ( 20 ) DEFAULT 'system' COMMENT '主题 (light, dark, system)',
                                 `notifications_enabled` TINYINT ( 1 ) DEFAULT 1 COMMENT '是否开启通知',
                                 `sound_enabled` TINYINT ( 1 ) DEFAULT 1 COMMENT '是否开启声音',
                                 `vibration_enabled` TINYINT ( 1 ) DEFAULT 1 COMMENT '是否开启震动',
                                 `privacy_mode` TINYINT ( 1 ) DEFAULT 0 COMMENT '是否开启隐私模式',
                                 `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                                 PRIMARY KEY ( `user_id` ),
                                 FOREIGN KEY ( `user_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户设置表';
-- 24. 用户反馈表 (feedbacks)
CREATE TABLE `feedbacks` (
                             `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                             `user_id` VARCHAR ( 36 ) NOT NULL COMMENT '用户ID',
                             `content` TEXT NOT NULL COMMENT '反馈内容',
                             `images` JSON DEFAULT NULL COMMENT '反馈图片URL数组',
                             `contact_info` VARCHAR ( 100 ) DEFAULT NULL COMMENT '联系方式',
                             `status` VARCHAR ( 20 ) DEFAULT 'pending' COMMENT '状态 (pending, processing, resolved, closed)',
                             `reply` TEXT DEFAULT NULL COMMENT '客服回复',
                             `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
                             `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                             PRIMARY KEY ( `id` ),
                             INDEX `idx_user_id` ( `user_id` ),
                             FOREIGN KEY ( `user_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户反馈表';
-- 25. 用户设备表 (user_devices)
CREATE TABLE `user_devices` (
                                `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                                `user_id` VARCHAR ( 36 ) NOT NULL COMMENT '用户ID',
                                `device_type` VARCHAR ( 20 ) NOT NULL COMMENT '设备类型 (ios, android, web)',
                                `device_token` VARCHAR ( 255 ) NOT NULL COMMENT '推送Token',
                                `device_name` VARCHAR ( 100 ) DEFAULT NULL COMMENT '设备名称',
                                `last_active_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后活跃时间',
                                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '绑定时间',
                                PRIMARY KEY ( `id` ),
                                UNIQUE KEY `uk_device_token` ( `device_token` ),
                                INDEX `idx_user_id` ( `user_id` ),
                                FOREIGN KEY ( `user_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户设备表';
-- 26. 任务收藏表 (task_bookmarks)
CREATE TABLE `task_bookmarks` (
                                  `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                                  `user_id` VARCHAR ( 36 ) NOT NULL COMMENT '用户ID',
                                  `task_id` VARCHAR ( 36 ) NOT NULL COMMENT '任务ID',
                                  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
                                  PRIMARY KEY ( `id` ),
                                  UNIQUE KEY `uk_user_task` ( `user_id`, `task_id` ),
                                  INDEX `idx_user_id` ( `user_id` ),
                                  INDEX `idx_task_id` ( `task_id` ),
                                  FOREIGN KEY ( `user_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE,
                                  FOREIGN KEY ( `task_id` ) REFERENCES `tasks` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务收藏表';
-- 27. 道具核销记录表 (item_redemption_records)
CREATE TABLE `item_redemption_records` (
                                           `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                                           `item_type` VARCHAR ( 20 ) NOT NULL COMMENT '核销物品类型 (normal_item, special_item)',
                                           `instance_id` VARCHAR ( 36 ) NOT NULL COMMENT '用户道具实例ID (user_items.id 或 user_special_items.id)',
                                           `owner_id` VARCHAR ( 36 ) NOT NULL COMMENT '道具所有者ID',
                                           `redeemer_id` VARCHAR ( 36 ) NOT NULL COMMENT '核销者ID',
                                           `code` VARCHAR ( 50 ) NOT NULL COMMENT '核销码',
                                           `remark` VARCHAR ( 255 ) DEFAULT NULL COMMENT '核销备注',
                                           `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '核销时间',
                                           PRIMARY KEY ( `id` ),
                                           INDEX `idx_owner_id` ( `owner_id` ),
                                           INDEX `idx_redeemer_id` ( `redeemer_id` ),
                                           INDEX `idx_instance_id` ( `instance_id` ),
                                           FOREIGN KEY ( `owner_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE,
                                           FOREIGN KEY ( `redeemer_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '道具核销记录表';
-- 28. 任务评论表 (task_comments)
CREATE TABLE `task_comments` (
                                 `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                                 `task_id` VARCHAR ( 36 ) NOT NULL COMMENT '任务ID',
                                 `user_id` VARCHAR ( 36 ) NOT NULL COMMENT '评论者ID',
                                 `content` TEXT NOT NULL COMMENT '评论内容',
                                 `reply_to_id` VARCHAR ( 36 ) DEFAULT NULL COMMENT '回复的评论ID',
                                 `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
                                 `deleted_at` DATETIME DEFAULT NULL COMMENT '逻辑删除时间',
                                 PRIMARY KEY ( `id` ),
                                 INDEX `idx_task_id` ( `task_id` ),
                                 FOREIGN KEY ( `task_id` ) REFERENCES `tasks` ( `id` ) ON DELETE CASCADE,
                                 FOREIGN KEY ( `user_id` ) REFERENCES `users` ( `id` ) ON DELETE CASCADE,
                                 FOREIGN KEY ( `reply_to_id` ) REFERENCES `task_comments` ( `id` ) ON DELETE
                                     SET NULL
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务评论表';
-- 29. 任务模板库表 (task_templates)
CREATE TABLE `task_templates` (
                                  `id` VARCHAR ( 36 ) NOT NULL COMMENT 'ID，全局唯一',
                                  `title` VARCHAR ( 100 ) NOT NULL COMMENT '模板标题',
                                  `description` TEXT DEFAULT NULL COMMENT '模板描述',
                                  `category_id` VARCHAR ( 36 ) DEFAULT NULL COMMENT '推荐分类ID',
                                  `level_id` VARCHAR ( 36 ) DEFAULT NULL COMMENT '推荐等级ID',
                                  `cover_image` VARCHAR ( 255 ) DEFAULT NULL COMMENT '封面图URL',
                                  `reward_type` VARCHAR ( 20 ) DEFAULT 'normal' COMMENT '推荐奖励类型 (normal, wildcard, points)',
                                  `reward_amount` INT DEFAULT 0 COMMENT '推荐奖励数量',
                                  `source` VARCHAR ( 20 ) DEFAULT 'system' COMMENT '来源 (system, user)',
                                  `author_id` VARCHAR ( 36 ) DEFAULT NULL COMMENT '投稿用户ID（系统模板为空）',
                                  `status` VARCHAR ( 20 ) DEFAULT 'pending' COMMENT '状态 (pending, approved, rejected)',
                                  `usage_count` INT DEFAULT 0 COMMENT '被使用/拉取次数',
                                  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                                  `deleted_at` DATETIME DEFAULT NULL COMMENT '逻辑删除时间',
                                  PRIMARY KEY ( `id` ),
                                  INDEX `idx_status` ( `status` ),
                                  INDEX `idx_source` ( `source` ),
                                  FOREIGN KEY ( `category_id` ) REFERENCES `categories` ( `id` ) ON DELETE
                                      SET NULL,
                                  FOREIGN KEY ( `level_id` ) REFERENCES `task_levels` ( `id` ) ON DELETE
                                      SET NULL,
                                  FOREIGN KEY ( `author_id` ) REFERENCES `users` ( `id` ) ON DELETE
                                      SET NULL
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务模板库表';
-- 30. 系统配置表 (system_config)
CREATE TABLE system_config (
                               id BIGINT auto_increment COMMENT '主键ID' PRIMARY KEY,
                               config_key VARCHAR ( 255 ) NOT NULL COMMENT '配置项的唯一标识符，例如：app.name, feature.toggle.new_ui, email.smtp.host',
                               config_value TEXT NOT NULL COMMENT '配置项的值。对于复杂类型（如JSON），可存储在此字段。',
                               data_type ENUM ( 'STRING', 'INTEGER', 'BOOLEAN', 'JSON', 'DOUBLE' ) DEFAULT 'STRING' NULL COMMENT '配置值的数据类型，用于程序解析和校验。',
                               category VARCHAR ( 100 ) DEFAULT 'DEFAULT' NULL COMMENT '配置项的分类，便于管理和查询，例如：APP_INFO, FEATURE_FLAGS, EMAIL_SETTINGS, CACHE_CONFIG',
                               description TEXT NULL COMMENT '配置项的详细描述，说明其用途和可能的取值。',
                               is_enabled TINYINT ( 1 ) DEFAULT 1 NULL COMMENT '是否启用该配置项。0-禁用，1-启用。可用于临时关闭某个功能而无需删除记录。',
                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '记录创建时间',
                               updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '记录最后更新时间',
                               CONSTRAINT config_key UNIQUE ( config_key ),
                               INDEX idx_category ( category ),
                               INDEX idx_config_key ( config_key )
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '系统配置表';