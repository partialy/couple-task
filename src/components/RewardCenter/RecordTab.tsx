import { useState } from "react";
import { Package, Clock, CheckCircle, Copy, XCircle } from "lucide-react";

export default function RecordTab() {
  const [records, setRecords] = useState<
    any[]
  >([]);

  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

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

  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 2000);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast("兑换码已复制");
  };

  const handleStatusClick = (record: any) => {
    if (record.status === "unused") {
      setConfirmModal({
        isOpen: true,
        title: "作废兑换码",
        message: "确定要作废该兑换码吗？作废后将无法使用。",
        onConfirm: () => {
          setRecords(
            records.map((r) =>
              r.id === record.id ? { ...r, status: "voided" } : r,
            ),
          );
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          showToast("已作废");
        },
      });
    } else if (record.status === "voided") {
      setConfirmModal({
        isOpen: true,
        title: "启用兑换码",
        message: "确定要重新启用该兑换码吗？",
        onConfirm: () => {
          setRecords(
            records.map((r) =>
              r.id === record.id ? { ...r, status: "unused" } : r,
            ),
          );
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          showToast("已启用");
        },
      });
    }
  };

  const filteredRecords = records.filter((r) => {
    if (filterType !== "all" && r.type !== filterType) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col space-y-3 mb-4">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap mr-1">
            类型:
          </span>
          {["all", "prop", "points", "special"].map((type) => (
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
                    : "特殊"}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap mr-1">
            状态:
          </span>
          {["all", "unused", "used", "voided"].map((status) => (
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

      {filteredRecords.length > 0 ? (
        filteredRecords.map((record) => (
          <div
            key={record.id}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-start space-x-4"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                record.type === "prop"
                  ? "bg-purple-100 text-purple-500 dark:bg-purple-900/30"
                  : record.type === "points"
                    ? "bg-amber-100 text-amber-500 dark:bg-amber-900/30"
                    : "bg-pink-100 text-pink-500 dark:bg-pink-900/30"
              }`}
            >
              <Package className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-slate-800 dark:text-white truncate">
                  {record.name}
                </h4>
                <span className="font-bold text-slate-800 dark:text-white ml-2 shrink-0">
                  {record.type === "points"
                    ? `+${record.count}`
                    : `x${record.count}`}
                </span>
              </div>

              <div className="flex items-end justify-between">
                <div className="flex flex-col space-y-1.5">
                  <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded w-fit tracking-wider">
                    {record.code}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {record.date}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleCopy(record.code)}
                    className="p-2 text-slate-400 hover:text-indigo-500 transition-colors bg-slate-50 dark:bg-slate-700/50 rounded-full"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <div
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
        ))
      ) : (
        <div className="text-center py-10 text-slate-500 dark:text-slate-400">
          暂无相关记录
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              {confirmModal.title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {confirmModal.message}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() =>
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                }
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="flex-1 py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[70] bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-full shadow-lg text-sm transition-opacity">
          {toast.message}
        </div>
      )}
    </div>
  );
}
