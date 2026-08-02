import React, { useCallback, useRef, type CSSProperties, type RefObject } from "react";

export interface LogoAnimationProps {
  /** Stroke + fill color of the mark. */
  logoColor?: string;
  /** Stage background color. */
  background?: string;
  /** Full cycle length in seconds. */
  duration?: number;
  /** Loop forever, or play once. */
  loop?: boolean;
  /** Show the "click to replay" caption. */
  showHint?: boolean;
  /** Width of the mark. Defaults to the full-screen sizing; pass "100%" to let
   *  it fill a parent that has its own dimensions. */
  size?: string;
}

/**
 * Animated "V" logo — outline draws in, then both shapes fill.
 * Click anywhere on the stage to replay.
 */
export default function LogoAnimation({
  logoColor = "#F6F7F9",
  background = "#0B32C4",
  duration = 4.4,
  loop = true,
  showHint = false,
  size = "min(52vh, 46vw)",
}: LogoAnimationProps) {
  const mainRef = useRef<SVGPathElement>(null);
  const arrowRef = useRef<SVGPathElement>(null);
  const settleRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const replay = useCallback(() => {
    const refs: RefObject<SVGElement | HTMLElement | null>[] = [
      settleRef,
      mainRef,
      arrowRef,
      labelRef,
    ];
    refs.forEach((r) => {
      const el = r.current;
      if (!el) return;
      const orig = el.style.animation;
      el.style.animation = "none";
      el.getBoundingClientRect(); // force reflow
      el.style.animation = orig;
    });
  }, []);

  const anim = (name: string, ease: string): string =>
    `${name} ${duration}s ${ease} ${loop ? "infinite" : "1"} both`;

  const pathBase: CSSProperties = {
    fill: logoColor,
    fillOpacity: 0,
    stroke: logoColor,
    strokeWidth: 9,
    strokeLinejoin: "round",
    strokeDasharray: "1 1",
    strokeDashoffset: 1,
  };

  return (
    <div
      onClick={replay}
      style={{
        /* Fills its parent rather than the viewport, so the mark can sit in
           normal flow above other content instead of needing an overlay. */
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        background,
        cursor: "pointer",
        userSelect: "none",
        overflow: "hidden",
      }}
    >
      <style>{KEYFRAMES}</style>

      <div
        ref={settleRef}
        style={{
          width: size,
          aspectRatio: "1.1 / 1",
          animation: anim("vSettle", "cubic-bezier(0.22,1,0.36,1)"),
        }}
      >
        <svg
          viewBox="330 380 1280 1165"
          style={{ width: "100%", height: "100%", display: "block", overflow: "visible" }}
        >
          <path
            ref={mainRef}
            d="M385,433 L782,433 L1170,1140 L975,1492 Z"
            pathLength={1}
            style={{ ...pathBase, animation: anim("vInkMain", "cubic-bezier(0.65,0,0.35,1)") }}
          />
          <path
            ref={arrowRef}
            d="M1055,433 L1560,433 L1295,895 L1295,600 Z"
            pathLength={1}
            style={{ ...pathBase, animation: anim("vInkArrow", "cubic-bezier(0.65,0,0.35,1)") }}
          />
        </svg>
      </div>

      {showHint && (
        <div
          ref={labelRef}
          style={{
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 12,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)",
            animation: anim("vLabel", "ease"),
          }}
        >
          click to replay
        </div>
      )}
    </div>
  );
}

const KEYFRAMES = `
@keyframes vInkMain {
  0%   { opacity: 1; stroke-dashoffset: 1; fill-opacity: 0; }
  34%  { stroke-dashoffset: 0; fill-opacity: 0; }
  56%  { fill-opacity: 0; }
  76%  { fill-opacity: 1; }
  100% { opacity: 1; fill-opacity: 1; stroke-dashoffset: 0; }
}
@keyframes vInkArrow {
  0%   { opacity: 1; stroke-dashoffset: 1; fill-opacity: 0; }
  24%  { stroke-dashoffset: 1; fill-opacity: 0; }
  50%  { stroke-dashoffset: 0; fill-opacity: 0; }
  56%  { fill-opacity: 0; }
  76%  { fill-opacity: 1; }
  100% { opacity: 1; fill-opacity: 1; stroke-dashoffset: 0; }
}
@keyframes vSettle {
  0%, 74% { transform: scale(1); }
  80%     { transform: scale(1.008); }
  90%     { transform: scale(1); }
  100%    { transform: scale(1); }
}
@keyframes vLabel {
  0%, 84% { opacity: 0; }
  100% { opacity: 1; }
}
`;
