"use client";

import { m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type MotionSurfaceProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function MotionSurface({
  children,
  className,
  delay = 0,
}: MotionSurfaceProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <m.div
      className={className}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.38,
        delay: prefersReducedMotion ? 0 : delay,
      }}
    >
      {children}
    </m.div>
  );
}
