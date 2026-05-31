import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";

const JWT_SECRET = "super-secret-key-for-dev";

// --- In-Memory Data Store ---
let admin_users = [
  { id: '1', username: 'admin', password_hash: '123456', name: 'Super Admin', status: 'active', created_at: new Date().toISOString() }
];

let users = [
  { id: 'u1', username: 'user1@example.com', nickname: '张三', status: 'active', points: 100, cards: 5, created_at: new Date().toISOString() },
  { id: 'u2', username: 'user2@example.com', nickname: '李四', status: 'active', points: 50, cards: 2, created_at: new Date().toISOString() },
  { id: 'u3', username: 'user3@example.com', nickname: '王五', status: 'blocked', points: 0, cards: 0, created_at: new Date().toISOString() },
];

let tasks = [
  { id: 't1', title: '帮我拿个快递', author_id: 'u1', receiver_id: null, status: 'pending', list_status: 'published', deadline: '2026-05-01', created_at: new Date().toISOString() },
  { id: 't2', title: '求借一本高数书', author_id: 'u2', receiver_id: 'u1', status: 'in_progress', list_status: 'published', deadline: '2026-05-05', created_at: new Date().toISOString() },
  { id: 't3', title: '代写代码', author_id: 'u3', receiver_id: null, status: 'pending', list_status: 'pending_audit', deadline: '2026-04-20', created_at: new Date().toISOString() },
];

let shop_items = [
  { id: 's1', name: '万能卡x1', type: 'card', price: 100, stock: -1, status: 'active', created_at: new Date().toISOString() },
  { id: 's2', name: '改名卡', type: 'prop', price: 500, stock: 100, status: 'active', created_at: new Date().toISOString() },
  { id: 's3', name: '限定头像框', type: 'special', price: 1000, stock: 50, status: 'inactive', created_at: new Date().toISOString() },
];

let reward_codes = [
  { id: 'r1', code: 'WELCOME2026', reward_type: 'points', reward_name: '新人积分', reward_count: 500, status: 'active', creator_id: '1', redeemer_id: null, redeemed_at: null, created_at: new Date().toISOString() },
  { id: 'r2', code: 'VIPCARD1', reward_type: 'card', reward_name: '万能卡', reward_count: 1, status: 'used', creator_id: '1', redeemer_id: 'u1', redeemed_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'r3', code: 'VOIDCODE', reward_type: 'prop', reward_name: '改名卡', reward_count: 1, status: 'void', creator_id: '1', redeemer_id: null, redeemed_at: null, created_at: new Date().toISOString() },
];

let checkin_records = [
  { id: 'cr1', user_id: 'u1', checkin_date: '2026-04-16', reward_points: 10, created_at: new Date().toISOString() },
];

let achievements = [
  { id: 'a1', name: '初出茅庐', description: '完成首次登录', condition_type: 'login', condition_value: 1, reward_points: 100, status: 'active', created_at: new Date().toISOString() },
  { id: 'a2', name: '助人为乐', description: '完成10次任务', condition_type: 'task_completed', condition_value: 10, reward_points: 500, status: 'active', created_at: new Date().toISOString() },
];

let point_transactions = [
  { id: 'pt1', user_id: 'u1', amount: 100, type: 'admin_adjust', description: '管理员手动增加', created_at: new Date().toISOString() },
  { id: 'pt2', user_id: 'u2', amount: -50, type: 'shop_buy', description: '购买道具消耗', created_at: new Date().toISOString() },
];

let card_transactions = [
  { id: 'ct1', user_id: 'u1', amount: 5, type: 'admin_adjust', description: '管理员手动增加', created_at: new Date().toISOString() },
];

let moments = [
  { id: 'm1', user_id: 'u1', content: '今天天气真好！', status: 'active', created_at: new Date().toISOString() },
  { id: 'm2', user_id: 'u2', content: '遇到一个bug，求助', status: 'active', created_at: new Date().toISOString() },
  { id: 'm3', user_id: 'u3', content: '垃圾游戏毁我青春', status: 'deleted', created_at: new Date().toISOString() },
];

let system_notices = [
  { id: 'sn1', title: '系统维护通知', content: '将于今晚24点进行停机维护。', receiver_user_ids: '[]', sender_id: '1', created_at: new Date().toISOString() }
];

let system_configs = [
  { id: 'c1', config_key: 'app_name', config_value: '现代管理系统', description: '系统名称', status: 'active', created_at: new Date().toISOString() },
  { id: 'c2', config_key: 'maintenance_mode', config_value: 'false', description: '维护模式开关', status: 'active', created_at: new Date().toISOString() },
];

let feedbacks = [
  { id: 'f1', user_id: 'u1', content: '充值未到账', status: 'pending', reply: null, created_at: new Date().toISOString() },
  { id: 'f2', user_id: 'u2', content: '建议增加暗黑模式', status: 'resolved', reply: '已收到建议，正在评估中。', created_at: new Date().toISOString() },
];

let admin_operation_logs: any[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Middleware to verify JWT
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ code: 40100, message: "未登录或 token 失效" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(401).json({ code: 40100, message: "未登录或 token 失效" });
      req.user = user;
      next();
    });
  };

  // Helper for standard response
  const sendResponse = (res: any, data: any = {}, code = 0, message = "ok") => {
    res.json({
      code,
      message,
      data,
      traceId: Math.random().toString(36).substring(7)
    });
  };

  // --- API Routes ---

  // 6.1 认证与管理员会话
  app.post("/api/admin/v1/auth/login", (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for username: ${username}`);
    try {
      const user = admin_users.find(u => u.username == username && u.password_hash == password);
      
      if (user) {
        console.log(`Login successful for user: ${user.username}`);
        const token = jwt.sign({ id: user.id, username: user.username, role: "SUPER_ADMIN" }, JWT_SECRET, { expiresIn: '24h' });
        sendResponse(res, {
          token,
          expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          adminInfo: { id: user.id, name: user.name, role: "SUPER_ADMIN" }
        });
      } else {
        console.log(`Login failed for username: ${username} (incorrect credentials)`);
        sendResponse(res, null, 40001, "用户名或密码错误");
      }
    } catch (error) {
      console.error("Login error:", error);
      sendResponse(res, null, 500, "服务器内部错误");
    }
  });

  app.post("/api/admin/v1/auth/logout", authenticateToken, (req, res) => {
    sendResponse(res);
  });

  app.get("/api/admin/v1/auth/me", authenticateToken, (req: any, res) => {
    sendResponse(res, req.user);
  });

  // 6.2 用户中心
  app.get("/api/admin/v1/users", authenticateToken, (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const offset = (page - 1) * pageSize;

    const list = users.slice(offset, offset + pageSize);
    const total = users.length;

    sendResponse(res, {
      list,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    });
  });

  app.post("/api/admin/v1/users/:id/status", authenticateToken, (req: any, res) => {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index].status = status;
      admin_operation_logs.push({
        id: admin_operation_logs.length + 1,
        admin_user_id: req.user.id,
        module: 'users',
        action: 'update_status',
        target_id: id,
        request_json: JSON.stringify({ status, reason }),
        created_at: new Date().toISOString()
      });
      sendResponse(res);
    } else {
      sendResponse(res, null, 404, "用户不存在");
    }
  });

  app.post("/api/admin/v1/users/:id/assets/adjust", authenticateToken, (req: any, res) => {
    const { id } = req.params;
    const { pointsDelta, cardsDelta, reason } = req.body;
    
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index].points += (pointsDelta || 0);
      users[index].cards += (cardsDelta || 0);
      admin_operation_logs.push({
        id: admin_operation_logs.length + 1,
        admin_user_id: req.user.id,
        module: 'users',
        action: 'adjust_assets',
        target_id: id,
        request_json: JSON.stringify({ pointsDelta, cardsDelta, reason }),
        created_at: new Date().toISOString()
      });
      sendResponse(res);
    } else {
      sendResponse(res, null, 404, "用户不存在");
    }
  });

  // 6.3 任务中心
  app.get("/api/admin/v1/tasks", authenticateToken, (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const offset = (page - 1) * pageSize;

    const list = tasks.slice(offset, offset + pageSize);
    const total = tasks.length;

    sendResponse(res, {
      list,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    });
  });

  app.post("/api/admin/v1/tasks/:id/audit", authenticateToken, (req: any, res) => {
    const { id } = req.params;
    const { action, reason } = req.body;
    
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index].list_status = action === 'approve' ? 'published' : 'unlisted';
      admin_operation_logs.push({
        id: admin_operation_logs.length + 1,
        admin_user_id: req.user.id,
        module: 'tasks',
        action: 'audit',
        target_id: id,
        request_json: JSON.stringify({ action, reason }),
        created_at: new Date().toISOString()
      });
      sendResponse(res);
    } else {
      sendResponse(res, null, 404, "任务不存在");
    }
  });

  // 6.5 商城与道具
  app.get("/api/admin/v1/shop-items", authenticateToken, (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const offset = (page - 1) * pageSize;

    const list = shop_items.slice(offset, offset + pageSize);
    const total = shop_items.length;

    sendResponse(res, {
      list,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    });
  });

  app.post("/api/admin/v1/shop-items", authenticateToken, (req: any, res) => {
    const { name, type, price, stock } = req.body;
    const id = Math.random().toString(36).substring(2, 15);
    
    shop_items.push({
      id, name, type, price, stock,
      status: 'active',
      created_at: new Date().toISOString()
    });
    
    admin_operation_logs.push({
      id: admin_operation_logs.length + 1,
      admin_user_id: req.user.id,
      module: 'shop_items',
      action: 'create',
      target_id: id,
      request_json: JSON.stringify({ name, type, price, stock }),
      created_at: new Date().toISOString()
    });
      
    sendResponse(res, { id });
  });

  app.post("/api/admin/v1/shop-items/:id/status", authenticateToken, (req: any, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const index = shop_items.findIndex(i => i.id === id);
    if (index !== -1) {
      shop_items[index].status = status;
      admin_operation_logs.push({
        id: admin_operation_logs.length + 1,
        admin_user_id: req.user.id,
        module: 'shop_items',
        action: 'update_status',
        target_id: id,
        request_json: JSON.stringify({ status }),
        created_at: new Date().toISOString()
      });
      sendResponse(res);
    } else {
      sendResponse(res, null, 404, "道具不存在");
    }
  });

  // 6.6 兑换码
  app.get("/api/admin/v1/reward-codes", authenticateToken, (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const offset = (page - 1) * pageSize;

    const list = reward_codes.slice(offset, offset + pageSize);
    const total = reward_codes.length;

    sendResponse(res, {
      list,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    });
  });

  app.post("/api/admin/v1/reward-codes/batch-generate", authenticateToken, (req: any, res) => {
    const { count, rewardType, rewardName, rewardCount, description } = req.body;
    
    for (let i = 0; i < count; i++) {
      const id = Math.random().toString(36).substring(2, 15);
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      reward_codes.push({
        id, code,
        reward_type: rewardType,
        reward_name: rewardName,
        reward_count: rewardCount,
        status: 'active',
        creator_id: req.user.id,
        redeemer_id: null,
        redeemed_at: null,
        created_at: new Date().toISOString()
      });
    }
    
    admin_operation_logs.push({
      id: admin_operation_logs.length + 1,
      admin_user_id: req.user.id,
      module: 'reward_codes',
      action: 'batch_generate',
      request_json: JSON.stringify({ count, rewardType, rewardName, rewardCount, description }),
      created_at: new Date().toISOString()
    });
      
    sendResponse(res);
  });

  app.post("/api/admin/v1/reward-codes/:id/void", authenticateToken, (req: any, res) => {
    const { id } = req.params;
    const index = reward_codes.findIndex(c => c.id === id);
    if (index !== -1) {
      reward_codes[index].status = 'void';
      admin_operation_logs.push({
        id: admin_operation_logs.length + 1,
        admin_user_id: req.user.id,
        module: 'reward_codes',
        action: 'void',
        target_id: id,
        created_at: new Date().toISOString()
      });
      sendResponse(res);
    } else {
      sendResponse(res, null, 404, "兑换码不存在");
    }
  });

  // 6.4 签到与成就
  app.get("/api/admin/v1/checkin-records", authenticateToken, (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const offset = (page - 1) * pageSize;

    const list = checkin_records.slice(offset, offset + pageSize);
    const total = checkin_records.length;

    sendResponse(res, {
      list,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    });
  });

  app.get("/api/admin/v1/achievements", authenticateToken, (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const offset = (page - 1) * pageSize;

    const list = achievements.slice(offset, offset + pageSize);
    const total = achievements.length;

    sendResponse(res, {
      list,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    });
  });

  app.post("/api/admin/v1/achievements", authenticateToken, (req: any, res) => {
    const { name, description, conditionType, conditionValue, rewardPoints } = req.body;
    const id = Math.random().toString(36).substring(2, 15);
    
    achievements.push({
      id, name, description,
      condition_type: conditionType,
      condition_value: conditionValue,
      reward_points: rewardPoints,
      status: 'active',
      created_at: new Date().toISOString()
    });
      
    sendResponse(res, { id });
  });

  app.post("/api/admin/v1/achievements/:id/status", authenticateToken, (req: any, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const index = achievements.findIndex(a => a.id === id);
    if (index !== -1) {
      achievements[index].status = status;
      sendResponse(res);
    } else {
      sendResponse(res, null, 404, "成就不存在");
    }
  });

  // 6.7 交易流水
  app.get("/api/admin/v1/transactions/points", authenticateToken, (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const offset = (page - 1) * pageSize;

    const list = point_transactions.slice(offset, offset + pageSize);
    const total = point_transactions.length;

    sendResponse(res, {
      list,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    });
  });

  app.get("/api/admin/v1/transactions/cards", authenticateToken, (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const offset = (page - 1) * pageSize;

    const list = card_transactions.slice(offset, offset + pageSize);
    const total = card_transactions.length;

    sendResponse(res, {
      list,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    });
  });

  // 6.8 内容治理
  app.get("/api/admin/v1/moments", authenticateToken, (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const offset = (page - 1) * pageSize;

    const list = moments.slice(offset, offset + pageSize);
    const total = moments.length;

    sendResponse(res, {
      list,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    });
  });

  app.post("/api/admin/v1/moments/:id/delete", authenticateToken, (req: any, res) => {
    const { id } = req.params;
    const index = moments.findIndex(m => m.id === id);
    if (index !== -1) {
      moments[index].status = 'deleted';
      admin_operation_logs.push({
        id: admin_operation_logs.length + 1,
        admin_user_id: req.user.id,
        module: 'moments',
        action: 'delete',
        target_id: id,
        created_at: new Date().toISOString()
      });
      sendResponse(res);
    } else {
      sendResponse(res, null, 404, "内容不存在");
    }
  });

  // 6.9 通知与配置
  app.get("/api/admin/v1/system-notices", authenticateToken, (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const offset = (page - 1) * pageSize;

    const list = system_notices.slice(offset, offset + pageSize);
    const total = system_notices.length;

    sendResponse(res, {
      list,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    });
  });

  app.post("/api/admin/v1/system-notices/send", authenticateToken, (req: any, res) => {
    const { receiverUserIds, title, content } = req.body;
    const id = Math.random().toString(36).substring(2, 15);
    
    system_notices.push({
      id, title, content,
      receiver_user_ids: JSON.stringify(receiverUserIds || []),
      sender_id: req.user.id,
      created_at: new Date().toISOString()
    });
      
    admin_operation_logs.push({
      id: admin_operation_logs.length + 1,
      admin_user_id: req.user.id,
      module: 'system_notices',
      action: 'send',
      target_id: id,
      request_json: JSON.stringify({ receiverUserIds, title, content }),
      created_at: new Date().toISOString()
    });
      
    sendResponse(res, { id });
  });

  app.get("/api/admin/v1/system-configs", authenticateToken, (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const offset = (page - 1) * pageSize;

    const list = system_configs.slice(offset, offset + pageSize);
    const total = system_configs.length;

    sendResponse(res, {
      list,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    });
  });

  app.post("/api/admin/v1/system-configs", authenticateToken, (req: any, res) => {
    const { configKey, configValue, description } = req.body;
    const id = Math.random().toString(36).substring(2, 15);
    
    system_configs.push({
      id,
      config_key: configKey,
      config_value: configValue,
      description,
      status: 'active',
      created_at: new Date().toISOString()
    });
      
    sendResponse(res, { id });
  });

  app.post("/api/admin/v1/system-configs/:id/enable", authenticateToken, (req: any, res) => {
    const { id } = req.params;
    const index = system_configs.findIndex(c => c.id === id);
    if (index !== -1) {
      system_configs[index].status = 'active';
      sendResponse(res);
    } else {
      sendResponse(res, null, 404, "配置不存在");
    }
  });

  app.post("/api/admin/v1/system-configs/:id/disable", authenticateToken, (req: any, res) => {
    const { id } = req.params;
    const index = system_configs.findIndex(c => c.id === id);
    if (index !== -1) {
      system_configs[index].status = 'inactive';
      sendResponse(res);
    } else {
      sendResponse(res, null, 404, "配置不存在");
    }
  });

  // 6.10 反馈工单
  app.get("/api/admin/v1/feedbacks", authenticateToken, (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const offset = (page - 1) * pageSize;

    const list = feedbacks.slice(offset, offset + pageSize);
    const total = feedbacks.length;

    sendResponse(res, {
      list,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    });
  });

  app.post("/api/admin/v1/feedbacks/:id/process", authenticateToken, (req: any, res) => {
    const { id } = req.params;
    const { status, reply } = req.body;
    
    const index = feedbacks.findIndex(f => f.id === id);
    if (index !== -1) {
      feedbacks[index].status = status;
      feedbacks[index].reply = reply;
      admin_operation_logs.push({
        id: admin_operation_logs.length + 1,
        admin_user_id: req.user.id,
        module: 'feedbacks',
        action: 'process',
        target_id: id,
        request_json: JSON.stringify({ status, reply }),
        created_at: new Date().toISOString()
      });
      sendResponse(res);
    } else {
      sendResponse(res, null, 404, "工单不存在");
    }
  });

  // 6.11 Dashboard
  app.get("/api/admin/v1/dashboard/overview", authenticateToken, (req, res) => {
    const newUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const taskPublished = tasks.length;
    const taskCompleted = tasks.filter(t => t.status === 'completed').length;
    const taskCompletionRate = taskPublished > 0 ? taskCompleted / taskPublished : 0;
    
    const rewardCodesUsed = reward_codes.filter(c => c.status === 'used').length;
    const totalRewardCodes = reward_codes.length;
    const rewardCodeUsageRate = totalRewardCodes > 0 ? rewardCodesUsed / totalRewardCodes : 0;
    
    const pointCost = point_transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const cardCost = card_transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const pendingFeedbacks = feedbacks.filter(f => f.status === 'pending').length;

    sendResponse(res, {
      newUsers,
      activeUsers,
      taskPublished,
      taskCompleted,
      taskCompletionRate,
      rewardCodesUsed,
      rewardCodeUsageRate,
      pointCost,
      cardCost,
      pendingFeedbacks
    });
  });

  app.get("/api/admin/v1/dashboard/trends", authenticateToken, (req, res) => {
    const buckets = [];
    const series = {
      newUsers: [],
      activeUsers: [],
      taskPublished: [],
      taskCompleted: [],
      pointCost: [],
      cardCost: []
    };
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      buckets.push(d.toISOString().split('T')[0]);
      
      (series.newUsers as number[]).push(Math.floor(Math.random() * 20) + 5);
      (series.activeUsers as number[]).push(Math.floor(Math.random() * 100) + 50);
      (series.taskPublished as number[]).push(Math.floor(Math.random() * 30) + 10);
      (series.taskCompleted as number[]).push(Math.floor(Math.random() * 20) + 5);
      (series.pointCost as number[]).push(Math.floor(Math.random() * 1000) + 100);
      (series.cardCost as number[]).push(Math.floor(Math.random() * 50) + 5);
    }

    sendResponse(res, { buckets, series });
  });

  app.get("/api/admin/v1/dashboard/distributions", authenticateToken, (req, res) => {
    sendResponse(res, {
      taskStatus: [
        { name: 'pending', value: 12 },
        { name: 'accepted', value: 8 },
        { name: 'completed', value: 25 },
        { name: 'cancelled', value: 3 }
      ],
      rewardCodeStatus: [
        { name: 'unused', value: 45 },
        { name: 'used', value: 120 },
        { name: 'voided', value: 5 }
      ],
      feedbackStatus: [
        { name: 'pending', value: 9 },
        { name: 'processing', value: 4 },
        { name: 'resolved', value: 32 },
        { name: 'closed', value: 15 }
      ],
      rewardType: [
        { name: 'points', value: 350 },
        { name: 'prop', value: 120 },
        { name: 'special', value: 30 }
      ],
      contentType: [
        { name: '动态', value: 150 },
        { name: '日记', value: 80 },
        { name: '评论', value: 320 }
      ]
    });
  });

  app.get("/api/admin/v1/dashboard/rankings", authenticateToken, (req, res) => {
    sendResponse(res, {
      activeUsers: [
        { id: 'u1', nickname: '张三', value: 156 },
        { id: 'u2', nickname: '李四', value: 142 },
        { id: 'u3', nickname: '王五', value: 98 },
        { id: 'u4', nickname: '赵六', value: 87 },
        { id: 'u5', nickname: '钱七', value: 65 }
      ],
      taskPublishers: [
        { id: 'u2', nickname: '李四', value: 45, rate: 0.8 },
        { id: 'u1', nickname: '张三', value: 32, rate: 0.9 },
        { id: 'u5', nickname: '钱七', value: 28, rate: 0.6 },
        { id: 'u4', nickname: '赵六', value: 15, rate: 1.0 },
        { id: 'u3', nickname: '王五', value: 12, rate: 0.5 }
      ],
      frequentRedeemers: [
        { id: 'u1', nickname: '张三', value: 25, verifyCount: 20 },
        { id: 'u3', nickname: '王五', value: 18, verifyCount: 18 },
        { id: 'u2', nickname: '李四', value: 15, verifyCount: 10 },
        { id: 'u4', nickname: '赵六', value: 8, verifyCount: 8 },
        { id: 'u5', nickname: '钱七', value: 5, verifyCount: 2 }
      ]
    });
  });

  app.get("/api/admin/v1/dashboard/alerts", authenticateToken, (req, res) => {
    sendResponse(res, [
      { id: 'a1', type: '高频兑换告警', time: new Date().toISOString(), target: '用户 u1', desc: '10分钟内兑换次数达到6次', status: 'pending' },
      { id: 'a2', type: '异常资产变动', time: new Date(Date.now() - 3600000).toISOString(), target: '用户 u3', desc: '单笔积分增加 5000', status: 'processing' },
      { id: 'a3', type: '违规内容激增', time: new Date(Date.now() - 86400000).toISOString(), target: '全局', desc: '今日违规处理量超过7日均值3倍', status: 'resolved' }
    ]);
  });

  app.get("/api/admin/v1/dashboard/todos", authenticateToken, (req, res) => {
    sendResponse(res, {
      pendingTasks: tasks.filter(t => t.list_status === 'pending_audit').length,
      pendingFeedbacks: feedbacks.filter(f => f.status === 'pending').length,
      pendingContents: moments.filter(m => m.status === 'active').length,
      pendingConfigs: system_configs.filter(c => c.status === 'active').length
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
