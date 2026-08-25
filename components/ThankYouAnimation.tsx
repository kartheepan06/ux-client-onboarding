"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

interface ThankYouAnimationProps {
  /** Display width in px. Height auto-derived from Lottie JSON aspect ratio. */
  width?: number;
  className?: string;
  /** Whether to loop. Default true. */
  loop?: boolean;
}

/**
 * Loads /public/animations/thank-you.json and plays it inline.
 * - Lazy-loads the JSON on mount (doesn't ship in main bundle)
 * - Respects prefers-reduced-motion (shows a static poster of frame 0)
 * - Falls back gracefully if the JSON file is missing/invalid
 * - Transparent background — inherits the card behind it
 */
export default function ThankYouAnimation({
  width = 200,
  className = "",
  loop = true,
}: ThankYouAnimationProps) {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setReducedMotion(
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
      );
    }

    fetch("/animations/thank-you.json")
      .then((res) => {
        if (!res.ok) throw new Error("Lottie file not found");
        return res.json();
      })
      .then((json) => setAnimationData(json))
      .catch(() => setFailed(true));
  }, []);

  if (failed || !animationData) {
    return (
      <div
        style={{ width: `${width}px`, maxWidth: "100%", aspectRatio: "1 / 1" }}
        className={className}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      style={{ width: `${width}px`, maxWidth: "100%" }}
      className={className}
    >
      <Lottie
        animationData={animationData}
        loop={reducedMotion ? false : loop}
        autoplay={!reducedMotion}
        rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
      />
    </div>
  );
}
