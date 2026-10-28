"use client";

import {
  AnimatePresence,
  LayoutGroup,
  m,
  useReducedMotion,
} from "framer-motion";
import clsx from "clsx";

import { FoodNutritionCard } from "@/components/food-nutrition-card";
import type { FoodElement } from "@/lib/dining-types";

type DiningHallMenuContentProps = {
  hallName: string;
  periodName: string;
  categories: Record<string, FoodElement[]>;
};

const styles = {
  content: clsx("space-y-6", "px-4 py-5 sm:px-6 sm:py-6"),
  category: "space-y-2.5",
  categoryHeader: clsx("flex items-center gap-3"),
  categoryHeading: clsx(
    "shrink-0",
    "text-[11px] font-bold uppercase tracking-[0.14em] text-accent",
  ),
  categoryRule: "h-px w-full bg-line",
  foodGrid: clsx(
    "grid items-start grid-cols-[repeat(auto-fill,minmax(min(100%,17.5rem),1fr))] gap-3",
  ),
  foodItem: "min-w-0",
};

export function DiningHallMenuContent({
  hallName,
  periodName,
  categories,
}: DiningHallMenuContentProps) {
  const prefersReducedMotion = useReducedMotion();
  const visibleCategories = Object.entries(categories).filter(
    ([, foods]) => foods.length > 0,
  );
  const enterTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <LayoutGroup id={`${hallName}-${periodName}`}>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={`${hallName}-${periodName}`}
          className={styles.content}
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
          transition={enterTransition}
          aria-live="polite"
        >
          {visibleCategories.map(([categoryName, foods], categoryIndex) => (
            <m.section
              key={categoryName}
              className={styles.category}
              layout={prefersReducedMotion ? false : "position"}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.08 }}
              transition={{
                ...enterTransition,
                layout: { duration: prefersReducedMotion ? 0 : 0.3 },
              }}
              aria-labelledby={`${periodName}-${categoryIndex}-heading`}
            >
              <div className={styles.categoryHeader}>
                <h3
                  id={`${periodName}-${categoryIndex}-heading`}
                  className={styles.categoryHeading}
                >
                  {categoryName}
                </h3>
                <span className={styles.categoryRule} aria-hidden="true" />
              </div>

              <div className={styles.foodGrid}>
                {foods.map((food, foodIndex) => (
                  <m.div
                    key={`${food.foodName}-${foodIndex}`}
                    className={styles.foodItem}
                    layout={prefersReducedMotion ? false : "position"}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.995 }}
                    transition={{
                      ...enterTransition,
                      opacity: {
                        duration: prefersReducedMotion ? 0 : 0.28,
                        delay: prefersReducedMotion ? 0 : (foodIndex % 3) * 0.045,
                      },
                      layout: { duration: prefersReducedMotion ? 0 : 0.3 },
                    }}
                  >
                    <FoodNutritionCard
                      foodName={food.foodName}
                      calories={food.calories}
                      proteinGrams={food.proteinGrams}
                      cholesterolMilligrams={food.cholesterolMilligrams}
                      totalFatGrams={food.totalFatGrams}
                      saturatedFatGrams={food.saturatedFatGrams}
                      transFatGrams={food.transFatGrams}
                      totalCarbohydratesGrams={food.totalCarbohydratesGrams}
                      dietaryFiberGrams={food.dietaryFiberGrams}
                      sugarsGrams={food.sugarsGrams}
                      sodiumMilligrams={food.sodiumMilligrams}
                      religiousTags={food.religiousTags}
                      religiousTagReasons={food.religiousTagReasons}
                    />
                  </m.div>
                ))}
              </div>
            </m.section>
          ))}
        </m.div>
      </AnimatePresence>
    </LayoutGroup>
  );
}
