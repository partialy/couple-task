import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, PackageSearch, ScanLine, Search } from 'lucide-react';
import DashboardStats from './DashboardStats';
import ItemFilter, { FilterType } from './ItemFilter';
import ItemCard from './ItemCard';
import ItemRedemptionModal from './ItemRedemptionModal';
import RedeemInputModal from './RedeemInputModal';
import QrScanner from '../QrScanner';
import { mockUserItems, UserItem } from '../../data/userItems';

interface ItemsDashboardProps {
  onBack: () => void;
}

export default function ItemsDashboard({ onBack }: ItemsDashboardProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<UserItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Mock balances (these would normally come from a store or API)
  const pointsBalance = 1250;
  const wildcardBalance = 3;

  const filteredItems = mockUserItems.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.status === activeFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleItemClick = (item: UserItem) => {
    if (item.status === 'usable') {
      setSelectedItem(item);
      setIsModalOpen(true);
    }
  };

  const handleRedeem = (code: string) => {
    alert(`核销码: ${code}`);
    setIsRedeemModalOpen(false);
  };

  const handleScan = (decodedText: string) => {
    alert(`扫描成功: ${decodedText}`);
    setIsScannerOpen(false);
    // You could also automatically fill the code in the redeem modal here
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute inset-0 z-50 bg-slate-50 dark:bg-slate-900 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-6 bg-white dark:bg-slate-800 shadow-sm z-10">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">我的道具</h2>
        <button
          onClick={() => setIsRedeemModalOpen(true)}
          className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors"
        >
          <ScanLine className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-32 no-scrollbar">
        <DashboardStats
          pointsBalance={pointsBalance}
          wildcardBalance={wildcardBalance}
          totalItems={mockUserItems.length}
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

        {filteredItems.length > 0 ? (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} onClick={handleItemClick} />
            ))}
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

      {/* Input Redemption Modal */}
      <RedeemInputModal
        isOpen={isRedeemModalOpen}
        onClose={() => setIsRedeemModalOpen(false)}
        onRedeem={handleRedeem}
        onScan={() => {
          setIsRedeemModalOpen(false);
          setIsScannerOpen(true);
        }}
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
