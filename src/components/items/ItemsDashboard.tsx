import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, MoreHorizontal, PackageSearch, Search } from 'lucide-react';
import DashboardStats from './DashboardStats';
import ItemFilter, { FilterType } from './ItemFilter';
import ItemCard from './ItemCard';
import ItemRedemptionModal from './ItemRedemptionModal';
import ItemMoreActionsModal from './ItemMoreActionsModal';
import QrScanner from '../QrScanner';
import { useUserStore } from '@/store';
import userItemsService, { UserItemRecord } from '@/api/service/userItems';
import { message } from '@/utils/pure/message';

interface ItemsDashboardProps {
  onBack: () => void;
}

export default function ItemsDashboard({ onBack }: ItemsDashboardProps) {
  const PAGE_SIZE = 10;
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<UserItemRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [moreOpenNonce, setMoreOpenNonce] = useState(0);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [items, setItems] = useState<UserItemRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const currentUser = useUserStore((state) => state.currentUser);
  const fetchUserDetail = useUserStore((state) => state.fetchUserDetail);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const mapToUserItem = (record: UserItemRecord): UserItemRecord => ({
    id: record.id,
    itemId: record.itemId,
    name: record.name,
    description: record.description,
    icon: record.icon || 'Package',
    type: record.type,
    status: record.status,
    code: record.code,
    acquiredAt: record.acquiredAt,
    usedAt: record.usedAt,
    color: record.color || 'cyan',
    isSpecial: record.isSpecial ?? 0,
  });

  const fetchItems = async (targetPage: number, append = false) => {
    setLoading(true);
    try {
      const isSpecialOnly = activeFilter === 'special';
      const statusParam =
        activeFilter === 'all' || isSpecialOnly ? undefined : activeFilter;

      const res = await userItemsService.page({
        page: targetPage,
        size: PAGE_SIZE,
        status: statusParam,
        isSpecial: isSpecialOnly ? 1 : undefined,
        keyword: debouncedSearch || undefined,
      });
      if (!res.success) {
        message.error(res.msg || '加载道具失败');
        return;
      }
      const pageData = res.data;
      const nextItems = (pageData.records || []).map(mapToUserItem);
      setItems((prev) => (append ? [...prev, ...nextItems] : nextItems));
      setCurrentPage(Number(pageData.current || targetPage));
      setHasMore(Number(pageData.current || targetPage) * Number(pageData.size || PAGE_SIZE) < Number(pageData.total || 0));
    } catch (error) {
      console.error('Failed to fetch user items:', error);
      message.error('加载道具失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(1, false);
  }, [activeFilter, debouncedSearch]);

  const pointsBalance = currentUser?.points || 0;
  const wildcardBalance = useUserStore(s => s.currentUser?.cards || 0);

  const handleItemClick = (item: UserItemRecord) => {
    if (item.status === 'usable') {
      setSelectedItem(item);
      setIsModalOpen(true);
    }
  };

  const handleOpenScanner = () => {
    setIsMoreOpen(false);
    setIsScannerOpen(true);
  };

  const handleScan = async (decodedText: string) => {
    // html5-qrcode 回调：decodedText 始终为 string，内容为二维码里编码的原始文本（纯文本 / URL / JSON 字符串等）
    const c = decodedText.trim();
    if (!c) return;

    console.log('[扫码] typeof:', typeof decodedText, 'length:', decodedText.length, 'raw:', decodedText);
    const preview = c.length > 280 ? `${c.slice(0, 280)}…` : c;
    message.success(`扫码成功 · 共 ${c.length} 字符：${preview}`, { duration: 10000 });

    try {
      const res = await userItemsService.verifyByCode(c);
      if (res.success) {
        const msg =
          (typeof res.data === 'string' && res.data) ? res.data : res.msg || '核销成功';
        message.success(msg);
        await fetchUserDetail();
        await fetchItems(1, false);
        setIsScannerOpen(false);
      } else {
        message.error(res.msg || '核销失败');
      }
    } catch (e) {
      console.error(e);
      message.error('核销失败');
    }
  };

  const handleRedeemSuccess = async () => {
    await fetchUserDetail();
    await fetchItems(1, false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute inset-0 z-50 bg-slate-50 dark:bg-slate-900 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 shadow-sm z-10">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">我的道具</h2>
        <button
          type="button"
          onClick={() => {
            setMoreOpenNonce((n) => n + 1);
            setIsMoreOpen(true);
          }}
          aria-label="更多"
          className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-32 no-scrollbar">
        <DashboardStats
          pointsBalance={pointsBalance}
          wildcardBalance={wildcardBalance}
          totalItems={items.length}
        />

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="搜索道具名称或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors shadow-sm"
          />
        </div>

        <ItemFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />

        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} onClick={handleItemClick} />
            ))}
            {hasMore && (
              <button
                onClick={() => fetchItems(currentPage + 1, true)}
                disabled={loading}
                className="w-full py-3 rounded-2xl border border-dashed border-cyan-200 dark:border-cyan-700 text-cyan-600 dark:text-cyan-400 font-bold text-sm hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors disabled:opacity-60"
              >
                {loading ? '加载中...' : '展开更多'}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-500">
            <PackageSearch className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-medium">暂无相关道具</p>
          </div>
        )}
      </div>

      {/* Redemption Modal */}
      <ItemRedemptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
      />

      <ItemMoreActionsModal
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        openNonce={moreOpenNonce}
        onOpenScanner={handleOpenScanner}
        onRedeemSuccess={handleRedeemSuccess}
      />

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {isScannerOpen && (
          <QrScanner 
            onScan={handleScan} 
            onClose={() => setIsScannerOpen(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
