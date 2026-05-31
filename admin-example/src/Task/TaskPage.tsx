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
import { Search, Eye, CheckSquare, XSquare, PowerOff } from "lucide-react";
import { request } from "@/src/utils/request";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  author_id: string;
  receiver_id: string | null;
  status: string;
  list_status: string;
  deadline: string | null;
  created_at: string;
}

export default function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [auditTask, setAuditTask] = useState<Task | null>(null);
  const [auditAction, setAuditAction] = useState<"approve" | "reject">("approve");
  const [auditReason, setAuditReason] = useState("");

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await request<{ list: Task[], total: number }>(`/tasks?page=${page}&pageSize=20`);
      setTasks(data.list);
      setTotal(data.total);
    } catch (error: any) {
      toast.error("获取任务列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page]);

  const handleAudit = async () => {
    if (!auditTask) return;
    if (auditAction === "reject" && !auditReason) {
      toast.error("驳回必须填写原因");
      return;
    }
    try {
      await request(`/tasks/${auditTask.id}/audit`, {
        method: "POST",
        body: JSON.stringify({
          action: auditAction,
          reason: auditReason
        })
      });
      toast.success(`任务审核${auditAction === 'approve' ? '通过' : '驳回'}成功`);
      setAuditTask(null);
      fetchTasks();
    } catch (error: any) {
      toast.error(error.message || "审核操作失败");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="text-yellow-600 border-yellow-600">待接单</Badge>;
      case 'in_progress': return <Badge variant="outline" className="text-blue-600 border-blue-600">进行中</Badge>;
      case 'completed': return <Badge variant="outline" className="text-green-600 border-green-600">已完成</Badge>;
      case 'closed': return <Badge variant="outline" className="text-gray-600 border-gray-600">已关闭</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getListStatusBadge = (status: string) => {
    switch (status) {
      case 'published': return <Badge className="bg-green-500 hover:bg-green-600">已发布</Badge>;
      case 'unlisted': return <Badge variant="destructive">已下架</Badge>;
      case 'pending_audit': return <Badge variant="secondary">待审核</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
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
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-main)]">任务中心</h2>
      </div>

      <Card className="glass-panel border-0 rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="搜索任务标题..." className="pl-8 bg-white/50" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[120px] bg-white/50">
                  <SelectValue placeholder="任务状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待接单</SelectItem>
                  <SelectItem value="in_progress">进行中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[120px] bg-white/50">
                  <SelectValue placeholder="列表状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="pending_audit">待审核</SelectItem>
                  <SelectItem value="unlisted">已下架</SelectItem>
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
                  <TableHead>标题</TableHead>
                  <TableHead>发布人</TableHead>
                  <TableHead>接单人</TableHead>
                  <TableHead>任务状态</TableHead>
                  <TableHead>列表状态</TableHead>
                  <TableHead>发布时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">加载中...</TableCell>
                  </TableRow>
                ) : tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-mono text-xs">{task.id.substring(0, 8)}...</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={task.title}>{task.title}</TableCell>
                      <TableCell>{task.author_id.substring(0, 8)}</TableCell>
                      <TableCell>{task.receiver_id ? task.receiver_id.substring(0, 8) : '-'}</TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>{getListStatusBadge(task.list_status)}</TableCell>
                      <TableCell>{new Date(task.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" title="查看详情">
                            <Eye className="h-4 w-4 text-blue-500" />
                          </Button>
                          {task.list_status === 'pending_audit' && (
                            <Button variant="ghost" size="icon" title="审核" onClick={() => {
                              setAuditTask(task);
                              setAuditAction("approve");
                              setAuditReason("");
                            }}>
                              <CheckSquare className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          {task.list_status === 'published' && (
                            <Button variant="ghost" size="icon" title="下架">
                              <XSquare className="h-4 w-4 text-orange-500" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" title="强制关闭">
                            <PowerOff className="h-4 w-4 text-red-500" />
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
                disabled={tasks.length < 20}
                onClick={() => setPage(p => p + 1)}
                className="bg-white/50"
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 审核弹窗 */}
      <Dialog open={!!auditTask} onOpenChange={(open) => !open && setAuditTask(null)}>
        <DialogContent className="sm:max-w-[425px] glass-panel border-0">
          <DialogHeader>
            <DialogTitle>任务审核</DialogTitle>
            <DialogDescription>
              正在审核任务：{auditTask?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">审核结果</Label>
              <div className="col-span-3 flex gap-4">
                <Button 
                  type="button" 
                  variant={auditAction === 'approve' ? 'default' : 'outline'}
                  className={auditAction === 'approve' ? 'bg-green-500 hover:bg-green-600' : ''}
                  onClick={() => setAuditAction('approve')}
                >
                  通过
                </Button>
                <Button 
                  type="button" 
                  variant={auditAction === 'reject' ? 'destructive' : 'outline'}
                  onClick={() => setAuditAction('reject')}
                >
                  驳回
                </Button>
              </div>
            </div>
            {auditAction === 'reject' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="auditReason" className="text-right">
                  驳回原因
                </Label>
                <Input
                  id="auditReason"
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  className="col-span-3 input-glass"
                  placeholder="必填"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAuditTask(null)}>取消</Button>
            <Button className="btn-primary" onClick={handleAudit}>确认提交</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
