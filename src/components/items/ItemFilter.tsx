import React from 'react';

export type FilterType = 'all' | 'usable' | 'used';

interface ItemFilterProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function ItemFilter({ activeFilter, onFilterChange }: ItemFilterProps) {
  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: '全部' },
    { id: 'usable', label: '可使用' },
    { id: 'used', label: '已使用' },
  ];

  return (
    <div className="flex space-x-2 mb-6 overflow-x-auto no-scrollbar pb-1">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm flex-shrink-0 ${
            activeFilter === filter.id
              ? 'bg-cyan-400 dark:bg-cyan-500 text-white shadow-cyan-300/40 dark:shadow-cyan-900/40'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
