"use client";

import { m, useReducedMotion } from "framer-motion";
import Link from "next/link";
import clsx from "clsx";

import { createDiningHref } from "@/lib/dining/meal-periods";
import {
  MEAL_SELECTION_SPRING,
  MOTION_DURATION,
  MOTION_OFFSET,
} from "@/lib/motion/constants";
import type { MealPeriodToggleProps } from "./types";
import { selectionStyles } from "@/components/ui/selection-styles";

const styles = {
  wrapper: clsx(
    "flex w-full flex-col items-center gap-2 sm:w-auto",
    "sm:flex-row sm:justify-center sm:gap-3",
  ),
  label: clsx(
    "text-[11px] font-semibold uppercase tracking-[0.16em] text-muted",
  ),
  control: clsx(
    "isolate grid w-full max-w-sm items-center gap-0.5",
    "sm:w-auto sm:max-w-none",
  ),
};

export function MealPeriodToggle({
  selectedHallName,
  selectedMeal,
  mealPeriods,
}: MealPeriodToggleProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <m.div
      className={styles.wrapper}
      initial={
        prefersReducedMotion
          ? false
          : { opacity: 0, y: MOTION_OFFSET.mealToggleEnter }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0 : MOTION_DURATION.mealToggle,
      }}
    >
      <span className={styles.label}>Meal period</span>
      <nav
        className={styles.control}
        style={{ gridTemplateColumns: `repeat(${mealPeriods.length}, 1fr)` }}
        aria-label="Choose a meal period"
      >
        {mealPeriods.map((period) => {
          const isSelected = period === selectedMeal;

          return (
            <Link
              key={period}
              href={createDiningHref(period, selectedHallName)}
              scroll={false}
              className={clsx(
                selectionStyles.option,
                "sm:min-w-20",
                isSelected ? selectionStyles.selected : selectionStyles.idle,
              )}
              aria-current={isSelected ? "page" : undefined}
            >
              {isSelected && (
                <m.span
                  layoutId="selected-meal-period"
                  className={selectionStyles.background}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : MEAL_SELECTION_SPRING
                  }
                  aria-hidden="true"
                />
              )}
              <span className="relative">{period}</span>
            </Link>
          );
        })}
      </nav>
    </m.div>
  );
}
