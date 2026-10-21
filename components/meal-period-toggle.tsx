"use client";

import { m, useReducedMotion } from "framer-motion";
import Link from "next/link";
import clsx from "clsx";

import { MEAL_PERIODS, type MealPeriod } from "@/lib/dining-page";

type MealPeriodToggleProps = {
  selectedHallName?: string;
  selectedMeal: MealPeriod;
};

const styles = {
  wrapper: clsx(
    "flex w-full flex-col items-center gap-2",
    "sm:flex-row sm:justify-center sm:gap-3",
  ),
  label: clsx(
    "text-[11px] font-semibold uppercase tracking-[0.16em] text-muted",
  ),
  control: clsx(
    "isolate grid w-full max-w-sm grid-cols-4 items-center gap-0.5 sm:w-auto sm:max-w-none",
  ),
  option: clsx(
    "relative isolate sm:min-w-20",
    "px-2 py-1.5 sm:px-3",
    "rounded-sm",
    "text-center text-sm font-semibold",
    "transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent",
  ),
  selectedOption: "text-accent",
  idleOption: "text-muted hover:text-foreground",
  selectionBackground: clsx(
    "absolute inset-0 -z-10",
    "rounded-sm bg-princeton/12",
  ),
};

export function MealPeriodToggle({
  selectedHallName,
  selectedMeal,
}: MealPeriodToggleProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <m.div
      className={styles.wrapper}
      initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
    >
      <span className={styles.label}>Meal period</span>
      <nav className={styles.control} aria-label="Choose a meal period">
        {MEAL_PERIODS.map((period) => {
          const isSelected = period === selectedMeal;
          const query = selectedHallName
            ? { hall: selectedHallName, meal: period.toLowerCase() }
            : { meal: period.toLowerCase() };

          return (
            <Link
              key={period}
              href={{ pathname: "/", query }}
              scroll={false}
              className={clsx(
                styles.option,
                isSelected ? styles.selectedOption : styles.idleOption,
              )}
              aria-current={isSelected ? "page" : undefined}
            >
              {isSelected && (
                <m.span
                  layoutId="selected-meal-period"
                  className={styles.selectionBackground}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 34 }
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
