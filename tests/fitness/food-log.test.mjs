import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addFoodPortion,
  getFoodLogId,
  isValidPortions,
  totalFoodLog,
  updateFoodPortions,
} from "../../lib/fitness/food-log.ts";

const food = {
  foodName: "Chicken",
  servingSize: "1 breast (150g)",
  caloriesPerPortion: 220,
  proteinPerPortion: 31.3,
  sourceLabel: "Yeh & Huo · Lunch",
};

test("two additions mean two published serving sizes and doubled nutrition", () => {
  const once = addFoodPortion([], food);
  const twice = addFoodPortion(once, food);
  assert.equal(twice.length, 1);
  assert.equal(twice[0].portions, 2);
  assert.equal(twice[0].servingSize, "1 breast (150g)");
  assert.equal(totalFoodLog(twice).calories, 440);
  assert.equal(totalFoodLog(twice).protein, 62.6);
  assert.equal(once[0].portions, 1);
});

test("slider portions multiply nutrition without rounding food values early", () => {
  const entries = addFoodPortion([], food);
  const updated = updateFoodPortions(entries, entries[0].id, 3);
  assert.equal(totalFoodLog(updated).calories, 660);
  assert.ok(Math.abs(totalFoodLog(updated).protein - 93.9) < 0.00001);
});

test("same names with different servings, menus, or nutrition do not merge", () => {
  let entries = addFoodPortion([], food);
  entries = addFoodPortion(entries, { ...food, servingSize: "2 breasts" });
  entries = addFoodPortion(entries, {
    ...food,
    sourceLabel: "Forbes · Dinner",
  });
  entries = addFoodPortion(entries, { ...food, caloriesPerPortion: 250 });
  assert.equal(entries.length, 4);
  assert.equal(new Set(entries.map((entry) => entry.id)).size, 4);
});

test("logged nutrition is a snapshot independent of later menu changes", () => {
  const source = { ...food };
  const entries = addFoodPortion([], source);
  source.caloriesPerPortion = 500;
  source.servingSize = "changed recipe";
  assert.equal(totalFoodLog(entries).calories, 220);
  assert.equal(entries[0].servingSize, food.servingSize);
});

test("unknown calories stay incomplete rather than implying zero intake", () => {
  const entries = addFoodPortion(addFoodPortion([], food), {
    ...food,
    foodName: "Unknown",
    caloriesPerPortion: null,
    proteinPerPortion: null,
  });
  const totals = totalFoodLog(entries);
  assert.equal(totals.calories, 220);
  assert.equal(totals.unknownCalorieItems, 1);
  assert.equal(totals.unknownProteinItems, 1);
});

test("portion validation protects totals from invalid and excessive input", () => {
  const entries = addFoodPortion([], food);
  for (const portions of [0, -1, Infinity, NaN, 16, 1.1, 0.25, 1.5]) {
    assert.equal(isValidPortions(portions), false);
    assert.deepEqual(
      updateFoodPortions(entries, getFoodLogId(food), portions),
      entries,
    );
  }
  assert.equal(isValidPortions(1), true);
  assert.equal(isValidPortions(15), true);
  const capped = updateFoodPortions(entries, entries[0].id, 15);
  assert.equal(addFoodPortion(capped, food)[0].portions, 15);
});
