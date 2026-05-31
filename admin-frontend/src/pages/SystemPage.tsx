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

export default function SystemPage() {
  const { rows: configs, page, pageSize, total, loading, error, setPageSize, load } = usePageQuery<Record<string, unknown>>((params) =>
    adminApi.systemConfigs(params)
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
      title="系统配置"
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
          { key: "configKey", title: "配置键" },
          { key: "configValue", title: "配置值" },
          { key: "category", title: "分类" },
          { key: "isEnabled", title: "启用", render: (row) => <StatusBadge value={Number(row.isEnabled) === 1 ? "active" : "inactive"} /> },
          { key: "updatedAt", title: "更新时间" },
          {
            key: "action",
            title: "操作",
            render: (row) => (
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={actionLoadingKey === `enable-${String(row.id)}`}
                  onClick={async () => {
                    if (!(await confirmAction("确认启用该配置？"))) return;
                    try {
                      setActionLoadingKey(`enable-${String(row.id)}`);
                      await adminApi.enableSystemConfig(String(row.id));
                      toast.success("已启用");
                      load({ page });
                    } finally {
                      setActionLoadingKey("");
                    }
                  }}
                >
                  {actionLoadingKey === `enable-${String(row.id)}` ? "处理中..." : "启用"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={actionLoadingKey === `disable-${String(row.id)}`}
                  onClick={async () => {
                    if (!(await confirmAction("确认停用该配置？"))) return;
                    try {
                      setActionLoadingKey(`disable-${String(row.id)}`);
                      await adminApi.disableSystemConfig(String(row.id));
                      toast.success("已停用");
                      load({ page });
                    } finally {
                      setActionLoadingKey("");
                    }
                  }}
                >
                  {actionLoadingKey === `disable-${String(row.id)}` ? "处理中..." : "停用"}
                </Button>
              </div>
            ),
          },
        ]}
        rows={configs}
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
