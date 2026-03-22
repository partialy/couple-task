import React from "react";
import { ImageIcon } from "lucide-react";

interface TaskGalleryProps {
  images: string[];
  /** 点击缩略图放大预览 */
  onImageClick?: (src: string) => void;
}

export default function TaskGallery({ images, onImageClick }: TaskGalleryProps) {
  if (!images || images.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center">
        <ImageIcon className="w-4 h-4 mr-2 text-slate-400" />
        更多图片
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="aspect-square overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800"
          >
            {onImageClick ? (
              <button
                type="button"
                aria-label={`放大查看图片 ${idx + 1}`}
                onClick={() => onImageClick(img)}
                className="block h-full w-full cursor-zoom-in p-0 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
              >
                <img
                  src={img}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </button>
            ) : (
              <img
                src={img}
                alt={`Other ${idx}`}
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
