import { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import { adminApi } from "@/api/adminApi";
import PageScaffold from "./PageScaffold";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function UsersPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [keyword, setKeyword] = useState("");

  const load = () => adminApi.users({ keyword }).then((d: { list?: Record<string, unknown>[] }) => setRows(d.list || []));
  useEffect(() => {
    load();
  }, []);

  return (
    <PageScaffold
      title="用户管理"
      description="查询与处理用户账号状态"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder="搜索用户" className="input-glass h-9 w-56" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          <Button type="button" className="btn-primary h-9 px-4" onClick={() => load()}>
            查询
          </Button>
        </div>
      }
    >
      <DataTable
        columns={[
          { key: "id", title: "ID" },
          { key: "username", title: "用户名" },
          { key: "nickname", title: "昵称" },
          { key: "phone", title: "手机号" },
          { key: "email", title: "邮箱" },
          { key: "status", title: "状态" },
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
                onClick={() => adminApi.updateUserStatus(String(row.id), { status: "blocked", reason: "admin" }).then(load)}
              >
                封禁
              </Button>
            ),
          },
        ]}
        rows={rows}
      />
    </PageScaffold>
  );
}
