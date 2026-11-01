"use client";

import { useDietaryPreferences } from "@/hooks/use-dietary-preferences";
import { PreferenceCheckbox } from "./preference-checkbox";

const options = [
  { preference: "muslim", label: "Muslim" },
  { preference: "jewish", label: "Jewish" },
] as const;

const styles = {
  fieldset: "mt-4 px-2.5",
  legend: "text-[11px] font-semibold uppercase tracking-[0.12em] text-muted",
  options: "mt-2 flex flex-wrap gap-x-4 gap-y-2",
};

export function DietaryPreferences() {
  const { preferences, setPreference } = useDietaryPreferences();

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Dietary tags</legend>
      <div className={styles.options}>
        {options.map(({ preference, label }) => (
          <PreferenceCheckbox
            key={preference}
            label={label}
            checked={preferences[preference]}
            onChange={(enabled) => setPreference(preference, enabled)}
          />
        ))}
      </div>
    </fieldset>
  );
}
