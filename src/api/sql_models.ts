/**
 * 通用响应结果
 */
export interface Result<T> {
    code: number;
    msg: string;
    data: T;
    errorMsg?: string;
    success: boolean;
}

/**
 * 用户实体类型定义
 */
export interface Users {
    /**
     * ID，全局唯一
     */
    id: string;

    /**
     * 用户名
     */
    username: string;

    /**
     * 昵称
     */
    nickname?: string; // 可选字段 (对应 Java 的 String 默认为 null)

    /**
     * 性别 (male, female, other)
     */
    gender?: string; // 可选字段

    /**
     * 头像URL
     */
    avatar?: string; // 可选字段

    /**
     * 用户等级
     */
    level?: number; // 可选字段 (对应 Java 的 Integer)

    /**
     * 称号
     */
    title?: string; // 可选字段

    /**
     * 生日
     */
    birthday?: string; // 可选字段 (前端通常处理为 ISO 8601 字符串)

    /**
     * 纪念日
     */
    anniversary?: string; // 可选字段 (前端通常处理为 ISO 8601 字符串)

    /**
     * 位置
     */
    location?: string; // 可选字段

    /**
     * 手机号
     */
    phone?: string; // 可选字段

    /**
     * 邮箱
     */
    email?: string; // 可选字段

    /**
     * 密码
     */
    password?: string; // 可选字段

    /**
     * 登录方式 (email, phone, username)
     */
    loginMethod?: string; // 可选字段

    /**
     * 最后登录时间
     */
    lastLoginAt?: string; // 可选字段 (前端通常处理为 ISO 8601 字符串)

    /**
     * 最后登录IP
     */
    lastLoginIp?: string; // 可选字段

    /**
     * 积分余额
     */
    points?: number; // 可选字段

    /**
     * 创建时间
     */
    createdAt?: string; // 可选字段 (前端通常处理为 ISO 8601 字符串)

    /**
     * 更新时间
     */
    updatedAt?: string; // 可选字段 (前端通常处理为 ISO 8601 字符串)

    /**
     * 邀请码
     */
    inviteCode?: string;
}

/**
* 绑定关系实体类型定义
*/
export interface BindingRelations {
    /**
     * ID，全局唯一
     */
    id: string;

    /**
     * 用户ID
     */
    userId: string;

    /**
     * 目标ID
     */
    targetId: string;

    /**
     * 状态申请中、已接受、已拒绝、已解除(pending, accepted, rejected, broken)
     */
    status: string; // 可选字段

    /**
     * 创建时间
     */
    createdAt?: string; // 可选字段 (前端通常处理为 ISO 8601 字符串)

    /**
     * 更新时间
     */
    updatedAt: string; // 可选字段 (前端通常处理为 ISO 8601 字符串)
}

/**
 * 任务分类实体类型定义
 */
export interface Categories {
    /**
     * ID，全局唯一
     */
    id: string;
  
    /**
     * 分类名称
     */
    name: string;
  
    /**
     * 排序权重
     */
    sortOrder?: number; // 可选字段 (对应 Java 的 Integer)
  
    /**
     * 所属绑定ID
     */
    belongBindingId?: string; // 可选字段
  }

  /**
 * 道具流水实体类型定义
 */
export interface ItemTransactions {
    /**
     * ID，自增
     */
    id?: number; // 可选字段，因为通常是数据库自动生成的
  
    /**
     * 用户ID
     */
    userId: string;
  
    /**
     * 商品ID
     */
    itemId: string;
  
    /**
     * 变动数量（正数为获得，负数为消耗）
     */
    quantity: number;
  
    /**
     * 交易类型
     */
    transactionType?: string; // 可选字段
  
    /**
     * 关联的业务ID
     */
    referenceId?: string; // 可选字段
  
    /**
     * 流水描述
     */
    description?: string; // 可选字段
  
    /**
     * 发生时间
     */
    createdAt?: string; // 可选字段 (前端通常处理为 ISO 8601 字符串)
  }


  /**
 * 积分流水实体类型定义
 */
export interface PointTransactions {
    /**
     * ID，自增
     */
    id?: number; // 可选字段，因为通常是数据库自动生成的
  
    /**
     * 用户ID
     */
    userId: string;
  
    /**
     * 变动数量（正数为增加，负数为扣除）
     */
    amount: number;
  
    /**
     * 交易类型
     */
    transactionType?: string; // 可选字段
  
    /**
     * 关联的业务ID
     */
    referenceId?: string; // 可选字段
  
    /**
     * 流水描述
     */
    description?: string; // 可选字段
  
    /**
     * 发生时间
     */
    createdAt?: string; // 可选字段 (前端通常处理为 ISO 8601 字符串)
  }

  /**
 * 商店商品实体类型定义
 */
export interface ShopItems {
    /**
     * ID，全局唯一
     */
    id: string;
  
    /**
     * 商品名称
     */
    name: string;
  
    /**
     * 商品描述
     */
    description?: string; // 可选字段
  
    /**
     * 兑换所需积分
     */
    pointsCost: number;
  
    /**
     * 图标标识符
     */
    icon?: string; // 可选字段
  
    /**
     * 颜色样式
     */
    color?: string; // 可选字段
  
    /**
     * 状态 (active, inactive)
     */
    status?: string; // 可选字段
  
    /**
     * 创建时间
     */
    createdAt?: string; // 可选字段 (前端通常处理为 ISO 8601 字符串)
  
    /**
     * 所属绑定ID
     */
    belongBindingId?: string; // 可选字段
  
    /**
     * 所属用户ID
     */
    belongUserId?: string; // 可选字段
  
    /**
     * 发布者ID
     */
    publishUserId?: string; // 可选字段
  
    /**
     * 排序权重
     */
    sortOrder?: number; // 可选字段
  }

  /**
 * 标签实体类型定义
 */
export interface Tags {
    /**
     * ID，全局唯一
     */
    id: string;
  
    /**
     * 标签名称
     */
    name: string;
  
    /**
     * 所属绑定ID
     */
    belongBindingId?: string; // 可选字段
  }

  /**
 * 任务图片实体类型定义
 */
export interface TaskImages {
    /**
     * ID，全局唯一
     */
    id: string;
  
    /**
     * 关联任务ID
     */
    taskId: string;
  
    /**
     * 图片URL
     */
    imageUrl: string;
  
    /**
     * 排序权重
     */
    sortOrder?: number; // 可选字段 (对应 Java 的 Integer)
  }

  /**
 * 任务等级实体类型定义
 */
export interface TaskLevels {
    /**
     * ID，全局唯一
     */
    id: string;
  
    /**
     * 等级名称
     */
    name: string;
  
    /**
     * 最大奖励数量
     */
    maxRewards?: number; // 可选字段 (对应 Java 的 Integer)
  
    /**
     * 排序权重
     */
    sortOrder?: number; // 可选字段 (对应 Java 的 Integer)
  }

  /**
 * 任务状态变更日志实体类型定义
 */
export interface TaskLogs {
    /**
     * ID，自增
     */
    id?: number; // 可选字段，因为通常是数据库自动生成的
  
    /**
     * 任务ID
     */
    taskId: string;
  
    /**
     * 触发操作的用户ID
     */
    userId: string;
  
    /**
     * 操作类型
     */
    action?: string; // 可选字段
  
    /**
     * 变更前的状态
     */
    previousStatus?: string; // 可选字段
  
    /**
     * 变更后的状态
     */
    newStatus?: string; // 可选字段
  
    /**
     * 备注说明
     */
    remark?: string; // 可选字段
  
    /**
     * 发生时间
     */
    createdAt?: string; // 可选字段 (前端通常处理为 ISO 8601 字符串)
  }

  /**
 * 任务奖励实体类型定义
 */
export interface TaskRewards {
    /**
     * ID，全局唯一
     */
    id: string;
  
    /**
     * 关联任务ID
     */
    taskId: string;
  
    /**
     * 奖励类型 (normal, wildcard, points)
     */
    type?: string; // 可选字段
  
    /**
     * 奖励内容文本
     */
    content: string;
  
    /**
     * 奖励图标标识符
     */
    icon?: string; // 可选字段
  
    /**
     * 奖励颜色标识符
     */
    color?: string; // 可选字段
  
    /**
     * 数量（积分或万能卡）
     */
    amount?: number; // 可选字段 (对应 Java 的 Integer)
  
    /**
     * 排序权重
     */
    sortOrder?: number; // 可选字段 (对应 Java 的 Integer)
  }

  /**
 * 任务实体类型定义
 */
export interface Tasks {
    /**
     * ID，全局唯一
     */
    id: string;
  
    /**
     * 发布者ID
     */
    authorId: string;
  
    /**
     * 接收者ID
     */
    receiverId?: string; // 可选字段
  
    /**
     * 分类ID
     */
    categoryId?: string; // 可选字段
  
    /**
     * 等级ID
     */
    levelId?: string; // 可选字段
  
    /**
     * 任务标题
     */
    title: string;
  
    /**
     * 任务详细描述
     */
    description?: string; // 可选字段
  
    /**
     * 封面图URL
     */
    coverImage?: string; // 可选字段
  
    /**
     * 截止日期
     */
    deadline?: string; // 可选字段 (前端通常处理为 ISO 8601 字符串)
  
    /**
     * 任务地点
     */
    location?: string; // 可选字段
  
    /**
     * 任务类型 (one-time, daily, weekly, monthly)
     */
    repeatType?: string; // 可选字段

    /**
     * 重复规则配置（如周一、周三）
     */
    repeatConfig?: string; // 可选字段

    /**
     * 任务状态 (pending, accepted, completed, cancelled)
     */
    status?: string; // 可选字段
  
    /**
     * 是否为私密任务
     */
    isPrivate?: number; // 可选字段 (对应 Java 的 Integer，通常存储 0 或 1)
  
    /**
     * 是否使用了特权卡加急
     */
    isPrivileged?: number; // 可选字段 (对应 Java 的 Integer，通常存储 0 或 1)
  
    /**
     * 创建时间
     */
    createdAt?: string; // 可选字段 (前端通常处理为 ISO 8601 字符串)
  
    /**
     * 更新时间
     */
    updatedAt?: string; // 可选字段 (前端通常处理为 ISO 8601 字符串)
  
    /**
     * 所属绑定ID
     */
    belongBindingId?: string; // 可选字段
  }

  /**
 * 任务-标签关联实体类型定义
 */
export interface TaskTags {
    /**
     * 任务ID (联合主键)
     */
    taskId: string;
  
    /**
     * 标签ID (联合主键)
     */
    tagId: string;
  }

  /**
 * 用户道具/背包实体类型定义
 */
export interface UserItems {
    /**
     * ID，全局唯一
     */
    id: string;
  
    /**
     * 用户ID
     */
    userId: string;
  
    /**
     * 商品ID
     */
    itemId: string;
  
    /**
     * 拥有数量
     */
    quantity: number;
  
    /**
     * 最近获得时间
     */
    acquiredAt: string;
  }