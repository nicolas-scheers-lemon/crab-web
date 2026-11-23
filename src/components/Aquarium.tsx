"use client";

import { useEffect, useRef } from "react";
import { createWorld, drawWorld, dropFood, resizeWorld, screenToWorld, updateWorld } from "./aquarium/world";

export function Aquarium() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const world = createWorld();

    const resize = () => {
      resizeWorld(world, window.innerWidth, window.innerHeight);
      canvas.width = world.W;
      canvas.height = world.H;
      canvas.style.width = `${world.W * world.scale}px`;
      canvas.style.height = `${world.H * world.scale}px`;
      ctx.imageSmoothingEnabled = false;
    };
    resize();
    window.addEventListener("resize", resize);

    const onPointerDown = (e: PointerEvent) => {
      dropFood(world, screenToWorld(world, canvas, e.clientX, e.clientY));
    };
    canvas.addEventListener("pointerdown", onPointerDown);

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      updateWorld(world, dt);
      drawWorld(ctx, world);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return <canvas ref={canvasRef} className="block touch-none" style={{ imageRendering: "pixelated" }} />;
}
