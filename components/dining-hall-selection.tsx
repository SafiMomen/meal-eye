"use client";

import { LayoutGroup, m, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import clsx from "clsx";

import { ReligiousTagBadge } from "@/components/religious-tag-badge";
import type { MealPeriod } from "@/lib/dining-page";

type DiningHallSelectionRowProps = {
  hallName: string;
  selectedMeal: MealPeriod;
  isSelected: boolean;
  availability: "available" | "empty" | "unknown";
  hasHaramEntree?: boolean;
};

const styles = {
  row: "relative",
  link: clsx(
    "relative flex w-full items-center justify-between gap-3",
    "px-3 py-3",
    "text-left text-xs font-medium leading-relaxed",
    "transition-colors duration-200",
    "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent",
  ),
  idle: "text-muted hover:text-foreground",
  selected: "text-foreground",
  disabled: "cursor-default text-muted",
  marker: clsx(
    "absolute bottom-3 left-0 top-3 w-0.5",
    "bg-princeton",
  ),
  name: "min-w-0",
};

export function DiningHallSelectionList({ children }: { children: ReactNode }) {
  return (
    <LayoutGroup id="dining-hall-selection">
      <ul>{children}</ul>
    </LayoutGroup>
  );
}

export function DiningHallSelectionRow({
  hallName,
  selectedMeal,
  isSelected,
  availability,
  hasHaramEntree = false,
}: DiningHallSelectionRowProps) {
  const prefersReducedMotion = useReducedMotion();
  const isEmpty = availability === "empty";

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
        <Link
          href={{
            pathname: "/",
            query: { hall: hallName, meal: selectedMeal.toLowerCase() },
          }}
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
              : hallName
          }
        >
          {isSelected && (
            <m.span
              className={styles.marker}
              layoutId="selected-hall-marker"
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 440, damping: 40 }
              }
              aria-hidden="true"
            />
          )}
          <span className={styles.name}>{hallName}</span>
          {hasHaramEntree && (
            <ReligiousTagBadge
              tag="Haram"
              variant="text"
              title={`An entrée is flagged Haram for ${selectedMeal.toLowerCase()}.`}
            />
          )}
        </Link>
      )}
    </m.li>
  );
}
