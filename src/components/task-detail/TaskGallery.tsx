import React from "react";
import { ImageIcon } from "lucide-react";

interface TaskGalleryProps {
  images: string[];
}

export default function TaskGallery({ images }: TaskGalleryProps) {
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
            className="aspect-square rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800"
          >
            <img
              src={img}
              alt={`Other ${idx}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
