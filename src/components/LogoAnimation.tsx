"use client";

import React, { useCallback, useRef, type RefObject } from "react";
import Image from "next/image";

export interface LogoAnimationProps {
  /** Stroke + fill color of the mark (preserved for API compatibility). */
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
 * Animated 3D Valnex Emblem loading animation —
 * Scales up smoothly with an ambient back-glow and metallic light shine reflection.
 * Click anywhere on the stage to replay.
 */
export default function LogoAnimation({
  background = "#0B32C4",
  duration = 1.6,
  loop = true,
  showHint = false,
  size = "min(52vh, 46vw)",
}: LogoAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const replay = useCallback(() => {
    const refs: RefObject<HTMLElement | null>[] = [
      containerRef,
      imageRef,
      shineRef,
      glowRef,
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

  return (
    <div
      onClick={replay}
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        background,
        cursor: "pointer",
        userSelect: "none",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{KEYFRAMES}</style>

      <div
        ref={containerRef}
        style={{
          width: size,
          aspectRatio: "1 / 1",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Soft atmospheric aura glow behind the 3D chrome emblem */}
        <div
          ref={glowRef}
          style={{
            position: "absolute",
            inset: "-14%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0, 162, 255, 0.45) 0%, rgba(0, 71, 225, 0.2) 48%, transparent 72%)",
            filter: "blur(22px)",
            pointerEvents: "none",
            animation: anim("vAura", "ease-in-out"),
          }}
        />

        {/* 3D Emblem Image with Scale & Shine Reveal */}
        <div
          ref={imageRef}
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            animation: anim("vScaleIn", "cubic-bezier(0.16, 1, 0.3, 1)"),
          }}
        >
          <Image
            src="/assets/valnex-logo.webp"
            alt="Valnex Emblem"
            fill
            sizes="300px"
            priority
            className="object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
          />

          {/* Sweeping metallic specular light bar */}
          <div
            ref={shineRef}
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              pointerEvents: "none",
              borderRadius: "16px",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "-120%",
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.2) 40%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0.2) 60%, transparent 80%)",
                transform: "skewX(-20deg)",
                animation: anim("vShine", "cubic-bezier(0.4, 0, 0.2, 1)"),
              }}
            />
          </div>
        </div>
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
@keyframes vScaleIn {
  0% {
    opacity: 0;
    transform: scale(0.65) translateY(10px);
    filter: brightness(0.6);
  }
  35% {
    opacity: 1;
    filter: brightness(1.15);
  }
  75% {
    transform: scale(1.02) translateY(0);
    filter: brightness(1);
  }
  90% {
    transform: scale(1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: brightness(1);
  }
}

@keyframes vAura {
  0% {
    opacity: 0;
    transform: scale(0.55);
  }
  45% {
    opacity: 0.85;
    transform: scale(1.1);
  }
  75% {
    opacity: 0.55;
    transform: scale(1);
  }
  100% {
    opacity: 0.65;
    transform: scale(1);
  }
}

@keyframes vShine {
  0%, 25% {
    left: "-120%";
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  75% {
    left: "140%";
    opacity: 1;
  }
  85%, 100% {
    left: "140%";
    opacity: 0;
  }
}

@keyframes vLabel {
  0%, 84% { opacity: 0; }
  100% { opacity: 1; }
}
`;
