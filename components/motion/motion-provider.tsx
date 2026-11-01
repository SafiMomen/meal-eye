"use client";

import { LazyMotion, MotionConfig, domMax } from "framer-motion";
import type { ChildrenProps } from "@/types/ui";
import { MOTION_DURATION, STANDARD_EASING } from "@/lib/motion/constants";

export function MotionProvider({ children }: ChildrenProps) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig
        reducedMotion="user"
        transition={{
          duration: MOTION_DURATION.default,
          ease: STANDARD_EASING,
        }}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
