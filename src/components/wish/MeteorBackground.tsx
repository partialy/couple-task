import React, { useEffect, useRef } from 'react';

type Meteor = {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
};

/** 流星数量略减、首帧延后，降低进入页面时与路由动画同帧抢主线程 */
const METEOR_COUNT = 4;

export default function MeteorBackground({ darkMode }: { darkMode: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationId = 0;
    let w = 0;
    let h = 0;
    const meteors: Meteor[] = [];
    let running = true;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = canvas.width = parent.offsetWidth;
      h = canvas.height = parent.offsetHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const createMeteor = (): Meteor => ({
      x: Math.random() * w * 1.5,
      y: Math.random() * -h,
      length: 100 + Math.random() * 120,
      speed: 1.5 + Math.random() * 2.5,
      opacity: 1,
    });

    for (let i = 0; i < METEOR_COUNT; i++) meteors.push(createMeteor());

    const render = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = 'round';
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';

      const rgb = darkMode ? '255,255,255' : '255,255,255';

      meteors.forEach((m) => {
        m.x -= m.speed;
        m.y += m.speed;
        m.opacity -= 0.0025;
        if (m.opacity <= 0 || m.x < -m.length || m.y > h + m.length) {
          Object.assign(m, createMeteor());
        }
        const grad = ctx.createLinearGradient(m.x, m.y, m.x + m.length, m.y - m.length);
        grad.addColorStop(0, `rgba(${rgb}, ${m.opacity})`);
        grad.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x + m.length, m.y - m.length);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      if (running) animationId = requestAnimationFrame(render);
    };

    // 与许愿瓶一致：晚一帧再开始持续 rAF，避免首屏与 Framer 进入动画叠在同一帧
    animationId = requestAnimationFrame(() => {
      animationId = requestAnimationFrame(render);
    });

    return () => {
      running = false;
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [darkMode]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0" />;
}
