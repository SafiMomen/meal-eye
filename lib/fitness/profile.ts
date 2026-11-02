import {
  ACTIVITY_LEVELS,
  CENTIMETERS_PER_INCH,
  INCHES_PER_FOOT,
  KILOGRAMS_PER_POUND,
} from "./calculations.ts";
import type {
  FitnessProfile,
  FitnessProfileDraft,
} from "../../types/fitness.ts";

export const PROFILE_BOUNDS = {
  weightKg: { minimum: 20, maximum: 500 },
  heightCm: { minimum: 100, maximum: 250 },
  age: { minimum: 18, maximum: 100 },
} as const;

export const HEIGHT_FEET_BOUNDS = {
  minimum: Math.floor(
    PROFILE_BOUNDS.heightCm.minimum / CENTIMETERS_PER_INCH / INCHES_PER_FOOT,
  ),
  maximum: Math.floor(
    PROFILE_BOUNDS.heightCm.maximum / CENTIMETERS_PER_INCH / INCHES_PER_FOOT,
  ),
};

export function isValidFitnessProfile(value: unknown): value is FitnessProfile {
  if (typeof value !== "object" || value === null) return false;
  const profile = value as FitnessProfile;
  for (const field of ["weightKg", "heightCm", "age"] as const) {
    const bounds = PROFILE_BOUNDS[field];
    if (
      !Number.isFinite(profile[field]) ||
      profile[field] < bounds.minimum ||
      profile[field] > bounds.maximum
    )
      return false;
  }
  return (
    Number.isInteger(profile.age) &&
    (profile.formulaSex === "male" || profile.formulaSex === "female") &&
    Object.hasOwn(ACTIVITY_LEVELS, profile.activityLevel)
  );
}

export function profileToDraft(
  profile: FitnessProfile | null,
): FitnessProfileDraft {
  if (!profile)
    return {
      weightPounds: "",
      heightFeet: "",
      heightInches: "",
      age: "",
      formulaSex: "",
      activityLevel: "",
    };
  const totalInches = Number(
    (profile.heightCm / CENTIMETERS_PER_INCH).toFixed(2),
  );
  return {
    weightPounds: String(
      Number((profile.weightKg / KILOGRAMS_PER_POUND).toFixed(2)),
    ),
    heightFeet: String(Math.floor(totalInches / INCHES_PER_FOOT)),
    heightInches: String(Number((totalInches % INCHES_PER_FOOT).toFixed(2))),
    age: String(profile.age),
    formulaSex: profile.formulaSex,
    activityLevel: profile.activityLevel,
  };
}

export function draftToProfile(
  draft: FitnessProfileDraft,
): FitnessProfile | null {
  const requiredFields = [
    draft.weightPounds,
    draft.heightFeet,
    draft.heightInches,
    draft.age,
  ];
  if (requiredFields.some((field) => !field.trim())) return null;

  const feet = Number(draft.heightFeet);
  const inches = Number(draft.heightInches);
  if (
    !Number.isInteger(feet) ||
    feet < 0 ||
    !Number.isFinite(inches) ||
    inches < 0 ||
    inches >= INCHES_PER_FOOT
  )
    return null;

  const profile = {
    weightKg: Number(draft.weightPounds) * KILOGRAMS_PER_POUND,
    heightCm: (feet * INCHES_PER_FOOT + inches) * CENTIMETERS_PER_INCH,
    age: Number(draft.age),
    formulaSex: draft.formulaSex,
    activityLevel: draft.activityLevel,
  };
  return isValidFitnessProfile(profile) ? profile : null;
}
