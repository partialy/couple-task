import { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import PageScaffold from "./PageScaffold";
import { adminApi } from "@/api/adminApi";

export default function TransactionsPage() {
  const [points, setPoints] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    adminApi.pointTransactions().then((d) => setPoints(d.list || []));
    adminApi.cardTransactions().then((d) => setCards(d.list || []));
    adminApi.itemTransactions().then((d) => setItems(d.list || []));
  }, []);

  return (
    <PageScaffold title="交易流水">
      <h3>积分流水</h3>
      <DataTable columns={[{ key: "id", title: "ID" }, { key: "userId", title: "用户" }, { key: "amount", title: "变动" }, { key: "transactionType", title: "类型" }, { key: "createdAt", title: "时间" }]} rows={points} />
      <h3>万能卡流水</h3>
      <DataTable columns={[{ key: "id", title: "ID" }, { key: "userId", title: "用户" }, { key: "amount", title: "变动" }, { key: "transactionType", title: "类型" }, { key: "createdAt", title: "时间" }]} rows={cards} />
      <h3>道具流水</h3>
      <DataTable columns={[{ key: "id", title: "ID" }, { key: "userId", title: "用户" }, { key: "quantity", title: "数量" }, { key: "transactionType", title: "类型" }, { key: "createdAt", title: "时间" }]} rows={items} />
    </PageScaffold>
  );
}
