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

export default function ShopPage() {
  const {
    rows: shopItems,
    page: shopPage,
    pageSize: shopPageSize,
    total: shopTotal,
    loading: shopLoading,
    error: shopError,
    setPageSize: setShopPageSize,
    load: loadShop,
  } = usePageQuery<Record<string, unknown>>((params) => adminApi.shopItems(params));
  const {
    rows: rewardCodes,
    page: codePage,
    pageSize: codePageSize,
    total: codeTotal,
    loading: codeLoading,
    error: codeError,
    setPageSize: setCodePageSize,
    load: loadCodes,
  } = usePageQuery<Record<string, unknown>>((params) => adminApi.rewardCodes(params));
  const [actionLoadingKey, setActionLoadingKey] = useState("");

  useEffect(() => {
    loadShop({ page: 1 });
    loadCodes({ page: 1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadShop({ page: 1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopPageSize]);

  useEffect(() => {
    loadCodes({ page: 1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codePageSize]);

  return (
    <PageScaffold
      title="商城与兑换码"
      actions={
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            loadShop({ page: shopPage });
            loadCodes({ page: codePage });
          }}
        >
          {shopLoading || codeLoading ? "刷新中..." : "刷新"}
        </Button>
      }
    >
      <div className="chart-grid">
        <div>
          <h3>商品管理</h3>
          {shopError && <p className="mb-3 text-sm text-destructive">加载失败：{shopError}</p>}
          <DataTable
            columns={[
              { key: "id", title: "ID" },
              { key: "name", title: "名称" },
              { key: "itemType", title: "类型" },
              { key: "pointsCost", title: "积分成本" },
              { key: "stock", title: "库存" },
              { key: "status", title: "状态", render: (row) => <StatusBadge value={String(row.status ?? "")} /> },
            ]}
            rows={shopItems}
          />
          <PaginationBar
            page={shopPage}
            pageSize={shopPageSize}
            total={shopTotal}
            onPageChange={(p) => loadShop({ page: p })}
            onPageSizeChange={(s) => setShopPageSize(s)}
          />
        </div>
        <div>
          <h3>兑换码管理</h3>
          {codeError && <p className="mb-3 text-sm text-destructive">加载失败：{codeError}</p>}
          <DataTable
            columns={[
              { key: "code", title: "兑换码" },
              { key: "rewardType", title: "奖励类型" },
              { key: "rewardName", title: "奖励名称" },
              { key: "rewardCount", title: "数量" },
              { key: "status", title: "状态", render: (row) => <StatusBadge value={String(row.status ?? "")} /> },
              { key: "createdAt", title: "创建时间" },
              {
                key: "action",
                title: "操作",
                render: (row) => (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={actionLoadingKey === `void-${String(row.id)}`}
                      onClick={async () => {
                        if (!(await confirmAction("确认作废该兑换码？"))) return;
                        try {
                          setActionLoadingKey(`void-${String(row.id)}`);
                          await adminApi.voidRewardCode(String(row.id));
                          toast.success("已作废");
                          loadCodes({ page: codePage });
                        } finally {
                          setActionLoadingKey("");
                        }
                      }}
                    >
                      {actionLoadingKey === `void-${String(row.id)}` ? "处理中..." : "作废"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={actionLoadingKey === `restore-${String(row.id)}`}
                      onClick={async () => {
                        if (!(await confirmAction("确认恢复该兑换码？"))) return;
                        try {
                          setActionLoadingKey(`restore-${String(row.id)}`);
                          await adminApi.restoreRewardCode(String(row.id));
                          toast.success("已恢复");
                          loadCodes({ page: codePage });
                        } finally {
                          setActionLoadingKey("");
                        }
                      }}
                    >
                      {actionLoadingKey === `restore-${String(row.id)}` ? "处理中..." : "恢复"}
                    </Button>
                  </div>
                ),
              },
            ]}
            rows={rewardCodes}
          />
          <PaginationBar
            page={codePage}
            pageSize={codePageSize}
            total={codeTotal}
            onPageChange={(p) => loadCodes({ page: p })}
            onPageSizeChange={(s) => setCodePageSize(s)}
          />
        </div>
      </div>
    </PageScaffold>
  );
}
