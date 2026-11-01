"use client";

import { m, useReducedMotion } from "framer-motion";

import { getMenuEnterTransition } from "@/lib/motion/menu";
import {
  MENU_VIEWPORT,
  MOTION_DURATION,
  MOTION_OFFSET,
} from "@/lib/motion/constants";
import { MenuFoodItem } from "./menu-food-item";
import { menuStyles as styles } from "./menu-styles";
import type { MenuCategoryProps } from "./types";

export function MenuCategory({
  categoryName,
  headingId,
  foods,
}: MenuCategoryProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <m.section
      className={styles.category}
      layout={prefersReducedMotion ? false : "position"}
      initial={
        prefersReducedMotion
          ? false
          : {
              opacity: 0,
              y: MOTION_OFFSET.categoryEnter,
            }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: MENU_VIEWPORT.category }}
      transition={{
        ...getMenuEnterTransition(prefersReducedMotion),
        layout: {
          duration: prefersReducedMotion ? 0 : MOTION_DURATION.menuLayout,
        },
      }}
      aria-labelledby={headingId}
    >
      <div className={styles.categoryHeader}>
        <h3 id={headingId} className={styles.categoryHeading}>
          {categoryName}
        </h3>
        <span className={styles.categoryRule} aria-hidden="true" />
      </div>
      <div className={styles.foodGrid}>
        {foods.map((food, foodIndex) => (
          <MenuFoodItem
            key={`${food.foodName}-${foodIndex}`}
            food={food}
            index={foodIndex}
          />
        ))}
      </div>
    </m.section>
  );
}
