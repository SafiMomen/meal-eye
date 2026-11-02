import { getFoodLogId } from "./food-log.ts";
import { isValidFitnessProfile } from "./profile.ts";
import type { FitnessData, FoodLogEntry } from "../../types/fitness.ts";

export const FITNESS_STORAGE_KEY = "meal-eye:fitness:v1";
export const DEFAULT_FITNESS_DATA: FitnessData = { profile: null, logs: {} };

// Keep quantities recorded before the slider's 1–15 range was introduced.
const SAVED_PORTION_LIMITS = { minimum: 0.25, maximum: 100, step: 0.25 };

function isSavedPortionCount(portions: number): boolean {
  return (
    Number.isFinite(portions) &&
    portions >= SAVED_PORTION_LIMITS.minimum &&
    portions <= SAVED_PORTION_LIMITS.maximum &&
    Number.isInteger(portions / SAVED_PORTION_LIMITS.step)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNutrient(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function readLogEntry(value: unknown): FoodLogEntry | null {
  if (
    !isRecord(value) ||
    typeof value.foodName !== "string" ||
    !value.foodName.trim() ||
    typeof value.sourceLabel !== "string" ||
    typeof value.portions !== "number" ||
    !isSavedPortionCount(value.portions)
  )
    return null;
  const food = {
    foodName: value.foodName,
    sourceLabel: value.sourceLabel,
    servingSize:
      typeof value.servingSize === "string" ? value.servingSize : null,
    caloriesPerPortion: readNutrient(value.caloriesPerPortion),
    proteinPerPortion: readNutrient(value.proteinPerPortion),
  };
  return { ...food, id: getFoodLogId(food), portions: value.portions };
}

export function parseFitnessData(serialized: string | null): FitnessData {
  if (!serialized) return DEFAULT_FITNESS_DATA;
  let saved: unknown;
  try {
    saved = JSON.parse(serialized);
  } catch {
    return DEFAULT_FITNESS_DATA;
  }
  if (!isRecord(saved) || saved.version !== 1) return DEFAULT_FITNESS_DATA;

  const logs: FitnessData["logs"] = {};
  if (isRecord(saved.logs)) {
    for (const [date, entries] of Object.entries(saved.logs)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Array.isArray(entries))
        continue;
      const parsedDate = new Date(`${date}T12:00:00Z`);
      if (
        !Number.isFinite(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== date
      )
        continue;
      logs[date] = entries.map(readLogEntry).filter((entry) => entry !== null);
    }
  }
  const profile = isValidFitnessProfile(saved.profile)
    ? {
        weightKg: saved.profile.weightKg,
        heightCm: saved.profile.heightCm,
        age: saved.profile.age,
        formulaSex: saved.profile.formulaSex,
        activityLevel: saved.profile.activityLevel,
      }
    : null;
  return { profile, logs };
}

export function serializeFitnessData(data: FitnessData): string {
  return JSON.stringify({ version: 1, ...data });
}
