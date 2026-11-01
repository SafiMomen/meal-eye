import { MOTION_DURATION, STANDARD_EASING } from "./constants.ts";

export function getMenuEnterTransition(prefersReducedMotion: boolean | null) {
  return {
    duration: prefersReducedMotion ? 0 : MOTION_DURATION.menuEnter,
    ease: STANDARD_EASING,
  };
}
