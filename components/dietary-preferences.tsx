"use client";

import clsx from "clsx";

import { useDietaryPreferences } from "@/components/dietary-preferences-provider";

const options = [
  { preference: "muslim", label: "Muslim" },
  { preference: "jewish", label: "Jewish" },
] as const;

const styles = {
  fieldset: "mt-4 px-2.5",
  legend: "text-[11px] font-semibold uppercase tracking-[0.12em] text-muted",
  options: "mt-2 flex flex-wrap gap-x-4 gap-y-2",
  label: clsx(
    "flex items-center gap-2",
    "cursor-pointer text-xs text-foreground",
  ),
  checkbox: clsx(
    "size-3.5 shrink-0",
    "cursor-pointer accent-princeton",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
  ),
};

export function DietaryPreferences() {
  const { preferences, setPreference } = useDietaryPreferences();

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Dietary tags</legend>
      <div className={styles.options}>
        {options.map(({ preference, label }) => (
          <label key={preference} className={styles.label}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={preferences[preference]}
              onChange={(event) => setPreference(preference, event.target.checked)}
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
