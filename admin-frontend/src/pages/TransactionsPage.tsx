import { useEffect } from "react";
import DataTable from "@/components/DataTable";
import PaginationBar from "@/components/PaginationBar";
import PageScaffold from "./PageScaffold";
import { adminApi } from "@/api/adminApi";
import { Button } from "@/components/ui/button";
import { usePageQuery } from "@/hooks/usePageQuery";

export default function TransactionsPage() {
  const {
    rows: points,
    page: pointsPage,
    pageSize: pointsPageSize,
    total: pointsTotal,
    loading: pointsLoading,
    error: pointsError,
    setPageSize: setPointsPageSize,
    load: loadPoints,
  } = usePageQuery<Record<string, unknown>>((params) => adminApi.pointTransactions(params));
  const {
    rows: cards,
    page: cardsPage,
    pageSize: cardsPageSize,
    total: cardsTotal,
    loading: cardsLoading,
    error: cardsError,
    setPageSize: setCardsPageSize,
    load: loadCards,
  } = usePageQuery<Record<string, unknown>>((params) => adminApi.cardTransactions(params));
  const {
    rows: items,
    page: itemsPage,
    pageSize: itemsPageSize,
    total: itemsTotal,
    loading: itemsLoading,
    error: itemsError,
    setPageSize: setItemsPageSize,
    load: loadItems,
  } = usePageQuery<Record<string, unknown>>((params) => adminApi.itemTransactions(params));

  useEffect(() => {
    loadPoints({ page: 1 });
    loadCards({ page: 1 });
    loadItems({ page: 1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadPoints({ page: 1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsPageSize]);

  useEffect(() => {
    loadCards({ page: 1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardsPageSize]);

  useEffect(() => {
    loadItems({ page: 1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsPageSize]);

  return (
    <PageScaffold
      title="交易流水"
      actions={
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            loadPoints({ page: pointsPage });
            loadCards({ page: cardsPage });
            loadItems({ page: itemsPage });
          }}
        >
          {pointsLoading || cardsLoading || itemsLoading ? "刷新中..." : "刷新"}
        </Button>
      }
    >
      <h3>积分流水</h3>
      {pointsError && <p className="mb-3 text-sm text-destructive">加载失败：{pointsError}</p>}
      <DataTable columns={[{ key: "id", title: "ID" }, { key: "userId", title: "用户" }, { key: "amount", title: "变动" }, { key: "transactionType", title: "类型" }, { key: "createdAt", title: "时间" }]} rows={points} />
      <PaginationBar
        page={pointsPage}
        pageSize={pointsPageSize}
        total={pointsTotal}
        onPageChange={(p) => loadPoints({ page: p })}
        onPageSizeChange={(s) => setPointsPageSize(s)}
      />
      <h3>万能卡流水</h3>
      {cardsError && <p className="mb-3 text-sm text-destructive">加载失败：{cardsError}</p>}
      <DataTable columns={[{ key: "id", title: "ID" }, { key: "userId", title: "用户" }, { key: "amount", title: "变动" }, { key: "transactionType", title: "类型" }, { key: "createdAt", title: "时间" }]} rows={cards} />
      <PaginationBar
        page={cardsPage}
        pageSize={cardsPageSize}
        total={cardsTotal}
        onPageChange={(p) => loadCards({ page: p })}
        onPageSizeChange={(s) => setCardsPageSize(s)}
      />
      <h3>道具流水</h3>
      {itemsError && <p className="mb-3 text-sm text-destructive">加载失败：{itemsError}</p>}
      <DataTable columns={[{ key: "id", title: "ID" }, { key: "userId", title: "用户" }, { key: "quantity", title: "数量" }, { key: "transactionType", title: "类型" }, { key: "createdAt", title: "时间" }]} rows={items} />
      <PaginationBar
        page={itemsPage}
        pageSize={itemsPageSize}
        total={itemsTotal}
        onPageChange={(p) => loadItems({ page: p })}
        onPageSizeChange={(s) => setItemsPageSize(s)}
      />
    </PageScaffold>
  );
}
