import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Star } from 'lucide-react';
import { mockCategories, AchievementCategory } from '../../data/achievements';
import CategoryCard from './CategoryCard';
import AchievementDetail from './AchievementDetail';
import PageHeader from '../ui/PageHeader';

interface AchievementsProps {
  key?: React.Key;
  onBack: () => void;
}

export default function Achievements({ onBack }: AchievementsProps) {
  const [categories, setCategories] = useState<AchievementCategory[]>(mockCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCategory = categories.find(c => c.id === selectedCategoryId) || null;

  // Handle back button for modal
  React.useEffect(() => {
    if (selectedCategory) {
      window.history.pushState({ modal: 'achievementCategory' }, '', '#achievementCategory');
      
      const handlePopState = () => {
        setSelectedCategoryId(null);
      };
      
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [selectedCategory]);

  const handleCloseCategory = () => {
    if (selectedCategory) {
      window.history.back();
    }
  };

  const handleCompleteAchievement = (categoryId: string, achievementId: string, image: string, note: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          achievements: cat.achievements.map(ach => {
            if (ach.id === achievementId) {
              return {
                ...ach,
                isCompleted: true,
                completedAt: new Date().toISOString().split('T')[0],
                image,
                note
              };
            }
            return ach;
          })
        };
      }
      return cat;
    }));
  };

  const totalAchievements = categories.reduce((acc, cat) => acc + cat.achievements.length, 0);
  const completedAchievements = categories.reduce((acc, cat) => acc + cat.achievements.filter(a => a.isCompleted).length, 0);
  const completionRate = Math.round((completedAchievements / totalAchievements) * 100) || 0;

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-900 flex flex-col overflow-hidden"
    >
      <PageHeader title="成就系统" onBack={onBack} />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Overview Card */}
        <div className="p-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -ml-10 -mb-10"></div>
            
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <p className="text-indigo-100 text-sm font-medium mb-1">总完成度</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-black">{completionRate}</span>
                  <span className="text-lg font-bold text-indigo-200">%</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                <Star className="w-8 h-8 text-amber-300 fill-amber-300" />
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between text-xs font-medium text-indigo-100 mb-2">
                <span>已解锁 {completedAchievements} 个成就</span>
                <span>共 {totalAchievements} 个</span>
              </div>
              <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-amber-300 to-amber-400 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm text-slate-700 dark:text-white placeholder:text-slate-400 shadow-sm"
              placeholder="搜索成就..."
            />
            <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-500 transition-colors">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Categories List */}
        <div className="p-3 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">成就图鉴</h3>
          {categories.map((category) => (
            <CategoryCard 
              key={category.id} 
              category={category} 
              onClick={() => setSelectedCategoryId(category.id)} 
            />
          ))}
        </div>
      </div>

      {/* Category Detail Modal */}
      <AnimatePresence>
        {selectedCategory && (
          <AchievementDetail 
            key="achievement-detail"
            category={selectedCategory} 
            onClose={handleCloseCategory} 
            onComplete={handleCompleteAchievement}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
