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
import { Search, Plus, Edit, Power, PowerOff } from "lucide-react";
import { request } from "@/src/utils/request";
import { toast } from "sonner";

interface ShopItem {
  id: string;
  name: string;
  type: string;
  price: number;
  stock: number;
  status: string;
  created_at: string;
}

export default function ShopPage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", type: "prop", price: "0", stock: "-1" });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await request<{ list: ShopItem[], total: number }>(`/shop-items?page=${page}&pageSize=20`);
      setItems(data.list);
      setTotal(data.total);
    } catch (error: any) {
      toast.error("获取商品列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page]);

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price) {
      toast.error("请填写完整信息");
      return;
    }
    try {
      await request("/shop-items", {
        method: "POST",
        body: JSON.stringify({
          ...newItem,
          price: parseInt(newItem.price),
          stock: parseInt(newItem.stock)
        })
      });
      toast.success("添加商品成功");
      setIsAddModalOpen(false);
      setNewItem({ name: "", type: "prop", price: "0", stock: "-1" });
      fetchItems();
    } catch (error: any) {
      toast.error(error.message || "添加失败");
    }
  };

  const handleToggleStatus = async (item: ShopItem) => {
    const newStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
      await request(`/shop-items/${item.id}/status`, {
        method: "POST",
        body: JSON.stringify({ status: newStatus })
      });
      toast.success(`商品已${newStatus === 'active' ? '上架' : '下架'}`);
      fetchItems();
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
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
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-main)]">商城与道具</h2>
        <Button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新增商品
        </Button>
      </div>

      <Card className="glass-panel border-0 rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="搜索商品名称..." className="pl-8 bg-white/50" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[120px] bg-white/50">
                  <SelectValue placeholder="商品类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="card">万能卡</SelectItem>
                  <SelectItem value="prop">道具</SelectItem>
                  <SelectItem value="special">特殊物品</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[120px] bg-white/50">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">已上架</SelectItem>
                  <SelectItem value="inactive">已下架</SelectItem>
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
                  <TableHead>名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>价格(积分)</TableHead>
                  <TableHead>库存</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">加载中...</TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.id.substring(0, 8)}...</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{getTypeBadge(item.type)}</TableCell>
                      <TableCell>{item.price}</TableCell>
                      <TableCell>{item.stock === -1 ? '不限量' : item.stock}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'active' ? 'default' : 'secondary'} className={item.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}>
                          {item.status === 'active' ? '已上架' : '已下架'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" title="编辑">
                            <Edit className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button variant="ghost" size="icon" title={item.status === 'active' ? '下架' : '上架'} onClick={() => handleToggleStatus(item)}>
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
                disabled={items.length < 20}
                onClick={() => setPage(p => p + 1)}
                className="bg-white/50"
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 新增商品弹窗 */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] glass-panel border-0">
          <DialogHeader>
            <DialogTitle>新增商品</DialogTitle>
            <DialogDescription>
              添加新的商城道具或特殊物品。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                商品名称
              </Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                className="col-span-3 input-glass"
                placeholder="例如：改名卡"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                商品类型
              </Label>
              <div className="col-span-3">
                <Select value={newItem.type} onValueChange={(v) => setNewItem({...newItem, type: v})}>
                  <SelectTrigger className="input-glass">
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">万能卡</SelectItem>
                    <SelectItem value="prop">道具</SelectItem>
                    <SelectItem value="special">特殊物品</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                价格(积分)
              </Label>
              <Input
                id="price"
                type="number"
                value={newItem.price}
                onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                className="col-span-3 input-glass"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                库存数量
              </Label>
              <Input
                id="stock"
                type="number"
                value={newItem.stock}
                onChange={(e) => setNewItem({...newItem, stock: e.target.value})}
                className="col-span-3 input-glass"
                placeholder="-1 表示不限量"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>取消</Button>
            <Button className="btn-primary" onClick={handleAddItem}>确认添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
