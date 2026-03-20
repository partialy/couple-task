import { useTaskStore } from "@/store";

interface CategoryChipsProps {
  activeCategory: string;
  onChange: (category: string) => void;
}

/**
 * 分类条（横向滚动 chips）
 */
export default function CategoryChips({ activeCategory, onChange }: CategoryChipsProps) {

  const categories = ["全部"].concat(useTaskStore().categories.map(c => {
    return c.name
  }))

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-4 z-10 flex-shrink-0">
      <div className="flex space-x-3 px-3 w-max">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm flex-shrink-0 ${
              activeCategory === cat
                ? 'bg-cyan-400 dark:bg-cyan-500 text-white shadow-cyan-300/40 dark:shadow-cyan-900/40'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}

