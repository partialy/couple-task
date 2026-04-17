import { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import PageScaffold from "./PageScaffold";
import { adminApi } from "@/api/adminApi";

export default function ContentPage() {
  const [moments, setMoments] = useState<any[]>([]);
  const [diaries, setDiaries] = useState<any[]>([]);

  useEffect(() => {
    adminApi.moments().then((d) => setMoments(d.list || []));
    adminApi.diaries().then((d) => setDiaries(d.list || []));
  }, []);

  return (
    <PageScaffold title="内容治理">
      <div className="chart-grid">
        <div>
          <h3>动态治理</h3>
          <DataTable columns={[{ key: "id", title: "ID" }, { key: "authorUserId", title: "作者" }, { key: "content", title: "内容" }, { key: "createdAt", title: "时间" }]} rows={moments} />
        </div>
        <div>
          <h3>日记治理</h3>
          <DataTable columns={[{ key: "id", title: "ID" }, { key: "userId", title: "作者" }, { key: "mood", title: "心情" }, { key: "content", title: "内容" }, { key: "createdAt", title: "时间" }]} rows={diaries} />
        </div>
      </div>
    </PageScaffold>
  );
}
