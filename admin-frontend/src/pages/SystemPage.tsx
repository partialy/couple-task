import { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import PageScaffold from "./PageScaffold";
import { adminApi } from "@/api/adminApi";

export default function SystemPage() {
  const [configs, setConfigs] = useState<any[]>([]);

  useEffect(() => {
    adminApi.systemConfigs().then((d) => setConfigs(d.list || []));
  }, []);

  return (
    <PageScaffold title="系统配置">
      <DataTable
        columns={[
          { key: "id", title: "ID" },
          { key: "configKey", title: "配置键" },
          { key: "configValue", title: "配置值" },
          { key: "category", title: "分类" },
          { key: "isEnabled", title: "启用" },
          { key: "updatedAt", title: "更新时间" },
        ]}
        rows={configs}
      />
    </PageScaffold>
  );
}
