"use client";

import { useEffect, useRef, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Optional stagger delay in ms (kept subtle). */
  delay?: number;
};

/**
 * Gentle scroll reveal (fade + 20px slide). The hiding class is only applied
 * after mount, so content is always visible without JS and to crawlers.
 * Fully disabled under prefers-reduced-motion.
 */
export function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Never hide content when IO is unavailable (older browsers / WebViews)
    // or if anything throws — the reveal animation is enhancement-only.
    if (typeof IntersectionObserver === "undefined") return;

    try {
      el.classList.add("reveal");
      let done = false;
      const show = () => {
        if (done) return;
        done = true;
        el.classList.add("reveal-visible");
        observer.disconnect();
      };
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) show();
          }
        },
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
      );
      observer.observe(el);
      // Watchdog: content must never stay hidden, even if the observer
      // misses its callback (janky devices, suspended tabs, forced jank).
      const watchdog = window.setTimeout(show, 6000);
      return () => {
        window.clearTimeout(watchdog);
        observer.disconnect();
      };
    } catch {
      el.classList.remove("reveal");
      return;
    }
  }, []);

  return (
    <div ref={ref} className={className} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
