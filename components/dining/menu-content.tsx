"use client";

import {
  AnimatePresence,
  LayoutGroup,
  m,
  useReducedMotion,
} from "framer-motion";

import { getMenuEnterTransition } from "@/lib/motion/menu";
import { MOTION_OFFSET } from "@/lib/motion/constants";
import { MenuCategory } from "./menu-category";
import { menuStyles as styles } from "./menu-styles";
import type { DiningHallMenuContentProps } from "./types";
import { useDietaryPreferences } from "@/hooks/use-dietary-preferences";
import { getVisibleMenuCategories } from "@/lib/dining/menu-filtering";

export function DiningHallMenuContent({
  hallName,
  periodName,
  categories,
}: DiningHallMenuContentProps) {
  const prefersReducedMotion = useReducedMotion();
  const settings = useDietaryPreferences();
  const visibleCategories = Object.entries(
    getVisibleMenuCategories(categories, settings),
  );
  const menuIdentity = `${hallName}-${periodName}`;

  return (
    <LayoutGroup id={menuIdentity}>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={menuIdentity}
          className={styles.content}
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          exit={
            prefersReducedMotion
              ? undefined
              : {
                  opacity: 0,
                  y: MOTION_OFFSET.menuExit,
                }
          }
          transition={getMenuEnterTransition(prefersReducedMotion)}
          aria-live="polite"
        >
          {visibleCategories.length === 0 && (
            <p className="text-sm text-muted" role="status">
              No meals match your current filters.
            </p>
          )}
          {visibleCategories.map(([categoryName, foods], categoryIndex) => (
            <MenuCategory
              key={categoryName}
              categoryName={categoryName}
              headingId={`${periodName}-${categoryIndex}-heading`}
              foods={foods}
              sourceFoods={categories[categoryName]}
            />
          ))}
        </m.div>
      </AnimatePresence>
    </LayoutGroup>
  );
}
