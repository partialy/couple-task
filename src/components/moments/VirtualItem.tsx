import React, { useEffect, useRef, useState } from 'react';

/**
 * 动态高度虚拟滚动占位：滑出缓冲区域后卸载子节点，保留测量高度。
 */
export default function VirtualItem({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const heightRef = useRef(150);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          if (ref.current) {
            heightRef.current = ref.current.offsetHeight;
          }
          setIsVisible(false);
        }
      },
      { rootMargin: '800px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ height: isVisible ? 'auto' : heightRef.current }}>
      {isVisible ? children : null}
    </div>
  );
}
