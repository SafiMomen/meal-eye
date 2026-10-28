"use client";

import { LayoutGroup, m, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import clsx from "clsx";

import { ReligiousTagBadge } from "@/components/religious-tag-badge";
import { useDietaryPreferences } from "@/components/dietary-preferences-provider";
import type { MealPeriod } from "@/lib/dining-page";
import type { ReligiousTagReason } from "@/lib/dining-types";

type DiningHallSelectionRowProps = {
  hallName: string;
  selectedMeal: MealPeriod;
  isSelected: boolean;
  availability: "available" | "empty" | "unknown";
  haramEntreeReasons?: ReligiousTagReason[];
};

const styles = {
  row: "relative",
  link: clsx(
    "relative isolate flex w-full items-center justify-between gap-2",
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
    "absolute inset-0 -z-10",
    "rounded-sm bg-princeton/12",
  ),
  name: "min-w-0",
  tag: "absolute right-2.5 top-1/2 -translate-y-1/2",
};

export function DiningHallSelectionList({ children }: { children: ReactNode }) {
  return (
    <LayoutGroup id="dining-hall-selection">
      <ul className="space-y-0.5">{children}</ul>
    </LayoutGroup>
  );
}

export function DiningHallSelectionRow({
  hallName,
  selectedMeal,
  isSelected,
  availability,
  haramEntreeReasons = [],
}: DiningHallSelectionRowProps) {
  const prefersReducedMotion = useReducedMotion();
  const { preferences } = useDietaryPreferences();
  const isEmpty = availability === "empty";
  const showHaramTag = haramEntreeReasons.length > 0 && preferences.muslim;

  return (
    <m.li
      className={styles.row}
      initial={false}
      animate={{ opacity: isEmpty ? 0.4 : 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
    >
      {isEmpty ? (
        <span
          role="link"
          aria-disabled="true"
          aria-current={isSelected ? "page" : undefined}
          aria-label={`${hallName}: no menu periods listed`}
          className={clsx(styles.link, styles.disabled)}
          title="No menu periods are currently listed."
        >
          {hallName}
        </span>
      ) : (
        <>
          <Link
            href={{
              pathname: "/",
              query: { hall: hallName, meal: selectedMeal.toLowerCase() },
            }}
            prefetch={false}
            scroll={false}
            className={clsx(
              styles.link,
              showHaramTag && "pr-14",
              isSelected ? styles.selected : styles.idle,
            )}
            aria-current={isSelected ? "page" : undefined}
            title={
              availability === "unknown"
                ? "Menu availability not yet confirmed."
                : hallName
            }
          >
            {isSelected && (
              <m.span
                className={styles.selectionBackground}
                layoutId="selected-hall-background"
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 440, damping: 40 }
                }
                aria-hidden="true"
              />
            )}
            <span className={styles.name}>{hallName}</span>
          </Link>
          {showHaramTag && (
            <div className={styles.tag}>
              <ReligiousTagBadge
                tag="Haram"
                variant="text"
                foodName={`${hallName} ${selectedMeal.toLowerCase()} entrées`}
                reasons={haramEntreeReasons}
                title={`An entrée is flagged Haram for ${selectedMeal.toLowerCase()}.`}
              />
            </div>
          )}
        </>
      )}
    </m.li>
  );
}
