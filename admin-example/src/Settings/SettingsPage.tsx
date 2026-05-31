import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Power, PowerOff } from "lucide-react";
import { request } from "@/src/utils/request";
import { toast } from "sonner";

interface SystemConfig {
  id: string;
  config_key: string;
  config_value: string;
  description: string;
  status: string;
  created_at: string;
}

export default function SettingsPage() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newConfig, setNewConfig] = useState({
    configKey: "",
    configValue: "",
    description: ""
  });

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const data = await request<{ list: SystemConfig[], total: number }>(`/system-configs?page=${page}&pageSize=20`);
      setConfigs(data.list);
      setTotal(data.total);
    } catch (error: any) {
      toast.error("获取配置列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [page]);

  const handleAddConfig = async () => {
    if (!newConfig.configKey || !newConfig.configValue) {
      toast.error("请填写完整信息");
      return;
    }
    try {
      await request("/system-configs", {
        method: "POST",
        body: JSON.stringify(newConfig)
      });
      toast.success("添加配置成功");
      setIsAddModalOpen(false);
      setNewConfig({ configKey: "", configValue: "", description: "" });
      fetchConfigs();
    } catch (error: any) {
      toast.error(error.message || "添加失败");
    }
  };

  const handleToggleStatus = async (config: SystemConfig) => {
    const action = config.status === 'active' ? 'disable' : 'enable';
    try {
      await request(`/system-configs/${config.id}/${action}`, {
        method: "POST"
      });
      toast.success(`配置已${action === 'enable' ? '启用' : '停用'}`);
      fetchConfigs();
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
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-main)]">系统配置</h2>
        <Button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新增配置
        </Button>
      </div>

      <Card className="glass-panel border-0 rounded-2xl">
        <CardContent className="pt-6">
          <div className="rounded-md border border-[var(--glass-border)] bg-white/30 overflow-hidden">
            <Table>
              <TableHeader className="bg-white/40">
                <TableRow>
                  <TableHead>配置键名</TableHead>
                  <TableHead>配置值</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">加载中...</TableCell>
                  </TableRow>
                ) : configs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  configs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-mono font-medium">{config.config_key}</TableCell>
                      <TableCell className="font-mono">{config.config_value}</TableCell>
                      <TableCell>{config.description}</TableCell>
                      <TableCell>
                        <Badge variant={config.status === 'active' ? 'default' : 'secondary'} className={config.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}>
                          {config.status === 'active' ? '已启用' : '已停用'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(config.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" title={config.status === 'active' ? '停用' : '启用'} onClick={() => handleToggleStatus(config)}>
                            {config.status === 'active' ? (
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
                disabled={configs.length < 20}
                onClick={() => setPage(p => p + 1)}
                className="bg-white/50"
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 新增配置弹窗 */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] glass-panel border-0">
          <DialogHeader>
            <DialogTitle>新增系统配置</DialogTitle>
            <DialogDescription>
              添加新的系统级配置项。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="configKey" className="text-right">
                配置键名
              </Label>
              <Input
                id="configKey"
                value={newConfig.configKey}
                onChange={(e) => setNewConfig({...newConfig, configKey: e.target.value})}
                className="col-span-3 input-glass font-mono"
                placeholder="例如：maintenance_mode"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="configValue" className="text-right">
                配置值
              </Label>
              <Input
                id="configValue"
                value={newConfig.configValue}
                onChange={(e) => setNewConfig({...newConfig, configValue: e.target.value})}
                className="col-span-3 input-glass font-mono"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                描述说明
              </Label>
              <Input
                id="description"
                value={newConfig.description}
                onChange={(e) => setNewConfig({...newConfig, description: e.target.value})}
                className="col-span-3 input-glass"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>取消</Button>
            <Button className="btn-primary" onClick={handleAddConfig}>确认添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
