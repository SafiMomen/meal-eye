import assert from "node:assert/strict";
import { test } from "node:test";
import { addFoodPortion } from "../../lib/fitness/food-log.ts";
import {
  DEFAULT_FITNESS_DATA,
  parseFitnessData,
  serializeFitnessData,
} from "../../lib/fitness/persistence.ts";

const food = {
  foodName: "Soup",
  sourceLabel: "Rocky & Mathey · Lunch",
  servingSize: "1 cup",
  caloriesPerPortion: 71,
  proteinPerPortion: 3.5,
};
const profile = {
  weightKg: 75,
  heightCm: 180,
  age: 30,
  formulaSex: "male",
  activityLevel: "light",
};

test("profile and separate days survive serialization without daily data loss", () => {
  const entries = addFoodPortion([], food);
  const data = {
    profile,
    logs: { "2026-11-01": entries, "2026-11-02": entries },
  };
  assert.deepEqual(parseFitnessData(serializeFitnessData(data)), data);
  const restored = parseFitnessData(serializeFitnessData(data));
  assert.deepEqual(restored.logs["2026-11-03"] ?? [], []);
  assert.equal(restored.logs["2026-11-01"].length, 1);
});

test("legacy profiles and portion counts survive the US-only slider update", () => {
  const entries = addFoodPortion([], food);
  entries[0].portions = 16;
  const restored = parseFitnessData(
    JSON.stringify({
      version: 1,
      profile: { ...profile, units: "metric" },
      logs: { "2026-11-02": entries },
    }),
  );
  assert.deepEqual(restored.profile, profile);
  assert.equal(restored.logs["2026-11-02"][0].portions, 16);
  entries[0].portions = 0.5;
  assert.equal(
    parseFitnessData(
      serializeFitnessData({ profile, logs: { "2026-11-02": entries } }),
    ).logs["2026-11-02"][0].portions,
    0.5,
  );
});

test("malformed storage does not crash the app", () => {
  for (const serialized of [
    null,
    "",
    "invalid",
    "[]",
    "null",
    '{"version":2}',
  ]) {
    assert.deepEqual(parseFitnessData(serialized), DEFAULT_FITNESS_DATA);
  }
});

test("invalid profiles do not erase valid food history", () => {
  const restored = parseFitnessData(
    JSON.stringify({
      version: 1,
      profile: { ...profile, weightKg: -20 },
      logs: { "2026-11-02": addFoodPortion([], food) },
    }),
  );
  assert.equal(restored.profile, null);
  assert.equal(restored.logs["2026-11-02"].length, 1);
});

test("invalid days and portions are ignored and invalid calorie data remains unknown", () => {
  const entry = { ...food, portions: 1, id: "untrusted" };
  const restored = parseFitnessData(
    JSON.stringify({
      version: 1,
      logs: {
        "2026-02-31": [entry],
        invalid: [entry],
        "2026-11-02": [
          entry,
          { ...entry, portions: -1 },
          { ...entry, foodName: "Unknown", caloriesPerPortion: "lots" },
        ],
      },
    }),
  );
  assert.deepEqual(Object.keys(restored.logs), ["2026-11-02"]);
  assert.equal(restored.logs["2026-11-02"].length, 2);
  assert.notEqual(restored.logs["2026-11-02"][0].id, "untrusted");
  assert.equal(restored.logs["2026-11-02"][1].caloriesPerPortion, null);
});
