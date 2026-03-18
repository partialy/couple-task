import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface TemplateFilterProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function TemplateFilter({ label, options, value, onChange }: TemplateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-2 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 transition-all"
      >
        <span className="truncate">{value === '全部' ? label : (options.find(o => o.value === value)?.label || value)}</span>
        <ChevronLeft className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : '-rotate-90'}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            ></div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 z-20 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-700 flex flex-col w-32 max-h-48 overflow-y-auto no-scrollbar origin-top-left"
            >
              {options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 rounded-xl text-sm font-medium text-left transition-colors ${
                    value === opt.value
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
