"use client";

import { useState } from "react";
import { useFitness } from "@/hooks/use-fitness";
import {
  ACTIVITY_LEVELS,
  estimateDailyCalories,
  formatCalories,
  INCHES_PER_FOOT,
  KILOGRAMS_PER_POUND,
} from "@/lib/fitness/calculations";
import {
  draftToProfile,
  profileToDraft,
  HEIGHT_FEET_BOUNDS,
  PROFILE_BOUNDS,
} from "@/lib/fitness/profile";
import { ProfileField } from "./profile-field";
import { fitnessStyles as styles } from "./styles";
import type { ActivityLevel, FormulaSex } from "@/types/fitness";

export function FitnessSettingsForm() {
  const { profile, saveProfile } = useFitness();
  const [draft, setDraft] = useState(() => profileToDraft(profile));
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const completeProfile = draftToProfile(draft);

  return (
    <form
      className="space-y-4"
      onChange={() => {
        setStatus("");
        setError("");
      }}
      onSubmit={(event) => {
        event.preventDefault();
        if (!completeProfile) {
          setError(
            "Enter valid adult measurements, age, sex, and activity level.",
          );
          return;
        }
        saveProfile(completeProfile);
        setError("");
        setStatus("Settings saved in this browser.");
      }}
    >
      <p className={styles.caption}>
        Saved only in this browser. These settings estimate daily maintenance
        calories; they do not measure today’s activity.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <ProfileField label="Weight (lb)">
          <input
            className={styles.input}
            type="number"
            step="any"
            required
            min={PROFILE_BOUNDS.weightKg.minimum / KILOGRAMS_PER_POUND}
            max={PROFILE_BOUNDS.weightKg.maximum / KILOGRAMS_PER_POUND}
            value={draft.weightPounds}
            onChange={(event) =>
              setDraft({ ...draft, weightPounds: event.target.value })
            }
          />
        </ProfileField>
        <ProfileField label="Age (years)">
          <input
            className={styles.input}
            type="number"
            step="1"
            required
            min={PROFILE_BOUNDS.age.minimum}
            max={PROFILE_BOUNDS.age.maximum}
            value={draft.age}
            onChange={(event) =>
              setDraft({ ...draft, age: event.target.value })
            }
          />
        </ProfileField>
        <ProfileField label="Height (feet)">
          <input
            className={styles.input}
            type="number"
            step="1"
            required
            min={HEIGHT_FEET_BOUNDS.minimum}
            max={HEIGHT_FEET_BOUNDS.maximum}
            value={draft.heightFeet}
            onChange={(event) =>
              setDraft({ ...draft, heightFeet: event.target.value })
            }
          />
        </ProfileField>
        <ProfileField label="Height (inches)">
          <input
            className={styles.input}
            type="number"
            step="any"
            required
            min="0"
            max={INCHES_PER_FOOT - 0.01}
            value={draft.heightInches}
            onChange={(event) =>
              setDraft({ ...draft, heightInches: event.target.value })
            }
          />
        </ProfileField>
      </div>
      <ProfileField label="Sex">
        <select
          className={styles.input}
          required
          value={draft.formulaSex}
          onChange={(event) =>
            setDraft({
              ...draft,
              formulaSex: event.target.value as FormulaSex,
            })
          }
        >
          <option value="" disabled>
            Choose
          </option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
      </ProfileField>
      <ProfileField label="Usual activity level">
        <select
          className={styles.input}
          required
          value={draft.activityLevel}
          onChange={(event) =>
            setDraft({
              ...draft,
              activityLevel: event.target.value as ActivityLevel,
            })
          }
        >
          <option value="" disabled>
            Choose
          </option>
          {Object.entries(ACTIVITY_LEVELS).map(([value, option]) => (
            <option key={value} value={value}>
              {option.label}
            </option>
          ))}
        </select>
      </ProfileField>
      <dl className="border-y border-line py-3">
        <div>
          <dt className={styles.caption}>Estimated daily burn</dt>
          <dd className="text-xl font-semibold text-accent">
            {completeProfile
              ? `${formatCalories(estimateDailyCalories(completeProfile))} kcal`
              : "—"}
          </dd>
        </div>
      </dl>
      {error && (
        <p className="text-xs text-red-300" role="alert">
          {error}
        </p>
      )}
      {status && (
        <p className="text-xs text-accent" role="status">
          {status}
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        {profile ? (
          <button
            type="button"
            className={styles.mutedButton}
            onClick={() => {
              saveProfile(null);
              setDraft(profileToDraft(null));
              setError("");
              setStatus("Saved profile removed.");
            }}
          >
            Remove saved profile
          </button>
        ) : (
          <span />
        )}
        <button type="submit" className={styles.action}>
          Save settings
        </button>
      </div>
    </form>
  );
}
