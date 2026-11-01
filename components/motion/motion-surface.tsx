"use client";

import { m, useReducedMotion } from "framer-motion";
import type { MotionSurfaceProps } from "./types";
import { MOTION_DURATION, MOTION_OFFSET } from "@/lib/motion/constants";

export function MotionSurface({
  children,
  className,
  delay = 0,
}: MotionSurfaceProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <m.div
      className={className}
      initial={
        prefersReducedMotion
          ? false
          : { opacity: 0, y: MOTION_OFFSET.surfaceEnter }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0 : MOTION_DURATION.surface,
        delay: prefersReducedMotion ? 0 : delay,
      }}
    >
      {children}
    </m.div>
  );
}
