"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface DottedWaveCanvasProps {
  className?: string;
}

export default function DottedWaveCanvas({ className = "" }: DottedWaveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement || window;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let time = 0;
    let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);
    };

    const handleMouseMove = (e: MouseEvent | Event) => {
      const mouseEvent = e as MouseEvent;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = mouseEvent.clientX - rect.left;
      mouse.targetY = mouseEvent.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    parent.addEventListener("mousemove", handleMouseMove);
    parent.addEventListener("mouseleave", handleMouseLeave);

    const isDark = resolvedTheme === "dark";
    const dotBaseColor = isDark ? "255, 255, 255" : "15, 23, 42";

    const render = () => {
      time += 0.016;
      
      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      ctx.clearRect(0, 0, width, height);

      const spacing = 13; // spacing between dots in px
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      const centerY = height * 0.48;

      for (let i = 0; i < cols; i++) {
        const x = i * spacing;

        // Wave profile along X axis
        const normX = x / width;
        
        // Multi-frequency wave formula simulating frequency waveform & tech matrix
        const wave1 = Math.sin(normX * 9 - time * 1.5) * 0.45;
        const wave2 = Math.sin(normX * 18 + time * 1.1) * 0.25;
        const wave3 = Math.cos(normX * 4 - time * 0.7) * 0.35;
        const waveCombined = wave1 + wave2 + wave3;

        for (let j = 0; j < rows; j++) {
          const y = j * spacing;
          
          // Wave envelope that concentrates large dots in a dynamic horizontal ribbon
          const bandInfluence = Math.exp(-Math.pow((y - (centerY + waveCombined * 70)) / (height * 0.22), 2));
          
          // Subtle secondary radial ripple
          const ripple = Math.sin((x * 0.03) + (y * 0.03) - time * 1.8) * 0.3 + 0.3;

          // Mouse proximity calculation
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const mouseDist = Math.sqrt(dx * dx + dy * dy);
          const mouseFactor = Math.max(0, 1 - mouseDist / 120);

          // Calculate radius & alpha
          const baseRadius = 0.75;
          const waveRadius = bandInfluence * 2.8 + ripple * 0.4;
          const radius = Math.max(0.6, Math.min(3.8, baseRadius + waveRadius + mouseFactor * 1.8));

          const baseAlpha = 0.08;
          const waveAlpha = bandInfluence * 0.65 + ripple * 0.15;
          const alpha = Math.max(0.04, Math.min(0.92, baseAlpha + waveAlpha + mouseFactor * 0.3));

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${dotBaseColor}, ${alpha})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      parent.removeEventListener("mousemove", handleMouseMove);
      parent.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ display: "block" }}
    />
  );
}
