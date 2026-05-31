import { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import PaginationBar from "@/components/PaginationBar";
import PageScaffold from "./PageScaffold";
import { adminApi } from "@/api/adminApi";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { confirmAction } from "@/utils/confirm";
import { usePageQuery } from "@/hooks/usePageQuery";

export default function CheckinPage() {
  const { rows, page, pageSize, total, loading, error, setPageSize, load } = usePageQuery<Record<string, unknown>>((params) =>
    adminApi.checkinPlans(params)
  );
  const [actionLoadingKey, setActionLoadingKey] = useState<string>("");

  useEffect(() => {
    load({ page: 1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load({ page: 1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  return (
    <PageScaffold
      title="签到与成就"
      actions={
        <Button type="button" variant="outline" onClick={() => load({ page })}>
          {loading ? "刷新中..." : "刷新"}
        </Button>
      }
    >
      {error && <p className="mb-3 text-sm text-destructive">加载失败：{error}</p>}
      <DataTable
        columns={[
          { key: "id", title: "ID" },
          { key: "name", title: "计划名称" },
          { key: "targetUserId", title: "目标用户" },
          { key: "cycleType", title: "周期" },
          { key: "status", title: "状态", render: (row) => <StatusBadge value={String(row.status ?? "")} /> },
          { key: "updatedAt", title: "更新时间" },
          {
            key: "action",
            title: "操作",
            render: (row) => (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={actionLoadingKey === `active-${String(row.id)}`}
                  onClick={async () => {
                    if (!(await confirmAction("确认启用该签到计划？"))) return;
                    try {
                      setActionLoadingKey(`active-${String(row.id)}`);
                      await adminApi.updateCheckinPlanStatus(String(row.id), { status: "active", reason: "admin" });
                      toast.success("已启用");
                      load({ page });
                    } finally {
                      setActionLoadingKey("");
                    }
                  }}
                >
                  {actionLoadingKey === `active-${String(row.id)}` ? "处理中..." : "启用"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={actionLoadingKey === `inactive-${String(row.id)}`}
                  onClick={async () => {
                    if (!(await confirmAction("确认停用该签到计划？"))) return;
                    try {
                      setActionLoadingKey(`inactive-${String(row.id)}`);
                      await adminApi.updateCheckinPlanStatus(String(row.id), { status: "inactive", reason: "admin" });
                      toast.success("已停用");
                      load({ page });
                    } finally {
                      setActionLoadingKey("");
                    }
                  }}
                >
                  {actionLoadingKey === `inactive-${String(row.id)}` ? "处理中..." : "停用"}
                </Button>
              </div>
            ),
          },
        ]}
        rows={rows}
      />
      <PaginationBar
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={(p) => load({ page: p })}
        onPageSizeChange={(s) => setPageSize(s)}
      />
    </PageScaffold>
  );
}
