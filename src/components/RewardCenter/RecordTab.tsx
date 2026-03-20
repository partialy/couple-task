import { useCallback, useEffect, useState } from "react";
import { Package, Clock, CheckCircle, Copy, XCircle, Sparkles, Coins } from "lucide-react";
import rewardCodesService, { RewardCodeRecord } from "@/api/service/rewardCodes";
import { message } from "@/utils/pure/message";

const PAGE_SIZE = 10;

export default function RecordTab() {
  const [records, setRecords] = useState<RewardCodeRecord[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [filterType, setFilterType] = useState<"all" | "prop" | "points" | "wild_card">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "unused" | "used" | "voided">("all");

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const fetchPage = useCallback(
    async (nextPage: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const res = await rewardCodesService.page({
          page: nextPage,
          size: PAGE_SIZE,
          rewardType: filterType === "all" ? undefined : filterType,
          status: filterStatus === "all" ? undefined : filterStatus,
        });
        if (!res.success || !res.data) {
          message.error(res.msg || "加载失败");
          return;
        }
        const { records: list, total: t, current } = res.data;
        setTotal(t);
        setPage(Number(current || nextPage));
        setRecords((prev) => (append ? [...prev, ...(list || [])] : list || []));
      } catch (e) {
        console.error(e);
        message.error("加载失败");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filterType, filterStatus],
  );

  useEffect(() => {
    setPage(1);
    fetchPage(1, false);
  }, [filterType, filterStatus, fetchPage]);

  const hasMore = page * PAGE_SIZE < total;

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    fetchPage(page + 1, true);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    message.success("兑换码已复制");
  };

  const handleStatusClick = (record: RewardCodeRecord) => {
    if (record.status === "unused") {
      setConfirmModal({
        isOpen: true,
        title: "作废兑换码",
        message: "确定要作废该兑换码吗？作废后将无法使用。",
        onConfirm: async () => {
          const res = await rewardCodesService.voidCode(record.id);
          if (res.success) {
            message.info("已作废");
            fetchPage(1, false);
          } else {
            message.error(res.msg || "操作失败");
          }
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        },
      });
    } else if (record.status === "voided") {
      setConfirmModal({
        isOpen: true,
        title: "启用兑换码",
        message: "确定要重新启用该兑换码吗？",
        onConfirm: async () => {
          const res = await rewardCodesService.restore(record.id);
          if (res.success) {
            message.success("已启用");
            fetchPage(1, false);
          } else {
            message.error(res.msg || "操作失败");
          }
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        },
      });
    }
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const typeIcon = (t: string) => {
    if (t === "points") return <Coins className="w-6 h-6" />;
    if (t === "wild_card") return <Sparkles className="w-6 h-6" />;
    return <Package className="w-6 h-6" />;
  };

  const typeBg = (t: string) => {
    if (t === "points") return "bg-amber-100 text-amber-500 dark:bg-amber-900/30";
    if (t === "wild_card") return "bg-purple-100 text-purple-500 dark:bg-purple-900/30";
    return "bg-purple-100 text-purple-500 dark:bg-purple-900/30";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-3 mb-4">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap mr-1">
            类型:
          </span>
          {(["all", "prop", "points", "wild_card"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                filterType === type
                  ? "bg-indigo-500 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {type === "all"
                ? "全部"
                : type === "prop"
                  ? "道具"
                  : type === "points"
                    ? "积分"
                    : "万能卡"}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap mr-1">
            状态:
          </span>
          {(["all", "unused", "used", "voided"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? "bg-indigo-500 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {status === "all"
                ? "全部"
                : status === "unused"
                  ? "未兑换"
                  : status === "used"
                    ? "已兑换"
                    : "已作废"}
            </button>
          ))}
        </div>
      </div>

      {loading && records.length === 0 ? (
        <div className="text-center py-10 text-slate-500 dark:text-slate-400">加载中...</div>
      ) : records.length > 0 ? (
        <>
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-start space-x-4"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${typeBg(record.rewardType)}`}
              >
                {typeIcon(record.rewardType)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-slate-800 dark:text-white truncate">
                    {record.rewardName}
                  </h4>
                  <span className="font-bold text-slate-800 dark:text-white ml-2 shrink-0 text-sm">
                    {record.rewardType === "points"
                      ? `+${record.rewardCount}`
                      : `×${record.rewardCount}`}
                  </span>
                </div>
                {record.description ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                    {record.description}
                  </p>
                ) : null}

                <div className="flex items-end justify-between">
                  <div className="flex flex-col space-y-1.5">
                    <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded w-fit tracking-wider">
                      {record.code}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(record.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => handleCopy(record.code)}
                      className="p-2 text-slate-400 hover:text-indigo-500 transition-colors bg-slate-50 dark:bg-slate-700/50 rounded-full"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <div
                      role="presentation"
                      onClick={() => handleStatusClick(record)}
                      className={
                        record.status !== "used"
                          ? "cursor-pointer hover:opacity-80 transition-opacity"
                          : ""
                      }
                    >
                      {record.status === "used" ? (
                        <span className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1.5 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          已兑换
                        </span>
                      ) : record.status === "unused" ? (
                        <span className="flex items-center text-xs font-medium text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1.5 rounded-full">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          未兑换
                        </span>
                      ) : (
                        <span className="flex items-center text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-1.5 rounded-full">
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          已作废
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {hasMore && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full py-3 rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors disabled:opacity-50"
            >
              {loadingMore ? "加载中..." : "展开更多"}
            </button>
          )}
        </>
      ) : (
        <div className="text-center py-10 text-slate-500 dark:text-slate-400">
          暂无相关记录
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              {confirmModal.title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">{confirmModal.message}</p>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="flex-1 py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
