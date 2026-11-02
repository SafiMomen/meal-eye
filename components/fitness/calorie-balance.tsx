"use client";

import clsx from "clsx";
import { m, useReducedMotion } from "framer-motion";
import { useFitness } from "@/hooks/use-fitness";
import {
  calculateRemainingCalories,
  estimateDailyCalories,
  formatCalories,
} from "@/lib/fitness/calculations";
import { totalFoodLog } from "@/lib/fitness/food-log";
import { FITNESS_SPRING } from "@/lib/motion/constants";

export function CalorieBalance() {
  const { entries, profile } = useFitness();
  const reduceMotion = useReducedMotion();
  const totals = totalFoodLog(entries);
  const budget = profile ? estimateDailyCalories(profile) : null;
  const remaining = calculateRemainingCalories(budget, totals);
  const completeCalories = totals.unknownCalorieItems === 0;
  const balanceColor =
    remaining !== null && remaining < 0 ? "text-red-300" : "text-emerald-300";
  const balanceSign =
    remaining === null || remaining === 0 ? "" : remaining < 0 ? "+" : "−";
  const netCalories =
    remaining === null
      ? "—"
      : `${balanceSign}${formatCalories(Math.abs(remaining))}`;

  return (
    <m.footer
      className="space-y-3 border-t border-line pt-4"
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : FITNESS_SPRING}
    >
      <dl className="space-y-2 text-xs">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted">
            {totals.unknownProteinItems > 0 ? "Known protein" : "Protein"}
          </dt>
          <dd className="font-semibold tabular-nums text-accent">
            {Number(totals.protein.toFixed(1))}
            <span className="ml-1 font-normal text-muted">g</span>
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="pl-5 text-muted">
            {completeCalories ? "Consumed" : "Known consumed"}
          </dt>
          <dd className="text-lg font-semibold tabular-nums">
            {formatCalories(totals.calories)}
            <span className="ml-1 text-[10px] font-normal text-muted">
              kcal
            </span>
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="flex items-baseline text-muted">
            <span className="w-5 text-base text-foreground">−</span>
            Estimated burned
          </dt>
          <dd className="text-lg font-semibold tabular-nums">
            {budget === null ? "—" : formatCalories(budget)}
            <span className="ml-1 text-[10px] font-normal text-muted">
              kcal
            </span>
          </dd>
        </div>
        <div
          className={clsx(
            "flex items-baseline justify-between gap-4 pt-2",
            "border-t border-line",
          )}
        >
          <dt className="pl-5 text-muted">Net calories</dt>
          <dd
            className={clsx(
              "text-xl font-semibold tabular-nums",
              remaining === null ? "text-muted" : balanceColor,
            )}
          >
            {netCalories}
            <span className="ml-1 text-[10px] font-normal text-muted">
              kcal
            </span>
          </dd>
        </div>
      </dl>
      {!completeCalories && (
        <p className="text-[11px] text-muted">
          {totals.unknownCalorieItems} logged{" "}
          {totals.unknownCalorieItems === 1 ? "item is" : "items are"} missing
          calorie data. The total is incomplete.
        </p>
      )}
      {budget === null ? (
        <p className="text-xs leading-5 text-muted">
          Add your measurements in Fitness settings to see an estimated daily
          budget.
        </p>
      ) : (
        <>
          {completeCalories && remaining !== null ? (
            <p
              className={clsx(
                "text-sm font-semibold tabular-nums",
                balanceColor,
              )}
              role="status"
            >
              {remaining < 0
                ? `${formatCalories(-remaining)} kcal above today’s estimate`
                : `${formatCalories(remaining)} kcal remaining in today’s budget`}
            </p>
          ) : (
            <p className="text-xs text-muted">
              Balance unavailable until calorie data is complete.
            </p>
          )}
          <p className="text-[10px] leading-4 text-muted">
            A maintenance estimate for the whole day, not a measured calorie
            burn.
          </p>
        </>
      )}
    </m.footer>
  );
}
