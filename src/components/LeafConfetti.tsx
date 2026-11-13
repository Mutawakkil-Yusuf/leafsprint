"use client";

import { useEffect, useRef } from "react";

/**
 * Leaf confetti — a canvas burst that fires only when an action earns it
 * (a watered day, a milestone). Respects prefers-reduced-motion.
 */

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  life: number;
};

function leafColors(): string[] {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || fallback;
  return [
    read("--leaf", "#3e6b48"),
    read("--leaf-soft", "#5a8763"),
    read("--honey", "#c98a2b"),
    read("--moss", "#e4eadc"),
  ];
}

export function LeafConfetti({ trigger }: { trigger: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (trigger <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const colors = leafColors();
    const cx = rect.width / 2;
    const cy = rect.height * 0.38;

    for (let i = 0; i < 26; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.4 + Math.random() * 3.6;
      particles.current.push({
        x: cx + (Math.random() - 0.5) * 30,
        y: cy + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3.4,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.22,
        size: 6 + Math.random() * 6,
        color: colors[i % colors.length],
        life: 1,
      });
    }

    const drawLeaf = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(p.size * 0.9, -p.size * 0.3, p.size * 0.7, p.size * 0.7, 0, p.size);
      ctx.bezierCurveTo(-p.size * 0.7, p.size * 0.7, -p.size * 0.9, -p.size * 0.3, 0, -p.size);
      ctx.fill();
      ctx.restore();
    };

    const tick = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      particles.current = particles.current.filter((p) => p.life > 0 && p.y < rect.height + 20);
      for (const p of particles.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gravity
        p.vx *= 0.99;
        p.rot += p.vr;
        p.life -= 0.011;
        drawLeaf(p);
      }
      if (particles.current.length > 0) {
        raf.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, rect.width, rect.height);
        raf.current = null;
      }
    };

    if (raf.current === null) raf.current = requestAnimationFrame(tick);
  }, [trigger]);

  useEffect(() => {
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
}
