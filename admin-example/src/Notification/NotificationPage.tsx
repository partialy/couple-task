import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Send } from "lucide-react";
import { request } from "@/src/utils/request";
import { toast } from "sonner";

interface Notice {
  id: string;
  title: string;
  content: string;
  receiver_user_ids: string;
  sender_id: string;
  created_at: string;
}

export default function NotificationPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    receiverUserIds: ""
  });

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const data = await request<{ list: Notice[], total: number }>(`/system-notices?page=${page}&pageSize=20`);
      setNotices(data.list);
      setTotal(data.total);
    } catch (error: any) {
      toast.error("获取通知列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [page]);

  const handleSendNotice = async () => {
    if (!newNotice.title || !newNotice.content) {
      toast.error("请填写完整信息");
      return;
    }
    try {
      const receiverIds = newNotice.receiverUserIds ? newNotice.receiverUserIds.split(',').map(id => id.trim()) : [];
      await request("/system-notices/send", {
        method: "POST",
        body: JSON.stringify({
          title: newNotice.title,
          content: newNotice.content,
          receiverUserIds: receiverIds
        })
      });
      toast.success("发送通知成功");
      setIsSendModalOpen(false);
      setNewNotice({ title: "", content: "", receiverUserIds: "" });
      fetchNotices();
    } catch (error: any) {
      toast.error(error.message || "发送失败");
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
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-main)]">通知中心</h2>
        <Button className="btn-primary" onClick={() => setIsSendModalOpen(true)}>
          <Send className="w-4 h-4 mr-2" />
          发送通知
        </Button>
      </div>

      <Card className="glass-panel border-0 rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="搜索通知标题..." className="pl-8 bg-white/50" />
              </div>
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
                  <TableHead>内容</TableHead>
                  <TableHead>接收人</TableHead>
                  <TableHead>发送人ID</TableHead>
                  <TableHead>发送时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">加载中...</TableCell>
                  </TableRow>
                ) : notices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  notices.map((notice) => (
                    <TableRow key={notice.id}>
                      <TableCell className="font-mono text-xs">{notice.id.substring(0, 8)}...</TableCell>
                      <TableCell className="font-medium">{notice.title}</TableCell>
                      <TableCell className="max-w-[300px] truncate" title={notice.content}>{notice.content}</TableCell>
                      <TableCell>
                        {notice.receiver_user_ids === '[]' ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">全体用户</Badge>
                        ) : (
                          <Badge variant="outline">指定用户</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{notice.sender_id}</TableCell>
                      <TableCell>{new Date(notice.created_at).toLocaleString()}</TableCell>
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
                disabled={notices.length < 20}
                onClick={() => setPage(p => p + 1)}
                className="bg-white/50"
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 发送通知弹窗 */}
      <Dialog open={isSendModalOpen} onOpenChange={setIsSendModalOpen}>
        <DialogContent className="sm:max-w-[425px] glass-panel border-0">
          <DialogHeader>
            <DialogTitle>发送系统通知</DialogTitle>
            <DialogDescription>
              向全体或指定用户发送系统通知。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                标题
              </Label>
              <Input
                id="title"
                value={newNotice.title}
                onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                className="col-span-3 input-glass"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="content" className="text-right">
                内容
              </Label>
              <Input
                id="content"
                value={newNotice.content}
                onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                className="col-span-3 input-glass"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="receiverUserIds" className="text-right">
                接收人
              </Label>
              <Input
                id="receiverUserIds"
                value={newNotice.receiverUserIds}
                onChange={(e) => setNewNotice({...newNotice, receiverUserIds: e.target.value})}
                className="col-span-3 input-glass"
                placeholder="留空则发送给全体用户，多个ID用逗号分隔"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendModalOpen(false)}>取消</Button>
            <Button className="btn-primary" onClick={handleSendNotice}>确认发送</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
