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
import { Search, Plus, Ban } from "lucide-react";
import { request } from "@/src/utils/request";
import { toast } from "sonner";

interface RewardCode {
  id: string;
  code: string;
  reward_type: string;
  reward_name: string;
  reward_count: number;
  status: string;
  creator_id: string;
  redeemer_id: string | null;
  redeemed_at: string | null;
  created_at: string;
}

export default function RewardCodePage() {
  const [codes, setCodes] = useState<RewardCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generateParams, setGenerateParams] = useState({
    count: "10",
    rewardType: "points",
    rewardName: "积分",
    rewardCount: "100",
    description: ""
  });

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const data = await request<{ list: RewardCode[], total: number }>(`/reward-codes?page=${page}&pageSize=20`);
      setCodes(data.list);
      setTotal(data.total);
    } catch (error: any) {
      toast.error("获取兑换码列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, [page]);

  const handleGenerate = async () => {
    if (!generateParams.count || !generateParams.rewardCount) {
      toast.error("请填写完整信息");
      return;
    }
    try {
      await request("/reward-codes/batch-generate", {
        method: "POST",
        body: JSON.stringify({
          ...generateParams,
          count: parseInt(generateParams.count),
          rewardCount: parseInt(generateParams.rewardCount)
        })
      });
      toast.success("批量生成兑换码成功");
      setIsGenerateModalOpen(false);
      fetchCodes();
    } catch (error: any) {
      toast.error(error.message || "生成失败");
    }
  };

  const handleVoid = async (id: string) => {
    try {
      await request(`/reward-codes/${id}/void`, {
        method: "POST"
      });
      toast.success("兑换码已作废");
      fetchCodes();
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-500 hover:bg-green-600">未使用</Badge>;
      case 'used': return <Badge variant="secondary">已使用</Badge>;
      case 'void': return <Badge variant="destructive">已作废</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'points': return <Badge variant="outline" className="text-yellow-600 border-yellow-600">积分</Badge>;
      case 'card': return <Badge variant="outline" className="text-blue-600 border-blue-600">万能卡</Badge>;
      case 'prop': return <Badge variant="outline" className="text-purple-600 border-purple-600">道具</Badge>;
      case 'special': return <Badge variant="outline" className="text-orange-600 border-orange-600">特殊物品</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
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
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-main)]">兑换码中心</h2>
        <Button className="btn-primary" onClick={() => setIsGenerateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          批量生成
        </Button>
      </div>

      <Card className="glass-panel border-0 rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="搜索兑换码..." className="pl-8 bg-white/50" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[120px] bg-white/50">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">未使用</SelectItem>
                  <SelectItem value="used">已使用</SelectItem>
                  <SelectItem value="void">已作废</SelectItem>
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
                  <TableHead>兑换码</TableHead>
                  <TableHead>奖励类型</TableHead>
                  <TableHead>奖励内容</TableHead>
                  <TableHead>数量</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>兑换人</TableHead>
                  <TableHead>兑换时间</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">加载中...</TableCell>
                  </TableRow>
                ) : codes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  codes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono font-medium">{code.code}</TableCell>
                      <TableCell>{getTypeBadge(code.reward_type)}</TableCell>
                      <TableCell>{code.reward_name}</TableCell>
                      <TableCell>{code.reward_count}</TableCell>
                      <TableCell>{getStatusBadge(code.status)}</TableCell>
                      <TableCell>{code.redeemer_id ? code.redeemer_id.substring(0, 8) : '-'}</TableCell>
                      <TableCell>{code.redeemed_at ? new Date(code.redeemed_at).toLocaleString() : '-'}</TableCell>
                      <TableCell>{new Date(code.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {code.status === 'active' && (
                            <Button variant="ghost" size="icon" title="作废" onClick={() => handleVoid(code.id)}>
                              <Ban className="h-4 w-4 text-red-500" />
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
                disabled={codes.length < 20}
                onClick={() => setPage(p => p + 1)}
                className="bg-white/50"
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 批量生成弹窗 */}
      <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <DialogContent className="sm:max-w-[425px] glass-panel border-0">
          <DialogHeader>
            <DialogTitle>批量生成兑换码</DialogTitle>
            <DialogDescription>
              生成指定数量的兑换码用于活动投放。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="count" className="text-right">
                生成数量
              </Label>
              <Input
                id="count"
                type="number"
                value={generateParams.count}
                onChange={(e) => setGenerateParams({...generateParams, count: e.target.value})}
                className="col-span-3 input-glass"
                max="1000"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                奖励类型
              </Label>
              <div className="col-span-3">
                <Select value={generateParams.rewardType} onValueChange={(v) => setGenerateParams({...generateParams, rewardType: v})}>
                  <SelectTrigger className="input-glass">
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="points">积分</SelectItem>
                    <SelectItem value="card">万能卡</SelectItem>
                    <SelectItem value="prop">道具</SelectItem>
                    <SelectItem value="special">特殊物品</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rewardName" className="text-right">
                奖励名称
              </Label>
              <Input
                id="rewardName"
                value={generateParams.rewardName}
                onChange={(e) => setGenerateParams({...generateParams, rewardName: e.target.value})}
                className="col-span-3 input-glass"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rewardCount" className="text-right">
                奖励数量
              </Label>
              <Input
                id="rewardCount"
                type="number"
                value={generateParams.rewardCount}
                onChange={(e) => setGenerateParams({...generateParams, rewardCount: e.target.value})}
                className="col-span-3 input-glass"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                投放说明
              </Label>
              <Input
                id="description"
                value={generateParams.description}
                onChange={(e) => setGenerateParams({...generateParams, description: e.target.value})}
                className="col-span-3 input-glass"
                placeholder="选填"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateModalOpen(false)}>取消</Button>
            <Button className="btn-primary" onClick={handleGenerate}>确认生成</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
