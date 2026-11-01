"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import clsx from "clsx";

import { HIGH_PROTEIN_THRESHOLD_GRAMS } from "@/lib/dining/protein-options";
import { MOTION_DURATION } from "@/lib/motion/constants";
import type { HighProteinIndicatorProps } from "./types";

export function HighProteinIndicator({
  mealPeriod,
  foods,
}: HighProteinIndicatorProps) {
  const prefersReducedMotion = useReducedMotion();
  const label = `${mealPeriod}: ${HIGH_PROTEIN_THRESHOLD_GRAMS}g+ protein options`;
  const foodSummary = foods
    .map((food) => `${food.foodName} (${food.proteinGrams}g)`)
    .join(", ");

  return (
    <AnimatePresence initial={false}>
      {foods.length > 0 && (
        <m.span
          key="high-protein"
          className={clsx(
            "inline-flex shrink-0 items-center",
            "text-amber-400/75",
          )}
          role="img"
          aria-label={label}
          title={`${label}, without active dietary warnings: ${foodSummary}.`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : MOTION_DURATION.availability,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-3.5"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M13.5 2 4 14h6l-.5 8L20 10h-6l-.5-8Z" />
          </svg>
        </m.span>
      )}
    </AnimatePresence>
  );
}
