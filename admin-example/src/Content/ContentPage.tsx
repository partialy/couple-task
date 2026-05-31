import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Trash2 } from "lucide-react";
import { request } from "@/src/utils/request";
import { toast } from "sonner";

interface Moment {
  id: string;
  user_id: string;
  content: string;
  status: string;
  created_at: string;
}

export default function ContentPage() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchMoments = async () => {
    setLoading(true);
    try {
      const data = await request<{ list: Moment[], total: number }>(`/moments?page=${page}&pageSize=20`);
      setMoments(data.list);
      setTotal(data.total);
    } catch (error: any) {
      toast.error("获取内容列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoments();
  }, [page]);

  const handleDelete = async (id: string) => {
    try {
      await request(`/moments/${id}/delete`, {
        method: "POST"
      });
      toast.success("内容已删除");
      fetchMoments();
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
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-main)]">内容治理</h2>
      </div>

      <Card className="glass-panel border-0 rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="搜索内容或用户ID..." className="pl-8 bg-white/50" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[120px] bg-white/50">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">正常</SelectItem>
                  <SelectItem value="deleted">已删除</SelectItem>
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
                  <TableHead>内容</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>发布时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">加载中...</TableCell>
                  </TableRow>
                ) : moments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  moments.map((moment) => (
                    <TableRow key={moment.id}>
                      <TableCell className="font-mono text-xs">{moment.id.substring(0, 8)}...</TableCell>
                      <TableCell className="font-mono text-xs">{moment.user_id.substring(0, 8)}...</TableCell>
                      <TableCell className="max-w-[300px] truncate" title={moment.content}>{moment.content}</TableCell>
                      <TableCell>
                        <Badge variant={moment.status === 'active' ? 'default' : 'secondary'} className={moment.status === 'active' ? 'bg-green-500' : ''}>
                          {moment.status === 'active' ? '正常' : '已删除'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(moment.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {moment.status === 'active' && (
                            <Button variant="ghost" size="icon" title="删除" onClick={() => handleDelete(moment.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
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
                disabled={moments.length < 20}
                onClick={() => setPage(p => p + 1)}
                className="bg-white/50"
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
