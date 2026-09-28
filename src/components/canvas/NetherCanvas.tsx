import React, { useEffect, useRef } from 'react';

interface Ember {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  life: number;
  maxLife: number;
  color: string;
}

export const NetherCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const embers: Ember[] = [];
    const emberColors = ['#f59e0b', '#f97316', '#ef4444', '#dc2626', '#fbbf24'];
    const maxEmbers = Math.min(80, Math.floor(width / 20));

    const createEmber = (bottomOnly = true): Ember => {
      const maxLife = Math.random() * 120 + 80;
      return {
        x: Math.random() * width,
        y: bottomOnly ? height - Math.random() * 80 : Math.random() * height,
        size: Math.random() * 5 + 2,
        speedY: Math.random() * 1.8 + 0.8,
        speedX: (Math.random() - 0.5) * 1.2,
        life: bottomOnly ? 0 : Math.random() * maxLife,
        maxLife,
        color: emberColors[Math.floor(Math.random() * emberColors.length)],
      };
    };

    for (let i = 0; i < maxEmbers; i++) {
      embers.push(createEmber(false));
    }

    let time = 0;
    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, width, height);

      // Lava heat atmospheric gradient along bottom
      const lavaGlow = ctx.createLinearGradient(0, height, 0, height - 260);
      const glowAlpha = 0.25 + Math.sin(time * 1.5) * 0.08;
      lavaGlow.addColorStop(0, `rgba(239, 68, 68, ${glowAlpha})`);
      lavaGlow.addColorStop(0.5, `rgba(245, 158, 11, ${glowAlpha * 0.4})`);
      lavaGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lavaGlow;
      ctx.fillRect(0, height - 260, width, 260);

      // Render rising embers
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.life++;
        e.y -= e.speedY;
        e.x += e.speedX + Math.sin(time + e.life * 0.05) * 0.4;

        if (e.life >= e.maxLife || e.y < -20) {
          embers[i] = createEmber(true);
          continue;
        }

        const progress = e.life / e.maxLife;
        const alpha = Math.sin(progress * Math.PI) * 0.9;

        ctx.fillStyle = e.color;
        ctx.globalAlpha = Math.max(0, alpha);
        // Draw pixel block ember
        ctx.fillRect(Math.floor(e.x), Math.floor(e.y), Math.floor(e.size), Math.floor(e.size));
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
    />
  );
};
