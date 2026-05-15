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

export default function FeedbackPage() {
  const { rows, page, pageSize, total, loading, error, setPageSize, load } = usePageQuery<Record<string, unknown>>((params) =>
    adminApi.feedbacks(params)
  );
  const [actionLoadingId, setActionLoadingId] = useState<string>("");

  useEffect(() => {
    load({ page: 1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load({ page: 1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  useEffect(() => {
    load({ page: 1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  return (
    <PageScaffold
      title="反馈工单"
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
          { key: "userId", title: "用户" },
          { key: "content", title: "反馈内容" },
          { key: "status", title: "状态", render: (row) => <StatusBadge value={String(row.status ?? "")} /> },
          { key: "reply", title: "回复" },
          { key: "createdAt", title: "创建时间" },
          {
            key: "action",
            title: "操作",
            render: (row) => (
              <Button
                type="button"
                size="sm"
                disabled={actionLoadingId === String(row.id)}
                onClick={async () => {
                  if (!(await confirmAction("确认将该反馈标记为已处理？"))) return;
                  try {
                    setActionLoadingId(String(row.id));
                    await adminApi.processFeedback(String(row.id), { status: "resolved", reply: "已处理，请查看结果" });
                    toast.success("已处理");
                    load({ page });
                  } finally {
                    setActionLoadingId("");
                  }
                }}
              >
                {actionLoadingId === String(row.id) ? "处理中..." : "标记已处理"}
              </Button>
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
