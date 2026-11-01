"use client";

import { m, useReducedMotion } from "framer-motion";

import { SlideReveal } from "@/components/motion/slide-reveal";
import { formatNutrient } from "@/lib/nutrition/format";
import {
  COLLAPSED_CALORIES_OFFSET_PX,
  MOTION_DURATION,
  STANDARD_EASING,
} from "@/lib/motion/constants";
import { nutritionStyles as styles } from "./styles";
import type { NutritionSummaryProps } from "./types";

export function NutritionSummary({
  calories,
  proteinGrams,
  isExpanded,
}: NutritionSummaryProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <span className={styles.summary}>
      <m.span
        className={styles.metric}
        initial={false}
        animate={{ x: isExpanded ? 0 : -COLLAPSED_CALORIES_OFFSET_PX }}
        transition={{
          duration: prefersReducedMotion ? 0 : MOTION_DURATION.cardCollapse,
          ease: STANDARD_EASING,
        }}
      >
        <span className={styles.metricLabel}>Calories</span>
        <span className={styles.caloriesValue}>{formatNutrient(calories)}</span>
      </m.span>

      <span className={styles.proteinViewport} aria-hidden={isExpanded}>
        <SlideReveal isVisible={!isExpanded} className={styles.proteinSummary}>
          <span className={styles.proteinLabel}>Protein</span>
          <span className={styles.proteinValue}>
            {formatNutrient(proteinGrams, "g")}
          </span>
        </SlideReveal>
      </span>
    </span>
  );
}
