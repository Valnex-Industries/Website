"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/utils/cn";

/**
 * Number of copies rendered in the track. Translating the track by
 * -(100 / COPIES)% moves it by exactly one copy, so the loop is seamless.
 */
const COPIES = 4;

interface MarqueeProps {
  text: string;
  /**
   * Shared 0 → 1 loop driver. Two marquees fed the same MotionValue stay
   * pixel-perfectly in sync, which is what lets the outline track inside the
   * video sit exactly on top of the filled track behind it.
   */
  progress: MotionValue<number>;
  outline?: boolean;
  stroke?: string;
  className?: string;
  /** Trailing gap between copies. */
  gap?: string;
}

export function Marquee({
  text,
  progress,
  outline = false,
  stroke = "1.5px rgba(255,255,255,0.92)",
  className,
  gap = "4vw",
}: MarqueeProps) {
  const x = useTransform(progress, (v) => `${-(v * (100 / COPIES))}%`);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex w-full select-none overflow-hidden whitespace-nowrap pointer-events-none",
        className,
      )}
    >
      <motion.div className="flex shrink-0 will-change-transform" style={{ x }}>
        {Array.from({ length: COPIES }, (_, i) => (
          <span
            key={i}
            className="shrink-0 whitespace-nowrap"
            style={{
              paddingRight: gap,
              ...(outline
                ? { color: "transparent", WebkitTextStroke: stroke }
                : null),
            }}
          >
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
