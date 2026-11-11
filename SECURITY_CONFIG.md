# 安全配置与拉取说明

为了避免 `git pull` 删除本地文件，`server-java/src/main/resources/application-dev.yml` 和 `application-prod.yml` 保持被 Git 跟踪，文件路径不变。敏感值已替换为 Spring 配置占位符。

运行前需设置：
- `YUTASK_DB_PASSWORD`：数据库密码
- `YUTASK_QINIU_ACCESS_KEY` / `YUTASK_QINIU_SECRET_KEY`：七牛云密钥（开发配置）
- `YUTASK_JWT_SECRET`：JWT 签名密钥
- `YUTASK_AES_KEY`：AES 密钥

拉取前请备份本地配置或将私密值转移到运行环境；`git pull` 不会删除这两个 YAML 文件，但会更新其内容。公开过的云服务密钥与 JWT/AES 密钥应及时轮换。本次没有重写 Git 历史。
