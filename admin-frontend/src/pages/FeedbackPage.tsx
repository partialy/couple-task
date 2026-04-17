import { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import PageScaffold from "./PageScaffold";
import { adminApi } from "@/api/adminApi";

export default function FeedbackPage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    adminApi.feedbacks().then((d) => setRows(d.list || []));
  }, []);

  return (
    <PageScaffold title="反馈工单">
      <DataTable
        columns={[
          { key: "id", title: "ID" },
          { key: "userId", title: "用户" },
          { key: "content", title: "反馈内容" },
          { key: "status", title: "状态" },
          { key: "reply", title: "回复" },
          { key: "createdAt", title: "创建时间" },
        ]}
        rows={rows}
      />
    </PageScaffold>
  );
}
