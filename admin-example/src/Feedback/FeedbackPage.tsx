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
import { Search, CheckCircle } from "lucide-react";
import { request } from "@/src/utils/request";
import { toast } from "sonner";

interface Feedback {
  id: string;
  user_id: string;
  content: string;
  status: string;
  reply: string | null;
  created_at: string;
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await request<{ list: Feedback[], total: number }>(`/feedbacks?page=${page}&pageSize=20`);
      setFeedbacks(data.list);
      setTotal(data.total);
    } catch (error: any) {
      toast.error("获取反馈列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [page]);

  const handleOpenProcessModal = (feedback: Feedback) => {
    setCurrentFeedback(feedback);
    setReplyContent(feedback.reply || "");
    setIsProcessModalOpen(true);
  };

  const handleProcess = async () => {
    if (!currentFeedback) return;
    try {
      await request(`/feedbacks/${currentFeedback.id}/process`, {
        method: "POST",
        body: JSON.stringify({
          status: "resolved",
          reply: replyContent
        })
      });
      toast.success("处理反馈成功");
      setIsProcessModalOpen(false);
      fetchFeedbacks();
    } catch (error: any) {
      toast.error(error.message || "处理失败");
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
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-main)]">反馈工单</h2>
      </div>

      <Card className="glass-panel border-0 rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="搜索反馈内容..." className="pl-8 bg-white/50" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[120px] bg-white/50">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待处理</SelectItem>
                  <SelectItem value="resolved">已处理</SelectItem>
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
                  <TableHead>用户ID</TableHead>
                  <TableHead>反馈内容</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>回复内容</TableHead>
                  <TableHead>提交时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">加载中...</TableCell>
                  </TableRow>
                ) : feedbacks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  feedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell className="font-mono text-xs">{feedback.id.substring(0, 8)}...</TableCell>
                      <TableCell className="font-mono text-xs">{feedback.user_id.substring(0, 8)}...</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={feedback.content}>{feedback.content}</TableCell>
                      <TableCell>
                        <Badge variant={feedback.status === 'resolved' ? 'default' : 'secondary'} className={feedback.status === 'resolved' ? 'bg-green-500' : 'bg-yellow-500 text-white'}>
                          {feedback.status === 'resolved' ? '已处理' : '待处理'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={feedback.reply || ''}>{feedback.reply || '-'}</TableCell>
                      <TableCell>{new Date(feedback.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {feedback.status === 'pending' ? (
                            <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => handleOpenProcessModal(feedback)}>
                              处理
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" disabled>
                              已处理
                            </Button>
                          )}
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
                disabled={feedbacks.length < 20}
                onClick={() => setPage(p => p + 1)}
                className="bg-white/50"
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 处理反馈弹窗 */}
      <Dialog open={isProcessModalOpen} onOpenChange={setIsProcessModalOpen}>
        <DialogContent className="sm:max-w-[500px] glass-panel border-0">
          <DialogHeader>
            <DialogTitle>处理反馈工单</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">用户反馈内容：</Label>
              <div className="p-3 bg-white/50 rounded-md text-sm">
                {currentFeedback?.content}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reply">回复内容</Label>
              <Input
                id="reply"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="input-glass"
                placeholder="请输入回复内容..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProcessModalOpen(false)}>取消</Button>
            <Button className="btn-primary" onClick={handleProcess}>标记为已处理并回复</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
