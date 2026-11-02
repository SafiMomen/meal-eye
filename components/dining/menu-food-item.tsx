"use client";

import { m, useReducedMotion } from "framer-motion";

import { FoodNutritionCard } from "@/components/nutrition/food-nutrition-card";
import { getMenuEnterTransition } from "@/lib/motion/menu";
import {
  MENU_PRESS_SCALE,
  MENU_STAGGER,
  MENU_VIEWPORT,
  MOTION_DURATION,
  MOTION_OFFSET,
} from "@/lib/motion/constants";
import { menuStyles as styles } from "./menu-styles";
import type { MenuFoodItemProps } from "./types";

export function MenuFoodItem({ food, index, sourceLabel }: MenuFoodItemProps) {
  const prefersReducedMotion = useReducedMotion();
  const staggerIndex = index % MENU_STAGGER.groupSize;

  return (
    <m.div
      className={styles.foodItem}
      layout={prefersReducedMotion ? false : "position"}
      initial={
        prefersReducedMotion
          ? false
          : {
              opacity: 0,
              y: MOTION_OFFSET.foodEnter,
            }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: MENU_VIEWPORT.food }}
      whileTap={prefersReducedMotion ? undefined : { scale: MENU_PRESS_SCALE }}
      transition={{
        ...getMenuEnterTransition(prefersReducedMotion),
        opacity: {
          duration: prefersReducedMotion ? 0 : MOTION_DURATION.foodOpacity,
          delay: prefersReducedMotion
            ? 0
            : staggerIndex * MENU_STAGGER.interval,
        },
        layout: {
          duration: prefersReducedMotion ? 0 : MOTION_DURATION.menuLayout,
        },
      }}
    >
      <FoodNutritionCard {...food} sourceLabel={sourceLabel} />
    </m.div>
  );
}
