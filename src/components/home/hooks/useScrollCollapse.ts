import { RefObject, useEffect, useMemo, useRef, useState } from 'react';

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
  const boundElRef = useRef<HTMLElement | null>(null);

  const thresholds = useMemo(
    () => ({
      collapse: collapseThresholdPx,
      expand: Math.min(expandThresholdPx, collapseThresholdPx),
    }),
    [collapseThresholdPx, expandThresholdPx]
  );

  useEffect(() => {
    const currentEl = scrollContainerRef.current;
    if (!currentEl || boundElRef.current === currentEl) return;

    boundElRef.current = currentEl;
    let rafId: number | null = null;

    const update = () => {
      rafId = null;
      const top = currentEl.scrollTop ?? 0;
      setScrollTop(top);
      setCollapsed((prev) => (prev ? top > thresholds.expand : top > thresholds.collapse));
    };

    const onScroll = () => {
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(update);
    };

    update();
    currentEl.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      if (rafId != null) window.cancelAnimationFrame(rafId);
      currentEl.removeEventListener('scroll', onScroll);
      if (boundElRef.current === currentEl) {
        boundElRef.current = null;
      }
    };
  });

  return { collapsed, scrollTop };
}

