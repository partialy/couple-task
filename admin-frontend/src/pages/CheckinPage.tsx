import { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import PageScaffold from "./PageScaffold";
import { adminApi } from "@/api/adminApi";

export default function CheckinPage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    adminApi.checkinPlans().then((d) => setRows(d.list || []));
  }, []);

  return (
    <PageScaffold title="签到与成就">
      <DataTable
        columns={[
          { key: "id", title: "ID" },
          { key: "name", title: "计划名称" },
          { key: "targetUserId", title: "目标用户" },
          { key: "cycleType", title: "周期" },
          { key: "status", title: "状态" },
          { key: "updatedAt", title: "更新时间" },
        ]}
        rows={rows}
      />
    </PageScaffold>
  );
}
