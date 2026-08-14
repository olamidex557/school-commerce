"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { motionTokens } from "./motion";

export function PageTransition({ children }: Readonly<{ children: React.ReactNode }>) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useLayoutEffect(() => {
    if (!root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => gsap.fromTo(root.current, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: motionTokens.fast, ease: motionTokens.ease }), root);
    return () => context.revert();
  }, [pathname]);
  return <div className="page-shell" ref={root}>{children}</div>;
}
