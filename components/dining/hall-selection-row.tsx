"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import Link from "next/link";
import clsx from "clsx";

import type { DiningHallSelectionRowProps } from "./types";
import { createDiningHref } from "@/lib/dining/meal-periods";
import { getDiningHallSidebarLabel } from "@/lib/dining/halls";
import { HALL_SELECTION_SPRING, MOTION_DURATION } from "@/lib/motion/constants";

import { DietaryTagList } from "@/components/dietary/tag-list";
import { useDietaryPreferences } from "@/hooks/use-dietary-preferences";
import { getEligibleHighProteinFoods } from "@/lib/dining/protein-options";
import { getHallDietaryWarnings } from "@/lib/dining/entree-tags";
import { HighProteinIndicator } from "./high-protein-indicator";

const styles = {
  row: "relative isolate flex items-center rounded-sm",
  link: clsx(
    "flex min-w-0 flex-1 items-center gap-1.5",
    "px-2.5 py-1.5",
    "rounded-sm",
    "text-left text-xs font-medium leading-4",
    "transition-colors duration-200",
    "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent",
  ),
  idle: "text-muted hover:text-foreground",
  selected: "text-accent",
  disabled: "cursor-default text-muted",
  selectionBackground: clsx(
    "pointer-events-none absolute inset-0 -z-10",
    "rounded-sm",
  ),
  proteinBackground: clsx(
    "pointer-events-none absolute inset-0 -z-10",
    "rounded-sm bg-linear-to-r from-amber-400/10 via-amber-400/3 to-transparent",
  ),
  name: "min-w-0",
  proteinSlot: "flex size-3.5 shrink-0 items-center justify-center",
  tags: "shrink-0 pr-2.5",
};

export function DiningHallSelectionRow({
  hallName,
  selectedMeal,
  isSelected,
  availability,
  entreeFoods = [],
  highProteinFoods = [],
}: DiningHallSelectionRowProps) {
  const prefersReducedMotion = useReducedMotion();
  const displayName = getDiningHallSidebarLabel(hallName);
  const { preferences, selectedRestrictions, calorieRange } =
    useDietaryPreferences();
  const isEmpty = availability === "empty";
  const warnings = getHallDietaryWarnings(
    entreeFoods,
    preferences,
    selectedRestrictions,
    calorieRange,
  );
  const eligibleProteinFoods = getEligibleHighProteinFoods(
    highProteinFoods,
    preferences,
    selectedRestrictions,
    calorieRange,
  );
  const hasProteinOptions = !isEmpty && eligibleProteinFoods.length > 0;

  return (
    <m.li
      className={styles.row}
      initial={false}
      animate={{ opacity: isEmpty ? 0.4 : 1 }}
      transition={{
        duration: prefersReducedMotion ? 0 : MOTION_DURATION.availability,
      }}
    >
      {isSelected && (
        <m.span
          className={clsx(
            styles.selectionBackground,
            !hasProteinOptions && "bg-princeton/12",
          )}
          layoutId="selected-hall-background"
          transition={
            prefersReducedMotion ? { duration: 0 } : HALL_SELECTION_SPRING
          }
          aria-hidden="true"
        />
      )}
      <m.span
        className={styles.proteinBackground}
        initial={false}
        animate={{ opacity: hasProteinOptions ? 1 : 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : MOTION_DURATION.availability,
        }}
        aria-hidden="true"
      />
      {isEmpty ? (
        <span
          role="link"
          aria-disabled="true"
          aria-current={isSelected ? "page" : undefined}
          aria-label={`${displayName}: no menu periods listed`}
          className={clsx(styles.link, styles.disabled)}
          title="No menu periods are currently listed."
        >
          <span className={styles.proteinSlot} aria-hidden="true" />
          <span className={styles.name}>{displayName}</span>
        </span>
      ) : (
        <>
          <Link
            href={createDiningHref(selectedMeal, hallName)}
            prefetch={false}
            scroll={false}
            className={clsx(
              styles.link,
              isSelected ? styles.selected : styles.idle,
            )}
            aria-current={isSelected ? "page" : undefined}
            title={
              availability === "unknown"
                ? "Menu availability not yet confirmed."
                : displayName
            }
          >
            <span className={styles.proteinSlot}>
              <HighProteinIndicator
                mealPeriod={selectedMeal}
                foods={eligibleProteinFoods}
              />
            </span>
            <span className={styles.name}>{displayName}</span>
          </Link>
          <AnimatePresence initial={false}>
            {warnings.tags.length > 0 && (
              <m.div
                key="dietary-warnings"
                className={styles.tags}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: prefersReducedMotion
                    ? 0
                    : MOTION_DURATION.availability,
                }}
              >
                <DietaryTagList
                  foodName={`${displayName} ${selectedMeal.toLowerCase()} entrées`}
                  tags={warnings.tags}
                  reasons={warnings.reasons}
                  restrictionMatches={warnings.restrictionMatches}
                  compact
                  abbreviated
                />
              </m.div>
            )}
          </AnimatePresence>
        </>
      )}
    </m.li>
  );
}
