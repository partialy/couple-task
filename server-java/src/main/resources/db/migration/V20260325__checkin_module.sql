-- 签到模块：签到计划 + 每日奖励 + 签到记录

CREATE TABLE IF NOT EXISTS checkin_plans (
    id                VARCHAR(36)  PRIMARY KEY COMMENT 'ID，全局唯一',
    belong_binding_id VARCHAR(36)  NOT NULL    COMMENT '属于绑定id（关联绑定表的id）',
    creator_id        VARCHAR(36)  NOT NULL    COMMENT '配置者（给对方配签到的人）',
    target_user_id    VARCHAR(36)  NOT NULL    COMMENT '签到执行者（需要打卡的人）',
    name              VARCHAR(100) NOT NULL    COMMENT '计划名称',
    description       VARCHAR(500)             COMMENT '计划描述',
    icon              VARCHAR(500)             COMMENT 'Lucide 图标 key 或图片 URL',
    color             VARCHAR(50)              COMMENT '颜色标识',
    cycle_type        VARCHAR(20)  NOT NULL    COMMENT '周期类型：weekly | monthly',
    cycle_days        INT          NOT NULL DEFAULT 7  COMMENT '周期天数：7 或 30',
    is_consecutive    TINYINT      NOT NULL DEFAULT 0  COMMENT '0=非连续，1=连续（断签重置）',
    time_windows      JSON                    COMMENT '可签到时段 JSON，如 [{"start":"08:00","end":"12:00"}]',
    status            VARCHAR(20)  NOT NULL DEFAULT 'active' COMMENT 'active | inactive',
    created_at        DATETIME                COMMENT '创建时间',
    updated_at        DATETIME                COMMENT '更新时间',
    deleted_at        DATETIME                COMMENT '逻辑删除时间',
    INDEX idx_binding (belong_binding_id),
    INDEX idx_target  (target_user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='签到计划配置表';

CREATE TABLE IF NOT EXISTS checkin_day_rewards (
    id            VARCHAR(36)  PRIMARY KEY COMMENT 'ID，全局唯一',
    plan_id       VARCHAR(36)  NOT NULL    COMMENT '关联 checkin_plans.id',
    day_number    INT          NOT NULL    COMMENT '第几天的奖励，1-7 或 1-30',
    reward_type   VARCHAR(20)  NOT NULL    COMMENT '奖励类型：points | wild_card | prop',
    reward_name   VARCHAR(100)             COMMENT '奖励名称；prop 自定义，points/wild_card 可为空',
    reward_amount INT          NOT NULL DEFAULT 1 COMMENT '奖励数量',
    description   VARCHAR(200)             COMMENT '奖励描述',
    icon          VARCHAR(500)             COMMENT 'Lucide 图标 key 或图片 URL',
    color         VARCHAR(50)              COMMENT '颜色标识',
    sort_order    INT          DEFAULT 0   COMMENT '排序权重',
    INDEX idx_plan_day (plan_id, day_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='签到每日奖励配置表';

CREATE TABLE IF NOT EXISTS checkin_records (
    id            INT          AUTO_INCREMENT PRIMARY KEY COMMENT 'ID，自增',
    plan_id       VARCHAR(36)  NOT NULL    COMMENT '关联 checkin_plans.id',
    user_id       VARCHAR(36)  NOT NULL    COMMENT '签到用户ID',
    checkin_date  DATE         NOT NULL    COMMENT '签到日期（去重用）',
    day_number    INT          NOT NULL    COMMENT '领取的是第几天奖励',
    cycle_number  INT          NOT NULL DEFAULT 1 COMMENT '第几个周期轮次',
    streak_count  INT          NOT NULL DEFAULT 1 COMMENT '本次签到时的连续天数',
    checkin_at    DATETIME     NOT NULL    COMMENT '实际签到时间',
    UNIQUE KEY uk_plan_user_date (plan_id, user_id, checkin_date),
    INDEX idx_user_plan (user_id, plan_id, checkin_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='签到打卡记录表';
