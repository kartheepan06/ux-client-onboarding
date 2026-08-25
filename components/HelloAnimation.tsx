"use client";

import { useEffect, useRef, useState } from "react";

interface HelloAnimationProps {
  width?: number;
  className?: string;
  fps?: number;
  frameCount?: number;
}

const NATIVE_W = 1280;
const NATIVE_H = 720;

/**
 * Plays a sequence of transparent WebP frames on an HTML Canvas.
 * - Preloads all frames on mount
 * - Plays forward when in viewport, pauses (holds current frame) when out
 * - Restarts from frame 0 if scrolled back into view after completing
 * - Respects prefers-reduced-motion (shows final frame immediately)
 * - DPR-aware for crisp rendering, no layout shift
 * - Firefox-compatible: stable indices, naturalWidth check
 */
export default function HelloAnimation({
  width = 320,
  className = "",
  fps = 8,
  frameCount = 80,
}: HelloAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const rafRef = useRef<number>(0);
  const currentFrameRef = useRef(0);
  const isPlayingRef = useRef(false);
  const lastTsRef = useRef<number>(0);

  const [firstReady, setFirstReady] = useState(false);

  /* Preload frames — using per-index closure to avoid Firefox stale-index bugs */
  useEffect(() => {
    let cancelled = false;
    const images: HTMLImageElement[] = new Array(frameCount);

    const loadOne = (index: number) => {
      const img = new Image();
      const src = `/animations/hello/frame-${String(index + 1).padStart(3, "0")}.webp`;
      img.src = src;
      img.onload = () => {
        if (cancelled) return;
        if (index === 0) setFirstReady(true);
      };
      img.onerror = () => {
        // eslint-disable-next-line no-console
        console.warn(`[HelloAnimation] Failed to load ${src}`);
      };
      images[index] = img;
    };

    for (let i = 0; i < frameCount; i++) loadOne(i);
    framesRef.current = images;

    return () => { cancelled = true; };
  }, [frameCount]);

  const sizeCanvas = () => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = wrapper.clientWidth;
    const cssH = (cssW * NATIVE_H) / NATIVE_W;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
  };

  const drawFrame = (idx: number) => {
    const canvas = canvasRef.current;
    const img = framesRef.current[idx];
    if (!canvas || !img) return;
    if (!img.complete || img.naturalWidth === 0) return;
    // willReadFrequently: false — hint that we only draw, never readPixels.
    // Enables browser's GPU-backed path (Firefox especially benefits).
    const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: false });
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    try {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      currentFrameRef.current = idx;
    } catch {
      // Firefox rarely throws on partial-decode; skip this frame silently.
    }
  };

  /* Draw first frame the moment it decodes */
  useEffect(() => {
    if (!firstReady) return;
    sizeCanvas();
    drawFrame(0);
  }, [firstReady]);

  /* Viewport observer + play/pause loop */
  useEffect(() => {
    if (!firstReady) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      const waitForLast = () => {
        const last = framesRef.current[frameCount - 1];
        if (last?.complete && last.naturalWidth > 0) {
          drawFrame(frameCount - 1);
        } else {
          setTimeout(waitForLast, 100);
        }
      };
      waitForLast();
      return;
    }

    const frameDuration = 1000 / fps;

    const tick = (ts: number) => {
      if (!isPlayingRef.current) return;
      const elapsed = ts - lastTsRef.current;
      if (elapsed >= frameDuration) {
        lastTsRef.current = ts;
        const nextIdx = currentFrameRef.current + 1;
        if (nextIdx < frameCount) {
          drawFrame(nextIdx);
        } else {
          isPlayingRef.current = false;
          return; // hold last frame
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const startPlaying = () => {
      if (isPlayingRef.current) return;
      // If finished last time, restart from frame 0
      if (currentFrameRef.current >= frameCount - 1) {
        drawFrame(0);
      }
      isPlayingRef.current = true;
      lastTsRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    };

    const stopPlaying = () => {
      isPlayingRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) startPlaying();
        else stopPlaying();
      },
      { threshold: 0.3 }
    );

    observer.observe(wrapper);

    const onResize = () => {
      sizeCanvas();
      drawFrame(currentFrameRef.current);
    };
    window.addEventListener("resize", onResize);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [firstReady, fps, frameCount]);

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{
        width: `${width}px`,
        maxWidth: "100%",
        aspectRatio: `${NATIVE_W} / ${NATIVE_H}`,
        // Padding-hack fallback for browsers without aspect-ratio (iOS Safari <15)
        position: "relative",
      }}
    >
      {/* Reserve space via padding-bottom trick when aspect-ratio unsupported */}
      <div
        style={{
          paddingBottom: `${(NATIVE_H / NATIVE_W) * 100}%`,
          width: "100%",
        }}
        aria-hidden="true"
      />
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          background: "transparent",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
