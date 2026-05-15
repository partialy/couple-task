import React, { useEffect, useLayoutEffect, useRef } from 'react';
import type { StarDisplay } from './wishDisplay';

type VisualStar = {
  x: number;
  y: number;
  size: number;
  angle: number;
  color: string;
  vx: number;
  vy: number;
  va: number;
};

function buildVisualStars(starsData: StarDisplay[], isLeft: boolean): VisualStar[] {
  const count = Math.max(3, Math.min(8, starsData.length === 0 ? 3 : starsData.length));
  const generated: VisualStar[] = [];
  const basePalette = isLeft
    ? ['#fb7185', '#f472b6', '#fbbf24', '#f43f5e', '#c084fc']
    : ['#38bdf8', '#60a5fa', '#818cf8', '#2dd4bf', '#a78bfa'];

  for (let i = 0; i < count; i++) {
    let hexColor = basePalette[Math.floor(Math.random() * basePalette.length)];
    if (starsData[i]) {
      const c = starsData[i].color;
      if (c.includes('rose')) hexColor = '#fb7185';
      else if (c.includes('pink')) hexColor = '#f472b6';
      else if (c.includes('amber')) hexColor = '#fbbf24';
      else if (c.includes('sky')) hexColor = '#38bdf8';
      else if (c.includes('blue')) hexColor = '#60a5fa';
      else if (c.includes('indigo')) hexColor = '#818cf8';
      else if (c.includes('teal')) hexColor = '#2dd4bf';
      else if (c.includes('purple')) hexColor = '#c084fc';
    }
    generated.push({
      x: (Math.random() - 0.5) * 70,
      y: (Math.random() - 0.5) * 80 + 20,
      size: 5 + Math.random() * 4.5,
      angle: Math.random() * Math.PI * 2,
      color: hexColor,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      va: (Math.random() - 0.5) * 0.04,
    });
  }
  return generated;
}

function drawInternalStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  angle: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / 5;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(Math.cos(rot) * radius, Math.sin(rot) * radius);
    rot += step;
    ctx.lineTo(Math.cos(rot) * (radius * 0.45), Math.sin(rot) * (radius * 0.45));
    rot += step;
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 4;
  ctx.fill();
  ctx.restore();
}

/**
 * 许愿瓶 Canvas：星星位置放在 ref 里可变，避免 useState 触发重挂载；
 * 数据变化时只重建 ref，动画循环单一且不因 React 重渲染重启。
 */
export default function CanvasCylinderBottle({
  starsData,
  isLeft,
}: {
  starsData: StarDisplay[];
  isLeft: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<VisualStar[]>([]);

  const dataKey = `${starsData.map((s) => s.id).join(',')}:${isLeft}`;

  useLayoutEffect(() => {
    starsRef.current = buildVisualStars(starsData, isLeft);
  }, [dataKey, starsData, isLeft]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let running = true;

    const render = () => {
      if (!running) return;
      const visualStars = starsRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2 + 10;

      if (visualStars.length > 0) {
        visualStars.forEach((s) => {
          s.x += s.vx;
          s.y += s.vy;
          s.angle += s.va;
          if (s.x > 38) {
            s.x = 38;
            s.vx *= -1;
          }
          if (s.x < -38) {
            s.x = -38;
            s.vx *= -1;
          }
          if (s.y > 65) {
            s.y = 65;
            s.vy *= -1;
          }
          if (s.y < -35) {
            s.y = -35;
            s.vy *= -1;
          }
        });
      }

      ctx.shadowBlur = 0;

      ctx.fillStyle = 'rgba(120, 60, 20, 0.9)';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(cx - 15, cy - 105, 30, 20, 4);
      else ctx.rect(cx - 15, cy - 105, 30, 20);
      ctx.fill();

      ctx.fillStyle = 'rgba(160, 80, 30, 0.95)';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(cx - 18, cy - 110, 36, 10, 3);
      else ctx.rect(cx - 18, cy - 110, 36, 10);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(cx - 10, cy - 108, 20, 3, 2);
      else ctx.rect(cx - 10, cy - 108, 20, 3);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(cx - 18, cy - 90, 36, 25);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 18, cy - 90);
      ctx.lineTo(cx - 18, cy - 65);
      ctx.moveTo(cx + 18, cy - 90);
      ctx.lineTo(cx + 18, cy - 65);
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.shadowBlur = 0;
      visualStars.forEach((s) => drawInternalStar(ctx, s.x, s.y, s.size, s.angle, s.color));
      ctx.restore();

      ctx.save();
      ctx.translate(cx, cy);
      const grad = ctx.createLinearGradient(-55, 0, 55, 0);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
      grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.15)');
      grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.15)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.65)');
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-55, -65, 110, 145, [20, 20, 30, 30]);
      else ctx.rect(-55, -65, 110, 145);
      ctx.fillStyle = grad;
      ctx.shadowColor = isLeft ? 'rgba(244,63,94,0.2)' : 'rgba(14,165,233,0.2)';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.stroke();
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-48, -58, 96, 131, [15, 15, 25, 25]);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-40, -45);
      ctx.lineTo(-40, 55);
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(42, -25);
      ctx.lineTo(42, 45);
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(cx - 12, cy - 88, 5, 20);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 85, 45, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      if (running) raf = requestAnimationFrame(render);
    };

    const tick = () => {
      if (!running) return;
      render();
    };

    // 首帧推迟一帧，避免与路由进入动画同一帧抢主线程
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(tick);
    });

    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [isLeft]);

  return (
    <canvas
      ref={canvasRef}
      width={190}
      height={260}
      className="mx-auto cursor-pointer transition-transform duration-300 hover:scale-105"
    />
  );
}
