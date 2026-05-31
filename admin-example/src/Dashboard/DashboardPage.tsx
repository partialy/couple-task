import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Users, 
  CreditCard,
  FileText,
  ShoppingBag,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { request } from "@/src/utils/request";
import { toast } from "sonner";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<any>({});
  const [trends, setTrends] = useState<any>({ buckets: [], series: {} });
  const [distributions, setDistributions] = useState<any>({});
  const [rankings, setRankings] = useState<any>({});
  const [alerts, setAlerts] = useState<any[]>([]);
  const [todos, setTodos] = useState<any>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, trendsRes, distRes, rankRes, alertsRes, todosRes] = await Promise.all([
        request<any>("/dashboard/overview"),
        request<any>("/dashboard/trends"),
        request<any>("/dashboard/distributions"),
        request<any>("/dashboard/rankings"),
        request<any[]>("/dashboard/alerts"),
        request<any>("/dashboard/todos")
      ]);
      setOverview(overviewRes);
      setTrends(trendsRes);
      setDistributions(distRes);
      setRankings(rankRes);
      setAlerts(alertsRes);
      setTodos(todosRes);
    } catch (error) {
      toast.error("获取仪表盘数据失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Auto refresh every 60s
    return () => clearInterval(interval);
  }, [timeRange]);

  const trendData = trends.buckets.map((bucket: string, index: number) => ({
    name: bucket,
    newUsers: trends.series.newUsers?.[index] || 0,
    activeUsers: trends.series.activeUsers?.[index] || 0,
    taskPublished: trends.series.taskPublished?.[index] || 0,
    taskCompleted: trends.series.taskCompleted?.[index] || 0,
    pointCost: trends.series.pointCost?.[index] || 0,
    cardCost: trends.series.cardCost?.[index] || 0,
  }));

  const kpiCards = [
    { title: "新增用户", value: overview.newUsers || 0, icon: Users, color: "text-blue-500" },
    { title: "活跃用户", value: overview.activeUsers || 0, icon: Users, color: "text-green-500" },
    { title: "任务发布数", value: overview.taskPublished || 0, icon: FileText, color: "text-purple-500" },
    { title: "任务完成率", value: `${((overview.taskCompletionRate || 0) * 100).toFixed(1)}%`, icon: CheckCircle, color: "text-emerald-500" },
    { title: "兑换码使用率", value: `${((overview.rewardCodeUsageRate || 0) * 100).toFixed(1)}%`, icon: ShoppingBag, color: "text-orange-500" },
    { title: "积分消耗", value: overview.pointCost || 0, icon: CreditCard, color: "text-red-500" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto space-y-6 pb-10"
    >
      {/* 全局筛选栏 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-main)]">数据大盘</h2>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px] bg-white/50">
              <SelectValue placeholder="时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">今日</SelectItem>
              <SelectItem value="yesterday">昨日</SelectItem>
              <SelectItem value="7d">近 7 天</SelectItem>
              <SelectItem value="30d">近 30 天</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" className="bg-white/50" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新数据
        </Button>
      </div>

      {/* 核心 KPI 卡片区 */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {kpiCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <Card className="glass-panel border-0 rounded-2xl hover:-translate-y-1 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <CardTitle className="text-xs font-medium text-[var(--text-muted)]">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl font-bold text-[var(--text-main)]">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 风险与待办区 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-panel border-0 rounded-2xl border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              风险告警
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <div key={i} className="flex items-start justify-between text-sm bg-white/40 p-2 rounded-lg">
                  <div>
                    <span className="font-medium text-red-600">[{alert.type}]</span>
                    <span className="ml-2 text-[var(--text-main)]">{alert.target}: {alert.desc}</span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {new Date(alert.time).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {alerts.length === 0 && <div className="text-sm text-muted-foreground text-center py-2">暂无风险告警</div>}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-0 rounded-2xl border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-blue-600">
              <Clock className="w-4 h-4" />
              待办事项
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/40 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-white/60 transition-colors">
                <span className="text-sm text-[var(--text-main)]">待审核任务</span>
                <Badge variant="destructive">{todos.pendingTasks || 0}</Badge>
              </div>
              <div className="bg-white/40 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-white/60 transition-colors">
                <span className="text-sm text-[var(--text-main)]">待处理反馈</span>
                <Badge variant="destructive">{todos.pendingFeedbacks || 0}</Badge>
              </div>
              <div className="bg-white/40 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-white/60 transition-colors">
                <span className="text-sm text-[var(--text-main)]">待处理违规</span>
                <Badge variant="destructive">{todos.pendingContents || 0}</Badge>
              </div>
              <div className="bg-white/40 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-white/60 transition-colors">
                <span className="text-sm text-[var(--text-main)]">待确认配置</span>
                <Badge variant="secondary">{todos.pendingConfigs || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 趋势图区 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-panel border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-medium">用户增长趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
                  <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#64748b" />
                  <YAxis tick={{fontSize: 12}} stroke="#64748b" />
                  <RechartsTooltip contentStyle={{backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                  <Legend wrapperStyle={{fontSize: '12px'}} />
                  <Line type="monotone" dataKey="newUsers" name="新增用户" stroke="#4F46E5" strokeWidth={2} dot={{r: 3}} activeDot={{r: 5}} />
                  <Line type="monotone" dataKey="activeUsers" name="活跃用户" stroke="#10B981" strokeWidth={2} dot={{r: 3}} activeDot={{r: 5}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-medium">任务趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
                  <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#64748b" />
                  <YAxis tick={{fontSize: 12}} stroke="#64748b" />
                  <RechartsTooltip contentStyle={{backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                  <Legend wrapperStyle={{fontSize: '12px'}} />
                  <Line type="monotone" dataKey="taskPublished" name="发布数" stroke="#F59E0B" strokeWidth={2} dot={{r: 3}} activeDot={{r: 5}} />
                  <Line type="monotone" dataKey="taskCompleted" name="完成数" stroke="#8B5CF6" strokeWidth={2} dot={{r: 3}} activeDot={{r: 5}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 业务分布图区 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-panel border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-medium">任务状态分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributions.taskStatus || []} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#64748b" />
                  <YAxis tick={{fontSize: 12}} stroke="#64748b" />
                  <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.4)'}} contentStyle={{backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px', border: 'none'}} />
                  <Bar dataKey="value" name="数量" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-medium">奖励类型占比</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributions.rewardType || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {(distributions.rewardType || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px', border: 'none'}} />
                  <Legend wrapperStyle={{fontSize: '12px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-medium">反馈状态分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributions.feedbackStatus || []} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#64748b" />
                  <YAxis tick={{fontSize: 12}} stroke="#64748b" />
                  <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.4)'}} contentStyle={{backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px', border: 'none'}} />
                  <Bar dataKey="value" name="数量" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 排行榜区 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-panel border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-medium">高活跃用户 Top 5</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-[var(--glass-border)] bg-white/30 overflow-hidden">
              <Table>
                <TableHeader className="bg-white/40">
                  <TableRow>
                    <TableHead className="w-[50px]">排名</TableHead>
                    <TableHead>用户昵称</TableHead>
                    <TableHead className="text-right">活跃次数</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(rankings.activeUsers || []).map((user: any, index: number) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${index < 3 ? 'bg-orange-100 text-orange-600 font-bold' : 'bg-neutral-100 text-neutral-500'}`}>
                          {index + 1}
                        </span>
                      </TableCell>
                      <TableCell>{user.nickname}</TableCell>
                      <TableCell className="text-right font-mono">{user.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-medium">高发布任务用户 Top 5</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-[var(--glass-border)] bg-white/30 overflow-hidden">
              <Table>
                <TableHeader className="bg-white/40">
                  <TableRow>
                    <TableHead className="w-[50px]">排名</TableHead>
                    <TableHead>用户昵称</TableHead>
                    <TableHead className="text-right">发布数</TableHead>
                    <TableHead className="text-right">完成率</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(rankings.taskPublishers || []).map((user: any, index: number) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${index < 3 ? 'bg-blue-100 text-blue-600 font-bold' : 'bg-neutral-100 text-neutral-500'}`}>
                          {index + 1}
                        </span>
                      </TableCell>
                      <TableCell>{user.nickname}</TableCell>
                      <TableCell className="text-right font-mono">{user.value}</TableCell>
                      <TableCell className="text-right font-mono text-emerald-600">
                        {(user.rate * 100).toFixed(0)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
