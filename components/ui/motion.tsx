"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const motionTokens = {
  ease: "power3.out",
  fast: 0.22,
  standard: 0.5,
  slow: 0.8,
} as const;

export function Reveal({
  children,
  className,
  stagger = false,
}: Readonly<{ children: React.ReactNode; className?: string; stagger?: boolean }>) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      const targets = stagger ? Array.from(root.current?.children ?? []) : root.current;
      gsap.fromTo(targets, { autoAlpha: 0, y: 20 }, {
        autoAlpha: 1, y: 0, duration: motionTokens.standard, ease: motionTokens.ease,
        stagger: stagger ? 0.1 : 0,
        scrollTrigger: { trigger: root.current, start: "top 86%", once: true },
      });
    }, root);
    return () => context.revert();
  }, [stagger]);
  return <div className={className} ref={root}>{children}</div>;
}
