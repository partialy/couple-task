import React from 'react';
import Modal from '@/components/ui/Modal';
import { Star } from 'lucide-react';
import {
  SpecialItem,
  specialIconMap,
  specialColorStyles,
  getSpecialItemBgClass,
} from './types';

interface SpecialItemDetailModalProps {
  item: SpecialItem | null;
  onClose: () => void;
}

export default function SpecialItemDetailModal({
  item,
  onClose,
}: SpecialItemDetailModalProps) {
  const IconComponent = item ? specialIconMap[item.icon] || Star : Star;
  const colorKey =
    item && specialColorStyles[item.color] ? item.color : 'indigo';

  return (
    <Modal
      isOpen={item != null}
      onClose={onClose}
      title={item?.name ?? '详情'}
    >
      {item ? (
        <div className="space-y-5">
          <div className="flex justify-center">
            <div
              className={`flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl ${getSpecialItemBgClass(item.color)}`}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <IconComponent
                  className={`h-14 w-14 ${specialColorStyles[colorKey]?.text || 'text-indigo-500'}`}
                />
              )}
            </div>
          </div>

          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {item.desc?.trim() ? item.desc : '暂无详细描述'}
          </p>

          <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="text-sm text-slate-700 dark:text-slate-200">
              <span className="font-bold text-indigo-500">{item.cards}</span>
              <span className="ml-1 text-slate-500 dark:text-slate-400">
                张万能卡
              </span>
            </p>
            {item.stock != null && item.stock >= 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                库存 {item.stock > 0 ? `剩余 ${item.stock}` : '已售罄'}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-slate-100 py-3.5 font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            关闭
          </button>
        </div>
      ) : null}
    </Modal>
  );
}
