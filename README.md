

# Couple Task - 双人任务协作系统

## 技术栈

### 用户端
- **前端框架**: React + TypeScript + Vite
- **状态管理**: Zustand
- **路由**: React Router
- **UI 组件**: 自定义组件库
- **实时通信**: WebSocket

### 管理后台
- **前端框架**: React + TypeScript + Vite
- **UI 库**: 基于 Radix UI
- **HTTP 客户端**: Axios

### 后端服务
- **框架**: Spring Boot 3.x
- **数据库**: MySQL + MyBatis Plus
- **认证**: JWT
- **实时通信**: WebSocket
- **文件存储**: 七牛云对象存储

## 核心功能

### 任务系统
- 创建、发布、接受、完成任务
- 任务赏金（积分/道具/纪念币）
- 任务评论与互动
- 任务模板库

### 积分与商城
- 积分获取与消耗历史
- 积分商城物品兑换
- 纪念币兑换特殊奖励
- 用户道具背包管理

### 签到与成就
- 周期签到计划（每日/每周/月度）
- 签到日历与连续奖励
- 成就系统与称号

### 日记与纪念日
- 情侣日记撰写与互动
- 纪念日管理（生日、纪念日等）
- 心情记录

### 时光机
- 愿望清单与实现
- 相册动态
- 时刻收藏

### 实时通讯
- 实时聊天（WebSocket）
- 在线状态感知
- 系统通知推送

### 管理后台
- 用户管理
- 任务审核
- 商城与道具管理
- 内容治理
- 运营数据看板
- 反馈工单处理

## 快速开始

### 环境要求

- Node.js >= 18
- JDK 17+
- MySQL 8.0+
- Maven 3.8+

### 配置

1. 复制配置文件并修改数据库连接等配置：

```bash
# 用户端
cp .env.example .env

# 后端
cp server-java/src/main/resources/application.yml.example server-java/src/main/resources/application.yml
```

2. 执行数据库脚本初始化：

```bash
# 创建数据库
mysql -u root -