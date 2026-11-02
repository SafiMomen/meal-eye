import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DEFAULT_DIETARY_SETTINGS,
  parseDietarySettings,
  serializeDietarySettings,
} from "../../lib/dietary/settings.ts";

test("saved false and empty selections survive without reverting to defaults", () => {
  const settings = {
    preferences: { muslim: false, jewish: false },
    selectedRestrictions: [],
    hideUnwantedMeals: false,
    calorieRange: { minimum: 0, maximum: null },
  };

  assert.deepEqual(
    parseDietarySettings(serializeDietarySettings(settings)),
    settings,
  );
});

test("all chosen settings round-trip, including filtering and calorie bounds", () => {
  const settings = {
    preferences: { muslim: false, jewish: true },
    selectedRestrictions: ["Milk", "Eggs", "Alcohol"],
    hideUnwantedMeals: true,
    calorieRange: { minimum: 150, maximum: 750 },
  };

  assert.deepEqual(
    parseDietarySettings(serializeDietarySettings(settings)),
    settings,
  );
});

test("settings do not expire when reopened on a later date", () => {
  const saved = JSON.stringify({
    version: 1,
    savedAt: "2020-01-01",
    preferences: { muslim: false, jewish: true },
    selectedRestrictions: ["Sesame"],
    calorieRange: { minimum: 100, maximum: null },
  });

  const restored = parseDietarySettings(saved);
  assert.equal(restored.preferences.muslim, false);
  assert.deepEqual(restored.selectedRestrictions, ["Sesame"]);
  assert.deepEqual(restored.calorieRange, { minimum: 100, maximum: null });
  assert.equal(
    "savedAt" in JSON.parse(serializeDietarySettings(restored)),
    false,
  );
});

test("malformed or unsupported saved data uses defaults without throwing", () => {
  for (const saved of [
    null,
    "",
    "invalid",
    "null",
    "[]",
    "false",
    '{"version":2}',
    '{"version":1,"preferences":null}',
  ]) {
    assert.deepEqual(parseDietarySettings(saved), DEFAULT_DIETARY_SETTINGS);
  }
});

test("invalid individual fields cannot erase valid unchecked preferences", () => {
  const restored = parseDietarySettings(
    JSON.stringify({
      version: 1,
      preferences: { muslim: false, jewish: "false" },
      selectedRestrictions: ["Milk", "Milk", "Unknown", null],
      hideUnwantedMeals: "true",
      calorieRange: { minimum: -1, maximum: 500 },
    }),
  );

  assert.deepEqual(restored.preferences, { muslim: false, jewish: true });
  assert.deepEqual(restored.selectedRestrictions, ["Milk"]);
  assert.equal(restored.hideUnwantedMeals, false);
  assert.deepEqual(restored.calorieRange, { minimum: 0, maximum: null });
});

test("inverted, missing, and nonnumeric calorie bounds are rejected", () => {
  const invalidRanges = [
    null,
    {},
    { minimum: 400, maximum: 200 },
    { minimum: "100", maximum: 500 },
    { minimum: 0, maximum: "500" },
    { minimum: 0, maximum: 3000 },
    { minimum: 3000, maximum: null },
  ];

  for (const calorieRange of invalidRanges) {
    const restored = parseDietarySettings(
      JSON.stringify({ version: 1, calorieRange }),
    );
    assert.deepEqual(restored.calorieRange, { minimum: 0, maximum: null });
  }
});

test("a zero-width range and no-upper-limit range are preserved exactly", () => {
  for (const calorieRange of [
    { minimum: 0, maximum: 0 },
    { minimum: 300, maximum: 300 },
    { minimum: 2000, maximum: null },
  ]) {
    const restored = parseDietarySettings(
      JSON.stringify({ version: 1, calorieRange }),
    );
    assert.deepEqual(restored.calorieRange, calorieRange);
  }
});
