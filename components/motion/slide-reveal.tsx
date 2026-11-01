"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";

import {
  MOTION_DURATION,
  STANDARD_EASING,
  SUMMARY_REVEAL,
} from "@/lib/motion/constants";
import type { SlideRevealProps } from "./types";

export function SlideReveal({
  isVisible,
  className,
  children,
}: SlideRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {isVisible && (
        <m.span
          key="reveal"
          className={className}
          initial={
            prefersReducedMotion
              ? false
              : {
                  y: SUMMARY_REVEAL.entryOffset,
                }
          }
          animate={{ y: "0%" }}
          exit={{ y: SUMMARY_REVEAL.exitOffset }}
          transition={{
            duration: prefersReducedMotion ? 0 : MOTION_DURATION.summaryReveal,
            delay: prefersReducedMotion ? 0 : SUMMARY_REVEAL.delay,
            ease: STANDARD_EASING,
          }}
        >
          {children}
        </m.span>
      )}
    </AnimatePresence>
  );
}
