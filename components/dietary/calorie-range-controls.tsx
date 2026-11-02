"use client";

import { useId } from "react";
import clsx from "clsx";

import { useDietaryPreferences } from "@/hooks/use-dietary-preferences";
import {
  CALORIE_SLIDER_MAXIMUM,
  CALORIE_SLIDER_STEP,
  DEFAULT_CALORIE_RANGE,
  formatCalorieRange,
  isCalorieRangeActive,
} from "@/lib/dietary/calories";

const styles = {
  legend: "text-[11px] font-semibold uppercase tracking-[0.12em] text-muted",
  range: clsx(
    "h-4 w-full min-w-0",
    "cursor-pointer accent-princeton",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
  ),
  row: "grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-2",
  label: "text-[11px] text-muted",
};

export function CalorieRangeControls() {
  const { calorieRange, setCalorieRange } = useDietaryPreferences();
  const controlId = useId();
  const maximumValue = calorieRange.maximum ?? CALORIE_SLIDER_MAXIMUM;
  const rangeActive = isCalorieRangeActive(calorieRange);

  return (
    <fieldset className="mt-4">
      <legend className={styles.legend}>Calories per item</legend>
      <output className="mt-2 block text-xs text-foreground" aria-live="polite">
        {rangeActive ? formatCalorieRange(calorieRange) : "Any calories"}
      </output>
      <div className="mt-2 space-y-1">
        <div className={styles.row}>
          <label htmlFor={`${controlId}-minimum`} className={styles.label}>
            Min
          </label>
          <input
            id={`${controlId}-minimum`}
            type="range"
            className={styles.range}
            aria-label="Minimum calories"
            aria-valuetext={`${calorieRange.minimum} kcal`}
            min={0}
            max={CALORIE_SLIDER_MAXIMUM}
            step={CALORIE_SLIDER_STEP}
            value={calorieRange.minimum}
            onChange={(event) =>
              setCalorieRange({
                ...calorieRange,
                minimum: Math.min(Number(event.target.value), maximumValue),
              })
            }
          />
        </div>
        <div className={styles.row}>
          <label htmlFor={`${controlId}-maximum`} className={styles.label}>
            Max
          </label>
          <input
            id={`${controlId}-maximum`}
            type="range"
            className={styles.range}
            aria-label="Maximum calories"
            aria-valuetext={
              calorieRange.maximum === null
                ? "No limit"
                : `${calorieRange.maximum} kcal`
            }
            min={0}
            max={CALORIE_SLIDER_MAXIMUM}
            step={CALORIE_SLIDER_STEP}
            value={maximumValue}
            onChange={(event) => {
              const maximum = Math.max(
                Number(event.target.value),
                calorieRange.minimum,
              );
              setCalorieRange({
                ...calorieRange,
                maximum: maximum === CALORIE_SLIDER_MAXIMUM ? null : maximum,
              });
            }}
          />
        </div>
      </div>
      <div className="mt-1 flex items-start justify-between gap-3">
        <p className="text-[10px] leading-4 text-muted">
          Max at the far right means no limit. Missing calories are restricted
          when a range is set.
        </p>
        <button
          type="button"
          className={clsx(
            "shrink-0",
            "text-[10px] leading-4 text-accent",
            "cursor-pointer hover:underline disabled:cursor-default disabled:opacity-40",
            "focus-visible:outline-2 focus-visible:outline-accent",
          )}
          aria-label="Reset calorie range"
          disabled={!rangeActive}
          onClick={() => setCalorieRange(DEFAULT_CALORIE_RANGE)}
        >
          Reset
        </button>
      </div>
    </fieldset>
  );
}
