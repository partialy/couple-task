import React, { useRef, useEffect } from 'react';
import { ImagePlus, X, ImageIcon } from 'lucide-react';
import { createLocalPreview, revokeLocalPreview } from '@/utils/qiniu';

interface ImageUploadProps {
  coverImage: string | null;
  onCoverChange: (file: File | null, previewUrl: string | null) => void;
  otherImages: string[];
  otherFiles: File[];
  onOtherImagesChange: (files: File[], previewUrls: string[]) => void;
}

export default function ImageUpload({ 
  coverImage, 
  onCoverChange, 
  otherImages, 
  otherFiles,
  onOtherImagesChange 
}: ImageUploadProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const otherInputRef = useRef<HTMLInputElement>(null);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = createLocalPreview(file);
      onCoverChange(file, preview);
    }
  };

  const handleOtherImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    const remainingSlots = 6 - otherImages.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const newFiles: File[] = [...otherFiles, ...filesToAdd];
    const newPreviews: string[] = [...otherImages, ...filesToAdd.map(file => createLocalPreview(file))];
    
    onOtherImagesChange(newFiles, newPreviews);
  };

  const removeOtherImage = (index: number) => {
    const previewToRemove = otherImages[index];
    if (previewToRemove.startsWith('blob:')) {
      revokeLocalPreview(previewToRemove);
    }
    
    const newFiles = otherFiles.filter((_, i) => i !== index);
    const newPreviews = otherImages.filter((_, i) => i !== index);
    onOtherImagesChange(newFiles, newPreviews);
  };

  return (
    <>
      {/* 图片上传区域 */}
      <div 
        onClick={() => coverInputRef.current?.click()}
        className="w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer group relative overflow-hidden"
      >
        {coverImage ? (
          <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ImagePlus className="w-6 h-6 text-cyan-500" />
            </div>
            <span className="text-sm font-medium">添加封面图片</span>
          </>
        )}
        <input 
          type="file" 
          ref={coverInputRef} 
          onChange={handleCoverImageChange} 
          accept="image/*" 
          className="hidden" 
        />
      </div>

      {/* 其他图片上传区域 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">其他图片</h3>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{otherImages.length}/6</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {otherImages.map((img, index) => (
            <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <img src={img} alt={`Other ${index}`} className="w-full h-full object-cover" />
              <button 
                onClick={() => removeOtherImage(index)}
                className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {otherImages.length < 6 && (
            <div 
              onClick={() => otherInputRef.current?.click()}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <ImageIcon className="w-6 h-6 mb-1 text-slate-400" />
              <span className="text-[10px] font-medium">添加图片</span>
              <input 
                type="file" 
                ref={otherInputRef} 
                onChange={handleOtherImagesChange} 
                accept="image/*" 
                multiple
                className="hidden" 
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
