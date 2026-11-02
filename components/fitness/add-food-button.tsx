"use client";

import { m, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { useFitness } from "@/hooks/use-fitness";
import { getFoodLogId } from "@/lib/fitness/food-log";
import type { AddFoodButtonProps } from "./types";
import { fitnessStyles } from "./styles";
import { MEAL_SELECTION_SPRING } from "@/lib/motion/constants";

export function AddFoodButton({ food }: AddFoodButtonProps) {
  const { entries, addFood, removeFood } = useFitness();
  const reduceMotion = useReducedMotion();
  const logged = entries.find((entry) => entry.id === getFoodLogId(food));

  return (
    <m.button
      type="button"
      className={clsx(
        "pointer-events-auto relative z-10",
        logged
          ? fitnessStyles.removeButton
          : "flex size-6 cursor-pointer items-center justify-center rounded-sm text-muted",
        !logged && "hover:bg-princeton/15 hover:text-accent",
        "focus-visible:outline-2 focus-visible:outline-accent",
      )}
      aria-label={
        logged
          ? `Remove ${food.foodName} from today’s food log`
          : `Add ${food.foodName} to today’s food log`
      }
      aria-pressed={Boolean(logged)}
      title={
        logged
          ? `Remove all ${logged.portions} logged portions`
          : "Add one portion to today’s log"
      }
      whileTap={reduceMotion ? undefined : { scale: 0.9 }}
      onClick={(event) => {
        event.stopPropagation();
        if (logged) removeFood(logged.id);
        else addFood(food);
      }}
    >
      <m.svg
        viewBox="0 0 20 20"
        className="size-3.5"
        fill="none"
        aria-hidden="true"
        initial={false}
        animate={{ rotate: logged ? 45 : 0 }}
        transition={reduceMotion ? { duration: 0 } : MEAL_SELECTION_SPRING}
      >
        <path
          d="M10 4v12M4 10h12"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </m.svg>
    </m.button>
  );
}
