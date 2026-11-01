"use client";

import { useDietaryPreferences } from "@/hooks/use-dietary-preferences";
import { DIETARY_RESTRICTIONS } from "@/lib/dietary/restriction-identifiers";
import { PreferenceCheckbox } from "./preference-checkbox";

export function RestrictionControls() {
  const { selectedRestrictions, setRestriction } = useDietaryPreferences();

  return (
    <fieldset className="mt-4 px-2.5">
      <legend className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        Dietary restrictions
      </legend>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
        {DIETARY_RESTRICTIONS.map((restriction) => (
          <PreferenceCheckbox
            key={restriction}
            label={
              restriction === "Crustacean Shellfish"
                ? "Crustacean"
                : restriction
            }
            checked={selectedRestrictions.includes(restriction)}
            onChange={(enabled) => setRestriction(restriction, enabled)}
          />
        ))}
      </div>
      <p className="mt-2 text-[10px] leading-4 text-muted">
        Flags menu matches. Unflagged foods are not guaranteed allergy-safe; ask
        dining staff about ingredients and cross-contact.
      </p>
    </fieldset>
  );
}
