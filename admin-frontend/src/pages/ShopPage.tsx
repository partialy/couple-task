import { useEffect, useState } from "react";
import DataTable from "@/components/DataTable";
import PageScaffold from "./PageScaffold";
import { adminApi } from "@/api/adminApi";

export default function ShopPage() {
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [rewardCodes, setRewardCodes] = useState<any[]>([]);

  useEffect(() => {
    adminApi.shopItems().then((d) => setShopItems(d.list || []));
    adminApi.rewardCodes().then((d) => setRewardCodes(d.list || []));
  }, []);

  return (
    <PageScaffold title="商城与兑换码">
      <div className="chart-grid">
        <div>
          <h3>商品管理</h3>
          <DataTable
            columns={[
              { key: "id", title: "ID" },
              { key: "name", title: "名称" },
              { key: "itemType", title: "类型" },
              { key: "pointsCost", title: "积分成本" },
              { key: "stock", title: "库存" },
              { key: "status", title: "状态" },
            ]}
            rows={shopItems}
          />
        </div>
        <div>
          <h3>兑换码管理</h3>
          <DataTable
            columns={[
              { key: "code", title: "兑换码" },
              { key: "rewardType", title: "奖励类型" },
              { key: "rewardName", title: "奖励名称" },
              { key: "rewardCount", title: "数量" },
              { key: "status", title: "状态" },
              { key: "createdAt", title: "创建时间" },
            ]}
            rows={rewardCodes}
          />
        </div>
      </div>
    </PageScaffold>
  );
}
