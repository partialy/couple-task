import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { request } from "@/src/utils/request";
import { toast } from "sonner";

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

export default function TransactionPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [assetType, setAssetType] = useState<"points" | "cards">("points");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await request<{ list: Transaction[], total: number }>(`/transactions/${assetType}?page=${page}&pageSize=20`);
      setTransactions(data.list);
      setTotal(data.total);
    } catch (error: any) {
      toast.error("获取流水列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [assetType]);

  useEffect(() => {
    fetchTransactions();
  }, [page, assetType]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-main)]">交易流水</h2>
        <div className="flex gap-2">
          <Button 
            variant={assetType === 'points' ? 'default' : 'outline'} 
            className={assetType === 'points' ? 'btn-primary' : 'bg-white/50'}
            onClick={() => setAssetType('points')}
          >
            积分流水
          </Button>
          <Button 
            variant={assetType === 'cards' ? 'default' : 'outline'} 
            className={assetType === 'cards' ? 'btn-primary' : 'bg-white/50'}
            onClick={() => setAssetType('cards')}
          >
            万能卡流水
          </Button>
        </div>
      </div>

      <Card className="glass-panel border-0 rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="搜索用户ID..." className="pl-8 bg-white/50" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[120px] bg-white/50">
                  <SelectValue placeholder="交易类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="admin_adjust">后台调整</SelectItem>
                  <SelectItem value="shop_buy">商城购买</SelectItem>
                  <SelectItem value="task_reward">任务奖励</SelectItem>
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
                  <TableHead>流水号</TableHead>
                  <TableHead>用户ID</TableHead>
                  <TableHead>变动数量</TableHead>
                  <TableHead>交易类型</TableHead>
                  <TableHead>说明</TableHead>
                  <TableHead>发生时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">加载中...</TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                      <TableCell className="font-mono text-xs">{tx.user_id.substring(0, 8)}...</TableCell>
                      <TableCell className={`font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tx.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={tx.description}>{tx.description}</TableCell>
                      <TableCell>{new Date(tx.created_at).toLocaleString()}</TableCell>
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
                disabled={transactions.length < 20}
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
