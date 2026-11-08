import React, { useEffect, useMemo, useState } from "react";
import { getEffectSpec } from "@yehgs/icvng-core/campaigns";

/**
 * Decorative snowfall / sparkle overlay. Purely cosmetic:
 *  - aria-hidden, pointer-events:none, fixed behind modals (z-index 30)
 *  - bounded particle count from the shared core spec (<= 60)
 *  - CSS transform/opacity animation only (no JS loop to leak)
 *  - renders NOTHING for prefers-reduced-motion, hidden tabs or NONE effect
 *  - removed the moment the campaign ends / is paused (parent unmounts it)
 */
const rand = (seed) => {
  // Deterministic pseudo-random so particles don't reshuffle on every render.
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

export default function SeasonalEffect({ theme }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hidden, setHidden] = useState(typeof document !== "undefined" && document.visibilityState === "hidden");
  const [area, setArea] = useState(typeof window !== "undefined" ? window.innerWidth * window.innerHeight : 800 * 600);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(!!mq?.matches);
    sync();
    mq?.addEventListener?.("change", sync);
    const onVis = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVis);
    const onResize = () => setArea(window.innerWidth * window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => {
      mq?.removeEventListener?.("change", sync);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const lowPower = typeof navigator !== "undefined" && (navigator.hardwareConcurrency || 8) <= 2;
  const spec = useMemo(
    () => getEffectSpec({ theme, reducedMotion, hidden, lowPower, areaPx: area }),
    [theme, reducedMotion, hidden, lowPower, area],
  );

  const particles = useMemo(() => {
    if (!spec.enabled) return [];
    return Array.from({ length: spec.count }, (_, i) => {
      const size = spec.minSize + rand(i + 1) * (spec.maxSize - spec.minSize);
      return {
        key: i,
        left: `${(rand(i + 11) * 100).toFixed(2)}%`,
        size: Math.round(size * 10) / 10,
        duration: Math.round(spec.minDurationMs + rand(i + 31) * (spec.maxDurationMs - spec.minDurationMs)),
        delay: -Math.round(rand(i + 51) * spec.maxDurationMs),
        drift: Math.round((rand(i + 71) - 0.5) * 80),
        opacity: 0.45 + rand(i + 91) * 0.45,
      };
    });
  }, [spec]);

  if (!spec.enabled) return null;
  const sparkle = spec.kind === "SPARKLE";

  return (
    <div className="campaign-effect" aria-hidden="true" data-effect={spec.kind}>
      <style>{`
        .campaign-effect{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:30}
        .campaign-flake{position:absolute;top:-12px;border-radius:50%;background:#fff;box-shadow:0 0 4px rgba(0,0,0,.18);will-change:transform,opacity;animation-name:campaign-fall;animation-timing-function:linear;animation-iteration-count:infinite}
        .campaign-flake.sparkle{top:auto;background:var(--campaign-accent,#f2b84b);animation-name:campaign-twinkle;animation-timing-function:ease-in-out}
        @keyframes campaign-fall{from{transform:translate3d(0,-5vh,0)}to{transform:translate3d(var(--drift),105vh,0)}}
        @keyframes campaign-twinkle{0%,100%{opacity:0;transform:scale(.4)}50%{opacity:1;transform:scale(1)}}
        @media (prefers-reduced-motion: reduce){.campaign-effect{display:none}}
      `}</style>
      {particles.map((p) => (
        <span
          key={p.key}
          className={`campaign-flake${sparkle ? " sparkle" : ""}`}
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            "--drift": `${p.drift}px`,
            animationDuration: `${p.duration}ms`,
            animationDelay: `${p.delay}ms`,
            ...(sparkle ? { top: `${Math.round(rand(p.key + 5) * 90)}%` } : null),
          }}
        />
      ))}
    </div>
  );
}
