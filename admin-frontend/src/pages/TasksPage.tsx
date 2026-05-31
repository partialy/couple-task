import { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import PaginationBar from "@/components/PaginationBar";
import StatusBadge from "@/components/StatusBadge";
import { adminApi } from "@/api/adminApi";
import PageScaffold from "./PageScaffold";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { confirmAction } from "@/utils/confirm";
import { usePageQuery } from "@/hooks/usePageQuery";

export default function TasksPage() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string>("");
  const { rows, page, pageSize, total, loading, error, setPageSize, load } = usePageQuery<Record<string, unknown>>((params) =>
    adminApi.tasks({ ...params, status: params.status ?? status })
  );

  useEffect(() => {
    load({ page: 1, keyword, status });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load({ page: 1, keyword, status });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  return (
    <PageScaffold
      title="任务中心"
      description="任务列表与状态干预"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="关键词"
            className="input-glass h-9 w-48"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load({ page: 1, keyword, status })}
          />
          <select
            className="input-glass h-9 rounded-lg border border-input px-3 text-sm bg-white/50"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">全部状态</option>
            <option value="pending">pending</option>
            <option value="accepted">accepted</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
          <Button type="button" className="btn-primary h-9 px-4" disabled={loading} onClick={() => load({ page: 1, keyword, status })}>
            {loading ? "查询中..." : "查询"}
          </Button>
        </div>
      }
    >
      {error && <p className="mb-3 text-sm text-destructive">加载失败：{error}</p>}
      <DataTable
        columns={[
          { key: "id", title: "ID" },
          { key: "title", title: "标题" },
          { key: "authorId", title: "发布者" },
          { key: "receiverId", title: "接收者" },
          { key: "status", title: "状态", render: (row) => <StatusBadge value={String(row.status ?? "")} /> },
          { key: "listStatus", title: "上架状态", render: (row) => <StatusBadge value={String(row.listStatus ?? "")} /> },
          {
            key: "action",
            title: "操作",
            render: (row) => (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={actionLoadingId === String(row.id)}
                onClick={async () => {
                  if (!(await confirmAction("确认关闭该任务？"))) return;
                  try {
                    setActionLoadingId(String(row.id));
                    await adminApi.updateTaskStatus(String(row.id), { status: "cancelled", reason: "admin" });
                    toast.success("任务已关闭");
                    load({ keyword, status });
                  } finally {
                    setActionLoadingId("");
                  }
                }}
              >
                {actionLoadingId === String(row.id) ? "处理中..." : "关闭"}
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
        onPageChange={(p) => load({ page: p, keyword, status })}
        onPageSizeChange={(s) => {
          setPageSize(s);
        }}
      />
    </PageScaffold>
  );
}
