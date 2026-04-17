import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Users, CreditCard, CheckCircle, AlertTriangle, ShoppingBag, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/api/adminApi";
import PageScaffold from "./PageScaffold";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";
import { toast } from "sonner";

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<Record<string, unknown>>({});
  const [trends, setTrends] = useState<{ buckets?: string[]; series?: Record<string, number[]> }>({});
  const [distributions, setDistributions] = useState<Record<string, Record<string, number>>>({});
  const [todos, setTodos] = useState<{ title?: string; count?: number }[]>([]);
  const [alerts, setAlerts] = useState<{ title?: string; count?: number }[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [o, t, d, td, al] = await Promise.all([
        adminApi.dashboardOverview(),
        adminApi.dashboardTrends(),
        adminApi.dashboardDistributions(),
        adminApi.dashboardTodos(),
        adminApi.dashboardAlerts(),
      ]);
      setOverview(o as Record<string, unknown>);
      setTrends(t as typeof trends);
      setDistributions(d as Record<string, Record<string, number>>);
      setTodos((td as { title?: string; count?: number }[]) || []);
      setAlerts((al as { title?: string; count?: number }[]) || []);
    } catch {
      toast.error("获取仪表盘数据失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const trendRows = useMemo(
    () =>
      (trends.buckets || []).map((b: string, i: number) => ({
        date: b,
        newUsers: trends.series?.newUsers?.[i] ?? 0,
        activeUsers: trends.series?.activeUsers?.[i] ?? 0,
        taskPublished: trends.series?.taskPublished?.[i] ?? 0,
        taskCompleted: trends.series?.taskCompleted?.[i] ?? 0,
      })),
    [trends]
  );

  const statusRows = useMemo(
    () =>
      Object.entries(distributions.taskStatus || {}).map(([key, value]) => ({
        status: key,
        count: value as number,
      })),
    [distributions]
  );

  const kpiCards = [
    { title: "新增用户", value: overview.newUsers ?? 0, icon: Users, accent: "text-indigo-500" },
    { title: "活跃用户", value: overview.activeUsers ?? 0, icon: Users, accent: "text-emerald-500" },
    { title: "任务发布", value: overview.taskPublished ?? 0, icon: CheckCircle, accent: "text-amber-500" },
    { title: "任务完成", value: overview.taskCompleted ?? 0, icon: CheckCircle, accent: "text-green-500" },
    { title: "兑换码使用", value: overview.rewardCodesUsed ?? 0, icon: ShoppingBag, accent: "text-violet-500" },
    { title: "待处理反馈", value: overview.pendingFeedbacks ?? 0, icon: MessageSquare, accent: "text-rose-500" },
  ];

  return (
    <PageScaffold
      title="控制台"
      description="核心业务指标与趋势一览"
      actions={
        <Button variant="outline" size="sm" type="button" onClick={fetchData} disabled={loading} className="input-glass border-[var(--glass-border)]">
          {loading ? "刷新中…" : "刷新数据"}
        </Button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((item, i) => (
          <motion.div key={item.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass-panel border border-[var(--glass-border)] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-[var(--text-muted)]">{item.title}</CardTitle>
                <item.icon className={`h-4 w-4 ${item.accent}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--text-main)]">{String(item.value)}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="glass-panel border border-[var(--glass-border)]">
          <CardHeader>
            <CardTitle className="text-base">用户与任务趋势</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendRows}>
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="newUsers" stroke="#4F46E5" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="activeUsers" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="taskPublished" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="taskCompleted" stroke="#22C55E" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-panel border border-[var(--glass-border)]">
          <CardHeader>
            <CardTitle className="text-base">任务状态分布</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusRows}>
                <XAxis dataKey="status" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="glass-panel border border-[var(--glass-border)]">
          <CardHeader className="flex flex-row items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <CardTitle className="text-base">待办事项</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(todos || []).map((todo, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm text-[var(--text-muted)]">{todo.title}</span>
                <span className="font-semibold text-[var(--text-main)]">{todo.count ?? 0}</span>
              </div>
            ))}
            {(!todos || todos.length === 0) && <p className="text-sm text-muted-foreground">暂无待办</p>}
          </CardContent>
        </Card>

        <Card className="glass-panel border border-[var(--glass-border)]">
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-base">风险告警</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(alerts || []).map((alert, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm text-[var(--text-muted)]">{alert.title}</span>
                <span className="font-semibold text-destructive">{alert.count ?? 0}</span>
              </div>
            ))}
            {(!alerts || alerts.length === 0) && <p className="text-sm text-muted-foreground">暂无告警</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="glass-panel border border-[var(--glass-border)]">
          <CardHeader className="flex flex-row items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-500" />
            <CardTitle className="text-base">资产消耗（概览）</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-8">
            <div>
              <p className="text-xs text-[var(--text-muted)]">积分消耗</p>
              <p className="text-xl font-bold">{String(overview.pointCost ?? 0)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">万能卡消耗</p>
              <p className="text-xl font-bold">{String(overview.cardCost ?? 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageScaffold>
  );
}
