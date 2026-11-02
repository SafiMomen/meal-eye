"use client";

import { m, useReducedMotion } from "framer-motion";
import { useFitness } from "@/hooks/use-fitness";
import { formatCalories } from "@/lib/fitness/calculations";
import {
  isValidPortions,
  MAXIMUM_PORTIONS,
  MINIMUM_PORTIONS,
  PORTION_STEP,
} from "@/lib/fitness/food-log";
import { FITNESS_SPRING, FOOD_LOG_MOTION } from "@/lib/motion/constants";
import { fitnessStyles as styles } from "./styles";
import type { FoodLogRowProps } from "./types";

export function FoodLogRow({ entry, index }: FoodLogRowProps) {
  const { setPortions, removeFood } = useFitness();
  const reduceMotion = useReducedMotion();
  const calories = entry.caloriesPerPortion;
  const legacyPortions = !isValidPortions(entry.portions);

  return (
    <m.li
      className="rounded-sm border border-line bg-black/10 p-3"
      layout={!reduceMotion}
      initial={
        reduceMotion
          ? false
          : { opacity: 0, x: FOOD_LOG_MOTION.rowOffset, scale: 0.96 }
      }
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: reduceMotion ? 0 : -FOOD_LOG_MOTION.rowOffset }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              ...FITNESS_SPRING,
              delay: Math.min(
                index * FOOD_LOG_MOTION.stagger,
                FOOD_LOG_MOTION.maximumStagger,
              ),
            }
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{entry.foodName}</p>
          <p className="mt-0.5 text-[10px] text-muted">{entry.sourceLabel}</p>
          <p className="mt-1 text-[11px] leading-4 text-muted">
            One portion: {entry.servingSize ?? "serving size not listed"}
          </p>
        </div>
        <button
          type="button"
          aria-label={`Remove ${entry.foodName} from today’s log`}
          className={styles.removeButton}
          onClick={() => removeFood(entry.id)}
        >
          <svg
            viewBox="0 0 20 20"
            className="size-3.5"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="m5 5 10 10M15 5 5 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <label className="mt-3 flex flex-col gap-2">
        <span className="flex items-center justify-between gap-3 text-[11px]">
          <span className="font-medium text-foreground">
            {entry.portions} {entry.portions === 1 ? "portion" : "portions"}
          </span>
          <span className="tabular-nums text-muted">
            {calories === null
              ? "Calories unknown"
              : `${formatCalories(calories * entry.portions)} kcal`}
            {entry.proteinPerPortion !== null && (
              <>
                {" "}
                ·{" "}
                {Number(
                  (entry.proteinPerPortion * entry.portions).toFixed(1),
                )}{" "}
                g protein
              </>
            )}
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span className="text-[10px] tabular-nums text-muted">
            {MINIMUM_PORTIONS}
          </span>
          <input
            type="range"
            min={MINIMUM_PORTIONS}
            max={MAXIMUM_PORTIONS}
            step={PORTION_STEP}
            aria-label={`Portions of ${entry.foodName}`}
            aria-valuetext={`${entry.portions} portions`}
            className={styles.portionSlider}
            value={Math.min(
              MAXIMUM_PORTIONS,
              Math.max(MINIMUM_PORTIONS, entry.portions),
            )}
            onChange={(event) =>
              setPortions(entry.id, Number(event.target.value))
            }
          />
          <span className="text-[10px] tabular-nums text-muted">
            {MAXIMUM_PORTIONS}
          </span>
        </span>
      </label>
      {legacyPortions && (
        <p className="mt-2 text-[10px] text-muted">
          Saved quantity preserved. Slider adjustments use 1–15 portions.
        </p>
      )}
    </m.li>
  );
}
