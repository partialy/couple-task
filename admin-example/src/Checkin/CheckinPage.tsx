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
import { Search, Plus, Power, PowerOff } from "lucide-react";
import { request } from "@/src/utils/request";
import { toast } from "sonner";

interface Achievement {
  id: string;
  name: string;
  description: string;
  condition_type: string;
  condition_value: number;
  reward_points: number;
  status: string;
  created_at: string;
}

export default function CheckinPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    name: "",
    description: "",
    conditionType: "login",
    conditionValue: "1",
    rewardPoints: "100"
  });

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const data = await request<{ list: Achievement[], total: number }>(`/achievements?page=${page}&pageSize=20`);
      setAchievements(data.list);
      setTotal(data.total);
    } catch (error: any) {
      toast.error("获取成就列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [page]);

  const handleAddAchievement = async () => {
    if (!newAchievement.name || !newAchievement.description) {
      toast.error("请填写完整信息");
      return;
    }
    try {
      await request("/achievements", {
        method: "POST",
        body: JSON.stringify({
          ...newAchievement,
          conditionValue: parseInt(newAchievement.conditionValue),
          rewardPoints: parseInt(newAchievement.rewardPoints)
        })
      });
      toast.success("添加成就成功");
      setIsAddModalOpen(false);
      setNewAchievement({ name: "", description: "", conditionType: "login", conditionValue: "1", rewardPoints: "100" });
      fetchAchievements();
    } catch (error: any) {
      toast.error(error.message || "添加失败");
    }
  };

  const handleToggleStatus = async (achievement: Achievement) => {
    const newStatus = achievement.status === 'active' ? 'inactive' : 'active';
    try {
      await request(`/achievements/${achievement.id}/status`, {
        method: "POST",
        body: JSON.stringify({ status: newStatus })
      });
      toast.success(`成就已${newStatus === 'active' ? '启用' : '停用'}`);
      fetchAchievements();
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
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-main)]">签到与成就</h2>
        <Button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新增成就
        </Button>
      </div>

      <Card className="glass-panel border-0 rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="搜索成就名称..." className="pl-8 bg-white/50" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[120px] bg-white/50">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">已启用</SelectItem>
                  <SelectItem value="inactive">已停用</SelectItem>
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
                  <TableHead>成就名称</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>条件类型</TableHead>
                  <TableHead>条件值</TableHead>
                  <TableHead>奖励积分</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">加载中...</TableCell>
                  </TableRow>
                ) : achievements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  achievements.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.id.substring(0, 8)}...</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={item.description}>{item.description}</TableCell>
                      <TableCell>{item.condition_type}</TableCell>
                      <TableCell>{item.condition_value}</TableCell>
                      <TableCell className="text-yellow-600 font-medium">+{item.reward_points}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'active' ? 'default' : 'secondary'} className={item.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}>
                          {item.status === 'active' ? '已启用' : '已停用'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" title={item.status === 'active' ? '停用' : '启用'} onClick={() => handleToggleStatus(item)}>
                            {item.status === 'active' ? (
                              <PowerOff className="h-4 w-4 text-orange-500" />
                            ) : (
                              <Power className="h-4 w-4 text-green-500" />
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
                disabled={achievements.length < 20}
                onClick={() => setPage(p => p + 1)}
                className="bg-white/50"
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 新增成就弹窗 */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] glass-panel border-0">
          <DialogHeader>
            <DialogTitle>新增成就</DialogTitle>
            <DialogDescription>
              配置新的成就及其奖励。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                成就名称
              </Label>
              <Input
                id="name"
                value={newAchievement.name}
                onChange={(e) => setNewAchievement({...newAchievement, name: e.target.value})}
                className="col-span-3 input-glass"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                描述
              </Label>
              <Input
                id="description"
                value={newAchievement.description}
                onChange={(e) => setNewAchievement({...newAchievement, description: e.target.value})}
                className="col-span-3 input-glass"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                条件类型
              </Label>
              <div className="col-span-3">
                <Select value={newAchievement.conditionType} onValueChange={(v) => setNewAchievement({...newAchievement, conditionType: v})}>
                  <SelectTrigger className="input-glass">
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="login">累计登录天数</SelectItem>
                    <SelectItem value="task_completed">完成任务数</SelectItem>
                    <SelectItem value="task_published">发布任务数</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="conditionValue" className="text-right">
                条件值
              </Label>
              <Input
                id="conditionValue"
                type="number"
                value={newAchievement.conditionValue}
                onChange={(e) => setNewAchievement({...newAchievement, conditionValue: e.target.value})}
                className="col-span-3 input-glass"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rewardPoints" className="text-right">
                奖励积分
              </Label>
              <Input
                id="rewardPoints"
                type="number"
                value={newAchievement.rewardPoints}
                onChange={(e) => setNewAchievement({...newAchievement, rewardPoints: e.target.value})}
                className="col-span-3 input-glass"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>取消</Button>
            <Button className="btn-primary" onClick={handleAddAchievement}>确认添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
