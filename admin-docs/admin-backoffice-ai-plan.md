# 管理后台前后端协同开发文档（仅依赖 SQL + 本文档）

## 1. 使用说明

本文件用于给 AI 直接开发使用，默认 AI 只能拿到：
- `server-java/src/main/resources/sqls/sql.sql`
- 本 Markdown 文档

AI 不依赖既有后端接口代码，按本文档约定直接实现前后端。

---

## 2. 总体目标

建设一个可运营的管理后台，覆盖：
- 用户管理
- 任务与审核
- 商城/道具/兑换码
- 交易流水
- 内容治理（动态/日记/评论）
- 通知与系统配置
- 反馈工单

并保证：查询、操作、审核、审计日志、权限控制完整闭环。

---

## 3. 全局接口约定（前后端必须统一）

## 3.1 基础约定

- 协议：HTTP + JSON
- 字符集：UTF-8
- 时间格式：`yyyy-MM-dd HH:mm:ss`
- 时区：`Asia/Shanghai`
- API 前缀：`/api/admin/v1`
- 鉴权：`Authorization: Bearer <token>`

## 3.2 统一响应结构

```json
{
  "code": 0,
  "message": "ok",
  "data": {},
  "traceId": "a1b2c3d4e5"
}
```

约定：
- `code = 0` 表示成功，非 0 表示失败。
- `message` 为可读提示。
- `traceId` 用于排障与日志检索。

## 3.3 分页响应结构

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [],
    "page": 1,
    "pageSize": 20,
    "total": 132,
    "totalPages": 7
  },
  "traceId": "a1b2c3d4e5"
}
```

## 3.4 通用分页查询参数

- `page`：页码（从 1 开始）
- `pageSize`：每页条数（建议默认 20，上限 200）
- `keyword`：关键字（可选）
- `startTime`、`endTime`：时间范围（可选）
- `sortBy`、`sortOrder`：排序（可选）

## 3.5 错误码约定

- `0`：成功
- `40001`：参数错误
- `40002`：业务状态不允许
- `40100`：未登录或 token 失效
- `40300`：无权限
- `40400`：资源不存在
- `40900`：数据冲突（唯一键/并发）
- `50000`：系统异常

---

## 4. 数据域与核心表映射（来自 SQL）

- 用户域：`users`、`user_devices`、`user_settings`、`binding_relations`
- 任务域：`tasks`、`task_comments`、`task_logs`、`task_rewards`、`task_templates`、`categories`、`tags`、`task_levels`
- 签到成就：`checkin_plans`、`checkin_day_rewards`、`checkin_records`、`achievements`、`achievement_categories`、`user_achievements`
- 商城道具：`shop_items`、`special_items`、`user_items`、`user_special_items`、`item_redemption_records`
- 资产流水：`point_transactions`、`card_transactions`、`item_transactions`
- 内容社区：`bind_moments`、`bind_moment_comments`、`bind_moment_likes`、`diary_entries`
- 日程纪念：`schedules`、`memorial_days`
- 心愿：`wish_items`、`wish_pick_quota`
- 消息通知：`messages`、`conversations`、`notifications`、`system_notices`
- 系统配置：`system_config`
- 反馈工单：`feedbacks`
- 兑换码：`reward_codes`

---

## 5. 前端开发文档（完整）

## 5.1 页面与菜单结构

- 控制台
- 用户中心
  - 用户管理
  - 绑定关系
- 任务中心
  - 任务列表
  - 任务审核
  - 评论治理
  - 分类/标签/等级
  - 模板审核
- 签到与成就
- 商城与道具
- 兑换码中心
- 交易流水
- 内容治理
- 通知中心
- 系统配置
- 反馈工单

## 5.2 前端页面通用交互规范

- 列表页：查询区 + 表格区 + 分页区。
- 详情页：基础信息 + 关联记录 + 操作日志。
- 危险操作（封禁、作废、资产调整）必须二次确认并填写原因。
- 所有提交型操作成功后，统一提示并刷新当前列表。

## 5.3 前端状态与请求规范

- 所有请求统一走 `request` 封装。
- 自动注入 `Authorization`。
- 遇到 `40100` 统一跳转登录页。
- 列表查询参数统一结构，避免每页重复定义。
- 时间、状态枚举统一在前端常量管理。

## 5.4 前端页面字段建议（示例）

### 用户管理列表
- 列：`id`、`username`、`nickname`、`phone`、`email`、`status`、`points`、`cards`、`createdAt`
- 筛选：关键字、状态、创建时间
- 操作：查看详情、封禁/解封、资产调整

### 任务管理列表
- 列：`id`、`title`、`authorId`、`receiverId`、`status`、`listStatus`、`deadline`、`createdAt`
- 筛选：状态、发布者、接收者、时间范围
- 操作：详情、下架、恢复、关闭

### 兑换码列表
- 列：`id`、`code`、`rewardType`、`rewardName`、`rewardCount`、`status`、`creatorId`、`redeemerId`、`redeemedAt`
- 筛选：状态、奖励类型、创建时间
- 操作：作废、恢复、详情

---

## 6. 约定 API 清单（前后端共同遵守）

说明：以下为必须实现的首批管理接口，已满足后台 MVP 与后续扩展。

## 6.1 认证与管理员会话

- `POST /api/admin/v1/auth/login`
  - 请求：
  ```json
  { "username": "admin", "password": "123456" }
  ```
  - 响应：
  ```json
  {
    "code": 0,
    "message": "ok",
    "data": { "token": "jwt-token", "expireAt": "2026-04-17 00:00:00", "adminInfo": { "id": "1", "name": "Admin", "role": "SUPER_ADMIN" } },
    "traceId": "x1"
  }
  ```

- `POST /api/admin/v1/auth/logout`
- `GET /api/admin/v1/auth/me`

## 6.2 用户中心

- `GET /api/admin/v1/users`（分页）
- `GET /api/admin/v1/users/{id}`
- `POST /api/admin/v1/users/{id}/status`
  - 请求：`{ "status": "active|blocked|disabled", "reason": "..." }`
- `POST /api/admin/v1/users/{id}/assets/adjust`
  - 请求：`{ "pointsDelta": 100, "cardsDelta": -1, "reason": "manual_adjust" }`
- `GET /api/admin/v1/users/{id}/devices`
- `GET /api/admin/v1/bindings`（绑定关系分页）

## 6.3 任务中心

- `GET /api/admin/v1/tasks`（分页）
- `GET /api/admin/v1/tasks/{id}`
- `POST /api/admin/v1/tasks/{id}/status`
  - 请求：`{ "status": "pending|accepted|completed|cancelled", "reason": "..." }`
- `POST /api/admin/v1/tasks/{id}/listing-status`
  - 请求：`{ "listStatus": "published|unpublished|draft", "reason": "..." }`
- `GET /api/admin/v1/task-comments`（分页）
- `POST /api/admin/v1/task-comments/{id}/delete`
- `POST /api/admin/v1/task-comments/{id}/restore`
- `GET /api/admin/v1/task-templates`（分页）
- `POST /api/admin/v1/task-templates/{id}/audit`
  - 请求：`{ "status": "approved|rejected", "reason": "..." }`

## 6.4 签到与成就

- `GET /api/admin/v1/checkin-plans`（分页）
- `POST /api/admin/v1/checkin-plans/{id}/status`
- `GET /api/admin/v1/checkin-records`（分页）
- `GET /api/admin/v1/achievements`（分页）
- `POST /api/admin/v1/achievements`
- `PUT /api/admin/v1/achievements/{id}`
- `POST /api/admin/v1/achievements/{id}/status`

## 6.5 商城与道具

- `GET /api/admin/v1/shop-items`（分页）
- `POST /api/admin/v1/shop-items`
- `PUT /api/admin/v1/shop-items/{id}`
- `POST /api/admin/v1/shop-items/{id}/status`
- `GET /api/admin/v1/special-items`（分页）
- `POST /api/admin/v1/special-items`
- `PUT /api/admin/v1/special-items/{id}`
- `POST /api/admin/v1/special-items/{id}/status`
- `GET /api/admin/v1/user-items`（分页）
- `POST /api/admin/v1/user-items/verify`
  - 请求：`{ "code": "ABC123", "remark": "核销备注" }`
- `GET /api/admin/v1/item-redemption-records`（分页）

## 6.6 兑换码

- `GET /api/admin/v1/reward-codes`（分页）
- `POST /api/admin/v1/reward-codes/batch-generate`
  - 请求：
  ```json
  {
    "count": 100,
    "rewardType": "points|prop|special",
    "rewardName": "积分奖励",
    "rewardCount": 10,
    "description": "活动投放"
  }
  ```
- `POST /api/admin/v1/reward-codes/{id}/void`
- `POST /api/admin/v1/reward-codes/{id}/restore`

## 6.7 交易流水

- `GET /api/admin/v1/transactions/points`（分页）
- `GET /api/admin/v1/transactions/cards`（分页）
- `GET /api/admin/v1/transactions/items`（分页）

## 6.8 内容治理

- `GET /api/admin/v1/moments`（分页）
- `POST /api/admin/v1/moments/{id}/delete`
- `GET /api/admin/v1/moment-comments`（分页）
- `POST /api/admin/v1/moment-comments/{id}/delete`
- `GET /api/admin/v1/diaries`（分页）
- `POST /api/admin/v1/diaries/{id}/delete`

## 6.9 通知与配置

- `GET /api/admin/v1/system-notices`（分页）
- `POST /api/admin/v1/system-notices/send`
  - 请求：`{ "receiverUserIds": ["u1","u2"], "title": "系统通知", "content": "..." }`
- `GET /api/admin/v1/system-configs`（分页）
- `POST /api/admin/v1/system-configs`
- `PUT /api/admin/v1/system-configs/{id}`
- `POST /api/admin/v1/system-configs/{id}/enable`
- `POST /api/admin/v1/system-configs/{id}/disable`

## 6.10 反馈工单

- `GET /api/admin/v1/feedbacks`（分页）
- `GET /api/admin/v1/feedbacks/{id}`
- `POST /api/admin/v1/feedbacks/{id}/process`
  - 请求：`{ "status": "processing|resolved|closed", "reply": "处理说明" }`

## 6.11 运营看板

- `GET /api/admin/v1/dashboard/overview`
- `GET /api/admin/v1/dashboard/trends`
- `GET /api/admin/v1/dashboard/todos`

---

## 7. 后端 Java 开发文档（配套）

## 7.1 分层规范

- Controller：参数校验、鉴权注解、返回统一结构。
- Service：业务逻辑、事务边界、状态流转校验。
- Repository/Mapper：SQL 访问与分页查询。
- Domain/DTO/VO：
  - DTO：入参
  - VO：出参
  - Entity：表映射

## 7.2 Java 接口实现硬性要求

- 所有接口使用统一响应体（`code/message/data/traceId`）。
- 所有列表接口支持分页与通用筛选。
- 所有状态变更接口必须校验“状态机合法性”。
- 所有高风险操作必须写入 `admin_operation_logs`（需新增表）。
- 所有写操作默认幂等处理（防重复提交）。

## 7.3 建议新增表（管理后台专用）

### `admin_users`
- 字段：`id`、`username`、`password_hash`、`name`、`status`、`created_at`、`updated_at`

### `admin_roles`
- 字段：`id`、`role_key`、`role_name`、`status`

### `admin_user_roles`
- 字段：`id`、`admin_user_id`、`role_id`

### `admin_operation_logs`
- 字段：`id`、`admin_user_id`、`module`、`action`、`target_type`、`target_id`、`request_json`、`response_json`、`result`、`created_at`

### `admin_login_logs`
- 字段：`id`、`admin_user_id`、`ip`、`user_agent`、`result`、`created_at`

## 7.4 关键业务规则（后端必须实现）

- 用户封禁时可设置 `block_end_at`，到期自动恢复或手工恢复。
- 兑换码作废后不可被兑换；已兑换码不可恢复为未使用。
- 核销操作必须检查道具状态是否 `usable`，核销后改为 `used`。
- 资产调整必须产生日志并写入对应流水表。
- 配置中心修改需支持启停状态，且保留变更记录。

## 7.5 性能与数据一致性

- 分页查询必须走索引字段（如 `status`、`created_at`、`user_id`）。
- 资产相关写操作使用事务与乐观锁字段（如 `version`）。
- 批量生成兑换码需保证 `code` 唯一性与失败重试。

## 7.6 安全要求

- 管理端登录密码仅存储 hash，不存储明文。
- 敏感接口记录审计日志。
- 重要写接口要求权限点校验。
- 导出接口按角色做数据脱敏。

---

## 8. 联调与验收清单

## 8.1 前后端联调顺序

1. 认证与会话
2. 用户中心
3. 任务中心
4. 商城与兑换码
5. 交易流水
6. 内容治理
7. 通知与配置
8. 反馈与看板

## 8.2 验收标准

- 接口验收：路径、入参、返回结构与本文档一致。
- 功能验收：菜单对应操作均可执行。
- 权限验收：不同角色权限差异生效。
- 审计验收：高风险操作可追溯到人和时间。
- 数据验收：前端显示与数据库数据一致。

---

## 9. AI 执行约束（必须遵守）

- 只以 `sql.sql` 和本文件为依据，不假设隐藏接口。
- 若遇到歧义，以“可运营、可审计、安全优先”原则决策。
- 新增字段/表必须在文档和迁移脚本中同步说明。
- 任何偏离本文档的 API 设计，必须先更新文档再开发。
