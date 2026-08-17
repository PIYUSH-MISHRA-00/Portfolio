"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Adds `.shown` once an element scrolls into view. Replaces an animation library
 * with the platform's own IntersectionObserver.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Honour reduced-motion by showing immediately.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("shown");
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("shown");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}

/** Reads/writes a value in localStorage and mirrors it onto <html data-*>. */
export function useHtmlFlag(attribute: string, fallback: string) {
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    const stored = localStorage.getItem(attribute);
    if (stored) setValue(stored);
  }, [attribute]);

  useEffect(() => {
    document.documentElement.setAttribute(`data-${attribute}`, value);
    localStorage.setItem(attribute, value);
  }, [attribute, value]);

  return [value, setValue] as const;
}

/** Tracks which section is on screen so the nav can highlight it. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const nodes = ids.map((id) => document.getElementById(id)).filter((n): n is HTMLElement => Boolean(n));
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        // The entry closest to the top of the viewport wins.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [ids]);

  return active;
}

/** Counts up to `to` when the element is first seen. Skipped for reduced motion. */
export function useCountUp(to: number, durationMs = 1100) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(to);
      return;
    }

    let frame = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        // easeOutExpo: fast start, settled finish.
        setValue(Math.round(to * (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to, durationMs]);

  return [value, ref] as const;
}
