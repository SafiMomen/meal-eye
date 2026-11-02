"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { m, useReducedMotion } from "framer-motion";
import { selectionStyles } from "@/components/ui/selection-styles";
import { MEAL_SELECTION_SPRING } from "@/lib/motion/constants";
import { useFitness } from "@/hooks/use-fitness";
import { formatCalories } from "@/lib/fitness/calculations";
import { totalFoodLog } from "@/lib/fitness/food-log";
import type { FitnessToolsProps } from "./types";

export function FitnessTools({ diningQuery = {} }: FitnessToolsProps) {
  const { entries } = useFitness();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const totals = totalFoodLog(entries);

  return (
    <nav
      className="flex items-center gap-0.5"
      aria-label="Food log and settings"
    >
      <Link
        href={{ pathname: "/food-log", query: diningQuery }}
        aria-label="Open today’s food log"
        aria-current={pathname === "/food-log" ? "page" : undefined}
        className={clsx(
          selectionStyles.option,
          pathname === "/food-log"
            ? selectionStyles.selected
            : selectionStyles.idle,
        )}
      >
        {pathname === "/food-log" && (
          <m.span
            layoutId="selected-fitness-tool"
            className={selectionStyles.background}
            transition={reduceMotion ? { duration: 0 } : MEAL_SELECTION_SPRING}
          />
        )}
        <span>Food log{entries.length > 0 ? ` (${entries.length})` : ""}</span>
        <span
          className="text-[11px] tabular-nums text-accent"
          aria-live="polite"
        >
          {totals.unknownCalorieItems > 0 ? "≥ " : ""}
          {formatCalories(totals.calories)} kcal
        </span>
      </Link>
      <Link
        href={{ pathname: "/settings", query: diningQuery }}
        aria-label="Open fitness settings"
        title="Fitness settings"
        aria-current={pathname === "/settings" ? "page" : undefined}
        className={clsx(
          selectionStyles.option,
          pathname === "/settings"
            ? selectionStyles.selected
            : selectionStyles.idle,
        )}
      >
        {pathname === "/settings" && (
          <m.span
            layoutId="selected-fitness-tool"
            className={selectionStyles.background}
            transition={reduceMotion ? { duration: 0 } : MEAL_SELECTION_SPRING}
          />
        )}
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="m9 3-.5 2.1-1.8 1L4.6 5.5 2.5 9l1.6 1.5v3L2.5 15l2.1 3.5 2.1-.6
            1.8 1L9 21h6l.5-2.1 1.8-1 2.1.6 2.1-3.5-1.6-1.5v-3L21.5 9l-2.1-3.5
            -2.1.6-1.8-1L15 3H9Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        Settings
      </Link>
    </nav>
  );
}
