"use client";

import { useEffect, useRef } from "react";

type DitherShape = "wave" | "circle" | "spiral" | "grid" | "noise";
type DitherMatrixSize = "2x2" | "4x4" | "8x8";

interface DitheringShaderProps {
  shape?: DitherShape;
  type?: DitherMatrixSize;
  colorBack?: string;
  colorFront?: string;
  pxSize?: number;
  speed?: number;
  className?: string;
}

const DITHER_MATRICES: Record<DitherMatrixSize, number[][]> = {
  "2x2": [
    [0, 2],
    [3, 1],
  ],
  "4x4": [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ],
  "8x8": [
    [0, 32, 8, 40, 2, 34, 10, 42],
    [48, 16, 56, 24, 50, 18, 58, 26],
    [12, 44, 4, 36, 14, 46, 6, 38],
    [60, 28, 52, 20, 62, 30, 54, 22],
    [3, 35, 11, 43, 1, 33, 9, 41],
    [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47, 7, 39, 13, 45, 5, 37],
    [63, 31, 55, 23, 61, 29, 53, 21],
  ],
};

function sampleShape(shape: DitherShape, nx: number, ny: number, time: number): number {
  switch (shape) {
    case "wave":
      return (
        (Math.sin(nx * 10 + time) * 0.5 + 0.5 + Math.cos(ny * 8 - time * 0.8) * 0.5 + 0.5) / 2
      );
    case "circle": {
      const dx = nx - 0.5;
      const dy = ny - 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return (Math.sin(dist * 20 - time * 2) + 1) / 2;
    }
    case "spiral": {
      const dx = nx - 0.5;
      const dy = ny - 0.5;
      const angle = Math.atan2(dy, dx);
      const radius = Math.sqrt(dx * dx + dy * dy);
      return (Math.sin(angle * 5 + radius * 15 - time * 2) + 1) / 2;
    }
    case "grid":
      return (Math.sin(nx * 15 + time) * Math.cos(ny * 15 - time) + 1) / 2;
    case "noise":
      return (
        (Math.sin(nx * 20 + time) *
          Math.cos(ny * 15 + time * 0.7) *
          Math.sin((nx + ny) * 10 - time * 1.5) +
          1) /
        2
      );
  }
}

export function DitheringShader({
  shape = "wave",
  type = "8x8",
  colorBack = "#05050d",
  colorFront = "#22c55e",
  pxSize = 3,
  speed = 0.6,
  className,
}: DitheringShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const matrix = DITHER_MATRICES[type];
    const matrixSize = matrix.length;
    const maxValue = matrixSize * matrixSize;

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += speed * 0.01;

      ctx.fillStyle = colorBack;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let y = 0; y < canvas.height; y += pxSize) {
        for (let x = 0; x < canvas.width; x += pxSize) {
          const nx = x / canvas.width;
          const ny = y / canvas.height;
          const value = sampleShape(shape, nx, ny, time);

          const threshold =
            matrix[Math.floor(y / pxSize) % matrixSize][Math.floor(x / pxSize) % matrixSize] /
            maxValue;

          if (value > threshold) {
            ctx.fillStyle = colorFront;
            ctx.fillRect(x, y, pxSize, pxSize);
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [shape, type, colorBack, colorFront, pxSize, speed]);

  return <canvas ref={canvasRef} className={className ?? "w-full h-full"} />;
}
