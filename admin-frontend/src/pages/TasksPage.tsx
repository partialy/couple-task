import { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import { adminApi } from "@/api/adminApi";
import PageScaffold from "./PageScaffold";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TasksPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");

  const load = () => adminApi.tasks({ keyword, status }).then((d: { list?: Record<string, unknown>[] }) => setRows(d.list || []));
  useEffect(() => {
    load();
  }, []);

  return (
    <PageScaffold
      title="任务中心"
      description="任务列表与状态干预"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder="关键词" className="input-glass h-9 w-48" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
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
          <Button type="button" className="btn-primary h-9 px-4" onClick={() => load()}>
            查询
          </Button>
        </div>
      }
    >
      <DataTable
        columns={[
          { key: "id", title: "ID" },
          { key: "title", title: "标题" },
          { key: "authorId", title: "发布者" },
          { key: "receiverId", title: "接收者" },
          { key: "status", title: "状态" },
          { key: "listStatus", title: "上架状态" },
          {
            key: "action",
            title: "操作",
            render: (row) => (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => adminApi.updateTaskStatus(String(row.id), { status: "cancelled", reason: "admin" }).then(load)}
              >
                关闭
              </Button>
            ),
          },
        ]}
        rows={rows}
      />
    </PageScaffold>
  );
}
