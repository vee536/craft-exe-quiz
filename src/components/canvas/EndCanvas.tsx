import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  color: string;
}

export const EndCanvas: React.FC = () => {
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

    // Purple teleportation & void particles
    const particles: Particle[] = [];
    const colors = ['#c084fc', '#a855f7', '#9333ea', '#7e22ce', '#e879f9'];
    const maxParticles = Math.min(70, Math.floor(width / 22));

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 4 + 2,
        speedY: (Math.random() - 0.7) * 1.5,
        speedX: (Math.random() - 0.5) * 1.0,
        opacity: Math.random() * 0.7 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let time = 0;

    // Draw stylized Ender Dragon on the canvas
    const drawDragon = (timeVal: number) => {
      // Dragon hovers in the upper center/right
      const centerX = width * 0.75 + Math.sin(timeVal * 0.6) * 60;
      const centerY = height * 0.22 + Math.cos(timeVal * 0.8) * 30;
      const wingFlap = Math.sin(timeVal * 3); // Wing flap cycle
      const scale = Math.min(1, Math.max(0.5, width / 1400));

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);

      // Ambient Dragon Shadow / Purple Glow
      const glowGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 180);
      glowGrad.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 180, 0, Math.PI * 2);
      ctx.fill();

      // Dragon Body (Black pixel blocks with grey edge highlights)
      ctx.fillStyle = '#111216';
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 2;

      // Tail with segmented undulation
      for (let i = 1; i <= 4; i++) {
        const tailX = -50 - i * 32;
        const tailY = Math.sin(timeVal * 2 + i * 0.8) * 16;
        ctx.fillRect(tailX, tailY - 8, 28, 16);
        ctx.strokeRect(tailX, tailY - 8, 28, 16);
        // Spine fin
        ctx.fillStyle = '#3f3f46';
        ctx.fillRect(tailX + 8, tailY - 18, 10, 10);
        ctx.fillStyle = '#111216';
      }

      // Main Torso
      ctx.fillRect(-50, -22, 100, 44);
      ctx.strokeRect(-50, -22, 100, 44);

      // Spine ridges on torso
      ctx.fillStyle = '#52525b';
      ctx.fillRect(-30, -32, 14, 10);
      ctx.fillRect(0, -32, 14, 10);
      ctx.fillRect(30, -32, 14, 10);

      // Wings (Left & Right flapping symmetrically)
      ctx.save();
      ctx.fillStyle = '#18181b';
      // Left / Top Wing
      ctx.save();
      ctx.translate(0, -18);
      ctx.rotate(wingFlap * 0.45 - 0.2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-60, -90);
      ctx.lineTo(-10, -130);
      ctx.lineTo(80, -90);
      ctx.lineTo(20, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#3f3f46';
      ctx.stroke();

      // Wing membrane ribs
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-10, -130);
      ctx.moveTo(0, 0);
      ctx.lineTo(80, -90);
      ctx.stroke();
      ctx.restore();

      // Right / Bottom Wing (drawn behind or below)
      ctx.save();
      ctx.translate(0, 18);
      ctx.rotate(-wingFlap * 0.45 + 0.2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-50, 80);
      ctx.lineTo(0, 115);
      ctx.lineTo(70, 75);
      ctx.lineTo(20, 0);
      ctx.closePath();
      ctx.fillStyle = '#09090b';
      ctx.fill();
      ctx.strokeStyle = '#27272a';
      ctx.stroke();
      ctx.restore();
      ctx.restore();

      // Neck & Head
      ctx.fillStyle = '#111216';
      ctx.fillRect(50, -16, 45, 32); // Neck
      ctx.fillRect(90, -24, 48, 40); // Head
      ctx.strokeRect(90, -24, 48, 40);

      // Snout
      ctx.fillRect(138, -12, 28, 24);
      ctx.strokeRect(138, -12, 28, 24);

      // Horns
      ctx.fillStyle = '#27272a';
      ctx.fillRect(95, -38, 12, 16);
      ctx.fillRect(115, -38, 12, 16);

      // Glowing Magenta Eyes
      ctx.fillStyle = '#f0abfc';
      ctx.shadowColor = '#d946ef';
      ctx.shadowBlur = 12;
      ctx.fillRect(118, -14, 10, 8);
      ctx.shadowBlur = 0; // reset

      ctx.restore();
    };

    const render = () => {
      time += 0.025;
      ctx.clearRect(0, 0, width, height);

      // Subtle void nebula pulses
      const nebula = ctx.createRadialGradient(width * 0.5, height * 0.4, 50, width * 0.5, height * 0.4, width * 0.7);
      nebula.addColorStop(0, 'rgba(88, 28, 135, 0.18)');
      nebula.addColorStop(0.6, 'rgba(30, 27, 75, 0.12)');
      nebula.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, width, height);

      // Draw Ender Dragon
      drawDragon(time);

      // Draw purple floating ender particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity * (0.6 + Math.sin(time * 2 + i) * 0.4);
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.floor(p.size), Math.floor(p.size));
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
