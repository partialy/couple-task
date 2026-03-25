import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { userService } from "@/api/service/user";
import type { PartnerOverviewResponse } from "@/api/types";
import { message } from "@/utils/pure/message";
import PartnerProfileHero from "./PartnerProfileHero";
import PartnerProfileAssets from "./PartnerProfileAssets";
import PartnerProfileTaskStats from "./PartnerProfileTaskStats";
import PartnerProfileMoreStats from "./PartnerProfileMoreStats";
import PageHeader from "../ui/PageHeader";

export default function PartnerProfilePage({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<PartnerOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await userService.partnerOverview();
      if (cancelled) return;
      if (res.success && res.data) {
        setData(res.data);
      } else {
        message.error(res.msg || "加载失败");
        setData(null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-900"
    >
      <PageHeader title="TA 的资料" onBack={onBack} />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {loading && (
          <div className="flex flex-col items-center justify-center px-6 py-24">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-pink-500 dark:border-slate-600 dark:border-t-pink-400" />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">加载中…</p>
          </div>
        )}

        {!loading && data && (
          <>
            <PartnerProfileHero profile={data.profile} />
            <PartnerProfileAssets points={data.points} cards={data.cards} />
            <PartnerProfileTaskStats
              published={data.tasksPublished}
              receivedCompleted={data.tasksReceivedCompleted}
              receivedOngoing={data.tasksReceivedOngoing}
              receivedPending={data.tasksReceivedPending}
            />
            <PartnerProfileMoreStats
              usableItemCount={data.usableItemCount}
              specialRewardsPublished={data.specialRewardsPublished}
            />
          </>
        )}

        {!loading && !data && (
          <div className="px-6 py-16 text-center">
            <p className="text-slate-600 dark:text-slate-400">暂无绑定对象或数据无法加载</p>
            <button
              type="button"
              onClick={onBack}
              className="mt-6 rounded-full bg-linear-to-r from-cyan-500 to-blue-500 px-8 py-2.5 text-sm font-bold text-white shadow-lg"
            >
              返回
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
