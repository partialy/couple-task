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

export default function UsersPage() {
  const [keyword, setKeyword] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string>("");
  const { rows, page, pageSize, total, loading, error, setPageSize, load } = usePageQuery<Record<string, unknown>>((params) =>
    adminApi.users(params)
  );
  useEffect(() => {
    load({ page: 1, keyword });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load({ page: 1, keyword });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  return (
    <PageScaffold
      title="用户管理"
      description="查询与处理用户账号状态"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="搜索用户"
            className="input-glass h-9 w-56"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load({ page: 1, keyword })}
          />
          <Button type="button" className="btn-primary h-9 px-4" disabled={loading} onClick={() => load({ page: 1, keyword })}>
            {loading ? "查询中..." : "查询"}
          </Button>
        </div>
      }
    >
      {error && <p className="mb-3 text-sm text-destructive">加载失败：{error}</p>}
      <DataTable
        columns={[
          { key: "id", title: "ID" },
          { key: "username", title: "用户名" },
          { key: "nickname", title: "昵称" },
          { key: "phone", title: "手机号" },
          { key: "email", title: "邮箱" },
          { key: "status", title: "状态", render: (row) => <StatusBadge value={String(row.status ?? "")} /> },
          { key: "points", title: "积分" },
          { key: "cards", title: "万能卡" },
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
                  if (!(await confirmAction("确认封禁该用户？"))) return;
                  try {
                    setActionLoadingId(String(row.id));
                    await adminApi.updateUserStatus(String(row.id), { status: "blocked", reason: "admin" });
                    toast.success("已封禁");
                    load({ keyword });
                  } finally {
                    setActionLoadingId("");
                  }
                }}
              >
                {actionLoadingId === String(row.id) ? "处理中..." : "封禁"}
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
        onPageChange={(p) => load({ page: p, keyword })}
        onPageSizeChange={(s) => {
          setPageSize(s);
        }}
      />
    </PageScaffold>
  );
}
