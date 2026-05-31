import { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import PaginationBar from "@/components/PaginationBar";
import PageScaffold from "./PageScaffold";
import { adminApi } from "@/api/adminApi";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { confirmAction } from "@/utils/confirm";
import { usePageQuery } from "@/hooks/usePageQuery";

export default function ContentPage() {
  const {
    rows: moments,
    page: momentsPage,
    pageSize: momentsPageSize,
    total: momentsTotal,
    loading: momentsLoading,
    error: momentsError,
    setPageSize: setMomentsPageSize,
    load: loadMoments,
  } = usePageQuery<Record<string, unknown>>((params) => adminApi.moments(params));
  const {
    rows: diaries,
    page: diariesPage,
    pageSize: diariesPageSize,
    total: diariesTotal,
    loading: diariesLoading,
    error: diariesError,
    setPageSize: setDiariesPageSize,
    load: loadDiaries,
  } = usePageQuery<Record<string, unknown>>((params) => adminApi.diaries(params));
  const [actionLoadingKey, setActionLoadingKey] = useState<string>("");

  useEffect(() => {
    loadMoments({ page: 1 });
    loadDiaries({ page: 1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadMoments({ page: 1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [momentsPageSize]);

  useEffect(() => {
    loadDiaries({ page: 1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diariesPageSize]);

  return (
    <PageScaffold
      title="内容治理"
      actions={
        <Button type="button" variant="outline" onClick={() => { loadMoments({ page: momentsPage }); loadDiaries({ page: diariesPage }); }}>
          {momentsLoading || diariesLoading ? "刷新中..." : "刷新"}
        </Button>
      }
    >
      <div className="chart-grid">
        <div>
          <h3>动态治理</h3>
          {momentsError && <p className="mb-3 text-sm text-destructive">加载失败：{momentsError}</p>}
          <DataTable
            columns={[
              { key: "id", title: "ID" },
              { key: "authorUserId", title: "作者" },
              { key: "content", title: "内容" },
              { key: "createdAt", title: "时间" },
              {
                key: "action",
                title: "操作",
                render: (row) => (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={actionLoadingKey === `moment-${String(row.id)}`}
                    onClick={async () => {
                      if (!(await confirmAction("确认下线该动态？"))) return;
                      try {
                        setActionLoadingKey(`moment-${String(row.id)}`);
                        await adminApi.deleteMoment(String(row.id));
                        toast.success("动态已下线");
                        loadMoments({ page: momentsPage });
                      } finally {
                        setActionLoadingKey("");
                      }
                    }}
                  >
                    {actionLoadingKey === `moment-${String(row.id)}` ? "处理中..." : "下线"}
                  </Button>
                ),
              },
            ]}
            rows={moments}
          />
          <PaginationBar
            page={momentsPage}
            pageSize={momentsPageSize}
            total={momentsTotal}
            onPageChange={(p) => loadMoments({ page: p })}
            onPageSizeChange={(s) => setMomentsPageSize(s)}
          />
        </div>
        <div>
          <h3>日记治理</h3>
          {diariesError && <p className="mb-3 text-sm text-destructive">加载失败：{diariesError}</p>}
          <DataTable
            columns={[
              { key: "id", title: "ID" },
              { key: "userId", title: "作者" },
              { key: "mood", title: "心情" },
              { key: "content", title: "内容" },
              { key: "createdAt", title: "时间" },
              {
                key: "action",
                title: "操作",
                render: (row) => (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={actionLoadingKey === `diary-${String(row.id)}`}
                    onClick={async () => {
                      if (!(await confirmAction("确认下线该日记？"))) return;
                      try {
                        setActionLoadingKey(`diary-${String(row.id)}`);
                        await adminApi.deleteDiary(String(row.id));
                        toast.success("日记已下线");
                        loadDiaries({ page: diariesPage });
                      } finally {
                        setActionLoadingKey("");
                      }
                    }}
                  >
                    {actionLoadingKey === `diary-${String(row.id)}` ? "处理中..." : "下线"}
                  </Button>
                ),
              },
            ]}
            rows={diaries}
          />
          <PaginationBar
            page={diariesPage}
            pageSize={diariesPageSize}
            total={diariesTotal}
            onPageChange={(p) => loadDiaries({ page: p })}
            onPageSizeChange={(s) => setDiariesPageSize(s)}
          />
        </div>
      </div>
    </PageScaffold>
  );
}
