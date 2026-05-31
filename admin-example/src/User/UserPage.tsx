import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, MoreHorizontal, Ban, CheckCircle, Coins } from "lucide-react";
import { request } from "@/src/utils/request";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  nickname: string;
  status: string;
  points: number;
  cards: number;
  created_at: string;
}

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [adjustAssetUser, setAdjustAssetUser] = useState<User | null>(null);
  const [pointsDelta, setPointsDelta] = useState("0");
  const [cardsDelta, setCardsDelta] = useState("0");
  const [adjustReason, setAdjustReason] = useState("");

  const [statusUser, setStatusUser] = useState<User | null>(null);
  const [statusReason, setStatusReason] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await request<{ list: User[], total: number }>(`/users?page=${page}&pageSize=20`);
      setUsers(data.list);
      setTotal(data.total);
    } catch (error: any) {
      toast.error("获取用户列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleAdjustAssets = async () => {
    if (!adjustAssetUser) return;
    if (!adjustReason) {
      toast.error("请输入调整原因");
      return;
    }
    try {
      await request(`/users/${adjustAssetUser.id}/assets/adjust`, {
        method: "POST",
        body: JSON.stringify({
          pointsDelta: parseInt(pointsDelta) || 0,
          cardsDelta: parseInt(cardsDelta) || 0,
          reason: adjustReason
        })
      });
      toast.success("资产调整成功");
      setAdjustAssetUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "资产调整失败");
    }
  };

  const handleStatusChange = async () => {
    if (!statusUser) return;
    if (!statusReason) {
      toast.error("请输入原因");
      return;
    }
    const newStatus = statusUser.status === 'active' ? 'blocked' : 'active';
    try {
      await request(`/users/${statusUser.id}/status`, {
        method: "POST",
        body: JSON.stringify({
          status: newStatus,
          reason: statusReason
        })
      });
      toast.success(`用户已${newStatus === 'active' ? '解封' : '封禁'}`);
      setStatusUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-main)]">用户管理</h2>
      </div>

      <Card className="glass-panel border-0 rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="搜索用户名/昵称..." className="pl-8 bg-white/50" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[120px] bg-white/50">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">正常</SelectItem>
                  <SelectItem value="blocked">已封禁</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="btn-primary">查询</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-[var(--glass-border)] bg-white/30 overflow-hidden">
            <Table>
              <TableHeader className="bg-white/40">
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>用户名</TableHead>
                  <TableHead>昵称</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>积分</TableHead>
                  <TableHead>万能卡</TableHead>
                  <TableHead>注册时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">加载中...</TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono text-xs">{user.id.substring(0, 8)}...</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.nickname || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className={user.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}>
                          {user.status === 'active' ? '正常' : '封禁'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.points}</TableCell>
                      <TableCell>{user.cards}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" title="资产调整" onClick={() => {
                            setAdjustAssetUser(user);
                            setPointsDelta("0");
                            setCardsDelta("0");
                            setAdjustReason("");
                          }}>
                            <Coins className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button variant="ghost" size="icon" title={user.status === 'active' ? '封禁' : '解封'} onClick={() => {
                            setStatusUser(user);
                            setStatusReason("");
                          }}>
                            {user.status === 'active' ? (
                              <Ban className="h-4 w-4 text-red-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              共 {total} 条记录
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="bg-white/50"
              >
                上一页
              </Button>
              <span className="text-sm">第 {page} 页</span>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={users.length < 20}
                onClick={() => setPage(p => p + 1)}
                className="bg-white/50"
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 资产调整弹窗 */}
      <Dialog open={!!adjustAssetUser} onOpenChange={(open) => !open && setAdjustAssetUser(null)}>
        <DialogContent className="sm:max-w-[425px] glass-panel border-0">
          <DialogHeader>
            <DialogTitle>资产调整</DialogTitle>
            <DialogDescription>
              正在为用户 {adjustAssetUser?.username} 调整资产。正数表示增加，负数表示扣除。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="points" className="text-right">
                积分变动
              </Label>
              <Input
                id="points"
                type="number"
                value={pointsDelta}
                onChange={(e) => setPointsDelta(e.target.value)}
                className="col-span-3 input-glass"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cards" className="text-right">
                万能卡变动
              </Label>
              <Input
                id="cards"
                type="number"
                value={cardsDelta}
                onChange={(e) => setCardsDelta(e.target.value)}
                className="col-span-3 input-glass"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                调整原因
              </Label>
              <Input
                id="reason"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="col-span-3 input-glass"
                placeholder="必填"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustAssetUser(null)}>取消</Button>
            <Button className="btn-primary" onClick={handleAdjustAssets}>确认调整</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 状态变更弹窗 */}
      <Dialog open={!!statusUser} onOpenChange={(open) => !open && setStatusUser(null)}>
        <DialogContent className="sm:max-w-[425px] glass-panel border-0">
          <DialogHeader>
            <DialogTitle>{statusUser?.status === 'active' ? '封禁用户' : '解封用户'}</DialogTitle>
            <DialogDescription>
              确定要{statusUser?.status === 'active' ? '封禁' : '解封'}用户 {statusUser?.username} 吗？
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="statusReason" className="text-right">
                操作原因
              </Label>
              <Input
                id="statusReason"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="col-span-3 input-glass"
                placeholder="必填"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusUser(null)}>取消</Button>
            <Button 
              variant={statusUser?.status === 'active' ? 'destructive' : 'default'} 
              className={statusUser?.status !== 'active' ? 'btn-primary' : ''}
              onClick={handleStatusChange}
            >
              确认{statusUser?.status === 'active' ? '封禁' : '解封'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
