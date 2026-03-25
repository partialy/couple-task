import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import TemplateSearch from './TemplateSearch';
import TemplateFilter from './TemplateFilter';
import TemplateList from './TemplateList';
import TemplatePreview from './TemplatePreview';
import { taskTemplates, TaskTemplate } from '../../data/taskTemplates';
import PageHeader from '../ui/PageHeader';

interface TaskTemplatesPageProps {
  onBack: () => void;
  onUseTemplate: (template: TaskTemplate) => void;
}

export default function TaskTemplatesPage({ onBack, onUseTemplate }: TaskTemplatesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '全部',
    level: '全部',
    rewardType: '全部',
    source: '全部'
  });
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);

  const categories = ['全部', '旅行', '美食', '日常', '心愿单', '纪念日'];
  const levels = ['全部', '小事', '简单', '中等', '高级', '困难', '极难'];
  const rewardTypes = ['全部', '积分', '礼物', '徽章'];
  const sources = [
    { label: '全部', value: '全部' },
    { label: '官方', value: 'official' },
    { label: '用户', value: 'user' }
  ];

  const filteredTemplates = useMemo(() => {
    return taskTemplates.filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filters.category === '全部' || template.category === filters.category;
      const matchesLevel = filters.level === '全部' || template.level === filters.level;
      const matchesRewardType = filters.rewardType === '全部' || template.rewardType === filters.rewardType;
      const matchesSource = filters.source === '全部' || template.source === filters.source;

      return matchesSearch && matchesCategory && matchesLevel && matchesRewardType && matchesSource;
    });
  }, [searchQuery, filters]);

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden"
    >
      <PageHeader title="任务模板库" onBack={onBack} />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Search & Filters Section */}
        <div className="px-3 pt-3 pb-4 space-y-3 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-800/20">
          <TemplateSearch value={searchQuery} onChange={setSearchQuery} />
          
          <div className="grid grid-cols-4 gap-x-2">
            <TemplateFilter
              label="分类"
              options={categories.map(c => ({ label: c, value: c }))}
              value={filters.category}
              onChange={(v) => setFilters(f => ({ ...f, category: v }))}
            />
            <TemplateFilter
              label="等级"
              options={levels.map(l => ({ label: l, value: l }))}
              value={filters.level}
              onChange={(v) => setFilters(f => ({ ...f, level: v }))}
            />
            <TemplateFilter
              label="奖励"
              options={rewardTypes.map(r => ({ label: r, value: r }))}
              value={filters.rewardType}
              onChange={(v) => setFilters(f => ({ ...f, rewardType: v }))}
            />
            <TemplateFilter
              label="来源"
              options={sources}
              value={filters.source}
              onChange={(v) => setFilters(f => ({ ...f, source: v }))}
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              {filteredTemplates.length} 个匹配模板
            </h3>
          </div>
          <TemplateList
            templates={filteredTemplates}
            onSelect={setSelectedTemplate}
          />
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedTemplate && (
          <TemplatePreview
            template={selectedTemplate}
            onClose={() => setSelectedTemplate(null)}
            onUse={onUseTemplate}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
