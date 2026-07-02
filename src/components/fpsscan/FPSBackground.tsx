"use client";

import { useEffect, useRef } from "react";

const DITHER_MATRIX_8X8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

const COLOR_BACK = "#05050d";
const COLOR_FRONT = "#22c55e";
const PX_SIZE = 3;
const SPEED = 0.35;
const BASE_ALPHA = 0.09;
const FADE_END_Y = 0.55;

export default function FPSBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const matrix = DITHER_MATRIX_8X8;
    const matrixSize = matrix.length;
    const maxValue = matrixSize * matrixSize;

    let animationId: number;
    let time = 0;

    const drawFrame = () => {
      ctx.fillStyle = COLOR_BACK;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let y = 0; y < canvas.height; y += PX_SIZE) {
        for (let x = 0; x < canvas.width; x += PX_SIZE) {
          const nx = x / canvas.width;
          const ny = y / canvas.height;

          const verticalFade = Math.max(0, 1 - ny / FADE_END_Y);
          if (verticalFade <= 0) continue;

          const value =
            (Math.sin(nx * 9 + time) * 0.5 +
              0.5 +
              (Math.cos(ny * 7 - time * 0.8) * 0.5 + 0.5)) /
            2;

          const threshold =
            matrix[Math.floor(y / PX_SIZE) % matrixSize][
              Math.floor(x / PX_SIZE) % matrixSize
            ] / maxValue;

          if (value > threshold) {
            ctx.fillStyle = COLOR_FRONT;
            ctx.globalAlpha = BASE_ALPHA * verticalFade;
            ctx.fillRect(x, y, PX_SIZE, PX_SIZE);
            ctx.globalAlpha = 1;
          }
        }
      }
    };

    if (prefersReducedMotion) {
      drawFrame();
      return () => window.removeEventListener("resize", resizeCanvas);
    }

    const animate = () => {
      time += SPEED * 0.01;
      drawFrame();
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, transparent 30%, #05050d 60%)",
        }}
      />
    </div>
  );
}
