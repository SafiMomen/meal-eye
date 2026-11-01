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

export function DiningHallMenuContent({
  hallName,
  periodName,
  categories,
}: DiningHallMenuContentProps) {
  const prefersReducedMotion = useReducedMotion();
  const visibleCategories = Object.entries(categories).filter(
    ([, foods]) => foods.length > 0,
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
          {visibleCategories.map(([categoryName, foods], categoryIndex) => (
            <MenuCategory
              key={categoryName}
              categoryName={categoryName}
              headingId={`${periodName}-${categoryIndex}-heading`}
              foods={foods}
            />
          ))}
        </m.div>
      </AnimatePresence>
    </LayoutGroup>
  );
}
