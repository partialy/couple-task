import React from 'react';
import TemplateCard from './TemplateCard';
import { TaskTemplate } from '../../data/taskTemplates';

interface TemplateListProps {
  templates: TaskTemplate[];
  onSelect: (template: TaskTemplate) => void;
}

export default function TemplateList({ templates, onSelect }: TemplateListProps) {
  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">🔍</span>
        </div>
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-1">未找到匹配的模板</h3>
        <p className="text-sm text-slate-400 dark:text-slate-500">尝试调整过滤器或搜索词</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onClick={() => onSelect(template)}
        />
      ))}
    </div>
  );
}
