import { RefObject, useEffect, useMemo, useState } from 'react';

interface UseScrollCollapseOptions {
  /** 折叠阈值（超过该值进入折叠态） */
  collapseThresholdPx: number;
  /** 展开阈值（低于等于该值恢复展开态）。用于滞回，避免临界抖动 */
  expandThresholdPx: number;
}

interface UseScrollCollapseResult {
  collapsed: boolean;
  scrollTop: number;
}

export default function useScrollCollapse(
  scrollContainerRef: RefObject<HTMLElement>,
  { collapseThresholdPx, expandThresholdPx }: UseScrollCollapseOptions
): UseScrollCollapseResult {
  const [collapsed, setCollapsed] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);

  const thresholds = useMemo(
    () => ({
      collapse: collapseThresholdPx,
      expand: Math.min(expandThresholdPx, collapseThresholdPx),
    }),
    [collapseThresholdPx, expandThresholdPx]
  );

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    let rafId: number | null = null;

    const update = () => {
      rafId = null;
      const top = el.scrollTop ?? 0;
      setScrollTop(top);

      setCollapsed((prev) => {
        if (prev) {
          return top > thresholds.expand;
        }
        return top > thresholds.collapse;
      });
    };

    const onScroll = () => {
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(update);
    };

    // 初始化一次，确保首次渲染状态正确
    update();
    el.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      if (rafId != null) window.cancelAnimationFrame(rafId);
      el.removeEventListener('scroll', onScroll);
    };
  }, [scrollContainerRef, thresholds.collapse, thresholds.expand]);

  return { collapsed, scrollTop };
}

